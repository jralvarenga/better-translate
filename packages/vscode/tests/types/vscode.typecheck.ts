import type * as vscode from "vscode";

import type { TranslationConfig } from "../../src/config-scanner";
import type { BetterTranslateSettings } from "../../src/settings";

import { scanForTranslationConfig } from "../../src/config-scanner";
import { BetterTranslateDefinitionProvider } from "../../src/definition-provider";
import { activate, deactivate } from "../../src/extension";
import { extractKeyAtPosition } from "../../src/key-extractor";
import { findLocaleFile } from "../../src/locale-file-finder";
import { findKeyInJson, findKeyInTypeScript } from "../../src/key-locator";
import { getSettings } from "../../src/settings";

const provider: vscode.DefinitionProvider =
  new BetterTranslateDefinitionProvider();
const keyResult = extractKeyAtPosition(`const title = t("home.title");`, 24);
const maybeKey: string | undefined = keyResult?.key;
const jsonPosition: vscode.Position | null = findKeyInJson(
  '{ "home": { "title": "Hello" } }',
  "home.title",
);
const typeScriptPosition: vscode.Position | null = findKeyInTypeScript(
  "export default { home: { title: 'Hello' } };",
  "home.title",
);
const settings: BetterTranslateSettings = getSettings();
const defaultLocale: string = settings.defaultLocale;
const configPromise: Promise<TranslationConfig | null> = scanForTranslationConfig(
  [] as readonly vscode.WorkspaceFolder[],
);
const localeFilePromise: Promise<vscode.Uri | null> = findLocaleFile(
  [] as readonly vscode.WorkspaceFolder[],
  "en",
  "locales",
);

activate({
  subscriptions: [],
} as unknown as vscode.ExtensionContext);
deactivate();

void provider;
void maybeKey;
void jsonPosition;
void typeScriptPosition;
void defaultLocale;
void configPromise;
void localeFilePromise;

// @ts-expect-error locale names must be strings
findLocaleFile([] as readonly vscode.WorkspaceFolder[], 123);

// @ts-expect-error provider cache invalidation does not take arguments
new BetterTranslateDefinitionProvider().invalidateCache("now");

// @ts-expect-error settings do not expose unknown properties
getSettings().missingProperty;
