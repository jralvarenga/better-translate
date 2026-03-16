'use client'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { RiMenuLine, RiCloseLine, RiGithubLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { siteLinks } from '@/lib/site'
import type { LandingLocale } from '@/lib/i18n/config'
import { I18nLink } from '@/lib/i18n/navigation'
import { HeaderLanguageSwitcher } from '@/components/header-language-switcher'

interface HeroHeaderProps {
    changelogLabel: string
    cliLabel: string
    currentLocale: LandingLocale
    docsLabel: string
    githubLabel: string
    switchLabel: string
    closeMenuLabel: string
    openMenuLabel: string
}

export const HeroHeader = ({
    changelogLabel,
    cliLabel,
    closeMenuLabel,
    currentLocale,
    docsLabel,
    githubLabel,
    openMenuLabel,
    switchLabel,
}: HeroHeaderProps) => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const menuItems = [
        { href: '/docs', label: docsLabel, localized: true },
        { href: siteLinks.npm, label: cliLabel, localized: false },
        { href: siteLinks.changelog, label: changelogLabel, localized: false },
    ] as const

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <I18nLink
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </I18nLink>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? closeMenuLabel : openMenuLabel}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <RiMenuLine className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <RiCloseLine className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item) => (
                                    <li key={item.label}>
                                        {item.localized ? (
                                            <I18nLink
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.label}</span>
                                            </I18nLink>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.label}</span>
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item) => (
                                        <li key={item.label}>
                                            {item.localized ? (
                                                <I18nLink
                                                    href={item.href}
                                                    onClick={() => setMenuState(false)}
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                    <span>{item.label}</span>
                                                </I18nLink>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setMenuState(false)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                    <span>{item.label}</span>
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col items-center space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm">
                                    <Link href={siteLinks.github} target="_blank" rel="noopener noreferrer">
                                        <RiGithubLine className="size-4" />
                                        <span>{githubLabel}</span>
                                    </Link>
                                </Button>
                                <HeaderLanguageSwitcher
                                    currentLocale={currentLocale}
                                    onSelect={() => setMenuState(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
