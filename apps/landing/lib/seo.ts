import type { Metadata, MetadataRoute } from "next";

import {
  landingDefaultLocale,
  landingLocales,
  landingMessages,
  type LandingLocale,
} from "@/lib/i18n/config";
import { docPageRoutes, getDocFrontmatter } from "@/lib/docs";

export const siteName = "better-translate";
export const siteUrl = "https://better-translate.com";
export const socialImagePath = "/banner.png";
export const socialImageUrl = toAbsoluteUrl(socialImagePath);
export const socialImageWidth = 2910;
export const socialImageHeight = 1638;

const twitterCard = "summary_large_image" as const;

export type RouteSeoSpec = {
  canonicalPath: string;
  description: string;
  descriptionLength: number;
  ogDescription: string;
  ogImage: string;
  ogTitle: string;
  title: string;
  titleLength: number;
  twitterCard: typeof twitterCard;
  twitterImage: string;
};

export type IndexableRoute = {
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
  routePath: string;
};

export const indexableMarketingRoutes = [
  {
    changeFrequency: "weekly",
    priority: 1,
    routePath: "/",
  },
] as const satisfies readonly IndexableRoute[];

export const indexableDocRoutes = docPageRoutes.map((route) => ({
  changeFrequency: route.routePath === "/docs" ? "weekly" : "monthly",
  priority: route.routePath === "/docs" ? 0.9 : 0.8,
  routePath: route.routePath,
})) satisfies readonly IndexableRoute[];

export function createHomeMetadata(locale: LandingLocale): Metadata {
  const messages = landingMessages[locale];

  return createRouteMetadata(locale, "/", {
    description: messages.hero.description,
    title: messages.hero.title,
  });
}

export function createThanksForSupportMetadata(
  locale: LandingLocale,
): Metadata {
  const messages = landingMessages[locale];

  return createRouteMetadata(locale, "/thanks-for-support", {
    description: messages.thanksForSupport.description,
    noIndex: true,
    title: messages.thanksForSupport.title,
  });
}

export async function createDocPageMetadata(
  locale: LandingLocale,
  documentId: string,
  routePath: string,
): Promise<Metadata> {
  const frontmatter = await getDocFrontmatter(documentId, locale);

  return createRouteMetadata(locale, routePath, {
    description: frontmatter.description,
    title: frontmatter.title,
  });
}

export function createRouteMetadata(
  locale: LandingLocale,
  routePath: string,
  content: {
    description: string;
    noIndex?: boolean;
    title: string;
  },
): Metadata {
  const spec = createRouteSeoSpec(locale, routePath, content);
  const canonicalUrl = toAbsoluteUrl(spec.canonicalPath);

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: buildLanguageAlternates(routePath),
    },
    description: spec.description,
    openGraph: {
      description: spec.ogDescription,
      images: [
        {
          alt: `${spec.ogTitle} social share banner`,
          height: socialImageHeight,
          url: spec.ogImage,
          width: socialImageWidth,
        },
      ],
      locale,
      siteName,
      title: spec.ogTitle,
      type: "website",
      url: canonicalUrl,
    },
    robots: content.noIndex
      ? {
          follow: false,
          index: false,
        }
      : undefined,
    title: {
      absolute: spec.title,
    },
    twitter: {
      card: spec.twitterCard,
      description: spec.description,
      images: [spec.twitterImage],
      title: spec.title,
    },
  };
}

export function createRouteSeoSpec(
  locale: LandingLocale,
  routePath: string,
  content: {
    description: string;
    title: string;
  },
): RouteSeoSpec {
  const canonicalPath = getLocalizedRoutePath(routePath, locale);
  const resolvedTitle = formatTitle(content.title);

  return {
    canonicalPath,
    description: content.description,
    descriptionLength: content.description.length,
    ogDescription: content.description,
    ogImage: socialImageUrl,
    ogTitle: resolvedTitle,
    title: resolvedTitle,
    titleLength: resolvedTitle.length,
    twitterCard,
    twitterImage: socialImageUrl,
  };
}

export function getLocalizedRoutePath(
  routePath: string,
  locale: LandingLocale,
) {
  if (routePath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${routePath}`;
}

export function resolveLandingLocale(locale: string): LandingLocale {
  if (landingLocales.includes(locale as LandingLocale)) {
    return locale as LandingLocale;
  }

  return landingDefaultLocale;
}

function buildLanguageAlternates(routePath: string) {
  return Object.fromEntries([
    ...landingLocales.map((locale) => [
      locale,
      toAbsoluteUrl(getLocalizedRoutePath(routePath, locale)),
    ]),
    [
      "x-default",
      toAbsoluteUrl(getLocalizedRoutePath(routePath, landingDefaultLocale)),
    ],
  ]);
}

function formatTitle(title: string) {
  return title === siteName ? siteName : `${title} | ${siteName}`;
}

function toAbsoluteUrl(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}
