import type { MetadataRoute } from "next";

import { landingLocales } from "@/lib/i18n/config";
import {
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
        languages: Object.fromEntries(
          landingLocales.map((alternateLocale) => [
            alternateLocale,
            new URL(
              getLocalizedRoutePath(route.routePath, alternateLocale),
              siteUrl,
            ).toString(),
          ]),
        ),
      },
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      url: new URL(getLocalizedRoutePath(route.routePath, locale), siteUrl).toString(),
    })),
  );
}
