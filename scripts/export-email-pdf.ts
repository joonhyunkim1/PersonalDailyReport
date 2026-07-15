import { mkdirSync } from "fs";
import { render } from "@react-email/render";
import puppeteer from "puppeteer";
import { DailyBriefingEmail } from "../src/lib/email/templates/DailyBriefingEmail";
import sample from "../src/lib/email/fixtures/sample-briefing.json";
import type { BriefingJSON } from "../src/types/briefing";

// Dev-only design tool: renders the *actual* email template (same
// component used for real sends) to PDF via a headless browser, fed by
// the local fixture — no OpenAI calls. Not used in production/Vercel.
async function main() {
  const html = await render(DailyBriefingEmail({ briefing: sample as BriefingJSON }));

  mkdirSync("exports", { recursive: true });
  const outPath = "exports/daily-briefing-preview.pdf";

  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({
      path: outPath,
      format: "a4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });
  } finally {
    await browser.close();
  }

  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
