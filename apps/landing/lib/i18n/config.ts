import {
  type DeepStringify,
  type TranslationConfigOptions,
  configureTranslations,
} from "@better-translate/core";

import { ar } from "./messages/ar";
import { en } from "./messages/en";
import { es } from "./messages/es";
import { ja } from "./messages/ja";
import {
  type LandingLocale,
  landingDefaultLocale,
  landingDirections,
  landingLanguages,
  landingLocales,
  landingOptionalLocales,
} from "./shared";

export {
  getLandingDirection,
  getLandingLanguages,
  landingDefaultLocale,
  landingDirections,
  landingLanguages,
  landingLocales,
  landingOptionalLocales,
  type LandingLocale,
} from "./shared";

export const landingMessages = {
  en,
  es,
  ar,
  ja,
} satisfies Record<LandingLocale, DeepStringify<typeof en>>;

export const config = {
  availableLocales: landingLocales,
  defaultLocale: landingDefaultLocale,
  fallbackLocale: landingDefaultLocale,
  directions: landingDirections,
  languages: landingLanguages,
  optionalLocales: landingOptionalLocales,
  messages: landingMessages,
} satisfies TranslationConfigOptions<
  typeof landingLocales,
  typeof landingMessages,
  undefined,
  typeof landingDefaultLocale,
  typeof landingOptionalLocales
>;

export type config = typeof config;

export function createLandingTranslator() {
  return configureTranslations(config);
}

export type LandingTranslator = Awaited<
  ReturnType<typeof createLandingTranslator>
>;
