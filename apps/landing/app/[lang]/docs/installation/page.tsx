import { setRequestLocale } from "@better-translate/nextjs/server";

import { renderDocPage } from "../_components/render-doc-page";
import { createDocPageMetadata } from "../_components/doc-page-metadata";

export const generateMetadata = createDocPageMetadata("installation");

export default async function DocsInstallationPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  return renderDocPage("installation");
}
