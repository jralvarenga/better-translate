# React

Use `@better-translate/react` when React components need translations and locale switching.

## 1. Install the packages

```sh
npm install @better-translate/core @better-translate/react
```

## 2. Create the shared translator

Create `src/i18n.ts`:

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

## 3. Wrap your app

Create or update `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";

import { BetterTranslateProvider } from "@better-translate/react";

import { App } from "./app";
import { translator } from "./i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BetterTranslateProvider translator={translator}>
      <App />
    </BetterTranslateProvider>
  </React.StrictMode>,
);
```

## 4. Read translations inside a component

Create `src/header.tsx`:

```tsx
import { useTranslations } from "@better-translate/react";

import { translator } from "./i18n";

export function Header() {
  const { locale, setLocale, t } = useTranslations<typeof translator>();

  return (
    <header>
      <h1>{t("home.title")}</h1>
      <button onClick={() => setLocale("en")} disabled={locale === "en"}>
        English
      </button>
      <button onClick={() => setLocale("es")} disabled={locale === "es"}>
        Espanol
      </button>
    </header>
  );
}
```

## When to use React only

Use only `@better-translate/core` + `@better-translate/react` when:

- your app is a React SPA
- your app is an Expo app
- locale changes happen in client components

If you are in Next.js App Router, keep this package for client hooks and add the Next.js adapter for routing and server helpers.

## Generate locale files automatically

Instead of writing every translation by hand, use the CLI to extract strings and generate locale files: [CLI guide](https://better-translate.com/en/docs/cli)

## Continue with

- [Expo setup](https://better-translate.com/en/docs/adapters/expo)
- [Next.js setup](https://better-translate.com/en/docs/adapters/nextjs)

## Examples

- [react-vite-example](https://github.com/jralvarenga/better-translate/tree/main/examples/react-vite-example)
- [expo-example](https://github.com/jralvarenga/better-translate/tree/main/examples/expo-example)
