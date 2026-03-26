import { existsSync } from "node:fs";
import path from "node:path";

import type {
  CliLanguageModel,
  LoadedBetterTranslateCliConfig,
  ResolvedBetterTranslateCliConfig,
} from "./types.js";
import { loadEnvFilesFromDirectories } from "./env.js";
import { importModule } from "./module-loader.js";
import { assert, isRecord, normalizeMarkdownExtensions } from "./validation.js";

const DEFAULT_CONFIG_FILE = "better-translate.config.ts";

function resolveCliLanguageModel(model: unknown): CliLanguageModel {
  assert(
    isRecord(model),
    "Config requires model to be a non-empty string or an AI SDK language model instance.",
  );
  assert(
    model.specificationVersion === "v3",
    "Config requires model to be a non-empty string or an AI SDK language model instance.",
  );
  assert(
    typeof model.provider === "string" && model.provider.trim().length > 0,
    "AI SDK language model instances require a non-empty provider string.",
  );
  assert(
    typeof model.modelId === "string" && model.modelId.trim().length > 0,
    "AI SDK language model instances require a non-empty modelId string.",
  );
  assert(
    typeof model.doGenerate === "function",
    "AI SDK language model instances must provide a doGenerate function.",
  );
  assert(
    typeof model.doStream === "function",
    "AI SDK language model instances must provide a doStream function.",
  );

  return model as CliLanguageModel;
}

function resolveConfig(
  rawConfig: unknown,
  configDirectory: string,
): ResolvedBetterTranslateCliConfig {
  assert(
    isRecord(rawConfig),
    "better-translate.config.ts must export a config object.",
  );

  const sourceLocale = rawConfig.sourceLocale;
  assert(
    typeof sourceLocale === "string" && sourceLocale.trim().length > 0,
    "Config requires a non-empty sourceLocale string.",
  );

  const locales = rawConfig.locales;
  assert(Array.isArray(locales), "Config requires a locales array.");

  const normalizedLocales = locales.map((locale) => {
    assert(
      typeof locale === "string" && locale.trim().length > 0,
      "Config locales must be non-empty strings.",
    );

    return locale.trim();
  });

  assert(
    normalizedLocales.length > 0,
    "Config requires at least one target locale.",
  );
  assert(
    new Set(normalizedLocales).size === normalizedLocales.length,
    "Config locales must not contain duplicates.",
  );
  assert(
    !normalizedLocales.includes(sourceLocale),
    "Config locales must not include the sourceLocale.",
  );

  const messages = rawConfig.messages;
  assert(isRecord(messages), "Config requires a messages object.");
  assert(
    typeof messages.entry === "string" && messages.entry.trim().length > 0,
    "Config requires messages.entry.",
  );

  const markdown = rawConfig.markdown;
  const model = rawConfig.model;
  const gateway = rawConfig.gateway;

  const resolvedBase = {
    locales: normalizedLocales,
    markdown:
      markdown === undefined
        ? undefined
        : (() => {
            assert(
              isRecord(markdown),
              "markdown must be an object when provided.",
            );
            assert(
              typeof markdown.rootDir === "string" &&
                markdown.rootDir.trim().length > 0,
              "markdown.rootDir must be a non-empty string.",
            );

            return {
              extensions: normalizeMarkdownExtensions(markdown.extensions),
              rootDir: path.resolve(configDirectory, markdown.rootDir),
            };
          })(),
    messages: {
      entry: path.resolve(configDirectory, messages.entry),
    },
    sourceLocale,
  } as const;

  if (typeof model === "string") {
    assert(
      model.trim().length > 0,
      'Config requires a non-empty model string, for example "provider/model-id".',
    );
    assert(
      isRecord(gateway),
      "Config requires a gateway object when model is a string.",
    );
    assert(
      typeof gateway.apiKey === "string" && gateway.apiKey.trim().length > 0,
      "Config requires gateway.apiKey with the AI Gateway key string.",
    );

    return {
      ...resolvedBase,
      gateway: {
        apiKey: gateway.apiKey.trim(),
      },
      model: model.trim(),
    };
  }

  assert(
    gateway === undefined,
    "Config must not include gateway when model is an AI SDK language model instance.",
  );

  const resolvedModel = resolveCliLanguageModel(model);

  return {
    ...resolvedBase,
    model: resolvedModel,
  };
}

export async function loadCliConfig(
  options: {
    configPath?: string;
    cwd?: string;
  } = {},
): Promise<LoadedBetterTranslateCliConfig> {
  const cwd = options.cwd ?? process.cwd();
  const configPath = path.resolve(
    cwd,
    options.configPath ?? DEFAULT_CONFIG_FILE,
  );
  const configDirectory = path.dirname(configPath);

  loadEnvFilesFromDirectories(
    configDirectory === cwd ? [cwd] : [cwd, configDirectory],
  );

  assert(
    existsSync(configPath),
    `Could not find Better Translate config at "${configPath}".`,
  );

  const module = await importModule(configPath);
  const rawConfig = (module.default ?? module.config ?? module) as unknown;

  return {
    config: resolveConfig(rawConfig, configDirectory),
    directory: configDirectory,
    path: configPath,
  };
}
