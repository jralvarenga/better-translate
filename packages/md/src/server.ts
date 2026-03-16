import { cache } from "react";

import type {
  ConfiguredTranslator,
  TranslationMessages,
} from "better-translate/core";

import { createMarkdownCollection } from "./collection.js";
import type {
  AnyBetterTranslateTranslator,
  CompiledMarkdownResult,
  InferLocale,
  LocalizedMarkdownDocument,
  MarkdownCollection,
  MarkdownDocumentOptions,
  MarkdownHelpersOptions,
  MarkdownServerHelpers,
} from "./types.js";

type AnyTranslator = ConfiguredTranslator<any, TranslationMessages>;

type RequestConfig<
  TTranslator extends AnyTranslator,
  TLocale extends InferLocale<TTranslator> = InferLocale<TTranslator>,
> = {
  locale: TLocale;
  translator: TTranslator;
};

type RequestConfigFactory<
  TTranslator extends AnyTranslator,
  TLocale extends InferLocale<TTranslator> = InferLocale<TTranslator>,
> = () =>
  | RequestConfig<TTranslator, TLocale>
  | Promise<RequestConfig<TTranslator, TLocale>>;

type AnyRequestConfig = RequestConfig<AnyTranslator>;

type InferResolvedRequestConfig<TFactory extends (...args: any) => any> = Awaited<
  ReturnType<TFactory>
>;

type InferFactoryTranslator<TFactory extends (...args: any) => any> =
  InferResolvedRequestConfig<TFactory> extends RequestConfig<
    infer TTranslator,
    infer _TLocale
  >
    ? TTranslator
    : never;

type InferFactoryLocale<TFactory extends (...args: any) => any> =
  InferResolvedRequestConfig<TFactory> extends RequestConfig<
    infer TTranslator,
    infer TLocale
  >
    ? TLocale extends InferLocale<TTranslator>
      ? TLocale
      : never
    : never;

type InferServerLocale<TFactory extends (...args: any) => any> = InferLocale<
  InferFactoryTranslator<TFactory>
>;

export function createMarkdownServerHelpers<
  TFactory extends () => AnyRequestConfig | Promise<AnyRequestConfig>,
>(
  requestConfig: TFactory,
  options: MarkdownHelpersOptions,
): MarkdownServerHelpers<InferServerLocale<TFactory>> {
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

  const readCollection = cache(async () => {
    const { translator } = await readRequestConfig();

    return createMarkdownCollection({
      ...options,
      translator,
    });
  });

  async function getCollection() {
    return (await readCollection()) as MarkdownCollection<
      InferServerLocale<TFactory>
    >;
  }

  async function getDocument(
    documentId: string,
    requestOptions?: MarkdownDocumentOptions<InferServerLocale<TFactory>>,
  ): Promise<LocalizedMarkdownDocument<InferServerLocale<TFactory>>> {
    const [{ locale: requestLocale }, collection] = await Promise.all([
      readRequestConfig(),
      readCollection(),
    ]);
    const locale = (requestOptions?.locale ??
      requestLocale) as InferServerLocale<TFactory>;

    return collection.getDocument(documentId, {
      locale,
    });
  }

  async function compileDocument(
    documentId: string,
    requestOptions?: MarkdownDocumentOptions<InferServerLocale<TFactory>>,
  ): Promise<CompiledMarkdownResult<InferServerLocale<TFactory>>>;
  async function compileDocument(
    document: LocalizedMarkdownDocument<InferServerLocale<TFactory>>,
  ): Promise<CompiledMarkdownResult<InferServerLocale<TFactory>>>;
  async function compileDocument(
    documentOrId:
      | string
      | LocalizedMarkdownDocument<InferServerLocale<TFactory>>,
    requestOptions?: MarkdownDocumentOptions<InferServerLocale<TFactory>>,
  ): Promise<CompiledMarkdownResult<InferServerLocale<TFactory>>> {
    if (typeof documentOrId !== "string") {
      return (await readCollection()).compileDocument(documentOrId);
    }

    const [{ locale: requestLocale }, collection] = await Promise.all([
      readRequestConfig(),
      readCollection(),
    ]);
    const locale = (requestOptions?.locale ??
      requestLocale) as InferServerLocale<TFactory>;

    return collection.compileDocument(documentOrId, {
      locale,
    });
  }

  return {
    compileDocument,
    getCollection,
    getDocument,
  };
}

export type { RequestConfig, RequestConfigFactory };
