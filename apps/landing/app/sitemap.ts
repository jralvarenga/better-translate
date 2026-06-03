import type { MetadataRoute } from "next";

import { landingLocales } from "@/lib/i18n/shared";
import {
  buildLanguageAlternates,
  getLocalizedRoutePath,
  indexableDocRoutes,
  indexableMarketingRoutes,
  siteUrl,
} from "@/lib/seo";

const routes = [...indexableMarketingRoutes, ...indexableDocRoutes];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.flatMap((route) =>
    landingLocales.map((locale) => ({
      alternates: {
        languages: buildLanguageAlternates(route.routePath),
      },
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      url: new URL(
        getLocalizedRoutePath(route.routePath, locale),
        siteUrl,
      ).toString(),
    })),
  );
}
