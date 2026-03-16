import { renderDocPage } from "./_components/render-doc-page";

export default async function DocsIntroductionPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return renderDocPage("docs/introduction", lang as "en" | "es");
}
