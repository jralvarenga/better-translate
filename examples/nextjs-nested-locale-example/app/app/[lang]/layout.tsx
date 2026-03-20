import { notFound } from "next/navigation";

import { hasLocale } from "@better-translate/nextjs";
import { setRequestLocale } from "@better-translate/nextjs/server";

import { LocalizedHeader } from "@/app/components/localized-header";
import { getTranslations } from "@/lib/i18n/server";
import { routing } from "@/lib/i18n/routing";

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

  const t = await getTranslations();

  return (
    <div
      className="min-h-screen bg-zinc-50 px-6 py-8 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50"
      lang={lang}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col rounded-[2rem] border border-black/5 bg-white px-8 py-8 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-zinc-950 sm:px-10 sm:py-10">
        <LocalizedHeader
          guideLabel={t("navigation.guide")}
          homeLabel={t("navigation.localizedHome")}
          loginLabel={t("navigation.login")}
          rootLabel={t("navigation.gateway")}
          switchLabel={t("navigation.switchLanguage")}
        />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
