# Better Translate React

## What This Is

`@better-translate/react` is the React layer on top of the core package.

It gives you:

- `BetterTranslateProvider`
- `useTranslations()`

The core package still owns the real translator.

The React package makes that translator easy to use in React components.

## When To Use It

Use the React package when:

- your app has client components
- you want to switch locale at runtime
- you want React context instead of calling global helpers directly

If you are building with Expo or React Native, keep using this package and then
read `skills/expo/README.md` for the native app wiring.

## How It Works

You create a core translator first.

Then you pass it to `BetterTranslateProvider`.

Then child components call `useTranslations()`.

```tsx
const translator = await createTranslator();

<BetterTranslateProvider translator={translator}>
  <App />
</BetterTranslateProvider>
```

Inside the provider, `useTranslations()` gives you:

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
- `translator`

## Important Behavior

### `setLocale(...)`

`setLocale(...)` changes the active locale for that provider tree.

If the target locale is not already cached, it loads it first.

If loading fails:

- the old locale stays active
- `localeError` is set

### `loadLocale(...)`

`loadLocale(...)` warms the cache without changing the active locale.

This is useful when you want the next switch to be instant.

### Provider scope

Each provider has its own active locale state.

That is why the React example can use one main provider and a second isolated provider to show failure behavior.

### Locale-bound `t(...)`

The hook wraps the translator so `t(...)` uses the current provider locale by default.

You can still override locale per call if needed.

## Important Files

- `packages/react/src/provider.tsx`
- `packages/react/src/use-translations.ts`
- `packages/react/src/types.ts`
- `packages/react/src/react.test.tsx`
- `packages/react/README.md`
- `apps/react-vite-example/src/i18n.ts`
- `apps/react-vite-example/src/main.tsx`

## Simple Mental Model

Think of the React package like this:

- core package = translation engine
- React package = React-friendly wrapper around that engine

The provider owns UI state.

The translator still owns message lookup, fallback, and loading.

## What To Copy From The Examples

- Copy `apps/react-vite-example/src/i18n.ts` to define your translator setup.
- Copy `apps/react-vite-example/src/main.tsx` to bootstrap the translator before first render.
- Copy `useTranslations()` usage from the example panels if you want locale switching, cache warming, and typed params.
- Copy the isolated failure provider pattern if you want one part of the UI to test or handle locale load errors separately.

## Extra Notes

- The React example demonstrates preloaded English and Spanish plus lazy-loaded French.
- The package tests guarantee that lazy locale switching works and failed locale loads do not replace the previous locale.
- `useTranslations()` throws if you call it outside `<BetterTranslateProvider />`.
