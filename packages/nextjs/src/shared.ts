import { SUPPORTED_LOCALE_ROUTE_SYNTAXES } from "@better-translate/core";

export interface RoutingDomain<TLocale extends string> {
  domain: string;
  defaultLocale: TLocale;
  locales?: readonly TLocale[];
  protocol?: "http" | "https";
}

export interface RoutingConfig<TLocale extends string> {
  locales: readonly TLocale[];
  defaultLocale: TLocale;
  domains?: readonly RoutingDomain<TLocale>[];
  routeTemplate?: string;
}

export type DefinedRouting<
  TLocale extends string,
  TDefaultLocale extends TLocale = TLocale,
> = Readonly<{
  locales: readonly TLocale[];
  defaultLocale: TDefaultLocale;
  domains?: readonly RoutingDomain<TLocale>[];
  routeTemplate: string;
}>;

export interface DomainAwareHrefResult {
  href: string;
  external: boolean;
}

interface ParsedRouteTemplate {
  deLocalizedSegments: readonly string[];
  localeParamName: string;
  localeSegmentIndex: number;
  localizedSegments: readonly string[];
  routeTemplate: string;
  scopePrefix: string;
}

const DEFAULT_ROUTE_TEMPLATE = "/[lang]";
const NEXTJS_LOCALE_SEGMENT_EXAMPLE = '"[lang]"';
const SUPPORTED_LOCALE_PARAM_NAMES = SUPPORTED_LOCALE_ROUTE_SYNTAXES.map(
  (name) => `"${name}"`,
).join(", ");

type SupportedLocaleParamName =
  (typeof SUPPORTED_LOCALE_ROUTE_SYNTAXES)[number];

export function hasLocale<TLocale extends string>(
  locales: readonly TLocale[],
  value: string,
): value is TLocale {
  return locales.includes(value as TLocale);
}

export function defineRouting<
  const TLocales extends readonly string[],
  const TDefaultLocale extends TLocales[number],
>(config: {
  locales: TLocales;
  defaultLocale: TDefaultLocale;
  domains?: readonly RoutingDomain<TLocales[number]>[];
  routeTemplate?: string;
}): DefinedRouting<TLocales[number], TDefaultLocale> {
  const routeTemplate = config.routeTemplate ?? DEFAULT_ROUTE_TEMPLATE;

  validateRouting({
    ...config,
    routeTemplate,
  });

  const domains = config.domains?.map((domain) =>
    Object.freeze({
      ...domain,
      locales: domain.locales ? [...domain.locales] : undefined,
    }),
  );

  return Object.freeze({
    locales: [...config.locales],
    defaultLocale: config.defaultLocale,
    domains,
    routeTemplate,
  }) as DefinedRouting<TLocales[number], TDefaultLocale>;
}

export function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function getPathnameLocale<TLocale extends string>(
  pathname: string,
  routing: RoutingConfig<TLocale>,
): TLocale | undefined {
  const parsedTemplate = parseRouteTemplate(routing.routeTemplate);
  const pathnameSegments = splitPathname(pathname);

  if (pathnameSegments.length < parsedTemplate.localizedSegments.length) {
    return undefined;
  }

  for (
    let index = 0;
    index < parsedTemplate.localizedSegments.length;
    index += 1
  ) {
    const templateSegment = parsedTemplate.localizedSegments[index]!;
    const pathnameSegment = pathnameSegments[index];

    if (index === parsedTemplate.localeSegmentIndex) {
      if (!pathnameSegment || !hasLocale(routing.locales, pathnameSegment)) {
        return undefined;
      }

      continue;
    }

    if (pathnameSegment !== templateSegment) {
      return undefined;
    }
  }

  return pathnameSegments[parsedTemplate.localeSegmentIndex] as TLocale;
}

export function isPathnameInScope<TLocale extends string>(
  pathname: string,
  routing: RoutingConfig<TLocale>,
): boolean {
  if (getPathnameLocale(pathname, routing)) {
    return true;
  }

  const parsedTemplate = parseRouteTemplate(routing.routeTemplate);
  const pathnameSegments = splitPathname(pathname);

  if (pathnameSegments.length < parsedTemplate.deLocalizedSegments.length) {
    return false;
  }

  for (
    let index = 0;
    index < parsedTemplate.deLocalizedSegments.length;
    index += 1
  ) {
    if (pathnameSegments[index] !== parsedTemplate.deLocalizedSegments[index]) {
      return false;
    }
  }

  return true;
}

export function stripLocaleFromPathname<TLocale extends string>(
  pathname: string,
  routing: RoutingConfig<TLocale>,
): string {
  const locale = getPathnameLocale(pathname, routing);

  if (!locale) {
    return normalizePathname(pathname);
  }

  const parsedTemplate = parseRouteTemplate(routing.routeTemplate);
  const pathnameSegments = splitPathname(pathname);

  pathnameSegments.splice(parsedTemplate.localeSegmentIndex, 1);

  return joinPathname(pathnameSegments);
}

export function localizePathname<TLocale extends string>(
  pathname: string,
  locale: TLocale,
  routing: RoutingConfig<TLocale>,
): string {
  const normalizedPathname = normalizePathname(pathname);
  const deLocalizedPathname = stripLocaleFromPathname(
    normalizedPathname,
    routing,
  );

  if (!isPathnameInScope(deLocalizedPathname, routing)) {
    return normalizedPathname;
  }

  const parsedTemplate = parseRouteTemplate(routing.routeTemplate);
  const pathnameSegments = splitPathname(deLocalizedPathname);
  const localizedSegments = [...pathnameSegments];

  localizedSegments.splice(parsedTemplate.localeSegmentIndex, 0, locale);

  return joinPathname(localizedSegments);
}

export function splitHrefString(href: string): {
  pathname: string;
  search: string;
  hash: string;
} {
  const hashIndex = href.indexOf("#");
  const searchIndex = href.indexOf("?");
  const pathnameEnd =
    hashIndex === -1
      ? searchIndex === -1
        ? href.length
        : searchIndex
      : searchIndex === -1
        ? hashIndex
        : Math.min(searchIndex, hashIndex);

  const pathname = href.slice(0, pathnameEnd) || "/";
  const search =
    searchIndex === -1
      ? ""
      : href.slice(searchIndex, hashIndex === -1 ? href.length : hashIndex);
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex);

  return {
    pathname: normalizePathname(pathname),
    search,
    hash,
  };
}

export function isAbsoluteHref(href: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(href) || href.startsWith("//");
}

export function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/:\d+$/, "");
}

export function getDomainForLocale<TLocale extends string>(
  routing: RoutingConfig<TLocale>,
  locale: TLocale,
): RoutingDomain<TLocale> | undefined {
  return routing.domains?.find((domain) =>
    getDomainLocales(domain).includes(locale),
  );
}

export function getLocaleFromDomain<TLocale extends string>(
  routing: RoutingConfig<TLocale>,
  host: string,
): TLocale | undefined {
  const normalizedHost = normalizeHost(host);

  return routing.domains?.find(
    (domain) => normalizeHost(domain.domain) === normalizedHost,
  )?.defaultLocale;
}

export function buildDomainAwareHref<TLocale extends string>(
  routing: RoutingConfig<TLocale>,
  href: string,
  locale: TLocale,
  options?: {
    currentHost?: string;
    forceAbsolute?: boolean;
    protocol?: string;
  },
): DomainAwareHrefResult {
  if (isAbsoluteHref(href)) {
    return {
      href,
      external: true,
    };
  }

  const { hash, pathname, search } = splitHrefString(href);
  const isScopedPath = isPathnameInScope(pathname, routing);

  if (!isScopedPath) {
    return {
      href: `${pathname}${search}${hash}`,
      external: false,
    };
  }

  const localizedPathname = localizePathname(pathname, locale, routing);
  const localizedHref = `${localizedPathname}${search}${hash}`;
  const targetDomain = getDomainForLocale(routing, locale);

  if (!targetDomain) {
    return {
      href: localizedHref,
      external: false,
    };
  }

  const targetHost = normalizeHost(targetDomain.domain);
  const currentHost = options?.currentHost
    ? normalizeHost(options.currentHost)
    : undefined;
  const shouldUseAbsolute =
    options?.forceAbsolute === true ||
    currentHost === undefined ||
    currentHost !== targetHost;

  if (!shouldUseAbsolute) {
    return {
      href: localizedHref,
      external: false,
    };
  }

  const protocol = targetDomain.protocol ?? options?.protocol ?? "https";

  return {
    href: `${protocol}://${targetHost}${localizedHref}`,
    external: currentHost === undefined ? true : currentHost !== targetHost,
  };
}

export function parseRouteTemplate(
  routeTemplate?: string,
): ParsedRouteTemplate {
  const normalizedRouteTemplate = normalizePathname(
    routeTemplate ?? DEFAULT_ROUTE_TEMPLATE,
  );
  const localizedSegments = splitPathname(normalizedRouteTemplate);
  let localeSegmentIndex = -1;
  let localeParamName = "";

  for (let index = 0; index < localizedSegments.length; index += 1) {
    const segment = localizedSegments[index]!;
    const dynamicMatch = /^\[([^\]/]+)\]$/.exec(segment);

    if (!dynamicMatch) {
      continue;
    }

    if (localeSegmentIndex !== -1) {
      throw new Error(
        `Route template "${normalizedRouteTemplate}" must contain exactly one supported dynamic locale segment like ${NEXTJS_LOCALE_SEGMENT_EXAMPLE}. Supported locale param names are ${SUPPORTED_LOCALE_PARAM_NAMES}.`,
      );
    }

    if (!isSupportedLocaleParamName(dynamicMatch[1]!)) {
      throw new Error(
        `Route template "${normalizedRouteTemplate}" uses unsupported locale param "${dynamicMatch[1]}". Next.js locale segments must look like ${NEXTJS_LOCALE_SEGMENT_EXAMPLE}. Supported locale param names are ${SUPPORTED_LOCALE_PARAM_NAMES}.`,
      );
    }

    localeSegmentIndex = index;
    localeParamName = dynamicMatch[1]!;
  }

  if (localeSegmentIndex === -1) {
    throw new Error(
      `Route template "${normalizedRouteTemplate}" must contain one supported dynamic locale segment like ${NEXTJS_LOCALE_SEGMENT_EXAMPLE}. Supported locale param names are ${SUPPORTED_LOCALE_PARAM_NAMES}.`,
    );
  }

  const deLocalizedSegments = localizedSegments.filter(
    (_, index) => index !== localeSegmentIndex,
  );
  const scopePrefixSegments = localizedSegments.slice(0, localeSegmentIndex);

  return {
    deLocalizedSegments,
    localeParamName,
    localeSegmentIndex,
    localizedSegments,
    routeTemplate: normalizedRouteTemplate,
    scopePrefix: joinPathname(scopePrefixSegments),
  };
}

function validateRouting<TLocale extends string>(
  config: RoutingConfig<TLocale>,
): void {
  if (config.locales.length === 0) {
    throw new Error("defineRouting(...) requires at least one locale.");
  }

  parseRouteTemplate(config.routeTemplate);

  const localeSet = new Set<string>();

  for (const locale of config.locales) {
    if (localeSet.has(locale)) {
      throw new Error(`Duplicate locale "${locale}" found in routing config.`);
    }

    localeSet.add(locale);
  }

  if (!hasLocale(config.locales, config.defaultLocale)) {
    throw new Error(
      `The default locale "${config.defaultLocale}" is not included in locales.`,
    );
  }

  if (!config.domains) {
    return;
  }

  const domainSet = new Set<string>();
  const localeToDomain = new Map<string, string>();

  for (const domain of config.domains) {
    const normalizedDomain = normalizeHost(domain.domain);

    if (!normalizedDomain) {
      throw new Error("Routing domains must include a non-empty domain value.");
    }

    if (domainSet.has(normalizedDomain)) {
      throw new Error(
        `Duplicate domain "${normalizedDomain}" found in routing config.`,
      );
    }

    domainSet.add(normalizedDomain);

    if (!hasLocale(config.locales, domain.defaultLocale)) {
      throw new Error(
        `The domain default locale "${domain.defaultLocale}" is not included in locales.`,
      );
    }

    const domainLocales = getDomainLocales(domain);

    if (!domainLocales.includes(domain.defaultLocale)) {
      throw new Error(
        `The domain "${domain.domain}" must include its default locale "${domain.defaultLocale}".`,
      );
    }

    for (const locale of domainLocales) {
      if (!hasLocale(config.locales, locale)) {
        throw new Error(
          `The domain "${domain.domain}" includes unsupported locale "${locale}".`,
        );
      }

      const existingDomain = localeToDomain.get(locale);

      if (existingDomain && existingDomain !== normalizedDomain) {
        throw new Error(
          `Locale "${locale}" is assigned to multiple domains: "${existingDomain}" and "${normalizedDomain}".`,
        );
      }

      localeToDomain.set(locale, normalizedDomain);
    }
  }
}

function splitPathname(pathname: string): string[] {
  return normalizePathname(pathname).split("/").filter(Boolean);
}

function joinPathname(segments: readonly string[]): string {
  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}`;
}

function getDomainLocales<TLocale extends string>(
  domain: RoutingDomain<TLocale>,
): readonly TLocale[] {
  if (!domain.locales || domain.locales.length === 0) {
    return [domain.defaultLocale];
  }

  if (!domain.locales.includes(domain.defaultLocale)) {
    return [...domain.locales, domain.defaultLocale];
  }

  return domain.locales;
}

function isSupportedLocaleParamName(
  value: string,
): value is SupportedLocaleParamName {
  return SUPPORTED_LOCALE_ROUTE_SYNTAXES.includes(
    value as SupportedLocaleParamName,
  );
}
