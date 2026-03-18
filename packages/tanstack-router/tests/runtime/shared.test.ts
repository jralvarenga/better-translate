import { describe, expect, it } from "bun:test";

import {
  defineRouting,
  isAbsoluteHref,
  localizePathname,
  parseRouteTemplate,
  splitHrefString,
  stripLocaleFromPathname,
} from "../../src/shared.js";

describe("@better-translate/tanstack-router shared helpers", () => {
  it("parses required and optional locale route templates", () => {
    expect(parseRouteTemplate("/{-$locale}")).toEqual({
      deLocalizedSegments: [],
      isRequired: false,
      localeParamName: "locale",
      localeSegment: "{-$locale}",
      localeSegmentIndex: 0,
      localizedSegments: ["{-$locale}"],
      routeTemplate: "/{-$locale}",
    });
    expect(parseRouteTemplate("/app/{$lang}")).toEqual({
      deLocalizedSegments: ["app"],
      isRequired: true,
      localeParamName: "lang",
      localeSegment: "{$lang}",
      localeSegmentIndex: 1,
      localizedSegments: ["app", "{$lang}"],
      routeTemplate: "/app/{$lang}",
    });
  });

  it("normalizes href fragments and absolute href detection", () => {
    expect(splitHrefString("about?ref=nav#top")).toEqual({
      hash: "#top",
      pathname: "/about",
      search: "?ref=nav",
    });
    expect(isAbsoluteHref("mailto:test@example.com")).toBe(true);
    expect(isAbsoluteHref("/pricing")).toBe(false);
  });

  it("localizes and strips pathnames for optional and required routes", () => {
    const optionalRouting = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
    });
    const requiredRouting = defineRouting({
      locales: ["en", "es"] as const,
      defaultLocale: "en",
      routeTemplate: "/app/{$lang}",
    });

    expect(localizePathname("/pricing", "en", optionalRouting)).toBe(
      "/pricing",
    );
    expect(localizePathname("/pricing", "es", optionalRouting)).toBe(
      "/es/pricing",
    );
    expect(stripLocaleFromPathname("/es/pricing", optionalRouting)).toBe(
      "/pricing",
    );
    expect(localizePathname("/app/dashboard", "es", requiredRouting)).toBe(
      "/app/es/dashboard",
    );
  });

  it("rejects invalid routing declarations and templates", () => {
    expect(() =>
      defineRouting({
        locales: [] as const,
        defaultLocale: "en" as never,
      }),
    ).toThrow("defineRouting(...) requires at least one locale.");
    expect(() =>
      defineRouting({
        locales: ["en", "en"] as const,
        defaultLocale: "en",
      }),
    ).toThrow('Duplicate locale "en" found in routing config.');
    expect(() =>
      defineRouting({
        locales: ["en"] as const,
        defaultLocale: "es" as never,
      }),
    ).toThrow('Default locale "es" must be included in locales.');
    expect(() => parseRouteTemplate("/app/[lang]")).toThrow(
      'Route template "/app/[lang]" can only contain one locale segment like "{-$locale}" or "{$locale}" plus static path segments.',
    );
    expect(() => parseRouteTemplate("/app")).toThrow(
      'Route template "/app" must contain one locale segment like "{-$locale}" or "{$locale}".',
    );
  });
});
