import type { OpenAIProviderModelSpec } from "./types.js";

export function openai(
  modelId: string,
  options: {
    apiKey: string;
  },
): OpenAIProviderModelSpec {
  return {
    apiKey: options.apiKey,
    kind: "provider-model",
    modelId,
    provider: "openai",
  };
}
