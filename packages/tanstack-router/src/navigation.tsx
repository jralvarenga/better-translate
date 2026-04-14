import { createElement, type ReactElement } from "react";

import type {
  AnyRouter,
  BuildLocationFn,
  LinkComponent,
  LinkComponentProps,
  NavigateOptions,
  RegisteredRouter,
  UseNavigateResult,
} from "@tanstack/react-router";

import {
  getPathnameLocale,
  isAbsoluteHref,
  isPathnameInScope,
  localizePathname,
  parseRouteTemplate,
  splitHrefString,
  stripLocaleFromPathname,
} from "./shared.js";
import type { RoutingConfig } from "./shared.js";

type ParamsLike = Record<string, string | undefined>;

type LocalizedLinkComponent<
  TLocale extends string,
  TDefaultFrom extends string,
> = <
  TRouter extends AnyRouter = RegisteredRouter,
  const TFrom extends string = TDefaultFrom,
  const TTo extends string | undefined = undefined,
  const TMaskFrom extends string = TFrom,
  const TMaskTo extends string = "",
>(
  props: LinkComponentProps<"a", TRouter, TFrom, TTo, TMaskFrom, TMaskTo> & {
    locale?: TLocale;
  },
) => ReactElement;

export interface GetPathnameOptions<TLocale extends string> {
  href: string;
  locale?: TLocale;
}

export type LocalizedUseNavigateResult<
  TLocale extends string,
  TDefaultFrom extends string,
> = <
  TRouter extends RegisteredRouter,
  TTo extends string | undefined,
  TFrom extends string = TDefaultFrom,
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = "",
>(
  options: NavigateOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo> & {
    locale?: TLocale;
  },
) => Promise<void>;

export type LocalizedBuildLocationFn<TLocale extends string> = (
  options: Record<string, unknown> & {
    locale?: TLocale;
  },
) => ReturnType<BuildLocationFn>;

export type LocalizedPreloadRouteFn<TLocale extends string> = (
  options: Record<string, unknown> & {
    locale?: TLocale;
  },
) => Promise<unknown>;

export type LocalizedRouter<
  TLocale extends string,
  TRouter extends AnyRouter,
> = Omit<TRouter, "buildLocation" | "navigate" | "preloadRoute"> & {
  buildLocation: LocalizedBuildLocationFn<TLocale>;
  navigate: LocalizedUseNavigateResult<TLocale, string>;
  preloadRoute?: LocalizedPreloadRouteFn<TLocale>;
};

export interface NavigationFunctionsConfig<
  TLocale extends string,
  TDefaultFrom extends string,
  TRouter extends AnyRouter,
  TParams extends ParamsLike,
> {
  Link: LinkComponent<"a", TDefaultFrom>;
  routing: RoutingConfig<TLocale>;
  useLocation: () => {
    pathname: string;
  };
  useNavigate: () => UseNavigateResult<TDefaultFrom>;
  /**
   * @deprecated Locale resolution now comes from `useLocation().pathname`.
   * This hook is ignored at runtime and only remains for backward compatibility.
   */
  useParams?: () => TParams;
  useRouter: () => TRouter;
}

export function createNavigationFunctions<
  TLocale extends string,
  TDefaultFrom extends string = string,
  TRouter extends AnyRouter = AnyRouter,
  TParams extends ParamsLike = ParamsLike,
>({
  Link: LinkComponent,
  routing,
  useLocation: useInjectedLocation,
  useNavigate: useInjectedNavigate,
  useRouter: useInjectedRouter,
}: NavigationFunctionsConfig<TLocale, TDefaultFrom, TRouter, TParams>) {
  const parsedTemplate = parseRouteTemplate(routing.routeTemplate);

  function getPathname({
    href,
    locale = routing.defaultLocale,
  }: GetPathnameOptions<TLocale>): string {
    return localizePathname(href, locale, routing);
  }

  const Link = ((rawProps) => {
    const currentPathname = useInjectedLocation().pathname;
    const localizedOptions = getLocalizedOptions(
      rawProps,
      currentPathname,
      resolveActiveLocale(currentPathname, routing),
      routing,
      parsedTemplate.localeParamName,
      parsedTemplate.localeSegment,
      parsedTemplate.isRequired,
    );

    return createElement(
      LinkComponent as unknown as (props: object) => ReactElement,
      localizedOptions as object,
    );
  }) as LocalizedLinkComponent<TLocale, TDefaultFrom>;

  function usePathname(): string {
    return stripLocaleFromPathname(useInjectedLocation().pathname, routing);
  }

  function useLocale(): TLocale {
    return resolveActiveLocale(useInjectedLocation().pathname, routing);
  }

  function useNavigate(): LocalizedUseNavigateResult<TLocale, TDefaultFrom> {
    const navigate = useInjectedNavigate();
    const pathname = useInjectedLocation().pathname;
    const activeLocale = useLocale();

    return ((options) =>
      navigate(
        getLocalizedOptions(
          options,
          pathname,
          activeLocale,
          routing,
          parsedTemplate.localeParamName,
          parsedTemplate.localeSegment,
          parsedTemplate.isRequired,
        ) as never,
      )) as LocalizedUseNavigateResult<TLocale, TDefaultFrom>;
  }

  function useRouter(): LocalizedRouter<TLocale, TRouter> {
    const router = useInjectedRouter();
    const pathname = useInjectedLocation().pathname;
    const activeLocale = useLocale();

    return {
      ...router,
      buildLocation(options) {
        return router.buildLocation(
          getLocalizedOptions(
            options,
            pathname,
            activeLocale,
            routing,
            parsedTemplate.localeParamName,
            parsedTemplate.localeSegment,
            parsedTemplate.isRequired,
          ) as never,
        );
      },
      navigate(options) {
        return router.navigate(
          getLocalizedOptions(
            options,
            pathname,
            activeLocale,
            routing,
            parsedTemplate.localeParamName,
            parsedTemplate.localeSegment,
            parsedTemplate.isRequired,
          ) as never,
        );
      },
      preloadRoute(options) {
        return router.preloadRoute?.(
          getLocalizedOptions(
            options,
            pathname,
            activeLocale,
            routing,
            parsedTemplate.localeParamName,
            parsedTemplate.localeSegment,
            parsedTemplate.isRequired,
          ) as never,
        );
      },
    } as LocalizedRouter<TLocale, TRouter>;
  }

  return {
    Link,
    getPathname,
    useLocale,
    useNavigate,
    usePathname,
    useRouter,
  };
}

function getLocalizedOptions<
  TLocale extends string,
  TOptions extends {
    locale?: TLocale;
    params?: unknown;
    to?: unknown;
  },
>(
  options: TOptions,
  currentPathname: string,
  activeLocale: TLocale,
  routing: RoutingConfig<TLocale>,
  localeParamName: string,
  localeSegment: string,
  isRequired: boolean,
): Omit<TOptions, "locale"> {
  const nextLocale = options.locale ?? activeLocale;
  const localized = {
    ...options,
  } as Omit<TOptions, "locale"> & {
    params?: unknown;
    to?: unknown;
  };

  delete (localized as { locale?: TLocale }).locale;

  if (
    !shouldLocalizeTarget(
      options.to,
      currentPathname,
      routing,
      localeParamName,
      localeSegment,
    )
  ) {
    return localized;
  }

  if (
    typeof options.to === "string" &&
    shouldRewriteTo(options.to) &&
    !pathContainsLocaleParam(options.to, localeParamName)
  ) {
    localized.to = localizePathname(
      options.to,
      nextLocale,
      routing,
    ) as TOptions["to"];
  }

  localized.params = localizeParams(
    options.params,
    localeParamName,
    isRequired
      ? nextLocale
      : nextLocale === routing.defaultLocale
        ? undefined
        : nextLocale,
  );

  return localized;
}

function localizeParams(
  params: unknown,
  localeParamName: string,
  locale: string | undefined,
) {
  if (params === true || params === undefined) {
    return (current: Record<string, unknown>) =>
      mergeLocaleParam(current, localeParamName, locale);
  }

  if (typeof params === "function") {
    return (current: Record<string, unknown>) =>
      mergeLocaleParam(
        (params as (value: Record<string, unknown>) => Record<string, unknown>)(
          current,
        ),
        localeParamName,
        locale,
      );
  }

  if (params && typeof params === "object") {
    return mergeLocaleParam(
      params as Record<string, unknown>,
      localeParamName,
      locale,
    );
  }

  return params;
}

function mergeLocaleParam(
  params: Record<string, unknown> | undefined,
  localeParamName: string,
  locale: string | undefined,
) {
  const nextParams = {
    ...(params ?? {}),
  };

  if (locale === undefined) {
    delete nextParams[localeParamName];
    return nextParams;
  }

  nextParams[localeParamName] = locale;

  return nextParams;
}

function shouldLocalizeTarget<TLocale extends string>(
  to: unknown,
  currentPathname: string,
  routing: RoutingConfig<TLocale>,
  localeParamName: string,
  localeSegment: string,
): boolean {
  if (typeof to !== "string" || to === "" || to === "." || to.startsWith(".")) {
    return isPathnameInScope(currentPathname, routing);
  }

  if (to.startsWith("#") || to.startsWith("?")) {
    return isPathnameInScope(currentPathname, routing);
  }

  if (isAbsoluteHref(to)) {
    return false;
  }

  const { pathname } = splitHrefString(to);
  const normalizedPathname = stripLocalePlaceholder(
    pathname,
    localeParamName,
    localeSegment,
  );

  return isPathnameInScope(normalizedPathname, routing);
}

function pathContainsLocaleParam(to: string, localeParamName: string): boolean {
  return to
    .split("/")
    .some((s) => s === `$${localeParamName}` || s === `{$${localeParamName}}`);
}

function shouldRewriteTo(to: string): boolean {
  return (
    !to.startsWith(".") &&
    !to.startsWith("#") &&
    !to.startsWith("?") &&
    !isAbsoluteHref(to)
  );
}

function stripLocalePlaceholder(
  pathname: string,
  localeParamName: string,
  localeSegment: string,
): string {
  const localeTokens = new Set([
    localeSegment,
    `$${localeParamName}`,
    `{$${localeParamName}}`,
  ]);
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => !localeTokens.has(segment));

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

function resolveActiveLocale<TLocale extends string>(
  pathname: string,
  routing: RoutingConfig<TLocale>,
): TLocale {
  return getPathnameLocale(pathname, routing) ?? routing.defaultLocale;
}
