import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@better-translate/nextjs";
import type { LandingLocale } from "@/lib/i18n/config";
import { routing } from "@/lib/i18n/routing";
import { getDocPageMetadata } from "@/lib/seo";

type DocPageParams = Promise<{ lang: string }>;

export function createDocPageMetadata(documentId: string) {
  return async function generateMetadata({
    params,
  }: {
    params: DocPageParams;
  }): Promise<Metadata> {
    const { lang } = await params;

    if (!hasLocale(routing.locales, lang)) {
      notFound();
    }

    return getDocPageMetadata(documentId, lang as LandingLocale);
  };
}
