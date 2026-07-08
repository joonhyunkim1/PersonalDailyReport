import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { SectionCard } from "@/lib/email/templates/SectionCard";
import { CodingTestSection } from "@/lib/email/templates/sections/CodingTestSection";
import { TechConceptSection } from "@/lib/email/templates/sections/TechConceptSection";
import { InterviewSection } from "@/lib/email/templates/sections/InterviewSection";
import { AiNewsSection } from "@/lib/email/templates/sections/AiNewsSection";
import { JobMarketSection } from "@/lib/email/templates/sections/JobMarketSection";
import { SemiconductorSection } from "@/lib/email/templates/sections/SemiconductorSection";
import { StockMarketSection } from "@/lib/email/templates/sections/StockMarketSection";
import type { BriefingJSON } from "@/types/briefing";

export function DailyBriefingEmail({ briefing }: { briefing: BriefingJSON }) {
  return (
    <Html>
      <Head />
      <Preview>{briefing.tldr.join(" · ")}</Preview>
      <Body style={{ backgroundColor: "#f3f4f6", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 16px" }}>
          <Heading as="h1" style={{ fontSize: "20px", color: "#111827" }}>
            🧠 Daily Briefing — {briefing.dateLabel}
          </Heading>

          <Section
            style={{
              backgroundColor: "#111827",
              borderRadius: "8px",
              padding: "16px 20px",
              marginBottom: "20px",
            }}
          >
            {briefing.tldr.map((line, i) => (
              <Text key={i} style={{ color: "#f9fafb", fontSize: "14px", margin: "0 0 6px 0" }}>
                • {line}
              </Text>
            ))}
          </Section>

          <SectionCard emoji="🧩" title="오늘의 코딩테스트" accentColor="#2563eb">
            <CodingTestSection content={briefing.sections.codingTest} />
          </SectionCard>

          <SectionCard emoji="📘" title="오늘의 전공 지식" accentColor="#7c3aed">
            <TechConceptSection content={briefing.sections.techConcept} />
          </SectionCard>

          <SectionCard emoji="🎤" title="면접 대비" accentColor="#db2777">
            <InterviewSection content={briefing.sections.interview} />
          </SectionCard>

          <SectionCard emoji="🤖" title="AI / Computer Vision 뉴스" accentColor="#059669">
            <AiNewsSection content={briefing.sections.aiNews} />
          </SectionCard>

          <SectionCard emoji="💼" title="취업 정보" accentColor="#d97706">
            <JobMarketSection content={briefing.sections.jobMarket} />
          </SectionCard>

          <SectionCard emoji="🔩" title="반도체 / 임베디드 뉴스" accentColor="#0891b2">
            <SemiconductorSection content={briefing.sections.semiconductor} />
          </SectionCard>

          <SectionCard emoji="📈" title="미국 증시 브리핑" accentColor="#dc2626">
            <StockMarketSection content={briefing.sections.stockMarket} />
          </SectionCard>

          <Hr style={{ margin: "20px 0" }} />
          <Text style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center" }}>
            Daily Briefing AI Assistant · 개인용 MVP
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
