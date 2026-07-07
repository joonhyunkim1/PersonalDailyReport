import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";

// Phase 0: stub only. Logs the invocation and records a PENDING BriefingRun
// so we can verify end-to-end wiring (auth -> DB -> response) before any
// content-generation modules exist. Real orchestration lands in Phase 1/2.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[cron/daily-briefing] triggered at", new Date().toISOString());

  const user = await prisma.user.upsert({
    where: { email: env.RECIPIENT_EMAIL },
    update: {},
    create: { email: env.RECIPIENT_EMAIL },
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const run = await prisma.briefingRun.upsert({
    where: { userId_runDate: { userId: user.id, runDate: today } },
    update: {},
    create: { userId: user.id, runDate: today, status: "PENDING" },
  });

  console.log("[cron/daily-briefing] run record:", run.id, run.status);

  return NextResponse.json({
    runId: run.id,
    status: run.status,
    dryRun: env.DRY_RUN,
  });
}
