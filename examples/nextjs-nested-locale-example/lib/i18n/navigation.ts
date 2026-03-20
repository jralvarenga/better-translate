"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";

import { createNavigationFunctions } from "@better-translate/nextjs/navigation";

import { routing } from "./routing";

export const {
  Link: I18nLink,
  getPathname,
  usePathname: useI18nPathname,
  useRouter: useI18nRouter,
} = createNavigationFunctions({
  Link,
  routing,
  useParams,
  usePathname,
  useRouter,
});
