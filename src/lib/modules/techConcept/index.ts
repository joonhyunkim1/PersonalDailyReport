import type { TechConceptContent } from "@/types/briefing";
import type { ModuleResult, SectionModule } from "@/lib/modules/types";

// Phase 1 stub: static placeholder content. Real level-progression selection
// (TechTopicProgress-driven, see docs/DESIGN.md section 3.4) lands in Phase 4.
export const techConceptModule: SectionModule<TechConceptContent> = {
  type: "TECH_CONCEPT",
  async generate(): Promise<ModuleResult<TechConceptContent>> {
    return {
      status: "SUCCESS",
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      content: {
        topic: "Batch Normalization",
        category: "Deep Learning",
        level: "BASIC",
        coreConcept:
          "각 미니배치의 활성화 값을 평균 0, 분산 1로 정규화한 뒤 학습 가능한 scale/shift 파라미터를 적용하는 기법입니다.",
        background:
          "레이어가 깊어질수록 이전 레이어의 파라미터 변화가 다음 레이어 입력 분포를 계속 바꾸는 internal covariate shift 문제로 학습이 불안정해지는 것을 완화하기 위해 등장했습니다.",
        pros: "학습 속도 향상, 더 큰 learning rate 사용 가능, 약한 정규화 효과",
        cons: "작은 배치 크기에서 통계량이 불안정, 학습/추론 시 동작 방식이 달라 구현 복잡도 증가",
        useCase: "CNN 기반 이미지 분류 모델(ResNet 등)의 표준 구성 요소",
        comparison: "Layer Norm은 배치 크기에 의존하지 않아 Transformer 계열에서 더 널리 쓰입니다.",
      },
    };
  },
};
