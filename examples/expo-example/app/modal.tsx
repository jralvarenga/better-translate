import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { useTranslations } from "@better-translate/react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { ExpoTranslator } from "@/lib/i18n/config";

export default function ModalScreen() {
  const { t } = useTranslations<ExpoTranslator>();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{t("modal.title")}</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">{t("modal.backToHome")}</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
