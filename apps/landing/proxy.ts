import { NextResponse } from "next/server";

import { withBetterTranslate } from "@better-translate/nextjs/proxy";

import { routing } from "@/lib/i18n/routing";

function userProxy() {
  return NextResponse.next();
}

export const proxy = withBetterTranslate(userProxy, routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
