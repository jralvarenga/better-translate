---
name: cli
description: Extract source strings, generate locale files, and remove unused keys for Better Translate projects.
---

# CLI Skill

Use this guide when you want the CLI to manage locale files for you, or when you want to write source strings directly in code without naming keys by hand.

## What this package does

- `bt extract` — scans your source files for `t("...", { bt: true })` calls, adds keys to your source locale JSON, and rewrites those calls to plain key strings
- `bt generate` — reads your source locale file and calls an AI model to create translated versions for every other locale
- `bt purge` — scans your codebase for translation keys that are no longer referenced in any `t("...")` call and removes them from all locale files

## Minimum setup

### 1. Install

```sh
npm install -D @better-translate/cli ollama-ai-provider-v2
```

### 2. Create a source locale file

Create `src/messages/en.json`:

```json
{}
```

An empty object is fine. `bt extract` will populate it.

### 3. Create the config

Create `better-translate.config.ts`:

```ts
import { createOllama } from "ollama-ai-provider-v2";
import { defineConfig } from "@better-translate/cli/config";

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/api",
});

export default defineConfig({
  sourceLocale: "en",
  locales: ["es", "fr"],
  model: ollama("qwen3:4b"),
  messages: {
    entry: "./src/messages/en.json",
  },
});
```

If you use Ollama, install `ollama-ai-provider-v2`. If you use a hosted provider, install the matching AI SDK provider package.

The CLI stays provider-agnostic. Swap `ollama(...)` for any other AI SDK provider model if you use a different provider.

### 4. Mark strings in your code

In any TypeScript or TSX file, write source text directly using `{ bt: true }`:

```ts
t("Hello world", { bt: true });
t("Hello {name}", { bt: true, params: { name: "" } });
```

### 5. Extract

```sh
npx bt extract
```

The CLI automatically finds `better-translate.config.ts` in the project root. `--config` is only needed if the config file is in a non-standard location.

After this runs, the source locale file gains new keys and the original `t()` calls are rewritten:

```ts
// before
t("Hello world", { bt: true });

// after
t("components.header.helloWorld");
```

The namespace prefix (`components.header`) comes from the source file path. `bt: true` is removed. Other options like `params` are preserved.

### 6. Generate

```sh
npx bt generate
```

This creates one translated JSON file per locale next to the source file.

If `markdown.rootDir` is configured and the run would create or overwrite translated `.md` or `.mdx` files, the CLI asks for confirmation. Pass `--yes` or `-y` to skip:

```sh
npx bt generate --yes
```

### 7. Purge unused keys

```sh
npx bt purge
```

This finds translation keys that no longer appear in any `t("...")` call and removes them from all locale files. It asks you to confirm each key before removing it:

```
? Purge unused key "home.oldTitle"? (y/N) y
? Purge unused key "sidebar.legacy"? (y/N) n
```

Type `y` to remove a key, `n` (or just Enter) to keep it.

To remove all unused keys at once without prompting:

```sh
npx bt purge --yes
```

To preview what would be removed without making changes:

```sh
npx bt purge --dry-run
```

**Dynamic keys:** If code uses a dynamic key like `` t(`section.${id}`) ``, the CLI cannot statically resolve it. It will warn you, protect keys sharing the detected prefix, or mark the key unsafe and skip it rather than silently deleting something that may still be in use.

## Command reference

| Command | Flag | Description |
|---|---|---|
| `bt extract` | | Scan for `bt: true` calls, sync source locale, rewrite calls |
| | `--config <path>` | Path to config file (default: auto-detected) |
| | `--dry-run` | Preview changes without writing |
| | `--max-length <n>` | Max segment length for generated key names |
| `bt generate` | | Translate source locale into all target locale files |
| | `--config <path>` | Path to config file |
| | `--dry-run` | Preview changes without writing |
| | `--yes`, `-y` | Skip confirmation for markdown file writes |
| `bt purge` | | Remove unused translation keys from all locale files |
| | `--config <path>` | Path to config file |
| | `--dry-run` | Preview which keys would be removed without writing |
| | `--yes`, `-y` | Remove all unused keys without prompting |

## Rule

Always run `bt extract` before `bt generate`. Extract populates the source file; generate reads it.

After removing old features or refactoring key usage, run `bt purge` to clean up orphaned keys across all locale files.

## Keep TypeScript autocomplete available

The CLI only manages files. Autocomplete at runtime still comes from the shared exported translator you create in `@better-translate/core`.

- Keep one exported `translator`
- Point your runtime packages and helpers back to that translator
- Let extracted keys flow into the same typed messages source

## When to also add framework adapters

The CLI only manages files. You still need a runtime package to use them.

- Add `@better-translate/core` to load and use locale files at runtime
- Add `@better-translate/react` for React components
- Add `@better-translate/nextjs` for Next.js routing

## Examples

- `examples/nextjs-example` — Next.js App Router with generated locale files
- `examples/react-vite-example` — React SPA with generated locale files
- `examples/core-elysia-example` — plain TypeScript/Node.js setup
