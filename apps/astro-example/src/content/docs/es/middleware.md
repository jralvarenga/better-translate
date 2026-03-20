---
title: Middleware
description: Cómo createBetterTranslateMiddleware establece el idioma activo en cada solicitud y se integra con el pipeline de middleware de Astro.
---

# Middleware

Better Translate usa el sistema de middleware de Astro para establecer el idioma activo en cada solicitud antes de que se renderice cualquier componente de página.

## Configuración

Exporta el middleware desde `src/middleware.ts`:

```ts
import { createBetterTranslateMiddleware } from "@better-translate/astro/middleware";
import { requestConfig } from "./lib/i18n/request";

export const onRequest = createBetterTranslateMiddleware(requestConfig);
```

Astro detecta automáticamente `src/middleware.ts` y ejecuta `onRequest` en cada solicitud.

## Qué hace

`createBetterTranslateMiddleware` hace dos cosas en cada solicitud:

1. **Detecta el idioma** desde la URL usando las reglas de enrutamiento i18n definidas en `astro.config.mjs`
2. **Almacena el idioma** en el contexto de la solicitud para que `getLocale()` y `getTranslations()` puedan acceder a él desde cualquier componente `.astro`

## Accediendo al idioma en los componentes

Después de que el middleware se ejecuta, usa los helpers de servidor para leer el idioma:

```astro
---
import { getLocale, getTranslations } from "../lib/i18n/server";

const locale = await getLocale();       // "en" | "es"
const t = await getTranslations();     // función de traducción tipada
---

<p>{t("home.title")}</p>
```

Ambos helpers leen desde el mismo contexto de solicitud poblado por el middleware — sin necesidad de pasar props.

## Composición con otro middleware

Si tienes middleware adicional de Astro (por ejemplo, autenticación), puedes componerlos usando el helper `sequence` de `astro:middleware`:

```ts
import { sequence } from "astro:middleware";
import { createBetterTranslateMiddleware } from "@better-translate/astro/middleware";
import { requestConfig } from "./lib/i18n/request";
import { authMiddleware } from "./auth";

export const onRequest = sequence(
  createBetterTranslateMiddleware(requestConfig),
  authMiddleware,
);
```

El middleware de Better Translate debe ejecutarse **primero** para que `getLocale()` esté disponible en cualquier middleware posterior.

## Builds estáticos

En el modo de salida estática de Astro (`output: "static"`), el middleware no se ejecuta en tiempo de solicitud. En cambio, llama a `setRequestLocale(locale)` al inicio de cada página para establecer el idioma antes del renderizado:

```astro
---
import { setRequestLocale } from "../lib/i18n/server";

// Derivar de los parámetros de la ruta, por ejemplo Astro.params.lang
setRequestLocale("en");
---
```
