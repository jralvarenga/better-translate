# Publishing

## One-time setup

These steps have already been completed but are documented here for reference if the setup ever needs to be recreated.

1. Create an npm organization named `better-translate` at [npmjs.com](https://npmjs.com)
2. Create a **Granular Access Token** with:
   - Organizations: `better-translate` — Read and write
   - Packages and scopes: All packages — Read and write
   - Security settings: **Bypass two-factor authentication** enabled
3. Add the token as a GitHub Actions secret named `NPM_TOKEN` (Settings → Secrets and variables → Actions)

## CI release flow

This is the standard flow for releasing new versions.

1. Make your changes to one or more packages
2. Run `bun changeset` — select the affected packages and choose a bump type (patch / minor / major)
3. Commit the generated `.changeset/*.md` file and push to `main`
4. CI will open a **"Release packages"** pull request with version bumps applied to the affected packages
5. Review and merge the PR — CI will publish only the changed packages to npm automatically

Only packages whose version changed get published. Everything else is skipped.

## Local publish

Use this if CI is unavailable or for a first-time publish.

1. Make sure `~/.npmrc` contains the access token:
   ```
   //registry.npmjs.org/:_authToken=<your-token>
   ```
2. Build all packages:
   ```sh
   bun run build:packages
   ```
3. Publish:
   ```sh
   npx changeset publish
   ```
4. Push the generated git tags:
   ```sh
   git push --tags
   ```

## Notes

- The npm token must have **"Bypass two-factor authentication"** enabled, otherwise publishing will fail with `EOTP` in environments without browser access
- CI sets `NPM_CONFIG_PROVENANCE=true` so published packages include signed provenance attestations via GitHub Actions
- The `better-translate` npm org must have **Granular Access Tokens** enabled in its settings for the token to have org-scoped publish access
