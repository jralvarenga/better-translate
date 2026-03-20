---
title: Content Collections
description: Use createContentCollectionHelpers to serve localized Markdown and MDX documents with automatic fallback.
---

# Content Collections

Better Translate provides a `createContentCollectionHelpers` function that wraps Astro's native content collections with locale resolution and automatic fallback.

## Setting up the collection

Define a `docs` collection in `src/content.config.ts`:

```ts
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const docs = defineCollection({
  loader: glob({
    base: "./src/content/docs",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    description: z.string().optional(),
    title: z.string(),
  }),
});

export const collections = { docs };
```

Organize your content files by locale:

```
src/content/docs/
├── en/
│   ├── getting-started.md
│   ├── configuration.md
│   └── component-demo.mdx
└── es/
    ├── getting-started.md
    └── configuration.md
```

## Creating the helpers

```ts
// src/lib/i18n/content.ts
import { getCollection, render } from "astro:content";
import { createContentCollectionHelpers } from "@better-translate/astro/content";

import { requestConfig } from "./request";

export const docs = createContentCollectionHelpers(requestConfig, {
  collection: "docs",
  getCollection,
  render,
});
```

## Listing documents

`docs.listDocuments()` returns a deduplicated list of all document IDs, regardless of locale:

```astro
---
const ids = await docs.listDocuments();
// ["getting-started", "configuration", "component-demo"]
---
```

## Fetching a document (data only)

Use `docs.getDocument(id, { locale })` when you need the frontmatter data but not the rendered content:

```astro
---
const doc = await docs.getDocument("getting-started", { locale: "es" });

doc.id           // "getting-started"
doc.locale       // "es" (or "en" if fallback was used)
doc.usedFallback // true if "es" was missing and "en" was used
doc.data.title   // "Primeros Pasos"
---
```

## Rendering a document

Use `docs.renderDocument(id, { locale })` when you need the full rendered content:

```astro
---
import { ContentDocumentNotFoundError } from "@better-translate/astro/content";

let result = null;
try {
  result = await docs.renderDocument("getting-started", { locale });
} catch (e) {
  if (e instanceof ContentDocumentNotFoundError) {
    // No content in any locale — true 404
  }
}

const { Content } = result.rendered;
---

<article>
  <Content />
</article>
```

## Fallback behavior

When the requested locale does not have a version of a document, Better Translate automatically serves the `fallbackLocale` version. The `usedFallback` flag lets you show an informational banner to the user.
