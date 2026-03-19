import AsyncStorage from '@react-native-async-storage/async-storage';

import { isExpoLocale, type ExpoLocale } from './config';

export const LOCALE_STORAGE_KEY = 'expo-example.locale';

export async function readStoredLocale(): Promise<ExpoLocale | null> {
  try {
    const value = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
    return isExpoLocale(value) ? value : null;
  } catch {
    return null;
  }
}

export async function persistLocale(locale: ExpoLocale): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Locale persistence is a convenience; failures should not break rendering.
  }
}
