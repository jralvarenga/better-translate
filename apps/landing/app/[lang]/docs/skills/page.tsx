export default function DocsSkillsPage() {
    return (
        <div className="max-w-3xl px-6 py-10 lg:px-10 space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
                <p className="mt-3 text-muted-foreground text-base leading-relaxed">
                    The <code className="bg-accent px-1 rounded text-xs font-mono">skills/</code> folder in
                    the repository is a learning guide written in plain language. It explains how the library
                    works without requiring you to read the full source code first.
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Reading order</h2>
                <p className="text-muted-foreground leading-relaxed">
                    If you are new, read the skill files in this order:
                </p>
                <ol className="space-y-3 list-none">
                    {[
                        { file: "skills/core/README.md", desc: "The translation engine: typed keys, params, fallback, async loading, and global helpers." },
                        { file: "skills/react/README.md", desc: "The React adapter: BetterTranslateProvider and useTranslations()." },
                        { file: "skills/nextjs/README.md", desc: "The Next.js adapter: locale routing, server helpers, and navigation wrappers." },
                        { file: "skills/combined/README.md", desc: "How core, React, and Next.js work together in a real app." },
                        { file: "skills/examples/README.md", desc: "A map of the example apps — copy the one that matches your architecture." },
                        { file: "skills/workspace/README.md", desc: "How the monorepo is organized: packages vs apps, build scripts, and config files." },
                    ].map(({ file, desc }, i) => (
                        <li key={file} className="flex gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-foreground">
                                {i + 1}
                            </span>
                            <div>
                                <code className="text-xs font-mono text-foreground">{file}</code>
                                <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Simple mental model</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Better Translate has one main idea: <strong className="text-foreground">configure translations once, use typed helpers everywhere.</strong></p>
                    <p>The core package owns the translation logic.</p>
                    <p>The React package makes that logic easy to use in client components.</p>
                    <p>The Next.js package makes that logic easy to use with routing, server helpers, and locale-aware navigation.</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Which guide should I read?</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                    {[
                        { condition: "Only need translations in TypeScript or on a server", guide: "skills/core/README.md" },
                        { condition: "Building a React app", guide: "skills/react/README.md" },
                        { condition: "Building a Next.js App Router app", guide: "skills/nextjs/README.md" },
                        { condition: "App has both server and client parts", guide: "skills/combined/README.md" },
                        { condition: "Learn best by copying working projects", guide: "skills/examples/README.md" },
                    ].map(({ condition, guide }) => (
                        <div key={guide} className="flex gap-2">
                            <span className="text-foreground shrink-0">→</span>
                            <span>{condition}? Read <code className="bg-accent px-1 rounded text-xs font-mono">{guide}</code></span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key package files</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                    {[
                        "packages/better-translate",
                        "packages/react",
                        "packages/nextjs",
                        "apps/react-vite-example",
                        "apps/nextjs-example",
                        "apps/nextjs-nested-locale-example",
                        "apps/core-elysia-example",
                        "apps/landing",
                    ].map((path) => (
                        <p key={path}><code className="bg-accent px-1 rounded text-xs font-mono">{path}</code></p>
                    ))}
                </div>
            </section>
        </div>
    )
}
