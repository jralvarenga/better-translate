import type {
  TranslationDirection,
  TranslationLanguageMetadata,
} from "@better-translate/core";

export const landingLocales = ["en", "es", "ar", "ja"] as const;

export type LandingLocale = (typeof landingLocales)[number];

export const landingDefaultLocale = "en" as const;

type TupleWithout<
  TTuple extends readonly unknown[],
  TExcluded,
> = TTuple extends readonly [infer THead, ...infer TTail]
  ? THead extends TExcluded
    ? TupleWithout<TTail, TExcluded>
    : readonly [THead, ...TupleWithout<TTail, TExcluded>]
  : readonly [];

function tupleWithout<
  const TTuple extends readonly string[],
  const TExcluded extends TTuple[number],
>(items: TTuple, excluded: TExcluded) {
  return items.filter(
    (item): item is Exclude<TTuple[number], TExcluded> => item !== excluded,
  ) as unknown as TupleWithout<TTuple, TExcluded>;
}

export const landingOptionalLocales = tupleWithout(
  landingLocales,
  landingDefaultLocale,
);

export const landingDirections: Partial<
  Record<LandingLocale, TranslationDirection>
> = {
  ar: "rtl",
};

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

export function getLandingDirection(locale: LandingLocale) {
  return landingDirections[locale] ?? "ltr";
}

export function getLandingLanguages() {
  return [...landingLanguages];
}
