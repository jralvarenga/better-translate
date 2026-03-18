import type { ReactNode } from "react";

import type {
  AnyRouter,
  LinkComponent,
  UseNavigateResult,
} from "@tanstack/react-router";

import { configureTranslations } from "better-translate/core";

import { createNavigationFunctions } from "../../dist/navigation.js";
import { defineRouting } from "../../dist/index.js";
import {
  createServerHelpers,
  getRequestConfig,
  setRequestLocale,
} from "../../dist/server.js";

const routing = defineRouting({
  locales: ["en", "es"] as const,
  defaultLocale: "en",
  routeTemplate: "/app/{-$locale}",
});

const translator = await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  directions: {
    es: "rtl",
  },
  languages: [
    {
      icon: "🇪🇸",
      locale: "es",
      nativeLabel: "Español",
      shortLabel: "ES",
    },
  ],
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
const languages = await helpers.getAvailableLanguages();

const Link = ((props: {
  children?: ReactNode;
  params?: unknown;
  to?: string;
}) => null) as unknown as LinkComponent<"a", "/">;

const navigation = createNavigationFunctions({
  Link,
  routing,
  useLocation() {
    return {
      pathname: "/app/dashboard",
    };
  },
  useNavigate() {
    return (async (_options) => {}) as UseNavigateResult<"/">;
  },
  useParams() {
    return {
      locale: undefined as "en" | "es" | undefined,
    };
  },
  useRouter() {
    return {
      buildLocation(_options: unknown) {
        return {
          external: false,
          hash: "",
          href: "/",
          pathname: "/",
          publicHref: "/",
          search: {},
          searchStr: "",
          state: {},
        };
      },
      navigate(_options: unknown) {
        return Promise.resolve();
      },
      preloadRoute(_options: unknown) {
        return Promise.resolve(undefined);
      },
    } as AnyRouter;
  },
});

t("home.title");
languages[0]?.locale;
t("home.greeting", {
  params: {
    name: "Ada",
  },
});
await helpers.getDirection();
await helpers.getDirection({
  locale: "es",
});
await helpers.getDirection({
  config: {
    rtl: false,
  },
});
await helpers.isRtl();
await helpers.isRtl({
  locale: "es",
});

await helpers.getTranslations({
  locale: "es",
});

navigation.getPathname({
  href: "/app/dashboard",
  locale: "es",
});

await navigation.useNavigate()({
  locale: "es",
  to: "/app/dashboard",
});

navigation.useRouter().buildLocation({
  locale: "es",
  to: "/app/dashboard",
});

await navigation.useRouter().preloadRoute?.({
  locale: "en",
  to: "/app/dashboard",
});

<navigation.Link locale="es" to="/app/dashboard" />;

// @ts-expect-error unsupported locale should fail
await helpers.getTranslations({ locale: "pt" });

// @ts-expect-error params are required for placeholder messages
t("home.greeting");

// @ts-expect-error unsupported locale should fail
navigation.getPathname({ href: "/app/dashboard", locale: "pt" });

// @ts-expect-error invalid locale should fail for navigate
await navigation.useNavigate()({ locale: "pt", to: "/app/dashboard" });

// @ts-expect-error invalid locale should fail for Link
<navigation.Link locale="pt" to="/app/dashboard" />;
