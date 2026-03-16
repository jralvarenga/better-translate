import { notFound } from "next/navigation";

import { hasLocale } from "@better-translate/nextjs";

import { CodeDemo } from "@/components/code-demo";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Frameworks } from "@/components/frameworks";
import HeroSection from "@/components/hero-section";
import type { LandingLocale } from "@/lib/i18n/config";
import { routing } from "@/lib/i18n/routing";
import { getTranslations } from "@/lib/i18n/server";

export default async function LocalizedHomePage({
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  const locale = lang as LandingLocale;
  const t = await getTranslations({
    locale,
  });

  return (
    <div className="dot-grid min-h-screen bg-background">
      <HeroSection locale={locale} t={t} />
      <Features t={t} />
      <CodeDemo t={t} />
      <Frameworks t={t} />
      <Footer locale={locale} t={t} />
    </div>
  );
}
