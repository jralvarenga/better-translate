---
title: Locale Switching
description: Build a locale switcher using Astro's getRelativeLocaleUrl and the LocaleSwitcher component pattern.
---

# Locale Switching

Switching between locales requires mapping the current URL to the equivalent URL in the target locale. Better Translate works with Astro's built-in `getRelativeLocaleUrl` to make this straightforward.

## The LocaleSwitcher component

The `LocaleSwitcher` component renders a pill button for each available locale. Clicking a button navigates to the same page in the selected locale.

```astro
---
// src/components/LocaleSwitcher.astro
import { getRelativeLocaleUrl } from "astro:i18n";

interface Props {
  currentLocale: string;
  currentPath: string;
  defaultLocale: string;
  label: string;
  locales: readonly string[];
}

const { currentLocale, currentPath, defaultLocale, label, locales } =
  Astro.props;

function stripLocalePrefix(pathname: string, locale: string) {
  if (locale === defaultLocale) return pathname;
  if (pathname === `/${locale}`) return "/";
  if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  return pathname;
}

const unlocalizedPath = stripLocalePrefix(currentPath, currentLocale);
const route = unlocalizedPath === "/" ? "" : unlocalizedPath.slice(1);
---

<div aria-label={label}>
  {locales.map((locale) => (
    <a href={route ? getRelativeLocaleUrl(locale, route) : getRelativeLocaleUrl(locale)}>
      {locale.toUpperCase()}
    </a>
  ))}
</div>
```

## How URL mapping works

With `prefixDefaultLocale: false`, URL patterns are:

| Page | EN | ES |
|------|----|----|
| Home | `/` | `/es` |
| Docs index | `/docs` | `/es/docs` |
| Doc page | `/docs/getting-started` | `/es/docs/getting-started` |

`getRelativeLocaleUrl(locale, route)` handles these transformations automatically.

## Stripping the locale prefix

When the current locale is `es` and the path is `/es/docs/getting-started`, you need to strip the `/es` prefix before passing the route to `getRelativeLocaleUrl`:

```ts
function stripLocalePrefix(pathname: string, locale: string) {
  if (locale === defaultLocale) return pathname;           // "en" → keep as-is
  if (pathname === `/${locale}`) return "/";               // "/es" → "/"
  if (pathname.startsWith(`/${locale}/`))                  // "/es/docs/..." → "/docs/..."
    return pathname.slice(locale.length + 1);
  return pathname;
}
```

Then `getRelativeLocaleUrl("en", "docs/getting-started")` produces `/docs/getting-started` and `getRelativeLocaleUrl("es", "docs/getting-started")` produces `/es/docs/getting-started`.

## Using getLocale in your layout

Always fetch the active locale from the request context rather than parsing the URL yourself:

```astro
---
import { getLocale } from "../lib/i18n/server";

const locale = await getLocale(); // "en" | "es"
---
```
