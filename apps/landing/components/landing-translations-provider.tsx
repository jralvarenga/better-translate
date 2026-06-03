"use client";

import * as React from "react";

import {
  type DeepStringify,
  configureTranslations,
} from "@better-translate/core";
import { BetterTranslateProvider } from "@better-translate/react";

import type { LandingTranslator } from "@/lib/i18n/config";
import type { en } from "@/lib/i18n/messages/en";
import {
  type LandingLocale,
  landingDirections,
  landingLanguages,
  landingLocales,
} from "@/lib/i18n/shared";

type LandingMessages = DeepStringify<typeof en>;

interface LandingTranslationsProviderProps {
  children: React.ReactNode;
  initialLocale: LandingLocale;
  initialMessages: LandingMessages;
}

function createClientTranslator(
  locale: LandingLocale,
  messages: LandingMessages,
) {
  const currentLocaleMessages: Record<string, LandingMessages> = {
    [locale]: messages,
  };
  const configureClientTranslations = configureTranslations as unknown as (
    config: unknown,
  ) => Promise<LandingTranslator>;

  return configureClientTranslations({
    availableLocales: landingLocales,
    defaultLocale: locale,
    fallbackLocale: locale,
    directions: landingDirections,
    languages: landingLanguages,
    messages: currentLocaleMessages,
  });
}

export function LandingTranslationsProvider({
  children,
  initialLocale,
  initialMessages,
}: LandingTranslationsProviderProps) {
  const translatorPromise = React.useMemo(
    () => createClientTranslator(initialLocale, initialMessages),
    [initialLocale, initialMessages],
  );
  const translator = React.use(translatorPromise);

  return (
    <BetterTranslateProvider
      initialLocale={initialLocale}
      translator={translator}
    >
      {children}
    </BetterTranslateProvider>
  );
}
