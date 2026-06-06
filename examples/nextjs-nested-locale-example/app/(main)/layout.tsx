import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  description: "Scoped locale routing with Better Translate and Next.js.",
  title: "Better Translate Next.js Example",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
