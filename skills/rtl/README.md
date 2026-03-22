# RTL Skill

Use this guide when some locales should render right-to-left.

## Where RTL belongs

RTL is configured in `@better-translate/core`.

That means you define direction once in the translator, then adapters can read it later.

## Smallest correct setup

```ts
import { configureTranslations } from "@better-translate/core";

export const translator = await configureTranslations({
  availableLocales: ["en", "ar"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  directions: {
    ar: "rtl",
  },
  messages: { en, ar },
});
```

Then read it from the translator or server helpers:

```ts
translator.getDirection({ locale: "ar" }); // "rtl"
translator.isRtl({ locale: "ar" }); // true
```

## Rule

Keep direction rules in the core config, not scattered across components.
