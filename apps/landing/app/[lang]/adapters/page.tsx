import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  RiArrowRightLine,
  RiBook2Line,
  RiSparkling2Line,
} from "@remixicon/react";

import { hasLocale } from "@better-translate/nextjs";
import { setRequestLocale } from "@better-translate/nextjs/server";

import { Footer } from "@/components/footer";
import { HeroHeader } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ResponsiveParticles } from "@/components/ui/responsive-particles";
import { getCatalogItems, type FrameworkId } from "@/lib/catalog";
import type { LandingLocale } from "@/lib/i18n/config";
import { I18nLink } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";
import { getTranslations } from "@/lib/i18n/server";
import { createRouteMetadata, resolveLandingLocale } from "@/lib/seo";

const docsHref: Record<FrameworkId, string> = {
  astro: "/docs/adapters/astro",
  bun: "/docs/adapters/core",
  nextjs: "/docs/adapters/nextjs",
  nodejs: "/docs/adapters/core",
  react: "/docs/adapters/react",
  tanstack: "/docs/adapters/tanstack-router",
  typescript: "/docs/adapters/core",
};

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLandingLocale(lang);
  setRequestLocale(locale);
  const t = await getTranslations();

  return createRouteMetadata(locale, "/adapters", {
    description: t("adapters.page.description"),
    title: t("adapters.page.title"),
  });
}

export default async function AdaptersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  const locale = lang as LandingLocale;
  setRequestLocale(locale);
  const t = await getTranslations();

  const frameworks = getCatalogItems("framework");
  const frameworkDescriptions: Record<FrameworkId, string> = {
    astro: t("frameworks.items.astro.description"),
    bun: t("frameworks.items.bun.description"),
    nextjs: t("frameworks.items.nextjs.description"),
    nodejs: t("frameworks.items.nodejs.description"),
    react: t("frameworks.items.react.description"),
    tanstack: t("frameworks.items.tanstack.description"),
    typescript: t("frameworks.items.typescript.description"),
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="relative z-10">
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
          <section className="relative pt-32 pb-16 md:pt-44 md:pb-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] [background:radial-gradient(ellipse_60%_40%_at_50%_40%,oklch(1_0_0_/_0.05)_0%,transparent_70%)]"
            />
            <div className="mx-auto max-w-3xl px-6 text-center">
              <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight md:text-5xl">
                {t("adapters.page.title")}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
                {t("adapters.page.description")}
              </p>
            </div>
          </section>

          <section className="pb-24 md:pb-32">
            <div className="mx-auto max-w-5xl px-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {frameworks.map((fw) => (
                  <div
                    key={fw.name}
                    className="group flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:border-white/20 hover:bg-white/8"
                  >
                    <fw.icon
                      className={`size-8 ${fw.iconClassName ?? ""} rounded-full`}
                    />
                    <div className="flex-1">
                      <h3 className="mb-1 font-medium text-foreground">
                        {fw.name}
                      </h3>
                      <p className="mb-3 text-xs text-muted-foreground">
                        {frameworkDescriptions[fw.id]}
                      </p>
                      <code className="block text-xs text-muted-foreground/70 break-all">
                        {fw.install}
                      </code>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full justify-between rounded-lg"
                    >
                      <I18nLink href={docsHref[fw.id]}>
                        <span className="inline-flex items-center gap-1.5">
                          <RiBook2Line className="size-4" />
                          {t("adapters.viewDocs")}
                        </span>
                        <RiArrowRightLine className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                      </I18nLink>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex items-center justify-center gap-3 px-6 py-5 text-center">
                <RiSparkling2Line className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t("adapters.comingSoon")}...
                </span>
              </div>
            </div>
          </section>
        </main>

        <Footer locale={locale} t={t} />
      </div>
    </div>
  );
}
