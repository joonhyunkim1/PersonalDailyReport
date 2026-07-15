import { Text } from "@react-email/components";
import { Field } from "@/lib/email/templates/Field";
import type { TechConceptContent } from "@/types/briefing";

export function TechConceptSection({ content }: { content: TechConceptContent }) {
  return (
    <>
      <Text
        className="db-card-title"
        style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 6px 0" }}
      >
        {content.topic} ({content.category} · {content.level})
      </Text>
      <Field label="핵심 개념:" value={content.coreConcept} />
      <Field label="왜 등장했는가:" value={content.background} />
      <Field label="장점:" value={content.pros} />
      <Field label="단점:" value={content.cons} />
      <Field label="활용 사례:" value={content.useCase} />
      <Field label="비교:" value={content.comparison} />
    </>
  );
}
