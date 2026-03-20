---
title: Configuration
description: All configuration options for Better Translate in an Astro project — request config, i18n settings, and middleware.
---

# Configuration

Better Translate configuration lives in three places: your request config file, `astro.config.mjs`, and the optional middleware export.

## Request config (`src/lib/i18n/request.ts`)

This is the main configuration file. It wires together your locales, messages, and optional settings.

```ts
import { getRequestConfig } from "@better-translate/astro";
import { configureTranslations } from "better-translate/core";

import { en } from "./messages/en";
import { es } from "./messages/es";

export const appLocales = ["en", "es"] as const;
export const defaultLocale = "en" as const;

export const requestConfig = getRequestConfig(async () => ({
  translator: await configureTranslations({
    availableLocales: appLocales,
    defaultLocale,
    fallbackLocale: defaultLocale,   // locale to use when a key is missing
    languages: [
      { locale: "en", nativeLabel: "English", shortLabel: "EN" },
      { locale: "es", nativeLabel: "Español", shortLabel: "ES" },
    ],
    messages: { en, es },
  }),
}));
```

### `configureTranslations` options

| Option | Type | Description |
|--------|------|-------------|
| `availableLocales` | `readonly string[]` | All supported locale codes |
| `defaultLocale` | `string` | The primary locale, used when none is detected |
| `fallbackLocale` | `string` | Locale to fall back to for missing keys |
| `languages` | `LanguageConfig[]` | Display metadata for each locale |
| `messages` | `Record<string, Messages>` | Translation messages keyed by locale |

## Astro config (`astro.config.mjs`)

Configure Astro's own i18n routing to match your locales:

```js
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [mdx()],
  vite: { plugins: [tailwindcss()] },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: false,  // /docs vs /en/docs
    },
  },
});
```

Setting `prefixDefaultLocale: false` keeps the default locale at the root (`/docs/...`) while non-default locales are prefixed (`/es/docs/...`).

## Middleware (`src/middleware.ts`)

The middleware detects the active locale from the request URL and stores it in the request context so all server helpers can access it.

```ts
import { createBetterTranslateMiddleware } from "@better-translate/astro/middleware";
import { requestConfig } from "./lib/i18n/request";

export const onRequest = createBetterTranslateMiddleware(requestConfig);
```

This single line is all that's needed. Astro automatically runs `onRequest` before every page render.

## Server helpers (`src/lib/i18n/server.ts`)

Export the server-side helpers from a shared module so all `.astro` components can import them consistently:

```ts
import { createServerHelpers, setRequestLocale } from "@better-translate/astro";
import { requestConfig } from "./request";

export const {
  getLocale,
  getTranslations,
  getMessages,
  getAvailableLanguages,
} = createServerHelpers(requestConfig);

export { setRequestLocale };
```
