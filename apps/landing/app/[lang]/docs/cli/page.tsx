import { CodeBlock } from "@/components/ui/code-highlight"

export default function DocsCliPage() {
    return (
        <div className="max-w-3xl px-6 py-10 lg:px-10 space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">CLI</h1>
                <p className="mt-3 text-muted-foreground text-base leading-relaxed">
                    Better Translate ships workspace scripts for building, type-checking, and developing
                    packages and apps in the monorepo. If you are using this as a library in your own project,
                    these are the scripts you will use most.
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Workspace scripts</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Run these from the repo root using Bun and Turborepo.
                </p>
                <div className="space-y-3">
                    {[
                        { cmd: "bun run dev", desc: "Start all apps in development mode." },
                        { cmd: "bun run build", desc: "Build all packages and apps." },
                        { cmd: "bun run build:packages", desc: "Build only the library packages." },
                        { cmd: "bun run check-types", desc: "Run TypeScript type-checking across the whole workspace." },
                        { cmd: "bun run check-types:packages", desc: "Run type-checking on packages only." },
                    ].map(({ cmd, desc }) => (
                        <div key={cmd} className="rounded-lg border border-border/60 p-4">
                            <code className="text-xs font-mono text-foreground">{cmd}</code>
                            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">JSON schema generation</h2>
                <p className="text-muted-foreground leading-relaxed">
                    The core package exports <code className="bg-accent px-1 rounded text-xs font-mono">createTranslationJsonSchema</code> to
                    generate a JSON Schema from your source locale object. This helps editors validate
                    sibling locale files.
                </p>
                <CodeBlock
                    code={`import { createTranslationJsonSchema } from "better-translate"
import { en } from "./messages/en"
import { writeFileSync } from "fs"

const schema = createTranslationJsonSchema(en)
writeFileSync("./messages/schema.json", JSON.stringify(schema, null, 2))`}
                    filename="scripts/generate-schema.ts"
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">VS Code extension</h2>
                <p className="text-muted-foreground leading-relaxed">
                    The <code className="bg-accent px-1 rounded text-xs font-mono">@better-translate/vscode</code> extension
                    adds translation key navigation in VS Code. Install it from the extensions marketplace
                    or build it locally from <code className="bg-accent px-1 rounded text-xs font-mono">packages/vscode</code>.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Per-package scripts</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Each package has its own local scripts. From any package directory:
                </p>
                <CodeBlock
                    code={`# build the package
bun run build

# type-check the package
bun run check-types

# run tests (where available)
bun test`}
                    filename="terminal"
                />
            </section>
        </div>
    )
}
