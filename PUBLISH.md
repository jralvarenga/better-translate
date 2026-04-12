# Publishing

## Branch model

- `main`: production releases and website work
- `next`: optional staging branch that can later be merged into `main`

Both `main` and `next` can accept package changesets. The difference is release behavior:

- `main` is the only branch that publishes packages, pushes tags, and creates GitHub Releases
- `next` is only for batching changes before they are merged into `main`

## Do I run changeset and deploy myself?

Usually, no.

- Contributors should run `bun changeset` when a package version bump is needed
- Contributors should not normally run `changeset version` or `changeset publish`
- Maintainers publish by merging the repository-managed `chore: release packages` PR that GitHub Actions opens on `main`

The normal flow is: create a changeset in your feature PR, merge the work, then merge the release PR that automation opens later.

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

## Manual publish

Use this only for recovery or emergency releases when the GitHub Actions flow is unavailable.

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
bunx changeset version
```

**3. Build all packages**

```sh
bun run build:packages
```

**4. Publish to npm**

```sh
bun run release:publish
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
5. Make sure GitHub Actions has permission to create releases with `GITHUB_TOKEN`
   (Repository Settings → Actions → General → Workflow permissions → Read and write permissions)

### Workflow

The repository already includes `.github/workflows/release.yml`.

### How it works

1. Make your changes to one or more packages
2. Run `bun changeset` — select affected packages and choose a bump type
3. Commit the generated `.changeset/*.md` file and open your pull request
4. CI validates pull requests, merge queue entries, and pushes to `main` / `next`, but those runs never publish directly
5. Merge the work into `main` if it should become releasable, or into `next` if you are still staging it
6. Once the changesets are on `main`, the release workflow opens or updates the `chore: release packages` pull request
7. Merge that release PR
8. GitHub Actions publishes packages to npm, creates any missing `@better-translate/*@version` git tags locally, and pushes only the new tags back to `origin`
9. GitHub Actions creates or reuses matching GitHub Release entries for those new package tags with auto-generated release notes

`NPM_CONFIG_PROVENANCE=true` attaches signed provenance attestations to published packages via GitHub Actions OIDC.

## Tags and releases

### How tags are pushed

After a successful publish, the workflow runs:

1. `bun run release:tags`
2. `node ./scripts/push-release-tags.mjs --before-file ... --require-new-tags`

That means the workflow does not use a blanket `git push --tags`. It creates only the missing package tags and then pushes only those newly created tags.

### What a "release" means here

Right now, a release means:

- packages are published to npm
- matching package git tags are pushed
- matching GitHub Release entries are created for the new tags

GitHub Release notes are currently generated by GitHub's built-in `--generate-notes` behavior.

## What you need to add

- The `next` branch itself if you want a staging branch
- GitHub Actions workflow permissions set to `Read and write permissions`
- GitHub Actions allowed to create pull requests
- A valid `NPM_TOKEN`

You do not need a separate token for GitHub Releases. The workflow uses the built-in `GITHUB_TOKEN`.

## Debugging Failed Publishes

If publishing still fails, check these in order:

1. Confirm the workflow is running on `main`, not on a feature branch, pull request, or `next`
2. Confirm the release job prints `https://registry.npmjs.org/` from `npm config get registry`
3. Confirm `npm whoami` succeeds in the release job
4. Confirm the publish happened from the merged `chore: release packages` PR, not from a feature PR
5. Confirm the `NPM_TOKEN` belongs to an npm user with publish rights for the `@better-translate` scope
6. Confirm the `@better-translate` scope exists in npm and is owned by the expected user or organization
7. Confirm the granular token has:
   - organization read/write access
   - package and scope read/write access
   - bypass 2FA enabled for automation
8. If the failing package has never been published before, verify the token owner can create new packages under `@better-translate`
9. If npm still returns `E404` for every `@better-translate/*` package, treat it as a scope ownership or permission problem before changing the release script again
