# Better Translate

One i18n setup for any TypeScript project.

Configure once. Translate everywhere. Type-safe i18n for Next.js, Astro, React, TanStack Router and any TypeScript environment.

## Features

- **Type-Safe by Default** — Full TypeScript inference on translation keys and interpolation variables. Typos and missing keys become compile errors.
- **Autocomplete Everywhere** — Your editor knows every key in your messages object. `t("home.` starts completing instantly.
- **Same Config, Every Environment** — Write your translation config once. It works identically in Next.js, Astro, React, TanStack Router, and plain Node.
- **Locale Switching** — Switch locales at runtime without a page reload. Per-call overrides let you render any locale on demand.

## Packages

- `@better-translate/core` — Framework-agnostic core for TypeScript, Node.js, APIs, and shared libraries.
- `@better-translate/react` — Context, hooks, and locale-aware client rendering for React and Expo apps.
- `@better-translate/nextjs` — Server components, App Router, and route-aware locale helpers.
- `@better-translate/astro` — Request-scoped helpers and localized Astro content collections for .md and .mdx.
- `@better-translate/tanstack-router` — Type-safe routing support for TanStack Router projects, including TanStack Start apps.
- `@better-translate/md` — Localized Markdown and MDX loading on top of an existing translator.
- `@better-translate/cli` — Generate translated message files and markdown from a source locale using any AI SDK provider, including local Ollama models.

## CLI

Hosted or local. Same CLI.

Generate locale files with the same CLI whether you're using AI Gateway or local Ollama models. Pass any AI SDK language model directly in `better-translate.config.ts`, including hosted providers and local Ollama models via `ollama-ai-provider-v2`.

## Docs

- Installation: [better-translate.com/en/docs/installation](https://better-translate.com/en/docs/installation)
- Core: [better-translate.com/en/docs/adapters/core](https://better-translate.com/en/docs/adapters/core)
- React: [better-translate.com/en/docs/adapters/react](https://better-translate.com/en/docs/adapters/react)
- Next.js: [better-translate.com/en/docs/adapters/nextjs](https://better-translate.com/en/docs/adapters/nextjs)
- Astro: [better-translate.com/en/docs/adapters/astro](https://better-translate.com/en/docs/adapters/astro)
- TanStack Router: [better-translate.com/en/docs/adapters/tanstack-router](https://better-translate.com/en/docs/adapters/tanstack-router)
- MD & MDX: [better-translate.com/en/docs/adapters/md](https://better-translate.com/en/docs/adapters/md)
- CLI: [better-translate.com/en/docs/cli](https://better-translate.com/en/docs/cli)

## Workspace

The repository uses Bun and Turborepo. Public packages live in `packages/`, the landing site lives in `apps/landing`, and runnable integration examples live in `examples/`.

## Lockfile

`bun.lock` is committed and must stay in sync with the workspace manifests.
CI uses Bun `1.2.23` together with `bun install --frozen-lockfile`, so lockfile drift will fail builds.

Floating specs such as `latest` tags and nightly tags in workspace examples can cause Bun to re-resolve dependencies and report lockfile changes even when no local files changed.
When intentionally changing dependencies, rerun `bun install` and commit the updated `bun.lock`.

The release workflow's post-`changeset:version` `bun install` is intentional because version bumps change workspace manifests and require a lockfile refresh.
