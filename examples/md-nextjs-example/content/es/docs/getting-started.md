---
title: Comenzando
description: Configura better-translate para contenido Markdown y MDX localizado.
date: 2025-01-15
---

## Instalación

Instala el paquete principal y el adaptador MD:

```tsx showLineNumbers
bun add better-translate @better-translate/md
```

## Configura un traductor

Usa el formulario de opciones para una configuración de producción con contrato de idioma explícito:

```tsx showLineNumbers
import { configureTranslations } from "better-translate/core"

const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es },
})
```

## Crea helpers de markdown

Apunta los helpers a tu directorio de contenido:

```tsx showLineNumbers
import { createMarkdownHelpers } from "@better-translate/md"
import path from "path"

const md = createMarkdownHelpers(translator, {
  rootDir: path.join(process.cwd(), "content"),
})
```

Los archivos de contenido se organizan por idioma:

- `content/en/docs/getting-started.md`
- `content/es/docs/getting-started.md`
- `content/en/docs/component-demo.mdx`

## Listar y obtener documentos

```tsx showLineNumbers
// Lista todos los IDs de documentos (escaneados desde el directorio del idioma predeterminado)
const ids = await md.listDocuments()
// → ["docs/component-demo", "docs/getting-started"]

// Obtener un documento con resolución de idioma y fallback
const doc = await md.getDocument("docs/getting-started", { locale: "es" })
// doc.frontmatter  ,  YAML frontmatter parseado
// doc.source       ,  contenido sin frontmatter
// doc.kind         ,  "md" o "mdx"
// doc.usedFallback ,  true cuando el archivo no existe para el idioma solicitado
```

## Compilar y renderizar

Para archivos `.md`, compila a HTML:

```tsx showLineNumbers
const compiled = await md.compileDocument("docs/getting-started", { locale })
if (compiled.kind === "md") {
  return <div dangerouslySetInnerHTML={{ __html: compiled.html }} />
}
```

Para archivos `.mdx`, evalúa con `@mdx-js/mdx`:

```tsx showLineNumbers
import { evaluate } from "@mdx-js/mdx"
import * as runtime from "react/jsx-runtime"

const { source } = await md.getDocument("docs/component-demo", { locale })
const { default: Content } = await evaluate(source, { ...runtime })
return <Content components={{ Callout, Card }} />
```

## Comportamiento de fallback

Si falta un archivo de idioma, la biblioteca regresa automáticamente al `fallbackLocale`. El documento retornado incluye:

- `usedFallback: true` ,  el idioma solicitado no estaba disponible
- `locale` ,  el idioma que se usó realmente
- `requestedLocale` ,  lo que se solicitó originalmente

Usa esto para mostrar un aviso de localización a los usuarios.
