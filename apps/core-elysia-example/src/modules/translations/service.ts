import {
  configureTranslations,
  t,
  type DotKeys,
  type TranslationLocaleMap,
  type TranslationKeysWithOptionalParams,
} from "better-translate/core";

import en from "../../locales/en";
import es from "../../locales/es";

export const SUPPORTED_LOCALES = ["en", "es"] as const;
const FALLBACK_LOCALE = "en" as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
type AppMessages = typeof en;
type TranslationKey = TranslationKeysWithOptionalParams<AppMessages> & DotKeys<AppMessages>;

const messages = {
  en,
  es,
} satisfies TranslationLocaleMap<Locale, AppMessages>;

let activeLocale: Locale = "en";

/**
 * Configures the global Better Translate runtime for the current active locale.
 *
 * Re-running this swaps the default locale used by `t(...)` while keeping the
 * same message catalog for the whole server process.
 */
async function configureAppTranslations(locale: Locale) {
  activeLocale = locale;

  await configureTranslations({
    availableLocales: SUPPORTED_LOCALES,
    defaultLocale: locale,
    fallbackLocale: FALLBACK_LOCALE,
    messages,
  });
}

/**
 * Initializes the translation runtime when the server boots.
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
 * Updates the active locale for the whole process and reconfigures the global
 * Better Translate runtime to use it as the default locale.
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
    supportedLocales: [...SUPPORTED_LOCALES],
  };
}

/**
 * Builds a consistent JSON payload for translation endpoints.
 */
export function getTranslationPayload(key: TranslationKey) {
  return {
    key,
    message: t(key),
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
      params: {
        name: name
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
    message: t("locale.changed"),
    currentLocale: activeLocale,
    supportedLocales: [...SUPPORTED_LOCALES],
  };
}

/**
 * Translates a key for a specific locale without mutating global state.
 */
export function getLocaleResponsePayload(locale: Locale) {
  return {
    key: "routes.hello" as const,
    message: t("routes.hello", { config: { locale: locale } }),
    currentLocale: locale,
  };
}

/**
 * Builds the error payload for unsupported locale values.
 */
export function getInvalidLocalePayload() {
  return {
    error: t("errors.unsupportedLocale"),
    supportedLocales: [...SUPPORTED_LOCALES],
  };
}
