---
name: expo
description: Expo and React Native integration guide using Better Translate React support.
---

# Expo Skill

Use this guide when the app is Expo or React Native.

## Correct package combination

- required: `@better-translate/core`
- required: `@better-translate/react`

There is no separate native adapter package.

## Correct integration

1. Create the translator with `@better-translate/core`
2. Wrap the app with `BetterTranslateProvider`
3. Use `useTranslations()` inside screens and components

## Keep TypeScript autocomplete available

Both React typing patterns work in Expo too.

### Pattern 1: explicit generic

```tsx
import { useTranslations } from "@better-translate/react";

import { translator } from "./i18n";

export function HomeScreen() {
  const { t } = useTranslations<typeof translator>();

  return <Text>{t("home.title")}</Text>;
}
```

### Pattern 2: module augmentation for zero-arg `useTranslations()`

Create `src/better-translate.d.ts`:

```ts
import { translator } from "./i18n";

declare module "@better-translate/react" {
  interface BetterTranslateReactTypes {
    translator: typeof translator;
  }
}
```

Then components can call `useTranslations()` directly and keep key autocomplete.

## Important rule

Do not look for `@better-translate/react-native`.

Expo support lives inside `@better-translate/react`.

## When to change packages

Only add more packages if the app actually needs them:

- add `@better-translate/md` for localized content files
- add `@better-translate/cli` for generated locale files
