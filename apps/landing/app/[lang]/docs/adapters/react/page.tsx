import { CodeBlock } from "@/components/ui/code-highlight"

export default function DocsAdapterReactPage() {
    return (
        <div className="max-w-3xl px-6 py-10 lg:px-10 space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">React</h1>
                <p className="mt-3 text-muted-foreground text-base leading-relaxed">
                    <code className="bg-accent px-1 rounded text-xs font-mono">@better-translate/react</code> is
                    the React layer on top of the core package. It provides{" "}
                    <code className="bg-accent px-1 rounded text-xs font-mono">BetterTranslateProvider</code> and{" "}
                    <code className="bg-accent px-1 rounded text-xs font-mono">useTranslations()</code> for
                    client-side locale switching and context-based translation access.
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">When to use it</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Use the React adapter when your app has client components, you want to switch locale
                    in the browser, or you want React context instead of calling global helpers directly.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Setup</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Create a core translator first, then pass it to{" "}
                    <code className="bg-accent px-1 rounded text-xs font-mono">BetterTranslateProvider</code>.
                </p>
                <CodeBlock
                    code={`// i18n.ts
import { configureTranslations } from "better-translate"

export async function createTranslator() {
  return configureTranslations({
    availableLocales: ["en", "es"] as const,
    defaultLocale: "en",
    messages: { en, es },
  })
}`}
                    filename="i18n.ts"
                />
                <CodeBlock
                    code={`// main.tsx
import { BetterTranslateProvider } from "@better-translate/react"
import { createTranslator } from "./i18n"

const translator = await createTranslator()

root.render(
  <BetterTranslateProvider translator={translator}>
    <App />
  </BetterTranslateProvider>
)`}
                    filename="main.tsx"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">useTranslations()</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Inside the provider, <code className="bg-accent px-1 rounded text-xs font-mono">useTranslations()</code> gives
                    you everything you need:
                </p>
                <CodeBlock
                    code={`import { useTranslations } from "@better-translate/react"

function MyComponent() {
  const {
    t,
    locale,
    setLocale,
    loadLocale,
    messages,
    supportedLocales,
    defaultLocale,
    fallbackLocale,
    isLoadingLocale,
    loadingLocale,
    localeError,
    translator,
  } = useTranslations()

  return (
    <div>
      <p>{t("greeting", { params: { name: "World" } })}</p>
      <button onClick={() => setLocale("es")}>Switch to Spanish</button>
    </div>
  )
}`}
                    filename="MyComponent.tsx"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Locale switching</h2>
                <p className="text-muted-foreground leading-relaxed">
                    <code className="bg-accent px-1 rounded text-xs font-mono">setLocale()</code> changes
                    the active locale for that provider tree. If the locale is not cached, it loads it first.
                    If loading fails, the old locale stays active and{" "}
                    <code className="bg-accent px-1 rounded text-xs font-mono">localeError</code> is set.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                    <code className="bg-accent px-1 rounded text-xs font-mono">loadLocale()</code> warms
                    the cache without changing the active locale. Use it to preload the next locale before
                    the user switches, so the switch is instant.
                </p>
                <CodeBlock
                    code={`// warm the cache before the user switches
await loadLocale("fr")

// switch instantly since it's already cached
setLocale("fr")`}
                    filename="LocaleSwitcher.tsx"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Provider scope</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Each provider has its own active locale state. You can nest multiple providers to give
                    different parts of the UI independent locale states — useful for testing locale error
                    behavior in isolation.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key source files</h2>
                <div className="space-y-1 text-sm text-muted-foreground">
                    {[
                        "packages/react/src/provider.tsx",
                        "packages/react/src/use-translations.ts",
                        "packages/react/src/types.ts",
                        "apps/react-vite-example/src/i18n.ts",
                        "apps/react-vite-example/src/main.tsx",
                    ].map((f) => (
                        <p key={f}><code className="bg-accent px-1 rounded text-xs font-mono">{f}</code></p>
                    ))}
                </div>
            </section>
        </div>
    )
}
