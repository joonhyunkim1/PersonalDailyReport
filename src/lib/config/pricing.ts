// Pricing per 1M tokens (USD), verified against platform.openai.com/docs/pricing
// on 2026-07-08. Re-check periodically — prices change. See docs/DESIGN.md
// section 9. web_search tool calls are billed separately ($10 / 1k calls,
// i.e. $0.01/call) — not modeled here yet since no module uses it so far.
export const MODEL_PRICING: Record<string, { inputPerM: number; outputPerM: number }> = {
  "gpt-5.4": { inputPerM: 2.5, outputPerM: 15 },
  "gpt-5.4-mini": { inputPerM: 0.75, outputPerM: 4.5 },
};

export const WEB_SEARCH_COST_PER_CALL_USD = 0.01;

export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  return (
    (inputTokens / 1_000_000) * pricing.inputPerM +
    (outputTokens / 1_000_000) * pricing.outputPerM
  );
}
