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
- `@better-translate/cli` for generating translated message files and markdown from a source locale with any AI SDK provider, including local Ollama models.

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

## CLI Providers

`@better-translate/cli` uses a bring-your-own-provider model. You can pass any AI SDK language model directly in `better-translate.config.ts`, including hosted providers and local Ollama models via `ollama-ai-provider-v2`.

## Lockfile

`bun.lock` is committed and must stay in sync with the workspace manifests.
CI uses Bun `1.2.23` together with `bun install --frozen-lockfile`, so lockfile drift will fail builds.

Floating specs such as `latest` tags and nightly tags in workspace examples can cause Bun to re-resolve dependencies and report lockfile changes even when no local files changed.
When intentionally changing dependencies, rerun `bun install` and commit the updated `bun.lock`.

The release workflow's post-`changeset:version` `bun install` is intentional because version bumps change workspace manifests and require a lockfile refresh.
