---
title: Cambio de Idioma
description: Crea un selector de idioma usando getRelativeLocaleUrl de Astro y el patrón del componente LocaleSwitcher.
---

# Cambio de Idioma

Cambiar entre idiomas requiere mapear la URL actual a la URL equivalente en el idioma destino. Better Translate trabaja con el `getRelativeLocaleUrl` integrado de Astro para simplificar esto.

## El componente LocaleSwitcher

El componente `LocaleSwitcher` renderiza un botón en forma de píldora para cada idioma disponible. Al hacer clic en un botón, navega a la misma página en el idioma seleccionado.

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

## Cómo funciona el mapeo de URLs

Con `prefixDefaultLocale: false`, los patrones de URL son:

| Página | EN | ES |
|--------|----|----|
| Inicio | `/` | `/es` |
| Índice de docs | `/docs` | `/es/docs` |
| Página de doc | `/docs/getting-started` | `/es/docs/getting-started` |

`getRelativeLocaleUrl(locale, route)` maneja estas transformaciones automáticamente.

## Quitar el prefijo de idioma

Cuando el idioma actual es `es` y la ruta es `/es/docs/getting-started`, necesitas quitar el prefijo `/es` antes de pasar la ruta a `getRelativeLocaleUrl`:

```ts
function stripLocalePrefix(pathname: string, locale: string) {
  if (locale === defaultLocale) return pathname;           // "en" → mantener igual
  if (pathname === `/${locale}`) return "/";               // "/es" → "/"
  if (pathname.startsWith(`/${locale}/`))                  // "/es/docs/..." → "/docs/..."
    return pathname.slice(locale.length + 1);
  return pathname;
}
```

Luego `getRelativeLocaleUrl("en", "docs/getting-started")` produce `/docs/getting-started` y `getRelativeLocaleUrl("es", "docs/getting-started")` produce `/es/docs/getting-started`.

## Usando getLocale en tu layout

Siempre obtén el idioma activo desde el contexto de la solicitud en lugar de analizar la URL tú mismo:

```astro
---
import { getLocale } from "../lib/i18n/server";

const locale = await getLocale(); // "en" | "es"
---
```
