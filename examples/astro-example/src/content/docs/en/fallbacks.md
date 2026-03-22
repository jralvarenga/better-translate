---
title: Fallbacks
description: How Better Translate handles missing locale content ,  automatic fallback, the usedFallback flag, and showing a banner.
---

# Fallbacks

When a document or translation key is not available in the requested locale, Better Translate automatically serves the `fallbackLocale` version instead of showing an error.

## How fallback works

During content resolution, Better Translate looks for the document in this order:

1. Requested locale (e.g. `es/getting-started.md`)
2. Fallback locale (e.g. `en/getting-started.md`)
3. `ContentDocumentNotFoundError` ,  if neither exists

The same logic applies to translation messages: a missing key in `es.ts` falls back to the value from `en.ts`.

## The `usedFallback` flag

Every document returned by `getDocument` or `renderDocument` includes a `usedFallback` boolean:

```ts
const doc = await docs.renderDocument("component-demo", { locale: "es" });

doc.locale          // "en"  ,  what was actually served
doc.requestedLocale // "es"  ,  what was asked for
doc.usedFallback    // true
```

Use this flag to render an informational banner:

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

## Configuring the fallback locale

The `fallbackLocale` is set in your request config:

```ts
await configureTranslations({
  defaultLocale: "en",
  fallbackLocale: "en",  // falls back to English
  // ...
});
```

You can set `fallbackLocale` to any locale in `availableLocales`. Commonly it matches `defaultLocale`, but you could also fall back to a regional variant (e.g. `"pt-BR"` falling back to `"pt"`).

## Intentional fallbacks

Fallbacks are not just a safety net ,  they are a valid publishing strategy. You can ship a feature with only English content and let Spanish users see it in English (with the banner) until the translation is ready. The `usedFallback` flag gives you full control over the user experience during that window.

## Demo

This app intentionally has no Spanish version of the **Component Demo** doc. Navigate to `/es/docs/component-demo` to see the fallback banner in action.
