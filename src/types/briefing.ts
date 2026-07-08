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
  sourceUrl?: string;
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
  stockMarket: StockMarketContent;
}

export interface BriefingJSON {
  runId: string;
  dateLabel: string;
  subject: string;
  tldr: string[];
  sections: BriefingSections;
}
