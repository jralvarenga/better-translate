import { CodeBlock } from "@/components/ui/code-highlight"

export default function DocsIntroductionPage() {
    return (
        <div className="max-w-3xl px-6 py-10 lg:px-10 space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Introduction</h1>
                <p className="mt-3 text-muted-foreground text-base leading-relaxed">
                    Better Translate is a type-safe translation library for TypeScript apps. It gives you
                    typed translation keys, typed interpolation params, fallback locale support, async locale
                    loading, and framework adapters for React and Next.js.
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">What is Better Translate?</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Better Translate is built around one main idea: configure translations once and use typed
                    helpers everywhere. The core package is framework-agnostic — it works in plain TypeScript,
                    Bun, Node.js, APIs, and servers. Adapter packages then make it easy to use with React
                    context and Next.js App Router routing.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                    If your source messages have <code className="bg-accent px-1 rounded text-xs font-mono">account.balance.label</code>,
                    TypeScript will autocomplete that key and reject invalid ones. If a message takes a parameter
                    like <code className="bg-accent px-1 rounded text-xs font-mono">"Good morning {"{name}"}"</code>, then{" "}
                    <code className="bg-accent px-1 rounded text-xs font-mono">t(...)</code> will require you to pass{" "}
                    <code className="bg-accent px-1 rounded text-xs font-mono">params.name</code>.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Package map</h2>
                <div className="space-y-2">
                    {[
                        { pkg: "better-translate", desc: "Core translation engine. Framework-agnostic. Use this in any TypeScript project." },
                        { pkg: "@better-translate/react", desc: "React provider and useTranslations() hook for client-side locale switching." },
                        { pkg: "@better-translate/nextjs", desc: "Next.js App Router helpers: locale routing, server helpers, and navigation wrappers." },
                        { pkg: "@better-translate/tanstack-start", desc: "Scaffold package for TanStack Start. Early stage." },
                        { pkg: "@better-translate/vscode", desc: "VS Code extension for translation key navigation." },
                    ].map(({ pkg, desc }) => (
                        <div key={pkg} className="rounded-lg border border-border/60 p-4">
                            <code className="text-xs font-mono text-foreground">{pkg}</code>
                            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Quick start</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Install the core package and configure your translations. The first locale becomes the default and fallback.
                </p>
                <CodeBlock
                    code={`import { configureTranslations } from "better-translate"

const en = {
  greeting: "Hello, {name}!",
  nav: { home: "Home", about: "About" },
}

const es = {
  greeting: "¡Hola, {name}!",
  nav: { home: "Inicio", about: "Acerca de" },
}

const translator = await configureTranslations({ en, es })

const t = translator.getTranslator("en")
t("greeting", { params: { name: "World" } }) // "Hello, World!"
t("nav.home")                                 // "Home"`}
                    filename="i18n.ts"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Mental model</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Better Translate has three layers:
                </p>
                <ol className="space-y-2 text-sm text-muted-foreground list-none">
                    {[
                        { label: "Core", desc: "Translates. Owns message lookup, fallback logic, and async loading. Works everywhere." },
                        { label: "React", desc: "Connects locale to UI. Provides context and a useTranslations() hook for client components." },
                        { label: "Next.js", desc: "Connects locale to route. Adds locale routing, server helpers, and navigation wrappers for App Router." },
                    ].map(({ label, desc }, i) => (
                        <li key={label} className="flex gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-foreground">
                                {i + 1}
                            </span>
                            <span>
                                <strong className="text-foreground">{label}</strong>
                                {" — "}
                                {desc}
                            </span>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Which guide should I read?</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p>→ Only need translations in TypeScript or a server? Read <strong className="text-foreground">Adapters → Core</strong>.</p>
                    <p>→ Building a React app? Read <strong className="text-foreground">Adapters → React</strong>.</p>
                    <p>→ Using Next.js App Router? Read <strong className="text-foreground">Adapters → Next.js</strong>.</p>
                    <p>→ Need both server and client translations? Start with Next.js, then add the React adapter.</p>
                </div>
            </section>
        </div>
    )
}
