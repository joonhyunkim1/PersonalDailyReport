import { DailyBriefingEmail } from "../src/lib/email/templates/DailyBriefingEmail";
import sample from "../src/lib/email/fixtures/sample-briefing.json";
import type { BriefingJSON } from "../src/types/briefing";

// Live design preview fed by a real (already-generated, already-paid-for)
// BriefingJSON fixture — no OpenAI calls needed while iterating on the
// email design. Regenerate the fixture only when the underlying content
// shape changes (see src/lib/email/fixtures/sample-briefing.json).
export default function DailyBriefingPreview() {
  return <DailyBriefingEmail briefing={sample as BriefingJSON} />;
}
