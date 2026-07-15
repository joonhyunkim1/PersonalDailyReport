import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const lastSuccessfulRun = await prisma.briefingRun.findFirst({
      where: { status: "SUCCESS" },
      orderBy: { runDate: "desc" },
    });

    return NextResponse.json({
      status: "ok",
      dbConnected: true,
      lastSuccessfulRunDate: lastSuccessfulRun?.runDate ?? null,
    });
  } catch (error) {
    logger.error("health DB check failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { status: "error", dbConnected: false },
      { status: 500 }
    );
  }
}
