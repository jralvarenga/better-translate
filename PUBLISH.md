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

If you are publishing `@better-translate/*` packages for the first time, also make sure:

- the `@better-translate` npm scope exists and is owned by the intended npm user or organization
- the token owner has permission to publish under that scope
- the npm token has organization read/write and package/scope read/write permissions

If the scope does not exist on npm or is owned by a different account, npm can fail first-time publishes with `E404` even when the workflow is otherwise correct.

### Steps

**1. Create a changeset** (skip if version bumps are already in place)

```sh
bun changeset
```

Select the affected packages and choose a bump type (`patch` / `minor` / `major`). Commit the generated `.changeset/*.md` file.

**2. Apply version bumps**

```sh
bun run changeset:version
```

**3. Build all packages**

```sh
bun run build:packages
```

**4. Publish to npm**

```sh
bunx changeset publish
```

Only packages whose local version is not yet on npm will be published. Everything else is skipped.

**5. Create release tags from versioned packages**

```sh
bun run release:tags
```

This creates missing `@better-translate/*@version` tags from the package versions produced by Changesets.

**6. Push git tags**

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
4. Make sure the account behind `NPM_TOKEN` is allowed to publish the `@better-translate` scope and any new packages under it

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
    env:
      NPM_CONFIG_PROVENANCE: true
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2

      - uses: actions/setup-node@v5
        with:
          node-version: 22
          registry-url: https://registry.npmjs.org

      - name: Install dependencies
        run: bun install

      - name: Verify npm auth
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: |
          npm config get registry
          npm whoami

      - name: Create release pull request or publish
        uses: changesets/action@v1
        with:
          version: bun run changeset:version && bun install
          publish: bun run release:publish
          title: Release packages
          commit: Release packages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### How it works

1. Make your changes to one or more packages
2. Run `bun changeset` — select affected packages and choose a bump type
3. Commit the generated `.changeset/*.md` file and open your pull request
4. CI validates changes on PRs and pushes to `dev` / `main`, but those runs never publish
5. Merge to `main`
6. The release workflow opens or updates the **"Release packages"** pull request
7. Merge that release PR — CI publishes only the changed packages to npm automatically

`NPM_CONFIG_PROVENANCE=true` attaches signed provenance attestations to published packages via GitHub Actions OIDC.

## Debugging Failed Publishes

If publishing still fails, check these in order:

1. Confirm the workflow is running on `main`, not on `dev` or a pull request
2. Confirm the release job prints `https://registry.npmjs.org/` from `npm config get registry`
3. Confirm `npm whoami` succeeds in the release job
4. Confirm the `NPM_TOKEN` belongs to an npm user with publish rights for the `@better-translate` scope
5. Confirm the `@better-translate` scope exists in npm and is owned by the expected user or organization
6. Confirm the granular token has:
   - organization read/write access
   - package and scope read/write access
   - bypass 2FA enabled for automation
7. If the failing package has never been published before, verify the token owner can create new packages under `@better-translate`
8. If npm still returns `E404` for every `@better-translate/*` package, treat it as a scope ownership or permission problem before changing the release script again
