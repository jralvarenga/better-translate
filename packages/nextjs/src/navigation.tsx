import NextLink from "next/link";
import {
  redirect as nextRedirect,
  usePathname as useNextPathname,
  useRouter as useNextRouter,
} from "next/navigation";
import { forwardRef, type ComponentProps } from "react";

import {
  buildDomainAwareHref,
  getDomainForLocale,
  localizePathname,
  stripLocaleFromPathname,
} from "./shared.js";
import type { RoutingConfig } from "./shared.js";

type NextLinkProps = ComponentProps<typeof NextLink>;

export interface GetPathnameOptions<TLocale extends string> {
  href: string;
  locale?: TLocale;
}

export interface LocalizedNavigationOptions<TLocale extends string> {
  locale?: TLocale;
  scroll?: boolean;
}

export interface LocalizedPrefetchOptions<TLocale extends string> {
  locale?: TLocale;
  kind?: "auto" | "full";
  onInvalidate?: () => void;
}

export interface LocalizedRedirectOptions<TLocale extends string> {
  locale?: TLocale;
}

export type LocalizedLinkProps<TLocale extends string> = Omit<
  NextLinkProps,
  "href" | "locale"
> & {
  href: NextLinkProps["href"];
  locale?: TLocale;
};

export function createNavigation<TLocale extends string>(
  routing: RoutingConfig<TLocale>,
) {
  function getPathname({
    href,
    locale = routing.defaultLocale,
  }: GetPathnameOptions<TLocale>): string {
    return localizePathname(href, locale, routing.locales);
  }

  const Link = forwardRef<HTMLAnchorElement, LocalizedLinkProps<TLocale>>(
    function BetterTranslateNextLink(
      { href, locale = routing.defaultLocale, ...props },
      ref,
    ) {
      const localizedHref = localizeLinkHref(href, locale, routing);

      return <NextLink {...props} href={localizedHref} ref={ref} />;
    },
  );

  function usePathname(): string {
    return stripLocaleFromPathname(useNextPathname(), routing.locales);
  }

  function useRouter() {
    const router = useNextRouter();

    return {
      ...router,
      prefetch(href: string, options?: LocalizedPrefetchOptions<TLocale>) {
        const target = buildDomainAwareHref(routing, href, options?.locale ?? routing.defaultLocale, {
          currentHost: window.location.host,
          protocol: window.location.protocol.replace(":", ""),
        });

        if (target.external) {
          return;
        }

        router.prefetch(
          target.href,
          options?.kind || options?.onInvalidate
            ? ({
                kind: options?.kind === "full" ? "full" : "auto",
                onInvalidate: options?.onInvalidate,
              } as never)
            : undefined,
        );
      },
      push(href: string, options?: LocalizedNavigationOptions<TLocale>) {
        navigate(routing, router.push, window.location.assign.bind(window.location), href, options);
      },
      replace(href: string, options?: LocalizedNavigationOptions<TLocale>) {
        navigate(
          routing,
          router.replace,
          window.location.replace.bind(window.location),
          href,
          options,
        );
      },
    };
  }

  function redirect(href: string, options?: LocalizedRedirectOptions<TLocale>) {
    const target = buildDomainAwareHref(
      routing,
      href,
      options?.locale ?? routing.defaultLocale,
      {
        forceAbsolute: Boolean(
          getDomainForLocale(routing, options?.locale ?? routing.defaultLocale),
        ),
      },
    );

    nextRedirect(target.href);
  }

  return {
    Link,
    getPathname,
    redirect,
    usePathname,
    useRouter,
  };
}

function navigate<TLocale extends string>(
  routing: RoutingConfig<TLocale>,
  navigateWithRouter: (href: string, options?: { scroll?: boolean }) => void,
  navigateWithDocument: (href: string) => void,
  href: string,
  options?: LocalizedNavigationOptions<TLocale>,
): void {
  const target = buildDomainAwareHref(
    routing,
    href,
    options?.locale ?? routing.defaultLocale,
    {
      currentHost: window.location.host,
      protocol: window.location.protocol.replace(":", ""),
    },
  );

  if (target.external) {
    navigateWithDocument(target.href);
    return;
  }

  navigateWithRouter(target.href, options ? { scroll: options.scroll } : undefined);
}

function localizeLinkHref<TLocale extends string>(
  href: NextLinkProps["href"],
  locale: TLocale,
  routing: RoutingConfig<TLocale>,
): NextLinkProps["href"] {
  if (typeof href === "string") {
    return buildDomainAwareHref(routing, href, locale, {
      forceAbsolute: Boolean(getDomainForLocale(routing, locale)),
    }).href;
  }

  const hrefRecord = href as Record<string, unknown>;
  const pathname =
    typeof hrefRecord.pathname === "string" ? hrefRecord.pathname : "/";
  const search = typeof hrefRecord.search === "string" ? hrefRecord.search : "";
  const hash = typeof hrefRecord.hash === "string" ? hrefRecord.hash : "";
  const localizedHref = buildDomainAwareHref(
    routing,
    `${pathname}${search}${hash}`,
    locale,
    {
      forceAbsolute: Boolean(getDomainForLocale(routing, locale)),
    },
  );

  if (localizedHref.external) {
    return localizedHref.href;
  }

  return {
    ...hrefRecord,
    pathname: localizedHref.href,
  };
}
