import type { StructuredGenerationRequest } from "./types.js";

export async function generateWithAiSdk<TOutput>(
  model: unknown,
  request: StructuredGenerationRequest<TOutput>,
): Promise<TOutput> {
  const { Output, generateText, jsonSchema } = await import("ai");
  const result = await generateText({
    experimental_output: Output.object({
      schema: jsonSchema(request.schema, {
        validate(value: unknown) {
          if (!request.validate) {
            return {
              success: true as const,
              value: value as TOutput,
            };
          }

          try {
            return {
              success: true as const,
              value: request.validate(value),
            };
          } catch (error) {
            return {
              error:
                error instanceof Error ? error : new Error(String(error)),
              success: false as const,
            };
          }
        },
      }),
    }),
    model: model as never,
    prompt: request.prompt,
    system: request.system,
    temperature: 0,
  });

  return result.experimental_output as TOutput;
}
