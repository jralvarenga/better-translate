# @better-translate/cli

## 3.0.0

### Major Changes

- 250f405: Adding confirmation when adding new md files and translations

### Minor Changes

- Addin confirmation message when running cli

### Patch Changes

- Updated dependencies
  - @better-translate/core@2.1.0

## 2.0.1

### Patch Changes

- Adding support for AI providers; now users can install their favorite AI provider and use their own API key

## 2.0.0

### Major Changes

- Adds auto-extraction and auto-keying for source strings via { bt: true } in t() and a new bt extract CLI to scan code, sync the source locale (JSON or CLI‑generated TS), and rewrite calls to strict keys. @better-translate/core and @better-translate/react return the raw string for marked calls until extraction; docs and examples updated.
- 7241cf6: Add a new bt parameter to automatically translate and key strings.

### Patch Changes

- Updated dependencies
- Updated dependencies [7241cf6]
  - @better-translate/core@2.0.0
