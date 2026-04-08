import type { MetadataRoute } from "next";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    host: new URL(getSiteUrl()).host,
    rules: [
      {
        allow: "/",
        userAgent: "*",
      },
    ],
    sitemap: getAbsoluteUrl("/sitemap.xml"),
  };
}
