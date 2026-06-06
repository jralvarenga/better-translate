import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { hasLocale } from "@better-translate/nextjs";
import { setRequestLocale } from "@better-translate/nextjs/server";
import "../globals.css";

import { LocalizedHeader } from "@/app/components/localized-header";
import { routing } from "@/lib/i18n/routing";
import { getTranslations, getTranslator } from "@/lib/i18n/server";

const localizedMetadata = {
  en: {
    description: "Root-level locale routing with Better Translate and Next.js.",
    title: "Better Translate Next.js Example",
  },
  es: {
    description:
      "Enrutamiento de locales desde la raiz con Better Translate y Next.js.",
    title: "Ejemplo Next.js de Better Translate",
  },
} satisfies Record<(typeof routing.locales)[number], Metadata>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  return localizedMetadata[lang];
}

export async function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
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

  const [t, translator] = await Promise.all([
    getTranslations(),
    getTranslator(),
  ]);
  const dir = translator.getDirection({ locale: lang });

  return (
    <html lang={lang} dir={dir}>
      <body>
        <div className="min-h-screen bg-zinc-50 px-6 py-8 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col rounded-[2rem] border border-black/5 bg-white px-8 py-8 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-zinc-950 sm:px-10 sm:py-10">
            <LocalizedHeader
              guideLabel={t("navigation.guide")}
              homeLabel={t("navigation.home")}
              loginLabel={t("navigation.login")}
              switchLabel={t("navigation.switchLanguage")}
            />
            <div className="flex flex-1 flex-col">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
