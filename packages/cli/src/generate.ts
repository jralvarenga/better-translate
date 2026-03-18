import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { TranslationMessages } from "better-translate";

import { loadCliConfig } from "./config-loader.js";
import {
  applyMarkdownTranslation,
  deriveTargetMarkdownPath,
  listMarkdownSourceFiles,
  loadMarkdownDocument,
} from "./markdown.js";
import {
  deriveTargetMessagesPath,
  loadSourceMessages,
  serializeMessages,
} from "./messages.js";
import {
  createMarkdownPrompt,
  createMessagesPrompt,
} from "./prompts.js";
import type {
  CliLogger,
  CliWriteOperation,
  GenerateProjectOptions,
  GenerateProjectResult,
  ResolvedBetterTranslateCliConfig,
  StructuredGenerator,
} from "./types.js";
import {
  assert,
  assertExactMessageShape,
  isRecord,
} from "./validation.js";

function createConsoleLogger(): CliLogger {
  return {
    error(message) {
      console.error(message);
    },
    info(message) {
      console.log(message);
    },
  };
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function persistWrite(
  write: CliWriteOperation,
  options: {
    dryRun?: boolean;
    logger: CliLogger;
  },
): Promise<void> {
  if (options.dryRun) {
    options.logger.info(`[dry-run] ${write.kind}:${write.locale} ${write.targetPath}`);
    return;
  }

  await mkdir(path.dirname(write.targetPath), {
    recursive: true,
  });
  await writeFile(write.targetPath, write.content, "utf8");
  options.logger.info(`wrote ${write.kind}:${write.locale} ${write.targetPath}`);
}

function prepareGatewayEnvironment(apiKey: string): void {
  assert(
    typeof apiKey === "string" && apiKey.length > 0,
    "Missing AI Gateway key. Provide gateway.apiKey in better-translate.config.ts.",
  );

  process.env.AI_GATEWAY_API_KEY = apiKey;
}

async function createDefaultGenerator(model: unknown): Promise<StructuredGenerator> {
  const { generateWithAiSdk } = await import("./ai-sdk-generator.js");

  return async (request) => generateWithAiSdk(model, request);
}

async function resolveRuntimeModel(config: ResolvedBetterTranslateCliConfig): Promise<{
  description: string;
  model: unknown;
}> {
  if ("gateway" in config) {
    prepareGatewayEnvironment(config.gateway.apiKey);

    return {
      description: `Using AI Gateway model: ${config.model}`,
      model: config.model,
    };
  }

  const { createOpenAI } = await import("@ai-sdk/openai");
  const provider = createOpenAI({
    apiKey: config.model.apiKey,
  });

  return {
    description: `Using built-in OpenAI provider model: ${config.model.modelId}`,
    model: provider(config.model.modelId),
  };
}

function validateMarkdownTranslation(
  frontmatterStrings: TranslationMessages,
  value: unknown,
): {
  body: string;
  frontmatter: TranslationMessages;
} {
  assert(
    isRecord(value),
    "Generated markdown output must be an object with body and frontmatter.",
  );
  assert(
    typeof value.body === "string",
    "Generated markdown output must include a string body.",
  );
  assert(
    isRecord(value.frontmatter),
    "Generated markdown output must include a frontmatter object.",
  );

  assertExactMessageShape(frontmatterStrings, value.frontmatter);

  return {
    body: value.body,
    frontmatter: value.frontmatter as TranslationMessages,
  };
}

export async function generateProject(
  options: GenerateProjectOptions = {},
): Promise<GenerateProjectResult> {
  const cwd = options.cwd ?? process.cwd();
  const logger = options.logger ?? createConsoleLogger();

  logger.info("Loading Better Translate config...");
  const loadedConfig = await loadCliConfig({
    configPath: options.configPath,
    cwd,
  });
  const { config } = loadedConfig;

  logger.info(`Using config: ${loadedConfig.path}`);
  const resolvedModel = await resolveRuntimeModel(config);
  logger.info(resolvedModel.description);
  logger.info(`Source locale: ${config.sourceLocale}`);
  logger.info(`Target locales: ${config.locales.join(", ")}`);

  const generator =
    options.generator ??
    (await createDefaultGenerator(resolvedModel.model));
  const writes: CliWriteOperation[] = [];

  logger.info(`Loading source messages from ${config.messages.entry}...`);
  const sourceMessages = await loadSourceMessages(
    config.messages.entry,
    config.sourceLocale,
  );
  logger.info(
    `Loaded ${sourceMessages.keyPaths.length} translation key${sourceMessages.keyPaths.length === 1 ? "" : "s"}.`,
  );
  const markdownSources = config.markdown
    ? await listMarkdownSourceFiles(
        config.markdown.rootDir,
        config.markdown.extensions,
      )
    : [];

  if (config.markdown) {
    logger.info(
      `Found ${markdownSources.length} markdown file${markdownSources.length === 1 ? "" : "s"} in ${config.markdown.rootDir}.`,
    );
  } else {
    logger.info("Markdown generation disabled.");
  }

  for (const locale of config.locales) {
    logger.info(`Starting locale "${locale}"...`);

    const messagePrompt = createMessagesPrompt({
      keyPaths: sourceMessages.keyPaths,
      sourceLocale: config.sourceLocale,
      sourceMessages: sourceMessages.messages,
      sourceText: sourceMessages.sourceText,
      sourcePath: sourceMessages.sourcePath,
      targetLocale: locale,
    });
    logger.info(`Requesting message translation for "${locale}"...`);
    const translatedMessages = await generator<TranslationMessages>({
      kind: "messages",
      prompt: messagePrompt.prompt,
      schema: sourceMessages.schema,
      sourcePath: sourceMessages.sourcePath,
      system: messagePrompt.system,
      targetLocale: locale,
      validate(value) {
        assertExactMessageShape(sourceMessages.messages, value);
        return value as TranslationMessages;
      },
    }).catch((error) => {
      throw new Error(
        `Failed translating messages for locale "${locale}" from "${sourceMessages.sourcePath}": ${describeError(error)}`,
      );
    });

    const messageWrite: CliWriteOperation = {
      content: serializeMessages(translatedMessages, sourceMessages.format, locale),
      kind: "messages",
      locale,
      sourcePath: sourceMessages.sourcePath,
      targetPath: deriveTargetMessagesPath(
        sourceMessages.sourcePath,
        config.sourceLocale,
        locale,
      ),
    };
    writes.push(messageWrite);
    logger.info(`Prepared messages:${locale} -> ${messageWrite.targetPath}`);
    await persistWrite(messageWrite, {
      dryRun: options.dryRun,
      logger,
    });

    for (const sourcePath of markdownSources) {
      const document = await loadMarkdownDocument(
        config.markdown!.rootDir,
        sourcePath,
      );
      logger.info(
        `Requesting markdown translation for "${locale}": ${document.relativePath}`,
      );
      const markdownPrompt = createMarkdownPrompt({
        body: document.body,
        frontmatterStrings: document.frontmatterStrings,
        relativePath: document.relativePath,
        sourceLocale: config.sourceLocale,
        sourceText: document.sourceText,
        targetLocale: locale,
      });
      const translatedDocument = await generator<{
        body: string;
        frontmatter: TranslationMessages;
      }>({
        kind: "markdown",
        prompt: markdownPrompt.prompt,
        schema: document.schema,
        sourcePath: document.sourcePath,
        system: markdownPrompt.system,
        targetLocale: locale,
        validate(value) {
          return validateMarkdownTranslation(document.frontmatterStrings, value);
        },
      }).catch((error) => {
        throw new Error(
          `Failed translating markdown for locale "${locale}" from "${document.sourcePath}": ${describeError(error)}`,
        );
      });

      const markdownWrite: CliWriteOperation = {
        content: applyMarkdownTranslation(
          document.frontmatter,
          translatedDocument.frontmatter,
          translatedDocument.body,
        ),
        kind: "markdown",
        locale,
        sourcePath: document.sourcePath,
        targetPath: deriveTargetMarkdownPath(
          config.markdown!.rootDir,
          config.sourceLocale,
          locale,
          document.relativePath,
        ),
      };
      writes.push(markdownWrite);
      logger.info(`Prepared markdown:${locale} -> ${markdownWrite.targetPath}`);
      await persistWrite(markdownWrite, {
        dryRun: options.dryRun,
        logger,
      });
    }

    logger.info(`Finished locale "${locale}".`);
  }

  if (options.dryRun) {
    logger.info("Dry run enabled. No files were written.");
  }

  logger.info(
    `${options.dryRun ? "planned" : "generated"} ${writes.length} file${writes.length === 1 ? "" : "s"}.`,
  );

  return {
    dryRun: Boolean(options.dryRun),
    loadedConfig,
    writes,
  };
}
