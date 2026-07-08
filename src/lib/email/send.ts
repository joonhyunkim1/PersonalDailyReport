import { Resend } from "resend";
import { env } from "@/lib/env";
import type { RenderedBriefingEmail } from "@/lib/email/render";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendBriefingEmail(
  email: RenderedBriefingEmail
): Promise<{ messageId: string }> {
  const { data, error } = await resend.emails.send({
    from: "Daily Briefing <onboarding@resend.dev>",
    to: env.RECIPIENT_EMAIL,
    subject: email.subject,
    react: email.react,
    text: email.text,
  });

  if (error || !data) {
    throw new Error(`Resend send failed: ${error?.message ?? "unknown error"}`);
  }

  return { messageId: data.id };
}
