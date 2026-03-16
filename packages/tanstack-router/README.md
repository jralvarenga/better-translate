# @better-translate/tanstack-router

TanStack Router helpers for Better Translate.

This package mirrors the structure of `@better-translate/nextjs`, but it is
router-first so the same helpers work in both TanStack Router apps and TanStack
Start apps.

## Install

```sh
bun add @better-translate/tanstack-router better-translate
```

## Mental model

Use both packages together:

1. `configureTranslations(...)` from `better-translate/core` creates the typed
   translator.
2. `defineRouting(...)` from `@better-translate/tanstack-router` describes where
   your optional locale segment lives.
3. `createNavigationFunctions(...)` and `createServerHelpers(...)` adapt that
   config to TanStack Router and TanStack Start.

## Optional locale routing

The default route template is `/{-$locale}`. That keeps the default locale
unprefixed and adds a prefix only for non-default locales.

### `src/i18n/routing.ts`

```ts
import { defineRouting } from "@better-translate/tanstack-router";

export const routing = defineRouting({
  locales: ["en", "es"] as const,
  defaultLocale: "en",
  routeTemplate: "/app/{-$locale}",
});
```

With that config:

- `/app/dashboard` resolves to the default locale
- `/app/es/dashboard` resolves to Spanish
- `/login` stays outside Better Translate routing

## Core translator + server helpers

### `src/i18n/request.ts`

```ts
import { getRequestConfig } from "@better-translate/tanstack-router/server";
import { configureTranslations } from "better-translate/core";

import { routing } from "./routing";
import { en, es } from "./messages";

export const requestConfig = getRequestConfig(async () => ({
  translator: await configureTranslations({
    availableLocales: routing.locales,
    defaultLocale: "en",
    fallbackLocale: "en",
    messages: {
      en,
      es,
    },
  }),
}));
```

### `src/i18n/server.ts`

```ts
import {
  createServerHelpers,
  setRequestLocale,
} from "@better-translate/tanstack-router/server";

import { requestConfig } from "./request";

export const { getLocale, getMessages, getTranslations, getTranslator } =
  createServerHelpers(requestConfig);

export { setRequestLocale };
```

In TanStack Start, call `setRequestLocale(params.locale ?? routing.defaultLocale)`
inside `beforeLoad`, a loader, or another request-bound server entrypoint.

## Navigation wrappers

Inject the router primitives from your app so the adapter stays compatible with
the installed TanStack Router version.

### `src/i18n/navigation.ts`

```tsx
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useRouter,
} from "@tanstack/react-router";

import { createNavigationFunctions } from "@better-translate/tanstack-router/navigation";

import { routing } from "./routing";

export const {
  Link: I18nLink,
  getPathname,
  useLocale,
  useNavigate: useI18nNavigate,
  usePathname,
  useRouter: useI18nRouter,
} = createNavigationFunctions({
  Link,
  routing,
  useLocation,
  useNavigate,
  useParams: () =>
    useParams({
      strict: false,
      select: (params) => ({
        locale: params.locale as "en" | "es" | undefined,
      }),
    }),
  useRouter,
});
```

That gives you:

- `I18nLink`
- `getPathname({ href, locale })`
- `useLocale()`
- `useI18nNavigate()`
- `usePathname()`
- `useI18nRouter()`

## Key source files

- `packages/tanstack-router/src/shared.ts`
- `packages/tanstack-router/src/navigation.tsx`
- `packages/tanstack-router/src/server.ts`
