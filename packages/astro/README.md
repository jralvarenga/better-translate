# @better-translate/astro

Astro request helpers and localized content utilities for Better Translate.

This package follows the same mental model as the Next.js and TanStack Router
adapters:

1. `configureTranslations(...)` from `better-translate/core` creates the typed
   translator.
2. `getRequestConfig(...)` and `createServerHelpers(...)` make that translator
   request-friendly for Astro.
3. `createBetterTranslateMiddleware(...)` stores the current Astro locale for
   request-scoped helpers.
4. `createContentCollectionHelpers(...)` resolves localized Astro content
   collection entries for both `.md` and `.mdx`.

## Install

```sh
bun add @better-translate/astro better-translate astro
```

If you render `.mdx` documents through Astro content collections, also install
the MDX integration:

```sh
bun add @astrojs/mdx
```

## Astro i18n is the routing source of truth

This adapter does not replace Astro routing. Keep locale routing in
`astro.config.mjs`, then let Better Translate read the resolved locale from the
Astro request lifecycle.

## `src/lib/i18n/request.ts`

```ts
import { getRequestConfig } from "@better-translate/astro";
import { configureTranslations } from "better-translate/core";

import { en } from "./messages/en";
import { es } from "./messages/es";

export const requestConfig = getRequestConfig(async () => ({
  translator: await configureTranslations({
    availableLocales: ["en", "es"] as const,
    defaultLocale: "en",
    fallbackLocale: "en",
    messages: {
      en,
      es,
    },
  }),
}));
```

## `src/lib/i18n/server.ts`

```ts
import {
  createServerHelpers,
  setRequestLocale,
} from "@better-translate/astro";

import { requestConfig } from "./request";

export const {
  getAvailableLanguages,
  getDirection,
  getLocale,
  getMessages,
  getTranslations,
  getTranslator,
  isRtl,
} = createServerHelpers(requestConfig);

export { setRequestLocale };
```

## `src/middleware.ts`

```ts
import { createBetterTranslateMiddleware } from "@better-translate/astro/middleware";

import { requestConfig } from "./lib/i18n/request";

export const onRequest = createBetterTranslateMiddleware(requestConfig);
```

If you use manual or custom locale routing, override how the locale is read:

```ts
export const onRequest = createBetterTranslateMiddleware(requestConfig, {
  resolveLocale(context) {
    return context.params.locale;
  },
});
```

## Use translations in `.astro` files

```astro
---
import { getTranslations } from "../lib/i18n/server";

const t = await getTranslations();
---

<h1>{t("home.title")}</h1>
```

## Localized content collections for `.md` and `.mdx`

Place localized entries inside the same collection using locale-prefixed ids:

```txt
src/content/docs/
  en/getting-started.md
  en/component-demo.mdx
  es/getting-started.md
```

Create helpers in `src/lib/i18n/content.ts`:

```ts
import { getCollection, render } from "astro:content";
import { createContentCollectionHelpers } from "@better-translate/astro/content";

import { requestConfig } from "./request";

export const docs = createContentCollectionHelpers(requestConfig, {
  collection: "docs",
  getCollection,
  render,
});
```

Then read and render localized entries:

```astro
---
import { docs } from "../lib/i18n/content";
import { getLocale } from "../lib/i18n/server";

const locale = await getLocale();
const document = await docs.renderDocument("getting-started", { locale });
const { Content } = document.rendered;
---

{document.usedFallback && <p>Fallback content</p>}
<Content />
```

`createContentCollectionHelpers(...)` uses the requested locale first, then the
translator fallback locale, and works for both Markdown and MDX because Astro’s
own `render(entry)` handles the actual rendering.
