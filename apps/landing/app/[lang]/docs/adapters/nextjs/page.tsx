import { CodeBlock } from "@/components/ui/code-highlight"

export default function DocsAdapterNextjsPage() {
    return (
        <div className="max-w-3xl px-6 py-10 lg:px-10 space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Next.js</h1>
                <p className="mt-3 text-muted-foreground text-base leading-relaxed">
                    <code className="bg-accent px-1 rounded text-xs font-mono">@better-translate/nextjs</code> is
                    the Next.js App Router layer on top of the core package. It adds locale routing config,
                    proxy helpers, request-scoped server helpers, and locale-aware navigation wrappers.
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">When to use it</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Use the Next.js adapter when you are using Next.js App Router, you want locale-prefixed
                    routes, you want request helpers for server components, or you want locale-aware links
                    and router calls.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Five-file pattern</h2>
                <p className="text-muted-foreground leading-relaxed">
                    A standard Next.js setup needs five files inside your{" "}
                    <code className="bg-accent px-1 rounded text-xs font-mono">lib/i18n/</code> folder:
                </p>
                <div className="space-y-2 text-sm">
                    {[
                        { file: "routing.ts", desc: "Define locale routing rules and the route template." },
                        { file: "request.ts", desc: "Connect the core translator to the Next.js request lifecycle." },
                        { file: "server.ts", desc: "Export server helpers: getLocale(), getMessages(), getTranslations(), getTranslator()." },
                        { file: "navigation.ts", desc: "Export locale-aware navigation: I18nLink, getPathname(), useI18nPathname(), useI18nRouter()." },
                        { file: "proxy.ts", desc: "Own your middleware proxy — Better Translate composes with it rather than replacing it." },
                    ].map(({ file, desc }) => (
                        <div key={file} className="rounded-lg border border-border/60 p-3">
                            <code className="text-xs font-mono text-foreground">{file}</code>
                            <p className="mt-0.5 text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">routing.ts</h2>
                <CodeBlock
                    code={`import { defineRouting } from "@better-translate/nextjs"

export const routing = defineRouting({
  locales: ["en", "es"] as const,
  defaultLocale: "en",
  routeTemplate: "/[lang]", // scoped: "/app/[lang]"
})`}
                    filename="lib/i18n/routing.ts"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">request.ts</h2>
                <CodeBlock
                    code={`import { getRequestConfig } from "@better-translate/nextjs"
import { configureTranslations } from "better-translate"
import { routing } from "./routing"
import { en } from "./messages/en"
import { es } from "./messages/es"

export default getRequestConfig(async ({ locale }) => {
  const translator = await configureTranslations({ en, es })
  return { locale, translator }
})`}
                    filename="lib/i18n/request.ts"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">server.ts</h2>
                <CodeBlock
                    code={`import { createServerHelpers } from "@better-translate/nextjs"
import requestConfig from "./request"

export const {
  getLocale,
  getMessages,
  getTranslations,
  getTranslator,
} = createServerHelpers(requestConfig)`}
                    filename="lib/i18n/server.ts"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">navigation.ts</h2>
                <CodeBlock
                    code={`import { createNavigationFunctions } from "@better-translate/nextjs"
import { routing } from "./routing"

export const {
  I18nLink,
  getPathname,
  useI18nPathname,
  useI18nRouter,
} = createNavigationFunctions({ routing })`}
                    filename="lib/i18n/navigation.ts"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Using in server components</h2>
                <CodeBlock
                    code={`import { getTranslations } from "@/lib/i18n/server"

export default async function Page({ params }) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang })

  return <h1>{t("hero.title")}</h1>
}`}
                    filename="app/[lang]/page.tsx"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Root vs scoped routing</h2>
                <p className="text-muted-foreground leading-relaxed">
                    With <code className="bg-accent px-1 rounded text-xs font-mono">routeTemplate: "/[lang]"</code>,
                    the whole app lives under <code className="bg-accent px-1 rounded text-xs font-mono">/en</code>,{" "}
                    <code className="bg-accent px-1 rounded text-xs font-mono">/es</code>, etc.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                    With <code className="bg-accent px-1 rounded text-xs font-mono">routeTemplate: "/app/[lang]"</code>,
                    only that subtree is localized. Routes like <code className="bg-accent px-1 rounded text-xs font-mono">/</code> and{" "}
                    <code className="bg-accent px-1 rounded text-xs font-mono">/login</code> stay outside localization.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key source files</h2>
                <div className="space-y-1 text-sm text-muted-foreground">
                    {[
                        "packages/nextjs/src/shared.ts",
                        "packages/nextjs/src/server.ts",
                        "packages/nextjs/src/navigation.tsx",
                        "packages/nextjs/src/proxy.ts",
                        "apps/nextjs-example/lib/i18n/",
                        "apps/nextjs-nested-locale-example/lib/i18n/",
                    ].map((f) => (
                        <p key={f}><code className="bg-accent px-1 rounded text-xs font-mono">{f}</code></p>
                    ))}
                </div>
            </section>
        </div>
    )
}
