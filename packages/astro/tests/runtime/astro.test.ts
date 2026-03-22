import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import { configureTranslations } from "@better-translate/core";

import {
  ContentDocumentNotFoundError,
  createContentCollectionHelpers,
} from "../../src/content.js";
import { createBetterTranslateMiddleware } from "../../src/middleware.js";
import {
  createServerHelpers,
  getRequestConfig,
  setRequestLocale,
} from "../../src/server.js";

describe("@better-translate/astro", () => {
  beforeEach(() => {
    setRequestLocale(undefined);
  });

  afterEach(() => {
    setRequestLocale(undefined);
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
      },
      loaders: {
        es: async () => ({
          home: {
            greeting: "Hola {name}",
            title: "Hola",
          },
        }),
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
    expect(t("home.title")).toBe("Hola");
    expect(
      t("home.greeting", {
        params: {
          name: "Ada",
        },
      }),
    ).toBe("Hola Ada");
    expect(await helpers.getDirection()).toBe("rtl");
    expect(await helpers.isRtl()).toBe(true);
    expect(
      await helpers.getDirection({
        config: {
          rtl: false,
        },
      }),
    ).toBe("ltr");
    expect(await helpers.getMessages()).toEqual({
      home: {
        greeting: "Hola {name}",
        title: "Hola",
      },
    });
  });

  it("lets Astro middleware set the request locale from currentLocale", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en: {
          nav: {
            title: "Hello",
          },
        },
        es: {
          nav: {
            title: "Hola",
          },
        },
      },
    });
    const requestConfig = getRequestConfig(async () => ({
      translator,
    }));
    const middleware = createBetterTranslateMiddleware(requestConfig);
    const helpers = createServerHelpers(requestConfig);
    const context = {
      currentLocale: "es",
      locals: {},
      request: new Request("https://example.com/es"),
      url: new URL("https://example.com/es"),
    };
    let nextCalled = false;

    const response = await middleware(context, async () => {
      nextCalled = true;
      const t = await helpers.getTranslations();

      expect(t("nav.title")).toBe("Hola");

      return new Response("ok");
    });

    expect(nextCalled).toBe(true);
    expect(await response.text()).toBe("ok");
    expect(context.locals.betterTranslate).toEqual({
      locale: "es",
    });
    expect(await helpers.getLocale()).toBe("es");
  });

  it("supports manual Astro locale resolution overrides in middleware", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en: {
          nav: {
            title: "Hello",
          },
        },
        es: {
          nav: {
            title: "Hola",
          },
        },
      },
    });
    const requestConfig = getRequestConfig(async () => ({
      translator,
    }));
    const middleware = createBetterTranslateMiddleware(requestConfig, {
      async resolveLocale() {
        return "es" as const;
      },
    });
    const helpers = createServerHelpers(requestConfig);

    await middleware(
      {
        currentLocale: "en",
        locals: {},
        request: new Request("https://example.com/docs"),
        url: new URL("https://example.com/docs"),
      },
      async () => new Response("ok"),
    );

    expect(await helpers.getLocale()).toBe("es");
  });

  it("resolves localized Astro content entries and renders them through the injected renderer", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en: {
          docs: {
            title: "Docs",
          },
        },
        es: {
          docs: {
            title: "Documentos",
          },
        },
      },
    });
    const requestConfig = getRequestConfig(async () => ({
      translator,
    }));
    const docs = createContentCollectionHelpers(requestConfig, {
      collection: "docs",
      getCollection() {
        return [
          {
            body: "# Hello",
            data: {
              title: "Getting Started",
            },
            id: "en/docs/getting-started",
          },
          {
            body: "# Hola",
            data: {
              title: "Introduccion",
            },
            id: "es/docs/getting-started",
          },
          {
            body: "# Demo",
            data: {
              title: "Component Demo",
            },
            id: "en/docs/component-demo",
          },
        ] as const;
      },
      async render(entry) {
        return {
          Content: `<article>${entry.body}</article>`,
          headings: [
            {
              depth: 1,
              slug: entry.data.title.toLowerCase().replaceAll(" ", "-"),
              text: entry.data.title,
            },
          ],
        };
      },
    });

    setRequestLocale("es");

    expect(await docs.listDocuments()).toEqual([
      "docs/component-demo",
      "docs/getting-started",
    ]);

    const document = await docs.getDocument("docs/getting-started");
    expect(document.locale).toBe("es");
    expect(document.requestedLocale).toBe("es");
    expect(document.usedFallback).toBe(false);
    expect(document.data.title).toBe("Introduccion");

    const fallbackDocument = await docs.getDocument("docs/component-demo");
    expect(fallbackDocument.locale).toBe("en");
    expect(fallbackDocument.requestedLocale).toBe("es");
    expect(fallbackDocument.usedFallback).toBe(true);

    const rendered = await docs.renderDocument(document);
    expect(rendered.rendered).toEqual({
      Content: "<article># Hola</article>",
      headings: [
        {
          depth: 1,
          slug: "introduccion",
          text: "Introduccion",
        },
      ],
    });
  });

  it("throws a typed error when localized Astro content is missing", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en: {
          docs: {
            title: "Docs",
          },
        },
      },
      loaders: {
        es: async () => ({
          docs: {
            title: "Documentos",
          },
        }),
      },
    });
    const requestConfig = getRequestConfig(async () => ({
      translator,
    }));
    const docs = createContentCollectionHelpers(requestConfig, {
      collection: "docs",
      getCollection() {
        return [];
      },
      async render(entry) {
        return entry.id;
      },
    });

    setRequestLocale("es");

    await expect(docs.getDocument("docs/missing")).rejects.toBeInstanceOf(
      ContentDocumentNotFoundError,
    );
    await expect(docs.renderDocument("docs/missing")).rejects.toThrow(
      ContentDocumentNotFoundError,
    );
  });
});
