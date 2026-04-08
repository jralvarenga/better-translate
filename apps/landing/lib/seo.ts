import "server-only";

import { access } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { cache } from "react";
import type { LandingLocale } from "@/lib/i18n/config";
import {
  landingDefaultLocale,
  landingLocales,
  landingMessages,
} from "@/lib/i18n/config";
import { docsRoutes, getDocsRouteByDocumentId } from "@/lib/docs";
import { md } from "@/lib/i18n/md";

const SITE_NAME = "better-translate";
const SITE_DESCRIPTION =
  "Type-safe translations for TypeScript with one configuration that works across Next.js, React, Astro, TanStack Router, and Node.js.";
const SOCIAL_IMAGE_PATH = "/opengraph-image";
const DOC_EXTENSIONS = [".mdx", ".md"] as const;
const DOCS_ROOT = path.join(process.cwd(), "docs");

function normalizeSiteUrl(value: string | undefined) {
  const raw = value?.trim();

  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is required for landing SEO metadata.",
    );
  }

  return raw.endsWith("/") ? raw : `${raw}/`;
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

const getDocSourceLocales = cache(async (documentId: string) => {
  const locales = await Promise.all(
    landingLocales.map(async (locale) => {
      for (const extension of DOC_EXTENSIONS) {
        const filePath = path.join(DOCS_ROOT, locale, `${documentId}${extension}`);
        if (await fileExists(filePath)) {
          return locale;
        }
      }

      return null;
    }),
  );

  return locales.filter((locale): locale is LandingLocale => locale !== null);
});

export const siteMetadata = {
  defaultLocale: landingDefaultLocale,
  description: SITE_DESCRIPTION,
  name: SITE_NAME,
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  verificationToken: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim(),
} as const;

export function getSiteUrl() {
  return siteMetadata.url;
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}

export function getAbsoluteUrl(pathname: string) {
  return new URL(pathname, getSiteUrl()).toString();
}

export function getLocalizedPathname(locale: LandingLocale, pathname = "") {
  if (!pathname || pathname === "/") {
    return `/${locale}`;
  }

  return `/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function getLocaleAlternates(
  locales: readonly LandingLocale[],
  pathname: string,
) {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[locale] = getAbsoluteUrl(getLocalizedPathname(locale, pathname));
  }

  languages["x-default"] = getAbsoluteUrl(
    getLocalizedPathname(siteMetadata.defaultLocale, pathname),
  );

  return languages;
}

export function getHomePageMetadata(locale: LandingLocale): Metadata {
  const messages = landingMessages[locale];
  const pathname = getLocalizedPathname(locale);

  return {
    alternates: {
      canonical: pathname,
      languages: getLocaleAlternates(landingLocales, "/"),
    },
    description: messages.hero.description,
    openGraph: {
      description: messages.hero.description,
      images: [{ url: SOCIAL_IMAGE_PATH }],
      locale,
      siteName: SITE_NAME,
      title: messages.hero.title,
      type: "website",
      url: pathname,
    },
    title: messages.hero.title,
    twitter: {
      card: "summary_large_image",
      description: messages.hero.description,
      images: [SOCIAL_IMAGE_PATH],
      title: messages.hero.title,
    },
  };
}

export async function getDocPageMetadata(
  documentId: string,
  locale: LandingLocale,
): Promise<Metadata> {
  const route = getDocsRouteByDocumentId(documentId);

  if (!route) {
    throw new Error(`Unknown docs document id: ${documentId}`);
  }

  const [document, sourceLocales] = await Promise.all([
    md.getDocument(documentId, { locale }),
    getDocSourceLocales(documentId),
  ]);

  const canonicalLocale = sourceLocales.includes(locale)
    ? locale
    : document.locale;
  const canonicalPathname = getLocalizedPathname(canonicalLocale, route.href);
  const description = String(document.frontmatter.description ?? SITE_DESCRIPTION);
  const title = String(document.frontmatter.title ?? SITE_NAME);

  return {
    alternates: {
      canonical: canonicalPathname,
      languages: getLocaleAlternates(sourceLocales, route.href),
    },
    description,
    openGraph: {
      description,
      images: [{ url: SOCIAL_IMAGE_PATH }],
      locale: canonicalLocale,
      siteName: SITE_NAME,
      title,
      type: "article",
      url: canonicalPathname,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [SOCIAL_IMAGE_PATH],
      title,
    },
  };
}

export const getIndexableDocsEntries = cache(async () => {
  const entries = await Promise.all(
    docsRoutes.map(async (route) => {
      const locales = await getDocSourceLocales(route.documentId);

      return {
        ...route,
        locales,
      };
    }),
  );

  return entries.filter((entry) => entry.locales.length > 0);
});

export function getSiteMetadata(): Metadata {
  return {
    applicationName: SITE_NAME,
    description: SITE_DESCRIPTION,
    metadataBase: getMetadataBase(),
    openGraph: {
      description: SITE_DESCRIPTION,
      images: [{ url: SOCIAL_IMAGE_PATH }],
      siteName: SITE_NAME,
      title: SITE_NAME,
      type: "website",
      url: "/",
    },
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    twitter: {
      card: "summary_large_image",
      description: SITE_DESCRIPTION,
      images: [SOCIAL_IMAGE_PATH],
      title: SITE_NAME,
    },
    verification: siteMetadata.verificationToken
      ? {
          google: siteMetadata.verificationToken,
        }
      : undefined,
  };
}
