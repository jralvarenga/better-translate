import { cache } from "react";

import type {
  ConfiguredTranslator,
  DeepPartialMessages,
  TranslationConfig,
  TranslationDirection,
  TranslationLanguageMetadata,
  TranslationMessages,
} from "better-translate/core";
import {
  getRequestLocale as getStoredRequestLocale,
  resolveRequestLocale,
  setRequestLocale as setStoredRequestLocale,
} from "better-translate/server";

type AnyTranslator = ConfiguredTranslator<any, TranslationMessages>;

type InferTranslatorLocale<TTranslator> =
  TTranslator extends ConfiguredTranslator<infer TLocale, TranslationMessages>
    ? TLocale
    : never;

type InferTranslatorMessages<TTranslator> =
  TTranslator extends ConfiguredTranslator<string, infer TMessages>
    ? TMessages
    : TranslationMessages;

export interface BetterTranslateRequestConfig<
  TTranslator extends AnyTranslator,
  TLocale extends InferTranslatorLocale<TTranslator> = InferTranslatorLocale<TTranslator>,
> {
  locale?: TLocale;
  translator: TTranslator;
}

export type RequestConfigFactory<
  TTranslator extends AnyTranslator,
  TLocale extends InferTranslatorLocale<TTranslator> = InferTranslatorLocale<TTranslator>,
> = () =>
  | BetterTranslateRequestConfig<TTranslator, TLocale>
  | Promise<BetterTranslateRequestConfig<TTranslator, TLocale>>;

type AnyRequestConfig = BetterTranslateRequestConfig<AnyTranslator>;

type RequestDirectionOptions<TLocale extends string> = {
  locale?: TLocale;
  config?: TranslationConfig<TLocale>;
};

export interface ServerHelpers<
  TRequestLocale extends string,
  TTranslator extends AnyTranslator,
> {
  getAvailableLanguages(): Promise<
    readonly TranslationLanguageMetadata<InferTranslatorLocale<TTranslator>>[]
  >;
  getDirection(
    options?: RequestDirectionOptions<InferTranslatorLocale<TTranslator>>,
  ): Promise<TranslationDirection>;
  getLocale(): Promise<TRequestLocale>;
  getMessages(): Promise<
    DeepPartialMessages<InferTranslatorMessages<TTranslator>> |
      InferTranslatorMessages<TTranslator>
  >;
  isRtl(
    options?: RequestDirectionOptions<InferTranslatorLocale<TTranslator>>,
  ): Promise<boolean>;
  getTranslations(options?: {
    locale?: InferTranslatorLocale<TTranslator>;
  }): Promise<TTranslator["t"]>;
  getTranslator(): Promise<TTranslator>;
}

export function getRequestConfig<
  TTranslator extends AnyTranslator,
  TLocale extends InferTranslatorLocale<TTranslator> = InferTranslatorLocale<TTranslator>,
>(
  factory: RequestConfigFactory<TTranslator, TLocale>,
): RequestConfigFactory<TTranslator, TLocale> {
  return factory;
}

export function setRequestLocale<TLocale extends string>(
  locale: TLocale | undefined,
) {
  setStoredRequestLocale(locale);
}

export function createServerHelpers<
  TTranslator extends AnyTranslator,
  TLocale extends InferTranslatorLocale<TTranslator> = InferTranslatorLocale<TTranslator>,
>(
  requestConfig: RequestConfigFactory<TTranslator, TLocale>,
): ServerHelpers<TLocale, TTranslator> {
  const readRequestConfig = cache(async () => {
    const resolved = await requestConfig();
    const translator = resolved.translator as TTranslator;

    return {
      locale: resolved.locale as TLocale | undefined,
      translator,
    };
  });

  async function getResolvedLocale(
    options?: RequestDirectionOptions<TLocale>,
  ) {
    const { locale: configLocale, translator } = await readRequestConfig();

    return resolveRequestLocale(translator, {
      locale: options?.config?.locale ?? options?.locale,
      requestLocale: getStoredRequestLocale(),
      configLocale,
    }) as TLocale;
  }

  async function getDirection(
    options?: RequestDirectionOptions<TLocale>,
  ) {
    const [{ translator }, locale] = await Promise.all([
      readRequestConfig(),
      getResolvedLocale(options),
    ]);

    return translator.getDirection({
      config:
        typeof options?.config?.rtl === "boolean"
          ? {
              rtl: options.config.rtl,
            }
          : undefined,
      locale,
    });
  }

  async function isRtl(options?: RequestDirectionOptions<TLocale>) {
    return (await getDirection(options)) === "rtl";
  }

  return {
    async getAvailableLanguages() {
      return (await readRequestConfig()).translator.getAvailableLanguages();
    },
    getDirection,
    async getLocale() {
      return getResolvedLocale();
    },
    async getMessages() {
      const [{ translator }, locale] = await Promise.all([
        readRequestConfig(),
        getResolvedLocale(),
      ]);
      const loadedMessages = await translator.loadLocale(locale);
      const cachedMessages = translator.getMessages()[locale];

      if (loadedMessages) {
        return loadedMessages as
          | DeepPartialMessages<InferTranslatorMessages<TTranslator>>
          | InferTranslatorMessages<TTranslator>;
      }

      if (cachedMessages) {
        return cachedMessages as
          | DeepPartialMessages<InferTranslatorMessages<TTranslator>>
          | InferTranslatorMessages<TTranslator>;
      }

      throw new Error(
        `Locale "${locale}" messages are not available. Preload them or register a loader in your Better Translate core config.`,
      );
    },
    isRtl,
    async getTranslations(options) {
      const [{ translator }, locale] = await Promise.all([
        readRequestConfig(),
        getResolvedLocale(options),
      ]);

      await translator.loadLocale(locale);

      return ((...args: Parameters<TTranslator["t"]>) => {
        const [key, translateOptions] = args;

        return translator.t(key as never, {
          ...(translateOptions ?? {}),
          locale,
        } as never);
      }) as TTranslator["t"];
    },
    async getTranslator() {
      return (await readRequestConfig()).translator;
    },
  };
}
