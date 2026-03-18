import Link from "next/link"
import { RiArrowLeftLine, RiGithubLine } from "@remixicon/react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { HeaderLanguageSwitcher } from "@/components/header-language-switcher"
import { getLandingLanguages, type LandingLocale } from "@/lib/i18n/config"
import { I18nLink } from "@/lib/i18n/navigation"
import { siteLinks } from "@/lib/site"

interface DocsHeaderProps {
    currentLocale: LandingLocale
    homeLabel: string
    githubLabel: string
}

export function DocsHeader({ currentLocale, homeLabel, githubLabel }: DocsHeaderProps) {
    const languages = getLandingLanguages()

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-2">
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-2xl border border-white/10 bg-background/70 px-5 backdrop-blur-lg h-10">
                <div className="flex items-center gap-3">
                    <I18nLink href="/docs" className="flex items-center">
                        <Logo onlyIcon />
                    </I18nLink>
                    <span className="h-3.5 w-px bg-white/15" />
                    <I18nLink href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <RiArrowLeftLine className="size-3" />
                        <span>{homeLabel}</span>
                    </I18nLink>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={siteLinks.github} target="_blank" rel="noopener noreferrer">
                            <RiGithubLine className="size-4" />
                            <span className="hidden sm:inline">{githubLabel}</span>
                        </Link>
                    </Button>
                    <HeaderLanguageSwitcher currentLocale={currentLocale} languages={languages} />
                </div>
            </div>
        </header>
    )
}
