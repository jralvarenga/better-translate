import path from "node:path";

import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";

type MockState = {
  config: Map<string, unknown>;
  fileContents: Map<string, string>;
  findFilesCalls: Array<unknown[]>;
  findFilesHandler: (...args: unknown[]) => Promise<any[]>;
  onDidChangeConfigurationHandlers: Array<() => void>;
  onDidChangeTextDocumentHandlers: Array<
    (event: { document: { getText(): string } }) => void
  >;
  registerDefinitionProviderCalls: Array<unknown[]>;
  registeredProvider: { invalidateCache(): void } | null;
  stats: Set<string>;
  workspaceFolders: Array<{ uri: { fsPath: string } }>;
};

const state: MockState = {
  config: new Map(),
  fileContents: new Map(),
  findFilesCalls: [],
  findFilesHandler: async () => [],
  onDidChangeConfigurationHandlers: [],
  onDidChangeTextDocumentHandlers: [],
  registerDefinitionProviderCalls: [],
  registeredProvider: null,
  stats: new Set(),
  workspaceFolders: [],
};

mock.module("vscode", () => {
  class Position {
    constructor(
      readonly line: number,
      readonly character: number,
    ) {}
  }

  class Uri {
    constructor(readonly fsPath: string) {}

    static file(fsPath: string) {
      return new Uri(fsPath);
    }

    static joinPath(base: Uri, ...segments: string[]) {
      return new Uri(path.join(base.fsPath, ...segments));
    }
  }

  class Location {
    readonly range: Position;

    constructor(
      readonly uri: Uri,
      readonly position: Position,
    ) {
      this.range = position;
    }
  }

  class RelativePattern {
    constructor(
      readonly base: { uri?: Uri } | Uri,
      readonly pattern: string,
    ) {}
  }

  return {
    Location,
    Position,
    RelativePattern,
    Uri,
    languages: {
      registerDefinitionProvider(...args: unknown[]) {
        state.registerDefinitionProviderCalls.push(args);
        state.registeredProvider = args[1] as { invalidateCache(): void };
        return {
          dispose() {},
        };
      },
    },
    workspace: {
      fs: {
        async readFile(uri: Uri) {
          const contents = state.fileContents.get(uri.fsPath);
          if (contents === undefined) {
            throw new Error(`ENOENT: ${uri.fsPath}`);
          }

          return Buffer.from(contents);
        },
        async stat(uri: Uri) {
          if (!state.stats.has(uri.fsPath)) {
            throw new Error(`ENOENT: ${uri.fsPath}`);
          }

          return {};
        },
      },
      findFiles: async (...args: unknown[]) => {
        state.findFilesCalls.push(args);
        return state.findFilesHandler(...args);
      },
      getConfiguration(section: string) {
        return {
          get<T>(key: string, fallback: T): T {
            return (state.config.get(`${section}.${key}`) ?? fallback) as T;
          },
        };
      },
      onDidChangeConfiguration(callback: () => void) {
        state.onDidChangeConfigurationHandlers.push(callback);
        return {
          dispose() {},
        };
      },
      onDidChangeTextDocument(
        callback: (event: { document: { getText(): string } }) => void,
      ) {
        state.onDidChangeTextDocumentHandlers.push(callback);
        return {
          dispose() {},
        };
      },
      get workspaceFolders() {
        return state.workspaceFolders;
      },
    },
  };
});

let vscode: typeof import("vscode");
let scanForTranslationConfig: typeof import("../../src/config-scanner.js").scanForTranslationConfig;
let invalidateConfigCache: typeof import("../../src/config-scanner.js").invalidateConfigCache;
let BetterTranslateDefinitionProvider: typeof import("../../src/definition-provider.js").BetterTranslateDefinitionProvider;
let activate: typeof import("../../src/extension.js").activate;
let deactivate: typeof import("../../src/extension.js").deactivate;
let extractKeyAtPosition: typeof import("../../src/key-extractor.js").extractKeyAtPosition;
let findLocaleFile: typeof import("../../src/locale-file-finder.js").findLocaleFile;
let findKeyInJson: typeof import("../../src/key-locator.js").findKeyInJson;
let findKeyInTypeScript: typeof import("../../src/key-locator.js").findKeyInTypeScript;
let getSettings: typeof import("../../src/settings.js").getSettings;

beforeAll(async () => {
  vscode = await import("vscode");
  ({ scanForTranslationConfig, invalidateConfigCache } = await import(
    "../../src/config-scanner.js"
  ));
  ({ BetterTranslateDefinitionProvider } = await import(
    "../../src/definition-provider.js"
  ));
  ({ activate, deactivate } = await import("../../src/extension.js"));
  ({ extractKeyAtPosition } = await import("../../src/key-extractor.js"));
  ({ findLocaleFile } = await import("../../src/locale-file-finder.js"));
  ({ findKeyInJson, findKeyInTypeScript } = await import(
    "../../src/key-locator.js"
  ));
  ({ getSettings } = await import("../../src/settings.js"));
});

function resetMockState() {
  state.config.clear();
  state.fileContents.clear();
  state.findFilesCalls.length = 0;
  state.findFilesHandler = async () => [];
  state.onDidChangeConfigurationHandlers.length = 0;
  state.onDidChangeTextDocumentHandlers.length = 0;
  state.registerDefinitionProviderCalls.length = 0;
  state.registeredProvider = null;
  state.stats.clear();
  state.workspaceFolders = [];
}

beforeEach(() => {
  resetMockState();
  invalidateConfigCache();
});

describe("@better-translate/vscode", () => {
  it("extracts translation keys at the cursor position", () => {
    expect(extractKeyAtPosition(`const label = t("home.title");`, 22)).toEqual({
      key: "home.title",
    });
    expect(
      extractKeyAtPosition(`translator.t('home.title')`, 20, ["t"]),
    ).toEqual({
      key: "home.title",
    });
    expect(
      extractKeyAtPosition("const label = t(`home.title`);", 20),
    ).toBeNull();
    expect(
      extractKeyAtPosition('const label = format("home.title");', 25),
    ).toBeNull();
  });

  it("finds key positions in JSON and TypeScript locale files", () => {
    expect(
      findKeyInJson(
        '{\n  "home": {\n    "title": "Hello"\n  }\n}\n',
        "home.title",
      ),
    ).toEqual(new vscode.Position(2, 4));
    expect(
      findKeyInTypeScript(
        "export default {\n  home: {\n    readonly title: 'Hello',\n  },\n};\n",
        "home.title",
      ),
    ).toEqual(new vscode.Position(2, 13));
    expect(findKeyInJson('{\n  "home": {}\n}\n', "home.title")).toBeNull();
    expect(
      findKeyInTypeScript("export default {};\n", "home.title"),
    ).toBeNull();
  });

  it("scans workspace files for translation config and caches the result", async () => {
    const workspaceUri = vscode.Uri.file("/workspace");
    const appUri = vscode.Uri.file("/workspace/app.ts");
    const otherUri = vscode.Uri.file("/workspace/constants.ts");
    state.workspaceFolders = [{ uri: workspaceUri }];
    state.fileContents.set(
      appUri.fsPath,
      `configureTranslations({ defaultLocale: "es", messages: { es } });`,
    );
    state.fileContents.set(
      otherUri.fsPath,
      `export const DEFAULT_LOCALE = "en" as const;`,
    );
    state.findFilesHandler = async () => [appUri, otherUri];

    await expect(
      scanForTranslationConfig(state.workspaceFolders),
    ).resolves.toEqual({
      defaultLocale: "es",
    });
    await expect(
      scanForTranslationConfig(state.workspaceFolders),
    ).resolves.toEqual({
      defaultLocale: "es",
    });
    expect(state.findFilesCalls).toHaveLength(1);

    invalidateConfigCache();
    state.fileContents.set(
      appUri.fsPath,
      "export const fallbackLocale = locale;",
    );
    await expect(
      scanForTranslationConfig(state.workspaceFolders),
    ).resolves.toEqual({
      defaultLocale: "en",
    });
  });

  it("finds locale files from overrides or workspace globs", async () => {
    const workspaceUri = vscode.Uri.file("/workspace");
    const overrideUri = vscode.Uri.file("/workspace/custom/en.json");
    const detectedUri = vscode.Uri.file("/workspace/src/locales/en.ts");
    state.workspaceFolders = [{ uri: workspaceUri }];
    state.stats.add(overrideUri.fsPath);

    await expect(
      findLocaleFile(state.workspaceFolders, "en", "custom"),
    ).resolves.toEqual(overrideUri);

    state.stats.clear();
    state.findFilesHandler = async (pattern) =>
      pattern === "**/locales/en.json" ? [] : [detectedUri];

    await expect(findLocaleFile(state.workspaceFolders, "en")).resolves.toEqual(
      detectedUri,
    );
  });

  it("reads extension settings from vscode configuration", () => {
    state.config.set("betterTranslate.defaultLocale", "es");
    state.config.set("betterTranslate.localesDir", "custom-locales");
    state.config.set("betterTranslate.translatorFunctionNames", [
      "t",
      "translate",
    ]);

    expect(getSettings()).toEqual({
      defaultLocale: "es",
      localesDir: "custom-locales",
      translatorFunctionNames: ["t", "translate"],
    });
  });

  it("resolves definitions from translation calls into locale files", async () => {
    const workspaceUri = vscode.Uri.file("/workspace");
    const localeUri = vscode.Uri.file("/workspace/locales/en.json");
    state.workspaceFolders = [{ uri: workspaceUri }];
    state.config.set("betterTranslate.defaultLocale", "en");
    state.config.set("betterTranslate.localesDir", "locales");
    state.stats.add(localeUri.fsPath);
    state.fileContents.set(
      localeUri.fsPath,
      '{\n  "home": {\n    "title": "Hello"\n  }\n}\n',
    );

    const provider = new BetterTranslateDefinitionProvider();
    const definition = await provider.provideDefinition(
      {
        lineAt() {
          return {
            text: `const title = t("home.title");`,
          };
        },
      } as never,
      new vscode.Position(0, 23),
      {} as never,
    );

    expect(definition).toEqual(
      new vscode.Location(localeUri, new vscode.Position(2, 4)),
    );
  });

  it("returns null when definition prerequisites are missing", async () => {
    const provider = new BetterTranslateDefinitionProvider();

    await expect(
      provider.provideDefinition(
        {
          lineAt() {
            return {
              text: `const title = format("home.title");`,
            };
          },
        } as never,
        new vscode.Position(0, 30),
        {} as never,
      ),
    ).resolves.toBeNull();
  });

  it("registers activation hooks and invalidates caches on events", () => {
    const context = {
      subscriptions: [] as unknown[],
    };
    let invalidations = 0;

    activate(context as never);
    expect(state.registerDefinitionProviderCalls).toHaveLength(1);
    expect(context.subscriptions).toHaveLength(3);

    if (state.registeredProvider) {
      state.registeredProvider.invalidateCache = () => {
        invalidations += 1;
      };
    }

    state.onDidChangeConfigurationHandlers[0]?.();
    state.onDidChangeTextDocumentHandlers[0]?.({
      document: {
        getText() {
          return "configureTranslations({})";
        },
      },
    });
    state.onDidChangeTextDocumentHandlers[0]?.({
      document: {
        getText() {
          return "const value = 1;";
        },
      },
    });

    expect(invalidations).toBe(2);
    expect(deactivate()).toBeUndefined();
  });
});
