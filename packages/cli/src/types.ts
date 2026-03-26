import type { LanguageModelV3 } from "@ai-sdk/provider";

export type MarkdownExtension = ".md" | ".mdx";

export type CliLanguageModel = LanguageModelV3;

interface BetterTranslateCliConfigBase {
  locales: string[];
  markdown?: {
    extensions?: readonly MarkdownExtension[];
    rootDir: string;
  };
  messages: {
    entry: string;
  };
  sourceLocale: string;
}

export interface BetterTranslateCliGatewayConfig
  extends BetterTranslateCliConfigBase {
  gateway: {
    apiKey: string;
  };
  model: string;
}

export interface BetterTranslateCliDirectModelConfig
  extends BetterTranslateCliConfigBase {
  gateway?: never;
  model: CliLanguageModel;
}

export type BetterTranslateCliConfig =
  | BetterTranslateCliGatewayConfig
  | BetterTranslateCliDirectModelConfig;

interface ResolvedBetterTranslateCliConfigBase {
  locales: readonly string[];
  markdown?: {
    extensions: readonly MarkdownExtension[];
    rootDir: string;
  };
  messages: {
    entry: string;
  };
  sourceLocale: string;
}

export interface ResolvedBetterTranslateCliGatewayConfig
  extends ResolvedBetterTranslateCliConfigBase {
  gateway: {
    apiKey: string;
  };
  model: string;
}

export interface ResolvedBetterTranslateCliDirectModelConfig
  extends ResolvedBetterTranslateCliConfigBase {
  model: CliLanguageModel;
}

export type ResolvedBetterTranslateCliConfig =
  | ResolvedBetterTranslateCliGatewayConfig
  | ResolvedBetterTranslateCliDirectModelConfig;

export interface LoadedBetterTranslateCliConfig {
  config: ResolvedBetterTranslateCliConfig;
  directory: string;
  path: string;
}

export interface CliWriteOperation {
  content: string;
  kind: "markdown" | "messages";
  locale: string;
  sourcePath: string;
  targetPath: string;
}

export interface CliLogger {
  error(message: string): void;
  info(message: string): void;
}

export interface StructuredGenerationRequest<TOutput> {
  kind: "markdown" | "messages";
  prompt: string;
  schema: object;
  sourcePath: string;
  system: string;
  targetLocale: string;
  validate?: (value: unknown) => TOutput;
}

export type StructuredGenerator = <TOutput>(
  request: StructuredGenerationRequest<TOutput>,
) => Promise<TOutput>;

export interface GenerateProjectOptions {
  configPath?: string;
  cwd?: string;
  dryRun?: boolean;
  generator?: StructuredGenerator;
  logger?: CliLogger;
}

export interface GenerateProjectResult {
  dryRun: boolean;
  loadedConfig: LoadedBetterTranslateCliConfig;
  writes: CliWriteOperation[];
}

export interface ExtractProjectOptions {
  configPath?: string;
  cwd?: string;
  dryRun?: boolean;
  logger?: CliLogger;
  maxLength?: number;
}

export interface ExtractProjectResult {
  dryRun: boolean;
  filePaths: string[];
  loadedConfig: LoadedBetterTranslateCliConfig;
  updatedMessages: string[];
  warnings: string[];
}
