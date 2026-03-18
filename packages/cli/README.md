# @better-translate/cli

AI-powered translation generation CLI for Better Translate.

## Install

```sh
bun add -D @better-translate/cli
```

## What It Does

`@better-translate/cli` reads one source locale file and generates the other locale files for you.

It can also translate Markdown and MDX docs.

It uses the **AI SDK under the hood** for every generation request.

## Quick Start

- Create `better-translate.config.ts`
- Point `messages.entry` to your source locale file
- Choose the locales you want to generate
- Choose either AI Gateway mode or OpenAI provider mode
- Run `bt generate`

## Config

Create `better-translate.config.ts` in the project root.

## AI Gateway Mode

```ts
import { defineConfig } from "@better-translate/cli/config";

export default defineConfig({
  gateway: {
    apiKey: process.env.AI_GATEWAY_KEY!,
  },
  sourceLocale: "en",
  locales: ["es", "ar", "ja"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./src/lib/i18n/messages/en.ts",
  },
  markdown: {
    rootDir: "./docs/en",
  },
});
```

Use this mode when you want to pass a model id like `"openai/gpt-4.1"` or `"anthropic/claude-sonnet-4.5"` through AI Gateway.

## OpenAI Provider Mode

```ts
import { defineConfig, openai } from "@better-translate/cli/config";

export default defineConfig({
  sourceLocale: "en",
  locales: ["es", "ar", "ja"],
  model: openai("gpt-4.1", {
    apiKey: process.env.OPENAI_API_KEY!,
  }),
  messages: {
    entry: "./src/lib/i18n/messages/en.ts",
  },
  markdown: {
    rootDir: "./docs/en",
  },
});
```

Use this mode when you want to use your OpenAI API key directly and keep everything inside `@better-translate/cli`.

## Important Rule

- if you use `gateway`, `model` must be a string such as `"openai/gpt-4.1"`
- if you use `model: openai(...)`, do not set `gateway`
- if you use `gateway`, do not use `openai(...)`

## Config Fields

- `gateway.apiKey`: AI Gateway key string, usually read from `process.env`
- `sourceLocale`: the source language to translate from
- `locales`: target locales to generate
- `model`: either an AI Gateway model string or `openai("model-id", { apiKey })`
- `messages.entry`: source translation file path, supports `.json` and `.ts`
- `markdown.rootDir`: optional default-locale markdown root such as `./docs/en`
- `markdown.extensions`: optional list of extensions, defaults to `[".md", ".mdx"]`

The CLI loads `.env`, `.env.local`, `.env.{NODE_ENV}`, and
`.env.{NODE_ENV}.local` before importing the config file, so you can safely read
the AI Gateway key or OpenAI key from `process.env` in the config itself.

Example `.env.local`:

```sh
AI_GATEWAY_KEY=your_gateway_key_here
OPENAI_API_KEY=your_openai_key_here
```

## Commands

```sh
bt generate
bt generate --config ./better-translate.config.ts
bt generate --dry-run
```

`bt generate` reads the source locale file, sends it through the AI SDK, validates the generated result against the source schema, and writes the target files to disk.

`--dry-run` shows what would be generated without writing files.

## How It Works

For message files, the CLI:

- reads your source locale file
- extracts all translation keys
- sends the source content and key context to the AI model
- validates that the generated object keeps the same shape
- writes sibling locale files next to the source file

For Markdown and MDX, the CLI:

- reads files from your default locale docs folder
- translates frontmatter string values and body content
- keeps the same relative paths
- writes localized copies into sibling locale folders

## Messages

The source translation file can be:

- `.json`
- `.ts` with a default export object
- `.ts` with a named export matching `sourceLocale`

Example source file:

```ts
export const en = {
  home: {
    title: "Hello",
    subtitle: "Welcome back {name}",
  },
} as const;

export default en;
```

If `messages.entry` is `./src/lib/i18n/messages/en.ts` and `locales` contains
`["es", "ar"]`, the CLI writes sibling files next to the source:

```txt
src/lib/i18n/messages/es.ts
src/lib/i18n/messages/ar.ts
```

Generated locale files keep the exact source key shape, preserve placeholders
such as `{name}`, and are validated against the source schema before they are
written.

## Markdown And MDX

When `markdown.rootDir` is set to a default-locale root such as `./docs/en`,
the CLI walks that directory recursively and mirrors each markdown file into
sibling locale folders:

```txt
docs/en/intro.md -> docs/es/intro.md
docs/en/guides/setup.mdx -> docs/ar/guides/setup.mdx
```

String frontmatter values are translated separately from the body. Non-string
frontmatter values stay unchanged.

## Provider Example

This is the simplest way to use the built-in OpenAI provider:

```ts
import { defineConfig, openai } from "@better-translate/cli/config";

export default defineConfig({
  sourceLocale: "en",
  locales: ["es", "fr"],
  model: openai("gpt-4.1", {
    apiKey: process.env.OPENAI_API_KEY!,
  }),
  messages: {
    entry: "./src/lib/i18n/messages/en.ts",
  },
});
```

## Notes

- the CLI uses the AI SDK under the hood
- `markdown.rootDir` must end with the source locale folder, for example
  `./docs/en`
- the CLI preserves relative markdown paths under each locale root
- generated `.ts` locale files are emitted as:

```ts
export const es = {
  ...
} as const;

export default es;
```
