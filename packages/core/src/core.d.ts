import type {
  AnyConfiguredTranslator,
  AnyTranslationHelpers,
  BtTranslateOptions,
  CachedMessages,
  ConfiguredTranslator,
  DeepPartialMessages,
  OptionsFormTranslator,
  ShortFormTranslator,
  StrictTranslationLocaleMap,
  TranslateOptions,
  TranslationConfigOptions,
  TranslationHelpers,
  TranslationLanguageMetadata,
  TranslationJsonSchema,
  TranslationLoader,
  TranslationMessages,
} from "./types.js";

export type {
  BtTranslateCall,
  BtTranslateOptions,
  AnyTranslationHelpers,
  CachedMessages,
  ConfiguredTranslator,
  DeepPartialMessages,
  DeepStringify,
  DotKeys,
  TranslateCall,
  TranslateFunction,
  TranslationHelpers,
  TranslationKey,
  TranslationConfig,
  TranslationParamValue,
  TranslationParams,
  TranslationParamsForKey,
  TranslationPlaceholderNames,
  TranslationDirection,
  TranslationDirectionOptions,
  TranslationLanguageMetadata,
  TranslationValueAtKey,
  TranslateOptions,
  StrictTranslationLocaleMap,
  TranslationJsonSchema,
  TranslationJsonSchemaNode,
  TranslationJsonObjectSchema,
  TranslationJsonStringSchema,
  TranslationKeysWithOptionalParams,
  TranslationKeysWithRequiredParams,
  TranslationLocaleMap,
  TranslationConfigOptions,
  TranslationLeaf,
  TranslationLoader,
  TranslationMessages,
} from "./types.js";

export declare function configureTranslations<
  const TMessages extends Record<string, TranslationMessages>,
>(
  messages: StrictTranslationLocaleMap<TMessages>,
): Promise<ShortFormTranslator<TMessages>>;

export declare function configureTranslations<
  const TLocales extends readonly string[],
  const TMessages extends Partial<
    Record<TLocales[number], TranslationMessages>
  >,
  const TLoaders extends
    | Partial<Record<TLocales[number], TranslationLoader<unknown>>>
    | undefined = undefined,
  const TDefaultLocale extends TLocales[number] = TLocales[number],
>(
  config: TranslationConfigOptions<
    TLocales,
    TMessages,
    TLoaders,
    TDefaultLocale
  >,
): Promise<OptionsFormTranslator<TLocales, TMessages, TDefaultLocale>>;

export declare function configureTranslations(
  config:
    | Record<string, TranslationMessages>
    | TranslationConfigOptions<
        readonly string[],
        Partial<Record<string, TranslationMessages>>,
        Partial<Record<string, TranslationLoader<unknown>>> | undefined,
        string
      >,
): Promise<AnyConfiguredTranslator>;

export declare function createTranslationHelpers<
  TLocale extends string,
  TSourceMessages extends TranslationMessages,
>(
  translator: ConfiguredTranslator<TLocale, TSourceMessages>,
): TranslationHelpers<TLocale, TSourceMessages>;

export declare function createTranslationHelpers<
  const TMessages extends Record<string, TranslationMessages>,
>(
  messages: StrictTranslationLocaleMap<TMessages>,
): Promise<
  TranslationHelpers<
    Extract<keyof TMessages, string>,
    ShortFormTranslator<TMessages> extends ConfiguredTranslator<
      any,
      infer TSourceMessages
    >
      ? TSourceMessages
      : TranslationMessages
  >
>;

export declare function createTranslationHelpers<
  const TLocales extends readonly string[],
  const TMessages extends Partial<
    Record<TLocales[number], TranslationMessages>
  >,
  const TLoaders extends
    | Partial<Record<TLocales[number], TranslationLoader<unknown>>>
    | undefined = undefined,
  const TDefaultLocale extends TLocales[number] = TLocales[number],
>(
  config: TranslationConfigOptions<
    TLocales,
    TMessages,
    TLoaders,
    TDefaultLocale
  >,
): Promise<
  TranslationHelpers<
    TLocales[number],
    Extract<TMessages[TDefaultLocale], TranslationMessages>
  >
>;

export declare function createTranslationJsonSchema(
  messages: TranslationMessages,
): TranslationJsonSchema;

export declare function getTranslator(): AnyConfiguredTranslator;

export declare function t(key: string, options: BtTranslateOptions): string;

export declare function t(
  key: string,
  options?: TranslateOptions<string>,
): string;

export declare function loadLocale(
  locale: string,
): Promise<
  DeepPartialMessages<TranslationMessages> | TranslationMessages | undefined
>;

export declare function getSupportedLocales(): readonly string[];

export declare function getAvailableLanguages(): readonly TranslationLanguageMetadata<string>[];

export declare function getMessages(): CachedMessages<
  string,
  TranslationMessages
>;

export declare function resetTranslationsForTests(): void;
