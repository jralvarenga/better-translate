# @better-translate/react

React context and hooks for Better Translate in web React and Expo/React Native apps.

## Install

```sh
bun add better-translate @better-translate/react
```

If you use npm:

```sh
npm install better-translate @better-translate/react
```

## Example

```tsx
import React from "react";
import {
  BetterTranslateProvider,
  useTranslations,
} from "@better-translate/react";
import { configureTranslations } from "better-translate/core";

async function createTranslator() {
  return configureTranslations({
    availableLocales: ["en", "es"] as const,
    defaultLocale: "en",
    directions: {
      es: "rtl",
    },
    languages: [
      {
        icon: "🇪🇸",
        locale: "es",
        nativeLabel: "Español",
        shortLabel: "ES",
      },
    ],
    messages: { en, es },
  });
}

type AppTranslator = Awaited<ReturnType<typeof createTranslator>>;

function Greeting() {
  const { t, locale, direction, rtl, setLocale, messages, availableLanguages } =
    useTranslations<AppTranslator>();

  return (
    <div>
      <p>{t("common.hello")}</p>
      <p>{locale}</p>
      <p>{direction}</p>
      <p>{String(rtl)}</p>
      <p>{availableLanguages.map((language) => language.shortLabel).join(", ")}</p>
      <button onClick={() => void setLocale("es")}>ES</button>
      <pre>{JSON.stringify(messages)}</pre>
    </div>
  );
}

export function App() {
  const [translator, setTranslator] = React.useState<AppTranslator | null>(null);

  React.useEffect(() => {
    void createTranslator().then(setTranslator);
  }, []);

  if (!translator) {
    return null;
  }

  return (
    <BetterTranslateProvider translator={translator}>
      <Greeting />
    </BetterTranslateProvider>
  );
}
```

## Expo / React Native Setup

Expo uses this same package. There is no separate native adapter.

Create the translator in shared app code, then mount `BetterTranslateProvider`
at the root of your app:

```tsx
// app/_layout.tsx (Expo Router) or App.tsx
import { useEffect, useState } from "react";
import { Slot } from "expo-router";

import { BetterTranslateProvider } from "@better-translate/react";

import { createTranslator, type AppTranslator } from "./src/i18n";

export default function RootLayout() {
  const [translator, setTranslator] = useState<AppTranslator | null>(null);

  useEffect(() => {
    void createTranslator().then(setTranslator);
  }, []);

  if (!translator) {
    return null;
  }

  return (
    <BetterTranslateProvider translator={translator}>
      <Slot />
    </BetterTranslateProvider>
  );
}
```

Adjust the `createTranslator` import path to match your app structure.

Then read translations in screens and components with the same hook:

```tsx
import { Pressable, Text, View } from "react-native";

import { useTranslations } from "@better-translate/react";

import type { AppTranslator } from "./src/i18n";

export function HomeScreen() {
  const { t, locale, direction, rtl, setLocale, supportedLocales } =
    useTranslations<AppTranslator>();

  return (
    <View>
      <Text>{t("common.hello")}</Text>
      <Text>{locale}</Text>
      <Text>{direction}</Text>
      <Text>{String(rtl)}</Text>

      {supportedLocales.map((nextLocale) => (
        <Pressable key={nextLocale} onPress={() => void setLocale(nextLocale)}>
          <Text>{nextLocale}</Text>
        </Pressable>
      ))}
    </View>
  );
}
```

Use `loadLocale(...)` to warm the cache before a user switches locales, and use
`direction` or `rtl` to drive native layout decisions.

## Vite React Client-Only Setup

For a client-side only app such as Vite + React, configure the translator once
before the first render and pass the same configured instance into
`BetterTranslateProvider`.

### `src/i18n.ts`

```ts
import en from "./locales/en.json";
import es from "./locales/es.json";
import { configureTranslations } from "better-translate/core";

export function createTranslator() {
  return configureTranslations({
    availableLocales: ["en", "es"] as const,
    defaultLocale: "en",
    fallbackLocale: "en",
    directions: {
      es: "rtl",
    },
    languages: [
      {
        icon: "🇪🇸",
        locale: "es",
        nativeLabel: "Español",
        shortLabel: "ES",
      },
    ],
    messages: { en, es },
  });
}

export type AppTranslator = Awaited<ReturnType<typeof createTranslator>>;
```

### `src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";

import { BetterTranslateProvider } from "@better-translate/react";

import { App } from "./App";
import { createTranslator } from "./i18n";

async function bootstrap() {
  const translator = await createTranslator();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BetterTranslateProvider translator={translator}>
        <App />
      </BetterTranslateProvider>
    </React.StrictMode>,
  );
}

void bootstrap();
```

### `src/App.tsx`

```tsx
import { useTranslations } from "@better-translate/react";

import type { AppTranslator } from "./i18n";

export function App() {
  const {
    t,
    locale,
    direction,
    rtl,
    setLocale,
    supportedLocales,
    availableLanguages,
    messages,
  } = useTranslations<AppTranslator>();

  return (
    <main>
      <h1>{t("common.hello")}</h1>
      <p>Current locale: {locale}</p>
      <p>Direction: {direction}</p>
      <p>RTL: {String(rtl)}</p>
      <p>Languages: {availableLanguages.map((language) => language.shortLabel).join(", ")}</p>

      {supportedLocales.map((nextLocale) => (
        <button key={nextLocale} onClick={() => void setLocale(nextLocale)}>
          {nextLocale}
        </button>
      ))}

      <pre>{JSON.stringify(messages, null, 2)}</pre>
    </main>
  );
}
```

When you need per-call direction metadata, use the configured translator from
context:

```tsx
const { translator } = useTranslations<AppTranslator>();

translator.getDirection({ locale: "es" }); // "rtl"
translator.isRtl({
  locale: "es",
  config: {
    rtl: false,
  },
}); // false
```
