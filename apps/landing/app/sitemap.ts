import type { MetadataRoute } from "next";
import { landingLocales } from "@/lib/i18n/config";
import {
  getAbsoluteUrl,
  getIndexableDocsEntries,
  getLocaleAlternates,
  getLocalizedPathname,
} from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const homeAlternates = getLocaleAlternates(landingLocales, "/");
  const docsEntries = await getIndexableDocsEntries();

  const homeEntries: MetadataRoute.Sitemap = landingLocales.map((locale) => ({
    alternates: {
      languages: homeAlternates,
    },
    changeFrequency: "weekly",
    lastModified,
    priority: 1,
    url: getAbsoluteUrl(getLocalizedPathname(locale)),
  }));

  const localizedDocsEntries: MetadataRoute.Sitemap = docsEntries.flatMap(
    (route) => {
      const alternates = getLocaleAlternates(route.locales, route.href);

      return route.locales.map((locale) => ({
        alternates: {
          languages: alternates,
        },
        changeFrequency: "weekly",
        lastModified,
        priority: 0.8,
        url: getAbsoluteUrl(getLocalizedPathname(locale, route.href)),
      }));
    },
  );

  return [...homeEntries, ...localizedDocsEntries];
}
