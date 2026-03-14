import * as vscode from 'vscode';
import { extractKeyAtPosition } from './key-extractor';
import { getSettings } from './settings';
import { scanForTranslationConfig, invalidateConfigCache } from './config-scanner';
import { findLocaleFile } from './locale-file-finder';
import { findKeyInJson, findKeyInTypeScript } from './key-locator';

interface ResolvedConfig {
  defaultLocale: string;
  localeFileUri: vscode.Uri;
}

export class BetterTranslateDefinitionProvider implements vscode.DefinitionProvider {
  private configCache: ResolvedConfig | null | undefined = undefined;

  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
  ): Promise<vscode.Location | null> {
    const settings = getSettings();
    const lineText = document.lineAt(position.line).text;

    // 1. Extract key at cursor
    const extracted = extractKeyAtPosition(
      lineText,
      position.character,
      settings.translatorFunctionNames,
    );
    if (!extracted) return null;

    // 2. Resolve locale file (cached)
    const config = await this.resolveConfig(settings);
    if (!config) return null;

    // 3. Read locale file
    let text: string;
    try {
      const bytes = await vscode.workspace.fs.readFile(config.localeFileUri);
      text = Buffer.from(bytes).toString('utf-8');
    } catch {
      return null;
    }

    // 4. Find key position based on file type
    const ext = config.localeFileUri.fsPath.split('.').pop()?.toLowerCase();
    let keyPosition: vscode.Position | null;

    if (ext === 'json') {
      keyPosition = findKeyInJson(text, extracted.key);
    } else {
      keyPosition = findKeyInTypeScript(text, extracted.key);
    }

    if (!keyPosition) return null;

    // 5. Return location
    return new vscode.Location(config.localeFileUri, keyPosition);
  }

  invalidateCache(): void {
    this.configCache = undefined;
    invalidateConfigCache();
  }

  private async resolveConfig(
    settings: ReturnType<typeof getSettings>,
  ): Promise<ResolvedConfig | null> {
    if (this.configCache !== undefined) {
      return this.configCache;
    }

    const folders = vscode.workspace.workspaceFolders ?? [];

    // Determine default locale
    let defaultLocale = settings.defaultLocale;
    if (!defaultLocale) {
      const scanned = await scanForTranslationConfig(folders);
      defaultLocale = scanned?.defaultLocale ?? 'en';
    }

    // Find locale file
    const localeFileUri = await findLocaleFile(
      folders,
      defaultLocale,
      settings.localesDir || undefined,
    );

    if (!localeFileUri) {
      this.configCache = null;
      return null;
    }

    this.configCache = { defaultLocale, localeFileUri };
    return this.configCache;
  }
}
