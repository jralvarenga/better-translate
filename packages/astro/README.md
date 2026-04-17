# Astro

Use `@better-translate/astro` when your Astro app needs request-aware translations.

## 1. Install the packages

```sh
npm install @better-translate/core @better-translate/astro astro
```

## 2. Create the translator

Create `src/lib/i18n.ts`:

```ts
import { configureTranslations } from "@better-translate/core";

const en = {
  home: {
    title: "Hello from Astro",
  },
} as const;

const es = {
  home: {
    title: "Hola desde Astro",
  },
} as const;

export const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es },
});
```

## 3. Expose the request config

Create `src/lib/request.ts`:

```ts
import { getRequestConfig } from "@better-translate/astro";

import { translator } from "./i18n";

export const requestConfig = getRequestConfig(async () => ({
  translator,
}));
```

## 4. Set the request locale in middleware

Create `src/middleware.ts`:

```ts
import { createBetterTranslateMiddleware } from "@better-translate/astro/middleware";

import { requestConfig } from "./lib/request";

export const onRequest = createBetterTranslateMiddleware(requestConfig, {
  resolveLocale: ({ params }) => params?.lang,
});
```

If you want a shared list of supported locale param names formatted for file routes, import `SUPPORTED_ASTRO_LOCALE_ROUTE_SYNTAXES` from `@better-translate/astro`. It includes values like `[locale]`, `[lang]`, `[language]`, `[intl]`, `[i18n]`, `[l10n]`, and `[localization]`.

## 5. Read translations in a page

Create `src/lib/server.ts`:

```ts
import { createServerHelpers } from "@better-translate/astro";

import { requestConfig } from "./request";

export const { getLocale, getTranslations } =
  createServerHelpers(requestConfig);
```

Create `src/pages/[lang]/index.astro`:

```astro
---
import { getLocale, getTranslations } from "../../lib/server";

const locale = await getLocale();
const t = await getTranslations();
---

<html lang={locale}>
  <body>
    <h1>{t("home.title")}</h1>
  </body>
</html>
```

## Optional next step

If your Astro docs or blog posts live in localized content collections, add Astro content helpers or the MDX adapter after this basic setup is working.

## Generate locale files automatically

Instead of writing every translation by hand, use the CLI to extract strings and generate locale files: [CLI guide](https://better-translate.com/en/docs/cli)

## Examples

- [astro-example](https://github.com/jralvarenga/better-translate/tree/main/examples/astro-example)
