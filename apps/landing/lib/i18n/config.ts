import {
  type DeepStringify,
  configureTranslations,
  type TranslationConfigOptions,
} from "better-translate/core";

import { ar } from "./messages/ar";
import { en } from "./messages/en";
import { es } from "./messages/es";
import { ja } from "./messages/ja";

export const landingLocales = ["en", "es", "ar", "ja"] as const;

export type LandingLocale = (typeof landingLocales)[number];

export const landingDefaultLocale = "en" as const;

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
  messages: landingMessages,
} satisfies TranslationConfigOptions<
  typeof landingLocales,
  typeof landingMessages,
  undefined,
  typeof landingDefaultLocale
>;

export type LandingTranslationsConfig = typeof landingTranslationsConfig;

export function createLandingTranslator() {
  return configureTranslations(landingTranslationsConfig);
}

export type LandingTranslator = Awaited<ReturnType<typeof createLandingTranslator>>;
