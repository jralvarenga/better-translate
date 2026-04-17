---
name: react
description: React and Expo integration guide for Better Translate providers, hooks, and typed translation access.
---

# React Skill

Use this guide when React components need translations and locale switching.

## Correct package combination

- required: `@better-translate/core`
- add: `@better-translate/react`

## Smallest correct setup

1. Create the translator with `@better-translate/core`
2. Wrap the app with `BetterTranslateProvider`
3. Read translations with `useTranslations()`

```tsx
import { BetterTranslateProvider } from "@better-translate/react";

import { translator } from "./i18n";

export function Root() {
  return (
    <BetterTranslateProvider translator={translator}>
      <App />
    </BetterTranslateProvider>
  );
}
```

## Keep TypeScript autocomplete available

The simplest no-extra-generic setup is to bind the translator once and export an
app-local provider + hook pair.

### Pattern 1: `createBetterTranslateReact(translator)`

```ts
import { createBetterTranslateReact } from "@better-translate/react";

import { translator } from "./i18n";

export const { BetterTranslateProvider, useTranslations } =
  createBetterTranslateReact(translator);
```

Then import your app-local `useTranslations` instead of importing the package hook directly:

```tsx
import { useTranslations } from "./i18n";

export function Header() {
  const { t } = useTranslations();

  return <h1>{t("home.title")}</h1>;
}
```

These fallback patterns are still supported too.

### Pattern 2: explicit generic

```tsx
import { useTranslations } from "@better-translate/react";

import { translator } from "./i18n";

export function Header() {
  const { locale, setLocale, t } = useTranslations<typeof translator>();

  return (
    <>
      <h1>{t("home.title")}</h1>
      <button onClick={() => setLocale("es")} disabled={locale === "es"}>
        Espanol
      </button>
    </>
  );
}
```

### Pattern 3: module augmentation for zero-arg `useTranslations()`

Create `src/better-translate.d.ts`:

```ts
import { translator } from "./i18n";

declare module "@better-translate/react" {
  interface BetterTranslateReactTypes {
    translator: typeof translator;
  }
}
```

Then components can use the hook without a generic and still keep autocomplete:

```tsx
import { useTranslations } from "@better-translate/react";

export function Header() {
  const { t } = useTranslations();

  return <h1>{t("home.title")}</h1>;
}
```

## When React is enough

React by itself is enough for:

- React SPAs
- Vite apps
- Expo apps

## When React is not enough

If the app is Next.js App Router, keep `@better-translate/react` for client hooks and add `@better-translate/nextjs` for routing and server helpers.
