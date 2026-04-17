<div align="center">
  <img src="./better-translate-logo.png" alt="Better Translate" width="80" />
  <h2 align="center">Better Translate</h2>
  <p align="center">
    The type-safe i18n toolkit for TypeScript
    <br />
    <a href="https://better-translate.com"><strong>better-translate.com »</strong></a>
    <br />
    <br />
    <a href="https://better-translate.com/en/docs">Docs</a>
    ·
    <a href="https://better-translate.com/en/docs/installation">Quick Start</a>
    ·
    <a href="https://github.com/jralvarenga/better-translate/issues">Issues</a>
  </p>

[![npm version](https://img.shields.io/npm/v/@better-translate/core.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@better-translate/core)
[![npm downloads](https://img.shields.io/npm/dm/@better-translate/core?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@better-translate/core)
[![License](https://img.shields.io/github/license/jralvarenga/better-translate?style=flat&colorA=000000&colorB=000000)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/jralvarenga/better-translate/ci.yml?branch=main&style=flat&colorA=000000&colorB=000000&label=CI)](https://github.com/jralvarenga/better-translate/actions)

</div>

## About

Better Translate is a type-safe i18n toolkit for TypeScript. Write your translation config once and it works across Next.js, Astro, React, TanStack Router, Node, Bun, and Expo — same API, same types, same experience everywhere. A built-in CLI generates translated locale files using any AI provider or local Ollama models, so you ship multilingual apps without manual work.

### Why Better Translate

i18n in TypeScript projects is usually an afterthought. You wire up a library, scatter translation keys across your codebase, and cross your fingers that nothing drifts out of sync. Better Translate treats translations as first-class TypeScript: keys are inferred, interpolations are typed, and the CLI handles generation so you never write a locale file by hand again.

## Quick Start

```bash
# Install the CLI globally
npm install -g @better-translate/cli

# Install the core package (or a framework adapter)
npm install @better-translate/core
```

Create a `better-translate.config.ts` at the root of your project:

```ts
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { defineConfig } from "@better-translate/cli";

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });

export default defineConfig({
  model: google("gemini-2.0-flash"),
  defaultLocale: "en",
  targetLocales: ["es", "fr", "ja"],
  messagesDir: "./messages",
});
```

Extract source strings and generate all locale files:

```bash
bt extract   # scans source files and updates messages/en.json
bt generate  # translates into every target locale
```

Use translations in your app:

```ts
import { configureTranslations, createTranslationHelpers } from "@better-translate/core";
import en from "./messages/en.json";
import es from "./messages/es.json";

const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  messages: { en, es },
});

const { t } = createTranslationHelpers(translator);

t("hero.title")                        // fully typed, autocomplete works
t("hero.greeting", { params: { name } }) // interpolation is type-checked
t("hero.title", { locale: "es" })      // per-call locale override
```

## Framework Support

| Framework / Runtime | Package |
|---|---|
| Next.js (App Router) | `@better-translate/nextjs` |
| Astro | `@better-translate/astro` |
| React | `@better-translate/react` |
| TanStack Router / Start | `@better-translate/tanstack-router` |
| Expo (React Native) | `@better-translate/react` |
| Node.js | `@better-translate/core` |
| Bun | `@better-translate/core` |
| Markdown / MDX | `@better-translate/md` |

## Key Features

- **Type-safe by default** — Full TypeScript inference on translation keys and interpolation variables. Typos and missing keys are compile errors.
- **Autocomplete everywhere** — Your editor knows every key in your messages object from the moment you type `t("`.
- **Same config, every environment** — Write once, run anywhere. Next.js, Astro, React, Node — identical API.
- **CLI toolchain** — `bt extract` pulls source strings out of your code. `bt generate` calls your AI model and writes every locale file.
- **Bring your own model** — Pass any AI SDK language model to the config: OpenAI, Gemini, Claude, or a local Ollama model.
- **Locale switching** — Switch locales at runtime without a page reload. Per-call overrides render any locale on demand.
- **RTL support** — Built-in right-to-left layout utilities for Arabic, Hebrew, and other RTL languages.

## Documentation

- [Installation](https://better-translate.com/en/docs/installation)
- [Core](https://better-translate.com/en/docs/adapters/core)
- [CLI](https://better-translate.com/en/docs/cli)
- [Next.js](https://better-translate.com/en/docs/adapters/nextjs)
- [React](https://better-translate.com/en/docs/adapters/react)
- [Astro](https://better-translate.com/en/docs/adapters/astro)
- [TanStack Router](https://better-translate.com/en/docs/adapters/tanstack-router)
- [Expo](https://better-translate.com/en/docs/adapters/expo)
- [MD & MDX](https://better-translate.com/en/docs/adapters/md)

## Contributing

Better Translate is free and open source under the [MIT License](./LICENSE). Contributions are welcome.

- [Contributing guide](./CONTRIBUTING.md)
- [Report an issue](https://github.com/jralvarenga/better-translate/issues)
- [Sponsor the project](https://buy.polar.sh/polar_cl_kTi5esQphv7mygLZoq74PHArxF34gCvILfhMc3sx1gq)

## Security

If you discover a security vulnerability, please see [SECURITY.md](./SECURITY.md) for responsible disclosure instructions.

## License

[MIT](./LICENSE)
