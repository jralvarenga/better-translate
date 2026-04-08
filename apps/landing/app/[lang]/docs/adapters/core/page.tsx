import { setRequestLocale } from "@better-translate/nextjs/server";

import { renderDocPage } from "../../_components/render-doc-page";
import { createDocPageMetadata } from "../../_components/doc-page-metadata";

export const generateMetadata = createDocPageMetadata("adapters-core");

export default async function DocsAdapterCorePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  return renderDocPage("adapters-core");
}
