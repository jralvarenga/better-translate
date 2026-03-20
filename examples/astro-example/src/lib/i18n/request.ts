import { getRequestConfig } from "@better-translate/astro";
import { configureTranslations } from "better-translate/core";

import { en } from "./messages/en";
import { es } from "./messages/es";

export const appLocales = ["en", "es"] as const;
export const defaultLocale = "en" as const;

export type AppLocale = (typeof appLocales)[number];

export const requestConfig = getRequestConfig(async () => ({
  translator: await configureTranslations({
    availableLocales: appLocales,
    defaultLocale,
    fallbackLocale: defaultLocale,
    languages: [
      {
        locale: "en",
        nativeLabel: "English",
        shortLabel: "EN",
      },
      {
        locale: "es",
        nativeLabel: "Espanol",
        shortLabel: "ES",
      },
    ],
    messages: {
      en,
      es,
    },
  }),
}));
