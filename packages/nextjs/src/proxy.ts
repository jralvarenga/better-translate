import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextResponse } from "next/server";

import {
  buildDomainAwareHref,
  getLocaleFromDomain,
  getPathnameLocale,
} from "./shared.js";
import type { RoutingConfig } from "./shared.js";
import type { NextRequest, NextResponse as NextResponseType } from "next/server";

export interface CreateProxyOptions {}

export const defaultProxyMatcher = [
  "/((?!api|_next|_vercel|.*\\..*).*)",
] as const;

export function createProxy<TLocale extends string>(
  routing: RoutingConfig<TLocale>,
  _options?: CreateProxyOptions,
) {
  return function proxy(request: NextRequest): NextResponseType | undefined {
    const pathnameLocale = getPathnameLocale(request.nextUrl.pathname, routing.locales);
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
      `${pathnameLocale ? request.nextUrl.pathname : request.nextUrl.pathname}${request.nextUrl.search}`,
      locale,
      {
        currentHost: host ?? undefined,
        protocol: request.nextUrl.protocol.replace(":", ""),
        forceAbsolute: !pathnameLocale,
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
