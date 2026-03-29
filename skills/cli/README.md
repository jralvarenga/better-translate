# CLI Skill

Use this guide when you want the CLI to manage locale files for you, or when you want to write source strings directly in code without naming keys by hand.

## What this package does

- `bt extract` — scans your source files for `t("...", { bt: true })` calls, adds keys to your source locale JSON, and rewrites those calls to plain key strings
- `bt generate` — reads your source locale file and calls an AI model to create translated versions for every other locale

## Minimum setup

### 1. Install

```sh
npm install -D @better-translate/cli @ai-sdk/openai
# or @ai-sdk/anthropic / @ai-sdk/moonshotai
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
import { openai } from "@ai-sdk/openai";
import { defineConfig } from "@better-translate/cli/config";

export default defineConfig({
  sourceLocale: "en",
  locales: ["es", "fr"],
  model: openai("gpt-4o"),
  messages: {
    entry: "./src/messages/en.json",
  },
});
```

Swap `openai(...)` for `anthropic(...)` or `moonshotai(...)` if you use a different provider.

### 4. Mark strings in your code

In any TypeScript or TSX file, write source text directly using `{ bt: true }`:

```ts
t("Hello world", { bt: true })
t("Hello {name}", { bt: true, params: { name: "" } })
```

### 5. Extract

```sh
npx bt extract
```

The CLI automatically finds `better-translate.config.ts` in the project root. `--config` is only needed if the config file is in a non-standard location.

After this runs, the source locale file gains new keys and the original `t()` calls are rewritten:

```ts
// before
t("Hello world", { bt: true })

// after
t("components.header.helloWorld")
```

The namespace prefix (`components.header`) comes from the source file path. `bt: true` is removed. Other options like `params` are preserved.

### 6. Generate

```sh
npx bt generate
```

This creates one translated JSON file per locale next to the source file.

## Rule

Always run `bt extract` before `bt generate`. Extract populates the source file; generate reads it.

## When to also add framework adapters

The CLI only manages files. You still need a runtime package to use them.

- Add `@better-translate/core` to load and use locale files at runtime
- Add `@better-translate/react` for React components
- Add `@better-translate/nextjs` for Next.js routing

## Examples

- `examples/nextjs-example` — Next.js App Router with generated locale files
- `examples/react-vite-example` — React SPA with generated locale files
- `examples/core-elysia-example` — plain TypeScript/Node.js setup
