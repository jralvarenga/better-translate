import { useEffect, useReducer, useRef, useState, useTransition } from "react";

import { BetterTranslateContext } from "./context.js";
import type {
  AnyBetterTranslateTranslator,
  BetterTranslateProviderProps,
  InferLocale,
  InferMessages,
  UseTranslationsValue,
} from "./types.js";
import type {
  TranslateCall,
  TranslateFunction,
  TranslationKey,
} from "@better-translate/core";

/**
 * Provides a configured Better Translate translator to a React subtree.
 *
 * The provider owns the active locale state and exposes locale-bound helpers
 * through `useTranslations()`.
 */
export function BetterTranslateProvider<
  TTranslator extends AnyBetterTranslateTranslator,
>({
  children,
  initialLocale,
  translator,
}: BetterTranslateProviderProps<TTranslator>) {
  const [locale, setLocaleState] = useState<InferLocale<TTranslator>>(
    initialLocale ?? (translator.defaultLocale as InferLocale<TTranslator>),
  );
  const [localeError, setLocaleError] = useState<unknown>(null);
  const [loadingLocale, setLoadingLocale] =
    useState<InferLocale<TTranslator> | null>(null);
  const [, refreshMessages] = useReducer((count: number) => count + 1, 0);
  const [isPending, startTransition] = useTransition();
  const requestIdRef = useRef(0);

  useEffect(() => {
    requestIdRef.current += 1;
    setLocaleState(
      initialLocale ?? (translator.defaultLocale as InferLocale<TTranslator>),
    );
    setLocaleError(null);
    setLoadingLocale(null);
    refreshMessages();
  }, [initialLocale, translator]);

  async function loadLocale(nextLocale: InferLocale<TTranslator>) {
    setLocaleError(null);
    setLoadingLocale(nextLocale);

    try {
      const loadedLocale = await translator.loadLocale(nextLocale);

      startTransition(() => {
        refreshMessages();
      });

      return loadedLocale;
    } catch (error) {
      setLocaleError(error);
      throw error;
    } finally {
      setLoadingLocale((currentLocale) =>
        currentLocale === nextLocale ? null : currentLocale,
      );
    }
  }

  async function setLocale(nextLocale: InferLocale<TTranslator>) {
    if (locale === nextLocale) {
      return;
    }

    const requestId = ++requestIdRef.current;
    setLocaleError(null);

    const hasCachedMessages = Object.prototype.hasOwnProperty.call(
      translator.getMessages(),
      nextLocale as PropertyKey,
    );

    if (!hasCachedMessages) {
      setLoadingLocale(nextLocale);

      try {
        await translator.loadLocale(nextLocale);
      } catch (error) {
        if (requestId === requestIdRef.current) {
          setLocaleError(error);
          setLoadingLocale(null);
        }

        return;
      }
    }

    if (requestId !== requestIdRef.current) {
      return;
    }

    startTransition(() => {
      setLocaleState(nextLocale);
      setLocaleError(null);
      setLoadingLocale(null);
      refreshMessages();
    });
  }

  const translate = (<TKey extends TranslationKey<InferMessages<TTranslator>>>(
    ...args: TranslateCall<
      InferLocale<TTranslator>,
      InferMessages<TTranslator>,
      TKey
    >
  ) => {
    const [key, options] = args as unknown as [
      string,
      ({ locale?: InferLocale<TTranslator> } & Record<string, unknown>)?,
    ];

    return translator.t(
      key as never,
      {
        ...options,
        locale: options?.locale ?? locale,
      } as never,
    );
  }) as TranslateFunction<InferLocale<TTranslator>, InferMessages<TTranslator>>;

  const value: UseTranslationsValue<TTranslator> = {
    availableLanguages:
      translator.getAvailableLanguages() as UseTranslationsValue<TTranslator>["availableLanguages"],
    defaultLocale: translator.defaultLocale as InferLocale<TTranslator>,
    direction: translator.getDirection({
      locale,
    }),
    fallbackLocale: translator.fallbackLocale as InferLocale<TTranslator>,
    isLoadingLocale: loadingLocale !== null || isPending,
    loadLocale: loadLocale as UseTranslationsValue<TTranslator>["loadLocale"],
    loadingLocale,
    locale,
    localeError,
    messages: translator.getMessages() as UseTranslationsValue<TTranslator>["messages"],
    rtl: translator.isRtl({
      locale,
    }),
    setLocale,
    supportedLocales:
      translator.getSupportedLocales() as readonly InferLocale<TTranslator>[],
    t: translate,
    translator,
  };

  return (
    <BetterTranslateContext.Provider value={value}>
      {children}
    </BetterTranslateContext.Provider>
  );
}
