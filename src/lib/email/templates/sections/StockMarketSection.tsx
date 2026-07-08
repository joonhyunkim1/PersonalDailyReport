import { Field } from "@/lib/email/templates/Field";
import type { StockMarketContent } from "@/types/briefing";

export function StockMarketSection({ content }: { content: StockMarketContent }) {
  return (
    <>
      <Field label="시장 요약:" value={content.summary} />
      <Field label="상승/하락 요인:" value={content.upDownFactors} />
      <Field label="AI 산업 영향:" value={content.aiIndustryImpact} />
      <Field label="오늘의 이벤트:" value={content.todayEvents} />
    </>
  );
}
