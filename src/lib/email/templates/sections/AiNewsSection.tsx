import { Hr, Link, Text } from "@react-email/components";
import { Field } from "@/lib/email/templates/Field";
import type { AiNewsContent, NewsItem } from "@/types/briefing";

function SourceLine({ item }: { item: NewsItem }) {
  if (!item.sourceName && !item.sourceUrl) return null;
  const label = item.sourceName ?? item.sourceUrl;
  return (
    <Text
      className="db-muted"
      style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0" }}
    >
      출처:{" "}
      {item.sourceUrl ? (
        <Link href={item.sourceUrl} style={{ color: "#059669" }}>
          {label}
        </Link>
      ) : (
        label
      )}
      {item.publishedDate ? ` · ${item.publishedDate}` : ""}
    </Text>
  );
}

export function AiNewsSection({ content }: { content: AiNewsContent }) {
  return (
    <>
      {content.items.map((item, i) => (
        <div key={i}>
          <Text
            className="db-card-title"
            style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 4px 0" }}
          >
            {item.title}
          </Text>
          <Field label="핵심 요약:" value={item.summary} />
          {item.keyFacts && item.keyFacts.length > 0 && (
            <Field label="핵심 사실:" value={item.keyFacts.join(" · ")} />
          )}
          <Field label="왜 중요한가:" value={item.whyItMatters} />
          <Field label="연구자 관점:" value={item.researcherView} />
          <Field label="엔지니어 관점:" value={item.engineerView} />
          <SourceLine item={item} />
          {i < content.items.length - 1 && <Hr style={{ margin: "10px 0" }} />}
        </div>
      ))}
    </>
  );
}
