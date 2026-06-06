import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "../globals.css";
import {
  siteName,
  siteUrl,
  socialImageHeight,
  socialImagePath,
  socialImageWidth,
} from "@/lib/seo";
import { cn } from "@/lib/utils";

const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  description:
    "Define your translations once. Get autocomplete, type errors, and locale switching with adapters for React, Next.js, TanStack Router, TanStack Start, and Node.js.",
  icons: {
    apple: "/180.png",
    icon: [
      {
        sizes: "32x32",
        type: "image/png",
        url: "/32.png",
      },
      {
        sizes: "192x192",
        type: "image/png",
        url: "/192.png",
      },
      {
        sizes: "512x512",
        type: "image/png",
        url: "/512.png",
      },
    ],
    shortcut: "/32.png",
  },
  metadataBase: new URL(siteUrl),
  openGraph: {
    images: [
      {
        alt: `${siteName} social share banner`,
        height: socialImageHeight,
        url: socialImagePath,
        width: socialImageWidth,
      },
    ],
    siteName,
    type: "website",
  },
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  twitter: {
    card: "summary_large_image",
    images: [socialImagePath],
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
};

export default function RedirectLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={cn(
        "dark font-sans",
        fontMono.variable,
        fontSans.variable,
        fontArabic.variable,
      )}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
