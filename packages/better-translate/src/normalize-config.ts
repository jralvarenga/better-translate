import type { InternalNormalizedConfig, RuntimeConfigInput } from "./types.js";
import { isTranslationConfigOptions } from "./validation.js";

/**
 * Normalizes either supported configuration form into one internal runtime
 * shape used by the translator implementation.
 *
 * It also validates locale declarations, required source messages, and that
 * message/loader locales are included in `availableLocales`.
 */
export function normalizeConfig(input: RuntimeConfigInput): InternalNormalizedConfig {
  if (!isTranslationConfigOptions(input)) {
    const locales = Object.keys(input);

    if (locales.length === 0) {
      throw new Error("configureTranslations(...) requires at least one locale.");
    }

    const defaultLocale = locales[0]!;

    return {
      defaultLocale,
      fallbackLocale: defaultLocale,
      supportedLocales: locales,
      messages: input,
      loaders: {},
    };
  }

  const supportedLocales = [...input.availableLocales];

  if (supportedLocales.length === 0) {
    throw new Error("configureTranslations(...) requires at least one locale.");
  }

  if (!supportedLocales.includes(input.defaultLocale)) {
    throw new Error(
      `The default locale "${input.defaultLocale}" is not included in availableLocales.`,
    );
  }

  if (input.fallbackLocale && !supportedLocales.includes(input.fallbackLocale)) {
    throw new Error(
      `The fallback locale "${input.fallbackLocale}" is not included in availableLocales.`,
    );
  }

  if (!input.messages[input.defaultLocale]) {
    throw new Error(
      `Missing source messages for default locale "${input.defaultLocale}".`,
    );
  }

  for (const locale of Object.keys(input.messages)) {
    if (!supportedLocales.includes(locale)) {
      throw new Error(
        `The locale "${locale}" is present in messages but not in availableLocales.`,
      );
    }
  }

  for (const locale of Object.keys(input.loaders ?? {})) {
    if (!supportedLocales.includes(locale)) {
      throw new Error(
        `The locale "${locale}" is present in loaders but not in availableLocales.`,
      );
    }
  }

  return {
    defaultLocale: input.defaultLocale,
    fallbackLocale: input.fallbackLocale ?? input.defaultLocale,
    supportedLocales,
    messages: input.messages,
    loaders: input.loaders ?? {},
  };
}
