import { setRequestLocale } from "@better-translate/nextjs/server";

import { renderDocPage } from "../../_components/render-doc-page";

export default async function DocsAdapterReactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  return renderDocPage("docs/adapters-react");
}
