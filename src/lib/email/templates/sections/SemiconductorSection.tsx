import { Hr, Text } from "@react-email/components";
import { Field } from "@/lib/email/templates/Field";
import type { SemiconductorContent } from "@/types/briefing";

export function SemiconductorSection({ content }: { content: SemiconductorContent }) {
  return (
    <>
      {content.items.map((item, i) => (
        <div key={i}>
          <Text style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 4px 0" }}>
            {item.title}
          </Text>
          <Field label="핵심 뉴스:" value={item.summary} />
          <Field label="산업 영향:" value={item.industryImpact} />
          <Field label="AI 엔지니어 영향:" value={item.aiEngineerImpact} />
          {i < content.items.length - 1 && <Hr style={{ margin: "10px 0" }} />}
        </div>
      ))}
    </>
  );
}
