# Better Translate Skills

This folder explains which Better Translate packages to combine for each kind of app.

## Start with this rule

Always start with `@better-translate/core`.

Then add only the adapter your app needs:

- React or Expo UI: `@better-translate/react`
- Next.js App Router routing and server helpers: `@better-translate/nextjs`
- Astro request helpers and middleware: `@better-translate/astro`
- TanStack Router locale-aware routing: `@better-translate/tanstack-router`
- Localized Markdown or MDX: `@better-translate/md`
- Auto-extract strings and generate locale files with hosted or local models: `@better-translate/cli`

## Fast package chooser

- Plain TypeScript, Node.js, APIs, or shared libraries: read `skills/core/README.md`
- React web apps: read `skills/react/README.md`
- Expo apps: read `skills/expo/README.md`
- Next.js App Router apps: read `skills/nextjs/README.md`
- Markdown or MDX content: read `skills/md/README.md`
- Mixed app with routing, server rendering, and client hooks: read `skills/combined/README.md`
- CLI or bt-extracted strings: read `skills/cli/README.md`

## Reading order

1. `skills/core/README.md`
2. `skills/cli/README.md`
3. `skills/react/README.md`
4. `skills/nextjs/README.md`
5. `skills/md/README.md`
6. `skills/combined/README.md`
