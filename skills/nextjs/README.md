# Better Translate Next.js

## What This Is

`@better-translate/nextjs` is the Next.js App Router layer on top of the core package.

It does not replace `better-translate`.

It adds:

- locale routing config
- proxy helpers
- request-scoped server helpers
- locale-aware navigation wrappers

## When To Use It

Use the Next.js package when:

- you are using Next.js App Router
- you want locale-prefixed routes
- you want request helpers for server components
- you want locale-aware links and router calls

## How It Works

A Next.js setup in this repo usually has five pieces:

1. `routing.ts`
2. `request.ts`
3. `server.ts`
4. `navigation.ts`
5. `proxy.ts`

### 1. `routing.ts`

This defines your locale routing rules.

```ts
export const routing = defineRouting({
  locales: ["en", "es"] as const,
  defaultLocale: "en",
  routeTemplate: "/[lang]",
});
```

`routeTemplate` defaults to `"/[lang]"`.

You can also scope localization to part of the app, for example `"/app/[lang]"`.

### 2. `request.ts`

This is where core and Next.js meet.

You build the core translator with `configureTranslations(...)`.

Then you wrap it with `getRequestConfig(...)`.

### 3. `server.ts`

This file usually exports:

- `getLocale()`
- `getMessages()`
- `getTranslations()`
- `getTranslator()`

These come from `createServerHelpers(...)`.

### 4. `navigation.ts`

This file injects your installed Next.js version’s navigation functions into `createNavigationFunctions(...)`.

That creates:

- `I18nLink`
- `getPathname(...)`
- `useI18nPathname()`
- `useI18nRouter()`

### 5. `proxy.ts`

This file keeps proxy ownership in the app.

Better Translate composes with your proxy instead of replacing it.

## Important Behavior

### Root routing

If `routeTemplate` is `"/[lang]"`, the whole localized app lives under paths like:

- `/en`
- `/es`
- `/en/guide`

### Scoped routing

If `routeTemplate` is `"/app/[lang]"`, only that subtree is localized.

That means routes like `/` and `/login` can stay outside localization.

### Proxy behavior

The proxy redirects in-scope non-localized requests to the correct localized path.

It can also use:

- domain locale rules
- `Accept-Language`

### Server helper behavior

`getTranslations({ locale })` gives you a locale-bound `t(...)` function for server components.

If the locale is not supported, the helper throws.

### Navigation behavior

The navigation wrappers keep internal navigation locale-aware.

In scoped apps, they only localize routes that are inside the configured scope.

Out-of-scope routes stay untouched.

## Important Files

- `packages/nextjs/src/shared.ts`
- `packages/nextjs/src/server.ts`
- `packages/nextjs/src/navigation.tsx`
- `packages/nextjs/src/proxy.ts`
- `packages/nextjs/src/nextjs.test.ts`
- `packages/nextjs/README.md`
- `apps/nextjs-example/lib/i18n/*`
- `apps/nextjs-nested-locale-example/lib/i18n/*`

## Simple Mental Model

The Next.js package is a bridge between:

- core translation logic
- Next.js routing and rendering

Core still translates the messages.

The Next.js package decides:

- how locale appears in URLs
- how requests read locale
- how links and router calls keep locale

## What To Copy From The Examples

- Copy `apps/nextjs-example` if your whole app should use locale-prefixed routes.
- Copy `apps/nextjs-nested-locale-example` if only part of your app should be localized.
- Copy the `routing.ts`, `request.ts`, `server.ts`, `navigation.ts`, and `proxy.ts` file pattern directly.
- Copy the localized layout pattern where the route param is validated with `hasLocale(...)` before calling `getTranslations(...)`.

## Extra Notes

- The examples inline the proxy `matcher` instead of always using `getProxyMatcher(routing)` because Next.js statically analyzes that field.
- The package supports domain-aware locale routing.
- The tests guarantee root routing, scoped routing, proxy redirects, domain redirects, and locale-aware navigation behavior.
