# Status Skill

Use this guide when you need a quick snapshot of what exists in the repo right now.

## Current public package map

- `@better-translate/core`
- `@better-translate/react`
- `@better-translate/nextjs`
- `@better-translate/astro`
- `@better-translate/tanstack-router`
- `@better-translate/md`
- `@better-translate/cli`

## Current support shape

- core is the source of truth for translations
- react covers React web and Expo
- nextjs covers App Router routing, navigation, proxy, and server helpers
- astro covers request-aware integrations
- tanstack-router covers TanStack Router and TanStack Start locale-aware routing
- md covers localized Markdown and MDX content loading
- cli covers locale-file generation

## Important interpretation

If a package is not in the list above, do not assume it is part of the current public integration story.

Build from the packages that already exist instead of planning around old names or missing adapters.
