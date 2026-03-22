import {
  type DeepStringify,
  configureTranslations,
  type TranslationLanguageMetadata,
  type TranslationConfigOptions,
} from "@better-translate/core";

import { ar } from "./messages/ar";
import { en } from "./messages/en";
import { es } from "./messages/es";
import { ja } from "./messages/ja";

export const landingLocales = ["en", "es", "ar", "ja"] as const;

export type LandingLocale = (typeof landingLocales)[number];

export const landingDefaultLocale = "en" as const;

export const landingLanguages = [
  {
    icon: "🇺🇸",
    locale: "en",
    nativeLabel: "English",
    shortLabel: "EN",
  },
  {
    icon: "🇪🇸",
    locale: "es",
    nativeLabel: "Español",
    shortLabel: "ES",
  },
  {
    icon: "🇸🇦",
    locale: "ar",
    nativeLabel: "العربية",
    shortLabel: "AR",
  },
  {
    icon: "🇯🇵",
    locale: "ja",
    nativeLabel: "日本語",
    shortLabel: "JA",
  },
] as const satisfies readonly TranslationLanguageMetadata<LandingLocale>[];

export const landingMessages = {
  en,
  es,
  ar,
  ja
} satisfies Record<LandingLocale, DeepStringify<typeof en>>;

export const landingTranslationsConfig = {
  availableLocales: landingLocales,
  defaultLocale: landingDefaultLocale,
  fallbackLocale: landingDefaultLocale,
  directions: { ar: "rtl" },
  languages: landingLanguages,
  messages: landingMessages,
} satisfies TranslationConfigOptions<
  typeof landingLocales,
  typeof landingMessages,
  undefined,
  typeof landingDefaultLocale
>;

export type LandingTranslationsConfig = typeof landingTranslationsConfig;

export function getLandingLanguages() {
  return [...landingTranslationsConfig.languages];
}

export function createLandingTranslator() {
  return configureTranslations(landingTranslationsConfig);
}

export type LandingTranslator = Awaited<ReturnType<typeof createLandingTranslator>>;
