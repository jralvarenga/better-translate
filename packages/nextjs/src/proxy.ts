import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextResponse } from "next/server";

import {
  buildDomainAwareHref,
  getLocaleFromDomain,
  getPathnameLocale,
  isPathnameInScope,
  parseRouteTemplate,
} from "./shared.js";
import type { RoutingConfig } from "./shared.js";
import type {
  NextFetchEvent,
  NextProxy,
  NextRequest,
  NextResponse as NextResponseType,
} from "next/server";

export interface CreateProxyOptions {}

export const defaultProxyMatcher = [
  "/((?!api|_next|_vercel|.*\\..*).*)",
] as const;

export function createProxy<TLocale extends string>(
  routing: RoutingConfig<TLocale>,
  _options?: CreateProxyOptions,
): NextProxy {
  return function proxy(
    request: NextRequest,
  ): NextResponseType | Response | null | undefined {
    const pathname = request.nextUrl.pathname;

    if (!isPathnameInScope(pathname, routing)) {
      return undefined;
    }

    const pathnameLocale = getPathnameLocale(pathname, routing);
    const host =
      request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      request.nextUrl.host;
    const locale =
      pathnameLocale ??
      (host ? getLocaleFromDomain(routing, host) : undefined) ??
      getPreferredLocale(
        request.headers.get("accept-language"),
        routing.locales,
        routing.defaultLocale,
      );
    const targetHref = buildDomainAwareHref(
      routing,
      `${pathname}${request.nextUrl.search}`,
      locale,
      {
        currentHost: host ?? undefined,
        forceAbsolute: !pathnameLocale,
        protocol: request.nextUrl.protocol.replace(":", ""),
      },
    );
    const redirectUrl = targetHref.href.startsWith("/")
      ? new URL(targetHref.href, request.url).toString()
      : targetHref.href;

    if (!pathnameLocale) {
      return NextResponse.redirect(redirectUrl);
    }

    if (targetHref.external) {
      return NextResponse.redirect(redirectUrl);
    }

    return undefined;
  };
}

export function withBetterTranslate<TLocale extends string>(
  userProxy: NextProxy,
  routing: RoutingConfig<TLocale>,
  options?: CreateProxyOptions,
): NextProxy {
  const betterTranslateProxy = createProxy(routing, options);

  return async function composedProxy(
    request: NextRequest,
    event: NextFetchEvent,
  ) {
    const betterTranslateResult = await betterTranslateProxy(request, event);

    if (betterTranslateResult) {
      return betterTranslateResult;
    }

    return userProxy(request, event);
  };
}

export function getProxyMatcher<TLocale extends string>(
  routing: RoutingConfig<TLocale>,
): readonly string[] {
  const parsedTemplate = parseRouteTemplate(routing.routeTemplate);

  if (parsedTemplate.scopePrefix === "/") {
    return defaultProxyMatcher;
  }

  const escapedPrefix = escapeMatcherSegment(parsedTemplate.scopePrefix);

  return [
    parsedTemplate.scopePrefix,
    `${escapedPrefix}/((?!.*\\..*).*)`,
  ] as const;
}

function getPreferredLocale<TLocale extends string>(
  acceptLanguageHeader: string | null,
  locales: readonly TLocale[],
  defaultLocale: TLocale,
): TLocale {
  const negotiator = new Negotiator({
    headers: {
      "accept-language": acceptLanguageHeader ?? "",
    },
  });

  return match(negotiator.languages(), locales, defaultLocale) as TLocale;
}

function escapeMatcherSegment(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
