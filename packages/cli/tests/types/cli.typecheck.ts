import type {
  BetterTranslateCliConfig,
  BetterTranslateCliGatewayConfig,
  BetterTranslateCliOpenAIConfig,
  MarkdownExtension,
  OpenAIProviderModelSpec,
} from "../../src/index.js";

import { defineConfig, openai } from "../../src/index.js";

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

const providerModel = openai("gpt-5.1", {
  apiKey: process.env.OPENAI_API_KEY ?? "test-openai-key",
});

const providerConfig = defineConfig({
  locales: ["es"] as const,
  messages: {
    entry: "./messages/en.ts",
  },
  model: providerModel,
  sourceLocale: "en",
});

const providerKind: "provider-model" = providerModel.kind;
const providerName: "openai" = providerModel.provider;
const providerModelId: string = providerModel.modelId;
const providerApiKey: string = providerModel.apiKey;
const markdownExtensions: readonly MarkdownExtension[] =
  gatewayConfig.markdown?.extensions ?? [];
const typedGatewayConfig: BetterTranslateCliGatewayConfig = gatewayConfig;
const typedProviderConfig: BetterTranslateCliOpenAIConfig = providerConfig;
const genericConfig: BetterTranslateCliConfig = providerConfig;
const typedProviderModel: OpenAIProviderModelSpec = providerModel;

void providerKind;
void providerName;
void providerModelId;
void providerApiKey;
void markdownExtensions;
void typedGatewayConfig;
void typedProviderConfig;
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

// @ts-expect-error provider-model configs cannot also declare a gateway
defineConfig({
  gateway: {
    apiKey: "gateway-key",
  },
  locales: ["es"],
  messages: {
    entry: "./messages/en.json",
  },
  model: openai("gpt-5.1", {
    apiKey: "openai-key",
  }),
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
