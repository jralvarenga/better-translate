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

## When React is enough

React by itself is enough for:

- React SPAs
- Vite apps
- Expo apps

## When React is not enough

If the app is Next.js App Router, keep `@better-translate/react` for client hooks and add `@better-translate/nextjs` for routing and server helpers.
