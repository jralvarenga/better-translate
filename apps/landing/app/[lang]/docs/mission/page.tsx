import { setRequestLocale } from "@better-translate/nextjs/server";

import { renderDocPage } from "../_components/render-doc-page";
import { createDocPageMetadata } from "../_components/doc-page-metadata";

export const generateMetadata = createDocPageMetadata("mission");

export default async function DocsMissionPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  return renderDocPage("mission");
}
