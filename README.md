# Better Translate

Better Translate is a Bun + Turborepo monorepo for type-safe translations in React applications. The goal is a better translation workflow where TypeScript can autocomplete translation keys from the string you pass into a hook-based API.

This repo is currently in setup mode. The package boundaries, build pipeline, and TypeScript configuration are in place, while the translation runtime and hook implementation are intentionally deferred.

## Packages

- `@better-translate/react`: base React package for the future translation runtime and typed hooks.
- `@better-translate/nextjs`: Next.js-focused package for framework-specific integration.
- `@better-translate/tanstack-start`: TanStack Start-focused package for framework-specific integration.
- `@repo/typescript-config`: internal shared TypeScript presets used by the workspace.

## Repository Layout

```txt
apps/
  docs/
  web/
packages/
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

`build:packages` and `check-types:packages` are the intended validation commands for the publishable libraries added in this setup pass.

## Current Status

- Publishable package manifests are configured for npm.
- Library builds target ESM, CJS, and declaration output.
- TypeScript config is shared through the internal workspace config package.
- Source entrypoints are placeholders only.

## Roadmap

The next implementation pass will add the actual translation primitives, including:

- a hook-based API for consuming translations
- TypeScript-driven key autocomplete
- framework-specific integration for Next.js and TanStack Start
