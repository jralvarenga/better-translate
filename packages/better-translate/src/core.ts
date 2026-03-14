import { createTranslationJsonSchema } from "./create-translation-json-schema.js";
import { createConfiguredTranslator } from "./create-configured-translator.js";
import { getGlobalStore } from "./global-store.js";
import { normalizeConfig } from "./normalize-config.js";
import type {
  AnyConfiguredTranslator,
  ConfiguredTranslator,
  OptionsFormTranslator,
  RuntimeConfigInput,
  ShortFormTranslator,
  StrictTranslationLocaleMap,
  TranslateOptions,
  TranslationKey,
  TranslationConfigOptions,
  TranslationLoader,
  TranslationMessages,
} from "./types.js";

export type {
  CachedMessages,
  ConfiguredTranslator,
  DeepPartialMessages,
  DeepStringify,
  DotKeys,
  TranslationKey,
  TranslateOptions,
  StrictTranslationLocaleMap,
  TranslationJsonSchema,
  TranslationJsonSchemaNode,
  TranslationJsonObjectSchema,
  TranslationJsonStringSchema,
  TranslationLocaleMap,
  TranslationConfigOptions,
  TranslationLeaf,
  TranslationLoader,
  TranslationMessages,
} from "./types.js";

export interface BetterTranslateAppConfig {}

export type RegisteredLocale = BetterTranslateAppConfig extends {
  Locale: infer TLocale extends string;
}
  ? TLocale
  : string;

export type RegisteredMessages = BetterTranslateAppConfig extends {
  Messages: infer TMessages extends TranslationMessages;
}
  ? TMessages
  : TranslationMessages;

/**
 * Configures Better Translate using the short locale-map form.
 *
 * The first locale in the map becomes the default and fallback locale.
 */
export async function configureTranslations<
  const TMessages extends Record<string, TranslationMessages>,
>(messages: StrictTranslationLocaleMap<TMessages>): Promise<ShortFormTranslator<TMessages>>;

/**
 * Configures Better Translate for the current TypeScript project.
 *
 * This overload is the main entrypoint for scalable setups. It registers the
 * locale contract globally, stores the provided messages and loaders, and
 * returns a typed translator instance bound to that configuration.
 */
export async function configureTranslations<
  const TLocales extends readonly string[],
  const TMessages extends Partial<Record<TLocales[number], TranslationMessages>>,
  const TLoaders extends
    | Partial<Record<TLocales[number], TranslationLoader<unknown>>>
    | undefined = undefined,
  const TDefaultLocale extends TLocales[number] = TLocales[number],
>(
  config: TranslationConfigOptions<TLocales, TMessages, TLoaders, TDefaultLocale>,
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
 * Returns the globally configured translator.
 *
 * Throws when translations have not been configured yet.
 */
export function getTranslator(): ConfiguredTranslator<
  RegisteredLocale,
  RegisteredMessages
> {
  const translator = getGlobalStore().translator;

  if (!translator) {
    throw new Error(
      'Translations have not been configured. Call configureTranslations(...) before using "t(...)".',
    );
  }

  return translator as ConfiguredTranslator<RegisteredLocale, RegisteredMessages>;
}

/**
 * Translates a key using the globally configured translator.
 *
 * This is the top-level convenience helper for projects that configure Better
 * Translate once and then translate from shared global state.
 */
export function t<TKey extends TranslationKey<RegisteredMessages>>(
  key: TKey,
  options?: TranslateOptions<RegisteredLocale>,
): string {
  return getTranslator().t(key, options);
}

/**
 * Loads a locale through the global translator.
 *
 * When the locale is backed by an async loader, the result is cached after the
 * first successful load.
 */
export async function loadLocale(locale: RegisteredLocale) {
  return getTranslator().loadLocale(locale);
}

/**
 * Returns the locales declared on the global translator configuration.
 */
export function getSupportedLocales(): readonly RegisteredLocale[] {
  return getTranslator().getSupportedLocales();
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
