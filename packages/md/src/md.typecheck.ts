import { configureTranslations } from "better-translate/core";
import { setRequestLocale } from "better-translate/server";

import {
  createMarkdownCollection,
  createMarkdownHelpers,
} from "./index.js";
import { createMarkdownServerHelpers } from "./server.js";

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

const helperLocale: "en" | "es" = helperDocument.locale;
const collectionLocale: "en" | "es" = collectionDocument.locale;
const serverLocale: "en" | "es" = serverDocument.locale;

void helperLocale;
void collectionLocale;
void serverLocale;
