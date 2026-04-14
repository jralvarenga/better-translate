"use client";

import { createNavigationFunctions } from "@better-translate/tanstack-router/navigation";
import {
  Link,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";

import { routing } from "./routing";

export const {
  Link: I18nLink,
  useLocale,
  useNavigate: useI18nNavigate,
  usePathname: useI18nPathname,
} = createNavigationFunctions({
  Link,
  routing,
  useLocation,
  useNavigate,
  useRouter,
});
