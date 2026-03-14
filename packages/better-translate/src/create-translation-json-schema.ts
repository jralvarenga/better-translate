import { isTranslationMessages } from "./validation.js";
import type {
  TranslationJsonObjectSchema,
  TranslationJsonSchema,
  TranslationJsonSchemaNode,
  TranslationMessages,
} from "./types.js";

function createSchemaNode(messages: TranslationMessages): TranslationJsonObjectSchema {
  const properties: Record<string, TranslationJsonSchemaNode> = {};

  for (const [key, value] of Object.entries(messages)) {
    properties[key] =
      typeof value === "string" ? { type: "string" } : createSchemaNode(value);
  }

  return {
    type: "object",
    additionalProperties: false,
    required: Object.keys(messages),
    properties,
  };
}

/**
 * Generates a JSON Schema document from a source locale object.
 */
export function createTranslationJsonSchema<TMessages extends TranslationMessages>(
  sourceMessages: TMessages,
): TranslationJsonSchema {
  if (!isTranslationMessages(sourceMessages)) {
    throw new Error(
      "createTranslationJsonSchema(...) requires a valid translation object.",
    );
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    ...createSchemaNode(sourceMessages),
  };
}
