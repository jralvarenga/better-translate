---
name: workspace
description: Repository map for finding Better Translate packages, docs, and examples.
---

# Workspace Skill

Use this guide when you need a quick map of the repository.

## Main folders

- `packages/core` for the base translation engine
- `packages/react` for React and Expo hooks/providers
- `packages/nextjs` for Next.js routing and server helpers
- `packages/astro` for Astro request helpers and middleware
- `packages/tanstack-router` for TanStack Router and TanStack Start routing helpers
- `packages/md` for localized Markdown and MDX helpers
- `packages/cli` for generation tooling
- `apps/landing` for the public docs site
- `examples/` for runnable framework examples

## Practical rule

When you are learning the architecture:

1. start in `packages/core`
2. then read the adapter package you are using
3. then open the matching example if one exists

That order keeps the integration model clear.
