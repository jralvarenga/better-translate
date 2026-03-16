# Better Translate Markdown And MDX Guide

## What This Is

`@better-translate/md` is the Markdown and MDX adapter package.

It lets you load localized `.md` and `.mdx` files by using the same configured
translator you already created with `better-translate`.

It does not create a second locale config.

## When To Use It

Read this guide when:

- you want to translate Markdown files
- you want to translate MDX files
- you want localized docs, blog posts, or content pages
- you want Markdown/MDX to use the same locale and fallback rules as the rest of your app

## Mental Model

Use this sentence:

“Core decides the locale. `@better-translate/md` loads the localized content file for that locale.”

That means:

- `better-translate` still owns `defaultLocale`, `fallbackLocale`, and supported locales
- `@better-translate/md` reads those values from the translator
- your Markdown and MDX files follow the same locale behavior as your strings

## File Layout

Use this folder structure:

```txt
content/
  en/docs/getting-started.mdx
  es/docs/getting-started.mdx
  en/blog/intro.md
  es/blog/intro.md
```

The document id is the path without the locale folder and without the extension.

Examples:

- `docs/getting-started`
- `blog/intro`

## Basic Setup

First configure translations like normal:

```ts
import { configureTranslations } from "better-translate/core";

import en from "./locales/en.json";
import es from "./locales/es.json";

export const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: {
    en,
    es,
  },
});
```

Then create Markdown helpers from that same translator:

```ts
import { createMarkdownHelpers } from "@better-translate/md";

import { translator } from "./i18n";

export const docs = createMarkdownHelpers(translator, {
  rootDir: "./content",
});
```

## Basic Usage

Load a document:

```ts
const document = await docs.getDocument("docs/getting-started", {
  locale: "es",
});
```

The returned document includes:

- `id`
- `locale`
- `requestedLocale`
- `kind`
- `path`
- `source`
- `frontmatter`
- `usedFallback`

List documents from the default locale directory:

```ts
const documentIds = await docs.listDocuments();
```

Compile Markdown or MDX:

```ts
const compiled = await docs.compileDocument("docs/getting-started", {
  locale: "es",
});
```

Behavior:

- `.md` returns HTML
- `.mdx` returns compiled module code

## Fallback Behavior

If the requested locale file does not exist, `@better-translate/md` tries the
translator fallback locale.

That means:

- request `es/docs/getting-started.mdx`
- if it does not exist, try `en/docs/getting-started.mdx`
- if neither exists, throw `MarkdownDocumentNotFoundError`

This is why the translator remains the single source of truth.

## Next.js Usage

In a Next.js app, keep the same setup you already use for strings:

1. Create the translator with `configureTranslations(...)`
2. Create request config with `getRequestConfig(...)`
3. Create Markdown server helpers with `createMarkdownServerHelpers(...)`

Example:

```ts
import { getRequestConfig } from "@better-translate/nextjs/server";
import { createMarkdownServerHelpers } from "@better-translate/md/server";
import { configureTranslations } from "better-translate/core";

import en from "../locales/en.json";
import es from "../locales/es.json";

const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: {
    en,
    es,
  },
});

export const requestConfig = getRequestConfig(async () => ({
  locale: "en",
  translator,
}));

export const markdown = createMarkdownServerHelpers(requestConfig, {
  rootDir: "./content",
});
```

Then in a server component:

```ts
const document = await markdown.getDocument("docs/getting-started", {
  locale: "es",
});
```

This keeps string translations and MDX translations on the same locale contract.

## Important Files

- `packages/md/src/collection.ts`
- `packages/md/src/server.ts`
- `packages/md/src/types.ts`
- `packages/md/README.md`

## What To Copy

- Copy the normal core translator setup first.
- Copy `createMarkdownHelpers(...)` for plain TypeScript, Bun, or server apps.
- Copy `createMarkdownServerHelpers(...)` when your app already uses Next.js request config.
