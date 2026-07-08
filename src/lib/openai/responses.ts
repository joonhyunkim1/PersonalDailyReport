import type { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { parseResponse } from "openai/lib/ResponsesParser";
import { openai } from "@/lib/openai/client";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/config/persona";
import { estimateCostUsd } from "@/lib/config/pricing";

export interface StructuredGenerationResult<T> {
  content: T;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
}

interface GenerateStructuredParams<T> {
  model: string;
  schema: z.ZodType<T>;
  schemaName: string;
  instructions: string;
  input: string;
  maxOutputTokens?: number;
}

// Single-pass structured generation (no web_search): used by sections that
// rely on the model's own knowledge (TECH_CONCEPT, INTERVIEW, CODING_TEST).
// Search-backed sections use the two-pass pattern from
// docs/DESIGN.md section 6.3 instead.
export async function generateStructured<T>(
  params: GenerateStructuredParams<T>
): Promise<StructuredGenerationResult<T>> {
  const createParams = {
    model: params.model,
    instructions: `${PERSONA_SYSTEM_PROMPT}\n\n${params.instructions}`,
    input: params.input,
    text: { format: zodTextFormat(params.schema, params.schemaName) },
    ...(params.maxOutputTokens ? { max_output_tokens: params.maxOutputTokens } : {}),
  };

  const response = await openai.responses.create(createParams);
  const parsed = parseResponse(response, createParams);

  if (!parsed.output_parsed) {
    throw new Error(
      `OpenAI structured output parsing returned no content for schema "${params.schemaName}"`
    );
  }

  const tokensInput = response.usage?.input_tokens ?? 0;
  const tokensOutput = response.usage?.output_tokens ?? 0;

  return {
    content: parsed.output_parsed,
    tokensInput,
    tokensOutput,
    costUsd: estimateCostUsd(params.model, tokensInput, tokensOutput),
  };
}
