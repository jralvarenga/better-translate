import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { localizePathname } from "@better-translate/nextjs";

import { routing } from "@/lib/i18n/routing";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

// Polar checkout IDs are alphanumeric with hyphens and underscores only.
// Reject anything else to prevent query-string injection.
function sanitizeCheckoutId(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return /^[\w-]+$/.test(value) ? value : undefined;
}

export default async function ThanksForSupportRedirect({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; checkout_id?: string }>;
}) {
  const { id, checkout_id } = await searchParams;
  const checkoutId = sanitizeCheckoutId(id ?? checkout_id);
  const basePath = localizePathname(
    "/thanks-for-support",
    routing.defaultLocale,
    routing
  );
  redirect(
    checkoutId ? `${basePath}?id=${encodeURIComponent(checkoutId)}` : basePath
  );
}
