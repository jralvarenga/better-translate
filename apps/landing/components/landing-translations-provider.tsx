"use client";

import * as React from "react";

import { BetterTranslateProvider } from "@better-translate/react";

import {
  createLandingTranslator,
  type LandingLocale,
  type LandingTranslator,
} from "@/lib/i18n/config";

interface LandingTranslationsProviderProps {
  children: React.ReactNode;
  initialLocale: LandingLocale;
}

let translatorPromise: Promise<LandingTranslator> | undefined;

function getTranslatorPromise() {
  translatorPromise ??= createLandingTranslator();
  return translatorPromise;
}

export function LandingTranslationsProvider({
  children,
  initialLocale,
}: LandingTranslationsProviderProps) {
  const translator = React.use(getTranslatorPromise());

  return (
    <BetterTranslateProvider initialLocale={initialLocale} translator={translator}>
      {children}
    </BetterTranslateProvider>
  );
}
