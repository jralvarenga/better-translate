# Better Translate Core

## What This Is

`better-translate` is the main library.

It gives you:

- typed translation keys
- typed interpolation params
- fallback locale support
- async locale loading
- global helpers
- JSON schema generation for locale files

The core package is framework-agnostic. That means you can use it in plain TypeScript, Bun, Node.js, APIs, and servers.

## When To Use It

Use only the core package when:

- you do not need React helpers
- you do not need Next.js routing helpers
- you do not need Markdown or MDX file helpers
- you want translations in a server, script, API, or shared library

## How It Works

There are two main setup styles.

### 1. Short form

You pass a locale map directly.

```ts
const translator = await configureTranslations({
  en,
  es,
});
```

In this form:

- the first locale becomes the default locale
- the first locale also becomes the fallback locale

### 2. Options form

You define the locale contract up front.

```ts
const translator = await configureTranslations({
  availableLocales: ["en", "es", "fr"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es },
  loaders: {
    fr: async () => ({
      common: {
        hello: "Bonjour",
      },
    }),
  },
});
```

This is the main setup for real apps.

It is more explicit and it supports async loaders.

## Important Behavior

### Typed keys

If your source messages have `account.balance.label`, TypeScript will autocomplete that key and reject invalid ones.

### Typed params

If a message is `"Good morning {name}"`, then `t(...)` requires `params.name`.

### Fallback behavior

If the active locale does not have a key, Better Translate tries the fallback locale.

If the fallback locale also does not have the key, it returns the key itself.

That means:

- missing locale value -> fallback locale value
- missing fallback value -> key string

### Async loaders

You can register locale loaders for languages that are not preloaded.

Loaded locales are cached after the first successful load.

### Global helpers

The core package stores the configured translator in a global store.

That is why you can call:

- `t(...)`
- `loadLocale(...)`
- `getSupportedLocales()`
- `getMessages()`

after configuring translations once.

### Immutable message snapshots

`getMessages()` returns a frozen snapshot, not the internal mutable cache.

That makes it safer to inspect loaded messages.

### JSON schema generation

`createTranslationJsonSchema(...)` builds a JSON Schema from a source locale object.

This helps editors validate sibling locale JSON files.

## Important Files

- `packages/better-translate/src/core.ts`
- `packages/better-translate/src/types.ts`
- `packages/better-translate/src/normalize-config.ts`
- `packages/better-translate/src/create-configured-translator.ts`
- `packages/better-translate/src/interpolate-message.ts`
- `packages/better-translate/src/create-translation-json-schema.ts`
- `packages/better-translate/src/core.test.ts`
- `packages/better-translate/README.md`

## Simple Mental Model

The core package does four jobs:

1. Validate your setup.
2. Keep messages and loaders.
3. Resolve the correct locale value with fallback.
4. Return a typed `t(...)` function.

If you also need localized `.md` or `.mdx` files, keep this core setup and add
`@better-translate/md` on top of the same translator.

## What To Copy From The Examples

- From `apps/core-elysia-example`, copy the basic server setup if you want translations on an API.
- From `apps/react-vite-example/src/i18n.ts`, copy the options form if you want preloaded locales plus lazy-loaded locales.
- From `apps/landing/lib/i18n/config.ts`, copy the named config object pattern if you want one reusable app config.

## Extra Notes

- Preloaded locale objects must match the same nested shape as the source locale.
- Async loaders are more flexible and can return partial locale trees because fallback behavior still works.
- The package root re-exports core, and `better-translate/core` is also available as a subpath.
