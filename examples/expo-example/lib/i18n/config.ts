import {
  configureTranslations,
  type TranslationLanguageMetadata,
} from "@better-translate/core";

import { en } from "./messages/en";
import { es } from "./messages/es";

export const expoLocales = ["en", "es"] as const;

export type ExpoLocale = (typeof expoLocales)[number];

export const expoDefaultLocale = "en" as const;

export const expoLanguages = [
  {
    locale: "en",
    nativeLabel: "English",
    shortLabel: "EN",
  },
  {
    locale: "es",
    nativeLabel: "Español",
    shortLabel: "ES",
  },
] as const satisfies readonly TranslationLanguageMetadata<ExpoLocale>[];

export function isExpoLocale(value: unknown): value is ExpoLocale {
  return expoLocales.includes(value as ExpoLocale);
}

export function createExpoTranslator() {
  return configureTranslations({
    availableLocales: expoLocales,
    defaultLocale: expoDefaultLocale,
    fallbackLocale: expoDefaultLocale,
    languages: expoLanguages,
    messages: {
      en,
      es,
    },
  });
}

export type ExpoTranslator = Awaited<ReturnType<typeof createExpoTranslator>>;
