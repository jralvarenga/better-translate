import { redirect } from "next/navigation";

export default async function DocsAdapterTanStackPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/docs/adapters/tanstack-router`);
}
