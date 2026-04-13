import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "bun:test";

import { loadCliConfig } from "../../src/config-loader.js";
import { extractProject } from "../../src/extract.js";
import { generateProject } from "../../src/generate.js";
import { purgeProject } from "../../src/purge.js";

const tempDirectories: string[] = [];
const configModuleUrl = pathToFileURL(
  path.join(process.cwd(), "src/config.ts"),
).href;

async function createWorkspace(): Promise<string> {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "better-translate-cli-"),
  );
  tempDirectories.push(directory);
  return directory;
}

function directModelConfig(
  provider = "moonshotai",
  modelId = "kimi-k2-0905-preview",
): string {
  return `({
  specificationVersion: "v3",
  provider: ${JSON.stringify(provider)},
  modelId: ${JSON.stringify(modelId)},
  supportedUrls: {},
  async doGenerate() {
    throw new Error("not implemented");
  },
  async doStream() {
    throw new Error("not implemented");
  },
})`;
}

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      rm(directory, {
        force: true,
        recursive: true,
      }),
    ),
  );
});

describe("loadCliConfig", () => {
  it("loads env files before importing the config", async () => {
    const workspace = await createWorkspace();

    await writeFile(
      path.join(workspace, ".env"),
      "BT_LOCALES=es,ar\nTEST_GATEWAY_KEY=test-gateway-key\n",
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: process.env.TEST_GATEWAY_KEY!,
  },
  sourceLocale: "en",
  locales: process.env.BT_LOCALES!.split(","),
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );
    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({ greeting: "Hello" }, null, 2),
      "utf8",
    );

    const loaded = await loadCliConfig({
      cwd: workspace,
    });

    expect(loaded.config.locales).toEqual(["es", "ar"]);
    expect(loaded.config.messages.entry).toBe(
      path.join(workspace, "messages/en.json"),
    );
  });

  it("loads env files from the config directory when the config is nested", async () => {
    const workspace = await createWorkspace();
    const appDirectory = path.join(workspace, "apps/site");

    await mkdir(path.join(appDirectory, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(appDirectory, ".env"),
      "AI_GATEWAY_KEY=nested-gateway-key\n",
      "utf8",
    );
    await writeFile(
      path.join(appDirectory, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: process.env.AI_GATEWAY_KEY!,
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );
    await writeFile(
      path.join(appDirectory, "messages/en.json"),
      JSON.stringify({ greeting: "Hello" }, null, 2),
      "utf8",
    );

    const loaded = await loadCliConfig({
      configPath: "./apps/site/better-translate.config.ts",
      cwd: workspace,
    });

    expect(loaded.config.gateway.apiKey).toBe("nested-gateway-key");
  });

  it("loads direct model config built with an AI SDK language model", async () => {
    const workspace = await createWorkspace();

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `import { defineConfig } from ${JSON.stringify(configModuleUrl)};

export default defineConfig({
  sourceLocale: "en",
  locales: ["es"],
  model: ${directModelConfig()},
  providerOptions: {
    ollama: {
      think: true,
    },
  },
  messages: {
    entry: "./messages/en.json",
  },
});`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({ greeting: "Hello" }, null, 2),
      "utf8",
    );

    const loaded = await loadCliConfig({
      cwd: workspace,
    });

    expect("gateway" in loaded.config).toBe(false);
    expect(loaded.config.model.provider).toBe("moonshotai");
    expect(loaded.config.model.modelId).toBe("kimi-k2-0905-preview");
    expect(loaded.config.providerOptions).toEqual({
      ollama: {
        think: true,
      },
    });
  });

  it("rejects target locales that include the source locale", async () => {
    const workspace = await createWorkspace();

    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: process.env.TEST_GATEWAY_KEY!,
  },
  sourceLocale: "en",
  locales: ["en", "es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    await expect(
      loadCliConfig({
        cwd: workspace,
      }),
    ).rejects.toThrow("Config locales must not include the sourceLocale.");
  });

  it("rejects configs that mix gateway mode with an AI SDK language model", async () => {
    const workspace = await createWorkspace();

    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `import { defineConfig } from ${JSON.stringify(configModuleUrl)};

export default defineConfig({
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: ${directModelConfig("anthropic", "claude-sonnet-4-5")},
  messages: {
    entry: "./messages/en.json",
  },
});`,
      "utf8",
    );

    await expect(
      loadCliConfig({
        cwd: workspace,
      }),
    ).rejects.toThrow(
      "Config must not include gateway when model is an AI SDK language model instance.",
    );
  });

  it("rejects invalid direct model configs missing language model methods", async () => {
    const workspace = await createWorkspace();

    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `import { defineConfig } from ${JSON.stringify(configModuleUrl)};

export default defineConfig({
  sourceLocale: "en",
  locales: ["es"],
  model: {
    specificationVersion: "v3",
    provider: "openai",
    modelId: "gpt-5",
  },
  messages: {
    entry: "./messages/en.json",
  },
});`,
      "utf8",
    );

    await expect(
      loadCliConfig({
        cwd: workspace,
      }),
    ).rejects.toThrow(
      "AI SDK language model instances must provide a doGenerate function.",
    );
  });

  it("rejects string model configs without gateway", async () => {
    const workspace = await createWorkspace();

    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  sourceLocale: "en",
  locales: ["es"],
  model: "openai/gpt-4.1",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    await expect(
      loadCliConfig({
        cwd: workspace,
      }),
    ).rejects.toThrow(
      "Config requires a gateway object when model is a string.",
    );
  });
});

describe("extractProject", () => {
  it("rewrites marked t() calls and syncs source locale JSON", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/components/sidebar/Nav.ts");

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({}, null, 2),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `import { t } from "@better-translate/core";

export function navLabel() {
  return t("Home", { bt: true });
}
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    const infoMessages: string[] = [];
    await extractProject({
      cwd: workspace,
      logger: {
        error() {},
        info(message) {
          infoMessages.push(message);
        },
      },
    });

    expect(
      JSON.parse(
        await readFile(path.join(workspace, "messages/en.json"), "utf8"),
      ),
    ).toEqual({
      sidebar: {
        nav: {
          home: "Home",
        },
      },
    });

    const updatedSource = await readFile(sourcePath, "utf8");
    expect(updatedSource).toContain('return t("sidebar.nav.home");');
    expect(updatedSource).not.toContain("{ bt: true }");
    expect(infoMessages).toContain(`rewrote ${sourcePath}`);
  });

  it("rewrites marked property-access t() calls", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/routes/login.ts");

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({}, null, 2),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export function loginTitle(translator: { t(value: string, options?: { bt?: true }): string }) {
  return translator.t("Welcome back", { bt: true });
}
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    await extractProject({
      cwd: workspace,
      logger: {
        error() {},
        info() {},
      },
    });

    expect(
      JSON.parse(
        await readFile(path.join(workspace, "messages/en.json"), "utf8"),
      ),
    ).toEqual({
      login: {
        welcomeBack: "Welcome back",
      },
    });

    const updatedSource = await readFile(sourcePath, "utf8");
    expect(updatedSource).toContain(
      'return translator.t("login.welcomeBack");',
    );
    expect(updatedSource).not.toContain("{ bt: true }");
  });

  it("preserves params while removing only the bt marker", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/components/hero-section.ts");

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({}, null, 2),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export function heroBadge() {
  return t("Same config. Every {language} environment", {
    bt: true,
    params: {
      language: "",
    },
  });
}
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    await extractProject({
      cwd: workspace,
      logger: {
        error() {},
        info() {},
      },
    });

    expect(
      JSON.parse(
        await readFile(path.join(workspace, "messages/en.json"), "utf8"),
      ),
    ).toEqual({
      heroSection: {
        sameConfigEveryLanguageEnvironment:
          "Same config. Every {language} environment",
      },
    });

    const updatedSource = await readFile(sourcePath, "utf8");
    expect(updatedSource).toContain(
      't("heroSection.sameConfigEveryLanguageEnvironment", {',
    );
    expect(updatedSource).toContain("params:");
    expect(updatedSource).toContain('language: ""');
    expect(updatedSource).not.toContain("bt: true");
  });

  it("preserves other options when removing the bt marker", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/components/sidebar/Nav.ts");

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({}, null, 2),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export function navLabel() {
  return t("Home", { bt: true, locale: "es" });
}
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    await extractProject({
      cwd: workspace,
      logger: {
        error() {},
        info() {},
      },
    });

    const updatedSource = await readFile(sourcePath, "utf8");
    expect(updatedSource).toContain(
      'return t("sidebar.nav.home", { locale: "es" });',
    );
    expect(updatedSource).not.toContain("bt: true");
  });

  it("ignores unmarked t() calls", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/components/sidebar/Nav.ts");

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({}, null, 2),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export function navLabel() {
  return t("sidebar.nav.home");
}
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    const result = await extractProject({
      cwd: workspace,
      logger: {
        error() {},
        info() {},
      },
    });

    expect(result.filePaths).toEqual([]);
    expect(result.updatedMessages).toEqual([]);
    expect(await readFile(sourcePath, "utf8")).toContain(
      'return t("sidebar.nav.home");',
    );
  });

  it("warns and skips duplicate strings in the same file", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/components/sidebar/Nav.ts");
    const messages: string[] = [];

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({}, null, 2),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export function labels() {
  return [t("Home", { bt: true }), t("Home", { bt: true })];
}
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    await extractProject({
      cwd: workspace,
      logger: {
        error(message) {
          messages.push(message);
        },
        info(message) {
          messages.push(message);
        },
      },
    });

    expect(
      JSON.parse(
        await readFile(path.join(workspace, "messages/en.json"), "utf8"),
      ),
    ).toEqual({});
    expect(await readFile(sourcePath, "utf8")).toContain("{ bt: true }");
    expect(
      messages.some((message) =>
        message.includes("same string appears more than once in the file"),
      ),
    ).toBe(true);
  });

  it("truncates generated keys based on --max-length", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/routes/checkout.ts");
    const messages: string[] = [];
    const longText = "This string is definitely longer than forty characters.";

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({}, null, 2),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export const checkoutLabel = () => t(${JSON.stringify(longText)}, { bt: true });
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    await extractProject({
      cwd: workspace,
      logger: {
        error() {},
        info(message) {
          messages.push(message);
        },
      },
      maxLength: 20,
    });

    expect(
      JSON.parse(
        await readFile(path.join(workspace, "messages/en.json"), "utf8"),
      ),
    ).toEqual({
      checkout: {
        thisStringIsDefinite: longText,
      },
    });
    expect(await readFile(sourcePath, "utf8")).toContain(
      't("checkout.thisStringIsDefinite")',
    );
    expect(
      messages.some((message) => message.includes("longer than --max-length")),
    ).toBe(false);
  });

  it("warns and skips existing key conflicts", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/components/sidebar/Nav.ts");
    const messages: string[] = [];

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify(
        {
          sidebar: {
            nav: {
              home: "Dashboard",
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export function navLabel() {
  return t("Home", { bt: true });
}
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    await extractProject({
      cwd: workspace,
      logger: {
        error(message) {
          messages.push(message);
        },
        info(message) {
          messages.push(message);
        },
      },
    });

    expect(
      JSON.parse(
        await readFile(path.join(workspace, "messages/en.json"), "utf8"),
      ),
    ).toEqual({
      sidebar: {
        nav: {
          home: "Dashboard",
        },
      },
    });
    expect(await readFile(sourcePath, "utf8")).toContain("{ bt: true }");
    expect(
      messages.some((message) =>
        message.includes("already exists with a different value"),
      ),
    ).toBe(true);
  });

  it("supports dry-run without mutating files", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/components/sidebar/Nav.ts");
    const originalSource = `import { t } from "@better-translate/core";

export function navLabel() {
  return t("Home", { bt: true });
}
`;

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({}, null, 2),
      "utf8",
    );
    await writeFile(sourcePath, originalSource, "utf8");
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    const result = await extractProject({
      cwd: workspace,
      dryRun: true,
      logger: {
        error() {},
        info() {},
      },
    });

    expect(result.dryRun).toBe(true);
    expect(result.updatedMessages).toEqual(["sidebar.nav.home"]);
    expect(await readFile(sourcePath, "utf8")).toBe(originalSource);
    expect(
      JSON.parse(
        await readFile(path.join(workspace, "messages/en.json"), "utf8"),
      ),
    ).toEqual({});
  });

  it("supports ts source message entries from config", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/components/sidebar/Nav.ts");

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      sourcePath,
      `export function navLabel() {
  return t("Home", { bt: true });
}
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "messages/en.ts"),
      `// generated by @better-translate/cli\nexport const en = {
  greeting: "Hello",
} as const;

export default en;
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.ts",
  },
};`,
      "utf8",
    );

    await extractProject({
      cwd: workspace,
      logger: {
        error() {},
        info() {},
      },
    });

    const updatedMessages = await readFile(
      path.join(workspace, "messages/en.ts"),
      "utf8",
    );

    expect(updatedMessages).toContain("export const en = {");
    expect(updatedMessages).toContain('greeting: "Hello"');
    expect(updatedMessages).toContain("sidebar: {");
    expect(updatedMessages).toContain('home: "Home"');
    expect(updatedMessages).toContain("export default en;");
  });
});

describe("purgeProject", () => {
  it("prompts for each unused key and removes confirmed keys from every locale file", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/app/login.ts");
    const enPath = path.join(workspace, "messages/en.json");
    const esPath = path.join(workspace, "messages/es.json");
    const prompts: string[] = [];
    const messages: string[] = [];

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.dirname(enPath), {
      recursive: true,
    });
    await writeFile(
      enPath,
      JSON.stringify(
        {
          auth: {
            login: {
              deprecatedHint: "Use your new workspace password",
              title: "Welcome back",
            },
          },
          onboarding: {
            step2: {
              currentCta: "Continue",
              oldCta: "Start now",
            },
          },
          sidebar: {
            nav: {
              home: "Home",
              legacy: "Legacy",
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      esPath,
      JSON.stringify(
        {
          auth: {
            login: {
              deprecatedHint: "Usa tu nueva contrasena del espacio de trabajo",
              title: "Bienvenido de nuevo",
            },
          },
          marketing: {
            extraCopy: "Texto antiguo",
          },
          onboarding: {
            step2: {
              currentCta: "Continuar",
              oldCta: "Empieza ahora",
            },
          },
          sidebar: {
            nav: {
              home: "Inicio",
              legacy: "Legado",
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export function screen(t: (key: string) => string) {
  return [
    t("auth.login.title"),
    t("onboarding.step2.currentCta"),
    t("sidebar.nav.home"),
  ];
}
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    const result = await purgeProject({
      confirmPurgeKey: async ({ key }) => {
        prompts.push(key);
        return (
          key === "auth.login.deprecatedHint" ||
          key === "marketing.extraCopy" ||
          key === "sidebar.nav.legacy"
        );
      },
      cwd: workspace,
      logger: {
        error() {},
        info(message) {
          messages.push(message);
        },
      },
    });

    expect(prompts).toEqual([
      "auth.login.deprecatedHint",
      "marketing.extraCopy",
      "onboarding.step2.oldCta",
      "sidebar.nav.legacy",
    ]);
    expect(result.unusedKeys).toEqual(prompts);
    expect(result.purgedKeys).toEqual([
      "auth.login.deprecatedHint",
      "marketing.extraCopy",
      "sidebar.nav.legacy",
    ]);
    expect(result.unsafeKeys).toEqual([]);
    expect(result.keptKeys).toEqual(["onboarding.step2.oldCta"]);
    expect(result.localeChanges).toEqual([
      {
        locale: "en",
        removedKeys: ["auth.login.deprecatedHint", "sidebar.nav.legacy"],
        targetPath: enPath,
      },
      {
        locale: "es",
        removedKeys: [
          "auth.login.deprecatedHint",
          "marketing.extraCopy",
          "sidebar.nav.legacy",
        ],
        targetPath: esPath,
      },
    ]);
    expect(JSON.parse(await readFile(enPath, "utf8"))).toEqual({
      auth: {
        login: {
          title: "Welcome back",
        },
      },
      onboarding: {
        step2: {
          currentCta: "Continue",
          oldCta: "Start now",
        },
      },
      sidebar: {
        nav: {
          home: "Home",
        },
      },
    });
    expect(JSON.parse(await readFile(esPath, "utf8"))).toEqual({
      auth: {
        login: {
          title: "Bienvenido de nuevo",
        },
      },
      onboarding: {
        step2: {
          currentCta: "Continuar",
          oldCta: "Empieza ahora",
        },
      },
      sidebar: {
        nav: {
          home: "Inicio",
        },
      },
    });
    expect(
      messages.some((message) =>
        message.includes(`updated locale en ${enPath} (-2 keys)`),
      ),
    ).toBe(true);
    expect(
      messages.some((message) =>
        message.includes(`updated locale es ${esPath} (-3 keys)`),
      ),
    ).toBe(true);
    expect(messages).toContain("Kept onboarding.step2.oldCta");
    expect(messages).toContain("Done. 3 keys purged, 1 kept, 0 unsafe.");
  });

  it("warns on dynamic keys and protects matching prefixes from purge candidates", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/app/nav.ts");
    const enPath = path.join(workspace, "messages/en.json");
    const esPath = path.join(workspace, "messages/es.json");
    const messages: string[] = [];

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.dirname(enPath), {
      recursive: true,
    });
    await writeFile(
      enPath,
      JSON.stringify(
        {
          auth: {
            login: {
              title: "Welcome back",
            },
          },
          sidebar: {
            nav: {
              home: "Home",
              legacy: "Legacy",
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      esPath,
      JSON.stringify(
        {
          auth: {
            login: {
              title: "Bienvenido de nuevo",
            },
          },
          sidebar: {
            nav: {
              home: "Inicio",
              legacy: "Legado",
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export function nav(
  t: (key: string) => string,
  page: string,
) {
  return [t("auth.login.title"), t(\`sidebar.nav.\${page}\`)];
}
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    const result = await purgeProject({
      confirmPurgeKey: async () => {
        throw new Error(
          "should not prompt when every key is used or protected",
        );
      },
      cwd: workspace,
      logger: {
        error() {},
        info(message) {
          messages.push(message);
        },
      },
    });

    expect(result.unusedKeys).toEqual([]);
    expect(result.protectedKeys).toEqual([
      "sidebar.nav.home",
      "sidebar.nav.legacy",
    ]);
    expect(result.unsafeKeys).toEqual([]);
    expect(
      result.warnings.some((warning) =>
        warning.includes(
          'dynamic t() key cannot be statically analyzed; protecting locale keys that start with "sidebar.nav.".',
        ),
      ),
    ).toBe(true);
    expect(messages).toContain("No unused translation keys found.");
    expect(messages).toContain("Done. 0 keys purged, 0 kept, 0 unsafe.");
  });

  it("supports --yes for generated TypeScript locale files", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/app/home.ts");
    const enPath = path.join(workspace, "messages/en.ts");
    const esPath = path.join(workspace, "messages/es.ts");

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.dirname(enPath), {
      recursive: true,
    });
    await writeFile(
      enPath,
      `// generated by @better-translate/cli
export const en = {
  home: {
    old: "Old copy",
    title: "Home",
  },
} as const;

export default en;
`,
      "utf8",
    );
    await writeFile(
      esPath,
      `// generated by @better-translate/cli
export const es = {
  home: {
    old: "Texto viejo",
    title: "Inicio",
  },
} as const;

export default es;
`,
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export const homeTitle = (t: (key: string) => string) => t("home.title");
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.ts",
  },
};`,
      "utf8",
    );

    const result = await purgeProject({
      cwd: workspace,
      logger: {
        error() {},
        info() {},
      },
      yes: true,
    });

    expect(result.purgedKeys).toEqual(["home.old"]);
    expect(result.unsafeKeys).toEqual([]);
    const enText = await readFile(enPath, "utf8");
    const esText = await readFile(esPath, "utf8");
    expect(enText).toContain('title: "Home"');
    expect(enText).not.toContain('old: "Old copy"');
    expect(esText).toContain('title: "Inicio"');
    expect(esText).not.toContain('old: "Texto viejo"');
  });

  it("fails fast when the configured source locale file is missing", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/app/home.ts");
    const esPath = path.join(workspace, "messages/es.json");

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.dirname(esPath), {
      recursive: true,
    });
    await writeFile(
      esPath,
      JSON.stringify(
        {
          home: {
            title: "Inicio",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export const homeTitle = (t: (key: string) => string) => t("home.title");
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    await expect(
      purgeProject({
        cwd: workspace,
        logger: {
          error() {},
          info() {},
        },
      }),
    ).rejects.toThrow(
      `Configured source locale file "en" was not found at ${path.join(workspace, "messages/en.json")}.`,
    );
  });

  it("refuses --yes when dynamic t() usages are present and there are unused keys", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/app/nav.ts");
    const enPath = path.join(workspace, "messages/en.json");
    const esPath = path.join(workspace, "messages/es.json");

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.dirname(enPath), {
      recursive: true,
    });
    await writeFile(
      enPath,
      JSON.stringify(
        {
          auth: {
            login: {
              title: "Welcome back",
            },
          },
          footer: {
            legacy: "Old footer",
          },
          sidebar: {
            nav: {
              home: "Home",
              legacy: "Legacy",
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      esPath,
      JSON.stringify(
        {
          auth: {
            login: {
              title: "Bienvenido de nuevo",
            },
          },
          footer: {
            legacy: "Pie antiguo",
          },
          sidebar: {
            nav: {
              home: "Inicio",
              legacy: "Legado",
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export function nav(
  t: (key: string) => string,
  page: string,
) {
  return [t("auth.login.title"), t(\`sidebar.nav.\${page}\`)];
}
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    await expect(
      purgeProject({
        cwd: workspace,
        logger: {
          error() {},
          info() {},
        },
        yes: true,
      }),
    ).rejects.toThrow(
      'Cannot run "bt purge --yes" when dynamic t() usages were found. Rerun without --yes and review each unused key interactively.',
    );
  });

  it("marks exact string references outside t() as unsafe and skips them", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/app/home.ts");
    const catalogPath = path.join(workspace, "src/lib/catalog.ts");
    const enPath = path.join(workspace, "messages/en.json");
    const esPath = path.join(workspace, "messages/es.json");
    const prompts: string[] = [];
    const messages: string[] = [];

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.dirname(catalogPath), {
      recursive: true,
    });
    await mkdir(path.dirname(enPath), {
      recursive: true,
    });
    await writeFile(
      enPath,
      JSON.stringify(
        {
          frameworks: {
            items: {
              astro: {
                description: "Astro description",
              },
              bun: {
                description: "Bun description",
              },
            },
          },
          home: {
            title: "Home",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      esPath,
      JSON.stringify(
        {
          frameworks: {
            items: {
              astro: {
                description: "Descripcion Astro",
              },
              bun: {
                description: "Descripcion Bun",
              },
            },
          },
          home: {
            title: "Inicio",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export const homeTitle = (t: (key: string) => string) => t("home.title");
`,
      "utf8",
    );
    await writeFile(
      catalogPath,
      `export const catalog = [
  {
    descriptionKey: "frameworks.items.astro.description",
  },
];
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    const result = await purgeProject({
      confirmPurgeKey: async ({ key }) => {
        prompts.push(key);
        return true;
      },
      cwd: workspace,
      logger: {
        error() {},
        info(message) {
          messages.push(message);
        },
      },
    });

    expect(prompts).toEqual(["frameworks.items.bun.description"]);
    expect(result.unsafeKeys).toEqual(["frameworks.items.astro.description"]);
    expect(result.unusedKeys).toEqual(["frameworks.items.bun.description"]);
    expect(result.purgedKeys).toEqual(["frameworks.items.bun.description"]);
    expect(
      result.warnings.some((warning) =>
        warning.includes(
          `key "frameworks.items.astro.description" appears outside a static t("...") call in ${catalogPath}; marking it as unsafe and skipping purge.`,
        ),
      ),
    ).toBe(true);
    expect(messages).toContain(
      `warn key "frameworks.items.astro.description" appears outside a static t("...") call in ${catalogPath}; marking it as unsafe and skipping purge.`,
    );
    expect(JSON.parse(await readFile(enPath, "utf8"))).toEqual({
      frameworks: {
        items: {
          astro: {
            description: "Astro description",
          },
        },
      },
      home: {
        title: "Home",
      },
    });
    expect(JSON.parse(await readFile(esPath, "utf8"))).toEqual({
      frameworks: {
        items: {
          astro: {
            description: "Descripcion Astro",
          },
        },
      },
      home: {
        title: "Inicio",
      },
    });
    expect(messages).toContain("Done. 1 key purged, 0 kept, 1 unsafe.");
  });

  it("does not treat substring matches as unsafe references", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/app/home.ts");
    const helperPath = path.join(workspace, "src/lib/keys.ts");
    const enPath = path.join(workspace, "messages/en.json");
    const esPath = path.join(workspace, "messages/es.json");
    const prompts: string[] = [];

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.dirname(helperPath), {
      recursive: true,
    });
    await mkdir(path.dirname(enPath), {
      recursive: true,
    });
    await writeFile(
      enPath,
      JSON.stringify(
        {
          home: {
            title: "Home",
          },
          marketing: {
            hero: "Hero",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      esPath,
      JSON.stringify(
        {
          home: {
            title: "Inicio",
          },
          marketing: {
            hero: "Hero es",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export const homeTitle = (t: (key: string) => string) => t("home.title");
`,
      "utf8",
    );
    await writeFile(
      helperPath,
      `export const nestedKey = "marketing.hero.banner";
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    const result = await purgeProject({
      confirmPurgeKey: async ({ key }) => {
        prompts.push(key);
        return true;
      },
      cwd: workspace,
      logger: {
        error() {},
        info() {},
      },
    });

    expect(prompts).toEqual(["marketing.hero"]);
    expect(result.unsafeKeys).toEqual([]);
    expect(result.purgedKeys).toEqual(["marketing.hero"]);
  });

  it("ignores .d.ts files when searching for translation usage", async () => {
    const workspace = await createWorkspace();
    const sourcePath = path.join(workspace, "src/app/home.ts");
    const declarationPath = path.join(workspace, "src/types/messages.d.ts");
    const enPath = path.join(workspace, "messages/en.json");
    const esPath = path.join(workspace, "messages/es.json");
    const prompts: string[] = [];

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await mkdir(path.dirname(declarationPath), {
      recursive: true,
    });
    await mkdir(path.dirname(enPath), {
      recursive: true,
    });
    await writeFile(
      enPath,
      JSON.stringify(
        {
          home: {
            title: "Home",
          },
          marketing: {
            hero: "Hero",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      esPath,
      JSON.stringify(
        {
          home: {
            title: "Inicio",
          },
          marketing: {
            hero: "Hero es",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      sourcePath,
      `export const homeTitle = (t: (key: string) => string) => t("home.title");
`,
      "utf8",
    );
    await writeFile(
      declarationPath,
      `export type KnownKey = "marketing.hero";
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    const result = await purgeProject({
      confirmPurgeKey: async ({ key }) => {
        prompts.push(key);
        return true;
      },
      cwd: workspace,
      logger: {
        error() {},
        info() {},
      },
    });

    expect(prompts).toEqual(["marketing.hero"]);
    expect(result.unsafeKeys).toEqual([]);
    expect(result.purgedKeys).toEqual(["marketing.hero"]);
  });
});

describe("generateProject", () => {
  it("fails early when the configured gateway env var is missing", async () => {
    const workspace = await createWorkspace();

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({ greeting: "Hello" }, null, 2),
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: process.env.MISSING_GATEWAY_KEY ?? "",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    await expect(
      generateProject({
        cwd: workspace,
        logger: {
          error() {},
          info() {},
        },
      }),
    ).rejects.toThrow(
      "Config requires gateway.apiKey with the AI Gateway key string.",
    );
  });

  it("generates sibling json and markdown files", async () => {
    const workspace = await createWorkspace();

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "docs/en/guides"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify(
        {
          home: {
            title: "Hello",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      path.join(workspace, "docs/en/guides/intro.md"),
      `---
title: Intro
order: 1
---

# Welcome

This is the intro.
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
  markdown: {
    rootDir: "./docs/en",
  },
};`,
      "utf8",
    );

    await generateProject({
      cwd: workspace,
      async generator(request) {
        if (request.kind === "messages") {
          return {
            home: {
              title: "Hola",
            },
          };
        }

        return {
          body: "# Bienvenido\n\nEste es el intro.\n",
          frontmatter: {
            title: "Introduccion",
          },
        };
      },
      logger: {
        error() {},
        info() {},
      },
      yes: true,
    });

    expect(
      JSON.parse(
        await readFile(path.join(workspace, "messages/es.json"), "utf8"),
      ),
    ).toEqual({
      home: {
        title: "Hola",
      },
    });

    const markdown = await readFile(
      path.join(workspace, "docs/es/guides/intro.md"),
      "utf8",
    );

    expect(markdown).toContain("title: Introduccion");
    expect(markdown).toContain("# Bienvenido");
  });

  it("supports ts source files and dry-run mode", async () => {
    const workspace = await createWorkspace();

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.ts"),
      `const en = {
  greeting: "Hello",
} as const;

export default en;
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.ts",
  },
};`,
      "utf8",
    );

    await generateProject({
      cwd: workspace,
      dryRun: true,
      async generator() {
        return {
          greeting: "Hola",
        };
      },
      logger: {
        error() {},
        info() {},
      },
    });

    expect(
      await Bun.file(path.join(workspace, "messages/es.ts")).exists(),
    ).toBe(false);
  });

  it("prompts once before markdown generation and classifies planned writes", async () => {
    const workspace = await createWorkspace();
    let confirmationCalls = 0;
    let confirmationRequest:
      | {
          createCount: number;
          overwriteCount: number;
          writes: readonly {
            action: "create" | "overwrite";
            locale: string;
            sourcePath: string;
            targetPath: string;
          }[];
        }
      | undefined;

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "docs/en/guides"), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "docs/es/guides"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify(
        {
          greeting: "Hello",
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      path.join(workspace, "docs/en/guides/intro.md"),
      `---
title: Intro
---

# Welcome
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "docs/es/guides/intro.md"),
      `---
title: Viejo
---

# Antiguo
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es", "fr"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
  markdown: {
    rootDir: "./docs/en",
  },
};`,
      "utf8",
    );

    await generateProject({
      confirmMarkdownWrites: async (request) => {
        confirmationCalls += 1;
        confirmationRequest = request;
        return true;
      },
      cwd: workspace,
      async generator(request) {
        expect(confirmationCalls).toBe(1);

        if (request.kind === "messages") {
          return {
            greeting: request.targetLocale === "es" ? "Hola" : "Bonjour",
          };
        }

        return {
          body:
            request.targetLocale === "es" ? "# Bienvenido\n" : "# Bienvenue\n",
          frontmatter: {
            title:
              request.targetLocale === "es" ? "Introduccion" : "Introduction",
          },
        };
      },
      logger: {
        error() {},
        info() {},
      },
    });

    expect(confirmationCalls).toBe(1);
    expect(confirmationRequest).toMatchObject({
      createCount: 1,
      overwriteCount: 1,
    });
    expect(confirmationRequest?.writes).toEqual([
      {
        action: "overwrite",
        locale: "es",
        sourcePath: path.join(workspace, "docs/en/guides/intro.md"),
        targetPath: path.join(workspace, "docs/es/guides/intro.md"),
      },
      {
        action: "create",
        locale: "fr",
        sourcePath: path.join(workspace, "docs/en/guides/intro.md"),
        targetPath: path.join(workspace, "docs/fr/guides/intro.md"),
      },
    ]);
  });

  it("does not prompt for message-only runs", async () => {
    const workspace = await createWorkspace();
    let confirmationCalls = 0;

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({ greeting: "Hello" }, null, 2),
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
};`,
      "utf8",
    );

    await generateProject({
      confirmMarkdownWrites: async () => {
        confirmationCalls += 1;
        return true;
      },
      cwd: workspace,
      async generator() {
        return {
          greeting: "Hola",
        };
      },
      logger: {
        error() {},
        info() {},
      },
    });

    expect(confirmationCalls).toBe(0);
  });

  it("does not prompt during dry-run markdown generation", async () => {
    const workspace = await createWorkspace();
    let confirmationCalls = 0;

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "docs/en/guides"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({ greeting: "Hello" }, null, 2),
      "utf8",
    );
    await writeFile(
      path.join(workspace, "docs/en/guides/intro.mdx"),
      `---
title: Intro
---

# Welcome
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
  markdown: {
    rootDir: "./docs/en",
  },
};`,
      "utf8",
    );

    await generateProject({
      confirmMarkdownWrites: async () => {
        confirmationCalls += 1;
        return true;
      },
      cwd: workspace,
      dryRun: true,
      async generator(request) {
        if (request.kind === "messages") {
          return {
            greeting: "Hola",
          };
        }

        return {
          body: "# Bienvenido\n",
          frontmatter: {
            title: "Introduccion",
          },
        };
      },
      logger: {
        error() {},
        info() {},
      },
    });

    expect(confirmationCalls).toBe(0);
    expect(
      await Bun.file(path.join(workspace, "docs/es/guides/intro.mdx")).exists(),
    ).toBe(false);
  });

  it("skips markdown confirmation when yes is enabled", async () => {
    const workspace = await createWorkspace();
    let confirmationCalls = 0;

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "docs/en/guides"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({ greeting: "Hello" }, null, 2),
      "utf8",
    );
    await writeFile(
      path.join(workspace, "docs/en/guides/intro.md"),
      `---
title: Intro
---

# Welcome
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
  markdown: {
    rootDir: "./docs/en",
  },
};`,
      "utf8",
    );

    await generateProject({
      confirmMarkdownWrites: async () => {
        confirmationCalls += 1;
        return true;
      },
      cwd: workspace,
      async generator(request) {
        if (request.kind === "messages") {
          return {
            greeting: "Hola",
          };
        }

        return {
          body: "# Bienvenido\n",
          frontmatter: {
            title: "Introduccion",
          },
        };
      },
      logger: {
        error() {},
        info() {},
      },
      yes: true,
    });

    expect(confirmationCalls).toBe(0);
  });

  it("cancels before writing files when markdown confirmation is declined", async () => {
    const workspace = await createWorkspace();
    let generatorCalls = 0;

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "docs/en/guides"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({ greeting: "Hello" }, null, 2),
      "utf8",
    );
    await writeFile(
      path.join(workspace, "docs/en/guides/intro.md"),
      `---
title: Intro
---

# Welcome
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
  markdown: {
    rootDir: "./docs/en",
  },
};`,
      "utf8",
    );

    await expect(
      generateProject({
        confirmMarkdownWrites: async () => false,
        cwd: workspace,
        async generator() {
          generatorCalls += 1;
          return {
            greeting: "Hola",
          };
        },
        logger: {
          error() {},
          info() {},
        },
      }),
    ).rejects.toThrow("Markdown translation cancelled. No files were written.");

    expect(generatorCalls).toBe(0);
    expect(
      await Bun.file(path.join(workspace, "messages/es.json")).exists(),
    ).toBe(false);
    expect(
      await Bun.file(path.join(workspace, "docs/es/guides/intro.md")).exists(),
    ).toBe(false);
  });

  it("aborts without yes and succeeds with yes in non-interactive environments", async () => {
    const workspace = await createWorkspace();
    const stdin = process.stdin as NodeJS.ReadStream & { isTTY?: boolean };
    const stdout = process.stdout as NodeJS.WriteStream & { isTTY?: boolean };
    const originalStdinDescriptor = Object.getOwnPropertyDescriptor(
      stdin,
      "isTTY",
    );
    const originalStdoutDescriptor = Object.getOwnPropertyDescriptor(
      stdout,
      "isTTY",
    );

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "docs/en/guides"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({ greeting: "Hello" }, null, 2),
      "utf8",
    );
    await writeFile(
      path.join(workspace, "docs/en/guides/intro.md"),
      `---
title: Intro
---

# Welcome
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
  markdown: {
    rootDir: "./docs/en",
  },
};`,
      "utf8",
    );

    Object.defineProperty(stdin, "isTTY", {
      configurable: true,
      value: false,
    });
    Object.defineProperty(stdout, "isTTY", {
      configurable: true,
      value: false,
    });

    try {
      await expect(
        generateProject({
          cwd: workspace,
          async generator(request) {
            if (request.kind === "messages") {
              return {
                greeting: "Hola",
              };
            }

            return {
              body: "# Bienvenido\n",
              frontmatter: {
                title: "Introduccion",
              },
            };
          },
          logger: {
            error() {},
            info() {},
          },
        }),
      ).rejects.toThrow(
        "Markdown translation would create or overwrite translated .md/.mdx files in a non-interactive environment. Re-run with --yes to continue.",
      );

      await expect(
        generateProject({
          cwd: workspace,
          async generator(request) {
            if (request.kind === "messages") {
              return {
                greeting: "Hola",
              };
            }

            return {
              body: "# Bienvenido\n",
              frontmatter: {
                title: "Introduccion",
              },
            };
          },
          logger: {
            error() {},
            info() {},
          },
          yes: true,
        }),
      ).resolves.toMatchObject({
        dryRun: false,
      });

      expect(
        JSON.parse(
          await readFile(path.join(workspace, "messages/es.json"), "utf8"),
        ),
      ).toEqual({
        greeting: "Hola",
      });
      expect(
        await readFile(path.join(workspace, "docs/es/guides/intro.md"), "utf8"),
      ).toContain("# Bienvenido");
    } finally {
      if (originalStdinDescriptor) {
        Object.defineProperty(stdin, "isTTY", originalStdinDescriptor);
      } else {
        delete stdin.isTTY;
      }

      if (originalStdoutDescriptor) {
        Object.defineProperty(stdout, "isTTY", originalStdoutDescriptor);
      } else {
        delete stdout.isTTY;
      }
    }
  });

  it("rethrows non-ENOENT access errors while planning markdown writes", async () => {
    const workspace = await createWorkspace();
    let confirmationCalls = 0;
    let generatorCalls = 0;

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "docs/en/guides"), {
      recursive: true,
    });
    await mkdir(path.join(workspace, "docs"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({ greeting: "Hello" }, null, 2),
      "utf8",
    );
    await writeFile(
      path.join(workspace, "docs/en/guides/intro.md"),
      `---
title: Intro
---

# Welcome
`,
      "utf8",
    );
    await writeFile(path.join(workspace, "docs/es"), "not-a-directory", "utf8");
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.json",
  },
  markdown: {
    rootDir: "./docs/en",
  },
};`,
      "utf8",
    );

    await expect(
      generateProject({
        confirmMarkdownWrites: async () => {
          confirmationCalls += 1;
          return true;
        },
        cwd: workspace,
        async generator() {
          generatorCalls += 1;
          return {
            greeting: "Hola",
          };
        },
        logger: {
          error() {},
          info() {},
        },
      }),
    ).rejects.toThrow(/ENOTDIR|not a directory/i);

    expect(confirmationCalls).toBe(0);
    expect(generatorCalls).toBe(0);
  });

  it("overwrites existing files in place", async () => {
    const workspace = await createWorkspace();

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.ts"),
      `export const en = {
  greeting: "Hello",
} as const;
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "messages/es.ts"),
      `export const es = {
  greeting: "Viejo",
} as const;
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `export default {
  gateway: {
    apiKey: "test-gateway-key",
  },
  sourceLocale: "en",
  locales: ["es"],
  model: "anthropic/claude-sonnet-4.5",
  messages: {
    entry: "./messages/en.ts",
  },
};`,
      "utf8",
    );

    await generateProject({
      cwd: workspace,
      async generator() {
        return {
          greeting: "Hola",
        };
      },
      logger: {
        error() {},
        info() {},
      },
    });

    const contents = await readFile(
      path.join(workspace, "messages/es.ts"),
      "utf8",
    );

    expect(contents).toContain('greeting: "Hola"');
    expect(contents).not.toContain('"greeting": "Viejo"');
  });

  it("supports direct model mode and logs the configured provider model", async () => {
    const workspace = await createWorkspace();
    const messages: string[] = [];

    await mkdir(path.join(workspace, "messages"), {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, "messages/en.json"),
      JSON.stringify({ greeting: "Hello" }, null, 2),
      "utf8",
    );
    await writeFile(
      path.join(workspace, "better-translate.config.ts"),
      `import { defineConfig } from ${JSON.stringify(configModuleUrl)};

export default defineConfig({
  sourceLocale: "en",
  locales: ["es"],
  model: ${directModelConfig("anthropic.messages", "claude-sonnet-4-5")},
  messages: {
    entry: "./messages/en.json",
  },
});`,
      "utf8",
    );

    await generateProject({
      cwd: workspace,
      async generator() {
        return {
          greeting: "Hola",
        };
      },
      logger: {
        error() {},
        info(message) {
          messages.push(message);
        },
      },
    });

    expect(
      JSON.parse(
        await readFile(path.join(workspace, "messages/es.json"), "utf8"),
      ),
    ).toEqual({
      greeting: "Hola",
    });
    expect(messages).toContain(
      "Using configured provider model: anthropic.messages/claude-sonnet-4-5",
    );
  });
});
