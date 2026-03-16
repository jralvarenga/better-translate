import { renderDocPage } from "../../_components/render-doc-page";

export default async function DocsAdapterNextjsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return renderDocPage("docs/adapters-nextjs", lang as "en" | "es");
}
