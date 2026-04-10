---
name: core
description: Smallest Better Translate setup for plain TypeScript, Node.js, Bun, APIs, and shared libraries.
---

# Core Skill

Use this guide when you want the smallest possible Better Translate setup.

## What this package is for

`@better-translate/core` is the base translation engine.

Use it when:

- the app is plain TypeScript
- the code runs on Node.js, Bun, or an API
- you want one shared translator file before adding framework adapters

## Smallest correct setup

Create one translator file and export it:

```ts
import { configureTranslations } from "@better-translate/core";

const en = {
  home: {
    title: "Hello",
  },
} as const;

const es = {
  home: {
    title: "Hola",
  },
} as const;

export const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es },
});
```

## Keep TypeScript autocomplete available

TypeScript key autocomplete depends on the shared exported `translator`.

- Keep each messages object `as const`
- Export one shared `translator`
- Call `translator.t(...)` from code that needs typed keys

```ts
import { translator } from "./i18n";

translator.t("home.title");
translator.t("home.title", { locale: "es" });
```

That keeps locale values and translation keys inferred from the messages you configured.

## When to add another package

- Add `@better-translate/react` when React components need hooks or locale switching
- Add `@better-translate/nextjs` when Next.js routes or server helpers need locale awareness
- Add `@better-translate/astro` when Astro requests need locale awareness
- Add `@better-translate/md` when content files should follow the same locale setup

## Auto-extract strings without naming keys

Use `{ bt: true }` in any `t()` call to write source text directly instead of inventing a key:

```ts
t("Hello world", { bt: true });
```

Then run `npx bt extract` to generate keys automatically and rewrite the calls. See `skills/cli/SKILL.md` for the full setup.

## Main idea

Do not create one translation system per framework.

Create one core translator first, then let adapters read from it.
