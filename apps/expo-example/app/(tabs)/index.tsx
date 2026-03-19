import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useTranslations } from '@better-translate/react';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { ExpoTranslator } from '@/lib/i18n/config';

export default function HomeScreen() {
  const { t } = useTranslations<ExpoTranslator>();
  const developerShortcut =
    Platform.select({
      android: 'cmd + m',
      ios: 'cmd + d',
      web: 'F12',
    }) ?? 'F12';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t('home.title')}</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t('home.steps.try.title')}</ThemedText>
        <ThemedText>
          {t('home.steps.try.editIntro')}{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{' '}
          {t('home.steps.try.editOutro')}{' '}
          <ThemedText type="defaultSemiBold">{developerShortcut}</ThemedText>{' '}
          {t('home.steps.try.toolsOutro')}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">{t('home.steps.explore.title')}</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction
              title={t('home.steps.explore.action')}
              icon="cube"
              onPress={() => alert(t('home.steps.explore.actionPressed'))}
            />
            <Link.MenuAction
              title={t('home.steps.explore.share')}
              icon="square.and.arrow.up"
              onPress={() => alert(t('home.steps.explore.sharePressed'))}
            />
            <Link.Menu title={t('home.steps.explore.more')} icon="ellipsis">
              <Link.MenuAction
                title={t('home.steps.explore.delete')}
                icon="trash"
                destructive
                onPress={() => alert(t('home.steps.explore.deletePressed'))}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>{t('home.steps.explore.body')}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t('home.steps.reset.title')}</ThemedText>
        <ThemedText>
          {t('home.steps.reset.intro')}{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>{' '}
          {t('home.steps.reset.freshIntro')}{' '}
          <ThemedText type="defaultSemiBold">{t('home.steps.reset.currentApp')}</ThemedText>{' '}
          {t('home.steps.reset.directoryOutro')}{' '}
          <ThemedText type="defaultSemiBold">{t('home.steps.reset.currentAppLabel')}</ThemedText>{' '}
          {t('home.steps.reset.toLabel')}{' '}
          <ThemedText type="defaultSemiBold">
            {t('home.steps.reset.currentAppDestination')}
          </ThemedText>
          .
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
