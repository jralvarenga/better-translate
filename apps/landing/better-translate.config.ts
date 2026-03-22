import { defineConfig, openai } from "@better-translate/cli/config";

export default defineConfig({
  sourceLocale: "en",
  locales: ["es", "ar", "ja"],
  model: "openai/gpt-5-nano",
  gateway: {
    apiKey: process.env.AI_GATEWAY_KEY!,
  },
  messages: {
    entry: "./lib/i18n/messages/en.ts",
  },
  markdown: {
    rootDir: "./docs/en",
  },
});
