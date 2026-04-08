import { setRequestLocale } from "@better-translate/nextjs/server";

import { renderDocPage } from "../../_components/render-doc-page";
import { createDocPageMetadata } from "../../_components/doc-page-metadata";

export const generateMetadata = createDocPageMetadata("adapters-astro");

export default async function DocsAdapterAstroPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  return renderDocPage("adapters-astro");
}
