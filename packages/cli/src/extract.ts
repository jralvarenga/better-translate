import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { TranslationMessages } from "@better-translate/core";
import ts from "typescript";

import { loadCliConfig } from "./config-loader.js";
import { loadSourceMessages, serializeMessages } from "./messages.js";
import type {
  CliLogger,
  ExtractProjectOptions,
  ExtractProjectResult,
} from "./types.js";
import { assert, isRecord } from "./validation.js";

const DEFAULT_MAX_LENGTH = 40;
const SOURCE_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);
const NAMESPACE_ROOTS = new Set([
  "app",
  "components",
  "lib",
  "pages",
  "routes",
  "src",
]);

type BtMarkerState = "invalid" | "none" | "valid";

interface ExtractCandidate {
  callExpression: ts.CallExpression;
  fullKey: string;
  rewrittenOptionsText: string | null;
  sourceValue: string;
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

function slugifySegment(value: string): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .trim();
  const parts = normalized
    .split(/[^\p{L}\p{N}]+/u)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "message";
  }

  const [head, ...tail] = parts;
  return `${head!.toLowerCase()}${tail
    .map((part) => `${part[0]!.toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join("")}`;
}

function createLeafKey(value: string, maxLength: number): string {
  const slug = slugifySegment(value);

  if (slug.length <= maxLength) {
    return slug;
  }

  return slug.slice(0, maxLength);
}

function deriveNamespace(configDirectory: string, sourcePath: string): string {
  const relativePath = path.relative(configDirectory, sourcePath);
  const withoutExtension = relativePath.slice(
    0,
    relativePath.length - path.extname(relativePath).length,
  );
  const rawSegments = withoutExtension
    .split(path.sep)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const segments = [...rawSegments];

  while (
    segments.length > 1 &&
    NAMESPACE_ROOTS.has(segments[0]!.toLowerCase())
  ) {
    segments.shift();
  }

  return segments.map((segment) => slugifySegment(segment)).join(".");
}

function getMessageValue(
  messages: TranslationMessages,
  keyPath: string,
): string | undefined {
  let current: TranslationMessages | string | undefined = messages;

  for (const segment of keyPath.split(".")) {
    if (!isRecord(current) || !(segment in current)) {
      return undefined;
    }

    current = current[segment] as TranslationMessages | string | undefined;
  }

  return typeof current === "string" ? current : undefined;
}

function setMessageValue(
  messages: TranslationMessages,
  keyPath: string,
  value: string,
): void {
  const segments = keyPath.split(".");
  let current = messages as Record<string, unknown>;

  for (const segment of segments.slice(0, -1)) {
    const existing = current[segment];

    if (!isRecord(existing)) {
      current[segment] = {};
    }

    current = current[segment] as Record<string, unknown>;
  }

  current[segments[segments.length - 1]!] = value;
}

function createScriptKind(sourcePath: string): ts.ScriptKind {
  const extension = path.extname(sourcePath);

  switch (extension) {
    case ".js":
    case ".cjs":
    case ".mjs":
      return ts.ScriptKind.JS;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".tsx":
      return ts.ScriptKind.TSX;
    default:
      return ts.ScriptKind.TS;
  }
}

function getLiteralArgument(node: ts.Expression): string | null {
  if (ts.isStringLiteral(node)) {
    return node.text;
  }

  if (ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  return null;
}

function getObjectPropertyName(node: ts.PropertyName): string | null {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) {
    return node.text;
  }

  return null;
}

function getBtMarkerState(node: ts.Expression | undefined): BtMarkerState {
  if (!node) {
    return "none";
  }

  if (!ts.isObjectLiteralExpression(node)) {
    return "none";
  }

  let sawBt = false;

  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }

    const name = getObjectPropertyName(property.name);

    if (name !== "bt") {
      continue;
    }

    sawBt = true;

    if (property.initializer.kind !== ts.SyntaxKind.TrueKeyword) {
      return "invalid";
    }
  }

  return sawBt ? "valid" : "none";
}

function buildPreservedOptionsText(
  sourceFile: ts.SourceFile,
  node: ts.Expression | undefined,
): string | null {
  if (!node || !ts.isObjectLiteralExpression(node)) {
    return null;
  }

  const remainingProperties = node.properties.filter((property) => {
    if (!ts.isPropertyAssignment(property)) {
      return true;
    }

    const name = getObjectPropertyName(property.name);
    return name !== "bt";
  });

  if (remainingProperties.length === 0) {
    return null;
  }

  const printer = ts.createPrinter();
  const objectLiteral = ts.factory.updateObjectLiteralExpression(
    node,
    remainingProperties,
  );

  return printer.printNode(
    ts.EmitHint.Unspecified,
    objectLiteral,
    sourceFile,
  );
}

function createWarning(
  sourceFile: ts.SourceFile,
  node: ts.Node,
  message: string,
): string {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  return `${sourceFile.fileName}:${position.line + 1}: ${message}`;
}

function analyzeFile(options: {
  configDirectory: string;
  maxLength: number;
  messages: TranslationMessages;
  sourcePath: string;
  sourceText: string;
}): {
  addedKeys: string[];
  updatedSource: string | null;
  warnings: string[];
} {
  const { configDirectory, maxLength, messages, sourcePath, sourceText } =
    options;
  const sourceFile = ts.createSourceFile(
    sourcePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    createScriptKind(sourcePath),
  );
  const namespace = deriveNamespace(configDirectory, sourcePath);
  const literalCandidates: ExtractCandidate[] = [];
  const warnings: string[] = [];
  const seenWarnings = new Set<string>();

  const logWarning = (warning: string) => {
    if (seenWarnings.has(warning)) {
      return;
    }

    seenWarnings.add(warning);
    warnings.push(warning);
  };

  const visit = (node: ts.Node) => {
    if (!ts.isCallExpression(node)) {
      ts.forEachChild(node, visit);
      return;
    }

    const callee = node.expression;
    const isIdentifierCall = ts.isIdentifier(callee) && callee.text === "t";
    const isPropertyCall =
      ts.isPropertyAccessExpression(callee) && callee.name.text === "t";

    if (!isIdentifierCall && !isPropertyCall) {
      ts.forEachChild(node, visit);
      return;
    }

    const markerState = getBtMarkerState(node.arguments[1]);

    if (markerState === "none") {
      ts.forEachChild(node, visit);
      return;
    }

    if (markerState === "invalid") {
      logWarning(
        createWarning(
          sourceFile,
          node,
          "skipped marked t() call because the bt marker must be written as bt: true.",
        ),
      );
      ts.forEachChild(node, visit);
      return;
    }

    const firstArgument = node.arguments[0];

    if (!firstArgument) {
      logWarning(
        createWarning(
          sourceFile,
          node,
          "skipped marked t() call because the first argument is missing.",
        ),
      );
      ts.forEachChild(node, visit);
      return;
    }

    const literalValue = getLiteralArgument(firstArgument);

    if (literalValue === null) {
      logWarning(
        createWarning(
          sourceFile,
          node,
          "skipped marked t() call because the first argument is not a static string literal.",
        ),
      );
      ts.forEachChild(node, visit);
      return;
    }

    const leafKey = createLeafKey(literalValue, maxLength);
    const fullKey = namespace ? `${namespace}.${leafKey}` : leafKey;

    literalCandidates.push({
      callExpression: node,
      fullKey,
      rewrittenOptionsText: buildPreservedOptionsText(sourceFile, node.arguments[1]),
      sourceValue: literalValue,
    });

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  const duplicateStrings = new Set<string>();
  const duplicateCounts = new Map<string, number>();

  for (const candidate of literalCandidates) {
    duplicateCounts.set(
      candidate.sourceValue,
      (duplicateCounts.get(candidate.sourceValue) ?? 0) + 1,
    );
  }

  for (const [sourceValue, count] of duplicateCounts) {
    if (count > 1) {
      duplicateStrings.add(sourceValue);
      logWarning(
        `${sourcePath}: skipped ${count} marked t() calls for "${sourceValue}" because the same string appears more than once in the file.`,
      );
    }
  }

  const collisionMap = new Map<string, Set<string>>();

  for (const candidate of literalCandidates) {
    const values = collisionMap.get(candidate.fullKey) ?? new Set<string>();
    values.add(candidate.sourceValue);
    collisionMap.set(candidate.fullKey, values);
  }

  const collidedKeys = new Set<string>();

  for (const [key, values] of collisionMap) {
    if (values.size > 1) {
      collidedKeys.add(key);
      logWarning(
        `${sourcePath}: skipped marked t() calls for "${key}" because multiple strings would generate the same key.`,
      );
    }
  }

  const successfulCandidates: ExtractCandidate[] = [];
  const addedKeys: string[] = [];

  for (const candidate of literalCandidates) {
    if (duplicateStrings.has(candidate.sourceValue)) {
      continue;
    }

    if (collidedKeys.has(candidate.fullKey)) {
      continue;
    }

    const existingValue = getMessageValue(messages, candidate.fullKey);

    if (existingValue === undefined) {
      setMessageValue(messages, candidate.fullKey, candidate.sourceValue);
      addedKeys.push(candidate.fullKey);
      successfulCandidates.push(candidate);
      continue;
    }

    if (existingValue !== candidate.sourceValue) {
      logWarning(
        `${sourcePath}: skipped marked t() call for "${candidate.fullKey}" because the key already exists with a different value.`,
      );
      continue;
    }

    successfulCandidates.push(candidate);
  }

  if (successfulCandidates.length === 0) {
    return {
      addedKeys,
      updatedSource: null,
      warnings,
    };
  }

  const updatedSource = successfulCandidates
    .sort(
      (left, right) =>
        right.callExpression.getStart(sourceFile) -
        left.callExpression.getStart(sourceFile),
    )
    .reduce((currentText, candidate) => {
      const start = candidate.callExpression.getStart(sourceFile);
      const end = candidate.callExpression.getEnd();
      const expressionText =
        candidate.callExpression.expression.getText(sourceFile);
      const replacement = candidate.rewrittenOptionsText
        ? `${expressionText}(${JSON.stringify(candidate.fullKey)}, ${candidate.rewrittenOptionsText})`
        : `${expressionText}(${JSON.stringify(candidate.fullKey)})`;

      return `${currentText.slice(0, start)}${replacement}${currentText.slice(end)}`;
    }, sourceText);

  return {
    addedKeys,
    updatedSource: updatedSource === sourceText ? null : updatedSource,
    warnings,
  };
}

async function collectSourceFiles(
  directory: string,
  ignoredPaths: ReadonlySet<string>,
): Promise<string[]> {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (ignoredPaths.has(entryPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }

      files.push(...(await collectSourceFiles(entryPath, ignoredPaths)));
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

export async function extractProject(
  options: ExtractProjectOptions = {},
): Promise<ExtractProjectResult> {
  const logger = options.logger ?? createDefaultLogger();
  const dryRun = options.dryRun ?? false;
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;

  assert(
    Number.isInteger(maxLength) && maxLength > 0,
    "--max-length must be a positive integer.",
  );

  logger.info("Loading Better Translate config...");

  const loadedConfig = await loadCliConfig({
    configPath: options.configPath,
    cwd: options.cwd,
  });

  logger.info(`Using config: ${loadedConfig.path}`);
  logger.info(`Source locale: ${loadedConfig.config.sourceLocale}`);
  logger.info(
    `Scanning for marked t() calls with --max-length=${maxLength}...`,
  );

  const loadedSourceMessages = await loadSourceMessages(
    loadedConfig.config.messages.entry,
    loadedConfig.config.sourceLocale,
  );
  const messages = cloneMessages(loadedSourceMessages.messages);
  const ignoredPaths = new Set<string>([loadedConfig.config.messages.entry]);
  const sourcePaths = await collectSourceFiles(
    loadedConfig.directory,
    ignoredPaths,
  );
  const rewrittenPaths: string[] = [];
  const warnings: string[] = [];
  const updatedKeys: string[] = [];

  for (const sourcePath of sourcePaths) {
    const sourceText = await readFile(sourcePath, "utf8");
    const analysis = analyzeFile({
      configDirectory: loadedConfig.directory,
      maxLength,
      messages,
      sourcePath,
      sourceText,
    });

    warnings.push(...analysis.warnings);
    updatedKeys.push(...analysis.addedKeys);

    if (!analysis.updatedSource) {
      continue;
    }

    rewrittenPaths.push(sourcePath);

    if (dryRun) {
      logger.info(`[dry-run] rewrote ${sourcePath}`);
      continue;
    }

    await writeFile(sourcePath, analysis.updatedSource, "utf8");
    logger.info(`rewrote ${sourcePath}`);
  }

  const hasMessageChanges =
    updatedKeys.length > 0 ||
    JSON.stringify(messages) !== JSON.stringify(loadedSourceMessages.messages);

  if (hasMessageChanges) {
    const serialized = serializeMessages(
      messages,
      loadedSourceMessages.format,
      loadedConfig.config.sourceLocale,
    );

    if (dryRun) {
      logger.info(
        `[dry-run] updated messages ${loadedConfig.config.messages.entry}`,
      );
    } else {
      await writeFile(loadedConfig.config.messages.entry, serialized, "utf8");
      logger.info(`updated messages ${loadedConfig.config.messages.entry}`);
    }
  }

  for (const warning of warnings) {
    logger.info(`warn ${warning}`);
  }

  const fileLabel = rewrittenPaths.length === 1 ? "file" : "files";
  const keyLabel = updatedKeys.length === 1 ? "key" : "keys";
  logger.info(
    `processed ${rewrittenPaths.length} ${fileLabel} and synced ${updatedKeys.length} ${keyLabel}.`,
  );

  return {
    dryRun,
    filePaths: rewrittenPaths,
    loadedConfig,
    updatedMessages: updatedKeys,
    warnings,
  };
}
