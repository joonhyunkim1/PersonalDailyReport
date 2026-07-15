import { render } from "@react-email/render";
import puppeteer from "puppeteer";
import { DailyBriefingEmail } from "@/lib/email/templates/DailyBriefingEmail";
import type { BriefingJSON } from "@/types/briefing";

// Renders the same email component actually sent, as a PDF, so the
// attachment matches the email 1:1. Uses full `puppeteer` (bundled
// Chromium) — fine for local dev and Vercel's Node runtime today, but if
// this hits serverless size/cold-start limits after deploying, swap to
// `puppeteer-core` + `@sparticuz/chromium` (the standard combo for
// running headless Chrome on Vercel/Lambda).
export async function renderBriefingPdf(briefing: BriefingJSON): Promise<Buffer> {
  const html = await render(DailyBriefingEmail({ briefing }));

  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export function pdfFilenameFor(briefing: BriefingJSON): string {
  return `Daily-Briefing-${briefing.dateLabel}.pdf`;
}
