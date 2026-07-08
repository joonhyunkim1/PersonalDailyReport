import { Hr, Text } from "@react-email/components";
import { Field } from "@/lib/email/templates/Field";
import type { JobMarketContent } from "@/types/briefing";

export function JobMarketSection({ content }: { content: JobMarketContent }) {
  return (
    <>
      {content.items.map((job, i) => (
        <div key={i}>
          <Text style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 4px 0" }}>
            {job.company} · {job.role}
          </Text>
          <Field label="요구 기술:" value={job.requiredSkills.join(", ")} />
          <Field label="왜 관심 가져야 하는지:" value={job.whyRelevant} />
          {i < content.items.length - 1 && <Hr style={{ margin: "10px 0" }} />}
        </div>
      ))}
    </>
  );
}
