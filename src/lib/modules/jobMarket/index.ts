import type { JobMarketContent } from "@/types/briefing";
import type { ModuleResult, SectionModule } from "@/lib/modules/types";

// Phase 1 stub: static placeholder content. Real search-backed retrieval
// lands in Phase 2.
export const jobMarketModule: SectionModule<JobMarketContent> = {
  type: "JOB_MARKET",
  async generate(): Promise<ModuleResult<JobMarketContent>> {
    return {
      status: "SUCCESS",
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      content: {
        items: [
          {
            company: "(placeholder) 예시 기업",
            role: "AI Engineer",
            requiredSkills: ["PyTorch", "Python", "CUDA"],
            whyRelevant: "Phase 2에서 실제 채용 공고 검색 결과로 대체됩니다.",
          },
        ],
      },
    };
  },
};
