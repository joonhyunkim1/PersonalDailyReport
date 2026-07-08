import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { runPipeline } from "@/lib/orchestrator/pipeline";
import { composeBriefing } from "@/lib/orchestrator/composer";
import { renderBriefingEmail } from "@/lib/email/render";
import { sendBriefingEmail } from "@/lib/email/send";
import { getKstDateAsUtcMidnight, getKstDateLabel } from "@/lib/date";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dateLabel = getKstDateLabel(now);
  const runDate = getKstDateAsUtcMidnight(now);

  console.log(
    "[cron/daily-briefing] triggered at",
    now.toISOString(),
    "for KST date",
    dateLabel
  );

  const user = await prisma.user.upsert({
    where: { email: env.RECIPIENT_EMAIL },
    update: {},
    create: { email: env.RECIPIENT_EMAIL },
  });

  const existingRun = await prisma.briefingRun.findUnique({
    where: { userId_runDate: { userId: user.id, runDate } },
  });

  if (existingRun?.status === "SUCCESS") {
    console.log(
      "[cron/daily-briefing] already sent today, skipping:",
      existingRun.id
    );
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
      const sendResult = await sendBriefingEmail(email);
      messageId = sendResult.messageId;
    } else {
      console.log(
        "[cron/daily-briefing] DRY_RUN active, skipping actual send. Subject:",
        email.subject
      );
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

    console.log(
      "[cron/daily-briefing] run complete:",
      run.id,
      hasFailure ? "PARTIAL" : "SUCCESS"
    );

    return NextResponse.json({
      runId: run.id,
      status: hasFailure ? "PARTIAL" : "SUCCESS",
      dryRun: env.DRY_RUN,
      costUsd: totalCostUsd,
    });
  } catch (error) {
    console.error("[cron/daily-briefing] pipeline failed:", error);
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
