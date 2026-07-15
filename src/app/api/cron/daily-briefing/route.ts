import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { runPipeline } from "@/lib/orchestrator/pipeline";
import { composeBriefing } from "@/lib/orchestrator/composer";
import { renderBriefingEmail } from "@/lib/email/render";
import { sendBriefingEmail } from "@/lib/email/send";
import { getKstDateAsUtcMidnight, getKstDateLabel } from "@/lib/date";
import { pdfFilenameFor, renderBriefingPdf } from "@/lib/pdf/renderBriefingPdf";
import { logger } from "@/lib/logger";

// The full pipeline (5 OpenAI-backed sections incl. two-pass web_search,
// plus a headless-Chromium PDF render) took up to ~95s in local testing;
// 300s is the max the Vercel Hobby plan allows, so we ask for all of it.
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dateLabel = getKstDateLabel(now);
  const runDate = getKstDateAsUtcMidnight(now);

  logger.info("cron triggered", { triggeredAt: now.toISOString(), dateLabel });

  const user = await prisma.user.upsert({
    where: { email: env.RECIPIENT_EMAIL },
    update: {},
    create: { email: env.RECIPIENT_EMAIL },
  });

  const existingRun = await prisma.briefingRun.findUnique({
    where: { userId_runDate: { userId: user.id, runDate } },
  });

  if (existingRun?.status === "SUCCESS") {
    logger.info("already sent today, skipping", { runId: existingRun.id });
    return NextResponse.json({ runId: existingRun.id, status: "ALREADY_SENT" });
  }

  const run = existingRun
    ? await prisma.briefingRun.update({
        where: { id: existingRun.id },
        data: { status: "RUNNING" },
      })
    : await prisma.briefingRun.create({
        data: { userId: user.id, runDate, status: "RUNNING" },
      });

  try {
    const sectionResults = await runPipeline({ today: dateLabel, userId: user.id });
    const briefing = composeBriefing(run.id, dateLabel, sectionResults);
    const email = await renderBriefingEmail(briefing);

    let messageId: string | null = null;
    if (!env.DRY_RUN) {
      let attachment: { filename: string; content: Buffer } | undefined;
      try {
        attachment = {
          filename: pdfFilenameFor(briefing),
          content: await renderBriefingPdf(briefing),
        };
      } catch (pdfError) {
        // PDF attachment is a nice-to-have — never block the email over it.
        logger.error("PDF render failed, sending without attachment", {
          error: pdfError instanceof Error ? pdfError.message : String(pdfError),
        });
      }

      const sendResult = await sendBriefingEmail(email, attachment);
      messageId = sendResult.messageId;
    } else {
      logger.info("DRY_RUN active, skipping actual send", { subject: email.subject });
    }

    const hasFailure = sectionResults.some((r) => r.result.status !== "SUCCESS");
    const totalCostUsd = sectionResults.reduce(
      (sum, r) => sum + r.result.costUsd,
      0
    );

    await prisma.$transaction([
      ...sectionResults.map((r) =>
        prisma.briefingSection.create({
          data: {
            runId: run.id,
            sectionType: r.type,
            status: r.result.status,
            contentJson: r.result.content as Prisma.InputJsonValue,
            tokensInput: r.result.tokensInput,
            tokensOutput: r.result.tokensOutput,
            costUsd: r.result.costUsd,
            errorMessage: r.result.errorMessage,
          },
        })
      ),
      prisma.briefingRun.update({
        where: { id: run.id },
        data: {
          status: hasFailure ? "PARTIAL" : "SUCCESS",
          finishedAt: new Date(),
          totalCostUsd,
          emailMessageId: messageId,
        },
      }),
      ...(messageId
        ? [prisma.emailDeliveryLog.create({ data: { runId: run.id, messageId } })]
        : []),
    ]);

    logger.info("run complete", {
      runId: run.id,
      status: hasFailure ? "PARTIAL" : "SUCCESS",
      costUsd: totalCostUsd,
      degradedSections: sectionResults
        .filter((r) => r.result.status !== "SUCCESS")
        .map((r) => r.type),
    });

    return NextResponse.json({
      runId: run.id,
      status: hasFailure ? "PARTIAL" : "SUCCESS",
      dryRun: env.DRY_RUN,
      costUsd: totalCostUsd,
    });
  } catch (error) {
    logger.error("pipeline failed", {
      runId: run.id,
      error: error instanceof Error ? error.message : String(error),
    });
    await prisma.briefingRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorSummary: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json({ runId: run.id, status: "FAILED" }, { status: 500 });
  }
}
