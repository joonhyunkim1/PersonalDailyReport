import type {
  AiNewsContent,
  CodingTestContent,
  InterviewContent,
  StockMarketContent,
  TechConceptContent,
} from "@/types/briefing";

// Placeholder content used when a module fails even after retrying
// (docs/DESIGN.md section 2.2/6.6 fail-soft principle) — the email must
// always go out, with a clearly-labeled "not ready today" section instead
// of a broken/missing one.
const NOT_READY = "일시적 오류로 오늘은 이 섹션을 준비하지 못했습니다. 내일 다시 시도합니다.";

export const FALLBACK_CONTENT = {
  CODING_TEST: {
    problems: [
      {
        name: "오늘은 문제를 준비하지 못했습니다",
        platform: "프로그래머스",
        difficulty: "-",
        reason: NOT_READY,
        learningPoint: "-",
        companyRelevance: "-",
      },
    ],
  } satisfies CodingTestContent,

  TECH_CONCEPT: {
    topic: "준비 중",
    category: "-",
    level: "BASIC",
    coreConcept: NOT_READY,
    background: "-",
    pros: "-",
    cons: "-",
    useCase: "-",
    comparison: "-",
  } satisfies TechConceptContent,

  INTERVIEW: {
    topic: "준비 중",
    level: "BASIC",
    questions: [
      {
        question: "오늘은 면접 질문을 준비하지 못했습니다",
        answer: NOT_READY,
        followUp: "-",
      },
    ],
  } satisfies InterviewContent,

  AI_NEWS: {
    items: [
      {
        title: "오늘은 뉴스를 준비하지 못했습니다",
        summary: NOT_READY,
        whyItMatters: "-",
        researcherView: "-",
        engineerView: "-",
      },
    ],
  } satisfies AiNewsContent,

  STOCK_MARKET: {
    summary: NOT_READY,
    upDownFactors: "-",
    aiIndustryImpact: "-",
    todayEvents: "-",
  } satisfies StockMarketContent,
} as const;
