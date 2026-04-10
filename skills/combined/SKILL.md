---
name: combined
description: Guide for combining Better Translate packages without duplicating translation ownership.
---

# Combined Skill

Use this guide when the app needs more than one Better Translate package.

## Common combinations

### React app

- `@better-translate/core`
- `@better-translate/react`

### Next.js App Router with server translations only

- `@better-translate/core`
- `@better-translate/nextjs`

### Next.js App Router with server and client translations

- `@better-translate/core`
- `@better-translate/nextjs`
- `@better-translate/react`

### TanStack Router app with React UI

- `@better-translate/core`
- `@better-translate/tanstack-router`
- `@better-translate/react`

### Astro docs site with localized markdown

- `@better-translate/core`
- `@better-translate/astro`
- `@better-translate/md`

### Any app with AI-generated locale files

Add `@better-translate/cli` to any combination above when you want the CLI to manage locale file creation.

Example - Next.js app with generated translations:

- `@better-translate/core`
- `@better-translate/nextjs`
- `@better-translate/cli`

## Keep TypeScript autocomplete available

Every combination still works best when one shared exported `translator` stays the source of truth. Let adapters, hooks, and helpers read from that same typed translator instead of recreating locale rules in multiple places.

## Rule to keep the setup clean

Every combination still has one source of truth:

- core owns the translator
- framework adapters own routing or request integration
- react owns hooks and providers
- md owns localized content loading
- cli owns generation

Do not duplicate locale rules in multiple places.
