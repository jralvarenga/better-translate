"use client";

import * as React from "react";

import { useTranslations } from "@better-translate/react";
import type { TranslationLanguageMetadata } from "@better-translate/core";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LandingLocale, LandingTranslator } from "@/lib/i18n/config";
import { useI18nPathname, useI18nRouter } from "@/lib/i18n/navigation";

interface HeaderLanguageSwitcherProps {
  className?: string;
  currentLocale: LandingLocale;
  languages: readonly TranslationLanguageMetadata<LandingLocale>[];
  onSelect?: () => void;
  switchLabel?: string;
}

export function LanguageSwitcherFallback({
  currentLocale,
  languages,
  switchLabel = "Switch language",
}: HeaderLanguageSwitcherProps) {
  const currentItem =
    languages.find((item) => item.locale === currentLocale) ?? languages[0];

  return (
    <Select defaultValue={currentItem?.locale} disabled>
      <SelectTrigger
        aria-label={switchLabel}
        className="w-28 rounded-xl border-white/10 bg-background/70 px-3 backdrop-blur-sm"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((item) => (
          <SelectItem key={item.locale} value={item.locale}>
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.nativeLabel}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function HeaderLanguageSwitcher({
  currentLocale,
  languages,
  onSelect,
}: HeaderLanguageSwitcherProps) {
  const { availableLanguages, locale, supportedLocales, t } =
    useTranslations<LandingTranslator>();
  const pathname = useI18nPathname();
  const router = useI18nRouter();
  const [isPending, startTransition] = React.useTransition();
  const fallbackLanguageMap = new Map(
    languages.map((language) => [language.locale, language] as const),
  );
  const languageItems = availableLanguages
    .filter((item) => supportedLocales.includes(item.locale))
    .map((item) => ({
      ...item,
      ...fallbackLanguageMap.get(item.locale as LandingLocale),
    }));
  const selectedLocale = locale ?? currentLocale;

  return (
    <Select
      disabled={isPending}
      onValueChange={(value) => {
        const nextLocale = value as LandingLocale;

        if (nextLocale === locale) {
          onSelect?.();
          return;
        }

        startTransition(() => {
          router.replace(pathname, {
            locale: nextLocale,
            scroll: false,
          });
          onSelect?.();
        });
      }}
      value={selectedLocale}
    >
      <SelectTrigger
        aria-label={t("header.languageSwitcher")}
        className="w-32 rounded-xl border-white/10 bg-background/70 px-3 backdrop-blur-sm"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languageItems.map((item) => (
          <SelectItem key={item.locale} value={item.locale}>
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.nativeLabel}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
