# @better-translate/md

Markdown and MDX helpers for Better Translate.

This package uses the same configured translator you already create with
`configureTranslations(...)`. It does not define a separate locale system.

## Install

```sh
bun add @better-translate/md better-translate
```

## Example

```ts
import { configureTranslations } from "better-translate/core";
import { createMarkdownHelpers } from "@better-translate/md";

const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: {
    en: {
      common: {
        hello: "Hello",
      },
    },
  },
});

const docs = createMarkdownHelpers(translator, {
  rootDir: "./content",
});

const page = await docs.getDocument("docs/getting-started", {
  locale: "es",
});
```

Supported file layout:

```txt
content/
  en/docs/getting-started.mdx
  es/docs/getting-started.mdx
```
