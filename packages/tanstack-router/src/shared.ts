export interface RoutingConfig<TLocale extends string> {
  locales: readonly TLocale[];
  defaultLocale: TLocale;
  routeTemplate?: string;
}

export type DefinedRouting<
  TLocale extends string,
  TDefaultLocale extends TLocale = TLocale,
> = Readonly<{
  locales: readonly TLocale[];
  defaultLocale: TDefaultLocale;
  routeTemplate: string;
}>;

interface ParsedRouteTemplate {
  deLocalizedSegments: readonly string[];
  isRequired: boolean;
  localeParamName: string;
  localeSegment: string;
  localeSegmentIndex: number;
  localizedSegments: readonly string[];
  routeTemplate: string;
}

interface AnalyzedPathname<TLocale extends string> {
  deLocalizedPathname: string;
  explicitLocale: TLocale | undefined;
  inScope: boolean;
}

const DEFAULT_ROUTE_TEMPLATE = "/{-$locale}";

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
  routeTemplate?: string;
}): DefinedRouting<TLocales[number], TDefaultLocale> {
  const routeTemplate = config.routeTemplate ?? DEFAULT_ROUTE_TEMPLATE;

  validateRouting({
    ...config,
    routeTemplate,
  });

  return Object.freeze({
    locales: [...config.locales],
    defaultLocale: config.defaultLocale,
    routeTemplate,
  }) as DefinedRouting<TLocales[number], TDefaultLocale>;
}

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function getPathnameLocale<TLocale extends string>(
  pathname: string,
  routing: RoutingConfig<TLocale>,
): TLocale | undefined {
  return analyzePathname(pathname, routing).explicitLocale;
}

export function isPathnameInScope<TLocale extends string>(
  pathname: string,
  routing: RoutingConfig<TLocale>,
): boolean {
  return analyzePathname(pathname, routing).inScope;
}

export function stripLocaleFromPathname<TLocale extends string>(
  pathname: string,
  routing: RoutingConfig<TLocale>,
): string {
  const analyzed = analyzePathname(pathname, routing);

  return analyzed.inScope
    ? analyzed.deLocalizedPathname
    : normalizePathname(pathname);
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

  if (!parsedTemplate.isRequired && locale === routing.defaultLocale) {
    return deLocalizedPathname;
  }
  const pathnameSegments = splitPathname(deLocalizedPathname);
  const localizedSegments = [...pathnameSegments];

  localizedSegments.splice(parsedTemplate.localeSegmentIndex, 0, locale);

  return joinPathname(localizedSegments);
}

export function splitHrefString(href: string): {
  hash: string;
  pathname: string;
  search: string;
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
    hash,
    pathname: normalizePathname(pathname),
    search,
  };
}

export function isAbsoluteHref(href: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(href) || href.startsWith("//");
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

  let isRequired = false;

  for (let index = 0; index < localizedSegments.length; index += 1) {
    const segment = localizedSegments[index]!;
    const localeMatch = /^\{(-?)\$([a-zA-Z_$][a-zA-Z0-9_$]*)\}$/.exec(segment);

    if (localeMatch) {
      if (localeSegmentIndex !== -1) {
        throw new Error(
          `Route template "${normalizedRouteTemplate}" must contain exactly one locale segment.`,
        );
      }

      localeSegmentIndex = index;
      localeParamName = localeMatch[2]!;
      isRequired = localeMatch[1] !== "-";
      continue;
    }

    if (looksDynamic(segment)) {
      throw new Error(
        `Route template "${normalizedRouteTemplate}" can only contain one locale segment like "{-$locale}" or "{$locale}" plus static path segments.`,
      );
    }
  }

  if (localeSegmentIndex === -1) {
    throw new Error(
      `Route template "${normalizedRouteTemplate}" must contain one locale segment like "{-$locale}" or "{$locale}".`,
    );
  }

  const deLocalizedSegments = localizedSegments.filter(
    (_, index) => index !== localeSegmentIndex,
  );

  return {
    deLocalizedSegments,
    isRequired,
    localeParamName,
    localeSegment: localizedSegments[localeSegmentIndex]!,
    localeSegmentIndex,
    localizedSegments,
    routeTemplate: normalizedRouteTemplate,
  };
}

function validateRouting<TLocale extends string>(
  config: RoutingConfig<TLocale>,
): void {
  if (config.locales.length === 0) {
    throw new Error("defineRouting(...) requires at least one locale.");
  }

  if (!config.locales.includes(config.defaultLocale)) {
    throw new Error(
      `Default locale "${config.defaultLocale}" must be included in locales.`,
    );
  }

  parseRouteTemplate(config.routeTemplate);

  const localeSet = new Set<string>();

  for (const locale of config.locales) {
    if (localeSet.has(locale)) {
      throw new Error(`Duplicate locale "${locale}" found in routing config.`);
    }

    localeSet.add(locale);
  }
}

function analyzePathname<TLocale extends string>(
  pathname: string,
  routing: RoutingConfig<TLocale>,
): AnalyzedPathname<TLocale> {
  const parsedTemplate = parseRouteTemplate(routing.routeTemplate);
  const pathnameSegments = splitPathname(pathname);
  let explicitLocale: TLocale | undefined;
  let localePathIndex = -1;
  let pathnameIndex = 0;

  for (
    let templateIndex = 0;
    templateIndex < parsedTemplate.localizedSegments.length;
    templateIndex += 1
  ) {
    if (templateIndex === parsedTemplate.localeSegmentIndex) {
      const maybeLocale = pathnameSegments[pathnameIndex];

      if (maybeLocale && hasLocale(routing.locales, maybeLocale)) {
        explicitLocale = maybeLocale;
        localePathIndex = pathnameIndex;
        pathnameIndex += 1;
      }

      continue;
    }

    const templateSegment = parsedTemplate.localizedSegments[templateIndex]!;
    const pathnameSegment = pathnameSegments[pathnameIndex];

    if (pathnameSegment !== templateSegment) {
      return {
        deLocalizedPathname: normalizePathname(pathname),
        explicitLocale: undefined,
        inScope: false,
      };
    }

    pathnameIndex += 1;
  }

  if (localePathIndex === -1) {
    return {
      deLocalizedPathname: joinPathname(pathnameSegments),
      explicitLocale: undefined,
      inScope: true,
    };
  }

  const deLocalizedSegments = [...pathnameSegments];
  deLocalizedSegments.splice(localePathIndex, 1);

  return {
    deLocalizedPathname: joinPathname(deLocalizedSegments),
    explicitLocale,
    inScope: true,
  };
}

function looksDynamic(segment: string): boolean {
  return (
    segment.startsWith("[") ||
    segment.startsWith("$") ||
    segment.includes("{") ||
    segment.includes("}")
  );
}

function splitPathname(pathname: string): string[] {
  return normalizePathname(pathname).split("/").filter(Boolean);
}

function joinPathname(segments: readonly string[]): string {
  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}
