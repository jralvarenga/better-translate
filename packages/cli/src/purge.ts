import { access, readFile, writeFile } from "node:fs/promises";

import type { TranslationMessages } from "@better-translate/core";
import ts from "typescript";

import {
  collectSourceFiles,
  createScriptKind,
  createWarning,
  getDynamicStringPrefix,
  getStaticStringValue,
  isTranslationCall,
} from "./codebase.js";
import { confirmPurgeKey as defaultConfirmPurgeKey } from "./confirm.js";
import { loadCliConfig } from "./config-loader.js";
import {
  deriveTargetMessagesPath,
  loadSourceMessages,
  serializeMessages,
} from "./messages.js";
import type {
  CliLogger,
  PurgeLocaleChange,
  PurgeLocaleFile,
  PurgeProjectOptions,
  PurgeProjectResult,
} from "./types.js";
import { flattenTranslationKeys, isRecord } from "./validation.js";

interface LoadedLocaleMessages extends PurgeLocaleFile {
  messages: TranslationMessages;
  originalMessages: TranslationMessages;
}

interface UnsafeKeyReference {
  key: string;
  sourcePaths: string[];
}

function createDefaultLogger(): CliLogger {
  return {
    error(message) {
      console.error(message);
    },
    info(message) {
      console.log(message);
    },
  };
}

function cloneMessages(messages: TranslationMessages): TranslationMessages {
  return JSON.parse(JSON.stringify(messages)) as TranslationMessages;
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return false;
    }

    throw error;
  }
}

function deleteMessageValue(
  messages: TranslationMessages,
  keyPath: string,
): boolean {
  const segments = keyPath.split(".");
  const walk = (
    current: Record<string, unknown>,
    index: number,
  ): {
    isEmpty: boolean;
    removed: boolean;
  } => {
    const segment = segments[index];

    if (!segment || !Object.prototype.hasOwnProperty.call(current, segment)) {
      return {
        isEmpty: Object.keys(current).length === 0,
        removed: false,
      };
    }

    if (index === segments.length - 1) {
      const value = current[segment];

      if (typeof value !== "string") {
        return {
          isEmpty: Object.keys(current).length === 0,
          removed: false,
        };
      }

      delete current[segment];
      return {
        isEmpty: Object.keys(current).length === 0,
        removed: true,
      };
    }

    const next = current[segment];

    if (!isRecord(next)) {
      return {
        isEmpty: Object.keys(current).length === 0,
        removed: false,
      };
    }

    const result = walk(next as Record<string, unknown>, index + 1);

    if (result.removed && result.isEmpty) {
      delete current[segment];
    }

    return {
      isEmpty: Object.keys(current).length === 0,
      removed: result.removed,
    };
  };

  return walk(messages as Record<string, unknown>, 0).removed;
}

function analyzeTranslationUsage(options: {
  localeKeys: ReadonlySet<string>;
  sourcePath: string;
  sourceText: string;
}): {
  hasDynamicUsage: boolean;
  protectedKeys: string[];
  usedKeys: string[];
  warnings: string[];
} {
  const sourceFile = ts.createSourceFile(
    options.sourcePath,
    options.sourceText,
    ts.ScriptTarget.Latest,
    true,
    createScriptKind(options.sourcePath),
  );
  const usedKeys = new Set<string>();
  const protectedPrefixes = new Set<string>();
  const warnings: string[] = [];
  const seenWarnings = new Set<string>();
  let hasDynamicUsage = false;

  const logWarning = (warning: string) => {
    if (seenWarnings.has(warning)) {
      return;
    }

    seenWarnings.add(warning);
    warnings.push(warning);
  };

  const visit = (node: ts.Node) => {
    if (!ts.isCallExpression(node) || !isTranslationCall(node)) {
      ts.forEachChild(node, visit);
      return;
    }

    const firstArgument = node.arguments[0];

    if (!firstArgument) {
      logWarning(
        createWarning(
          sourceFile,
          node,
          "skipped t() usage analysis because the first argument is missing.",
        ),
      );
      ts.forEachChild(node, visit);
      return;
    }

    const staticKey = getStaticStringValue(firstArgument);

    if (staticKey !== null) {
      usedKeys.add(staticKey);
      ts.forEachChild(node, visit);
      return;
    }

    const prefix = getDynamicStringPrefix(firstArgument);
    hasDynamicUsage = true;

    if (prefix) {
      protectedPrefixes.add(prefix);
      logWarning(
        createWarning(
          sourceFile,
          node,
          `dynamic t() key cannot be statically analyzed; protecting locale keys that start with "${prefix}".`,
        ),
      );
    } else {
      logWarning(
        createWarning(
          sourceFile,
          node,
          "dynamic t() key cannot be statically analyzed; review unused-key prompts carefully before removing anything referenced indirectly.",
        ),
      );
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  const protectedKeys = Array.from(options.localeKeys).filter((key) =>
    Array.from(protectedPrefixes).some((prefix) => key.startsWith(prefix)),
  );

  return {
    hasDynamicUsage,
    protectedKeys: protectedKeys.sort(),
    usedKeys: Array.from(usedKeys).sort(),
    warnings,
  };
}

function findUnsafeKeyReferences(options: {
  candidateKeys: readonly string[];
  fileContents: ReadonlyMap<string, string>;
}): UnsafeKeyReference[] {
  const candidateKeys = new Set(options.candidateKeys);
  const references: UnsafeKeyReference[] = [];

  for (const [sourcePath, sourceText] of options.fileContents) {
    const sourceFile = ts.createSourceFile(
      sourcePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      createScriptKind(sourcePath),
    );
    const matchedKeys = new Set<string>();

    const visit = (node: ts.Node) => {
      if (
        (ts.isStringLiteral(node) ||
          ts.isNoSubstitutionTemplateLiteral(node)) &&
        candidateKeys.has(node.text)
      ) {
        matchedKeys.add(node.text);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    for (const key of matchedKeys) {
      const existing = references.find((reference) => reference.key === key);

      if (existing) {
        existing.sourcePaths.push(sourcePath);
        continue;
      }

      references.push({
        key,
        sourcePaths: [sourcePath],
      });
    }
  }

  return references
    .map((reference) => ({
      key: reference.key,
      sourcePaths: reference.sourcePaths.sort(),
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

async function loadLocaleFiles(options: {
  sourceLocale: string;
  sourcePath: string;
  targetLocales: readonly string[];
}): Promise<{
  localeFiles: LoadedLocaleMessages[];
  warnings: string[];
}> {
  const warnings: string[] = [];
  const localeFiles: LoadedLocaleMessages[] = [];
  const localeEntries = [
    {
      locale: options.sourceLocale,
      targetPath: options.sourcePath,
    },
    ...options.targetLocales.map((locale) => ({
      locale,
      targetPath: deriveTargetMessagesPath(
        options.sourcePath,
        options.sourceLocale,
        locale,
      ),
    })),
  ];

  for (const entry of localeEntries) {
    if (!(await pathExists(entry.targetPath))) {
      if (entry.locale === options.sourceLocale) {
        throw new Error(
          `Configured source locale file "${entry.locale}" was not found at ${entry.targetPath}.`,
        );
      }

      warnings.push(
        `locale file for "${entry.locale}" was not found at ${entry.targetPath}; skipping it during purge.`,
      );
      continue;
    }

    const loaded = await loadSourceMessages(entry.targetPath, entry.locale);
    localeFiles.push({
      format: loaded.format,
      keyPaths: loaded.keyPaths,
      locale: entry.locale,
      messages: cloneMessages(loaded.messages),
      originalMessages: cloneMessages(loaded.messages),
      sourcePath: loaded.sourcePath,
    });
  }

  return {
    localeFiles,
    warnings,
  };
}

export async function purgeProject(
  options: PurgeProjectOptions = {},
): Promise<PurgeProjectResult> {
  const cwd = options.cwd ?? process.cwd();
  const logger = options.logger ?? createDefaultLogger();
  const dryRun = options.dryRun ?? false;
  const yes = options.yes ?? false;

  logger.info("Loading Better Translate config...");
  const loadedConfig = await loadCliConfig({
    configPath: options.configPath,
    cwd,
  });
  const { config } = loadedConfig;

  logger.info(`Using config: ${loadedConfig.path}`);
  logger.info(`Source locale: ${config.sourceLocale}`);
  logger.info(`Target locales: ${config.locales.join(", ")}`);
  logger.info("Scanning locale files...");

  const loadedLocales = await loadLocaleFiles({
    sourceLocale: config.sourceLocale,
    sourcePath: config.messages.entry,
    targetLocales: config.locales,
  });
  const localeFiles = loadedLocales.localeFiles;

  for (const warning of loadedLocales.warnings) {
    logger.info(`warn ${warning}`);
  }

  const localeKeyUnion = new Set<string>();

  for (const localeFile of localeFiles) {
    for (const key of flattenTranslationKeys(localeFile.messages)) {
      localeKeyUnion.add(key);
    }
  }

  logger.info(
    `Found ${localeKeyUnion.size} key${localeKeyUnion.size === 1 ? "" : "s"} across ${localeFiles.length} locale file${localeFiles.length === 1 ? "" : "s"}.`,
  );
  logger.info("Searching codebase for key usages...");

  const ignoredPaths = new Set(
    localeFiles.map((localeFile) => localeFile.sourcePath),
  );
  const sourcePaths = await collectSourceFiles(
    loadedConfig.directory,
    ignoredPaths,
  );
  const usedKeys = new Set<string>();
  const protectedKeys = new Set<string>();
  const warnings: string[] = [...loadedLocales.warnings];
  const sourceFileContents = new Map<string, string>();
  let hasDynamicUsage = false;

  for (const sourcePath of sourcePaths) {
    const sourceText = await readFile(sourcePath, "utf8");
    sourceFileContents.set(sourcePath, sourceText);
    const analysis = analyzeTranslationUsage({
      localeKeys: localeKeyUnion,
      sourcePath,
      sourceText,
    });

    for (const key of analysis.usedKeys) {
      usedKeys.add(key);
    }

    for (const key of analysis.protectedKeys) {
      protectedKeys.add(key);
    }

    hasDynamicUsage ||= analysis.hasDynamicUsage;
    warnings.push(...analysis.warnings);
  }

  for (const warning of warnings.slice(loadedLocales.warnings.length)) {
    logger.info(`warn ${warning}`);
  }

  const initiallyUnusedKeys = Array.from(localeKeyUnion)
    .filter((key) => !usedKeys.has(key) && !protectedKeys.has(key))
    .sort();
  const unsafeReferences = findUnsafeKeyReferences({
    candidateKeys: initiallyUnusedKeys,
    fileContents: sourceFileContents,
  });
  const unsafeKeys = unsafeReferences.map((reference) => reference.key);
  const unsafeKeySet = new Set(unsafeKeys);

  for (const reference of unsafeReferences) {
    const previewPaths = reference.sourcePaths.slice(0, 3);
    const remainingCount = reference.sourcePaths.length - previewPaths.length;
    const locationText =
      remainingCount > 0
        ? `${previewPaths.join(", ")}, and ${remainingCount} more`
        : previewPaths.join(", ");
    const warning = `key "${reference.key}" appears outside a static t(\"...\") call in ${locationText}; marking it as unsafe and skipping purge.`;

    warnings.push(warning);
    logger.info(`warn ${warning}`);
  }

  const unusedKeys = initiallyUnusedKeys.filter(
    (key) => !unsafeKeySet.has(key),
  );

  if (yes && hasDynamicUsage && unusedKeys.length > 0) {
    throw new Error(
      'Cannot run "bt purge --yes" when dynamic t() usages were found. Rerun without --yes and review each unused key interactively.',
    );
  }

  const purgedKeys: string[] = [];
  const keptKeys: string[] = [];
  const localeRemovedKeys = new Map<string, string[]>();
  const removedLocalesByKey = new Map<string, string[]>();

  if (unusedKeys.length === 0) {
    logger.info("No unused translation keys found.");
  }

  for (const key of unusedKeys) {
    const confirmed = yes
      ? true
      : await (options.confirmPurgeKey ?? defaultConfirmPurgeKey)({
          key,
        });

    if (!confirmed) {
      keptKeys.push(key);
      continue;
    }

    purgedKeys.push(key);

    for (const localeFile of localeFiles) {
      if (!deleteMessageValue(localeFile.messages, key)) {
        continue;
      }

      const localeKeys = localeRemovedKeys.get(localeFile.locale) ?? [];
      localeKeys.push(key);
      localeRemovedKeys.set(localeFile.locale, localeKeys);

      const removedLocales = removedLocalesByKey.get(key) ?? [];
      removedLocales.push(localeFile.locale);
      removedLocalesByKey.set(key, removedLocales);
    }
  }

  const localeChanges: PurgeLocaleChange[] = [];

  for (const localeFile of localeFiles) {
    const removedKeys = localeRemovedKeys.get(localeFile.locale) ?? [];

    if (removedKeys.length === 0) {
      continue;
    }

    const changed =
      JSON.stringify(localeFile.originalMessages) !==
      JSON.stringify(localeFile.messages);

    if (!changed) {
      continue;
    }

    const serialized = serializeMessages(
      localeFile.messages,
      localeFile.format,
      localeFile.locale,
    );

    if (dryRun) {
      logger.info(
        `[dry-run] updated locale ${localeFile.locale} ${localeFile.sourcePath} (-${removedKeys.length} key${removedKeys.length === 1 ? "" : "s"})`,
      );
    } else {
      await writeFile(localeFile.sourcePath, serialized, "utf8");
      logger.info(
        `updated locale ${localeFile.locale} ${localeFile.sourcePath} (-${removedKeys.length} key${removedKeys.length === 1 ? "" : "s"})`,
      );
    }

    localeChanges.push({
      locale: localeFile.locale,
      removedKeys: [...removedKeys].sort(),
      targetPath: localeFile.sourcePath,
    });
  }

  for (const key of purgedKeys) {
    const removedLocales = (removedLocalesByKey.get(key) ?? []).sort();
    const action = dryRun ? "Planned purge" : "Purged";
    logger.info(
      `${action} ${key} (${removedLocales.length === 0 ? "not present in any loaded locale file" : `removed from ${removedLocales.join(", ")}`})`,
    );
  }

  for (const key of keptKeys) {
    logger.info(`Kept ${key}`);
  }

  logger.info(
    `Done. ${purgedKeys.length} key${purgedKeys.length === 1 ? "" : "s"} ${dryRun ? "selected for purge" : "purged"}, ${keptKeys.length} kept, ${unsafeKeys.length} unsafe.`,
  );

  return {
    dryRun,
    keptKeys,
    loadedConfig,
    localeChanges,
    localeFiles: localeFiles.map((localeFile) => ({
      format: localeFile.format,
      keyPaths: localeFile.keyPaths,
      locale: localeFile.locale,
      sourcePath: localeFile.sourcePath,
    })),
    protectedKeys: Array.from(protectedKeys).sort(),
    purgedKeys,
    unsafeKeys,
    unusedKeys,
    warnings,
  };
}
