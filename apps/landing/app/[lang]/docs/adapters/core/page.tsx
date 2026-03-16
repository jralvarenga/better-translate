import { CodeBlock } from "@/components/ui/code-highlight"

export default function DocsAdapterCorePage() {
    return (
        <div className="max-w-3xl px-6 py-10 lg:px-10 space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Core</h1>
                <p className="mt-3 text-muted-foreground text-base leading-relaxed">
                    <code className="bg-accent px-1 rounded text-xs font-mono">better-translate</code> is
                    the main library. It is framework-agnostic and works in plain TypeScript, Bun, Node.js,
                    APIs, and servers.
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">When to use it</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Use only the core package when you do not need React helpers or Next.js routing helpers.
                    This is the right choice for a server, API, script, or shared library.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Short form setup</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Pass a locale map directly. The first locale becomes the default and fallback.
                </p>
                <CodeBlock
                    code={`import { configureTranslations } from "better-translate"

const en = { greeting: "Hello, {name}!" }
const es = { greeting: "¡Hola, {name}!" }

const translator = await configureTranslations({ en, es })

const t = translator.getTranslator("en")
t("greeting", { params: { name: "World" } }) // "Hello, World!"`}
                    filename="i18n.ts"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Options form setup</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Define the locale contract up front. This supports async loaders and is the recommended
                    setup for production apps.
                </p>
                <CodeBlock
                    code={`import { configureTranslations } from "better-translate"

const translator = await configureTranslations({
  availableLocales: ["en", "es", "fr"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es },
  loaders: {
    fr: async () => ({
      greeting: "Bonjour, {name}!",
    }),
  },
})`}
                    filename="i18n.ts"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Global helpers</h2>
                <p className="text-muted-foreground leading-relaxed">
                    After configuring once, you can call these global helpers from anywhere:
                </p>
                <CodeBlock
                    code={`import { t, loadLocale, getSupportedLocales, getMessages } from "better-translate"

// translate with the active locale
t("greeting", { params: { name: "World" } })

// load a locale into cache without switching
await loadLocale("fr")

// get all supported locale codes
getSupportedLocales() // ["en", "es", "fr"]

// get a frozen snapshot of loaded messages
getMessages()`}
                    filename="anywhere.ts"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Fallback behavior</h2>
                <p className="text-muted-foreground leading-relaxed">
                    If the active locale does not have a key, Better Translate tries the fallback locale.
                    If the fallback also does not have the key, it returns the key string itself.
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                    <p>→ Missing locale value → fallback locale value</p>
                    <p>→ Missing fallback value → key string</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Async loaders</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Register locale loaders for languages you do not want to preload. Loaded locales are
                    cached after the first successful load.
                </p>
                <CodeBlock
                    code={`const translator = await configureTranslations({
  availableLocales: ["en", "fr"] as const,
  defaultLocale: "en",
  messages: { en },
  loaders: {
    fr: async () => import("./messages/fr").then((m) => m.default),
  },
})

// loads fr on demand and caches it
await translator.loadLocale("fr")`}
                    filename="i18n.ts"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">JSON schema generation</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Build a JSON Schema from your source locale to help editors validate sibling locale files.
                </p>
                <CodeBlock
                    code={`import { createTranslationJsonSchema } from "better-translate"

const schema = createTranslationJsonSchema(en)
// write schema to disk to enable editor validation`}
                    filename="scripts/schema.ts"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key source files</h2>
                <div className="space-y-1 text-sm text-muted-foreground">
                    {[
                        "packages/better-translate/src/core.ts",
                        "packages/better-translate/src/types.ts",
                        "packages/better-translate/src/normalize-config.ts",
                        "packages/better-translate/src/interpolate-message.ts",
                    ].map((f) => (
                        <p key={f}><code className="bg-accent px-1 rounded text-xs font-mono">{f}</code></p>
                    ))}
                </div>
            </section>
        </div>
    )
}
