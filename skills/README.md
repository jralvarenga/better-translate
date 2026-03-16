# Better Translate Skills

This folder explains how the `better-translate` library works in very simple language.

It is not source code. It is a learning guide for people who want to understand the library without reading the whole repo first.

## Start Here

If you are new, read the files in this order:

1. `skills/core/README.md`
2. `skills/react/README.md` or `skills/nextjs/README.md`
3. `skills/md/README.md`
4. `skills/combined/README.md`
5. `skills/examples/README.md`
6. `skills/workspace/README.md`
7. `skills/status/README.md`

## Package Map

- `better-translate`
  The main library. This is the core translation engine.
- `@better-translate/react`
  React provider and hooks.
- `@better-translate/nextjs`
  Next.js App Router helpers.
- `@better-translate/md`
  Markdown and MDX helpers that use the same configured translator.
- `@better-translate/tanstack-router`
  Scaffold package. It is not fully implemented yet.
- `@better-translate/vscode`
  VS Code extension for translation key navigation.

## Which Guide Should I Read?

- If you only need translations in TypeScript or on a server, read `skills/core/README.md`.
- If you are building a React app, read `skills/react/README.md`.
- If you are building a Next.js App Router app, read `skills/nextjs/README.md`.
- If you are translating Markdown or MDX files, read `skills/md/README.md`.
- If your app has both server and client parts, read `skills/combined/README.md`.
- If you learn best by copying working projects, read `skills/examples/README.md`.

## Simple Mental Model

Better Translate has one main idea:

1. Configure translations once.
2. Use typed helpers everywhere.

The core package owns the translation logic.

The React package makes that logic easy to use in client components.

The Next.js package makes that logic easy to use with routing, server helpers, and locale-aware navigation.

The Markdown package makes that same logic work for localized `.md` and `.mdx` files.

## Important Files

- `packages/better-translate`
- `packages/react`
- `packages/nextjs`
- `packages/md`
- `apps/react-vite-example`
- `apps/nextjs-example`
- `apps/nextjs-nested-locale-example`
- `apps/core-elysia-example`
- `apps/landing`

## What To Copy From The Examples

- Copy the core setup if you want typed translations anywhere.
- Copy the React provider pattern if you need client-side locale switching.
- Copy the Next.js request, server, routing, navigation, and proxy files if you need App Router support.
- Copy the Markdown helpers if you need localized `.md` or `.mdx` files.
- Copy the landing app pattern if you need both server and client translation behavior in one app.
