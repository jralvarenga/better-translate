# TanStack Router

Use `@better-translate/tanstack-router` when your app uses TanStack Router or TanStack Start and you want locale-aware URLs.

In most real apps you will pair it with:

- `@better-translate/core` for the translator
- `@better-translate/react` for hooks inside React components

## 1. Install the packages

```sh
npm install @better-translate/core @better-translate/react @better-translate/tanstack-router
```

## 2. Create the shared translator

Create `src/lib/i18n.ts`:

```ts
import { configureTranslations } from "@better-translate/core";

const en = {
  home: {
    title: "Hello from TanStack Router",
  },
} as const;

const es = {
  home: {
    title: "Hola desde TanStack Router",
  },
} as const;

export const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es },
});
```

## 3. Add the locale routing config

Create `src/lib/routing.ts`:

```ts
import { defineRouting } from "@better-translate/tanstack-router";

export const routing = defineRouting({
  defaultLocale: "en",
  locales: ["en", "es"] as const,
  routeTemplate: "/$lang",
});
```

## 4. Create localized navigation helpers

Create `src/lib/navigation.tsx`:

```tsx
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useRouter,
} from "@tanstack/react-router";

import { createNavigationFunctions } from "@better-translate/tanstack-router/navigation";

import { routing } from "./routing";

export const {
  Link: I18nLink,
  useLocale,
  useNavigate: useI18nNavigate,
  usePathname: useI18nPathname,
} = createNavigationFunctions({
  Link,
  routing,
  useLocation,
  useNavigate,
  useParams,
  useRouter,
});
```

## 5. Wrap the app with the React provider

Create `src/app.tsx`:

```tsx
import { RouterProvider } from "@tanstack/react-router";

import { BetterTranslateProvider } from "@better-translate/react";

import { router } from "./router";
import { translator } from "./lib/i18n";

export function App() {
  return (
    <BetterTranslateProvider translator={translator}>
      <RouterProvider router={router} />
    </BetterTranslateProvider>
  );
}
```

## 6. Use locale-aware links and translations

Create `src/components/header.tsx`:

```tsx
import { useTranslations } from "@better-translate/react";

import { translator } from "../lib/i18n";
import { I18nLink, useLocale } from "../lib/navigation";

export function Header() {
  const currentLocale = useLocale();
  const { t } = useTranslations<typeof translator>();

  return (
    <header>
      <h1>{t("home.title")}</h1>
      <I18nLink to="/" params={{ lang: currentLocale }}>
        Home
      </I18nLink>
    </header>
  );
}
```

## TanStack Start

If you are using TanStack Start, keep the same routing and navigation setup. Then add the server helpers from `@better-translate/tanstack-router/server` the same way you would add request helpers in Next.js.

## Generate locale files automatically

Instead of writing every translation by hand, use the CLI to extract strings and generate locale files: [CLI guide](https://better-translate-placeholder.com/en/docs/cli)

## Examples

- [tanstack-start-example](https://github.com/jralvarenga/better-translate/tree/main/examples/tanstack-start-example)
