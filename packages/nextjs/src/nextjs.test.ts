import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { NextRequest, NextResponse } from "next/server";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

import { configureTranslations } from "better-translate/core";

import { createNavigationFunctions } from "./navigation.js";
import {
  createProxy,
  defaultProxyMatcher,
  getProxyMatcher,
  withBetterTranslate,
} from "./proxy.js";
import {
  createServerHelpers,
  getRequestConfig,
  setRequestLocale,
} from "./server.js";
import {
  buildDomainAwareHref,
  defineRouting,
  getLocaleFromDomain,
  getPathnameLocale,
  hasLocale,
  isPathnameInScope,
  localizePathname,
  stripLocaleFromPathname,
} from "./shared.js";

describe("@better-translate/nextjs", () => {
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

  it("supports root-scoped route templates by default", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
    });

    expect(getPathnameLocale("/es/products", routing)).toBe("es");
    expect(stripLocaleFromPathname("/es/products", routing)).toBe("/products");
    expect(localizePathname("/products", "en", routing)).toBe("/en/products");
    expect(defaultProxyMatcher).toEqual([
      "/((?!api|_next|_vercel|.*\\..*).*)",
    ]);
  });

  it("scopes locale routing to the configured route template", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
      routeTemplate: "/app/[lang]",
    });

    expect(getPathnameLocale("/app/es/dashboard", routing)).toBe("es");
    expect(stripLocaleFromPathname("/app/es/dashboard", routing)).toBe(
      "/app/dashboard",
    );
    expect(localizePathname("/app/dashboard", "en", routing)).toBe(
      "/app/en/dashboard",
    );
    expect(localizePathname("/login", "en", routing)).toBe("/login");
    expect(isPathnameInScope("/app/dashboard", routing)).toBe(true);
    expect(isPathnameInScope("/login", routing)).toBe(false);
  });

  it("redirects only in-scope non-localized requests", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
      routeTemplate: "/app/[lang]",
    });
    const proxy = createProxy(routing);

    const inScopeRequest = new NextRequest("https://example.com/app/dashboard", {
      headers: {
        "accept-language": "es-ES,es;q=0.9,en;q=0.8",
      },
    });
    const outOfScopeRequest = new NextRequest("https://example.com/login", {
      headers: {
        "accept-language": "es-ES,es;q=0.9,en;q=0.8",
      },
    });

    expect(proxy(inScopeRequest)?.headers.get("location")).toBe(
      "https://example.com/app/es/dashboard",
    );
    expect(proxy(outOfScopeRequest)).toBeUndefined();
  });

  it("redirects scoped localized requests to the configured locale domain", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
      routeTemplate: "/app/[lang]",
      domains: [
        {
          domain: "example.com",
          defaultLocale: "en",
          locales: ["en"],
        },
        {
          domain: "es.example.com",
          defaultLocale: "es",
          locales: ["es"],
        },
      ],
    });
    const proxy = createProxy(routing);
    const request = new NextRequest("https://example.com/app/es/dashboard");

    const response = proxy(request);

    expect(response?.headers.get("location")).toBe(
      "https://es.example.com/app/es/dashboard",
    );
  });

  it("composes with the user proxy and runs better-translate first", async () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
      routeTemplate: "/app/[lang]",
    });
    let userProxyCalls = 0;
    const userProxy = () => {
      userProxyCalls += 1;
      return NextResponse.next();
    };
    const proxy = withBetterTranslate(userProxy, routing);

    const redirectingRequest = new NextRequest("https://example.com/app/dashboard", {
      headers: {
        "accept-language": "es-ES,es;q=0.9,en;q=0.8",
      },
    });
    const passthroughRequest = new NextRequest("https://example.com/app/en/dashboard");

    const redirectingResponse = await proxy(redirectingRequest, {} as never);
    const passthroughResponse = await proxy(passthroughRequest, {} as never);

    expect(redirectingResponse?.headers.get("location")).toBe(
      "https://example.com/app/es/dashboard",
    );
    expect(userProxyCalls).toBe(1);
    expect(passthroughResponse?.headers.get("x-middleware-next")).toBe("1");
  });

  it("builds scoped proxy matchers", () => {
    const rootRouting = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
    });
    const nestedRouting = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
      routeTemplate: "/app/[lang]",
    });

    expect(getProxyMatcher(rootRouting)).toEqual(defaultProxyMatcher);
    expect(getProxyMatcher(nestedRouting)).toEqual([
      "/app",
      "/app/((?!.*\\..*).*)",
    ]);
  });

  it("keeps domain-aware href generation working for nested locale routes", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
      routeTemplate: "/app/[lang]",
      domains: [
        {
          domain: "example.com",
          defaultLocale: "en",
        },
        {
          domain: "es.example.com",
          defaultLocale: "es",
        },
      ],
    });

    expect(getLocaleFromDomain(routing, "es.example.com")).toBe("es");
    expect(
      buildDomainAwareHref(routing, "/app/dashboard?ref=hero", "es", {
        currentHost: "example.com",
      }),
    ).toEqual({
      href: "https://es.example.com/app/es/dashboard?ref=hero",
      external: true,
    });
    expect(
      buildDomainAwareHref(routing, "/login?ref=hero", "es", {
        currentHost: "example.com",
      }),
    ).toEqual({
      href: "/login?ref=hero",
      external: false,
    });
  });

  it("wraps injected navigation hooks and components", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
      routeTemplate: "/app/[lang]",
      domains: [
        {
          domain: "example.com",
          defaultLocale: "en",
          locales: ["en"],
        },
        {
          domain: "es.example.com",
          defaultLocale: "es",
          locales: ["es"],
        },
      ],
    });
    const routerCalls: Array<{
      href: string;
      method: "prefetch" | "push" | "replace";
      options?: Record<string, unknown>;
    }> = [];
    const locationCalls: Array<{
      href: string;
      method: "assign" | "replace";
    }> = [];

    (
      globalThis as typeof globalThis & {
        window?: {
          location: {
            assign(href: string): void;
            host: string;
            protocol: string;
            replace(href: string): void;
          };
        };
      }
    ).window = {
      location: {
        assign(href: string) {
          locationCalls.push({
            href,
            method: "assign",
          });
        },
        host: "example.com",
        protocol: "https:",
        replace(href: string) {
          locationCalls.push({
            href,
            method: "replace",
          });
        },
      },
    };

    const navigation = createNavigationFunctions({
      Link(props: { children?: string; href: string }) {
        return createElement(
          "a",
          {
            "data-href": props.href,
          },
          props.children,
        );
      },
      routing,
      useParams() {
        return {
          lang: "en",
        };
      },
      usePathname() {
        return "/app/en/dashboard";
      },
      useRouter() {
        return {
          prefetch(href: string, options?: Record<string, unknown>) {
            routerCalls.push({
              href,
              method: "prefetch",
              options,
            });
          },
          push(href: string, options?: Record<string, unknown>) {
            routerCalls.push({
              href,
              method: "push",
              options,
            });
          },
          replace(href: string, options?: Record<string, unknown>) {
            routerCalls.push({
              href,
              method: "replace",
              options,
            });
          },
        };
      },
    });
    const localizedRouter = navigation.useRouter();
    const renderedLink = renderToStaticMarkup(
      createElement(
        navigation.Link,
        {
          href: "/app/dashboard",
        },
        "Dashboard",
      ),
    );

    localizedRouter.push("/app/settings");
    localizedRouter.replace("/app/settings", {
      locale: "es",
      scroll: false,
    });
    localizedRouter.prefetch("/app/reports", {
      locale: "en",
      kind: "auto",
    });
    localizedRouter.push("/login");

    expect(navigation.usePathname()).toBe("/app/dashboard");
    expect(
      navigation.getPathname({
        href: "/app/settings",
        locale: "es",
      }),
    ).toBe("/app/es/settings");
    expect(renderedLink).toContain(
      'data-href="https://example.com/app/en/dashboard"',
    );
    expect(routerCalls[0]).toEqual({
      href: "/app/en/settings",
      method: "push",
      options: {},
    });
    expect(routerCalls[1]).toEqual({
      href: "/app/en/reports",
      method: "prefetch",
      options: {
        kind: "auto",
      },
    });
    expect(routerCalls[2]).toEqual({
      href: "/login",
      method: "push",
      options: {},
    });
    expect(locationCalls[0]).toEqual({
      href: "https://es.example.com/app/es/settings",
      method: "replace",
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

  it("prefers the request locale set in layout over the request-config locale", async () => {
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
      locale: "en" as const,
      translator,
    }));
    const helpers = createServerHelpers(requestConfig);

    setRequestLocale("es");

    expect(await helpers.getLocale()).toBe("es");
    expect(await helpers.getDirection()).toBe("rtl");
    expect(await helpers.getMessages()).toEqual({
      home: {
        title: "Hola",
      },
    });
    expect((await helpers.getTranslations())("home.title")).toBe("Hola");
    expect((await helpers.getTranslations({ locale: "en" }))("home.title")).toBe(
      "Hello",
    );
  });

  it("falls back to the translator default locale when no request locale is set", async () => {
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

    const helpers = createServerHelpers(
      getRequestConfig(async () => ({
        translator,
      })),
    );

    expect(await helpers.getLocale()).toBe("en");
    expect(await helpers.getDirection()).toBe("ltr");
    expect(await helpers.isRtl()).toBe(false);
    expect((await helpers.getTranslations())("home.title")).toBe("Hello");
  });

  it("rejects an unsupported stored request locale", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
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

    const helpers = createServerHelpers(
      getRequestConfig(async () => ({
        translator,
      })),
    );

    setRequestLocale("pt");

    await expect(helpers.getTranslations()).rejects.toThrow(
      'The locale "pt" is not included in the translator\'s supported locales.',
    );
  });
});
