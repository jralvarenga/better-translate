import { AsyncLocalStorage } from "node:async_hooks";
import { createRequire } from "node:module";

import type { ConfiguredTranslator, TranslationMessages } from "./types.js";

type RequestLocaleStore = {
  locale: string | undefined;
};

const requestLocaleStorage = new AsyncLocalStorage<RequestLocaleStore>();
const require = createRequire(import.meta.url);

type ReactCache = <TValue>(factory: () => TValue) => () => TValue;

function createRequestLocaleStore() {
  return {
    locale: undefined,
  } satisfies RequestLocaleStore;
}

function createAsyncLocalRequestLocaleStore() {
  return () => {
    const existingStore = requestLocaleStorage.getStore();

    if (existingStore) {
      return existingStore;
    }

    const nextStore = createRequestLocaleStore();
    requestLocaleStorage.enterWith(nextStore);

    return nextStore;
  };
}

const getOrCreateAsyncLocalRequestLocaleStore =
  createAsyncLocalRequestLocaleStore();

function createReactRequestLocaleStore() {
  try {
    const react = require("react") as {
      cache?: ReactCache;
    };

    if (typeof react.cache === "function") {
      return react.cache(() => getOrCreateAsyncLocalRequestLocaleStore());
    }
  } catch {}

  return null;
}

const getOrCreateRequestLocaleStore =
  createReactRequestLocaleStore() ?? getOrCreateAsyncLocalRequestLocaleStore;

export function setRequestLocale(locale: string | undefined) {
  getOrCreateRequestLocaleStore().locale = locale;
}

export function getRequestLocale() {
  return getOrCreateRequestLocaleStore().locale;
}

export function resolveRequestLocale<
  TLocale extends string,
  TMessages extends TranslationMessages,
>(
  translator: ConfiguredTranslator<TLocale, TMessages>,
  options?: {
    locale?: TLocale;
    requestLocale?: string;
    configLocale?: TLocale;
  },
): TLocale {
  const locale =
    options?.locale ??
    options?.requestLocale ??
    options?.configLocale ??
    translator.defaultLocale;

  if (!translator.getSupportedLocales().includes(locale as TLocale)) {
    throw new Error(
      `The locale "${locale}" is not included in the translator's supported locales.`,
    );
  }

  return locale as TLocale;
}
