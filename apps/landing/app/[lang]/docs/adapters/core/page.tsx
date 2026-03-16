import { renderDocPage } from "../../_components/render-doc-page";

export default async function DocsAdapterCorePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return renderDocPage("docs/adapters-core", lang as "en" | "es");
}
