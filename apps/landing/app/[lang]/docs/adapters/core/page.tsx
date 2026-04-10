import type { Metadata } from "next";
import { setRequestLocale } from "@better-translate/nextjs/server";

import type { LandingLocale } from "@/lib/i18n/config";
import { createDocPageMetadata, resolveLandingLocale } from "@/lib/seo";
import { renderDocPage } from "../../_components/render-doc-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return createDocPageMetadata(resolveLandingLocale(lang), "adapters-core", "/docs/adapters/core");
}

export default async function DocsAdapterCorePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as LandingLocale;

  setRequestLocale(locale);
  return renderDocPage("adapters-core", locale);
}
