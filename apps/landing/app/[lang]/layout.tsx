import { notFound } from "next/navigation";

import { hasLocale } from "@better-translate/nextjs";

import { routing } from "@/lib/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export default async function LocalizedLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{
    lang: string;
  }>;
}>) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  return <div lang={lang}>{children}</div>;
}
