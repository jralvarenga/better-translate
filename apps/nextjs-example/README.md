# `nextjs-example`

This example shows how to wire `better-translate/core` and
`@better-translate/nextjs` into a Next.js App Router app with root-level locale
routing.

## What it demonstrates

- locale-prefixed routes at `"/[lang]"`, `"/[lang]/guide"`, and
  `"/[lang]/login"`
- a user-owned `proxy.ts` composed with `withBetterTranslate(...)`
- `configureTranslations(...)` connected to `getRequestConfig(...)`
- injected navigation wrappers built with `createNavigationFunctions(...)`
- a locale switcher that preserves the current route while changing language

Bare `/` redirects to the default locale in the app, while the proxy can still
redirect to the preferred locale from `Accept-Language`.

## Key files

- `lib/i18n/routing.ts`: defines locales and `routeTemplate: "/[lang]"`
- `lib/i18n/messages/*.json`: locale dictionaries used by the example app
- `lib/i18n/request.ts`: creates the translator with `configureTranslations(...)`
- `lib/i18n/server.ts`: exposes `getTranslations(...)` and related server helpers
- `lib/i18n/navigation.ts`: injects `Link`, `useRouter`, `usePathname`, and `useParams`
- `proxy.ts`: composes Better Translate on top of the app-owned proxy
- `app/[lang]/*`: localized pages and layout

## Run it

```bash
bun install
bun run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
bun run lint
bun run build
```
