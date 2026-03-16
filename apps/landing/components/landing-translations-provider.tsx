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
  fallback?: React.ReactNode;
  initialLocale: LandingLocale;
}

let translatorPromise: Promise<LandingTranslator> | undefined;

function getTranslatorPromise() {
  translatorPromise ??= createLandingTranslator();
  return translatorPromise;
}

export function LandingTranslationsProvider({
  children,
  fallback = null,
  initialLocale,
}: LandingTranslationsProviderProps) {
  const [translator, setTranslator] = React.useState<LandingTranslator | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    void getTranslatorPromise().then((resolvedTranslator) => {
      if (isMounted) {
        setTranslator(resolvedTranslator);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!translator) {
    return <>{fallback}</>;
  }

  return (
    <BetterTranslateProvider initialLocale={initialLocale} translator={translator}>
      {children}
    </BetterTranslateProvider>
  );
}
