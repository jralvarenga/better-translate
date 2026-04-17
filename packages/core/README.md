# Core

`@better-translate/core` works in any TypeScript project. No framework dependency, no runtime requirement. The same config and the same API apply whether you're in Next.js, Astro, React, Bun, Node.js, a script, or any other TypeScript environment.

**Adapters** are extensions of core that add framework-specific helpers: locale-aware routing, React context, per-request helpers, etc. But everything is built on top of the same core.

## When to use core directly

Use core without an adapter when you don't need framework-specific helpers. This includes servers, APIs, scripts, shared libraries, or any TypeScript environment where no adapter exists for your setup.

## 1. Install the package

```sh
npm install @better-translate/core
```

## 2. Create one translator file

Create `src/i18n.ts`:

```ts
import { configureTranslations } from "@better-translate/core";

const en = {
  home: {
    title: "Hello",
    description: "This is the English version.",
  },
} as const;

const es = {
  home: {
    title: "Hola",
    description: "Esta es la version en espanol.",
  },
} as const;

export const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es },
});
```

## 3. Use the translator anywhere

```ts
import { translator } from "./i18n";

translator.t("home.title"); // "Hello"
translator.t("home.title", { locale: "es" }); // "Hola"
translator.t("home.description", { locale: "es" });
```

## 4. Add another locale later

```ts
const fr = {
  home: {
    title: "Bonjour",
    description: "Ceci est la version francaise.",
  },
} as const;

export const translator = await configureTranslations({
  availableLocales: ["en", "es", "fr"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es, fr },
});
```

## Fallback behavior

If the active locale doesn't have a key, better-translate tries the fallback locale.
If the fallback doesn't have it either, it returns the key string itself.

- Missing locale value -> fallback locale value
- Missing fallback value -> key string

## Async loaders

Register locale loaders for languages you don't want to preload. Loaded locales are cached after the first successful load.

```ts
const translator = await configureTranslations({
  availableLocales: ["en", "fr"] as const,
  defaultLocale: "en",
  messages: { en },
  loaders: {
    fr: async () => import("./messages/fr").then((m) => m.default),
  },
});

// loads fr on demand and caches it
await translator.loadLocale("fr");
```

## 5. Auto-extract strings with the CLI

Instead of naming keys by hand, mark strings with `{ bt: true }` and let the CLI extract and key them automatically:

```ts
import { t } from "@better-translate/core";

// Write the source string directly — CLI converts it to a proper key
t("Hello world", { bt: true });
```

Run `npx bt extract` to sync the strings into your source locale file and rewrite calls to proper keys. See the [CLI docs](https://better-translate.com/en/docs/cli) for the full setup.

## Locale route param names

If you use a routing adapter, Better Translate exports the canonical locale param-name list from core:

```ts
import { SUPPORTED_LOCALE_ROUTE_SYNTAXES } from "@better-translate/core";
```

That list is:

```ts
["locale", "lang", "language", "intl", "i18n", "l10n", "localization"];
```

Framework adapters format those names into their own route syntax, like `"$lang"` in TanStack Router or `"[lang]"` in Next.js and Astro.

## Continue with

- [React provider and hooks](https://better-translate.com/en/docs/adapters/react)
- [Next.js App Router setup](https://better-translate.com/en/docs/adapters/nextjs)
- [Astro request helpers](https://better-translate.com/en/docs/adapters/astro)

## Examples

- [core-elysia-example](https://github.com/jralvarenga/better-translate/tree/main/examples/core-elysia-example) — plain TypeScript/Node.js setup
