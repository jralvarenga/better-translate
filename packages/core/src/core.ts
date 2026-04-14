import { createTranslationJsonSchema } from "./create-translation-json-schema.js";
import { createConfiguredTranslator } from "./create-configured-translator.js";
import { getGlobalStore } from "./global-store.js";
import { normalizeConfig } from "./normalize-config.js";
import type {
  AnyTranslationHelpers,
  AnyConfiguredTranslator,
  BtTranslateOptions,
  ConfiguredTranslator,
  OptionsFormTranslator,
  RuntimeConfigInput,
  ShortFormTranslator,
  StrictTranslationLocaleMap,
  TranslateOptions,
  TranslationHelpers,
  TranslationLanguageMetadata,
  TranslationConfigOptions,
  TranslationLoader,
  TranslationMessages,
} from "./types.js";

export type {
  BtTranslateCall,
  BtTranslateOptions,
  CachedMessages,
  ConfiguredTranslator,
  DeepPartialMessages,
  DeepStringify,
  DotKeys,
  TranslationHelpers,
  TranslateCall,
  TranslateFunction,
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
  AnyTranslationHelpers,
  TranslationLeaf,
  TranslationLoader,
  TranslationMessages,
} from "./types.js";

export const SUPPORTED_LOCALE_ROUTE_SYNTAXES = [
  "locale",
  "lang",
  "language",
  "intl",
  "i18n",
  "l10n",
  "localization",
] as const;

export type SupportedLocaleRouteSyntax =
  (typeof SUPPORTED_LOCALE_ROUTE_SYNTAXES)[number];

/**
 * Configures Better Translate using the short locale-map form.
 *
 * The first locale in the map becomes the default and fallback locale.
 */
export async function configureTranslations<
  const TMessages extends Record<string, TranslationMessages>,
>(
  messages: StrictTranslationLocaleMap<TMessages>,
): Promise<ShortFormTranslator<TMessages>>;

/**
 * Configures Better Translate for the current TypeScript project.
 *
 * This overload is the main entrypoint for scalable setups. It registers the
 * locale contract globally, stores the provided messages and loaders, and
 * returns a typed translator instance bound to that configuration.
 */
export async function configureTranslations<
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

/**
 * Configures Better Translate using either a short locale-map form or the full
 * options object, then stores the resulting translator in the global registry.
 */
export async function configureTranslations(
  config: RuntimeConfigInput,
): Promise<AnyConfiguredTranslator> {
  const normalizedConfig = normalizeConfig(config);
  const translator = createConfiguredTranslator(normalizedConfig);

  getGlobalStore().translator = translator;

  return translator;
}

/**
 * Binds typed helper functions to a configured translator instance.
 *
 * Apps can create one setup module and re-export these helpers anywhere they
 * want strongly typed access without ambient declarations.
 */
export function createTranslationHelpers<
  TLocale extends string,
  TSourceMessages extends TranslationMessages,
>(
  translator: ConfiguredTranslator<TLocale, TSourceMessages>,
): TranslationHelpers<TLocale, TSourceMessages>;
export function createTranslationHelpers<
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
export function createTranslationHelpers<
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
export function createTranslationHelpers(
  input: AnyConfiguredTranslator | RuntimeConfigInput,
): AnyTranslationHelpers | Promise<AnyTranslationHelpers> {
  if (
    "t" in input &&
    "getMessages" in input &&
    "getSupportedLocales" in input
  ) {
    const translator = input as AnyConfiguredTranslator;

    return {
      translator,
      t: translator.t,
      loadLocale(locale) {
        return translator.loadLocale(locale);
      },
      getSupportedLocales() {
        return translator.getSupportedLocales();
      },
      getAvailableLanguages() {
        return translator.getAvailableLanguages();
      },
      getDirection(options) {
        return translator.getDirection(options);
      },
      isRtl(options) {
        return translator.isRtl(options);
      },
      getMessages() {
        return translator.getMessages();
      },
    };
  }

  return configureTranslations(input).then((translator) =>
    createTranslationHelpers(translator),
  );
}

/**
 * Returns the globally configured translator.
 *
 * Throws when translations have not been configured yet.
 */
export function getTranslator(): AnyConfiguredTranslator {
  const translator = getGlobalStore().translator;

  if (!translator) {
    throw new Error(
      'Translations have not been configured. Call configureTranslations(...) before using "t(...)".',
    );
  }

  return translator;
}

/**
 * Translates a key using the globally configured translator.
 *
 * This is the top-level convenience helper for projects that configure Better
 * Translate once and then translate from shared global state.
 */
export function t(key: string, options: BtTranslateOptions): string;
export function t(key: string, options?: TranslateOptions<string>): string;
export function t(
  key: string,
  options?: BtTranslateOptions | TranslateOptions<string>,
): string {
  if ((options as { bt?: boolean } | undefined)?.bt === true) {
    return key;
  }

  return (
    getTranslator() as {
      t(key: string, options?: TranslateOptions<string>): string;
    }
  ).t(key, options);
}

/**
 * Loads a locale through the global translator.
 *
 * When the locale is backed by an async loader, the result is cached after the
 * first successful load.
 */
export async function loadLocale(locale: string) {
  return getTranslator().loadLocale(locale);
}

/**
 * Returns the locales declared on the global translator configuration.
 */
export function getSupportedLocales(): readonly string[] {
  return getTranslator().getSupportedLocales();
}

/**
 * Returns the configured language metadata for the global translator.
 */
export function getAvailableLanguages(): readonly TranslationLanguageMetadata<string>[] {
  return getTranslator().getAvailableLanguages();
}

/**
 * Returns the cached messages from the globally configured translator.
 *
 * This includes any messages passed at configuration time and any locales that
 * have been loaded later through async loaders.
 */
export function getMessages() {
  return getTranslator().getMessages();
}

/**
 * Creates a JSON Schema document from a source locale object.
 *
 * The generated schema requires the same nested keys and string leaves as the
 * provided source messages, which makes it suitable for validating other
 * locale JSON files in editors and tooling.
 */
export { createTranslationJsonSchema };

/**
 * Clears the global translator registry.
 *
 * This is intended for tests so each test case can start from a clean state.
 */
export function resetTranslationsForTests(): void {
  getGlobalStore().translator = undefined;
}
