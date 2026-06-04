import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getConfiguredTranslator } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MD + Better Translate",
  description: "Cookie-based locale with localized Markdown and MDX content.",
};

export default async function RootLayout({
  children,
}: { children: React.ReactNode }) {
  const [locale, translator] = await Promise.all([
    getCurrentLocale(),
    getConfiguredTranslator(),
  ]);
  const dir = translator.getDirection({ locale });

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
