import type { Metadata } from "next";
import { hasLocale } from "@better-translate/nextjs";

import { routing } from "@/lib/i18n/routing";
import "./globals.css";

export const metadata: Metadata = {
  title: "Better Translate Next.js Example",
  description: "Root-level locale routing with Better Translate and Next.js.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{
    lang?: string;
  }>;
}>) {
  const { lang } = await params;
  const htmlLang =
    typeof lang === "string" && hasLocale(routing.locales, lang) ? lang : "en";

  return (
    <html lang={htmlLang}>
      <body>{children}</body>
    </html>
  );
}
