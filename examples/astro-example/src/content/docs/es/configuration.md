---
title: Configuración
description: Todas las opciones de configuración para Better Translate en un proyecto Astro — request config, ajustes i18n y middleware.
---

# Configuración

La configuración de Better Translate vive en tres lugares: tu archivo de request config, `astro.config.mjs` y la exportación opcional del middleware.

## Request config (`src/lib/i18n/request.ts`)

Este es el archivo de configuración principal. Conecta tus idiomas, mensajes y ajustes opcionales.

```ts
import { getRequestConfig } from "@better-translate/astro";
import { configureTranslations } from "better-translate/core";

import { en } from "./messages/en";
import { es } from "./messages/es";

export const appLocales = ["en", "es"] as const;
export const defaultLocale = "en" as const;

export const requestConfig = getRequestConfig(async () => ({
  translator: await configureTranslations({
    availableLocales: appLocales,
    defaultLocale,
    fallbackLocale: defaultLocale,   // idioma a usar cuando falta una clave
    languages: [
      { locale: "en", nativeLabel: "English", shortLabel: "EN" },
      { locale: "es", nativeLabel: "Español", shortLabel: "ES" },
    ],
    messages: { en, es },
  }),
}));
```

### Opciones de `configureTranslations`

| Opción | Tipo | Descripción |
|--------|------|-------------|
| `availableLocales` | `readonly string[]` | Todos los códigos de idioma soportados |
| `defaultLocale` | `string` | El idioma principal, usado cuando no se detecta ninguno |
| `fallbackLocale` | `string` | Idioma al que recurrir cuando faltan claves |
| `languages` | `LanguageConfig[]` | Metadatos de visualización para cada idioma |
| `messages` | `Record<string, Messages>` | Mensajes de traducción indexados por idioma |

## Configuración de Astro (`astro.config.mjs`)

Configura el enrutamiento i18n propio de Astro para que coincida con tus idiomas:

```js
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [mdx()],
  vite: { plugins: [tailwindcss()] },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: false,  // /docs vs /en/docs
    },
  },
});
```

Establecer `prefixDefaultLocale: false` mantiene el idioma por defecto en la raíz (`/docs/...`) mientras los idiomas no predeterminados llevan prefijo (`/es/docs/...`).

## Middleware (`src/middleware.ts`)

El middleware detecta el idioma activo desde la URL usando las reglas de enrutamiento i18n definidas en `astro.config.mjs` y lo almacena en el contexto de la solicitud.

```ts
import { createBetterTranslateMiddleware } from "@better-translate/astro/middleware";
import { requestConfig } from "./lib/i18n/request";

export const onRequest = createBetterTranslateMiddleware(requestConfig);
```

Esta única línea es todo lo que se necesita. Astro ejecuta automáticamente `onRequest` antes de cada renderizado de página.

## Helpers de servidor (`src/lib/i18n/server.ts`)

Exporta los helpers del lado del servidor desde un módulo compartido:

```ts
import { createServerHelpers, setRequestLocale } from "@better-translate/astro";
import { requestConfig } from "./request";

export const {
  getLocale,
  getTranslations,
  getMessages,
  getAvailableLanguages,
} = createServerHelpers(requestConfig);

export { setRequestLocale };
```
