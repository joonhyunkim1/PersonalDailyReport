import type { AiNewsContent } from "@/types/briefing";
import type { ModuleContext, ModuleResult, SectionModule } from "@/lib/modules/types";
import { researchWithWebSearch } from "@/lib/openai/webSearch";
import { generateStructured } from "@/lib/openai/responses";
import { AiNewsSchema } from "@/lib/openai/schemas/aiNews.schema";
import { MODELS } from "@/lib/openai/client";

const RESEARCH_INSTRUCTIONS = `"AI / Computer Vision 뉴스" 섹션을 위한 리서치를 수행하세요.

OpenAI, Anthropic, NVIDIA, Google DeepMind, Meta, Hugging Face 관련 소식 중
최근 24~48시간 이내의 것을 우선하여 2~3건을 찾으세요. 공식 블로그/뉴스룸 등
신뢰할 수 있는 소스를 우선하고, 최소 2개 이상의 서로 다른 도메인에서 소스를 확보하세요.
최신 소식이 없다면 없다고 명시하고 지어내지 마세요.

각 기사에 대해 다음을 정리하세요: 제목, 핵심 요약, 왜 중요한가, 연구자 관점 해설,
엔지니어(AI/CV/Embedded 취업 준비생 관점) 해설.`;

const STRUCTURE_INSTRUCTIONS = `아래는 "AI / Computer Vision 뉴스" 섹션을 위해 수집된 리서치 내용입니다.
이를 요청된 JSON 스키마에 맞게 정리하세요. 리서치에 없는 내용을 지어내지 마세요.`;

// Phase 2: two-pass pattern (docs/DESIGN.md section 6.3) — Pass 1 does
// web_search-backed retrieval as free text, Pass 2 (cheaper mini model)
// structures that text into the section's JSON schema.
export const aiNewsModule: SectionModule<AiNewsContent> = {
  type: "AI_NEWS",
  async generate(_ctx: ModuleContext): Promise<ModuleResult<AiNewsContent>> {
    const research = await researchWithWebSearch({
      instructions: RESEARCH_INSTRUCTIONS,
      input: "오늘의 AI/Computer Vision 뉴스를 리서치해주세요.",
    });

    const structured = await generateStructured<AiNewsContent>({
      model: MODELS.mini,
      schema: AiNewsSchema,
      schemaName: "ai_news",
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
