# @better-translate/nextjs

Next.js App Router helpers for Better Translate.

This package does not replace `better-translate/core`. Instead, it adds the
Next.js-specific pieces around it:

- route-aware locale parsing and localization
- composable proxy helpers
- injected navigation wrappers that work with your Next.js version
- request-scoped server helpers on top of a core translator

## Install

```sh
bun add @better-translate/nextjs better-translate
```

## Mental model

Use both packages together:

1. `configureTranslations(...)` from `better-translate/core` creates the typed
   translator and keeps fallback behavior, loaders, and typed `t(...)`.
2. `defineRouting(...)` from `@better-translate/nextjs` describes where locale
   routing lives in your app.
3. `withBetterTranslate(...)`, `getProxyMatcher(...)`, and
   `createNavigationFunctions(...)` adapt that routing config to Next.js.

## Scoped routing

If only part of your app is localized, set a `routeTemplate`.

For example, this localizes `/app/[lang]/...` while leaving `/` and `/login`
outside Better Translate routing:

### `src/i18n/routing.ts`

```ts
import { defineRouting } from "@better-translate/nextjs";

export const routing = defineRouting({
  locales: ["en", "es"] as const,
  defaultLocale: "en",
  routeTemplate: "/app/[lang]",
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

With that config:

- `/app/dashboard` can redirect to `/app/en/dashboard`
- `/app/es/dashboard` is a localized route
- `/` is untouched
- `/login` is untouched

## Core translator + request helpers

### `src/i18n/request.ts`

```ts
import { getRequestConfig } from "@better-translate/nextjs/server";
import { configureTranslations } from "better-translate/core";

import { routing } from "./routing";
import en from "../locales/en.json";
import es from "../locales/es.json";

export const requestConfig = getRequestConfig(async () => {
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
    translator,
  };
});
```

### `app/app/[lang]/layout.tsx`

```tsx
import { hasLocale } from "@better-translate/nextjs";
import { setRequestLocale } from "@better-translate/nextjs/server";
import { notFound } from "next/navigation";

import { getTranslations } from "@/src/i18n/server";
import { routing } from "@/src/i18n/routing";

export default async function LocalizedLayout({
  children,
  params,
}: PageProps<"/app/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  setRequestLocale(lang);

  const t = await getTranslations();

  return (
    <section>
      <h1>{t("dashboard.title")}</h1>
      {children}
    </section>
  );
}
```

### `src/i18n/server.ts`

```ts
import {
  createServerHelpers,
  setRequestLocale,
} from "@better-translate/nextjs/server";

import { requestConfig } from "./request";

export const { getLocale, getMessages, getTranslations, getTranslator } =
  createServerHelpers(requestConfig);

export { setRequestLocale };
```

After you set the request locale once in the localized layout, server helpers
read it automatically:

### `app/app/[lang]/page.tsx`

```tsx
import { hasLocale } from "@better-translate/nextjs";
import { notFound } from "next/navigation";

import { getTranslations } from "@/src/i18n/server";
import { routing } from "@/src/i18n/routing";

export default async function DashboardPage({
  params,
}: PageProps<"/app/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  const t = await getTranslations();

  return <h1>{t("dashboard.title")}</h1>;
}
```

`request.ts` is where both packages meet:

- `configureTranslations(...)` builds the actual translator
- `getRequestConfig(...)` exposes it to the Next.js adapter
- `setRequestLocale(...)` stores the current route locale once per request
- `createServerHelpers(...)` returns request-friendly wrappers around that translator

## User-owned proxy

You keep full ownership of `proxy.ts`. Better Translate composes on top of your
proxy instead of replacing it.

### `src/proxy.ts`

```ts
import { withBetterTranslate, getProxyMatcher } from "@better-translate/nextjs/proxy";
import { NextResponse } from "next/server";

import { routing } from "./i18n/routing";

function userProxy() {
  return NextResponse.next();
}

export const proxy = withBetterTranslate(userProxy, routing);

export const config = {
  matcher: getProxyMatcher(routing),
};
```

Composition order:

- Better Translate runs first
- if it needs to redirect, it returns immediately
- otherwise your proxy runs next

## Navigation wrappers

`@better-translate/nextjs` no longer imports `next/link` or `next/navigation`
directly. Instead, inject the functions and components from your app’s Next.js
version.

### `src/i18n/navigation.ts`

```ts
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";

import { createNavigationFunctions } from "@better-translate/nextjs/navigation";

import { routing } from "./routing";

export const { Link: I18nLink, getPathname, usePathname: useI18nPathname, useRouter: useI18nRouter } =
  createNavigationFunctions({
    Link,
    routing,
    useParams,
    usePathname,
    useRouter,
  });
```

That gives you:

- `I18nLink`
- `getPathname({href, locale})`
- `useI18nPathname()`
- `useI18nRouter()`

Example:

```tsx
"use client";

import { I18nLink, useI18nPathname, useI18nRouter } from "@/src/i18n/navigation";

export function DashboardNav() {
  const pathname = useI18nPathname();
  const router = useI18nRouter();

  return (
    <nav>
      <p>{pathname}</p>
      <I18nLink href="/app/dashboard" locale="es">
        Spanish dashboard
      </I18nLink>
      <button
        onClick={() =>
          router.push("/app/settings", {
            locale: "es",
            scroll: false,
          })
        }
      >
        Go to settings
      </button>
    </nav>
  );
}
```

Notes:

- Pass scoped paths without the locale segment, for example `/app/dashboard`
- Out-of-scope routes like `/` and `/login` are left unchanged
- If a locale switch targets another configured domain, navigation falls back
  to a full document navigation

## Route helpers

The root package exports shared helpers:

```ts
import {
  defineRouting,
  getPathnameLocale,
  hasLocale,
  isPathnameInScope,
  localizePathname,
  stripLocaleFromPathname,
} from "@better-translate/nextjs";
```

For a scoped config like `routeTemplate: "/app/[lang]"`:

- `getPathnameLocale("/app/es/dashboard", routing)` -> `"es"`
- `stripLocaleFromPathname("/app/es/dashboard", routing)` -> `"/app/dashboard"`
- `localizePathname("/app/dashboard", "en", routing)` -> `"/app/en/dashboard"`
- `localizePathname("/login", "en", routing)` -> `"/login"`

## Important note about fallback behavior

The default-locale messages still need to be loaded in
`configureTranslations(...)`. Fallback resolution stays in
`better-translate/core`, and `@better-translate/nextjs` only adds the routing
and framework integration around that translator.
