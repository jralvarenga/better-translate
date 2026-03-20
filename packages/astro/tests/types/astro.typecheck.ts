import { configureTranslations } from "better-translate/core";

import { createContentCollectionHelpers } from "../../dist/content.js";
import {
  createBetterTranslateMiddleware,
  type BetterTranslateLocals,
} from "../../dist/middleware.js";
import {
  createServerHelpers,
  getRequestConfig,
  setRequestLocale,
} from "../../dist/index.js";

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
  translator,
}));
const helpers = createServerHelpers(requestConfig);
const docs = createContentCollectionHelpers(requestConfig, {
  collection: "docs",
  getCollection() {
    return [
      {
        data: {
          title: "Getting Started",
        },
        id: "en/docs/getting-started",
      },
      {
        data: {
          title: "Introduccion",
        },
        id: "es/docs/getting-started",
      },
    ] as const;
  },
  render(entry) {
    return {
      Content: entry.id,
      headings: entry.data.title,
    };
  },
});
const middleware = createBetterTranslateMiddleware(requestConfig);

setRequestLocale("en");

const t = await helpers.getTranslations();
const languages = await helpers.getAvailableLanguages();
const document = await docs.getDocument("docs/getting-started");
const rendered = await docs.renderDocument("docs/getting-started", {
  locale: "es",
});

t("home.title");
t("home.greeting", {
  params: {
    name: "Ada",
  },
});
languages[0]?.locale;
await helpers.getDirection();
await helpers.getDirection({
  locale: "es",
});
await helpers.getDirection({
  config: {
    rtl: true,
  },
});
await helpers.isRtl();
await helpers.isRtl({
  locale: "es",
});
document.data.title;
rendered.rendered.Content;

await middleware(
  {
    currentLocale: "en",
    locals: {} satisfies BetterTranslateLocals<"en" | "es">,
    request: new Request("https://example.com"),
    url: new URL("https://example.com"),
  },
  async () => new Response("ok"),
);

// @ts-expect-error unsupported locale should fail
await helpers.getTranslations({ locale: "pt" });

// @ts-expect-error params are required for placeholder messages
t("home.greeting");

// @ts-expect-error unsupported locale should fail
await docs.getDocument("docs/getting-started", { locale: "pt" });
