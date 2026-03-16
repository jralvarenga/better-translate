import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "better-translate — Type-Safe Translations for TypeScript",
  description:
    "Define your translations once. Get autocomplete, type errors, and locale switching — with adapters for React, Next.js, TanStack Start, and any Node server.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark font-sans", fontMono.variable, fontSans.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
