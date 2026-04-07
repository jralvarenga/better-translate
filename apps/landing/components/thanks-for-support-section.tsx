import Link from "next/link";
import {
  RiCheckLine,
  RiGithubLine,
  RiHeart3Line,
  RiHomeLine,
} from "@remixicon/react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { HeroHeader } from "@/components/header";
import { Footer } from "@/components/footer";
import type { LandingLocale, LandingTranslator } from "@/lib/i18n/config";
import { siteLinks } from "@/lib/site";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      y: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

interface ThanksForSupportSectionProps {
  locale: LandingLocale;
  t: LandingTranslator["t"];
  checkoutId?: string;
}

export function ThanksForSupportSection({
  locale,
  t,
  checkoutId,
}: ThanksForSupportSectionProps) {
  const impacts = [
    { id: "impact1", label: t("thanksForSupport.impact1") },
    { id: "impact2", label: t("thanksForSupport.impact2") },
    { id: "impact3", label: t("thanksForSupport.impact3") },
  ];

  return (
    <>
      <HeroHeader
        changelogLabel={t("header.changelog")}
        cliLabel={t("header.cli")}
        closeMenuLabel={t("header.closeMenu")}
        currentLocale={locale}
        docsLabel={t("header.docs")}
        githubLabel={t("header.github")}
        openMenuLabel={t("header.openMenu")}
        switchLabel={t("header.language")}
      />

      <main className="overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>

        <section>
          <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center pt-24 pb-16 md:pt-36">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] [background:radial-gradient(ellipse_60%_40%_at_50%_55%,oklch(0.7_0.2_10_/_0.06)_0%,transparent_70%)]"
            />

            <div className="mx-auto max-w-2xl px-6 text-center">
              <AnimatedGroup variants={transitionVariants}>
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl scale-150" />
                    <div className="relative flex size-20 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10 animate-pulse">
                      <RiHeart3Line className="size-10 text-rose-400" />
                    </div>
                  </div>
                </div>
              </AnimatedGroup>

              <TextEffect
                preset="slide"
                speedSegment={0.3}
                as="h1"
                className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl"
              >
                {t("thanksForSupport.title")}
              </TextEffect>

              <TextEffect
                per="line"
                preset="slide"
                speedSegment={0.3}
                delay={0.5}
                as="p"
                className="mt-5 text-balance text-base text-muted-foreground md:text-lg"
              >
                {t("thanksForSupport.description")}
              </TextEffect>

              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                        delayChildren: 0.9,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
                className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left"
              >
                {impacts.map((impact) => (
                  <div key={impact.id} className="flex items-center gap-3">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-500/15">
                      <RiCheckLine className="size-3 text-rose-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {impact.label}
                    </span>
                  </div>
                ))}
              </AnimatedGroup>

              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 1.1,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
                className="mt-8 flex items-center justify-center gap-3"
              >
                <Button asChild size="lg" className="text-sm text-zinc-950">
                  <Link href={`/${locale}`}>
                    <RiHomeLine className="size-4" />
                    <span className="text-nowrap">
                      {t("thanksForSupport.backHome")}
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="rounded-xl px-5"
                >
                  <Link
                    href={siteLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <RiGithubLine className="size-4" />
                    <span className="text-nowrap">
                      {t("thanksForSupport.viewGithub")}
                    </span>
                  </Link>
                </Button>
              </AnimatedGroup>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </>
  );
}
