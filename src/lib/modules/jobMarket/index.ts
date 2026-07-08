import type { JobMarketContent } from "@/types/briefing";
import type { ModuleContext, ModuleResult, SectionModule } from "@/lib/modules/types";
import { researchWithWebSearch } from "@/lib/openai/webSearch";
import { generateStructured } from "@/lib/openai/responses";
import { JobMarketSchema } from "@/lib/openai/schemas/jobMarket.schema";
import { MODELS } from "@/lib/openai/client";

const RESEARCH_INSTRUCTIONS = `"취업 정보" 섹션을 위한 리서치를 수행하세요.

AI Engineer, Computer Vision Engineer, ML Engineer, Embedded Engineer, Robotics Engineer
직무의 최근 채용 공고를 3~5건 찾으세요. 실제로 존재하는 공고/기업이어야 하며 지어내지 마세요.
찾지 못하면 그 사실을 명시하세요.

각 공고에 대해: 회사명, 직무명, 요구 기술, 이 사용자(PyTorch/Jetson Orin/딥러닝 연구 경험 보유,
AI/CV/Embedded 엔지니어 취업 준비생)가 왜 관심을 가져야 하는지를 정리하세요.`;

const STRUCTURE_INSTRUCTIONS = `아래는 "취업 정보" 섹션을 위해 수집된 리서치 내용입니다.
이를 요청된 JSON 스키마에 맞게 정리하세요. 리서치에 없는 내용을 지어내지 마세요.`;

// Phase 2: two-pass pattern (docs/DESIGN.md section 6.3).
export const jobMarketModule: SectionModule<JobMarketContent> = {
  type: "JOB_MARKET",
  async generate(_ctx: ModuleContext): Promise<ModuleResult<JobMarketContent>> {
    const research = await researchWithWebSearch({
      instructions: RESEARCH_INSTRUCTIONS,
      input: "오늘의 취업 정보를 리서치해주세요.",
    });

    const structured = await generateStructured<JobMarketContent>({
      model: MODELS.mini,
      schema: JobMarketSchema,
      schemaName: "job_market",
      instructions: STRUCTURE_INSTRUCTIONS,
      input: research.text,
    });

    return {
      status: "SUCCESS",
      tokensInput: research.tokensInput + structured.tokensInput,
      tokensOutput: research.tokensOutput + structured.tokensOutput,
      costUsd: research.costUsd + structured.costUsd,
      content: structured.content,
    };
  },
};
