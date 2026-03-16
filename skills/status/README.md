# Better Translate Current Status

## What This Is

This file explains the current state of the repo.

It is here so readers do not assume every package and every README is equally complete.

## When To Use It

Read this when:

- you want the honest current status
- you want to know which parts are production-shaped and which parts are still scaffolds

## How It Works

The repo is in an active build stage.

Some parts are already well-defined.

Some parts are placeholders or still need polish.

## Current Product Truth

### Core package

`better-translate` is the main engine and the most important package.

It already has:

- typed keys
- typed params
- fallback behavior
- async locale loading
- global helpers
- JSON schema generation
- tests and typechecks

### React package

`@better-translate/react` is real and documented.

It already has:

- provider
- hook
- locale switching
- async loading support
- failure handling
- tests and typechecks

### Next.js package

`@better-translate/nextjs` is real and documented.

It already has:

- routing helpers
- proxy helpers
- server helpers
- navigation wrappers
- root and scoped route patterns
- tests and typechecks

### TanStack Router package

`@better-translate/tanstack-router` now provides the TanStack Router adapter, including Start-compatible server helpers.

### VS Code package

`@better-translate/vscode` exists and is meant to support translation key navigation.

The feature notes in `KEY_FEATURES.md` also mention that this area still needs work.

## Repo Caveats

### Some READMEs are strong

These are useful:

- root `README.md`
- `packages/better-translate/README.md`
- `packages/react/README.md`
- `packages/nextjs/README.md`
- `apps/core-elysia-example/README.md`
- `apps/nextjs-example/README.md`

### Some READMEs are still boilerplate

These still look like starter/template docs:

- `apps/react-vite-example/README.md`
- `apps/nextjs-nested-locale-example/README.md`
- `apps/landing/README.md`

That is one reason this new `skills/` folder is useful.

## Important Files

- `README.md`
- `KEY_FEATURES.md`
- `packages/tanstack-router/README.md`
- `packages/vscode/package.json`
- `packages/better-translate/src/core.test.ts`
- `packages/react/src/react.test.tsx`
- `packages/nextjs/src/nextjs.test.ts`

## Simple Mental Model

The core, React, and Next.js packages are the main finished story.

TanStack Router is implemented, and some surrounding docs may still mention TanStack Start where they describe Start compatibility.

## What To Copy From The Examples

- Copy from the examples that match the finished packages first.
- Treat the landing app as a strong integration reference.
- Treat scaffold packages and template READMEs as directional, not final.
