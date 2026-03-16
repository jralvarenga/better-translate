import { renderDocPage } from "../_components/render-doc-page";

export default async function DocsSkillsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return renderDocPage("docs/skills", lang as "en" | "es");
}
