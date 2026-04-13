# CLI

Use `@better-translate/cli` when you want Better Translate to build and update locale files for you.

You do not need the CLI to use the runtime packages. It is optional.

## 1. Install the package

```sh
npm install -D @better-translate/cli
```

The CLI is provider-agnostic. You bring any AI SDK language model and pass it through `model`.

## 2. Create a source locale file

Create `src/messages/en.json`:

```json
{
  "home": {
    "title": "Hello",
    "description": "Welcome to the app"
  }
}
```

You can also start with an empty `{}` and let `bt extract` populate it.

## 3. Create the CLI config

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

If you use Ollama, install `ollama-ai-provider-v2`. If you use a hosted provider, install that provider package instead, such as `@ai-sdk/openai`, `@ai-sdk/anthropic`, or `@ai-sdk/moonshotai`.

The default Ollama API URL is local: `http://localhost:11434/api`.

This works the same with hosted providers such as OpenAI, Anthropic, or Moonshot AI. Your app installs and configures the AI SDK provider package directly.

## 4. Mark strings in your code

Instead of naming translation keys by hand, write the source text directly and add `{ bt: true }`:

```ts
import { t } from "@better-translate/core";

export function navLabel() {
  return t("Home", { bt: true });
}
```

At runtime, `{ bt: true }` returns the string unchanged. The CLI will replace these calls with proper keys on the next extract.

You can also pass other options like `params` — they are preserved after extraction:

```ts
// You write:
t("Hello world", { bt: true })
t("Hello {name}", { bt: true, params: { name: "" } })

// After bt extract rewrites the file:
t("components.nav.helloWorld")
t("components.nav.helloName", { params: { name: "" } })
```

The key namespace comes from the source file path (`components/nav.tsx` -> `components.nav`). `bt: true` is always removed on rewrite.

## 5. Extract source keys

```sh
npx bt extract
```

This scans for `t(..., { bt: true })` calls, adds the missing keys to your source locale file, and rewrites the calls to plain strict keys.

The CLI automatically finds `better-translate.config.ts` in your project root. The `--config` flag is only needed if your config file is in a different location.

## 6. Run the generator

```sh
npx bt generate
```

This creates the target locale files next to your source file.

If `markdown.rootDir` is enabled and the run would create or overwrite translated `.md` or `.mdx` files, the CLI asks for confirmation before making changes. Use `--yes` or `-y` to skip the prompt:

```sh
npx bt generate --yes
```

Non-interactive runs that need to write translated markdown files must pass `--yes`.

## 7. Remove unused keys

```sh
npx bt purge
```

This scans your codebase for translation keys that are no longer used in any `t("...")` call and removes them from all locale files. It prompts you to confirm each key before removing it:

```
? Purge unused key "home.oldTitle"? (y/N) y
? Purge unused key "sidebar.legacy"? (y/N) n
```

Type `y` to remove a key from all locale files, or `n` (or just Enter) to keep it.

To remove all unused keys at once without prompting, use `--yes` or `-y`:

```sh
npx bt purge --yes
```

To preview what would be removed without making any changes, use `--dry-run`:

```sh
npx bt purge --dry-run
```

**Dynamic keys:** If your code uses dynamic key strings like `t(\`section.${id}\`)`, the CLI cannot statically analyze those. It will warn you and protect any keys that share the detected prefix, or flag the key as unsafe and skip it rather than silently deleting something that might be in use.

## 8. Use the generated files in your app

After the files exist, import them into your `@better-translate/core` config just like any hand-written locale file.

## Markdown

If you also want localized markdown generation, add the `markdown.rootDir` option:

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
  markdown: {
    rootDir: "./content/docs",
  },
});
```

## Command reference

| Command | Flag | Description |
|---|---|---|
| `bt extract` | | Scan source files for `bt: true` calls, add keys to source locale, rewrite calls |
| | `--config <path>` | Path to config file (default: auto-detected) |
| | `--dry-run` | Preview changes without writing |
| | `--max-length <n>` | Max key segment length for generated keys |
| `bt generate` | | Translate source locale into all target locale files |
| | `--config <path>` | Path to config file |
| | `--dry-run` | Preview changes without writing |
| | `--yes`, `-y` | Skip confirmation for markdown file writes |
| `bt purge` | | Remove unused translation keys from all locale files |
| | `--config <path>` | Path to config file |
| | `--dry-run` | Preview which keys would be removed without writing |
| | `--yes`, `-y` | Remove all unused keys without prompting |

## Examples

Full working examples are in the [GitHub repo](https://github.com/jralvarenga/better-translate/tree/main/examples):

- [nextjs-example](https://github.com/jralvarenga/better-translate/tree/main/examples/nextjs-example)
- [react-vite-example](https://github.com/jralvarenga/better-translate/tree/main/examples/react-vite-example)
- [core-elysia-example](https://github.com/jralvarenga/better-translate/tree/main/examples/core-elysia-example)
