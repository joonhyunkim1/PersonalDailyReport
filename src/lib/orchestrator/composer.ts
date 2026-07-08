import type { SectionRunResult } from "@/lib/orchestrator/pipeline";
import type {
  AiNewsContent,
  BriefingJSON,
  BriefingSections,
  CodingTestContent,
  InterviewContent,
  StockMarketContent,
  TechConceptContent,
} from "@/types/briefing";
import type { SectionType } from "@/lib/modules/types";

function findContent<T>(results: SectionRunResult[], type: SectionType): T {
  const found = results.find((r) => r.type === type);
  if (!found) {
    throw new Error(`Missing section result for ${type}`);
  }
  return found.result.content as T;
}

// Phase 1: TL;DR/subject are simple templated strings. AI-generated
// summarization (docs/DESIGN.md section 8.4) lands alongside the real
// OpenAI modules in Phase 2/3.
export function composeBriefing(
  runId: string,
  dateLabel: string,
  results: SectionRunResult[]
): BriefingJSON {
  const sections: BriefingSections = {
    codingTest: findContent<CodingTestContent>(results, "CODING_TEST"),
    techConcept: findContent<TechConceptContent>(results, "TECH_CONCEPT"),
    interview: findContent<InterviewContent>(results, "INTERVIEW"),
    aiNews: findContent<AiNewsContent>(results, "AI_NEWS"),
    stockMarket: findContent<StockMarketContent>(results, "STOCK_MARKET"),
  };

  const tldr = [
    `오늘의 전공지식: ${sections.techConcept.topic} (${sections.techConcept.level})`,
    `코딩테스트 추천 ${sections.codingTest.problems.length}문제`,
    `AI/임베디드 뉴스 ${sections.aiNews.items.length}건 정리`,
  ];

  const subject = `🧠 [Daily Briefing] ${dateLabel} — 오늘의 핵심: ${sections.techConcept.topic}`;

  return { runId, dateLabel, subject, tldr, sections };
}
