import type {
  InternalNormalizedConfig,
  RuntimeConfigInput,
  TranslationDirection,
  TranslationLanguageMetadata,
} from "./types.js";
import { isTranslationConfigOptions } from "./validation.js";

function createNormalizedDirections(
  locales: readonly string[],
  directions?: Partial<Record<string, TranslationDirection>>,
): Record<string, TranslationDirection> {
  return Object.fromEntries(
    locales.map((locale) => [locale, directions?.[locale] ?? "ltr"]),
  );
}

function createDefaultLanguageMetadata(
  locale: string,
): TranslationLanguageMetadata<string> {
  return {
    locale,
    nativeLabel: locale,
    shortLabel: locale.toUpperCase(),
  };
}

function createNormalizedLanguages(
  locales: readonly string[],
  languages?: readonly TranslationLanguageMetadata<string>[],
): TranslationLanguageMetadata<string>[] {
  const supportedLocaleSet = new Set(locales);
  const seenLocales = new Set<string>();
  const normalizedLanguages: TranslationLanguageMetadata<string>[] = [];

  for (const language of languages ?? []) {
    if (!supportedLocaleSet.has(language.locale)) {
      throw new Error(
        `The locale "${language.locale}" is present in languages but not in availableLocales.`,
      );
    }

    if (seenLocales.has(language.locale)) {
      throw new Error(
        `Duplicate locale "${language.locale}" found in languages config.`,
      );
    }

    seenLocales.add(language.locale);
    normalizedLanguages.push({
      ...language,
    });
  }

  for (const locale of locales) {
    if (seenLocales.has(locale)) {
      continue;
    }

    normalizedLanguages.push(createDefaultLanguageMetadata(locale));
  }

  return normalizedLanguages;
}

function createOptionalLocaleSet(
  locales: readonly string[],
  defaultLocale: string,
  languages?: readonly TranslationLanguageMetadata<string>[],
  optionalLocales?: readonly string[],
): Set<string> {
  const supportedLocaleSet = new Set(locales);
  const optionalLocaleSet = new Set<string>();

  for (const locale of optionalLocales ?? []) {
    if (!supportedLocaleSet.has(locale)) {
      throw new Error(
        `The locale "${locale}" is present in optionalLocales but not in availableLocales.`,
      );
    }

    if (locale === defaultLocale) {
      throw new Error(
        `The default locale "${locale}" cannot be marked as optional.`,
      );
    }

    optionalLocaleSet.add(locale);
  }

  for (const language of languages ?? []) {
    if (language.optional !== true) {
      continue;
    }

    if (language.locale === defaultLocale) {
      throw new Error(
        `The default locale "${language.locale}" cannot be marked as optional.`,
      );
    }

    optionalLocaleSet.add(language.locale);
  }

  return optionalLocaleSet;
}

/**
 * Normalizes either supported configuration form into one internal runtime
 * shape used by the translator implementation.
 *
 * It also validates locale declarations, required source messages, optional
 * locale declarations, and that message/loader locales are included in
 * `availableLocales`.
 */
export function normalizeConfig(
  input: RuntimeConfigInput,
): InternalNormalizedConfig {
  if (!isTranslationConfigOptions(input)) {
    const locales = Object.keys(input);

    if (locales.length === 0) {
      throw new Error(
        "configureTranslations(...) requires at least one locale.",
      );
    }

    const [defaultLocale] = locales as [string, ...string[]];

    return {
      defaultLocale,
      fallbackLocale: defaultLocale,
      supportedLocales: locales,
      directions: createNormalizedDirections(locales),
      languages: createNormalizedLanguages(locales),
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

  if (
    input.fallbackLocale &&
    !supportedLocales.includes(input.fallbackLocale)
  ) {
    throw new Error(
      `The fallback locale "${input.fallbackLocale}" is not included in availableLocales.`,
    );
  }

  if (!input.messages[input.defaultLocale]) {
    throw new Error(
      `Missing source messages for default locale "${input.defaultLocale}".`,
    );
  }

  const optionalLocaleSet = createOptionalLocaleSet(
    supportedLocales,
    input.defaultLocale,
    input.languages,
    input.optionalLocales,
  );

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

  for (const locale of Object.keys(input.directions ?? {})) {
    if (!supportedLocales.includes(locale)) {
      throw new Error(
        `The locale "${locale}" is present in directions but not in availableLocales.`,
      );
    }
  }

  const configuredLocales = new Set([
    ...Object.keys(input.messages),
    ...Object.keys(input.loaders ?? {}),
  ]);

  for (const locale of supportedLocales) {
    if (
      locale === input.defaultLocale ||
      optionalLocaleSet.has(locale) ||
      configuredLocales.has(locale)
    ) {
      continue;
    }

    throw new Error(
      `Missing messages or loader for locale "${locale}". Mark it optional with optionalLocales if translations are intentionally unavailable.`,
    );
  }

  return {
    defaultLocale: input.defaultLocale,
    fallbackLocale: input.fallbackLocale ?? input.defaultLocale,
    supportedLocales,
    directions: createNormalizedDirections(supportedLocales, input.directions),
    languages: createNormalizedLanguages(supportedLocales, input.languages),
    messages: input.messages,
    loaders: input.loaders ?? {},
  };
}
