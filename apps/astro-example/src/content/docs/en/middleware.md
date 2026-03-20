---
title: Middleware
description: How createBetterTranslateMiddleware sets the active locale on every request and integrates with Astro's middleware pipeline.
---

# Middleware

Better Translate uses Astro's middleware system to set the active locale on every request before any page component renders.

## Setup

Export the middleware from `src/middleware.ts`:

```ts
import { createBetterTranslateMiddleware } from "@better-translate/astro/middleware";
import { requestConfig } from "./lib/i18n/request";

export const onRequest = createBetterTranslateMiddleware(requestConfig);
```

Astro automatically picks up `src/middleware.ts` and runs `onRequest` on every request.

## What it does

`createBetterTranslateMiddleware` does two things on each request:

1. **Detects the locale** from the URL using the Astro i18n routing rules defined in `astro.config.mjs`
2. **Stores the locale** in the request context so `getLocale()` and `getTranslations()` can access it from any `.astro` component

## Accessing the locale in components

After the middleware runs, use the server helpers to read the locale:

```astro
---
import { getLocale, getTranslations } from "../lib/i18n/server";

const locale = await getLocale();       // "en" | "es"
const t = await getTranslations();     // typed translation function
---

<p>{t("home.title")}</p>
```

Both helpers read from the same request context populated by the middleware — no prop drilling required.

## Composing with other middleware

If you have additional Astro middleware (e.g. authentication), you can compose them using the `sequence` helper from `astro:middleware`:

```ts
import { sequence } from "astro:middleware";
import { createBetterTranslateMiddleware } from "@better-translate/astro/middleware";
import { requestConfig } from "./lib/i18n/request";
import { authMiddleware } from "./auth";

export const onRequest = sequence(
  createBetterTranslateMiddleware(requestConfig),
  authMiddleware,
);
```

Better Translate's middleware should run **first** so that `getLocale()` is available to any subsequent middleware.

## Static builds

In Astro's static output mode (`output: "static"`), middleware does not run at request time. Instead, call `setRequestLocale(locale)` at the top of each page to set the locale before rendering:

```astro
---
import { setRequestLocale } from "../lib/i18n/server";

// Derive from the route params, e.g. Astro.params.lang
setRequestLocale("en");
---
```
