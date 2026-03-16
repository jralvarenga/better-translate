import { renderDocPage } from "../_components/render-doc-page";

export default async function DocsChangelogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return renderDocPage("docs/changelog", lang as "en" | "es");
}
