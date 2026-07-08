import { codingTestModule } from "@/lib/modules/codingTest";
import { techConceptModule } from "@/lib/modules/techConcept";
import { interviewModule } from "@/lib/modules/interview";
import { aiNewsModule } from "@/lib/modules/aiNews";
// jobMarketModule: paused (not called) — kept in lib/modules/jobMarket for
// future reuse. See docs/DESIGN.md section 13.2 (interest customization).
import { stockMarketModule } from "@/lib/modules/stockMarket";
import type { ModuleContext, ModuleResult, SectionType } from "@/lib/modules/types";

export interface SectionRunResult {
  type: SectionType;
  result: ModuleResult<unknown>;
}

// Phase 1: TECH_CONCEPT runs first so INTERVIEW can reuse its topic/level;
// the remaining independent sections run in parallel. Fail-soft handling
// (per-module fallback/retry) is deferred to Phase 5 per docs/DESIGN.md
// section 12 roadmap.
export async function runPipeline(ctx: ModuleContext): Promise<SectionRunResult[]> {
  const techConceptResult = await techConceptModule.generate(ctx);

  const interviewResult = await interviewModule.generate({
    ...ctx,
    upstream: {
      TECH_CONCEPT: techConceptResult.content,
      TECH_CONCEPT_META: techConceptResult.meta,
    },
  });

  const independentModules = [codingTestModule, aiNewsModule, stockMarketModule] as const;

  const independentResults = await Promise.all(
    independentModules.map((mod) => mod.generate(ctx))
  );

  return [
    { type: techConceptModule.type, result: techConceptResult },
    { type: interviewModule.type, result: interviewResult },
    ...independentModules.map((mod, i) => ({
      type: mod.type,
      result: independentResults[i],
    })),
  ];
}
