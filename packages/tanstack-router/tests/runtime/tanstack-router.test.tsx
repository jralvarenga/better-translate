import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { createElement, type ReactNode } from "react";

import { configureTranslations } from "@better-translate/core";

import { createNavigationFunctions } from "../../src/navigation.js";
import {
  createServerHelpers,
  getRequestConfig,
  setRequestLocale,
} from "../../src/server.js";
import {
  defineRouting,
  getPathnameLocale,
  hasLocale,
  isPathnameInScope,
  localizePathname,
  stripLocaleFromPathname,
} from "../../src/shared.js";

describe("@better-translate/tanstack-router", () => {
  beforeEach(() => {
    setRequestLocale(undefined);
  });

  afterEach(() => {
    setRequestLocale(undefined);
  });

  it("narrows locales with hasLocale", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
    });

    expect(hasLocale(routing.locales, "en")).toBe(true);
    expect(hasLocale(routing.locales, "pt")).toBe(false);
  });

  it("supports root optional locale segments by default", () => {
    const routing = defineRouting({
      locales: ["en", "fr"] as const,
      defaultLocale: "en",
    });

    expect(getPathnameLocale("/fr/about", routing)).toBe("fr");
    expect(getPathnameLocale("/about", routing)).toBeUndefined();
    expect(stripLocaleFromPathname("/fr/about", routing)).toBe("/about");
    expect(localizePathname("/about", "fr", routing)).toBe("/fr/about");
    expect(localizePathname("/fr/about", "en", routing)).toBe("/about");
    expect(isPathnameInScope("/about", routing)).toBe(true);
  });

  it("scopes locale routing to the configured route template", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
      routeTemplate: "/app/{-$lang}",
    });

    expect(getPathnameLocale("/app/es/dashboard", routing)).toBe("es");
    expect(stripLocaleFromPathname("/app/es/dashboard", routing)).toBe(
      "/app/dashboard",
    );
    expect(localizePathname("/app/dashboard", "es", routing)).toBe(
      "/app/es/dashboard",
    );
    expect(localizePathname("/app/es/dashboard", "en", routing)).toBe(
      "/app/dashboard",
    );
    expect(isPathnameInScope("/app/dashboard", routing)).toBe(true);
    expect(isPathnameInScope("/login", routing)).toBe(false);
  });

  it("wraps TanStack navigation primitives with locale-aware behavior", async () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
    });
    const navigateCalls: Array<Record<string, unknown>> = [];
    const buildLocationCalls: Array<Record<string, unknown>> = [];
    const preloadCalls: Array<Record<string, unknown>> = [];

    const navigation = createNavigationFunctions({
      Link(props: { children?: ReactNode; params?: unknown; to?: string }) {
        return createElement(
          "a",
          {
            "data-params": JSON.stringify(props.params ?? null),
            "data-to": props.to,
          },
          props.children,
        );
      },
      routing,
      useLocation() {
        return {
          pathname: "/es/about",
        };
      },
      useNavigate() {
        return (async (options: unknown) => {
          navigateCalls.push(options as Record<string, unknown>);
        }) as never;
      },
      useParams() {
        return {
          locale: "es" as const,
        };
      },
      useRouter() {
        return {
          buildLocation(options: Record<string, unknown>) {
            buildLocationCalls.push(options);
            return {
              external: false,
              hash: "",
              href: String(options.to ?? "/"),
              pathname: String(options.to ?? "/"),
              publicHref: String(options.to ?? "/"),
              search: {},
              searchStr: "",
              state: {},
            };
          },
          navigate(options: Record<string, unknown>) {
            navigateCalls.push(options);
            return Promise.resolve();
          },
          preloadRoute(options: Record<string, unknown>) {
            preloadCalls.push(options);
            return Promise.resolve(undefined);
          },
        } as never;
      },
    });

    const navigate = navigation.useNavigate();
    const router = navigation.useRouter();
    const link = renderToStaticMarkup(
      createElement(
        navigation.Link,
        {
          locale: "en",
          to: "/pricing",
        },
        "Pricing",
      ),
    );

    await navigate({
      locale: "en",
      to: "/about",
    });
    await navigate({
      locale: "es",
      to: "/blog/$postId",
      params: {
        postId: "hello-world",
      },
    });
    await navigate({
      locale: "es",
      to: "/login",
    });
    router.buildLocation({
      locale: "es",
      to: "/contact",
    });
    await router.preloadRoute?.({
      locale: "en",
      to: "/about",
    });

    expect(navigation.useLocale()).toBe("es");
    expect(navigation.usePathname()).toBe("/about");
    expect(
      navigation.getPathname({
        href: "/about",
        locale: "es",
      }),
    ).toBe("/es/about");
    expect(link).toContain('data-to="/pricing"');
    expect(link).not.toContain("data-params");

    expect(navigateCalls[0]).toMatchObject({
      to: "/about",
    });
    expect(
      (
        navigateCalls[0]?.params as (
          value: Record<string, unknown>,
        ) => Record<string, unknown>
      )({
        locale: "es",
      }),
    ).toEqual({});
    expect(navigateCalls[1]).toMatchObject({
      to: "/es/blog/$postId",
      params: {
        locale: "es",
        postId: "hello-world",
      },
    });
    expect(navigateCalls[2]).toMatchObject({
      to: "/es/login",
    });
    expect(buildLocationCalls[0]).toMatchObject({
      to: "/es/contact",
    });
    expect(preloadCalls[0]).toMatchObject({
      to: "/about",
    });
  });

  it("binds server translations to the resolved locale", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      directions: {
        es: "rtl",
      },
      languages: [
        {
          icon: "🇪🇸",
          locale: "es",
          nativeLabel: "Español",
          shortLabel: "ES",
        },
      ],
      messages: {
        en: {
          home: {
            greeting: "Hello {name}",
            title: "Hello",
          },
        },
        es: {
          home: {
            greeting: "Hola {name}",
            title: "Hola",
          },
        },
      },
    });

    const requestConfig = getRequestConfig(async () => ({
      locale: "es" as const,
      translator,
    }));
    const helpers = createServerHelpers(requestConfig);
    const t = await helpers.getTranslations();

    expect(await helpers.getLocale()).toBe("es");
    expect(await helpers.getAvailableLanguages()).toEqual([
      {
        icon: "🇪🇸",
        locale: "es",
        nativeLabel: "Español",
        shortLabel: "ES",
      },
      {
        locale: "en",
        nativeLabel: "en",
        shortLabel: "EN",
      },
    ]);
    expect(await helpers.getDirection()).toBe("rtl");
    expect(await helpers.isRtl()).toBe(true);
    expect(
      await helpers.getDirection({
        config: {
          rtl: false,
        },
      }),
    ).toBe("ltr");
    expect(t("home.title")).toBe("Hola");
    expect(
      t("home.greeting", {
        params: {
          name: "Ada",
        },
      }),
    ).toBe("Hola Ada");
  });

  it("prefers the explicit request locale over the request-config locale", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      directions: {
        es: "rtl",
      },
      messages: {
        en: {
          home: {
            title: "Hello",
          },
        },
        es: {
          home: {
            title: "Hola",
          },
        },
      },
    });

    const requestConfig = getRequestConfig(async () => ({
      locale: "es" as const,
      translator,
    }));
    const helpers = createServerHelpers(requestConfig);

    setRequestLocale("en");

    expect(await helpers.getLocale()).toBe("en");
    expect(await helpers.getDirection()).toBe("ltr");
    expect((await helpers.getTranslations())("home.title")).toBe("Hello");
  });
});
