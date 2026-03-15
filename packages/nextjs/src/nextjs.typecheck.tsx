import { configureTranslations } from "better-translate/core";

import { defineRouting } from "./index.js";
import { createNavigation } from "./navigation.js";
import { createServerHelpers, getRequestConfig } from "./server.js";

const routing = defineRouting({
  locales: ["en", "es"] as const,
  defaultLocale: "en",
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
        title: "Hello",
        greeting: "Hello {name}",
      },
    },
    es: {
      home: {
        title: "Hola",
        greeting: "Hola {name}",
      },
    },
  },
});

const requestConfig = getRequestConfig(async () => ({
  locale: "en" as const,
  translator,
}));
const helpers = createServerHelpers(requestConfig);
const t = await helpers.getTranslations();
const { Link, getPathname } = createNavigation(routing);

t("home.title");
t("home.greeting", {
  params: {
    name: "Ada",
  },
});

await helpers.getTranslations({
  locale: "es",
});

getPathname({
  href: "/products",
  locale: "es",
});

<Link href="/products" locale="es" />;

// @ts-expect-error unsupported locale should fail
await helpers.getTranslations({ locale: "pt" });

// @ts-expect-error params are required for placeholder messages
t("home.greeting");

// @ts-expect-error unsupported locale should fail
getPathname({ href: "/products", locale: "pt" });

// @ts-expect-error invalid locale should fail for Link
<Link href="/products" locale="pt" />;
