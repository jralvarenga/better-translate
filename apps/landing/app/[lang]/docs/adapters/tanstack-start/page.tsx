import { renderDocPage } from "../../_components/render-doc-page";

export default async function DocsAdapterTanStackPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return renderDocPage("docs/adapters-tanstack-start", lang as "en" | "es");
}
