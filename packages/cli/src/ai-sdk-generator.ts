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
    normalizedMessage.includes("simplify your tool schemas") ||
    normalizedMessage.includes("tool schemas")
  );
}

function extractJsonPayload(text: string): string {
  const trimmed = text.trim();
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

function parseJsonText<TOutput>(
  text: string,
  request: StructuredGenerationRequest<TOutput>,
): TOutput {
  const payload = extractJsonPayload(text);

  try {
    return validateGeneratedValue(JSON.parse(payload), request);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Fallback JSON parsing failed for "${request.sourcePath}": ${reason}`,
    );
  }
}

export async function generateWithAiSdk<TOutput>(
  model: unknown,
  request: StructuredGenerationRequest<TOutput>,
): Promise<TOutput> {
  const { Output, generateText, jsonSchema } = await import("ai");
  const baseInput = {
    model: model as never,
    prompt: request.prompt,
    system: request.system,
    temperature: 0,
  } as const;

  try {
    const result = await generateText({
      ...baseInput,
      experimental_output: Output.object({
        schema: jsonSchema(request.schema, createOutputValidator(request)),
      }),
    });

    return result.experimental_output as TOutput;
  } catch (error) {
    if (!isSchemaTooLargeError(error)) {
      throw error;
    }
  }

  const fallbackResult = await generateText({
    ...baseInput,
    prompt: [
      request.prompt,
      "",
      "Return only a valid JSON object that matches the required shape exactly.",
      "Do not wrap the JSON in markdown fences.",
    ].join("\n"),
    system: `${request.system} Return only valid JSON.`,
  });

  return parseJsonText(fallbackResult.text, request);
}
