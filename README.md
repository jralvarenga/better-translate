# Better Translate

Better Translate is a Bun + Turborepo monorepo for type-safe translations in TypeScript projects.

The main package is `better-translate`, exposed both from the package root and from the `better-translate/core` subpath. It is framework-agnostic and is intended to be installed into any TypeScript project, including React, Next.js, TanStack Start, and future adapters such as Svelte or Vue.

## Packages

- `better-translate`: framework-agnostic translation configuration runtime and typed lookup core.
- `@better-translate/md`: localized Markdown and MDX helpers built on top of a configured Better Translate translator.
- `better-translate/react`: future React adapter package.
- `@better-translate/nextjs`: Next.js adapter package.
- `better-translate/tanstack-start`: future TanStack Start adapter package.
- `@repo/typescript-config`: internal shared TypeScript presets used by the workspace.

## Repository Layout

```txt
apps/
  docs/
  web/
packages/
  better-translate/
  nextjs/
  react/
  tanstack-start/
  typescript-config/
```

## Scripts

```sh
bun run build
bun run build:packages
bun run check-types
bun run check-types:packages
```

`build:packages` and `check-types:packages` include `better-translate` and the framework packages.

## Core Direction

The `better-translate` package is responsible for:

- configuring translations globally for a TypeScript project
- deriving dot-notation translation keys from source messages
- supporting fallback locales
- supporting async locale loaders for future services
- remaining independent from framework-specific runtime concerns
