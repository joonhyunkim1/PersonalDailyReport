import { render } from "@react-email/render";
import { DailyBriefingEmail } from "@/lib/email/templates/DailyBriefingEmail";
import type { BriefingJSON } from "@/types/briefing";

// Renders the same email component actually sent, as a PDF, so the
// attachment matches the email 1:1.
//
// Full `puppeteer` (bundled Chromium) is fine for local dev, but its ~300MB
// Chromium download doesn't fit Vercel's serverless deployment size limits.
// On Vercel (`process.env.VERCEL` is set automatically), we instead launch
// `puppeteer-core` against `@sparticuz/chromium`'s serverless-optimized
// binary — the standard combo for headless Chrome on Vercel/Lambda.
async function launchBrowser() {
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const { launch } = await import("puppeteer-core");
    return launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  }

  const { launch } = await import("puppeteer");
  return launch();
}

export async function renderBriefingPdf(briefing: BriefingJSON): Promise<Buffer> {
  const html = await render(DailyBriefingEmail({ briefing }));

  const browser = await launchBrowser();
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
