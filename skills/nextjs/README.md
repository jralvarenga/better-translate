# Next.js Skill

Use this guide when the app is a Next.js App Router app.

## Correct package combination

- always: `@better-translate/core`
- always: `@better-translate/nextjs`
- optional: `@better-translate/react` for client-side hooks and providers

## Minimum file set

The smallest practical Next.js setup usually has these files:

- `src/lib/i18n/config.ts`
- `src/lib/i18n/routing.ts`
- `src/lib/i18n/request.ts`
- `src/lib/i18n/server.ts`
- `src/lib/i18n/navigation.ts`
- `src/proxy.ts`

## What each one does

- `config.ts` creates the core translator
- `routing.ts` defines the locale route shape
- `request.ts` exposes the translator to the Next.js adapter
- `server.ts` creates request-aware helpers like `getTranslations()`
- `navigation.ts` creates locale-aware links and router helpers
- `proxy.ts` redirects requests into locale-prefixed URLs

## Important rule

Do not replace the core package with the Next.js package.

Next.js depends on the translator you created in `@better-translate/core`.

## When to add React too

Add `@better-translate/react` only when client components need:

- `useTranslations()`
- client-side locale switching
- a provider around part of the tree
