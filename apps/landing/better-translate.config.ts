import { defineConfig } from "@better-translate/cli/config";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createMoonshotAI } from "@ai-sdk/moonshotai";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// const moonshotai = createMoonshotAI({
//   apiKey: process.env.MOONSHOTAI_API_KEY!,
// });

export default defineConfig({
  sourceLocale: "en",
  locales: ["es", "ar", "ja"],
  model: anthropic("claude-haiku-4-5"),
  messages: {
    entry: "./lib/i18n/messages/en.ts",
  },
  markdown: {
    rootDir: "./docs/en",
  },
});
