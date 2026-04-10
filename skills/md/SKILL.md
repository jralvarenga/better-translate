---
name: md
description: Localized Markdown and MDX content guide for Better Translate projects.
---

# MD Skill

Use this guide when localized content lives in `.md` or `.mdx` files.

## Correct package combination

- required: `@better-translate/core`
- add: `@better-translate/md`

## Mental model

The core translator owns the locales.

`@better-translate/md` uses that same locale setup to find the right content file.

## Smallest correct setup

1. Create the translator in `@better-translate/core`
2. Put content under one folder per locale
3. Create markdown helpers with `createMarkdownHelpers()`

```txt
content/docs/
  en/
    getting-started.mdx
  es/
    getting-started.mdx
```

```ts
import { createMarkdownHelpers } from "@better-translate/md";

import { translator } from "./i18n";

export const docs = createMarkdownHelpers(translator, {
  rootDir: "./content/docs",
});
```

```ts
const document = await docs.getDocument("getting-started", {
  locale: "es",
});
```

## Keep TypeScript autocomplete available

Keep markdown helpers connected to the shared exported `translator` so locale inference stays aligned with the rest of the app.

## When to use the server entry

Use `@better-translate/md/server` when the app already resolves locale per request and you want markdown loading to follow that request locale automatically.
