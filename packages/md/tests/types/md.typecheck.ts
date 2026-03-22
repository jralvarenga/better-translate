import { configureTranslations } from "@better-translate/core";
import { setRequestLocale } from "@better-translate/core/server";

import {
  createMarkdownCollection,
  createMarkdownHelpers,
} from "../../dist/index.js";
import { createMarkdownServerHelpers } from "../../dist/server.js";

const en = {
  common: {
    hello: "Hello",
  },
} as const;

const es = {
  common: {
    hello: "Hola",
  },
} as const;

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
    en,
    es,
  },
});

const docs = createMarkdownHelpers(translator, {
  rootDir: "./content",
});

const collection = createMarkdownCollection({
  rootDir: "./content",
  translator,
});

const serverDocs = createMarkdownServerHelpers(
  async () => ({
    translator,
  }),
  {
    rootDir: "./content",
  },
);

setRequestLocale("es");

const helperDocument = await docs.getDocument("docs/guide", {
  locale: "es",
});
const collectionDocument = await collection.getDocument("docs/guide", {
  locale: "en",
});
const serverDocument = await serverDocs.getDocument("docs/guide");
const availableLanguages = await serverDocs.getAvailableLanguages();
const direction = await serverDocs.getDirection();
const rtl = await serverDocs.isRtl();
const explicitDirection = await serverDocs.getDirection({
  locale: "es",
});

const helperLocale: "en" | "es" = helperDocument.locale;
const collectionLocale: "en" | "es" = collectionDocument.locale;
const serverLocale: "en" | "es" = serverDocument.locale;
const availableLanguageLocale: "en" | "es" = availableLanguages[0]!.locale;
const helperDirection: "ltr" | "rtl" = direction;
const helperRtl: boolean = rtl;
const localeDirection: "ltr" | "rtl" = explicitDirection;

void helperLocale;
void collectionLocale;
void serverLocale;
void availableLanguageLocale;
void helperDirection;
void helperRtl;
void localeDirection;
