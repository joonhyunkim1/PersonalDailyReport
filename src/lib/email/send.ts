import { Resend } from "resend";
import { env } from "@/lib/env";
import type { RenderedBriefingEmail } from "@/lib/email/render";

const resend = new Resend(env.RESEND_API_KEY);

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export async function sendBriefingEmail(
  email: RenderedBriefingEmail,
  attachment?: EmailAttachment
): Promise<{ messageId: string }> {
  const { data, error } = await resend.emails.send({
    from: "Daily Briefing <onboarding@resend.dev>",
    to: env.RECIPIENT_EMAIL,
    subject: email.subject,
    react: email.react,
    text: email.text,
    ...(attachment ? { attachments: [attachment] } : {}),
  });

  if (error || !data) {
    throw new Error(`Resend send failed: ${error?.message ?? "unknown error"}`);
  }

  return { messageId: data.id };
}
