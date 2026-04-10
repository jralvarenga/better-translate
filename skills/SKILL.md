---
name: skills
description: Package map and reading order for Better Translate product skills.
---

# Better Translate Skills

This folder explains which Better Translate packages to combine for each kind of app.

## Start with this rule

Always start with `@better-translate/core`.

Then add only the adapter your app needs:

- React or Expo UI: `@better-translate/react`
- Next.js App Router routing and server helpers: `@better-translate/nextjs`
- Astro request helpers and middleware: `@better-translate/astro`
- TanStack Router locale-aware routing: `@better-translate/tanstack-router`
- Localized Markdown or MDX: `@better-translate/md`
- Auto-extract strings and generate locale files with hosted or local models: `@better-translate/cli`

## Fast package chooser

- Plain TypeScript, Node.js, APIs, or shared libraries: read `skills/core/SKILL.md`
- React web apps: read `skills/react/SKILL.md`
- Expo apps: read `skills/expo/SKILL.md`
- Next.js App Router apps: read `skills/nextjs/SKILL.md`
- Markdown or MDX content: read `skills/md/SKILL.md`
- Mixed app with routing, server rendering, and client hooks: read `skills/combined/SKILL.md`
- CLI or bt-extracted strings: read `skills/cli/SKILL.md`

## Reading order

1. `skills/core/SKILL.md`
2. `skills/cli/SKILL.md`
3. `skills/react/SKILL.md`
4. `skills/nextjs/SKILL.md`
5. `skills/md/SKILL.md`
6. `skills/combined/SKILL.md`
