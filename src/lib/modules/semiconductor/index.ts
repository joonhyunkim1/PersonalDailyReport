import type { SemiconductorContent } from "@/types/briefing";
import type { ModuleContext, ModuleResult, SectionModule } from "@/lib/modules/types";
import { researchWithWebSearch } from "@/lib/openai/webSearch";
import { generateStructured } from "@/lib/openai/responses";
import { SemiconductorSchema } from "@/lib/openai/schemas/semiconductor.schema";
import { MODELS } from "@/lib/openai/client";

const RESEARCH_INSTRUCTIONS = `"반도체 / 임베디드 뉴스" 섹션을 위한 리서치를 수행하세요.

NVIDIA, Qualcomm, Intel, AMD, 삼성전자, SK하이닉스, TSMC 관련 소식 중
최근 24~48시간 이내의 것을 우선하여 2~3건을 찾으세요. 지어내지 마세요.

각 뉴스에 대해: 제목, 핵심 뉴스 요약, 산업 영향, AI 엔지니어(특히 Embedded AI/Jetson 경험 보유자)에게
미치는 영향을 정리하세요.`;

const STRUCTURE_INSTRUCTIONS = `아래는 "반도체 / 임베디드 뉴스" 섹션을 위해 수집된 리서치 내용입니다.
이를 요청된 JSON 스키마에 맞게 정리하세요. 리서치에 없는 내용을 지어내지 마세요.`;

// Phase 2: two-pass pattern (docs/DESIGN.md section 6.3).
export const semiconductorModule: SectionModule<SemiconductorContent> = {
  type: "SEMICONDUCTOR",
  async generate(_ctx: ModuleContext): Promise<ModuleResult<SemiconductorContent>> {
    const research = await researchWithWebSearch({
      instructions: RESEARCH_INSTRUCTIONS,
      input: "오늘의 반도체/임베디드 뉴스를 리서치해주세요.",
    });

    const structured = await generateStructured<SemiconductorContent>({
      model: MODELS.mini,
      schema: SemiconductorSchema,
      schemaName: "semiconductor",
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
