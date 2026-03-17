# Better Translate RTL

## What This Is

RTL (right-to-left) support is built into the `better-translate` core package.

It gives you:

- a `directions` config key to declare which locales are RTL
- `getDirection({ locale })` to query the direction for any locale
- `isRtl({ locale })` to get a boolean shorthand
- a per-call `config.rtl` override for special cases

## When To Use It

Use RTL support when:

- your app needs to support languages like Arabic (`ar`), Hebrew (`he`), Persian (`fa`), or Urdu (`ur`)
- you need to set the `dir` attribute on HTML elements based on the current locale
- you need to render a single element in the opposite direction from the locale default

## How It Works

### 1. Declare directions in config

Add a `directions` key to your `configureTranslations` call.

```ts
const translator = await configureTranslations({
  availableLocales: ["en", "ar"] as const,
  defaultLocale: "en",
  messages: { en, ar },
  directions: {
    ar: "rtl",
  },
})
```

Any locale you omit defaults to `"ltr"`. The `directions` key is entirely optional.

### 2. Query the direction

Call `getDirection` to get the direction string for any locale.

```ts
translator.getDirection({ locale: "ar" }) // "rtl"
translator.getDirection({ locale: "en" }) // "ltr"
```

Call `isRtl` to get a boolean.

```ts
translator.isRtl({ locale: "ar" }) // true
translator.isRtl({ locale: "en" }) // false
```

### 3. Per-call override

Pass `config.rtl` to override the configured direction for a single `t(...)` call.

This does not change message lookup. It only affects what `resolveDirection` returns for that call.

```ts
// Force LTR even for an RTL locale
translator.t("greeting", {
  locale: "ar",
  config: { rtl: false },
})
```

### 4. Apply to HTML

Use `getDirection` when rendering the `dir` attribute on a root element.

```tsx
<html dir={translator.getDirection({ locale })}>
```

Or in a React component:

```tsx
<div dir={translator.getDirection({ locale })}>
  {t("greeting")}
</div>
```

## Important Behavior

- The `directions` map only needs entries for RTL locales. LTR is the default.
- `getDirection` returns `"ltr" | "rtl"`. It never returns `undefined`.
- `isRtl` is a strict equality check: `resolveDirection(options) === "rtl"`.
- `config.rtl: true` forces `"rtl"` regardless of what is in the `directions` map.
- `config.rtl: false` forces `"ltr"` regardless of what is in the `directions` map.
- When `config.rtl` is not set, direction is resolved from `config.directions[locale]`.
- If a locale is not in the `directions` map, the result is `"ltr"`.

## Important Files

- `packages/better-translate/src/types.ts` — `TranslationDirection`, `TranslationDirectionOptions`
- `packages/better-translate/src/create-configured-translator.ts` — `resolveDirection()`, `getDirection()`, `isRtl()`
- `packages/better-translate/src/normalize-config.ts` — `createNormalizedDirections()`

## Simple Mental Model

`directions` is a locale → `"ltr" | "rtl"` map.

`getDirection()` looks up the locale in that map and returns `"ltr"` if nothing is found.

`config.rtl` short-circuits the map lookup entirely.

```
config.rtl === true   → "rtl"
config.rtl === false  → "ltr"
no config.rtl         → directions[locale] ?? "ltr"
```

## What To Copy From The Examples

- From `apps/landing/app/[lang]/layout.tsx`, copy the `dir={translator.getDirection({ locale })}` pattern for applying direction to the `<html>` element.
- From `apps/landing/lib/i18n/config.ts`, copy the `directions` key if your app has RTL locales.

## Extra Notes

- RTL direction does not affect message lookup or fallback behavior. It is metadata only.
- You can use `getDirection` without `isRtl` or vice versa. They are independent helpers.
- The `TranslationDirection` type is `"ltr" | "rtl"`. You can import it if you need to type a variable.
- `createNormalizedDirections` in `normalize-config.ts` builds the internal directions map from your config. It handles both the short form and options form.
