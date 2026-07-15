import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { SectionCard } from "@/lib/email/templates/SectionCard";
import { CodingTestSection } from "@/lib/email/templates/sections/CodingTestSection";
import { TechConceptSection } from "@/lib/email/templates/sections/TechConceptSection";
import { InterviewSection } from "@/lib/email/templates/sections/InterviewSection";
import { AiNewsSection } from "@/lib/email/templates/sections/AiNewsSection";
import { StockMarketSection } from "@/lib/email/templates/sections/StockMarketSection";
// JobMarketSection: paused (not rendered) — kept for future reuse, see
// lib/modules/jobMarket.
import type { BriefingJSON } from "@/types/briefing";

// Email clients apply dark mode via the OS/client theme regardless of our
// inline styles, so light-colored text-on-white cards can go
// unreadable/washed out unless we explicitly override with a media-query
// style block. Inline styles remain the light-mode (and non-dark-mode-aware
// client) baseline; the classNames below are pure hooks for this block.
const DARK_MODE_STYLE = `
@media (prefers-color-scheme: dark) {
  .db-body { background-color: #0b0f19 !important; }
  .db-heading { color: #f3f4f6 !important; }
  .db-card { background-color: #161b26 !important; border-color: #2a3140 !important; }
  .db-card-title { color: #f3f4f6 !important; }
  .db-field-text { color: #cbd5e1 !important; }
  .db-field-text strong { color: #f3f4f6 !important; }
  .db-muted { color: #6b7280 !important; }
}
`;

// TL;DR summary box: disabled per user feedback (2026-07-15) — inconsistent
// with the rest of the design and not useful in practice. Kept in code
// (not deleted) in case it's revisited later; flip to true to re-enable.
const SHOW_TLDR = false;

export function DailyBriefingEmail({ briefing }: { briefing: BriefingJSON }) {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{DARK_MODE_STYLE}</style>
      </Head>
      <Preview>{briefing.tldr.join(" · ")}</Preview>
      <Body
        className="db-body"
        style={{ backgroundColor: "#f3f4f6", fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        <Container style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 16px" }}>
          <Row>
            <Column />
            <Column align="right">
              <Text
                className="db-muted"
                style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}
              >
                {briefing.dateLabel}
              </Text>
            </Column>
          </Row>

          <Heading
            as="h1"
            className="db-heading"
            style={{
              textAlign: "center",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "0.3px",
              color: "#111827",
              margin: "4px 0 24px 0",
            }}
          >
            Daily Briefing
          </Heading>

          {SHOW_TLDR && (
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
          )}

          <SectionCard emoji="🧩" title="오늘의 코딩테스트" accentColor="#2563eb">
            <CodingTestSection content={briefing.sections.codingTest} />
          </SectionCard>

          <SectionCard emoji="📘" title="오늘의 전공 지식" accentColor="#7c3aed">
            <TechConceptSection content={briefing.sections.techConcept} />
          </SectionCard>

          <SectionCard emoji="🎤" title="면접 대비" accentColor="#db2777">
            <InterviewSection content={briefing.sections.interview} />
          </SectionCard>

          <SectionCard emoji="🤖" title="AI / 임베디드 뉴스" accentColor="#059669">
            <AiNewsSection content={briefing.sections.aiNews} />
          </SectionCard>

          <SectionCard emoji="📈" title="미국 증시 브리핑" accentColor="#dc2626">
            <StockMarketSection content={briefing.sections.stockMarket} />
          </SectionCard>

          <Hr style={{ margin: "20px 0" }} />
          <Text
            className="db-muted"
            style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center" }}
          >
            Daily Briefing AI Assistant · 개인용 MVP
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
