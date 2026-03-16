import { CodeBlock } from "@/components/ui/code-highlight"

export default function DocsInstallationPage() {
    return (
        <div className="max-w-3xl px-6 py-10 lg:px-10 space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Installation</h1>
                <p className="mt-3 text-muted-foreground text-base leading-relaxed">
                    Install the packages you need. Start with the core package and add adapters as needed.
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Core only</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Use this when you want translations in plain TypeScript, a server, an API, or a script.
                    No framework required.
                </p>
                <CodeBlock code={`bun add better-translate`} filename="terminal" />
                <CodeBlock code={`npm install better-translate`} filename="terminal (npm)" />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Core + React</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Use this for React apps that need client-side locale switching and context-based
                    translation access.
                </p>
                <CodeBlock code={`bun add better-translate @better-translate/react`} filename="terminal" />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Core + Next.js</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Use this for Next.js App Router apps with locale-prefixed routes, server component
                    helpers, and locale-aware navigation.
                </p>
                <CodeBlock
                    code={`bun add better-translate @better-translate/nextjs`}
                    filename="terminal"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Core + Next.js + React</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Use all three packages when your Next.js app needs both server-side translations
                    and client-side locale switching.
                </p>
                <CodeBlock
                    code={`bun add better-translate @better-translate/nextjs @better-translate/react`}
                    filename="terminal"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Requirements</h2>
                <ul className="space-y-1 text-sm text-muted-foreground list-none">
                    <li className="flex gap-2"><span className="text-foreground">–</span> Node.js 18+ or Bun 1.0+</li>
                    <li className="flex gap-2"><span className="text-foreground">–</span> TypeScript 5.x recommended</li>
                    <li className="flex gap-2"><span className="text-foreground">–</span> Next.js 14+ (App Router) for the Next.js adapter</li>
                    <li className="flex gap-2"><span className="text-foreground">–</span> React 18+ for the React adapter</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Next steps</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p>→ Once installed, set up your translation config. See <strong className="text-foreground">Adapters → Core</strong> for the options form.</p>
                    <p>→ For Next.js, you need five files: <code className="bg-accent px-1 rounded text-xs font-mono">routing.ts</code>, <code className="bg-accent px-1 rounded text-xs font-mono">request.ts</code>, <code className="bg-accent px-1 rounded text-xs font-mono">server.ts</code>, <code className="bg-accent px-1 rounded text-xs font-mono">navigation.ts</code>, and <code className="bg-accent px-1 rounded text-xs font-mono">proxy.ts</code>. See <strong className="text-foreground">Adapters → Next.js</strong>.</p>
                </div>
            </section>
        </div>
    )
}
