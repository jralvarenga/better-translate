import { defineConfig } from "@better-translate/cli/config";
import { createOllama } from "ollama-ai-provider-v2";

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/api",
});

export default defineConfig({
  sourceLocale: "en",
  locales: ["es", "ar", "ja"],
  model: ollama("kimi-k2.5"),
  messages: {
    entry: "./lib/i18n/messages/en.ts",
  },
  markdown: {
    rootDir: "./docs/en",
  },
});
