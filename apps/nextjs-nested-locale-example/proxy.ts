import { NextResponse } from "next/server";

import {
  withBetterTranslate,
} from "@better-translate/nextjs/proxy";

import { routing } from "@/lib/i18n/routing";

function userProxy() {
  return NextResponse.next();
}

export const proxy = withBetterTranslate(userProxy, routing);

export const config = {
  // Next.js statically analyzes this field, so the scoped matcher needs to be
  // written inline even though it mirrors getProxyMatcher(routing).
  matcher: ["/app", "/app/:path*"],
};
