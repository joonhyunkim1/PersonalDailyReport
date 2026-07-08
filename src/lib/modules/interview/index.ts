import type { InterviewContent, TechConceptContent } from "@/types/briefing";
import type { ModuleContext, ModuleResult, SectionModule } from "@/lib/modules/types";
import { generateStructured } from "@/lib/openai/responses";
import { InterviewSchema } from "@/lib/openai/schemas/interview.schema";
import { MODELS } from "@/lib/openai/client";
import { recordInterviewQuestions } from "@/lib/dedup/interviewQuestion";

const LEVEL_GUIDANCE: Record<string, string> = {
  BASIC: "개념 확인형 질문 위주로 작성하세요 (예: '~란 무엇인가', '~가 왜 필요한가').",
  INTERMEDIATE:
    "트레이드오프/구현형 질문 위주로 작성하세요 (예: '~를 언제 쓰면 안 되는가', '구현 시 주의할 점').",
  ADVANCED:
    "시스템 설계/비교형 질문 위주로 작성하세요 (예: '대규모 환경에서의 대안', '최신 연구 동향과의 비교').",
};

// Phase 2: real OpenAI generation, reusing TECH_CONCEPT's topic/level from
// ctx.upstream so question depth matches the level-progression design
// (docs/DESIGN.md section 3.4).
export const interviewModule: SectionModule<InterviewContent> = {
  type: "INTERVIEW",
  async generate(ctx: ModuleContext): Promise<ModuleResult<InterviewContent>> {
    const techConcept = ctx.upstream?.TECH_CONCEPT as TechConceptContent | undefined;
    if (!techConcept) {
      throw new Error("INTERVIEW module requires TECH_CONCEPT output in ctx.upstream");
    }
    const techConceptMeta = ctx.upstream?.TECH_CONCEPT_META as
      | { techTopicHistoryId?: string }
      | undefined;

    const instructions = `당신은 "면접 대비" 섹션을 작성합니다. 아래 오늘의 전공 지식 노트와 연결된
예상 면접 질문 3~5개를 만드세요. 각 질문에는 모범 답변과 추가 꼬리 질문을 포함하세요.

오늘의 전공 지식 주제: ${techConcept.topic} (레벨: ${techConcept.level})
핵심 개념: ${techConcept.coreConcept}
등장 배경: ${techConcept.background}

${LEVEL_GUIDANCE[techConcept.level] ?? LEVEL_GUIDANCE.BASIC}`;

    const result = await generateStructured<InterviewContent>({
      model: MODELS.reasoning,
      schema: InterviewSchema,
      schemaName: "interview",
      instructions,
      input: "면접 예상 질문과 모범 답변을 작성해주세요.",
    });

    if (techConceptMeta?.techTopicHistoryId) {
      await recordInterviewQuestions(
        techConceptMeta.techTopicHistoryId,
        techConcept.level,
        result.content.questions
      );
    }

    return {
      status: "SUCCESS",
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      costUsd: result.costUsd,
      content: result.content,
    };
  },
};
