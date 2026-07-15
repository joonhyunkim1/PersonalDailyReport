import { Hr, Text } from "@react-email/components";
import { Field } from "@/lib/email/templates/Field";
import type { CodingTestContent } from "@/types/briefing";

export function CodingTestSection({ content }: { content: CodingTestContent }) {
  return (
    <>
      {content.problems.map((p, i) => (
        <div key={i}>
          <Text
            className="db-card-title"
            style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 4px 0" }}
          >
            {p.name} · {p.platform} · {p.difficulty}
          </Text>
          <Field label="추천 이유:" value={p.reason} />
          <Field label="학습 포인트:" value={p.learningPoint} />
          <Field label="기업 연관성:" value={p.companyRelevance} />
          {i < content.problems.length - 1 && <Hr style={{ margin: "10px 0" }} />}
        </div>
      ))}
    </>
  );
}
