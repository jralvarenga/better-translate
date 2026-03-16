import { renderDocPage } from "../_components/render-doc-page";

export default async function DocsCliPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return renderDocPage("docs/cli", lang as "en" | "es");
}
