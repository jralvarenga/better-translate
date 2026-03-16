import {
  type DeepStringify,
  configureTranslations,
  type TranslationConfigOptions,
} from "better-translate/core";

import { en } from "./messages/en";
import { es } from "./messages/es";

export const landingLocales = ["en", "es"] as const;

export type LandingLocale = (typeof landingLocales)[number];

export const landingDefaultLocale = "en" as const;

export const landingMessages = {
  en,
  es,
} satisfies Record<LandingLocale, DeepStringify<typeof en>>;

export const landingTranslationsConfig = {
  availableLocales: landingLocales,
  defaultLocale: landingDefaultLocale,
  fallbackLocale: landingDefaultLocale,
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
