import type { ReactNode } from "react";

import { configureTranslations } from "better-translate/core";

import { createNavigationFunctions } from "./navigation.js";
import { defineRouting } from "./index.js";
import {
  createServerHelpers,
  getRequestConfig,
  setRequestLocale,
} from "./server.js";

const routing = defineRouting({
  locales: ["en", "es"] as const,
  defaultLocale: "en",
  routeTemplate: "/app/[locale]",
  domains: [
    {
      domain: "example.com",
      defaultLocale: "en",
      locales: ["en"],
    },
    {
      domain: "es.example.com",
      defaultLocale: "es",
      locales: ["es"],
      protocol: "https",
    },
  ],
});

const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: {
    en: {
      home: {
        greeting: "Hello {name}",
        title: "Hello",
      },
    },
    es: {
      home: {
        greeting: "Hola {name}",
        title: "Hola",
      },
    },
  },
});

const requestConfig = getRequestConfig(async () => ({
  translator,
}));
const helpers = createServerHelpers(requestConfig);
setRequestLocale("en");
const t = await helpers.getTranslations();
const navigation = createNavigationFunctions({
  Link(props: { children?: ReactNode; href: string }) {
    return null;
  },
  routing,
  useParams() {
    return {
      locale: "en" as const,
    };
  },
  usePathname() {
    return "/app/en/dashboard";
  },
  useRouter() {
    return {
      prefetch(href: string, options?: { kind?: "auto" | "full" }) {
        void href;
        void options;
      },
      push(href: string, options?: { scroll?: boolean }) {
        void href;
        void options;
      },
      replace(href: string, options?: { scroll?: boolean }) {
        void href;
        void options;
      },
    };
  },
});

t("home.title");
t("home.greeting", {
  params: {
    name: "Ada",
  },
});

await helpers.getTranslations({
  locale: "es",
});

navigation.getPathname({
  href: "/app/dashboard",
  locale: "es",
});

navigation.useRouter().push("/app/dashboard", {
  locale: "es",
  scroll: true,
});

navigation.useRouter().prefetch("/app/reports", {
  kind: "auto",
  locale: "en",
});

<navigation.Link href="/app/dashboard" locale="es" />;

// @ts-expect-error unsupported locale should fail
await helpers.getTranslations({ locale: "pt" });

// @ts-expect-error params are required for placeholder messages
t("home.greeting");

// @ts-expect-error unsupported locale should fail
navigation.getPathname({ href: "/app/dashboard", locale: "pt" });

// @ts-expect-error invalid locale should fail for router wrapper
navigation.useRouter().push("/app/dashboard", { locale: "pt" });

// @ts-expect-error invalid locale should fail for Link
<navigation.Link href="/app/dashboard" locale="pt" />;
