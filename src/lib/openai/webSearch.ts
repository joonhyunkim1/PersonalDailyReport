import { openai, MODELS } from "@/lib/openai/client";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/config/persona";
import { estimateCostUsd, WEB_SEARCH_COST_PER_CALL_USD } from "@/lib/config/pricing";

export interface WebCitation {
  title: string;
  url: string;
}

export interface WebSearchPassResult {
  text: string;
  /** Deduplicated url_citation annotations from the answer — the only URLs
   * we can trust as real (the structuring pass must not invent any). */
  citations: WebCitation[];
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
}

// Pass 1 of the two-pass pattern (docs/DESIGN.md section 6.3): web_search
// enabled, free-text output. A second, search-free call then structures
// this text into the section's JSON schema (see generateStructured).
export async function researchWithWebSearch(params: {
  instructions: string;
  input: string;
}): Promise<WebSearchPassResult> {
  const response = await openai.responses.create({
    model: MODELS.reasoning,
    instructions: `${PERSONA_SYSTEM_PROMPT}\n\n${params.instructions}`,
    input: params.input,
    // "low" context size keeps search-result tokens (and therefore cost)
    // down; our sections only need 2-3 short items, not exhaustive research.
    tools: [{ type: "web_search", search_context_size: "low" }],
  });

  const tokensInput = response.usage?.input_tokens ?? 0;
  const tokensOutput = response.usage?.output_tokens ?? 0;
  const webSearchCalls = response.output.filter(
    (item) => item.type === "web_search_call"
  ).length;

  const costUsd =
    estimateCostUsd(MODELS.reasoning, tokensInput, tokensOutput) +
    webSearchCalls * WEB_SEARCH_COST_PER_CALL_USD;

  const citations = new Map<string, WebCitation>();
  for (const item of response.output) {
    if (item.type !== "message") continue;
    for (const part of item.content) {
      if (part.type !== "output_text") continue;
      for (const annotation of part.annotations) {
        if (annotation.type === "url_citation" && !citations.has(annotation.url)) {
          citations.set(annotation.url, { title: annotation.title, url: annotation.url });
        }
      }
    }
  }

  return {
    text: response.output_text,
    citations: [...citations.values()],
    tokensInput,
    tokensOutput,
    costUsd,
  };
}
