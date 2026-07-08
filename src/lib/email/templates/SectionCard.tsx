import { Heading, Section } from "@react-email/components";
import type { ReactNode } from "react";

interface SectionCardProps {
  emoji: string;
  title: string;
  accentColor: string;
  children: ReactNode;
}

export function SectionCard({ emoji, title, accentColor, children }: SectionCardProps) {
  return (
    <Section
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "16px",
      }}
    >
      <Heading
        as="h2"
        style={{ fontSize: "16px", margin: "0 0 12px 0", color: "#111827" }}
      >
        {emoji} {title}
      </Heading>
      {children}
    </Section>
  );
}
