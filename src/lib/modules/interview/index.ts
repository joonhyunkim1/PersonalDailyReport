import type { InterviewContent, TechConceptContent } from "@/types/briefing";
import type { ModuleContext, ModuleResult, SectionModule } from "@/lib/modules/types";

// Phase 1 stub: reads TECH_CONCEPT's output (topic/level) from ctx.upstream
// and returns static placeholder questions matched to that level.
export const interviewModule: SectionModule<InterviewContent> = {
  type: "INTERVIEW",
  async generate(ctx: ModuleContext): Promise<ModuleResult<InterviewContent>> {
    const techConcept = ctx.upstream?.TECH_CONCEPT as TechConceptContent | undefined;
    const topic = techConcept?.topic ?? "Batch Normalization";
    const level = techConcept?.level ?? "BASIC";

    return {
      status: "SUCCESS",
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      content: {
        topic,
        level,
        questions: [
          {
            question: `${topic}이 왜 필요한가요?`,
            answer:
              "깊은 네트워크에서 각 레이어 입력 분포가 학습 중 계속 변하는 문제를 완화해 학습을 안정화하고 가속하기 위해서입니다.",
            followUp: "배치 크기가 매우 작을 때는 어떤 문제가 생기나요?",
          },
        ],
      },
    };
  },
};
