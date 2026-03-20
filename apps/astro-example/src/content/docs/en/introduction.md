---
title: Introduction
description: What Better Translate is, why it works well with Astro, and how it compares to vanilla Astro i18n.
---

# Introduction

**Better Translate** is a type-safe internationalization library built for modern full-stack frameworks. The Astro adapter brings its locale resolution, fallback logic, and content collection helpers to Astro projects.

## Why Better Translate with Astro?

Astro ships with excellent built-in i18n routing. Better Translate adds the layer above that — managing translation messages, locale negotiation, and content fallbacks — so you can focus on your content instead of wiring utilities together.

Key advantages:

- **Type-safe translations** – every call to `t()` is checked against your message schema at compile time
- **Automatic fallbacks** – missing locale content transparently falls back to the default locale, with a flag you can use to show a banner
- **Unified content helper** – one API for both `.md` and `.mdx` documents across all locales
- **Zero-config middleware** – a single `createBetterTranslateMiddleware` call sets the locale on every request

## How it fits into Astro

```
Request
  │
  ▼
Astro Middleware (createBetterTranslateMiddleware)
  │  sets locale on the request context
  ▼
.astro component
  │  getLocale() → "en" | "es"
  │  getTranslations() → t("key")
  ▼
Content helper (optional)
  │  docs.renderDocument("getting-started", { locale })
  │  resolves locale → falls back if missing → renders
  ▼
HTML response
```

## Relationship to Astro's built-in i18n

Better Translate does **not** replace Astro's routing. The `i18n` config in `astro.config.mjs` still controls URL structure (`/es/docs/...`). Better Translate sits on top, handling the translation layer and content resolution.

Think of it this way:

| Concern | Handled by |
|---------|-----------|
| URL routing | Astro i18n |
| Translation messages | Better Translate |
| Locale detection | Better Translate middleware |
| Content fallbacks | Better Translate content helper |
