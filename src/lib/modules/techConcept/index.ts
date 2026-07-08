import type { TechConceptContent, TopicLevel } from "@/types/briefing";
import type { ModuleContext, ModuleResult, SectionModule } from "@/lib/modules/types";
import { generateStructured } from "@/lib/openai/responses";
import { TechConceptSchema } from "@/lib/openai/schemas/techConcept.schema";
import { MODELS } from "@/lib/openai/client";
import { pickNextTopic, recordTechTopicUsage } from "@/lib/dedup/techTopic";

const LEVEL_GUIDANCE: Record<TopicLevel, string> = {
  BASIC: "핵심 개념 정의, 등장 배경, 직관적 이해 수준으로 작성하세요.",
  INTERMEDIATE:
    "기본 정의는 짧게만 짚고, 트레이드오프/구현 디테일/실무 활용 사례 중심으로 작성하세요.",
  ADVANCED:
    "기초 설명은 생략하고, 최신 연구 동향/한계와 대안/대규모·시스템 수준 응용까지 다루세요.",
};

// Phase 4: topic/level are chosen by pickNextTopic (docs/DESIGN.md section
// 3.4) — the model no longer picks freely from the catalog, it writes the
// content for the exact topic+level we hand it. This guarantees the DB
// (TechTopicProgress/History) stays in sync with what was actually sent.
export const techConceptModule: SectionModule<TechConceptContent> = {
  type: "TECH_CONCEPT",
  async generate(ctx: ModuleContext): Promise<ModuleResult<TechConceptContent>> {
    const pick = await pickNextTopic(ctx.userId);

    const instructions = `당신은 "오늘의 전공 지식" 섹션을 작성합니다. 이 섹션은 면접 대비용 학습 노트 형태여야 하며,
단순한 정의 나열이 아니라 왜 등장했는지/장단점/실제 활용 사례/다른 기술과의 비교까지 포함해야 합니다.

오늘 다룰 주제: ${pick.topic} (분류: ${pick.category})
레벨: ${pick.level}
${LEVEL_GUIDANCE[pick.level]}
${pick.isNew ? "" : "이 주제는 과거에 다룬 적이 있습니다. 이전과 다른 각도(다른 사례, 다른 비교 대상, 최신 동향)로 다뤄 반복감을 주지 마세요."}

각 필드는 한국어로 2~4문장 내외로 작성하세요. topic/category/level 필드는 위에서 지정한 값을
그대로 사용하세요.`;

    const result = await generateStructured<TechConceptContent>({
      model: MODELS.reasoning,
      schema: TechConceptSchema,
      schemaName: "tech_concept",
      instructions,
      input: "오늘의 전공 지식 노트를 작성해주세요.",
    });

    // Override the model's echoed topic/category/level with our authoritative
    // pick so DB bookkeeping never drifts from what was actually selected.
    const content: TechConceptContent = {
      ...result.content,
      topic: pick.topic,
      category: pick.category,
      level: pick.level,
    };

    const { techTopicHistoryId } = await recordTechTopicUsage(ctx.userId, pick);

    return {
      status: "SUCCESS",
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      costUsd: result.costUsd,
      content,
      meta: { techTopicHistoryId },
    };
  },
};
