---
"@better-translate/tanstack-router": minor
"@better-translate/nextjs": minor
"@better-translate/astro": minor
"@better-translate/react": minor
"@better-translate/core": minor
"landing": minor
"@better-translate/cli": minor
"@better-translate/md": minor
---

## Changelog

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