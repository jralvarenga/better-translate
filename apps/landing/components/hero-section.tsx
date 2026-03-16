import Link from 'next/link'
import { RiArrowRightLine, RiBook2Line, RiGithubLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroHeader } from './header'
import { CodeBlock } from '@/components/ui/code-highlight'
import { getCatalogItems } from '@/lib/content/catalog'
import type { LandingLocale, LandingTranslator } from '@/lib/i18n/config'
import { siteLinks } from '@/lib/site'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

interface HeroSectionProps {
    locale: LandingLocale
    t: LandingTranslator['t']
}

export default function HeroSection({ locale, t }: HeroSectionProps) {
    const frameworks = getCatalogItems('framework')
    const docsHref = `/${locale}#docs`

    return (
        <>
            <HeroHeader
                changelogLabel={t('header.changelog')}
                cliLabel={t('header.cli')}
                closeMenuLabel={t('header.closeMenu')}
                currentLocale={locale}
                docsLabel={t('header.docs')}
                githubLabel={t('header.github')}
                openMenuLabel={t('header.openMenu')}
                switchLabel={t('header.language')}
            />
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring' as const,
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32">
                            <Image
                                src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                                alt="background"
                                className="hidden size-full dark:block"
                                width="3276"
                                height="4095"
                            />
                        </AnimatedGroup>

                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
                        />
                        {/* Sky blue glow behind hero content */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] [background:radial-gradient(ellipse_60%_40%_at_50%_55%,oklch(0.55_0.2_215_/_0.13)_0%,transparent_70%)]"
                        />

                        <div className="mx-auto max-w-7xl px-6">
                            {/* Badge — centered on all sizes */}
                            <div className="flex justify-center">
                                <AnimatedGroup variants={transitionVariants}>
                                    <div className="flex w-fit items-center gap-3 rounded-full border border-white/10 bg-[var(--brand)]/10 px-4 py-1.5 text-sm text-[var(--brand)]">
                                        <RiArrowRightLine className="size-3.5" />
                                        <span>{t('hero.badge')}</span>
                                    </div>
                                </AnimatedGroup>
                            </div>

                            {/* Two-column layout on md+ */}
                            <div className="mt-10 flex flex-col items-center gap-10 md:mt-14 md:flex-row md:items-start md:gap-12 lg:gap-16">

                                {/* Left: title + subtitle + CTAs */}
                                <div className="flex-1 text-center md:text-left">
                                    <TextEffect
                                        preset="fade-in-blur"
                                        speedSegment={0.3}
                                        as="h1"
                                        className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl">
                                        {t('hero.title')}
                                    </TextEffect>
                                    <TextEffect
                                        per="line"
                                        preset="fade-in-blur"
                                        speedSegment={0.3}
                                        delay={0.5}
                                        as="p"
                                        className="mt-5 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
                                        {t('hero.description')}
                                    </TextEffect>

                                    <AnimatedGroup
                                        variants={{
                                            container: {
                                                visible: {
                                                    transition: {
                                                        staggerChildren: 0.05,
                                                        delayChildren: 0.75,
                                                    },
                                                },
                                            },
                                            ...transitionVariants,
                                        }}
                                        className="mt-8 flex items-center justify-start ">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="text-sm text-zinc-950">
                                            <Link href={docsHref}>
                                                <RiBook2Line className="size-4" />
                                                <span className="text-nowrap">{t('hero.primaryCta')}</span>
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="ghost"
                                            className="rounded-xl px-5">
                                            <Link href={siteLinks.github} target="_blank" rel="noopener noreferrer">
                                                <RiGithubLine className="size-4" />
                                                <span className="text-nowrap">{t('hero.secondaryCta')}</span>
                                            </Link>
                                        </Button>
                                    </AnimatedGroup>
                                </div>

                                {/* Right: code snippet */}
                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="w-full md:flex-1">
                                    <div className="rounded-2xl border border-white/10 p-px">
                                    <CodeBlock
                                        filename="translate.ts"
                                        code={`export const landingTranslationsConfig = {
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es },
} as const;

const translator = await configureTranslations(landingTranslationsConfig);

const { t } = createTranslationHelpers(translator);

t("hero.title")                    // -> "Type-Safe Translations for TypeScript"
t("hero.description")              // -> localized copy
t("header.language", {
  locale: "es"
})                                 // -> "Idioma"`}
                                    />
                                    </div>
                                </AnimatedGroup>

                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-background pb-16 pt-16 md:pb-32">
                    <div className="mx-auto max-w-5xl px-6">
                        <p className="mb-3 text-center text-base font-medium text-foreground">{t('frameworks.heroTitle')}</p>
                        <p className="mb-10 text-center text-sm text-muted-foreground">{t('frameworks.heroDescription')}</p>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {frameworks.map((fw) => (
                                <div key={fw.name} className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                                    <fw.icon className={`size-8 ${fw.iconClassName ?? ''} rounded-full`} />
                                    <span className="text-sm font-medium text-foreground">{fw.name}</span>
                                    <code className="text-xs text-muted-foreground break-all">{fw.install}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
