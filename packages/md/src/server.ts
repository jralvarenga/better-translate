import { cache } from "react";

import type {
  ConfiguredTranslator,
  TranslationMessages,
} from "@better-translate/core";
import {
  getRequestLocale as getStoredRequestLocale,
  resolveRequestLocale,
} from "@better-translate/core/server";

import { createMarkdownCollection } from "./collection.js";
import type {
  CompiledMarkdownResult,
  InferLocale,
  LocalizedMarkdownDocument,
  MarkdownCollection,
  MarkdownDirectionOptions,
  MarkdownDocumentOptions,
  MarkdownHelpersOptions,
  MarkdownServerHelpers,
} from "./types.js";

type AnyTranslator = ConfiguredTranslator<any, TranslationMessages>;

type RequestConfig<
  TTranslator extends AnyTranslator,
  TLocale extends InferLocale<TTranslator> = InferLocale<TTranslator>,
> = {
  locale?: TLocale;
  translator: TTranslator;
};

type RequestConfigFactory<
  TTranslator extends AnyTranslator,
  TLocale extends InferLocale<TTranslator> = InferLocale<TTranslator>,
> = () =>
  | RequestConfig<TTranslator, TLocale>
  | Promise<RequestConfig<TTranslator, TLocale>>;

type AnyRequestConfig = RequestConfig<AnyTranslator>;

export function createMarkdownServerHelpers<
  TTranslator extends AnyTranslator,
  TLocale extends InferLocale<TTranslator> = InferLocale<TTranslator>,
>(
  requestConfig: RequestConfigFactory<TTranslator, TLocale>,
  options: MarkdownHelpersOptions,
): MarkdownServerHelpers<TLocale> {
  const readRequestConfig = cache(async () => {
    const resolved = await requestConfig();
    const translator = resolved.translator as TTranslator;

    return {
      locale: resolved.locale as TLocale | undefined,
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
    return (await readCollection()) as MarkdownCollection<TLocale>;
  }

  async function getResolvedLocale(
    options?:
      | MarkdownDocumentOptions<TLocale>
      | MarkdownDirectionOptions<TLocale>,
  ) {
    const { locale: configLocale, translator } = await readRequestConfig();
    const locale =
      options && "config" in options
        ? (options.config?.locale ?? options.locale)
        : options?.locale;

    return resolveRequestLocale(translator, {
      locale,
      requestLocale: getStoredRequestLocale(),
      configLocale,
    }) as TLocale;
  }

  async function getDirection(options?: MarkdownDirectionOptions<TLocale>) {
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

  async function isRtl(options?: MarkdownDirectionOptions<TLocale>) {
    return (await getDirection(options)) === "rtl";
  }

  async function getDocument(
    documentId: string,
    requestOptions?: MarkdownDocumentOptions<TLocale>,
  ): Promise<LocalizedMarkdownDocument<TLocale>> {
    const [locale, collection] = await Promise.all([
      getResolvedLocale(requestOptions),
      readCollection(),
    ]);

    return collection.getDocument(documentId, {
      locale,
    });
  }

  async function compileDocument(
    documentId: string,
    requestOptions?: MarkdownDocumentOptions<TLocale>,
  ): Promise<CompiledMarkdownResult<TLocale>>;
  async function compileDocument(
    document: LocalizedMarkdownDocument<TLocale>,
  ): Promise<CompiledMarkdownResult<TLocale>>;
  async function compileDocument(
    documentOrId: string | LocalizedMarkdownDocument<TLocale>,
    requestOptions?: MarkdownDocumentOptions<TLocale>,
  ): Promise<CompiledMarkdownResult<TLocale>> {
    if (typeof documentOrId !== "string") {
      return (await readCollection()).compileDocument(documentOrId);
    }

    const [locale, collection] = await Promise.all([
      getResolvedLocale(requestOptions),
      readCollection(),
    ]);

    return collection.compileDocument(documentOrId, {
      locale,
    });
  }

  return {
    compileDocument,
    getCollection,
    async getAvailableLanguages() {
      return (await readRequestConfig()).translator.getAvailableLanguages();
    },
    getDirection,
    getDocument,
    isRtl,
  };
}

export type { RequestConfig, RequestConfigFactory };
