export type MarkdownExtension = ".md" | ".mdx";

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

export interface OpenAIProviderModelSpec {
  apiKey: string;
  kind: "provider-model";
  modelId: string;
  provider: "openai";
}

export interface BetterTranslateCliGatewayConfig
  extends BetterTranslateCliConfigBase {
  gateway: {
    apiKey: string;
  };
  model: string;
}

export interface BetterTranslateCliOpenAIConfig
  extends BetterTranslateCliConfigBase {
  gateway?: never;
  model: OpenAIProviderModelSpec;
}

export type BetterTranslateCliConfig =
  | BetterTranslateCliGatewayConfig
  | BetterTranslateCliOpenAIConfig;

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

export interface ResolvedBetterTranslateCliOpenAIConfig
  extends ResolvedBetterTranslateCliConfigBase {
  model: OpenAIProviderModelSpec;
}

export type ResolvedBetterTranslateCliConfig =
  | ResolvedBetterTranslateCliGatewayConfig
  | ResolvedBetterTranslateCliOpenAIConfig;

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
