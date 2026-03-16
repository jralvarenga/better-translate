import { cache } from "react";

import type {
  ConfiguredTranslator,
  DeepPartialMessages,
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

type InferResolvedRequestConfig<TFactory extends (...args: any) => any> = Awaited<
  ReturnType<TFactory>
>;

type InferFactoryTranslator<TFactory extends (...args: any) => any> =
  InferResolvedRequestConfig<TFactory> extends BetterTranslateRequestConfig<
    infer TTranslator,
    infer _TLocale
  >
    ? TTranslator
    : never;

type InferFactoryLocale<TFactory extends (...args: any) => any> =
  InferFactoryTranslator<TFactory> extends AnyTranslator
    ? InferTranslatorLocale<InferFactoryTranslator<TFactory>>
    : never;

export interface ServerHelpers<
  TRequestLocale extends string,
  TTranslator extends AnyTranslator,
> {
  getLocale(): Promise<TRequestLocale>;
  getMessages(): Promise<
    DeepPartialMessages<InferTranslatorMessages<TTranslator>> |
      InferTranslatorMessages<TTranslator>
  >;
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
  TFactory extends () => AnyRequestConfig | Promise<AnyRequestConfig>,
>(
  requestConfig: TFactory,
): ServerHelpers<InferFactoryLocale<TFactory>, InferFactoryTranslator<TFactory>> {
  const readRequestConfig = cache(async () => {
    const resolved = await requestConfig();
    const translator = resolved.translator as InferFactoryTranslator<TFactory>;

    return {
      locale: resolved.locale as InferFactoryLocale<TFactory> | undefined,
      translator,
    };
  });

  async function getResolvedLocale(
    options?: {
      locale?: InferFactoryLocale<TFactory>;
    },
  ) {
    const { locale: configLocale, translator } = await readRequestConfig();

    return resolveRequestLocale(translator, {
      locale: options?.locale,
      requestLocale: getStoredRequestLocale(),
      configLocale,
    }) as InferFactoryLocale<TFactory>;
  }

  return {
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
          | DeepPartialMessages<InferTranslatorMessages<InferFactoryTranslator<TFactory>>>
          | InferTranslatorMessages<InferFactoryTranslator<TFactory>>;
      }

      if (cachedMessages) {
        return cachedMessages as
          | DeepPartialMessages<InferTranslatorMessages<InferFactoryTranslator<TFactory>>>
          | InferTranslatorMessages<InferFactoryTranslator<TFactory>>;
      }

      throw new Error(
        `Locale "${locale}" messages are not available. Preload them or register a loader in your Better Translate core config.`,
      );
    },
    async getTranslations(options) {
      const [{ translator }, locale] = await Promise.all([
        readRequestConfig(),
        getResolvedLocale(options),
      ]);

      await translator.loadLocale(locale);

      return ((...args: Parameters<InferFactoryTranslator<TFactory>["t"]>) => {
        const [key, translateOptions] = args;

        return translator.t(key as never, {
          ...(translateOptions ?? {}),
          locale,
        } as never);
      }) as InferFactoryTranslator<TFactory>["t"];
    },
    async getTranslator() {
      return (await readRequestConfig()).translator;
    },
  };
}
