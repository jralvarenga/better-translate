import { renderDocPage } from "../_components/render-doc-page";

export default async function DocsInstallationPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return renderDocPage("docs/installation", lang as "en" | "es");
}
