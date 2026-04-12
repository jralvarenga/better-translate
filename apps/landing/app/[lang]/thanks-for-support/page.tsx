import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { hasLocale } from "@better-translate/nextjs";
import { setRequestLocale } from "@better-translate/nextjs/server";

import { ThanksForSupportSection } from "@/components/thanks-for-support-section";
import { ResponsiveParticles } from "@/components/ui/responsive-particles";
import type { LandingLocale } from "@/lib/i18n/config";
import { routing } from "@/lib/i18n/routing";
import {
  createThanksForSupportMetadata,
  resolveLandingLocale,
} from "@/lib/seo";
import { getTranslations } from "@/lib/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return createThanksForSupportMetadata(resolveLandingLocale(lang));
}

export default async function ThanksForSupportPage({
  params,
  searchParams,
}: PageProps<"/[lang]"> & {
  searchParams: Promise<{ id?: string; checkout_id?: string }>;
}) {
  const { lang } = await params;
  const { id, checkout_id } = await searchParams;
  const raw = id ?? checkout_id;
  const checkoutId = raw && /^[\w-]+$/.test(raw) ? raw : undefined;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  const locale = lang as LandingLocale;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="relative overflow-hidden min-h-screen bg-background">
      <ResponsiveParticles
        className="absolute inset-0 z-0"
        quantity={120}
        size={0.4}
        color="#ffffff"
        staticity={50}
        ease={50}
      />
      <div className="relative z-10">
        <ThanksForSupportSection
          locale={locale}
          t={t}
          checkoutId={checkoutId}
        />
      </div>
    </div>
  );
}
