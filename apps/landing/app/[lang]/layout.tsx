import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { hasLocale } from "@better-translate/nextjs";
import { setRequestLocale } from "@better-translate/nextjs/server";

import { DirectionProvider } from "@/components/ui/direction";
import { LandingTranslationsProvider } from "@/components/landing-translations-provider";
import type { LandingLocale } from "@/lib/i18n/config";
import { createLandingTranslator } from "@/lib/i18n/config";
import { routing } from "@/lib/i18n/routing";
import { createHomeMetadata, resolveLandingLocale } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return createHomeMetadata(resolveLandingLocale(lang));
}

export default async function LocalizedLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{
    lang: string;
  }>;
}>) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  setRequestLocale(lang);

  const translator = await createLandingTranslator();
  const dir = translator.getDirection({ locale: lang as LandingLocale });

  return (
    <div lang={lang} dir={dir}>
      <DirectionProvider direction={dir}>
        <Suspense>
          <LandingTranslationsProvider initialLocale={lang as LandingLocale}>
            {children}
          </LandingTranslationsProvider>
        </Suspense>
      </DirectionProvider>
    </div>
  );
}
