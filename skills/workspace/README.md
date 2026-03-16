# Better Translate Workspace

## What This Is

This guide explains how the monorepo is organized.

It helps you understand where the library code lives, where the examples live, and which config files matter.

## When To Use It

Read this when:

- you are new to the repo
- you want to know where to read code
- you want to understand build, typecheck, and package structure

## How It Works

This repo is a Bun + Turborepo monorepo.

The workspace has two main areas:

- `packages/`
- `apps/`

### `packages/`

This folder contains the publishable or reusable library pieces.

- `packages/better-translate`
  Core translation engine
- `packages/react`
  React provider and hooks
- `packages/nextjs`
  Next.js App Router helpers
- `packages/tanstack-router`
  Scaffold package only
- `packages/vscode`
  VS Code extension
- `packages/typescript-config`
  Shared TypeScript presets for the workspace

### `apps/`

This folder contains example apps and the landing app.

- `apps/core-elysia-example`
- `apps/react-vite-example`
- `apps/nextjs-example`
- `apps/nextjs-nested-locale-example`
- `apps/landing`

## Important Config Files

### Root files

- `package.json`
  Workspace scripts and workspaces
- `turbo.json`
  Turborepo task graph
- `README.md`
  High-level repo overview
- `KEY_FEATURES.md`
  Rough feature direction notes

### Shared TypeScript config

- `packages/typescript-config/base.json`
- `packages/typescript-config/nextjs.json`
- `packages/typescript-config/react-library.json`

These configs help keep package TypeScript settings consistent.

### App-level config

- Next.js apps use `next.config.ts`, `postcss.config.mjs`, and `tsconfig.json`
- the React Vite app uses `vite.config.ts`, `tsconfig.app.json`, and `tsconfig.node.json`
- the Elysia example uses its own local `tsconfig.json`

## Workspace Scripts

From the repo root:

- `bun run build`
- `bun run build:packages`
- `bun run check-types`
- `bun run check-types:packages`
- `bun run dev`

Each package also has its own local scripts, usually for `build`, `check-types`, and sometimes `test`.

## Important Files

- `package.json`
- `turbo.json`
- `packages/typescript-config/base.json`
- `packages/typescript-config/nextjs.json`
- `packages/typescript-config/react-library.json`
- `packages/*/package.json`
- `apps/*/package.json`

## Simple Mental Model

Think of the workspace like this:

- `packages/` = the product
- `apps/` = the proof

The packages define the real library behavior.

The apps show how that behavior is used in real projects.

## What To Copy From The Examples

- Copy from `packages/` when you want to understand the API.
- Copy from `apps/` when you want to understand integration.
- Copy from `packages/typescript-config` only if you are working inside this monorepo or making another package in the same style.
