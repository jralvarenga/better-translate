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

type AllTrue<T> = false extends T ? false : true;

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

type AsTranslationMessages<TMessages> =
  TMessages extends TranslationMessages ? TMessages : never;

export type DeepPartialMessages<TMessages> = {
  [K in keyof TMessages]?: TMessages[K] extends string
    ? string
    : TMessages[K] extends TranslationMessages
      ? DeepPartialMessages<TMessages[K]>
      : never;
};

export type DeepStringify<TMessages> = {
  [K in keyof TMessages]: TMessages[K] extends string
    ? string
    : TMessages[K] extends TranslationMessages
      ? DeepStringify<TMessages[K]>
      : never;
};

export type DotKeys<TMessages, TPrefix extends string = ""> = {
  [K in keyof TMessages & string]: TMessages[K] extends string
    ? `${TPrefix}${K}`
    : TMessages[K] extends TranslationMessages
      ? DotKeys<TMessages[K], `${TPrefix}${K}.`>
      : never;
}[keyof TMessages & string];

type IsExactMessageShape<TReference, TCandidate> = [TReference] extends [string]
  ? [TCandidate] extends [string]
    ? true
    : false
  : [TReference] extends [TranslationMessages]
    ? [TCandidate] extends [TranslationMessages]
      ? Exclude<keyof TReference, keyof TCandidate> extends never
        ? Exclude<keyof TCandidate, keyof TReference> extends never
          ? AllTrue<
              {
                [K in keyof TReference]: IsExactMessageShape<
                  TReference[K],
                  K extends keyof TCandidate ? TCandidate[K] : never
                >;
              }[keyof TReference]
            >
          : false
        : false
      : false
    : false;

type ExactMessageShape<
  TReference,
  TCandidate extends TranslationMessages,
> = IsExactMessageShape<TReference, TCandidate> extends true ? TCandidate : never;

type EnforceLocaleMapShapeParity<
  TMessages extends Record<string, TranslationMessages>,
> = {
  [TLocale in keyof TMessages]: AllTrue<
    {
      [TOtherLocale in keyof TMessages]: IsExactMessageShape<
        TMessages[TOtherLocale],
        TMessages[TLocale]
      >;
    }[keyof TMessages]
  > extends true
    ? TMessages[TLocale]
    : never;
};

type EnforceReferenceMessageShape<
  TMessages extends Partial<Record<string, TranslationMessages>>,
  TReference extends TranslationMessages,
> = {
  [TLocale in keyof TMessages]: TMessages[TLocale] extends TranslationMessages
    ? ExactMessageShape<DeepStringify<TReference>, TMessages[TLocale]>
    : never;
};

type StrictOptionsMessages<
  TMessages extends Partial<Record<string, TranslationMessages>>,
  TDefaultLocale extends string,
> = TMessages[TDefaultLocale] extends TranslationMessages
  ? Simplify<
      TMessages &
        EnforceReferenceMessageShape<
          TMessages,
          Extract<TMessages[TDefaultLocale], TranslationMessages>
        >
    >
  : never;

export type TranslationKey<TMessages extends TranslationMessages> =
  string extends keyof TMessages ? string : DotKeys<TMessages>;

export type TranslationLocaleMap<
  TLocale extends string,
  TSourceMessages extends TranslationMessages,
> = Record<TLocale, DeepStringify<TSourceMessages>>;

export type TranslationParamValue = string | number | boolean;

export type TranslationParams = Record<string, TranslationParamValue>;

export type TranslationValueAtKey<
  TMessages extends TranslationMessages,
  TKey extends string,
> = TKey extends `${infer THead}.${infer TRest}`
  ? THead extends keyof TMessages
    ? TMessages[THead] extends TranslationMessages
      ? TranslationValueAtKey<TMessages[THead], TRest>
      : never
    : never
  : TKey extends keyof TMessages
    ? TMessages[TKey]
    : never;

type ExtractPlaceholderNames<TMessage extends string> = string extends TMessage
  ? string
  : TMessage extends `${string}{${infer TParam}}${infer TRest}`
    ? TParam | ExtractPlaceholderNames<TRest>
    : never;

type TranslationParamsObject<TParamNames extends string> = Simplify<{
  [TName in TParamNames]: TranslationParamValue;
}>;

export type TranslationPlaceholderNames<
  TMessages extends TranslationMessages,
  TKey extends string,
> = ExtractPlaceholderNames<
  Extract<TranslationValueAtKey<TMessages, TKey>, string>
>;

export type TranslationParamsForKey<
  TMessages extends TranslationMessages,
  TKey extends string,
> = string extends TranslationPlaceholderNames<TMessages, TKey>
  ? TranslationParams
  : TranslationParamsObject<TranslationPlaceholderNames<TMessages, TKey>>;

export type TranslationKeysWithRequiredParams<
  TMessages extends TranslationMessages,
> = TranslationKey<TMessages> extends infer TKey
  ? TKey extends string
    ? [TranslationPlaceholderNames<TMessages, TKey>] extends [never]
      ? never
      : string extends TranslationPlaceholderNames<TMessages, TKey>
        ? never
        : TKey
    : never
  : never;

export type TranslationKeysWithOptionalParams<
  TMessages extends TranslationMessages,
> = Exclude<
  TranslationKey<TMessages>,
  TranslationKeysWithRequiredParams<TMessages>
>;

export type TranslateOptionsForKey<
  TLocale extends string,
  TMessages extends TranslationMessages,
  TKey extends string,
> = [TranslationPlaceholderNames<TMessages, TKey>] extends [never]
  ? Simplify<TranslateOptions<TLocale> & { params?: never }>
  : string extends TranslationPlaceholderNames<TMessages, TKey>
    ? Simplify<TranslateOptions<TLocale> & { params?: TranslationParams }>
    : Simplify<Omit<TranslateOptions<TLocale>, "params"> & {
        params: TranslationParamsForKey<TMessages, TKey>;
      }>;

export type TranslateArgs<
  TLocale extends string,
  TMessages extends TranslationMessages,
  TKey extends string,
> = [TranslationPlaceholderNames<TMessages, TKey>] extends [never]
  ? [options?: TranslateOptionsForKey<TLocale, TMessages, TKey>]
  : string extends TranslationPlaceholderNames<TMessages, TKey>
    ? [options?: TranslateOptionsForKey<TLocale, TMessages, TKey>]
    : [options: TranslateOptionsForKey<TLocale, TMessages, TKey>];

export type TranslateCall<
  TLocale extends string,
  TMessages extends TranslationMessages,
  TKey extends TranslationKey<TMessages> = TranslationKey<TMessages>,
> = [key: TKey, ...args: TranslateArgs<TLocale, TMessages, TKey>];

export type TranslateFunction<
  TLocale extends string,
  TMessages extends TranslationMessages,
> = <TKey extends TranslationKey<TMessages>>(
  ...args: TranslateCall<TLocale, TMessages, TKey>
) => string;

export interface TranslationJsonStringSchema {
  type: "string";
}

export interface TranslationJsonObjectSchema {
  type: "object";
  additionalProperties: false;
  required: string[];
  properties: Record<string, TranslationJsonSchemaNode>;
}

export interface TranslationJsonSchema extends TranslationJsonObjectSchema {
  $schema: "https://json-schema.org/draft/2020-12/schema";
}

export type TranslationJsonSchemaNode =
  | TranslationJsonObjectSchema
  | TranslationJsonStringSchema;

/**
 * Optional overrides for a single translation lookup.
 */
export interface TranslateOptions<TLocale extends string> {
  /**
   * Uses a specific locale for this call instead of the configured default locale.
   */
  locale?: TLocale;
  /**
   * Replaces `{token}` placeholders found in the translation string.
   */
  params?: TranslationParams;
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
  t: TranslateFunction<TLocale, TSourceMessages>;
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
  messages: StrictOptionsMessages<TMessages, TDefaultLocale>;
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
    AsTranslationMessages<MergeUnion<TMessages[keyof TMessages & string]>>
  >;

export type StrictTranslationLocaleMap<
  TMessages extends Record<string, TranslationMessages>,
> = Simplify<TMessages & EnforceLocaleMapShapeParity<TMessages>>;

export type OptionsFormTranslator<
  TLocales extends readonly string[],
  TMessages extends Partial<Record<TLocales[number], TranslationMessages>>,
  TDefaultLocale extends TLocales[number],
> = ConfiguredTranslator<
  TLocales[number],
  Extract<TMessages[TDefaultLocale], TranslationMessages>
>;
