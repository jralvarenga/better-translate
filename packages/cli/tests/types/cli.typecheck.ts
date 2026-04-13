import type {
  BetterTranslateCliConfig,
  BetterTranslateCliDirectModelConfig,
  BetterTranslateCliGatewayConfig,
  CliLanguageModel,
  MarkdownExtension,
} from "../../src/index.js";
import { createOllama } from "ollama-ai-provider-v2";

import { defineConfig } from "../../src/index.js";

import type {
  BetterTranslateCliConfig as ConfigBetterTranslateCliConfig,
  BetterTranslateCliDirectModelConfig as ConfigBetterTranslateCliDirectModelConfig,
  CliLanguageModel as ConfigCliLanguageModel,
  MarkdownExtension as ConfigMarkdownExtension,
} from "../../src/config.js";
import { defineConfig as defineConfigFromConfig } from "../../src/config.js";

void (undefined as unknown as ConfigBetterTranslateCliConfig);
void (undefined as unknown as ConfigBetterTranslateCliDirectModelConfig);
void (undefined as unknown as ConfigCliLanguageModel);
void (undefined as unknown as ConfigMarkdownExtension);
void defineConfigFromConfig;

const providerModel: CliLanguageModel = {
  specificationVersion: "v3",
  provider: "moonshotai",
  modelId: "kimi-k2-0905-preview",
  supportedUrls: {},
  async doGenerate() {
    return {} as never;
  },
  async doStream() {
    return {} as never;
  },
};

const gatewayConfig = defineConfig({
  gateway: {
    apiKey: process.env.BT_GATEWAY_KEY ?? "gateway-key",
  },
  locales: ["es", "fr"],
  markdown: {
    extensions: [".md", ".mdx"] as const,
    rootDir: "./content",
  },
  messages: {
    entry: "./messages/en.json",
  },
  model: "anthropic/claude-sonnet-4.5",
  sourceLocale: "en",
});

const providerConfig = defineConfig({
  locales: ["es"] as const,
  messages: {
    entry: "./messages/en.ts",
  },
  model: providerModel,
  sourceLocale: "en",
});

const ollamaModelId: string = "qwen3:4b";
const ollamaProvider = createOllama({
  baseURL: "http://127.0.0.1:11434/api",
});

const ollamaConfig = defineConfig({
  locales: ["es"] as const,
  messages: {
    entry: "./messages/en.json",
  },
  model: ollamaProvider(ollamaModelId),
  sourceLocale: "en",
});

const providerSpecVersion: "v3" = providerModel.specificationVersion;
const providerName: string = providerModel.provider;
const providerModelId: string = providerModel.modelId;
const markdownExtensions: readonly MarkdownExtension[] =
  gatewayConfig.markdown?.extensions ?? [];
const typedGatewayConfig: BetterTranslateCliGatewayConfig = gatewayConfig;
const typedProviderConfig: BetterTranslateCliDirectModelConfig = providerConfig;
const typedOllamaConfig: BetterTranslateCliDirectModelConfig = ollamaConfig;
const genericConfig: BetterTranslateCliConfig = providerConfig;
const typedProviderModel: CliLanguageModel = providerModel;

void providerSpecVersion;
void providerName;
void providerModelId;
void markdownExtensions;
void typedGatewayConfig;
void typedProviderConfig;
void typedOllamaConfig;
void genericConfig;
void typedProviderModel;

// @ts-expect-error gateway is required when model is a plain string
defineConfig({
  locales: ["es"],
  messages: {
    entry: "./messages/en.json",
  },
  model: "gpt-5.1",
  sourceLocale: "en",
});

// @ts-expect-error direct-model configs cannot also declare a gateway
defineConfig({
  gateway: {
    apiKey: "gateway-key",
  },
  locales: ["es"],
  messages: {
    entry: "./messages/en.json",
  },
  model: providerModel,
  sourceLocale: "en",
});

defineConfig({
  gateway: {
    apiKey: "gateway-key",
  },
  locales: ["es"],
  markdown: {
    // @ts-expect-error unsupported markdown extensions should fail
    extensions: [".txt"],
    rootDir: "./content",
  },
  messages: {
    entry: "./messages/en.json",
  },
  model: "gpt-5.1",
  sourceLocale: "en",
});

defineConfig({
  gateway: {
    apiKey: "gateway-key",
  },
  locales: ["es"],
  // @ts-expect-error messages.entry is required
  messages: {},
  model: "gpt-5.1",
  sourceLocale: "en",
});
