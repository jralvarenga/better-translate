import Link from "next/link"
import { RiExternalLinkLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { siteLinks } from "@/lib/site"

export default function DocsChangelogPage() {
    return (
        <div className="max-w-3xl px-6 py-10 lg:px-10 space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Changelog</h1>
                <p className="mt-3 text-muted-foreground text-base leading-relaxed">
                    Release notes and version history for Better Translate. All releases are published to
                    GitHub.
                </p>
            </div>

            <section className="space-y-4">
                <div className="rounded-lg border border-border/60 p-6 flex flex-col gap-4 items-start">
                    <p className="text-sm text-muted-foreground">
                        The full changelog is maintained on GitHub Releases. View all versions, breaking
                        changes, and migration guides there.
                    </p>
                    <Button asChild variant="outline" size="sm">
                        <Link href={siteLinks.changelog} target="_blank" rel="noopener noreferrer">
                            <span>View releases on GitHub</span>
                            <RiExternalLinkLine className="size-3.5" />
                        </Link>
                    </Button>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Versioning</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Better Translate follows semantic versioning. All packages in the monorepo are versioned
                    together.
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex gap-2"><span className="text-foreground shrink-0">–</span> Patch: bug fixes, no API changes</li>
                    <li className="flex gap-2"><span className="text-foreground shrink-0">–</span> Minor: new features, backwards compatible</li>
                    <li className="flex gap-2"><span className="text-foreground shrink-0">–</span> Major: breaking changes</li>
                </ul>
            </section>
        </div>
    )
}
