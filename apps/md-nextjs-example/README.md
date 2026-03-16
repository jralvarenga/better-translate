# md-nextjs-example

A Next.js App Router example demonstrating localized `.md` and `.mdx` content using `better-translate/core` and `@better-translate/md`.

## What this example shows

- **Normal routes only** — no `/[lang]` in the URL. Routes are `/`, `/docs`, and `/docs/[...slug]`.
- **Cookie-based locale** — language is stored in a `bt-locale` cookie. Switching languages updates the cookie and refreshes the current route.
- **UI translations** — `better-translate/core` handles app-level strings with typed keys and per-call locale override.
- **Localized content** — `@better-translate/md` resolves locale-specific Markdown and MDX files from `content/{locale}/`.
- **Automatic fallback** — missing locale files fall back to the default locale. The document exposes `usedFallback: true` so you can surface a notice in the UI.
- **MDX rendering** — `.mdx` documents are evaluated server-side using `evaluate()` from `@mdx-js/mdx` with custom components passed via the `components` prop.
- **No `@better-translate/nextjs`** — this example does not use the Next.js adapter package.

## Routes

| Route | Description |
|---|---|
| `/` | Home page with locale-dependent UI strings |
| `/docs` | Document index listing all docs with frontmatter metadata |
| `/docs/[...slug]` | Individual document page with compiled MD or evaluated MDX |

## Locale flow

```
Request arrives
  → read `bt-locale` cookie
  → resolve to "en" or "es" (default: "en")
  → pass locale to translator.t() for UI strings
  → pass locale to md.getDocument() for content files
  → render page
```

Switching language:
```
User clicks locale button in header
  → setLocale() server action sets the cookie
  → router.refresh() re-renders the current route with the new locale
```

## Content structure

```
content/
  en/
    docs/getting-started.md       ← .md document (both locales)
    docs/component-demo.mdx       ← .mdx document (English only — fallback demo)
  es/
    docs/getting-started.md       ← .md document (Spanish translation)
    (no component-demo.mdx)       ← intentionally missing to show fallback
```

Switching to Spanish on the Component Demo page shows a fallback banner because `content/es/docs/component-demo.mdx` does not exist.

## Key files

```
src/
  lib/i18n/
    locale.ts          — locales, defaultLocale, cookie name, helpers
    config.ts          — configureTranslations() singleton
    server.ts          — getCurrentLocale(), getTranslations(), getMarkdownHelpers()
    actions.ts         — setLocale() server action (updates the cookie)
    messages/
      en.ts            — English UI strings
      es.ts            — Spanish UI strings
  components/
    header.tsx         — client component: nav + locale switcher
    mdx-components.tsx — Callout and Card components for MDX
  app/
    page.tsx           — home page (server component)
    docs/page.tsx      — docs index (server component)
    docs/[...slug]/
      page.tsx         — document page (.md HTML or .mdx evaluated)
```

## Running

From the monorepo root, build packages first:

```sh
bun run build:packages
```

Then start the example:

```sh
cd apps/md-nextjs-example
bun dev
```

Or from the root:

```sh
bun run dev
```

## Packages used

- `better-translate` — core translation engine
- `@better-translate/md` — localized Markdown/MDX content helpers
- `@mdx-js/mdx` — MDX compilation and evaluation at render time
