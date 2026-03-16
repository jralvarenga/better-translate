import { CodeBlock } from '@/components/ui/code-highlight'

const code = `// Step 1 — configure once
const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  messages: { en, es },
});

// Step 2 — create helpers (sync, typed)
const { t } = createTranslationHelpers(translator);

t("home.title")              // → "Welcome"
t("home.greeting", { name }) // → "Hello, world"
t("home.title", { config: { locale: "es" } }) // → "Bienvenido"`

export function CodeDemo() {
    return (
        <section id="docs" className="bg-background py-20 md:py-32">
            <div className="mx-auto max-w-4xl px-6">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Simple two-step API</h2>
                    <p className="mt-4 text-muted-foreground">Configure once, create typed helpers everywhere.</p>
                </div>
                <div className="rounded-2xl border border-white/10 p-px">
                    <CodeBlock filename="translate.ts" code={code} />
                </div>
            </div>
        </section>
    )
}
