# Better Translate

Better Translate is a monorepo for `@better-translate/core` and its adapters for React, Next.js, Astro, TanStack Router, Markdown/MDX, and the CLI.

Each package is published separately on npm, so you can install only the pieces your app needs.

## Packages

- `@better-translate/core` for framework-agnostic translations in TypeScript, Node.js, APIs, and shared libraries.
- `@better-translate/react` for providers and hooks in React and Expo apps.
- `@better-translate/nextjs` for locale routing, server helpers, navigation helpers, and proxy support in Next.js App Router.
- `@better-translate/astro` for request helpers, middleware, and localized Astro content collections.
- `@better-translate/tanstack-router` for locale-aware routing and navigation in TanStack Router and TanStack Start apps.
- `@better-translate/md` for localized Markdown and MDX loading on top of an existing translator.
- `@better-translate/cli` for generating translated message files and markdown from a source locale.

## Docs

- Installation: [better-translate-placeholder.com/en/docs/installation](https://better-translate-placeholder.com/en/docs/installation)
- Core: [better-translate-placeholder.com/en/docs/adapters/core](https://better-translate-placeholder.com/en/docs/adapters/core)
- React: [better-translate-placeholder.com/en/docs/adapters/react](https://better-translate-placeholder.com/en/docs/adapters/react)
- Next.js: [better-translate-placeholder.com/en/docs/adapters/nextjs](https://better-translate-placeholder.com/en/docs/adapters/nextjs)
- Astro: [better-translate-placeholder.com/en/docs/adapters/astro](https://better-translate-placeholder.com/en/docs/adapters/astro)
- TanStack Router: [better-translate-placeholder.com/en/docs/adapters/tanstack-router](https://better-translate-placeholder.com/en/docs/adapters/tanstack-router)
- MD & MDX: [better-translate-placeholder.com/en/docs/adapters/md](https://better-translate-placeholder.com/en/docs/adapters/md)
- CLI: [better-translate-placeholder.com/en/docs/cli](https://better-translate-placeholder.com/en/docs/cli)

## Workspace

The repository uses Bun and Turborepo. Public packages live in `packages/`, the landing site lives in `apps/landing`, and runnable integration examples live in `examples/`.
