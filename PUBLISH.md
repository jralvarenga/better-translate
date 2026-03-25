# Publishing

## Packages

| Package | npm |
|---|---|
| `@better-translate/core` | [![npm](https://img.shields.io/npm/v/@better-translate/core)](https://www.npmjs.com/package/@better-translate/core) |
| `@better-translate/react` | [![npm](https://img.shields.io/npm/v/@better-translate/react)](https://www.npmjs.com/package/@better-translate/react) |
| `@better-translate/nextjs` | [![npm](https://img.shields.io/npm/v/@better-translate/nextjs)](https://www.npmjs.com/package/@better-translate/nextjs) |
| `@better-translate/astro` | [![npm](https://img.shields.io/npm/v/@better-translate/astro)](https://www.npmjs.com/package/@better-translate/astro) |
| `@better-translate/tanstack-router` | [![npm](https://img.shields.io/npm/v/@better-translate/tanstack-router)](https://www.npmjs.com/package/@better-translate/tanstack-router) |
| `@better-translate/cli` | [![npm](https://img.shields.io/npm/v/@better-translate/cli)](https://www.npmjs.com/package/@better-translate/cli) |
| `@better-translate/md` | [![npm](https://img.shields.io/npm/v/@better-translate/md)](https://www.npmjs.com/package/@better-translate/md) |

---

## Local publish

Use this when you want to publish manually without going through CI.

### Prerequisites

Make sure `~/.npmrc` contains your npm access token:

```
//registry.npmjs.org/:_authToken=<your-token>
```

The token must have **Bypass two-factor authentication** enabled, otherwise publishing will fail with `EOTP`.

### Steps

**1. Create a changeset** (skip if version bumps are already in place)

```sh
bun changeset
```

Select the affected packages and choose a bump type (`patch` / `minor` / `major`). Commit the generated `.changeset/*.md` file.

**2. Apply version bumps**

```sh
npx changeset version
```

**3. Build all packages**

```sh
bun run build:packages
```

**4. Publish to npm**

```sh
npx changeset publish
```

Only packages whose local version is not yet on npm will be published. Everything else is skipped.

**5. Push git tags**

```sh
git push --tags
```

---

## GitHub Actions (CI release flow)

This is the recommended flow for team releases.

### One-time setup

1. Create an npm **Granular Access Token** at [npmjs.com](https://npmjs.com) with:
   - Organizations: `better-translate` — Read and write
   - Packages and scopes: All packages — Read and write
   - Security settings: **Bypass two-factor authentication** enabled
2. Add the token as a GitHub Actions secret named `NPM_TOKEN`
   (Settings → Secrets and variables → Actions → New repository secret)
3. Make sure the `better-translate` npm org has **Granular Access Tokens** enabled
   (npmjs.com → Organization settings → Security)

### Workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install

      - name: Build packages
        run: bun run build:packages

      - name: Create release pull request or publish
        uses: changesets/action@v1
        with:
          publish: npx changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NPM_CONFIG_PROVENANCE: true
```

### How it works

1. Make your changes to one or more packages
2. Run `bun changeset` — select affected packages and choose a bump type
3. Commit the generated `.changeset/*.md` file and push to `main`
4. CI opens a **"Release packages"** pull request with version bumps applied
5. Review and merge the PR — CI publishes only the changed packages to npm automatically

`NPM_CONFIG_PROVENANCE=true` attaches signed provenance attestations to published packages via GitHub Actions OIDC.
