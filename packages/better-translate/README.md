# better-translate

Framework-agnostic translation configuration runtime for TypeScript projects.

## Example

```ts
import en from "./locales/en.json";
import es from "./locales/es.json";
import { configureTranslations } from "better-translate/core";

const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es },
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
