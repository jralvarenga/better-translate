import { Pressable, StyleSheet, View } from "react-native";
import { useTranslations } from "@better-translate/react";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ExpoTranslator } from "@/lib/i18n/config";

export function HeaderLocaleSwitcher() {
  const { availableLanguages, isLoadingLocale, locale, setLocale, t } =
    useTranslations<ExpoTranslator>();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <View
      accessibilityRole="toolbar"
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          borderColor: palette.icon,
        },
      ]}
    >
      {availableLanguages.map((language) => {
        const isActive = language.locale === locale;

        return (
          <Pressable
            key={language.locale}
            accessibilityLabel={t("header.switchLocaleTo", {
              params: {
                locale: language.nativeLabel,
              },
            })}
            accessibilityState={{
              busy: isLoadingLocale && !isActive,
              disabled: isLoadingLocale,
              selected: isActive,
            }}
            disabled={isLoadingLocale || isActive}
            onPress={() => {
              void setLocale(language.locale);
            }}
            style={[
              styles.button,
              {
                backgroundColor: isActive ? palette.tint : "transparent",
              },
            ]}
          >
            <ThemedText
              style={[
                styles.label,
                {
                  color: isActive ? palette.background : palette.text,
                },
              ]}
            >
              {language.shortLabel}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    minWidth: 38,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
    textAlign: "center",
  },
});
