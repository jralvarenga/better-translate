import { notFound } from "next/navigation";

import { hasLocale } from "@better-translate/nextjs";
import { setRequestLocale } from "@better-translate/nextjs/server";

import { CodeDemo } from "@/components/code-demo";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Frameworks } from "@/components/frameworks";
import HeroSection from "@/components/hero-section";
import { Particles } from "@/components/ui/particles";
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
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="relative overflow-hidden min-h-screen bg-background">
      <Particles
        className="absolute inset-0 z-0"
        quantity={120}
        size={0.4}
        color="#ffffff"
        staticity={50}
        ease={50}
      />
      <div className="relative z-10">
        <HeroSection locale={locale} t={t} />
        <Features t={t} />
        <CodeDemo t={t} />
        <Frameworks t={t} />
        <Footer locale={locale} t={t} />
      </div>
    </div>
  );
}
