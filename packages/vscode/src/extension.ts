import * as vscode from 'vscode';
import { BetterTranslateDefinitionProvider } from './definition-provider';

export function activate(context: vscode.ExtensionContext): void {
  const provider = new BetterTranslateDefinitionProvider();

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      ['typescript', 'javascript', 'typescriptreact', 'javascriptreact'],
      provider,
    ),
    vscode.workspace.onDidChangeConfiguration(() => {
      provider.invalidateCache();
    }),
    vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.getText().includes('configureTranslations')) {
        provider.invalidateCache();
      }
    }),
  );
}

export function deactivate(): void {
  // nothing to clean up
}
