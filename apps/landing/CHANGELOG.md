# landing

## 2.1.0

### Minor Changes

- 0dadbb4: ## Changelog

  ### Added

  - Added `SUPPORTED_LOCALE_ROUTE_SYNTAXES` to `@better-translate/core` as the canonical shared list of supported locale route param names:
    `["locale", "lang", "language", "intl", "i18n", "l10n", "localization"]`
  - Added `SupportedLocaleRouteSyntax` type to `@better-translate/core`.
  - Added adapter-specific exported route syntax lists derived from the shared core list:
    - `@better-translate/tanstack-router`
      - `SUPPORTED_TANSTACK_REQUIRED_LOCALE_ROUTE_SYNTAXES`
      - `SUPPORTED_TANSTACK_BRACED_REQUIRED_LOCALE_ROUTE_SYNTAXES`
      - `SUPPORTED_TANSTACK_OPTIONAL_LOCALE_ROUTE_SYNTAXES`
      - `SUPPORTED_TANSTACK_LOCALE_ROUTE_SYNTAXES`
    - `@better-translate/nextjs`
      - `SUPPORTED_NEXTJS_LOCALE_ROUTE_SYNTAXES`
    - `@better-translate/astro`
      - `SUPPORTED_ASTRO_LOCALE_ROUTE_SYNTAXES`

  ### Changed

  - TanStack Router route-template validation now only accepts supported locale param names for:
    - `$name`
    - `{$name}`
    - `{-$name}`
  - Next.js route-template validation now only accepts supported locale param names for:
    - `[name]`
  - Improved route-template error messages to clearly describe the allowed adapter-specific shapes and the supported locale param names.
  - Updated package docs and landing docs to document the new exported lists and supported route param names.

  ### Tests

  - Added core runtime and type coverage for the shared locale param-name registry.
  - Added TanStack Router runtime and type coverage for the new exported syntax lists and restricted route-template parsing.
  - Added Next.js runtime and type coverage for the new exported syntax list and restricted route-template parsing.
  - Added Astro type coverage for the exported bracket-form syntax list.

  ### Notes

  - This is a compatibility-tightening change: custom locale param names outside the supported shared list are now rejected by the TanStack Router and Next.js route-template parsers.

### Patch Changes

- Updated dependencies [0dadbb4]
  - @better-translate/nextjs@1.2.0
  - @better-translate/react@1.2.0
  - @better-translate/core@1.3.0
  - @better-translate/cli@1.2.0
  - @better-translate/md@1.2.0

## 2.0.3

### Patch Changes

- 3f0d762: SEO implementation

## 2.0.2

### Patch Changes

- 4261148: Update the landing app and CLI package for the latest release automation changes.
- Updated dependencies [4261148]
  - @better-translate/cli@3.1.2

## 2.0.1

### Patch Changes

- package homepage updated
- Updated dependencies
  - @better-translate/nextjs@1.1.1
  - @better-translate/react@2.1.1
  - @better-translate/core@2.2.1
  - @better-translate/cli@3.1.1
  - @better-translate/md@2.1.1

## 2.0.0

### Major Changes

- Refresh landing page content and release metadata

### Minor Changes

- README files fixed

### Patch Changes

- Updated dependencies
  - @better-translate/nextjs@1.1.0
  - @better-translate/react@2.1.0
  - @better-translate/core@2.2.0
  - @better-translate/cli@3.1.0
  - @better-translate/md@2.1.0

## 1.0.0

### Major Changes

- 250f405: Adding confirmation when adding new md files and translations

### Minor Changes

- Addin confirmation message when running cli

### Patch Changes

- Updated dependencies
- Updated dependencies [250f405]
  - @better-translate/cli@3.0.0
  - @better-translate/core@2.1.0
  - @better-translate/md@2.0.0

## 0.1.2

### Patch Changes

- Adding support for AI providers; users can install their favorite AI provider and use their own API key
- Updated dependencies
  - @better-translate/cli@2.0.1

## 0.1.1

### Patch Changes

- Adds auto-extraction and auto-keying for source strings via { bt: true } in t() and a new bt extract CLI to scan code, sync the source locale (JSON or CLI‑generated TS), and rewrite calls to strict keys. @better-translate/core and @better-translate/react return the raw string for marked calls until extraction; docs and examples updated.
- Updated dependencies
- Updated dependencies [7241cf6]
  - @better-translate/react@2.0.0
  - @better-translate/core@2.0.0
  - @better-translate/cli@2.0.0
  - @better-translate/md@1.0.2
  - @better-translate/nextjs@1.0.2
