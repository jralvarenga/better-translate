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
}

export type DefinedRouting<
  TLocale extends string,
  TDefaultLocale extends TLocale = TLocale,
> = Readonly<{
  locales: readonly TLocale[];
  defaultLocale: TDefaultLocale;
  domains?: readonly RoutingDomain<TLocale>[];
}>;

export interface DomainAwareHrefResult {
  href: string;
  external: boolean;
}

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
}): DefinedRouting<TLocales[number], TDefaultLocale> {
  validateRouting(config);

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
  locales: readonly TLocale[],
): TLocale | undefined {
  const normalizedPathname = normalizePathname(pathname);

  for (const locale of locales) {
    if (
      normalizedPathname === `/${locale}` ||
      normalizedPathname.startsWith(`/${locale}/`)
    ) {
      return locale;
    }
  }

  return undefined;
}

export function stripLocaleFromPathname<TLocale extends string>(
  pathname: string,
  locales: readonly TLocale[],
): string {
  const normalizedPathname = normalizePathname(pathname);
  const locale = getPathnameLocale(normalizedPathname, locales);

  if (!locale) {
    return normalizedPathname;
  }

  const withoutLocale = normalizedPathname.slice(locale.length + 1);
  return withoutLocale.length > 0 ? withoutLocale : "/";
}

export function localizePathname<TLocale extends string>(
  pathname: string,
  locale: TLocale,
  locales: readonly TLocale[],
): string {
  const barePathname = stripLocaleFromPathname(pathname, locales);
  return barePathname === "/" ? `/${locale}` : `/${locale}${barePathname}`;
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
    protocol?: string;
    forceAbsolute?: boolean;
  },
): DomainAwareHrefResult {
  if (isAbsoluteHref(href)) {
    return {
      href,
      external: true,
    };
  }

  const { hash, pathname, search } = splitHrefString(href);
  const localizedPathname = localizePathname(pathname, locale, routing.locales);
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

function validateRouting<TLocale extends string>(config: RoutingConfig<TLocale>): void {
  if (config.locales.length === 0) {
    throw new Error("defineRouting(...) requires at least one locale.");
  }

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
      throw new Error(`Duplicate domain "${normalizedDomain}" found in routing config.`);
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
