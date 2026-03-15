import { cache } from "react";

import type {
  ConfiguredTranslator,
  DeepPartialMessages,
  TranslationMessages,
} from "better-translate/core";

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
  locale: TLocale;
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
  InferResolvedRequestConfig<TFactory> extends BetterTranslateRequestConfig<
    infer TTranslator,
    infer TLocale
  >
    ? TLocale extends InferTranslatorLocale<TTranslator>
      ? TLocale
      : never
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
  TLocale extends InferTranslatorLocale<TTranslator>,
>(
  factory: RequestConfigFactory<TTranslator, TLocale>,
): RequestConfigFactory<TTranslator, TLocale> {
  return factory;
}

export function createServerHelpers<
  TFactory extends () => AnyRequestConfig | Promise<AnyRequestConfig>,
>(
  requestConfig: TFactory,
): ServerHelpers<InferFactoryLocale<TFactory>, InferFactoryTranslator<TFactory>> {
  const readRequestConfig = cache(async () => {
    const resolved = await requestConfig();
    const locale = resolved.locale as InferFactoryLocale<TFactory>;
    const translator = resolved.translator as InferFactoryTranslator<TFactory>;

    if (!translator.getSupportedLocales().includes(locale)) {
      throw new Error(
        `The resolved locale "${locale}" is not included in the translator's supported locales.`,
      );
    }

    return {
      locale,
      translator,
    };
  });

  return {
    async getLocale() {
      return (await readRequestConfig()).locale;
    },
    async getMessages() {
      const { locale, translator } = await readRequestConfig();
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
      const { locale: requestLocale, translator } = await readRequestConfig();
      const locale = (options?.locale ?? requestLocale) as InferFactoryLocale<TFactory>;

      if (!translator.getSupportedLocales().includes(locale)) {
        throw new Error(
          `The locale "${locale}" is not included in the translator's supported locales.`,
        );
      }

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
