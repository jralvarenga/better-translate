# Better Translate Examples

## What This Is

This guide explains the example apps in the repo.

Each example teaches a different part of the library.

## When To Use It

Read this file when:

- you want to copy a working setup
- you want to know which example matches your app
- you want a quick map of the examples before reading source code

## How It Works

The repo has four main example apps plus the landing app.

### `apps/core-elysia-example`

This is the simplest server example.

It shows:

- core package only
- Bun + Elysia usage
- API responses translated on the server
- changing locale in memory
- translating with a per-call locale override

Copy this if you want translations in an API or server process.

### `apps/react-vite-example`

This is the best pure React example.

It shows:

- core + React packages
- one translator created before render
- React provider usage
- locale switching
- async French locale loading
- cache warming with `loadLocale(...)`
- isolated load failure state

Copy this if you want a client-side app with React context and hooks.

### `apps/nextjs-example`

This is the best root-scoped Next.js example.

It shows:

- core + Next.js packages
- locale routes at `"/[lang]"`
- localized pages and layout
- request config and server helpers
- locale-aware links and router helpers
- user-owned proxy composition

Copy this if your whole Next.js app should be localized.

### `apps/nextjs-nested-locale-example`

This is the best scoped Next.js example.

It shows:

- `routeTemplate: "/app/[lang]"`
- localized area only inside `/app/[lang]`
- normal Next.js pages outside locale scope
- locale-aware internal links only where needed

Copy this if only one section of your app should be localized.

### `apps/landing`

This is the best combined example.

It shows:

- server translations with Next.js helpers
- client locale switching with React provider
- shared translation config
- content and UI using the same translation system

Copy this if you need both server and client translation behavior in one app.

## Important Files

- `apps/core-elysia-example/src/modules/translations/service.ts`
- `apps/react-vite-example/src/i18n.ts`
- `apps/nextjs-example/lib/i18n/routing.ts`
- `apps/nextjs-example/lib/i18n/request.ts`
- `apps/nextjs-nested-locale-example/lib/i18n/routing.ts`
- `apps/landing/lib/i18n/config.ts`

## Simple Mental Model

Each example answers one question:

- Elysia example: “How do I use the core package on a server?”
- React example: “How do I use it in a client app?”
- Next.js example: “How do I localize a whole App Router app?”
- Nested Next.js example: “How do I localize only one route subtree?”
- Landing app: “How do I combine server and client usage?”

## What To Copy From The Examples

- Copy the smallest example that matches your architecture.
- Do not start with the most complex app unless you really need both server and client behavior.
- Prefer the React example for client-only apps.
- Prefer the scoped Next.js example if you do not want localization to take over your entire route tree.
