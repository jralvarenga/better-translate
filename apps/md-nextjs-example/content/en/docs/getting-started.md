---
title: Getting Started
description: Set up better-translate for localized Markdown and MDX content.
date: 2025-01-15
---

## Installation

Install the core package and the MD adapter:

```sh
bun add better-translate @better-translate/md
```

## Configure a translator

Use the options form for a production setup with explicit locale contract:

```ts
import { configureTranslations } from "better-translate/core"

const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es },
})
```

## Create markdown helpers

Point the helpers at your content directory:

```ts
import { createMarkdownHelpers } from "@better-translate/md"
import path from "path"

const md = createMarkdownHelpers(translator, {
  rootDir: path.join(process.cwd(), "content"),
})
```

Content files are organized by locale:

- `content/en/docs/getting-started.md`
- `content/es/docs/getting-started.md`
- `content/en/docs/component-demo.mdx`

## List and fetch documents

```ts
// List all document IDs (scanned from the default locale directory)
const ids = await md.listDocuments()
// → ["docs/component-demo", "docs/getting-started"]

// Fetch a document with locale resolution and fallback
const doc = await md.getDocument("docs/getting-started", { locale: "es" })
// doc.frontmatter  — parsed YAML frontmatter
// doc.source       — raw content (frontmatter stripped)
// doc.kind         — "md" or "mdx"
// doc.usedFallback — true when the file was missing for the requested locale
```

## Compile and render

For `.md` files, compile to HTML:

```ts
const compiled = await md.compileDocument("docs/getting-started", { locale })
if (compiled.kind === "md") {
  return <div dangerouslySetInnerHTML={{ __html: compiled.html }} />
}
```

For `.mdx` files, evaluate with `@mdx-js/mdx`:

```ts
import { evaluate } from "@mdx-js/mdx"
import * as runtime from "react/jsx-runtime"

const { source } = await md.getDocument("docs/component-demo", { locale })
const { default: Content } = await evaluate(source, { ...runtime })
return <Content components={{ Callout, Card }} />
```

## Fallback behavior

If a locale file is missing, the library automatically falls back to the `fallbackLocale`. The returned document includes:

- `usedFallback: true` — the requested locale was unavailable
- `locale` — the locale that was actually used
- `requestedLocale` — what was originally requested

Use this to show a localization notice to users.
