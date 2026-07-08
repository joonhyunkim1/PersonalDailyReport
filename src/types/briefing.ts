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

export interface AiNewsContent {
  items: NewsItem[];
}

export interface JobListing {
  company: string;
  role: string;
  requiredSkills: string[];
  whyRelevant: string;
}

export interface JobMarketContent {
  items: JobListing[];
}

export interface SemiconductorItem {
  title: string;
  summary: string;
  industryImpact: string;
  aiEngineerImpact: string;
  sourceUrl?: string;
}

export interface SemiconductorContent {
  items: SemiconductorItem[];
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
  jobMarket: JobMarketContent;
  semiconductor: SemiconductorContent;
  stockMarket: StockMarketContent;
}

export interface BriefingJSON {
  runId: string;
  dateLabel: string;
  subject: string;
  tldr: string[];
  sections: BriefingSections;
}
