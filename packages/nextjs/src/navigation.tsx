import {
  createElement,
  type ComponentPropsWithoutRef,
  type ElementType,
} from "react";

import {
  buildDomainAwareHref,
  getDomainForLocale,
  localizePathname,
  parseRouteTemplate,
  stripLocaleFromPathname,
} from "./shared.js";
import type { RoutingConfig } from "./shared.js";

type NavigationHref =
  | string
  | {
      hash?: string;
      pathname?: string;
      search?: string;
      [key: string]: unknown;
    };

type ParamsLike = Record<string, string | string[] | undefined>;

type RouterLike = {
  prefetch?: (href: string, options?: any) => unknown;
  push: (href: string, options?: any) => unknown;
  replace: (href: string, options?: any) => unknown;
};

type RouterMethodReturn<
  TRouter extends RouterLike,
  TMethod extends "push" | "replace" | "prefetch",
> = TMethod extends keyof TRouter
  ? Extract<TRouter[TMethod], (...args: any[]) => unknown> extends (
      ...args: any[]
    ) => infer TReturn
    ? TReturn
    : void
  : void;

type WithLocale<TLocale extends string, TOptions> = [TOptions] extends [
  undefined,
]
  ? {
      locale?: TLocale;
    }
  : TOptions & {
      locale?: TLocale;
    };

export interface GetPathnameOptions<TLocale extends string> {
  href: string;
  locale?: TLocale;
}

export type LocalizedLinkProps<
  TLocale extends string,
  TLink extends ElementType,
> = Omit<ComponentPropsWithoutRef<TLink>, "href"> & {
  href: ComponentPropsWithoutRef<TLink> extends { href: infer THref }
    ? THref
    : NavigationHref;
  locale?: TLocale;
};

export type LocalizedRouter<
  TLocale extends string,
  TRouter extends RouterLike,
> = Omit<TRouter, "prefetch" | "push" | "replace"> & {
  push(
    href: string,
    options?: WithLocale<TLocale, Record<string, unknown>>,
  ): RouterMethodReturn<TRouter, "push">;
  replace(
    href: string,
    options?: WithLocale<TLocale, Record<string, unknown>>,
  ): RouterMethodReturn<TRouter, "replace">;
} & ("prefetch" extends keyof TRouter
    ? {
        prefetch(
          href: string,
          options?: WithLocale<TLocale, Record<string, unknown>>,
        ): RouterMethodReturn<TRouter, "prefetch">;
      }
    : {});

export interface NavigationFunctionsConfig<
  TLocale extends string,
  TRouter extends RouterLike,
  TParams extends ParamsLike,
  TLink extends ElementType,
> {
  Link: TLink;
  routing: RoutingConfig<TLocale>;
  useParams: () => TParams;
  usePathname: () => string;
  useRouter: () => TRouter;
}

export function createNavigationFunctions<
  TLocale extends string,
  TRouter extends RouterLike,
  TParams extends ParamsLike,
  TLink extends ElementType,
>({
  Link: LinkComponent,
  routing,
  useParams: useInjectedParams,
  usePathname: useInjectedPathname,
  useRouter: useInjectedRouter,
}: NavigationFunctionsConfig<TLocale, TRouter, TParams, TLink>) {
  const parsedTemplate = parseRouteTemplate(routing.routeTemplate);

  function getPathname({
    href,
    locale = routing.defaultLocale,
  }: GetPathnameOptions<TLocale>): string {
    return localizePathname(href, locale, routing);
  }

  function Link(rawProps: LocalizedLinkProps<TLocale, TLink>) {
    const { href, locale, ...props } = rawProps;
    const params = useInjectedParams();
    const activeLocale = resolveActiveLocale(
      params,
      routing,
      parsedTemplate.localeParamName,
    );
    const localizedHref = localizeLinkHref(
      href as NavigationHref,
      locale ?? activeLocale,
      routing,
    );

    return createElement(
      LinkComponent as ElementType,
      {
        ...(props as object),
        href: localizedHref,
      } as object,
    );
  }

  function usePathname(): string {
    return stripLocaleFromPathname(useInjectedPathname(), routing);
  }

  function useRouter(): LocalizedRouter<TLocale, TRouter> {
    const router = useInjectedRouter();
    const params = useInjectedParams();
    const activeLocale = resolveActiveLocale(
      params,
      routing,
      parsedTemplate.localeParamName,
    );

    const localizedRouter: Record<string, unknown> = {
      ...router,
      push(href: string, options?: Record<string, unknown>) {
        return navigate(
          router.push.bind(router),
          window.location.assign.bind(window.location),
          routing,
          href,
          activeLocale,
          options,
        );
      },
      replace(href: string, options?: Record<string, unknown>) {
        return navigate(
          router.replace.bind(router),
          window.location.replace.bind(window.location),
          routing,
          href,
          activeLocale,
          options,
        );
      },
    };

    if (typeof router.prefetch === "function") {
      localizedRouter.prefetch = (
        href: string,
        options?: Record<string, unknown>,
      ) => {
        const target = buildNavigationTarget(
          routing,
          href,
          activeLocale,
          options,
        );

        if (target.external) {
          return undefined;
        }

        return router.prefetch?.(target.href, target.forwardedOptions);
      };
    }

    return localizedRouter as LocalizedRouter<TLocale, TRouter>;
  }

  return {
    Link,
    getPathname,
    usePathname,
    useRouter,
  };
}

function buildNavigationTarget<TLocale extends string>(
  routing: RoutingConfig<TLocale>,
  href: string,
  activeLocale: TLocale,
  options?: Record<string, unknown>,
) {
  const nextLocale = (options?.locale as TLocale | undefined) ?? activeLocale;
  const forwardedOptions = {
    ...(options ?? {}),
  };

  delete forwardedOptions.locale;

  const target = buildDomainAwareHref(routing, href, nextLocale, {
    currentHost: window.location.host,
    protocol: window.location.protocol.replace(":", ""),
  });

  return {
    external: target.external,
    forwardedOptions,
    href: target.href,
  };
}

function navigate<TLocale extends string>(
  navigateWithRouter: (
    href: string,
    options?: Record<string, unknown>,
  ) => unknown,
  navigateWithDocument: (href: string) => void,
  routing: RoutingConfig<TLocale>,
  href: string,
  activeLocale: TLocale,
  options?: Record<string, unknown>,
) {
  const target = buildNavigationTarget(routing, href, activeLocale, options);

  if (target.external) {
    navigateWithDocument(target.href);
    return undefined;
  }

  return navigateWithRouter(target.href, target.forwardedOptions);
}

function localizeLinkHref<TLocale extends string>(
  href: NavigationHref,
  locale: TLocale,
  routing: RoutingConfig<TLocale>,
): NavigationHref {
  if (typeof href === "string") {
    return buildDomainAwareHref(routing, href, locale, {
      forceAbsolute: Boolean(getDomainForLocale(routing, locale)),
    }).href;
  }

  const pathname = typeof href.pathname === "string" ? href.pathname : "/";
  const search = typeof href.search === "string" ? href.search : "";
  const hash = typeof href.hash === "string" ? href.hash : "";
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
    ...href,
    pathname: localizedHref.href,
  };
}

function resolveActiveLocale<TLocale extends string>(
  params: ParamsLike,
  routing: RoutingConfig<TLocale>,
  localeParamName: string,
): TLocale {
  const localeParam = params[localeParamName];

  if (
    typeof localeParam === "string" &&
    routing.locales.includes(localeParam as TLocale)
  ) {
    return localeParam as TLocale;
  }

  return routing.defaultLocale;
}
