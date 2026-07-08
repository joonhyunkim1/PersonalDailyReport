import type { AiNewsContent } from "@/types/briefing";
import type { ModuleResult, SectionModule } from "@/lib/modules/types";

// Phase 1 stub: static placeholder content. Real web_search-backed
// retrieval (two-pass pattern, see docs/DESIGN.md section 6.3) lands in Phase 2.
export const aiNewsModule: SectionModule<AiNewsContent> = {
  type: "AI_NEWS",
  async generate(): Promise<ModuleResult<AiNewsContent>> {
    return {
      status: "SUCCESS",
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      content: {
        items: [
          {
            title: "(placeholder) OpenAI/Anthropic/NVIDIA 관련 소식 예시",
            summary: "Phase 2에서 web_search 도구로 실제 최신 기사가 채워집니다.",
            whyItMatters: "이 자리에 실제 중요도 평가가 들어갑니다.",
            researcherView: "연구자 관점 해설 placeholder",
            engineerView: "엔지니어 관점 해설 placeholder",
          },
        ],
      },
    };
  },
};
