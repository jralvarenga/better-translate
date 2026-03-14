import { resolveMessageValue } from "./resolve-message-value.js";
import { snapshotMessages } from "./snapshot-messages.js";
import { isTranslationMessages } from "./validation.js";
import type {
  CachedMessages,
  ConfiguredTranslator,
  DeepPartialMessages,
  InternalNormalizedConfig,
  InternalTranslationMessages,
  TranslateOptions,
  TranslationLoader,
  TranslationKey,
  TranslationMessages,
} from "./types.js";

/**
 * Creates the configured translator instance from normalized runtime config.
 *
 * The translator handles locale fallback, lazy loader execution, loader result
 * caching, and the final `t(...)` lookup behavior.
 */
export function createConfiguredTranslator<
  TLocale extends string,
  TSourceMessages extends TranslationMessages,
>(
  config: InternalNormalizedConfig,
): ConfiguredTranslator<TLocale, TSourceMessages> {
  const messageCache = {
    ...config.messages,
  } as Partial<Record<TLocale, InternalTranslationMessages>>;
  const loaders = config.loaders as Partial<Record<TLocale, TranslationLoader<unknown>>>;
  const loadPromises = new Map<
    TLocale,
    Promise<DeepPartialMessages<TSourceMessages> | TSourceMessages | undefined>
  >();

  const loadLocale: ConfiguredTranslator<TLocale, TSourceMessages>["loadLocale"] =
    async (locale) => {
      const cachedMessages = messageCache[locale];

      if (cachedMessages) {
        return cachedMessages as DeepPartialMessages<TSourceMessages> | TSourceMessages;
      }

      const existingPromise = loadPromises.get(locale);
      if (existingPromise) {
        return existingPromise;
      }

      const loader = loaders[locale];
      if (!loader) {
        return undefined;
      }

      const pendingLoad = Promise.resolve(loader()).then((loadedMessages) => {
        if (!isTranslationMessages(loadedMessages)) {
          throw new Error(
            `Locale "${locale}" did not resolve to a valid translation object.`,
          );
        }

        messageCache[locale] = loadedMessages;
        return loadedMessages as DeepPartialMessages<TSourceMessages> | TSourceMessages;
      });

      loadPromises.set(locale, pendingLoad);

      try {
        return await pendingLoad;
      } finally {
        loadPromises.delete(locale);
      }
    };

  return {
    defaultLocale: config.defaultLocale as TLocale,
    fallbackLocale: config.fallbackLocale as TLocale,
    supportedLocales: [...config.supportedLocales] as unknown as readonly TLocale[],
    t<TKey extends TranslationKey<TSourceMessages>>(
      key: TKey,
      options?: TranslateOptions<TLocale>,
    ) {
      const locale = options?.locale ?? (config.defaultLocale as TLocale);
      const activeValue = resolveMessageValue(messageCache[locale], key);

      if (typeof activeValue === "string") {
        return activeValue;
      }

      const fallbackValue = resolveMessageValue(
        messageCache[config.fallbackLocale as TLocale],
        key,
      );

      if (typeof fallbackValue === "string") {
        return fallbackValue;
      }

      return key;
    },
    loadLocale,
    getSupportedLocales() {
      return [...config.supportedLocales] as unknown as readonly TLocale[];
    },
    getMessages(): CachedMessages<TLocale, TSourceMessages> {
      return snapshotMessages<TLocale, TSourceMessages>(messageCache);
    },
  };
}
