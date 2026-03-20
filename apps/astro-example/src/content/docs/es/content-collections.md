---
title: Colecciones de Contenido
description: Usa createContentCollectionHelpers para servir documentos Markdown y MDX localizados con respaldo automático.
---

# Colecciones de Contenido

Better Translate proporciona una función `createContentCollectionHelpers` que envuelve las colecciones de contenido nativas de Astro con resolución de idioma y respaldo automático.

## Configurando la colección

Define una colección `docs` en `src/content.config.ts`:

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

Organiza tus archivos de contenido por idioma:

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

## Creando los helpers

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

## Listar documentos

`docs.listDocuments()` devuelve una lista deduplicada de todos los IDs de documentos, sin importar el idioma:

```astro
---
const ids = await docs.listDocuments();
// ["getting-started", "configuration", "component-demo"]
---
```

## Obtener un documento (solo datos)

Usa `docs.getDocument(id, { locale })` cuando necesites los datos del frontmatter pero no el contenido renderizado:

```astro
---
const doc = await docs.getDocument("getting-started", { locale: "es" });

doc.id           // "getting-started"
doc.locale       // "es" (o "en" si se usó respaldo)
doc.usedFallback // true si "es" faltaba y se usó "en"
doc.data.title   // "Primeros Pasos"
---
```

## Renderizar un documento

Usa `docs.renderDocument(id, { locale })` cuando necesites el contenido completamente renderizado:

```astro
---
import { ContentDocumentNotFoundError } from "@better-translate/astro/content";

let result = null;
try {
  result = await docs.renderDocument("getting-started", { locale });
} catch (e) {
  if (e instanceof ContentDocumentNotFoundError) {
    // No hay contenido en ningún idioma — verdadero 404
  }
}

const { Content } = result.rendered;
---

<article>
  <Content />
</article>
```

## Comportamiento del respaldo

Cuando el idioma solicitado no tiene una versión de un documento, Better Translate sirve automáticamente la versión del `fallbackLocale`. La bandera `usedFallback` te permite mostrar un aviso informativo al usuario.
