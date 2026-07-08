import type { CodingTestContent } from "@/types/briefing";
import type { ModuleContext, ModuleResult, SectionModule } from "@/lib/modules/types";
import { generateStructured } from "@/lib/openai/responses";
import { CodingTestSchema } from "@/lib/openai/schemas/codingTest.schema";
import { MODELS } from "@/lib/openai/client";

const INSTRUCTIONS = `당신은 "오늘의 코딩테스트" 섹션을 작성합니다. 오늘 풀어볼 만한 코딩테스트 문제를 1~3개 추천하세요.

각 문제는 실제로 존재하는(지어내지 않은) 유명 문제여야 하며, 아래 학습 포인트 중 하나 이상과 연결되어야 합니다:
BFS, DFS, DP, 그래프, 이분탐색, 구현, 시뮬레이션

각 문제마다 다음을 포함하세요:
- 문제명, 플랫폼(LeetCode/백준/프로그래머스 등), 난이도
- 추천 이유 (2~3문장)
- 학습 포인트 (위 목록 중 해당하는 것)
- 기업 코딩테스트 연관성 (실제로 자주 나오는 유형인지, 어떤 기업 스타일인지)`;

// Phase 2: real OpenAI generation (no web_search — relies on the model's
// own knowledge of well-known problems). CodingProblemHistory-based dedup
// (docs/DESIGN.md section 7.1/3) lands in Phase 4.
export const codingTestModule: SectionModule<CodingTestContent> = {
  type: "CODING_TEST",
  async generate(_ctx: ModuleContext): Promise<ModuleResult<CodingTestContent>> {
    const result = await generateStructured<CodingTestContent>({
      model: MODELS.reasoning,
      schema: CodingTestSchema,
      schemaName: "coding_test",
      instructions: INSTRUCTIONS,
      input: "오늘의 코딩테스트 추천 문제를 작성해주세요.",
    });

    return {
      status: "SUCCESS",
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      costUsd: result.costUsd,
      content: result.content,
    };
  },
};
