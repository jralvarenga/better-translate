import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";

import { configureTranslations } from "better-translate/core";

import { createProxy, defaultProxyMatcher } from "./proxy.js";
import { createServerHelpers, getRequestConfig } from "./server.js";
import {
  buildDomainAwareHref,
  defineRouting,
  getLocaleFromDomain,
  getPathnameLocale,
  hasLocale,
  stripLocaleFromPathname,
} from "./shared.js";

describe("@better-translate/nextjs", () => {
  it("narrows locales with hasLocale", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
    });

    expect(hasLocale(routing.locales, "en")).toBe(true);
    expect(hasLocale(routing.locales, "pt")).toBe(false);
  });

  it("strips locale prefixes from pathnames", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
    });

    expect(getPathnameLocale("/es/products", routing.locales)).toBe("es");
    expect(stripLocaleFromPathname("/es/products", routing.locales)).toBe(
      "/products",
    );
    expect(stripLocaleFromPathname("/en", routing.locales)).toBe("/");
  });

  it("redirects non-localized requests using Accept-Language", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
    });
    const proxy = createProxy(routing);
    const request = new NextRequest("https://example.com/products", {
      headers: {
        "accept-language": "es-ES,es;q=0.9,en;q=0.8",
      },
    });

    const response = proxy(request);

    expect(response?.headers.get("location")).toBe(
      "https://example.com/es/products",
    );
  });

  it("redirects localized requests to the configured locale domain", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
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
    const request = new NextRequest("https://example.com/es/products");

    const response = proxy(request);

    expect(response?.headers.get("location")).toBe(
      "https://es.example.com/es/products",
    );
  });

  it("keeps localized same-domain requests untouched", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
    });
    const proxy = createProxy(routing);
    const request = new NextRequest("https://example.com/en/products");

    expect(proxy(request)).toBeUndefined();
  });

  it("resolves locales from configured domains", () => {
    const routing = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
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
      buildDomainAwareHref(routing, "/products?ref=hero", "es", {
        currentHost: "example.com",
      }),
    ).toEqual({
      href: "https://es.example.com/es/products?ref=hero",
      external: true,
    });
  });

  it("binds server translations to the resolved locale", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en: {
          home: {
            title: "Hello",
            greeting: "Hello {name}",
          },
        },
        es: {
          home: {
            title: "Hola",
            greeting: "Hola {name}",
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
    expect(t("home.title")).toBe("Hola");
    expect(
      t("home.greeting", {
        params: {
          name: "Ada",
        },
      }),
    ).toBe("Hola Ada");
    expect(await helpers.getMessages()).toEqual({
      home: {
        title: "Hola",
        greeting: "Hola {name}",
      },
    });
  });

  it("exports the default proxy matcher", () => {
    expect(defaultProxyMatcher).toEqual([
      "/((?!api|_next|_vercel|.*\\..*).*)",
    ]);
  });
});
