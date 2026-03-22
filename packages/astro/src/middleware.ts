import type {
  ConfiguredTranslator,
  TranslationMessages,
} from "@better-translate/core";
import { resolveRequestLocale } from "@better-translate/core/server";

import { readRequestCached } from "./request-cache.js";
import type {
  InferTranslatorLocale,
  RequestConfigFactory,
} from "./server.js";
import { setRequestLocale } from "./server.js";

export interface BetterTranslateLocals<TLocale extends string = string> {
  betterTranslate?: {
    locale: TLocale;
  };
}

export interface BetterTranslateMiddlewareContext<
  TLocale extends string = string,
  TLocals extends Record<string, unknown> = Record<string, unknown>,
> {
  currentLocale?: string;
  locals: TLocals & BetterTranslateLocals<TLocale>;
  params?: Record<string, string | undefined>;
  preferredLocale?: string;
  preferredLocaleList?: string[];
  request: Request;
  url: URL;
}

export type BetterTranslateMiddlewareNext = () => Response | Promise<Response>;

export type BetterTranslateMiddlewareHandler<
  TLocale extends string = string,
  TLocals extends Record<string, unknown> = Record<string, unknown>,
> = (
  context: BetterTranslateMiddlewareContext<TLocale, TLocals>,
  next: BetterTranslateMiddlewareNext,
) => Response | Promise<Response>;

export interface CreateBetterTranslateMiddlewareOptions<
  TLocale extends string,
  TLocals extends Record<string, unknown> = Record<string, unknown>,
> {
  resolveLocale?: (
    context: BetterTranslateMiddlewareContext<TLocale, TLocals>,
  ) => TLocale | string | undefined | Promise<TLocale | string | undefined>;
}

export function createBetterTranslateMiddleware<
  TTranslator extends ConfiguredTranslator<any, TranslationMessages>,
  TLocale extends InferTranslatorLocale<TTranslator> = InferTranslatorLocale<TTranslator>,
  TLocals extends Record<string, unknown> = Record<string, unknown>,
>(
  requestConfig: RequestConfigFactory<TTranslator, TLocale>,
  options?: CreateBetterTranslateMiddlewareOptions<TLocale, TLocals>,
): BetterTranslateMiddlewareHandler<TLocale, TLocals> {
  const requestConfigCacheKey = Symbol(
    "better-translate-astro-middleware-request-config",
  );

  function readConfig() {
    return readRequestCached(requestConfigCacheKey, () => requestConfig());
  }

  return async (context, next) => {
    const resolvedConfig = await readConfig();
    const requestedLocale =
      (await options?.resolveLocale?.(context)) ?? context.currentLocale;
    const locale = resolveRequestLocale(resolvedConfig.translator, {
      locale: requestedLocale as TLocale | undefined,
      configLocale: resolvedConfig.locale,
    }) as TLocale;

    setRequestLocale(locale);
    context.locals.betterTranslate = {
      locale,
    };

    return next();
  };
}
