import { Hr, Text } from "@react-email/components";
import { Field } from "@/lib/email/templates/Field";
import type { InterviewContent } from "@/types/briefing";

export function InterviewSection({ content }: { content: InterviewContent }) {
  return (
    <>
      {content.questions.map((q, i) => (
        <div key={i}>
          <Text
            className="db-card-title"
            style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 4px 0" }}
          >
            Q. {q.question}
          </Text>
          <Field label="모범 답변:" value={q.answer} />
          <Field label="꼬리 질문:" value={q.followUp} />
          {i < content.questions.length - 1 && <Hr style={{ margin: "10px 0" }} />}
        </div>
      ))}
    </>
  );
}
