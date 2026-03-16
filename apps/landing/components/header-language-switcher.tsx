"use client";

import * as React from "react";

import { useTranslations } from "@better-translate/react";

import { getCatalogItems } from "@/lib/catalog";
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
  onSelect?: () => void;
  switchLabel?: string;
}

export function LanguageSwitcherFallback({
  currentLocale,
  switchLabel = "Switch language",
}: HeaderLanguageSwitcherProps) {
  const languageItems = getCatalogItems("language");
  const currentItem =
    languageItems.find((item) => item.locale === currentLocale) ?? languageItems[0];

  return (
    <Select defaultValue={currentItem?.locale} disabled
    >
      <SelectTrigger
        aria-label={switchLabel}
        className="w-28 rounded-xl border-white/10 bg-background/70 px-3 backdrop-blur-sm"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languageItems.map((item) => (
          <SelectItem key={item.id} value={item.locale}>
            <span aria-hidden="true">{item.emoji}</span>
            <span>{item.nativeLabel}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function HeaderLanguageSwitcher({
  currentLocale,
  onSelect,
}: HeaderLanguageSwitcherProps) {
  const { locale, supportedLocales, t } = useTranslations<LandingTranslator>();
  const pathname = useI18nPathname();
  const router = useI18nRouter();
  const [isPending, startTransition] = React.useTransition();
  const languageItems = getCatalogItems("language").filter((item) =>
    supportedLocales.includes(item.locale),
  );
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
          <SelectItem key={item.id} value={item.locale}>
            <span aria-hidden="true">{item.emoji}</span>
            <span>{item.nativeLabel}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
