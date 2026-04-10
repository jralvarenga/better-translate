import type { Metadata } from "next";
import { setRequestLocale } from "@better-translate/nextjs/server";

import type { LandingLocale } from "@/lib/i18n/config";
import { createDocPageMetadata, resolveLandingLocale } from "@/lib/seo";
import { renderDocPage } from "../_components/render-doc-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return createDocPageMetadata(resolveLandingLocale(lang), "skills", "/docs/skills");
}

export default async function DocsSkillsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as LandingLocale;

  setRequestLocale(locale);
  return renderDocPage("skills", locale);
}
