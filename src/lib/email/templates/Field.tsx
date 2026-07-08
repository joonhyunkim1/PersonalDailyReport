import { Text } from "@react-email/components";

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <Text style={{ fontSize: "13px", lineHeight: "1.6", color: "#374151", margin: "0 0 4px 0" }}>
      <strong style={{ color: "#111827" }}>{label}</strong> {value}
    </Text>
  );
}
