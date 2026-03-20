---
title: Introducción
description: Qué es Better Translate, por qué funciona bien con Astro y cómo se compara con el i18n nativo de Astro.
---

# Introducción

**Better Translate** es una librería de internacionalización con tipado seguro, diseñada para frameworks modernos. El adaptador de Astro trae su resolución de idioma, lógica de respaldo y helpers de colecciones de contenido a proyectos Astro.

## ¿Por qué Better Translate con Astro?

Astro incluye un excelente enrutamiento i18n incorporado. Better Translate agrega la capa superior — gestionando mensajes de traducción, negociación de idioma y respaldos de contenido — para que puedas enfocarte en tu contenido en lugar de conectar utilidades.

Ventajas principales:

- **Traducciones con tipado seguro** – cada llamada a `t()` es verificada contra tu esquema de mensajes en tiempo de compilación
- **Respaldos automáticos** – el contenido faltante en un idioma cae transparentemente al idioma por defecto, con una bandera que puedes usar para mostrar un aviso
- **Helper de contenido unificado** – una sola API para documentos `.md` y `.mdx` en todos los idiomas
- **Middleware sin configuración** – una sola llamada a `createBetterTranslateMiddleware` establece el idioma en cada solicitud

## Cómo encaja en Astro

```
Solicitud
  │
  ▼
Middleware de Astro (createBetterTranslateMiddleware)
  │  establece el idioma en el contexto de la solicitud
  ▼
Componente .astro
  │  getLocale() → "en" | "es"
  │  getTranslations() → t("clave")
  ▼
Helper de contenido (opcional)
  │  docs.renderDocument("getting-started", { locale })
  │  resuelve idioma → usa respaldo si falta → renderiza
  ▼
Respuesta HTML
```

## Relación con el i18n incorporado de Astro

Better Translate **no reemplaza** el enrutamiento de Astro. La configuración `i18n` en `astro.config.mjs` sigue controlando la estructura de URLs (`/es/docs/...`). Better Translate se sitúa encima, manejando la capa de traducción y la resolución de contenido.

| Tarea | Manejado por |
|-------|-------------|
| Enrutamiento de URLs | Astro i18n |
| Mensajes de traducción | Better Translate |
| Detección de idioma | Middleware de Better Translate |
| Respaldos de contenido | Helper de contenido de Better Translate |
