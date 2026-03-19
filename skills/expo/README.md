# Better Translate Expo

## What This Is

This guide explains how to use Better Translate in Expo and React Native apps.

Expo does **not** need a separate native adapter.

It uses:

- `better-translate`
- `@better-translate/react`

The React adapter already provides the provider and hook you need.

## When To Use It

Read this guide when:

- you are building an Expo app
- you are building a React Native app
- you want locale switching in client UI
- you want the same typed translator setup used in web React

## How It Works

### 1. Create the translator in shared app code

Use the core package to define locales, messages, fallback behavior, async loaders, and language metadata.

That part is the same as any other Better Translate setup.

### 2. Mount `BetterTranslateProvider` once at the app root

In Expo Router, that usually means your root layout.

Without Expo Router, it usually means `App.tsx`.

The provider owns:

- active locale
- locale switching
- loading state
- locale error state

### 3. Read translations in screens and components

Inside your app, call `useTranslations()`.

That gives you:

- `t`
- `locale`
- `setLocale`
- `loadLocale`
- `messages`
- `supportedLocales`
- `defaultLocale`
- `fallbackLocale`
- `isLoadingLocale`
- `loadingLocale`
- `localeError`
- `direction`
- `rtl`
- `translator`

## Important Behavior

### The adapter is shared with web React

Expo support lives inside `@better-translate/react`.

You should not create or expect a separate `@better-translate/react-native` package.

### `setLocale(...)`

`setLocale(...)` changes the active locale for the provider tree.

If the target locale is not already cached, it loads it first.

If loading fails:

- the old locale stays active
- `localeError` is set

### `loadLocale(...)`

`loadLocale(...)` warms the cache without changing the active locale.

Use this when you want to preload the next locale before a user taps a language switcher.

### Direction and RTL

The hook exposes:

- `direction`
- `rtl`

Use them to drive React Native layout decisions such as:

- row direction
- alignment
- icon placement
- screen-specific styling

The core translator also exposes:

- `translator.getDirection(...)`
- `translator.isRtl(...)`

Use those when you need direction data for a locale other than the currently active one.

## Important Files

- `packages/react/src/provider.tsx`
- `packages/react/src/use-translations.ts`
- `packages/react/src/types.ts`
- `packages/react/README.md`
- `apps/landing/docs/en/adapters-expo.mdx`
- `apps/landing/docs/en/adapters-react.mdx`

## Simple Mental Model

Think of Expo support like this:

- core package = translation engine
- React package = app state + provider + hook
- Expo = the native shell where you render screens

Better Translate handles locale state and typed message lookup.

Expo stays responsible for native UI, navigation, and styling.

## What To Copy

- Copy the translator setup pattern from `packages/react/README.md`
- Copy the provider pattern from `apps/landing/docs/en/adapters-expo.mdx`
- Copy `useTranslations()` usage from the React package docs if you want locale switching and cache warming
- Copy `direction` and `rtl` usage into your screen styling logic when you support RTL locales

## Extra Notes

- Expo uses the same install command as React: `better-translate` plus `@better-translate/react`
- Removing `react-dom` from the React adapter peer contract is what makes the package install cleanly in native projects
- If your app also has a web target, you can keep the same translator setup and use the same React adapter on both platforms
