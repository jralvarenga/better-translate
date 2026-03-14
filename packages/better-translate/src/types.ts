export type TranslationLeaf = string;

export type TranslationMessages = {
  readonly [key: string]: TranslationLeaf | TranslationMessages;
};

export type TranslationLoader<TMessages = TranslationMessages> = () =>
  | TMessages
  | Promise<TMessages>;

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type UnionToIntersection<T> = (
  T extends unknown ? (value: T) => void : never
) extends (value: infer I) => void
  ? I
  : never;

type MergeUnion<T> = T extends Primitive
  ? T
  : T extends ReadonlyArray<unknown>
    ? never
    : T extends Record<string, unknown>
      ? Simplify<{
          [K in keyof UnionToIntersection<T>]: MergeUnion<
            T extends unknown ? (K extends keyof T ? T[K] : never) : never
          >;
        }>
      : never;

export type DeepPartialMessages<TMessages> = {
  [K in keyof TMessages]?: TMessages[K] extends string
    ? string
    : TMessages[K] extends TranslationMessages
      ? DeepPartialMessages<TMessages[K]>
      : never;
};

export type DotKeys<TMessages, TPrefix extends string = ""> = {
  [K in keyof TMessages & string]: TMessages[K] extends string
    ? `${TPrefix}${K}`
    : TMessages[K] extends TranslationMessages
      ? DotKeys<TMessages[K], `${TPrefix}${K}.`>
      : never;
}[keyof TMessages & string];

/**
 * Optional overrides for a single translation lookup.
 */
export interface TranslateOptions<TLocale extends string> {
  /**
   * Uses a specific locale for this call instead of the configured default locale.
   */
  locale?: TLocale;
}

/**
 * Translator returned by `configureTranslations(...)`.
 *
 * It keeps the configured locale metadata, resolves keys with fallback behavior,
 * and can lazily load locales registered through async loaders.
 */
export interface ConfiguredTranslator<
  TLocale extends string,
  TSourceMessages extends TranslationMessages,
> {
  /**
   * Source locale used for key inference and default translation lookups.
   */
  readonly defaultLocale: TLocale;
  /**
   * Locale used when a key is missing in the requested locale.
   */
  readonly fallbackLocale: TLocale;
  /**
   * All locales declared for this translator.
   */
  readonly supportedLocales: readonly TLocale[];
  /**
   * Resolves a translation key using the provided locale override or the default locale.
   *
   * If a key is missing in the active locale, it falls back to the configured
   * fallback locale. If the key is still missing, the key itself is returned.
   */
  t<TKey extends DotKeys<TSourceMessages>>(
    key: TKey,
    options?: TranslateOptions<TLocale>,
  ): string;
  /**
   * Loads a locale through its registered async loader and caches the result.
   *
   * Returns the cached or loaded locale messages, or `undefined` when the locale
   * does not have a loader or preloaded messages.
   */
  loadLocale(
    locale: TLocale,
  ): Promise<DeepPartialMessages<TSourceMessages> | TSourceMessages | undefined>;
  /**
   * Returns the list of configured locales for this translator.
   */
  getSupportedLocales(): readonly TLocale[];
  /**
   * Returns the cached messages currently known by this translator.
   *
   * This includes messages passed during configuration and any locales loaded
   * later through async loaders.
   */
  getMessages(): CachedMessages<TLocale, TSourceMessages>;
}

/**
 * Main configuration shape for the framework-agnostic translation runtime.
 *
 * `availableLocales` defines the locale contract first. `defaultLocale`,
 * `fallbackLocale`, `messages`, and `loaders` are validated against that list.
 */
export type TranslationConfigOptions<
  TLocales extends readonly string[],
  TMessages extends Partial<Record<TLocales[number], TranslationMessages>>,
  TLoaders extends
    | Partial<Record<TLocales[number], TranslationLoader<unknown>>>
    | undefined = undefined,
  TDefaultLocale extends TLocales[number] = TLocales[number],
> = {
  availableLocales: TLocales;
  defaultLocale: TDefaultLocale;
  fallbackLocale?: TLocales[number];
  messages: TMessages & Record<TDefaultLocale, TranslationMessages>;
  loaders?: TLoaders;
};

export type AnyConfiguredTranslator = ConfiguredTranslator<
  string,
  TranslationMessages
>;

export type InternalTranslationNode =
  | string
  | undefined
  | { readonly [key: string]: InternalTranslationNode };

export type InternalTranslationMessages = {
  readonly [key: string]: InternalTranslationNode;
};

export type RuntimeConfigInput =
  | Record<string, TranslationMessages>
  | TranslationConfigOptions<
      readonly string[],
      Partial<Record<string, TranslationMessages>>,
      Partial<Record<string, TranslationLoader<unknown>>> | undefined,
      string
    >;

export interface InternalNormalizedConfig {
  defaultLocale: string;
  fallbackLocale: string;
  supportedLocales: readonly string[];
  messages: Partial<Record<string, InternalTranslationMessages>>;
  loaders: Partial<Record<string, TranslationLoader<unknown>>>;
}

export interface GlobalStore {
  translator?: AnyConfiguredTranslator;
}

export type CachedMessages<
  TLocale extends string,
  TSourceMessages extends TranslationMessages,
> = Readonly<
  Partial<Record<TLocale, DeepPartialMessages<TSourceMessages> | TSourceMessages>>
>;

export type ShortFormTranslator<TMessages extends Record<string, TranslationMessages>> =
  ConfiguredTranslator<
    Extract<keyof TMessages, string>,
    MergeUnion<TMessages[keyof TMessages & string]> & TranslationMessages
  >;

export type OptionsFormTranslator<
  TLocales extends readonly string[],
  TMessages extends Partial<Record<TLocales[number], TranslationMessages>>,
  TDefaultLocale extends TLocales[number],
> = ConfiguredTranslator<
  TLocales[number],
  Extract<TMessages[TDefaultLocale], TranslationMessages>
>;
