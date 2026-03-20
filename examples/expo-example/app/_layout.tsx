import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { BetterTranslateProvider, useTranslations } from '@better-translate/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  createExpoTranslator,
  expoDefaultLocale,
  type ExpoLocale,
  type ExpoTranslator,
} from '@/lib/i18n/config';
import { persistLocale, readStoredLocale } from '@/lib/i18n/storage';

export const unstable_settings = {
  anchor: '(tabs)',
};

function LocalePersistenceBridge() {
  const { locale } = useTranslations<ExpoTranslator>();

  useEffect(() => {
    void persistLocale(locale);
  }, [locale]);

  return null;
}

function RootNavigator() {
  const { t } = useTranslations<ExpoTranslator>();

  return (
    <>
      <LocalePersistenceBridge />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: t('modal.title'),
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appState, setAppState] = useState<{
    initialLocale: ExpoLocale;
    isReady: boolean;
    translator: ExpoTranslator | null;
  }>({
    initialLocale: expoDefaultLocale,
    isReady: false,
    translator: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function prepare() {
      const [nextTranslator, storedLocale] = await Promise.all([
        createExpoTranslator(),
        readStoredLocale(),
      ]);

      if (!isMounted) {
        return;
      }

      setAppState({
        initialLocale: storedLocale ?? expoDefaultLocale,
        isReady: true,
        translator: nextTranslator,
      });
    }

    void prepare();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!appState.translator || !appState.isReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <BetterTranslateProvider
        initialLocale={appState.initialLocale}
        translator={appState.translator}>
        <RootNavigator />
      </BetterTranslateProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
