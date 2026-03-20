import { Image } from 'expo-image';
import { useTranslations } from '@better-translate/react';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import type { ExpoTranslator } from '@/lib/i18n/config';

export default function TabTwoScreen() {
  const { t } = useTranslations<ExpoTranslator>();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          {t('explore.title')}
        </ThemedText>
      </ThemedView>
      <ThemedText>{t('explore.intro')}</ThemedText>
      <Collapsible title={t('explore.sections.routing.title')}>
        <ThemedText>
          {t('explore.sections.routing.screensIntro')}{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{' '}
          {t('explore.sections.routing.and')}{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          {t('explore.sections.routing.layoutIntro')}{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          {t('explore.sections.routing.layoutOutro')}
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">{t('common.learnMore')}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={t('explore.sections.platforms.title')}>
        <ThemedText>{t('explore.sections.platforms.body')}</ThemedText>
      </Collapsible>
      <Collapsible title={t('explore.sections.images.title')}>
        <ThemedText>
          {t('explore.sections.images.bodyIntro')}{' '}
          <ThemedText type="defaultSemiBold">@2x</ThemedText> {t('explore.sections.images.bodyMiddle')}{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText>{' '}
          {t('explore.sections.images.bodyOutro')}
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">{t('common.learnMore')}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={t('explore.sections.theme.title')}>
        <ThemedText>
          {t('explore.sections.theme.bodyIntro')}{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText>{' '}
          {t('explore.sections.theme.bodyMiddle')}
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">{t('common.learnMore')}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={t('explore.sections.animations.title')}>
        <ThemedText>
          {t('explore.sections.animations.bodyIntro')}{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText>{' '}
          {t('explore.sections.animations.bodyMiddle')}{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          {t('explore.sections.animations.bodyOutro')}
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              {t('explore.sections.animations.iosBodyIntro')}{' '}
              <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              {t('explore.sections.animations.iosBodyOutro')}
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
