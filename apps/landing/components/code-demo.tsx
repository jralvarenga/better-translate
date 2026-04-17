import { CodeBlock } from "@/components/ui/code-highlight";
import type { LandingTranslator } from "@/lib/i18n/config";

const code = `import { createOllama } from "ollama-ai-provider-v2";
import { defineConfig } from "@better-translate/cli/config";

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/api",
});

export default defineConfig({
  sourceLocale: "en",
  locales: ["es", "fr"],
  model: ollama("qwen3:4b"),
  messages: {
    entry: "./src/messages/en.json",
  },
});`;

interface CodeDemoProps {
  t: LandingTranslator["t"];
}

export function CodeDemo({ t }: CodeDemoProps) {
  return (
    <section id="docs" className="py-20 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {t("codeDemo.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("codeDemo.description")}
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 p-px">
          <CodeBlock filename="better-translate.config.ts" code={code} />
        </div>
      </div>
    </section>
  );
}
