---
title: Getting Started
description: Install Better Translate, configure your Astro project, and display your first localized string.
---

# Getting Started

This guide walks you through setting up **Better Translate** in a new or existing Astro project.

## Prerequisites

- Node.js 18+ or Bun 1.0+
- An Astro project (v4 or v5)

## Installation

Install the Astro adapter and the core library:

```bash
bun add @better-translate/astro better-translate
```

## Project structure

Better Translate for Astro relies on three pieces:

1. **`requestConfig`** – wires up locales and translations
2. **Middleware** – sets the active locale on every request
3. **Server helpers** – access locale and translations in `.astro` files

## 1. Create your request config

Create `src/lib/i18n/request.ts`:

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
    fallbackLocale: defaultLocale,
    languages: [
      { locale: "en", nativeLabel: "English", shortLabel: "EN" },
      { locale: "es", nativeLabel: "Español", shortLabel: "ES" },
    ],
    messages: { en, es },
  }),
}));
```

## 2. Add middleware

```ts
// src/middleware.ts
import { createBetterTranslateMiddleware } from "@better-translate/astro/middleware";
import { requestConfig } from "./lib/i18n/request";

export const onRequest = createBetterTranslateMiddleware(requestConfig);
```

## 3. Configure Astro i18n

```js
// astro.config.mjs
import { defineConfig } from "astro/config";

export default defineConfig({
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: { prefixDefaultLocale: false },
  },
});
```

## 4. Display your first translation

```astro
---
// src/pages/index.astro
import { getTranslations } from "../lib/i18n/server";

const t = await getTranslations();
---

<h1>{t("home.title")}</h1>
```

Run `bun run dev` and open `http://localhost:3006`. Your localized heading appears immediately.
