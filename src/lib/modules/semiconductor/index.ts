import type { SemiconductorContent } from "@/types/briefing";
import type { ModuleResult, SectionModule } from "@/lib/modules/types";

// Phase 1 stub: static placeholder content. Real search-backed retrieval
// lands in Phase 2.
export const semiconductorModule: SectionModule<SemiconductorContent> = {
  type: "SEMICONDUCTOR",
  async generate(): Promise<ModuleResult<SemiconductorContent>> {
    return {
      status: "SUCCESS",
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      content: {
        items: [
          {
            title: "(placeholder) NVIDIA/삼성전자 등 반도체 소식 예시",
            summary: "Phase 2에서 실제 최신 뉴스로 대체됩니다.",
            industryImpact: "산업 영향 placeholder",
            aiEngineerImpact: "AI 엔지니어에게 미치는 영향 placeholder",
          },
        ],
      },
    };
  },
};
