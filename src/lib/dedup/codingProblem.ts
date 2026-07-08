import { prisma } from "@/lib/db/prisma";

const LOOKBACK_DAYS = 30;

export async function getRecentProblemNames(userId: string): Promise<string[]> {
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const rows = await prisma.codingProblemHistory.findMany({
    where: { userId, sentAt: { gte: since } },
    select: { problemName: true },
  });
  return rows.map((r) => r.problemName);
}

export async function recordCodingProblems(
  userId: string,
  problems: { name: string; platform: string; difficulty: string; learningPoint: string }[]
): Promise<void> {
  if (problems.length === 0) return;
  await prisma.codingProblemHistory.createMany({
    data: problems.map((p) => ({
      userId,
      problemName: p.name,
      platform: p.platform,
      difficulty: p.difficulty,
      topicTag: p.learningPoint,
    })),
  });
}
