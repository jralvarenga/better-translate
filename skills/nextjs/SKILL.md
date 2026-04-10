---
name: nextjs
description: Next.js App Router setup guide for Better Translate routing, server helpers, and optional React hooks.
---

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

## Keep TypeScript autocomplete available

Create and export the typed core translator once, then let the Next.js adapter and optional React hooks read from it.

- server helpers stay typed because they are created from the shared translator config
- client hooks stay typed by using `useTranslations<typeof translator>()`
- or by registering the translator once with module augmentation in React code

## Important rule

Do not replace the core package with the Next.js package.

Next.js depends on the translator you created in `@better-translate/core`.

## When to add React too

Add `@better-translate/react` only when client components need:

- `useTranslations()`
- client-side locale switching
- a provider around part of the tree

If you add React hooks, use the same exported translator type that the rest of the app uses so key and locale autocomplete stay aligned.
