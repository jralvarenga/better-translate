import type {
  CachedMessages,
  ConfiguredTranslator,
  DeepPartialMessages,
  TranslationDirection,
  TranslationLanguageMetadata,
  TranslateFunction,
  TranslationMessages,
} from "@better-translate/core";
import type { ReactNode } from "react";

export type AnyBetterTranslateTranslator = ConfiguredTranslator<
  any,
  TranslationMessages
>;

export type InferLocale<TTranslator extends AnyBetterTranslateTranslator> =
  TTranslator extends ConfiguredTranslator<infer TLocale, TranslationMessages>
    ? TLocale
    : never;

export type InferMessages<TTranslator extends AnyBetterTranslateTranslator> =
  TTranslator extends ConfiguredTranslator<any, infer TSourceMessages>
    ? TSourceMessages
    : TranslationMessages;

export interface BetterTranslateProviderProps<
  TTranslator extends AnyBetterTranslateTranslator,
> {
  children: ReactNode;
  initialLocale?: InferLocale<TTranslator>;
  translator: TTranslator;
}

export interface UseTranslationsValue<
  TTranslator extends AnyBetterTranslateTranslator,
> {
  availableLanguages: readonly TranslationLanguageMetadata<
    InferLocale<TTranslator>
  >[];
  defaultLocale: InferLocale<TTranslator>;
  direction: TranslationDirection;
  fallbackLocale: InferLocale<TTranslator>;
  isLoadingLocale: boolean;
  loadLocale(
    locale: InferLocale<TTranslator>,
  ): Promise<
    | DeepPartialMessages<InferMessages<TTranslator>>
    | InferMessages<TTranslator>
    | undefined
  >;
  loadingLocale: InferLocale<TTranslator> | null;
  locale: InferLocale<TTranslator>;
  localeError: unknown;
  messages: CachedMessages<
    InferLocale<TTranslator>,
    InferMessages<TTranslator>
  >;
  rtl: boolean;
  setLocale(locale: InferLocale<TTranslator>): Promise<void>;
  supportedLocales: readonly InferLocale<TTranslator>[];
  t: TranslateFunction<InferLocale<TTranslator>, InferMessages<TTranslator>>;
  translator: TTranslator;
}

export type AnyUseTranslationsValue =
  UseTranslationsValue<AnyBetterTranslateTranslator>;
