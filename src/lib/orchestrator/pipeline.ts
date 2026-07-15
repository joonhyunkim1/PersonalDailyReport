import { codingTestModule } from "@/lib/modules/codingTest";
import { techConceptModule } from "@/lib/modules/techConcept";
import { interviewModule } from "@/lib/modules/interview";
import { aiNewsModule } from "@/lib/modules/aiNews";
// jobMarketModule: paused (not called) — kept in lib/modules/jobMarket for
// future reuse. See docs/DESIGN.md section 13.2 (interest customization).
import { stockMarketModule } from "@/lib/modules/stockMarket";
import type { ModuleContext, ModuleResult, SectionType } from "@/lib/modules/types";
import { withRetryFallback } from "@/lib/orchestrator/retry";
import { FALLBACK_CONTENT } from "@/lib/modules/fallbacks";
import { logger } from "@/lib/logger";
import type { InterviewContent, TechConceptContent } from "@/types/briefing";

export interface SectionRunResult {
  type: SectionType;
  result: ModuleResult<unknown>;
}

// Phase 5: every module call is wrapped in withRetryFallback, so a single
// section failing (even after retrying) never takes down the whole run —
// it just ships with placeholder content for that section (docs/DESIGN.md
// section 2.2/6.6). TECH_CONCEPT runs first so INTERVIEW can reuse its
// topic/level; if TECH_CONCEPT degrades to FALLBACK, INTERVIEW is skipped
// entirely (no point generating interview questions about a placeholder
// topic) and falls back too, saving an OpenAI call.
export async function runPipeline(ctx: ModuleContext): Promise<SectionRunResult[]> {
  const techConceptResult = await withRetryFallback(
    techConceptModule.type,
    () => techConceptModule.generate(ctx),
    FALLBACK_CONTENT.TECH_CONCEPT
  );

  let interviewResult: ModuleResult<InterviewContent>;
  if (techConceptResult.status !== "SUCCESS") {
    logger.warn("skipping INTERVIEW: TECH_CONCEPT did not succeed", {
      techConceptStatus: techConceptResult.status,
    });
    interviewResult = {
      status: "FALLBACK",
      content: FALLBACK_CONTENT.INTERVIEW,
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      errorMessage: "Skipped: TECH_CONCEPT did not succeed",
    };
  } else {
    const techConcept = techConceptResult.content as TechConceptContent;
    interviewResult = await withRetryFallback(
      interviewModule.type,
      () =>
        interviewModule.generate({
          ...ctx,
          upstream: {
            TECH_CONCEPT: techConcept,
            TECH_CONCEPT_META: techConceptResult.meta,
          },
        }),
      FALLBACK_CONTENT.INTERVIEW
    );
  }

  const [codingTestResult, aiNewsResult, stockMarketResult] = await Promise.all([
    withRetryFallback(
      codingTestModule.type,
      () => codingTestModule.generate(ctx),
      FALLBACK_CONTENT.CODING_TEST
    ),
    withRetryFallback(aiNewsModule.type, () => aiNewsModule.generate(ctx), FALLBACK_CONTENT.AI_NEWS),
    withRetryFallback(
      stockMarketModule.type,
      () => stockMarketModule.generate(ctx),
      FALLBACK_CONTENT.STOCK_MARKET
    ),
  ]);

  return [
    { type: techConceptModule.type, result: techConceptResult },
    { type: interviewModule.type, result: interviewResult },
    { type: codingTestModule.type, result: codingTestResult },
    { type: aiNewsModule.type, result: aiNewsResult },
    { type: stockMarketModule.type, result: stockMarketResult },
  ];
}
