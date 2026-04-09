import type { StructuredGenerationRequest } from "./types.js";

function validateGeneratedValue<TOutput>(
  value: unknown,
  request: StructuredGenerationRequest<TOutput>,
): TOutput {
  if (!request.validate) {
    return value as TOutput;
  }

  return request.validate(value);
}

function createOutputValidator<TOutput>(
  request: StructuredGenerationRequest<TOutput>,
): {
  validate(value: unknown):
    | {
        success: true;
        value: TOutput;
      }
    | {
        success: false;
        error: Error;
      };
} {
  return {
    validate(value: unknown) {
      try {
        return {
          success: true as const,
          value: validateGeneratedValue(value, request),
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error : new Error(String(error)),
          success: false as const,
        };
      }
    },
  };
}

function isSchemaTooLargeError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("compiled grammar is too large") ||
    normalizedMessage.includes("reduce the number of strict tools") ||
    normalizedMessage.includes("tool schemas exceed") ||
    normalizedMessage.includes("tool schema size") ||
    normalizedMessage.includes("exceeds maximum schema size") ||
    normalizedMessage.includes("too many tools")
  );
}

function shouldRetryWithPlainJson(error: unknown): boolean {
  if (isSchemaTooLargeError(error)) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("no object generated") ||
    normalizedMessage.includes("could not parse the response") ||
    normalizedMessage.includes("could not parse response") ||
    normalizedMessage.includes("failed to parse") ||
    normalizedMessage.includes("invalid json") ||
    normalizedMessage.includes("response did not match schema") ||
    normalizedMessage.includes("type validation failed")
  );
}

function getModelProviderName(model: unknown): string | undefined {
  if (!model || typeof model !== "object") {
    return undefined;
  }

  const provider = (model as { provider?: unknown }).provider;

  return typeof provider === "string" ? provider.toLowerCase() : undefined;
}

function shouldPreferPlainJson(model: unknown): boolean {
  const providerName = getModelProviderName(model);

  return providerName?.includes("ollama") ?? false;
}

function extractJsonPayload(text: string): string {
  const trimmed = text
    .replace(/^(?:\s*<think>[\s\S]*?<\/think>\s*)+/i, "")
    .trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function createJsonOnlyPrompt<TOutput>(
  request: StructuredGenerationRequest<TOutput>,
): string {
  const instructions = [
    request.prompt,
    "",
    "Return only a valid JSON object that matches the required shape exactly.",
    "Start with { and end with }.",
    "Do not wrap the JSON in markdown fences.",
    "Do not include reasoning, analysis, <think> tags, XML tags, comments, or any text before or after the JSON object.",
  ];

  if (request.kind === "markdown") {
    instructions.push(
      'For markdown, return exactly an object with "body" and "frontmatter" keys.',
      'Put the translated markdown or mdx content in the "body" string.',
      'Put translated frontmatter string values inside the "frontmatter" object only.',
      "Do not rename body to content, markdown, mdx, or document.",
      "Do not move frontmatter fields to the top level.",
    );
  }

  return instructions.join("\n");
}

function createJsonOnlySystem(system: string): string {
  return `${system} Return only valid JSON. Never include reasoning, analysis, <think> tags, XML tags, markdown fences, or extra text outside the JSON object.`;
}

function parseJsonText<TOutput>(
  text: string,
  request: StructuredGenerationRequest<TOutput>,
): TOutput {
  const payload = extractJsonPayload(text);

  try {
    const parsed = JSON.parse(payload);

    return request.validate ? validateGeneratedValue(parsed, request) : parsed;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Fallback JSON parsing failed for "${request.sourcePath}": ${reason}`,
    );
  }
}

async function generateWithPlainJson<TOutput>(
  generateText: (...args: any[]) => Promise<{ text: string }>,
  baseInput: {
    model: never;
    prompt: string;
    providerOptions: StructuredGenerationRequest<TOutput>["providerOptions"];
    system: string;
    temperature: 0;
  },
  request: StructuredGenerationRequest<TOutput>,
): Promise<TOutput> {
  const fallbackResult = await generateText({
    ...baseInput,
    prompt: createJsonOnlyPrompt(request),
    system: createJsonOnlySystem(request.system),
  });

  return parseJsonText(fallbackResult.text, request);
}

export async function generateWithAiSdk<TOutput>(
  model: unknown,
  request: StructuredGenerationRequest<TOutput>,
): Promise<TOutput> {
  const { Output, generateText, jsonSchema } = await import("ai");
  const baseInput = {
    model: model as never,
    prompt: request.prompt,
    providerOptions: request.providerOptions,
    system: request.system,
    temperature: 0,
  } as const;

  if (shouldPreferPlainJson(model)) {
    return generateWithPlainJson(generateText, baseInput, request);
  }

  try {
    const result = await generateText({
      ...baseInput,
      experimental_output: Output.object({
        schema: jsonSchema(request.schema, createOutputValidator(request)),
      }),
    });

    return result.experimental_output as TOutput;
  } catch (error) {
    if (!shouldRetryWithPlainJson(error)) {
      throw error;
    }
  }

  return generateWithPlainJson(generateText, baseInput, request);
}
