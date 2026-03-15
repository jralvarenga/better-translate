# better-translate

Framework-agnostic translation configuration runtime for TypeScript projects.

## Example

```ts
import en from "./locales/en.json";
import es from "./locales/es.json";
import {
  createTranslationHelpers,
  type TranslationLocaleMap,
} from "better-translate/core";

type Locale = "en" | "es";

const messages = { en, es } satisfies TranslationLocaleMap<Locale, typeof en>;

const translations = await createTranslationHelpers({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages,
});

translations.t("home.title");
translations.getMessages();
```

The options-based form is the main entrypoint because it defines the locale contract up front. For convenience, the package also supports the short form:

```ts
await configureTranslations({ en, es });
```

If you want app-wide typed helpers, create one setup module and re-export the
bound helpers:

```ts
import en from "./locales/en.json";
import es from "./locales/es.json";
import { createTranslationHelpers } from "better-translate/core";

const translations = await createTranslationHelpers({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  messages: { en, es },
});

export const { getMessages, loadLocale, getSupportedLocales, t } = translations;
```

## Typed locale maps

You can derive translation keys and locale object shapes directly from a source
locale:

```ts
import en from "./locales/en.json";
import es from "./locales/es.json";
import type {
  DeepStringify,
  DotKeys,
  TranslationLocaleMap,
} from "better-translate/core";

type Locale = "en" | "es";
type TranslationKey = DotKeys<typeof en>;

const spanishMessages: DeepStringify<typeof en> = es;

const messages = {
  en,
  es: spanishMessages,
} satisfies TranslationLocaleMap<Locale, typeof en>;
```

That pattern gives TypeScript autocomplete for both `translator.t("section.key")` and the
preloaded locale objects passed into `configureTranslations(...)`.

## App-wide typed helpers

```ts
import en from "./locales/en.json";
import es from "./locales/es.json";
import { createTranslationHelpers } from "better-translate/core";

const translations = await createTranslationHelpers({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es },
});

export const { getMessages, getSupportedLocales, loadLocale, t } = translations;
```

Import those re-exported helpers anywhere in your app to keep the same
message-driven TypeScript contract without a separate ambient `.d.ts` file.

## Preloaded message parity

When you pass locale objects through `messages`, Better Translate now checks at
compile time that every preloaded locale matches the same nested key shape as
the source locale. Async loaders remain flexible, so partially loaded locales
can still rely on fallback behavior.

## JSON schema generation

If your locales live in raw `.json` files, generate a schema from the source
locale and point your editor at it:

```ts
import en from "./locales/en.json";
import { createTranslationJsonSchema } from "better-translate/core";

const schema = createTranslationJsonSchema(en);
```

The generated schema requires the same nested keys and string leaves as the
source locale, which makes it suitable for validating sibling locale JSON
files.
