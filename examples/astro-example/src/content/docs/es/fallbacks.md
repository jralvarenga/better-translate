---
title: Respaldos
description: Cómo Better Translate maneja el contenido faltante en un idioma ,  respaldo automático, la bandera usedFallback y cómo mostrar un aviso.
---

# Respaldos

Cuando un documento o clave de traducción no está disponible en el idioma solicitado, Better Translate sirve automáticamente la versión del `fallbackLocale` en lugar de mostrar un error.

## Cómo funciona el respaldo

Durante la resolución de contenido, Better Translate busca el documento en este orden:

1. Idioma solicitado (por ejemplo, `es/getting-started.md`)
2. Idioma de respaldo (por ejemplo, `en/getting-started.md`)
3. `ContentDocumentNotFoundError` ,  si ninguno existe

La misma lógica aplica a los mensajes de traducción: una clave faltante en `es.ts` cae al valor de `en.ts`.

## La bandera `usedFallback`

Cada documento devuelto por `getDocument` o `renderDocument` incluye un booleano `usedFallback`:

```ts
const doc = await docs.renderDocument("component-demo", { locale: "es" });

doc.locale          // "en"  ,  lo que se sirvió realmente
doc.requestedLocale // "es"  ,  lo que se solicitó
doc.usedFallback    // true
```

Usa esta bandera para renderizar un aviso informativo:

```astro
{doc.usedFallback && (
  <div class="fallback-banner">
    {t("docs.fallback", {
      params: {
        fallback: doc.locale.toUpperCase(),
        requested: doc.requestedLocale.toUpperCase(),
      },
    })}
  </div>
)}
```

## Configurando el idioma de respaldo

El `fallbackLocale` se establece en tu request config:

```ts
await configureTranslations({
  defaultLocale: "en",
  fallbackLocale: "en",  // cae al inglés
  // ...
});
```

Puedes establecer `fallbackLocale` a cualquier idioma en `availableLocales`. Comúnmente coincide con `defaultLocale`, pero también podrías caer a una variante regional (por ejemplo, `"pt-BR"` cayendo a `"pt"`).

## Respaldos intencionales

Los respaldos no son solo una red de seguridad ,  son una estrategia de publicación válida. Puedes lanzar una función con solo contenido en inglés y dejar que los usuarios de español la vean en inglés (con el aviso) hasta que la traducción esté lista. La bandera `usedFallback` te da control total sobre la experiencia del usuario durante ese período.

## Demo

Esta aplicación intencionalmente no tiene versión en español del documento **Demo de Componentes**. Navega a `/es/docs/component-demo` para ver el aviso de respaldo en acción.
