import {
  createTranslationHelpers,
  type DotKeys,
  type TranslationKeysWithOptionalParams,
} from "@better-translate/core";

import en from "../../locales/en.json";
import es from "../../locales/es.json";

export const SUPPORTED_LOCALES = ["en", "es"] as const;
const FALLBACK_LOCALE = "en" as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
type AppMessages = typeof en;
type TranslationKey = TranslationKeysWithOptionalParams<AppMessages> & DotKeys<AppMessages>;


export const translations = await createTranslationHelpers({
  availableLocales: SUPPORTED_LOCALES,
  defaultLocale: FALLBACK_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages: {
    en,
    es,
  },
});

export const {
  getMessages,
  getSupportedLocales,
  loadLocale,
  t,
  translator,
} = translations;

let activeLocale: Locale = "en";

/**
 * Synchronizes the example's active locale with the package-owned helpers.
 */
async function configureAppTranslations(locale: Locale) {
  await loadLocale(locale);
  activeLocale = locale;
}

/**
 * Ensures the translation helpers are ready when the server boots.
 */
export async function initializeTranslations() {
  await configureAppTranslations(activeLocale);
}

/**
 * Returns true when the provided value matches one of the supported locales.
 */
export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

/**
 * Updates the active locale used by the exported translation helpers.
 */
export async function changeLocale(locale: Locale) {
  await configureAppTranslations(locale);
}

/**
 * Returns the current translation state for inspection endpoints.
 */
export function getLocaleState() {
  return {
    currentLocale: activeLocale,
    fallbackLocale: FALLBACK_LOCALE,
    supportedLocales: [...getSupportedLocales()],
  };
}

/**
 * Builds a consistent JSON payload for translation endpoints.
 */
export function getTranslationPayload(key: TranslationKey) {
  return {
    key,
    message: t(key, { locale: activeLocale }),
    currentLocale: activeLocale,
  };
}

/**
 * Builds a translated greeting payload using interpolation params.
 */
export function getGreetingPayload(name: string) {
  return {
    key: "routes.greeting" as const,
    message: t("routes.greeting", {
      locale: activeLocale,
      params: {
        name,
      },
    }),
    currentLocale: activeLocale,
  };
}

/**
 * Builds the success payload returned after the locale changes.
 */
export function getLocaleChangedPayload() {
  return {
    message: t("locale.changed", { locale: activeLocale }),
    currentLocale: activeLocale,
    supportedLocales: [...getSupportedLocales()],
  };
}

/**
 * Translates a key for a specific locale without mutating global state.
 */
export function getLocaleResponsePayload(locale: Locale) {
  return {
    key: "routes.hello" as const,
    message: t("routes.hello", { locale }),
    currentLocale: locale,
  };
}

/**
 * Builds the error payload for unsupported locale values.
 */
export function getInvalidLocalePayload() {
  return {
    error: t("errors.unsupportedLocale", { locale: activeLocale }),
    supportedLocales: [...getSupportedLocales()],
  };
}
