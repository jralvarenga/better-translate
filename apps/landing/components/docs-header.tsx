import Link from "next/link"
import { RiArrowLeftLine, RiGithubLine } from "@remixicon/react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { HeaderLanguageSwitcher } from "@/components/header-language-switcher"
import type { LandingLocale } from "@/lib/i18n/config"
import { I18nLink } from "@/lib/i18n/navigation"
import { siteLinks } from "@/lib/site"

interface DocsHeaderProps {
    currentLocale: LandingLocale
}

export function DocsHeader({ currentLocale }: DocsHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border/60 bg-background/95 backdrop-blur-sm">
            <div className="flex h-full items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <I18nLink href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
                        <RiArrowLeftLine className="size-3.5" />
                        <span>Home</span>
                    </I18nLink>
                    <span className="text-border">|</span>
                    <I18nLink href="/docs" className="flex items-center">
                        <Logo />
                    </I18nLink>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={siteLinks.github} target="_blank" rel="noopener noreferrer">
                            <RiGithubLine className="size-4" />
                            <span className="hidden sm:inline">GitHub</span>
                        </Link>
                    </Button>
                    <HeaderLanguageSwitcher currentLocale={currentLocale} />
                </div>
            </div>
        </header>
    )
}
