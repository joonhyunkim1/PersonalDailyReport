import type { TechConceptContent } from "@/types/briefing";
import type { ModuleContext, ModuleResult, SectionModule } from "@/lib/modules/types";
import { generateStructured } from "@/lib/openai/responses";
import { TechConceptSchema } from "@/lib/openai/schemas/techConcept.schema";
import { MODELS } from "@/lib/openai/client";
import { TECH_TOPIC_CATALOG } from "@/lib/config/topicCatalog";

const INSTRUCTIONS = `당신은 "오늘의 전공 지식" 섹션을 작성합니다. 이 섹션은 면접 대비용 학습 노트 형태여야 하며,
단순한 정의 나열이 아니라 왜 등장했는지/장단점/실제 활용 사례/다른 기술과의 비교까지 포함해야 합니다.

아래 카탈로그에서 오늘 다룰 주제 딱 하나를 선택하세요:
${Object.entries(TECH_TOPIC_CATALOG)
  .map(([category, topics]) => `- ${category}: ${topics.join(", ")}`)
  .join("\n")}

오늘은 BASIC 레벨(핵심 개념 정의, 등장 배경, 직관적 이해 수준)로 작성하세요.
각 필드는 한국어로 2~4문장 내외로 작성하세요.`;

// Phase 2: real OpenAI generation (no web_search — relies on the model's
// own knowledge). Topic selection is a static catalog pick for now; the
// history-aware level-progression selection (docs/DESIGN.md section 3.4)
// lands in Phase 4.
export const techConceptModule: SectionModule<TechConceptContent> = {
  type: "TECH_CONCEPT",
  async generate(_ctx: ModuleContext): Promise<ModuleResult<TechConceptContent>> {
    const result = await generateStructured<TechConceptContent>({
      model: MODELS.reasoning,
      schema: TechConceptSchema,
      schemaName: "tech_concept",
      instructions: INSTRUCTIONS,
      input: "오늘의 전공 지식 노트를 작성해주세요.",
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
