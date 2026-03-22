"use client";

import { useParams } from "next/navigation";

import { hasLocale } from "@better-translate/nextjs";

import { routing } from "@/lib/i18n/routing";
import {
  I18nLink,
  useI18nPathname,
  useI18nRouter,
} from "@/lib/i18n/navigation";

interface LocalizedHeaderProps {
  guideLabel: string;
  homeLabel: string;
  loginLabel: string;
  switchLabel: string;
}

export function LocalizedHeader({
  guideLabel,
  homeLabel,
  loginLabel,
  switchLabel,
}: LocalizedHeaderProps) {
  const params = useParams();
  const pathname = useI18nPathname();
  const router = useI18nRouter();
  const langParam = params.lang;
  const currentLocale =
    typeof langParam === "string" && hasLocale(routing.locales, langParam)
      ? langParam
      : routing.defaultLocale;

  return (
    <header className="flex flex-col gap-5 border-b border-black/5 pb-6 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <I18nLink
          className="inline-flex items-center gap-3 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          href="/"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          better-translate
        </I18nLink>

        <nav className="flex flex-wrap gap-3 text-sm font-medium">
          <I18nLink
            className="rounded-full border border-black/10 px-4 py-2 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.06]"
            href="/"
          >
            {homeLabel}
          </I18nLink>
          <I18nLink
            className="rounded-full border border-black/10 px-4 py-2 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.06]"
            href="/guide"
          >
            {guideLabel}
          </I18nLink>
          <I18nLink
            className="rounded-full border border-black/10 px-4 py-2 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.06]"
            href="/login"
          >
            {loginLabel}
          </I18nLink>
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {switchLabel}
        </span>
        {routing.locales.map((locale) => {
          const isActive = locale === currentLocale;

          return (
            <button
              key={locale}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-black/10 text-zinc-600 hover:bg-black/[0.03] dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
              }`}
              onClick={() => {
                router.replace(pathname, {
                  locale,
                });
              }}
              type="button"
            >
              {locale.toUpperCase()}
            </button>
          );
        })}
      </div>
    </header>
  );
}
