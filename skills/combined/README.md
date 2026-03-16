# Better Translate Combined Server And Client Guide

## What This Is

This guide explains how Better Translate works when your app has both:

- server code
- client code

This is the most common setup in modern Next.js apps.

It is also the best way to understand how the core, React, and Next.js packages fit together.

## When To Use It

Read this guide when:

- your app renders on the server and also has client components
- you are using Next.js App Router
- you want a simple mental model for “server implementation + client implementation”

## How It Works

Better Translate usually splits work like this:

### Server side

The server side uses:

- `better-translate`
- `@better-translate/nextjs`

The server does things like:

- build the translator
- choose the locale from the route
- return a locale-bound `t(...)`
- render translated server components

### Client side

The client side usually uses:

- `@better-translate/react`

The client does things like:

- keep active locale state in React
- switch locales from buttons or selects
- warm the locale cache
- show loading and error state

### Content side

If your app also serves localized docs or articles, the content side can use:

- `@better-translate/md`

That package does things like:

- load locale-specific `.md` and `.mdx` files
- fall back to the translator fallback locale
- keep content locale behavior aligned with string locale behavior

## Three Common Setups

### 1. Core only

Use only core when your app is just a server, API, or script.

Example:

- `apps/core-elysia-example`

### 2. Core + React

Use core plus React when your app is mostly client-side.

Example:

- `apps/react-vite-example`

### 3. Core + Next.js + React

Use all three when your app has:

- server-rendered pages
- client components
- locale-aware routes

Best reference:

- `apps/landing`

## The Simple Mental Model

Use this sentence:

“Core translates. Next.js connects locale to the route. React connects locale to the UI. Markdown helpers connect locale to content files.”

That is the cleanest way to think about the repo.

## Typical Flow In A Next.js App

### Step 1. Define shared translation config

Example:

- `apps/landing/lib/i18n/config.ts`

This file creates one reusable core config and one reusable translator factory.

### Step 2. Define locale routing

Example:

- `apps/landing/lib/i18n/routing.ts`

This tells Next.js where locale lives in the URL.

### Step 3. Create request config and server helpers

Examples:

- `apps/landing/lib/i18n/request.ts`
- `apps/landing/lib/i18n/server.ts`

This lets server components call `getTranslations({ locale })`.

If the same route also loads localized Markdown or MDX, create Markdown server
helpers from the same request config.

### Step 4. Render translated server pages

Example:

- `apps/landing/app/[lang]/page.tsx`

This page validates the locale and then uses a locale-bound `t(...)`.

### Step 5. Add client locale switching where needed

Examples:

- `apps/landing/components/landing-translations-provider.tsx`
- `apps/landing/components/header-language-switcher.tsx`

This is the client side.

The landing app creates a client provider and uses a select component to change locale.

## How The Landing App Demonstrates Both Sides

The landing app is a good combined example because:

- routing is handled with `@better-translate/nextjs`
- server pages call `getTranslations(...)`
- client components use `@better-translate/react`
- the header language switcher changes locale from the browser

So even though the app is a marketing site, it is also the repo’s clearest example of mixed server/client translation usage.

## Important Files

- `apps/landing/lib/i18n/config.ts`
- `apps/landing/lib/i18n/routing.ts`
- `apps/landing/lib/i18n/request.ts`
- `apps/landing/lib/i18n/server.ts`
- `apps/landing/lib/i18n/navigation.ts`
- `apps/landing/components/landing-translations-provider.tsx`
- `apps/landing/components/header-language-switcher.tsx`
- `apps/landing/app/[lang]/page.tsx`

## What To Copy From The Examples

- Copy the landing app config pattern if you want one shared translator setup.
- Copy the server helper pattern if your server components need translations.
- Copy the React provider pattern if your client components need locale switching.
- Copy the language switcher pattern if you want a client-side route-aware locale selector.

## Decision Guide

- Use only core if you only translate on the server.
- Add React if client components need locale state.
- Add Next.js if locale is part of the URL or request lifecycle.
- Add `@better-translate/md` if docs, blog posts, or content pages live in `.md` or `.mdx` files.
- Use all three for full App Router apps with server rendering and interactive client switching.
