# Contributing

Thanks for contributing to Better Translate.

This repository is a Bun + Turborepo monorepo. Public packages live in `packages/`, the landing site lives in `apps/landing`, and runnable examples live in `examples/`.

## Prerequisites

- Bun `1.2.23`
- Node.js `>=18`
- Git

## Setup

1. Clone the repository.
2. Install dependencies from the repository root:

```sh
bun install
```

CI uses `bun install --frozen-lockfile`, so if you intentionally change dependencies, commit the updated `bun.lock`.

## Workspace Layout

- `packages/`: publishable packages such as `@better-translate/core` and framework adapters
- `apps/landing`: the landing site
- `examples/`: runnable integration examples
- `.changeset/`: release metadata used by Changesets

## Daily Commands

Run these from the repository root:

```sh
bun run build
bun run test
bun run lint
bun run check-types
bun run check:lockfile
```

Useful targeted commands:

```sh
bun run dev
bun run dev:landing
bun run build:packages
bun run test:packages
```

## Changesets

Use a changeset when your change affects a publishable package under `packages/` and should result in a version bump.

Create one from the repository root:

```sh
bun changeset
```

Choose the affected package or packages and select the appropriate bump type.

You usually do not need a changeset for:

- docs-only changes
- CI or repository maintenance changes
- changes limited to `apps/landing` or `examples/`
- internal-only workspace updates that do not affect published packages

The repository uses the Changesets GitHub Action to open release pull requests from pending changesets on `main`.

## Pull Requests

- Branch from `main`
- Keep pull requests focused and easy to review
- Link the related issue or explain the motivation clearly
- Run the relevant root commands before opening your PR
- Include screenshots, recordings, or reproduction steps when behavior or UI changes
- Add or update docs when the change affects public usage
- Commit any required lockfile updates when dependencies change

For publishable package changes, make sure the PR includes a changeset file unless the version bump is intentionally handled elsewhere.

CI runs on pull requests plus pushes to `main` and `dev`. These runs are verification-only and do not publish packages.

## Release Notes Workflow

When your PR changes a publishable package:

1. Make your code changes.
2. Run `bun changeset`.
3. Commit the generated `.changeset/*.md` file with your PR.

After merge to `main`, the release workflow will prepare the versioning pull request and publish through the existing GitHub Actions release process. Pushes to `dev` and pull request builds never publish to npm.
