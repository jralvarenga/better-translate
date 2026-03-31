# @better-translate/react

`@better-translate/react` adds a provider and hooks on top of `@better-translate/core`. Use it in React web apps and Expo apps when components need access to translations and locale switching.

To make plain `useTranslations()` fully typed across your app, augment the package once:

```ts
import type { AppTranslator } from "./i18n";

declare module "@better-translate/react" {
  interface BetterTranslateReactTypes {
    translator: AppTranslator;
  }
}
```

Full docs: [better-translate-placeholder.com/en/docs/adapters/react](https://better-translate-placeholder.com/en/docs/adapters/react)
