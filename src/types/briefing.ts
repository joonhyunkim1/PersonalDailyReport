export type TopicLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED";

export interface CodingTestProblem {
  name: string;
  platform: string;
  difficulty: string;
  reason: string;
  learningPoint: string;
  companyRelevance: string;
}

export interface CodingTestContent {
  problems: CodingTestProblem[];
}

export interface TechConceptContent {
  topic: string;
  category: string;
  level: TopicLevel;
  coreConcept: string;
  background: string;
  pros: string;
  cons: string;
  useCase: string;
  comparison: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
  followUp: string;
}

export interface InterviewContent {
  topic: string;
  level: TopicLevel;
  questions: InterviewQuestion[];
}

export interface NewsItem {
  title: string;
  summary: string;
  whyItMatters: string;
  researcherView: string;
  engineerView: string;
  // Added 2026-09-24 (also consumed by the DR_to_Insta Instagram channel).
  // Optional because AI_NEWS rows stored before then don't have them.
  keyFacts?: string[];
  sourceName?: string | null;
  sourceUrl?: string | null;
  publishedDate?: string | null;
}

// "AI / 임베디드 뉴스" — merged from the former separate AI/CV news and
// 반도체/임베디드 뉴스 sections (AI is a superset of CV, and embedded news
// matches the user's major more directly than general semiconductor news).
export interface AiNewsContent {
  items: NewsItem[];
}

// Reserved: JOB_MARKET is currently paused (not called by the pipeline,
// not rendered in the email) but kept for future reuse.
export interface JobListing {
  company: string;
  role: string;
  requiredSkills: string[];
  whyRelevant: string;
}

export interface JobMarketContent {
  items: JobListing[];
}

// Paused via SECTION_ENABLED (lib/config/sections.ts) — kept for future reuse.
export interface StockMarketContent {
  summary: string;
  upDownFactors: string;
  aiIndustryImpact: string;
  todayEvents: string;
}

export interface BriefingSections {
  codingTest: CodingTestContent;
  techConcept: TechConceptContent;
  interview: InterviewContent;
  aiNews: AiNewsContent;
  stockMarket?: StockMarketContent;
}

export interface BriefingJSON {
  runId: string;
  dateLabel: string;
  subject: string;
  tldr: string[];
  sections: BriefingSections;
}
