# @better-translate/cli

## 1.2.0

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
  - @better-translate/core@1.3.0

## 1.1.3

### Patch Changes

- 9f9b20c: Updating changeset and release workflow
- Updated dependencies [9f9b20c]
  - @better-translate/core@1.2.2

## 1.1.2

### Patch Changes

- 4261148: Update the landing app and CLI package for the latest release automation changes.

## 1.1.1

### Patch Changes

- package homepage updated
- Updated dependencies
  - @better-translate/core@1.1.1

## 1.1.0

### Minor Changes

- Fix README formatting and package documentation links
- Align landing page references and release metadata

### Patch Changes

- Updated dependencies
  - @better-translate/core@1.1.0

## 1.0.1

### Patch Changes

- Adding support for AI providers; now users can install their favorite AI provider and use their own API key

## 1.0.0

### Major Changes

- Adds auto-extraction and auto-keying for source strings via { bt: true } in t() and a new bt extract CLI to scan code, sync the source locale (JSON or CLI‑generated TS), and rewrite calls to strict keys. @better-translate/core and @better-translate/react return the raw string for marked calls until extraction; docs and examples updated.
- 7241cf6: Add a new bt parameter to automatically translate and key strings.

### Patch Changes

- Updated dependencies
- Updated dependencies [7241cf6]
  - @better-translate/core@1.0.0
