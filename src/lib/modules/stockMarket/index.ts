import type { StockMarketContent } from "@/types/briefing";
import type { ModuleResult, SectionModule } from "@/lib/modules/types";

// Phase 1 stub: static placeholder content. Real search-backed retrieval
// lands in Phase 2 (see docs/DESIGN.md section 7.5 for accuracy caveats).
export const stockMarketModule: SectionModule<StockMarketContent> = {
  type: "STOCK_MARKET",
  async generate(): Promise<ModuleResult<StockMarketContent>> {
    return {
      status: "SUCCESS",
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      content: {
        summary: "(placeholder) 미국 증시 요약이 Phase 2에서 채워집니다.",
        upDownFactors: "주요 상승/하락 요인 placeholder",
        aiIndustryImpact: "AI 산업 영향 placeholder",
        todayEvents: "오늘 주목할 이벤트 placeholder",
      },
    };
  },
};
