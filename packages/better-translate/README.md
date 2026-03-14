# better-translate

Framework-agnostic translation configuration runtime for TypeScript projects.

## Example

```ts
import en from "./locales/en.json";
import es from "./locales/es.json";
import {
  configureTranslations,
  type TranslationLocaleMap,
} from "better-translate/core";

type Locale = "en" | "es";

const messages = { en, es } satisfies TranslationLocaleMap<Locale, typeof en>;

const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages,
});

translator.t("home.title");
translator.getMessages();
```

The options-based form is the main entrypoint because it defines the locale contract up front. For convenience, the package also supports the short form:

```ts
await configureTranslations({ en, es });
```

Once translations are configured in one file, the same runtime can access them
from another file without passing the messages again:

```ts
import { getMessages, t } from "better-translate/core";

const messages = getMessages();
const title = t("home.title");
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

That pattern gives TypeScript autocomplete for both `t("section.key")` and the
preloaded locale objects passed into `configureTranslations(...)`.

## Global `t(...)` autocomplete

To get typed autocomplete for the global `t(...)` helper, add one ambient
declaration for your app's locale and message contract:

```ts
import "better-translate/core";

import type en from "./locales/en.json";

declare module "better-translate/core" {
  interface BetterTranslateAppConfig {
    Locale: "en" | "es";
    Messages: typeof en;
  }
}
```

After that, `t("home.title")`, `loadLocale(...)`, `getSupportedLocales()`, and
`getMessages()` all use the same app-wide TypeScript contract.

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
