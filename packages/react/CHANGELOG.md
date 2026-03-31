# @better-translate/react

## 2.1.0

### Minor Changes

- 1b9388e: Fixed typing for `useTranslations`; apps can type zero-argument `useTranslations()` through module augmentation instead of passing the translator type at each call site

## 2.0.0

### Major Changes

- Adds auto-extraction and auto-keying for source strings via { bt: true } in t() and a new bt extract CLI to scan code, sync the source locale (JSON or CLI‑generated TS), and rewrite calls to strict keys. @better-translate/core and @better-translate/react return the raw string for marked calls until extraction; docs and examples updated.
- 7241cf6: Add a new bt parameter to automatically translate and key strings.

### Patch Changes

- Updated dependencies
- Updated dependencies [7241cf6]
  - @better-translate/core@2.0.0
