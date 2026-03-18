import type { BetterTranslateCliConfig } from "./types.js";

export function defineConfig<TConfig extends BetterTranslateCliConfig>(
  config: TConfig,
): TConfig {
  return config;
}
