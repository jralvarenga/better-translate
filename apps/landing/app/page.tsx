import { redirect } from "next/navigation";

import { localizePathname } from "@better-translate/nextjs";

import { routing } from "@/lib/i18n/routing";

export default function Home() {
  redirect(localizePathname("/", routing.defaultLocale, routing));
}
