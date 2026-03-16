# `tanstack-start-example`

This example shows how to wire `better-translate/core` and
`@better-translate/tanstack-router` into a TanStack Start app with root-level
locale routing powered by optional path params.

## What it demonstrates

- locale-aware routes at `/`, `/guide`, `/login`, `/es`, `/es/guide`, and `/es/login`
- `defineRouting(...)` configured with the default `/{-$locale}` route template
- request-scoped translation helpers created with `createServerHelpers(...)`
- route loaders calling TanStack Start server functions that use `getTranslations(...)`
- injected navigation wrappers built with `createNavigationFunctions(...)`
- a locale switcher that preserves the current route while changing language

## Key files

- `src/lib/i18n/routing.ts`: defines locales and the optional-locale route model
- `src/lib/i18n/messages/*.ts`: locale dictionaries used by the example app
- `src/lib/i18n/request.ts`: creates the translator with `configureTranslations(...)`
- `src/lib/i18n/server.ts`: exposes `createServerHelpers(...)` and Start server functions
- `src/lib/i18n/navigation.tsx`: injects `Link`, `useNavigate`, `useRouter`, `useLocation`, and `useParams`
- `src/routes/{-$locale}.tsx`: localized layout route with header chrome
- `src/routes/{-$locale}.*.tsx`: localized home, guide, and login pages

## Run it

```bash
bun install
bun run dev
```

Then open [http://localhost:3005](http://localhost:3005).

## Checks

```bash
bun run build
bun run test
```
