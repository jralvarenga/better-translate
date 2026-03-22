import { interpolateMessage } from "./interpolate-message.js";
import { resolveMessageValue } from "./resolve-message-value.js";
import { snapshotLanguages } from "./snapshot-languages.js";
import { snapshotMessages } from "./snapshot-messages.js";
import { isTranslationMessages } from "./validation.js";
import type {
  CachedMessages,
  ConfiguredTranslator,
  DeepPartialMessages,
  InternalNormalizedConfig,
  InternalTranslationMessages,
  TranslationDirection,
  TranslationDirectionOptions,
  TranslationLanguageMetadata,
  TranslateCall,
  TranslationKey,
  TranslateOptions,
  TranslationLoader,
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
  const loaders = config.loaders as Partial<
    Record<TLocale, TranslationLoader<unknown>>
  >;
  const availableLanguages =
    config.languages as readonly TranslationLanguageMetadata<TLocale>[];
  const loadPromises = new Map<
    TLocale,
    Promise<DeepPartialMessages<TSourceMessages> | TSourceMessages | undefined>
  >();

  function resolveLocale(
    options?: TranslateOptions<TLocale> | TranslationDirectionOptions<TLocale>,
  ): TLocale {
    return (
      options?.config?.locale ??
      options?.locale ??
      (config.defaultLocale as TLocale)
    );
  }

  function resolveDirection(
    options?: TranslationDirectionOptions<TLocale>,
  ): TranslationDirection {
    if (typeof options?.config?.rtl === "boolean") {
      return options.config.rtl ? "rtl" : "ltr";
    }

    return config.directions[resolveLocale(options)] ?? "ltr";
  }

  const loadLocale: ConfiguredTranslator<
    TLocale,
    TSourceMessages
  >["loadLocale"] = async (locale) => {
    const cachedMessages = messageCache[locale];

    if (cachedMessages) {
      return cachedMessages as
        | DeepPartialMessages<TSourceMessages>
        | TSourceMessages;
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
      return loadedMessages as
        | DeepPartialMessages<TSourceMessages>
        | TSourceMessages;
    });

    loadPromises.set(locale, pendingLoad);

    try {
      return await pendingLoad;
    } finally {
      loadPromises.delete(locale);
    }
  };

  const translate = (<TKey extends TranslationKey<TSourceMessages>>(
    ...args: TranslateCall<TLocale, TSourceMessages, TKey>
  ) => {
    const [key, options] = args as unknown as [
      string,
      TranslateOptions<TLocale> | undefined,
    ];
    const locale = resolveLocale(options);
    const activeValue = resolveMessageValue(messageCache[locale], key);

    if (typeof activeValue === "string") {
      return interpolateMessage(activeValue, key, options?.params);
    }

    const fallbackValue = resolveMessageValue(
      messageCache[config.fallbackLocale as TLocale],
      key,
    );

    if (typeof fallbackValue === "string") {
      return interpolateMessage(fallbackValue, key, options?.params);
    }

    return key;
  }) as ConfiguredTranslator<TLocale, TSourceMessages>["t"];

  return {
    defaultLocale: config.defaultLocale as TLocale,
    fallbackLocale: config.fallbackLocale as TLocale,
    supportedLocales: [
      ...config.supportedLocales,
    ] as unknown as readonly TLocale[],
    getDirection(options) {
      return resolveDirection(options);
    },
    isRtl(options) {
      return resolveDirection(options) === "rtl";
    },
    t: translate,
    loadLocale,
    getSupportedLocales() {
      return [...config.supportedLocales] as unknown as readonly TLocale[];
    },
    getAvailableLanguages() {
      return snapshotLanguages(availableLanguages);
    },
    getMessages(): CachedMessages<TLocale, TSourceMessages> {
      return snapshotMessages<TLocale, TSourceMessages>(messageCache);
    },
  };
}
