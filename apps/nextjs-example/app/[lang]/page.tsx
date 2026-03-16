import Image from "next/image";
import { notFound } from "next/navigation";

import { hasLocale } from "@better-translate/nextjs";

import { I18nLink } from "@/lib/i18n/navigation";
import { getTranslations } from "@/lib/i18n/server";
import { routing } from "@/lib/i18n/routing";

export default async function LocalizedHomePage({
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  const t = await getTranslations();

  return (
    <main className="flex flex-1 flex-col justify-between gap-10 py-10">
      <div className="flex flex-col gap-6">
        <div className="inline-flex w-fit items-center gap-3 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-600 dark:border-white/10 dark:text-zinc-300">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          {t("home.badge")}
        </div>

        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="space-y-5">
          <h1 className="max-w-3xl text-3xl font-semibold leading-10 tracking-tight sm:text-5xl sm:leading-[1.05]">
            {t("home.title")}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t("home.description")}
          </p>
          <p className="max-w-3xl text-base leading-7 text-zinc-500 dark:text-zinc-400">
            {t("home.supportingCopy")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 text-base font-medium sm:flex-row sm:flex-wrap">
        <I18nLink
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[220px]"
          href="/guide"
        >
          {t("home.primaryCta")}
        </I18nLink>
        <I18nLink
          className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[170px]"
          href="/login"
        >
          {t("home.secondaryCta")}
        </I18nLink>
      </div>
    </main>
  );
}
