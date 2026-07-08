import { Hr, Text } from "@react-email/components";
import { Field } from "@/lib/email/templates/Field";
import type { AiNewsContent } from "@/types/briefing";

export function AiNewsSection({ content }: { content: AiNewsContent }) {
  return (
    <>
      {content.items.map((item, i) => (
        <div key={i}>
          <Text style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 4px 0" }}>
            {item.title}
          </Text>
          <Field label="핵심 요약:" value={item.summary} />
          <Field label="왜 중요한가:" value={item.whyItMatters} />
          <Field label="연구자 관점:" value={item.researcherView} />
          <Field label="엔지니어 관점:" value={item.engineerView} />
          {i < content.items.length - 1 && <Hr style={{ margin: "10px 0" }} />}
        </div>
      ))}
    </>
  );
}
