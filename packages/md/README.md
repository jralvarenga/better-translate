# @better-translate/md

Markdown and MDX helpers for Better Translate.

This package uses the same configured translator you already create with
`configureTranslations(...)`. It does not define a separate locale system.

## Install

```sh
bun add @better-translate/md better-translate
```

## Example

```ts
import { configureTranslations } from "better-translate/core";
import { createMarkdownHelpers } from "@better-translate/md";

const translator = await configureTranslations({
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
  messages: {
    en: {
      common: {
        hello: "Hello",
      },
    },
  },
});

const docs = createMarkdownHelpers(translator, {
  rootDir: "./content",
});

const page = await docs.getDocument("docs/getting-started", {
  locale: "es",
});
```

Supported file layout:

```txt
content/
  en/docs/getting-started.mdx
  es/docs/getting-started.mdx
```

## Next.js server helpers

When you use the `@better-translate/md/server` entry in a localized Next.js
route, set the request locale once in the layout and then call markdown helpers
without passing `locale` repeatedly.

```ts
import { createMarkdownServerHelpers } from "@better-translate/md/server";

import { requestConfig } from "./i18n/request";

export const docs = createMarkdownServerHelpers(requestConfig, {
  rootDir: "./content",
});
```

Request-aware direction helpers are available there too:

```ts
await docs.getAvailableLanguages();
await docs.getDirection(); // "ltr" | "rtl"
await docs.isRtl(); // boolean
await docs.getDirection({
  config: {
    rtl: false,
  },
});
```

```tsx
import { hasLocale } from "@better-translate/nextjs";
import { setRequestLocale } from "@better-translate/nextjs/server";
import { notFound } from "next/navigation";

import { docs } from "@/lib/docs";
import { routing } from "@/lib/i18n/routing";

export default async function LocalizedLayout({
  children,
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  setRequestLocale(lang);

  await docs.getDocument("docs/getting-started");

  return children;
}
```
