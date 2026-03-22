import Image from "next/image";
import { notFound } from "next/navigation";

import { hasLocale } from "@better-translate/nextjs";

import { I18nLink } from "@/lib/i18n/navigation";
import { getTranslations } from "@/lib/i18n/server";
import { routing } from "@/lib/i18n/routing";

export default async function GuidePage({
  params,
}: PageProps<"/[lang]/guide">) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  const t = await getTranslations();

  return (
    <main className="flex flex-1 flex-col justify-between gap-10 py-10">
      <div className="flex flex-col gap-6">
        <div className="inline-flex w-fit items-center gap-3 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-600 dark:border-white/10 dark:text-zinc-300">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          {t("guide.badge")}
        </div>

        <Image
          className="dark:invert"
          src="/vercel.svg"
          alt="Vercel logo"
          width={100}
          height={20}
          priority
        />

        <div className="space-y-5">
          <h1 className="max-w-3xl text-3xl font-semibold leading-10 tracking-tight sm:text-5xl sm:leading-[1.05]">
            {t("guide.title")}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t("guide.description")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[1.5rem] border border-black/5 bg-zinc-50 p-6 dark:border-white/10 dark:bg-white/[0.02]">
              <h2 className="text-lg font-semibold">
                {t("guide.routeTreeTitle")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {t("guide.routeTreeDescription")}
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-black/5 bg-zinc-50 p-6 dark:border-white/10 dark:bg-white/[0.02]">
              <h2 className="text-lg font-semibold">
                {t("guide.navigationTitle")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {t("guide.navigationDescription")}
              </p>
            </article>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 text-base font-medium sm:flex-row sm:flex-wrap">
        <I18nLink
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[180px]"
          href="/"
        >
          {t("guide.backToHome")}
        </I18nLink>
        <I18nLink
          className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[180px]"
          href="/login"
        >
          {t("guide.openLogin")}
        </I18nLink>
      </div>
    </main>
  );
}
