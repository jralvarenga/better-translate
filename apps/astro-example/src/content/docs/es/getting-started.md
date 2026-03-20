---
title: Primeros Pasos
description: Instala Better Translate, configura tu proyecto Astro y muestra tu primera cadena localizada.
---

# Primeros Pasos

Esta guía te lleva paso a paso por la configuración de **Better Translate** en un proyecto Astro nuevo o existente.

## Requisitos previos

- Node.js 18+ o Bun 1.0+
- Un proyecto Astro (v4 o v5)

## Instalación

Instala el adaptador de Astro y la librería principal:

```bash
bun add @better-translate/astro better-translate
```

## Estructura del proyecto

Better Translate para Astro se apoya en tres piezas:

1. **`requestConfig`** – conecta los idiomas y las traducciones
2. **Middleware** – establece el idioma activo en cada solicitud
3. **Helpers de servidor** – acceden al idioma y las traducciones en archivos `.astro`

## 1. Crea tu request config

Crea `src/lib/i18n/request.ts`:

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
    fallbackLocale: defaultLocale,
    languages: [
      { locale: "en", nativeLabel: "English", shortLabel: "EN" },
      { locale: "es", nativeLabel: "Español", shortLabel: "ES" },
    ],
    messages: { en, es },
  }),
}));
```

## 2. Agrega el middleware

```ts
// src/middleware.ts
import { createBetterTranslateMiddleware } from "@better-translate/astro/middleware";
import { requestConfig } from "./lib/i18n/request";

export const onRequest = createBetterTranslateMiddleware(requestConfig);
```

## 3. Configura el i18n de Astro

```js
// astro.config.mjs
import { defineConfig } from "astro/config";

export default defineConfig({
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: { prefixDefaultLocale: false },
  },
});
```

## 4. Muestra tu primera traducción

```astro
---
// src/pages/index.astro
import { getTranslations } from "../lib/i18n/server";

const t = await getTranslations();
---

<h1>{t("home.title")}</h1>
```

Ejecuta `bun run dev` y abre `http://localhost:3006`. Tu encabezado localizado aparece de inmediato.
