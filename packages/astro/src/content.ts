import { getRequestLocale as getStoredRequestLocale, resolveRequestLocale } from "better-translate/server";

import type { TranslationMessages, ConfiguredTranslator } from "better-translate/core";

import { readRequestCached } from "./request-cache.js";
import type {
  InferTranslatorLocale,
  RequestConfigFactory,
} from "./server.js";

type AnyTranslator = ConfiguredTranslator<any, TranslationMessages>;

type InferEntryData<TEntry> = TEntry extends {
  data: infer TData;
}
  ? TData
  : never;

export interface ContentDocumentOptions<TLocale extends string> {
  locale?: TLocale;
}

export interface ContentCollectionOptions<
  TEntry extends {
    data: unknown;
    id: string;
  },
  TRenderedDocument,
> {
  collection: string;
  getCollection: (
    collection: string,
  ) => readonly TEntry[] | Promise<readonly TEntry[]>;
  getEntryId?: (entry: TEntry) => string;
  localizeId?: (locale: string, documentId: string) => string;
  render?: (
    entry: TEntry,
  ) => TRenderedDocument | Promise<TRenderedDocument>;
}

export interface LocalizedContentDocument<
  TLocale extends string,
  TEntry extends {
    data: unknown;
    id: string;
  },
> {
  data: InferEntryData<TEntry>;
  entry: TEntry;
  entryId: string;
  id: string;
  locale: TLocale;
  requestedLocale: TLocale;
  usedFallback: boolean;
}

export interface RenderedContentDocument<
  TLocale extends string,
  TEntry extends {
    data: unknown;
    id: string;
  },
  TRenderedDocument,
> extends LocalizedContentDocument<TLocale, TEntry> {
  rendered: TRenderedDocument;
}

export interface ContentCollectionHelpers<
  TLocale extends string,
  TEntry extends {
    data: unknown;
    id: string;
  },
  TRenderedDocument,
> {
  getCollection(): Promise<readonly TEntry[]>;
  getDocument(
    documentId: string,
    options?: ContentDocumentOptions<TLocale>,
  ): Promise<LocalizedContentDocument<TLocale, TEntry>>;
  listDocuments(): Promise<string[]>;
  renderDocument(
    documentId: string,
    options?: ContentDocumentOptions<TLocale>,
  ): Promise<RenderedContentDocument<TLocale, TEntry, TRenderedDocument>>;
  renderDocument(
    document: LocalizedContentDocument<TLocale, TEntry>,
  ): Promise<RenderedContentDocument<TLocale, TEntry, TRenderedDocument>>;
}

export class ContentDocumentNotFoundError extends Error {
  readonly fallbackLocale: string;
  readonly id: string;
  readonly lookedUpEntryIds: readonly string[];
  readonly requestedLocale: string;

  constructor(options: {
    fallbackLocale: string;
    id: string;
    lookedUpEntryIds: readonly string[];
    requestedLocale: string;
  }) {
    super(
      `Content document "${options.id}" was not found for locale "${options.requestedLocale}" or fallback locale "${options.fallbackLocale}".`,
    );

    this.name = "ContentDocumentNotFoundError";
    this.id = options.id;
    this.requestedLocale = options.requestedLocale;
    this.fallbackLocale = options.fallbackLocale;
    this.lookedUpEntryIds = options.lookedUpEntryIds;
  }
}

function normalizeDocumentId(documentId: string) {
  const normalizedDocumentId = documentId
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  if (
    !normalizedDocumentId ||
    normalizedDocumentId === "." ||
    normalizedDocumentId.startsWith("../") ||
    normalizedDocumentId.includes("/../")
  ) {
    throw new Error(
      `Content document id "${documentId}" cannot escape the configured collection root.`,
    );
  }

  return normalizedDocumentId;
}

function defaultLocalizeId(locale: string, documentId: string) {
  return `${locale}/${documentId}`;
}

export function createContentCollectionHelpers<
  TTranslator extends AnyTranslator,
  TLocale extends InferTranslatorLocale<TTranslator> = InferTranslatorLocale<TTranslator>,
  TEntry extends {
    data: unknown;
    id: string;
  } = {
    data: unknown;
    id: string;
  },
  TRenderedDocument = unknown,
>(
  requestConfig: RequestConfigFactory<TTranslator, TLocale>,
  options: ContentCollectionOptions<TEntry, TRenderedDocument>,
): ContentCollectionHelpers<TLocale, TEntry, TRenderedDocument> {
  const requestConfigCacheKey = Symbol(
    "better-translate-astro-content-request-config",
  );
  const collectionCacheKey = Symbol("better-translate-astro-content-collection");
  const getEntryId = options.getEntryId ?? ((entry: TEntry) => entry.id);
  const localizeId = options.localizeId ?? defaultLocalizeId;

  function readRequestConfig() {
    return readRequestCached(requestConfigCacheKey, async () => {
      const resolved = await requestConfig();
      const translator = resolved.translator as TTranslator;

      return {
        locale: resolved.locale as TLocale | undefined,
        translator,
      };
    });
  }

  function readCollection() {
    return readRequestCached(collectionCacheKey, async () => {
      const entries = await options.getCollection(options.collection);
      const entryMap = new Map<string, TEntry>();

      for (const entry of entries) {
        entryMap.set(getEntryId(entry), entry);
      }

      return {
        entries,
        entryMap,
      };
    });
  }

  async function getResolvedLocale(
    requestOptions?: ContentDocumentOptions<TLocale>,
  ) {
    const { locale: configLocale, translator } = await readRequestConfig();

    return resolveRequestLocale(translator, {
      locale: requestOptions?.locale,
      requestLocale: getStoredRequestLocale(),
      configLocale,
    }) as TLocale;
  }

  async function listDocuments() {
    const [{ entries }, { translator }] = await Promise.all([
      readCollection(),
      readRequestConfig(),
    ]);
    const defaultLocalePrefix = `${translator.defaultLocale}/`;
    const documentIds = new Set<string>();

    for (const entry of entries) {
      const entryId = getEntryId(entry);

      if (!entryId.startsWith(defaultLocalePrefix)) {
        continue;
      }

      documentIds.add(entryId.slice(defaultLocalePrefix.length));
    }

    return [...documentIds].sort();
  }

  async function getDocument(
    documentId: string,
    requestOptions?: ContentDocumentOptions<TLocale>,
  ): Promise<LocalizedContentDocument<TLocale, TEntry>> {
    const normalizedDocumentId = normalizeDocumentId(documentId);
    const [requestedLocale, { translator }, { entryMap }] = await Promise.all([
      getResolvedLocale(requestOptions),
      readRequestConfig(),
      readCollection(),
    ]);
    const fallbackLocale = translator.fallbackLocale as TLocale;
    const localeSearchOrder =
      requestedLocale === fallbackLocale
        ? [requestedLocale]
        : [requestedLocale, fallbackLocale];
    const lookedUpEntryIds: string[] = [];

    for (const locale of localeSearchOrder) {
      const entryId = localizeId(locale, normalizedDocumentId);
      lookedUpEntryIds.push(entryId);
      const entry = entryMap.get(entryId);

      if (!entry) {
        continue;
      }

      return {
        data: entry.data as InferEntryData<TEntry>,
        entry,
        entryId,
        id: normalizedDocumentId,
        locale,
        requestedLocale,
        usedFallback: locale !== requestedLocale,
      };
    }

    throw new ContentDocumentNotFoundError({
      fallbackLocale,
      id: normalizedDocumentId,
      lookedUpEntryIds,
      requestedLocale,
    });
  }

  async function renderDocument(
    documentId: string,
    options?: ContentDocumentOptions<TLocale>,
  ): Promise<RenderedContentDocument<TLocale, TEntry, TRenderedDocument>>;
  async function renderDocument(
    document: LocalizedContentDocument<TLocale, TEntry>,
  ): Promise<RenderedContentDocument<TLocale, TEntry, TRenderedDocument>>;
  async function renderDocument(
    documentOrId: string | LocalizedContentDocument<TLocale, TEntry>,
    requestOptions?: ContentDocumentOptions<TLocale>,
  ): Promise<RenderedContentDocument<TLocale, TEntry, TRenderedDocument>> {
    if (!options.render) {
      throw new Error(
        'renderDocument(...) requires a "render" function in createContentCollectionHelpers(...).',
      );
    }

    const document =
      typeof documentOrId === "string"
        ? await getDocument(documentOrId, requestOptions)
        : documentOrId;

    return {
      ...document,
      rendered: await options.render(document.entry),
    };
  }

  return {
    async getCollection() {
      return (await readCollection()).entries;
    },
    getDocument,
    listDocuments,
    renderDocument,
  };
}
