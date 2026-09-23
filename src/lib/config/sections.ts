// Optional sections that can be paused without deleting their code. The
// pipeline skips generating a disabled section (no OpenAI cost), and the
// composer/email simply omit it. Flip back to true to re-enable.
export const SECTION_ENABLED = {
  // Paused 2026-09-24 per user request — kept for future reuse.
  STOCK_MARKET: false,
} as const;
