# @better-translate/nextjs

Next.js 16 App Router integration for Better Translate.

This package keeps `better-translate` as the translation runtime and adds the
pieces that are specific to Next.js:

- locale routing config
- `proxy.ts` locale redirects
- request-scoped server helpers
- navigation helpers that keep locale prefixes aligned

## Install

```sh
bun add @better-translate/nextjs better-translate
```

## How `configureTranslations(...)` fits with the Next.js helpers

Use both packages together:

1. `configureTranslations(...)` from `better-translate/core` creates the typed
   translator and keeps fallback/message loading behavior in the core package.
2. `defineRouting(...)`, `createProxy(...)`, and `createNavigation(...)` from
   `@better-translate/nextjs` handle locale-aware routing.
3. `getRequestConfig(...)` and `createServerHelpers(...)` connect the active
   Next.js request locale to the configured core translator.

The usual shape is:

- `routing.ts`: declare supported locales and optional domains
- `request.ts`: call `configureTranslations(...)` and return `{locale, translator}`
- `server.ts`: expose `getLocale`, `getMessages`, `getTranslations`, `getTranslator`
- `navigation.ts`: expose locale-aware `Link`, `redirect`, `useRouter`, `usePathname`
- `proxy.ts`: redirect requests into the correct locale prefix or locale domain

## Routing setup

### `src/i18n/routing.ts`

```ts
import { defineRouting } from "@better-translate/nextjs";

export const routing = defineRouting({
  locales: ["en", "es"] as const,
  defaultLocale: "en",
  domains: [
    {
      domain: "example.com",
      defaultLocale: "en",
      locales: ["en"],
    },
    {
      domain: "es.example.com",
      defaultLocale: "es",
      locales: ["es"],
      protocol: "https",
    },
  ],
});
```

### `src/i18n/request.ts`

```ts
import { getRequestConfig } from "@better-translate/nextjs/server";
import { headers } from "next/headers";
import { hasLocale } from "@better-translate/nextjs";
import { configureTranslations } from "better-translate/core";

import { routing } from "./routing";
import en from "../locales/en.json";
import es from "../locales/es.json";

export const requestConfig = getRequestConfig(async () => {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-next-intl-locale");
  const locale =
    localeHeader && hasLocale(routing.locales, localeHeader)
      ? localeHeader
      : routing.defaultLocale;

  const translator = await configureTranslations({
    availableLocales: routing.locales,
    defaultLocale: "en",
    fallbackLocale: "en",
    messages: {
      en,
      es,
    },
  });

  return {
    locale,
    translator,
  };
});
```

`request.ts` is the bridge between the packages:

- `configureTranslations(...)` builds the actual translator
- `getRequestConfig(...)` tells the Next.js adapter which locale and translator
  belong to the current request
- `createServerHelpers(...)` then exposes request-scoped helpers built from that config

### `src/i18n/server.ts`

```ts
import { createServerHelpers } from "@better-translate/nextjs/server";

import { requestConfig } from "./request";

export const { getLocale, getMessages, getTranslations, getTranslator } =
  createServerHelpers(requestConfig);
```

### `src/i18n/navigation.ts`

```ts
import { createNavigation } from "@better-translate/nextjs/navigation";

import { routing } from "./routing";

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing);
```

### `app/[lang]/page.tsx`

```tsx
import { getMessages, getTranslations } from "@/src/i18n/server";

export default async function HomePage() {
  const t = await getTranslations();
  const messages = await getMessages();

  return (
    <main>
      <h1>{t("home.title")}</h1>
      <pre>{JSON.stringify(messages, null, 2)}</pre>
    </main>
  );
}
```

### `src/proxy.ts`

```ts
import { createProxy, defaultProxyMatcher } from "@better-translate/nextjs/proxy";

import { routing } from "./i18n/routing";

export const proxy = createProxy(routing);

export const config = {
  matcher: defaultProxyMatcher,
};
```

### `app/[lang]/layout.tsx`

```tsx
import { hasLocale } from "@better-translate/nextjs";
import { notFound } from "next/navigation";

import { getLocale } from "@/src/i18n/server";
import { routing } from "@/src/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  return (
    <html lang={await getLocale()}>
      <body>{children}</body>
    </html>
  );
}
```

## Server helpers

`createServerHelpers(...)` returns:

- `getLocale()`
- `getMessages()`
- `getTranslations()`
- `getTranslator()`

`getTranslations()` returns a locale-bound `t(...)` function that keeps Better
Translate's key and params inference intact.

## Minimal mental model

If you only remember one thing, remember this split:

- `better-translate/core` owns translation data, fallback rules, loaders, and
  typed `t(...)`
- `@better-translate/nextjs` owns routing, request locale resolution, and
  Next.js-friendly helper wrappers around that core translator

## Important note about fallback behavior

The request translator still needs default-locale messages loaded in the core
config. Better Translate's fallback behavior stays in `better-translate`, so the
Next.js adapter assumes the translator already has source-locale messages
available.
