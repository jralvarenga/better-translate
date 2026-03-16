import { renderDocPage } from "../../_components/render-doc-page";

export default async function DocsAdapterReactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return renderDocPage("docs/adapters-react", lang as "en" | "es");
}
