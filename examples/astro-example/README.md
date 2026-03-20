# astro-example

An Astro example demonstrating `better-translate/core` and `@better-translate/astro`.

## What it demonstrates

- Astro i18n routing as the source of truth for locale-prefixed routes
- request-scoped helpers created with `createServerHelpers(...)`
- middleware created with `createBetterTranslateMiddleware(...)`
- localized Markdown and MDX content rendered through one content helper
- fallback content when a locale-specific document does not exist

## Key files

- `src/lib/i18n/request.ts`: creates the translator with `configureTranslations(...)`
- `src/lib/i18n/server.ts`: exposes Astro request-scoped helpers
- `src/lib/i18n/content.ts`: creates localized content-collection helpers
- `src/middleware.ts`: stores the Astro locale for Better Translate request helpers
- `src/content.config.ts`: defines the `docs` content collection
- `src/content/docs/`: localized `.md` and `.mdx` documents

## Run it

```bash
bun install
bun run dev
```

Then open [http://localhost:3006](http://localhost:3006).
