import { render } from "@react-email/render";
import { DailyBriefingEmail } from "@/lib/email/templates/DailyBriefingEmail";
import type { BriefingJSON } from "@/types/briefing";

export interface RenderedBriefingEmail {
  subject: string;
  react: React.ReactElement;
  text: string;
}

export async function renderBriefingEmail(
  briefing: BriefingJSON
): Promise<RenderedBriefingEmail> {
  const react = DailyBriefingEmail({ briefing });
  const text = await render(react, { plainText: true });

  return { subject: briefing.subject, react, text };
}
