import type { CodingTestContent } from "@/types/briefing";
import type { ModuleResult, SectionModule } from "@/lib/modules/types";

// Phase 1 stub: static placeholder content. Real OpenAI-driven selection
// (with CodingProblemHistory dedup) lands in Phase 2.
export const codingTestModule: SectionModule<CodingTestContent> = {
  type: "CODING_TEST",
  async generate(): Promise<ModuleResult<CodingTestContent>> {
    return {
      status: "SUCCESS",
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      content: {
        problems: [
          {
            name: "이진 트리의 최대 깊이",
            platform: "LeetCode",
            difficulty: "Easy",
            reason: "재귀/DFS 기초를 빠르게 점검하기 좋은 문제입니다.",
            learningPoint: "DFS, 재귀",
            companyRelevance: "대부분의 기업 코딩테스트 1문제 단골 유형",
          },
        ],
      },
    };
  },
};
