import * as vscode from 'vscode';

export interface BetterTranslateSettings {
  defaultLocale: string;
  localesDir: string;
  translatorFunctionNames: string[];
}

export function getSettings(): BetterTranslateSettings {
  const config = vscode.workspace.getConfiguration('betterTranslate');
  return {
    defaultLocale: config.get<string>('defaultLocale', ''),
    localesDir: config.get<string>('localesDir', ''),
    translatorFunctionNames: config.get<string[]>('translatorFunctionNames', ['t']),
  };
}
