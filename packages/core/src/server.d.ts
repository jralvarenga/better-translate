import type { ConfiguredTranslator, TranslationMessages } from "./types.js";

export declare function setRequestLocale(locale: string | undefined): void;

export declare function getRequestLocale(): string | undefined;

export declare function resolveRequestLocale<
  TLocale extends string,
  TMessages extends TranslationMessages,
>(
  translator: ConfiguredTranslator<TLocale, TMessages>,
  options?: {
    locale?: TLocale;
    requestLocale?: string;
    configLocale?: TLocale;
  },
): TLocale;
