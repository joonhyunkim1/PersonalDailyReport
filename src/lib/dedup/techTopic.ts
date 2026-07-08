import { prisma } from "@/lib/db/prisma";
import type { TopicLevel } from "@/types/briefing";

const COOLDOWN_DAYS = 14;
const LEVEL_ORDER: TopicLevel[] = ["BASIC", "INTERMEDIATE", "ADVANCED"];

function nextLevel(current: TopicLevel): TopicLevel {
  const idx = LEVEL_ORDER.indexOf(current);
  return LEVEL_ORDER[Math.min(idx + 1, LEVEL_ORDER.length - 1)];
}

export interface TopicPick {
  topic: string;
  category: string;
  level: TopicLevel;
  /** false if this topic has been covered before (revisit/escalation). */
  isNew: boolean;
}

// Selection algorithm per docs/DESIGN.md section 3.4: new topics start at
// BASIC, existing topics escalate to the next level (capped at ADVANCED),
// with a 14-day cooldown per topic and a shifting new/existing pick ratio
// once the catalog has been fully introduced at least once.
export async function pickNextTopic(userId: string): Promise<TopicPick> {
  const now = new Date();

  const [catalog, progress] = await Promise.all([
    prisma.techTopicCatalog.findMany({ where: { isActive: true } }),
    prisma.techTopicProgress.findMany({ where: { userId } }),
  ]);

  const progressTopics = new Set(progress.map((p) => p.topic));
  const newCandidates = catalog.filter((c) => !progressTopics.has(c.topic));
  const eligibleExisting = progress.filter(
    (p) => !p.nextEligibleAt || p.nextEligibleAt <= now
  );

  const catalogFullyCovered = newCandidates.length === 0;
  const pickNewProbability = catalogFullyCovered ? 0.3 : 0.7;
  const useNew = newCandidates.length > 0 && Math.random() < pickNewProbability;

  if (useNew) {
    const pick = newCandidates[Math.floor(Math.random() * newCandidates.length)];
    return { topic: pick.topic, category: pick.category, level: "BASIC", isNew: true };
  }

  if (eligibleExisting.length > 0) {
    const pick = eligibleExisting[Math.floor(Math.random() * eligibleExisting.length)];
    const level = nextLevel(pick.currentLevel as TopicLevel);
    return { topic: pick.topic, category: pick.category, level, isNew: false };
  }

  // Fallback: everything is on cooldown (unlikely with this catalog size) —
  // ignore cooldown and reuse the least-recently-sent topic instead of failing.
  if (progress.length > 0) {
    const sorted = [...progress].sort(
      (a, b) => (a.lastSentAt?.getTime() ?? 0) - (b.lastSentAt?.getTime() ?? 0)
    );
    const pick = sorted[0];
    const level = nextLevel(pick.currentLevel as TopicLevel);
    return { topic: pick.topic, category: pick.category, level, isNew: false };
  }

  // Absolute fallback (empty catalog/progress, shouldn't happen post-seed).
  const pick = catalog[Math.floor(Math.random() * catalog.length)];
  return { topic: pick.topic, category: pick.category, level: "BASIC", isNew: true };
}

export async function recordTechTopicUsage(
  userId: string,
  pick: TopicPick
): Promise<{ techTopicHistoryId: string }> {
  const now = new Date();
  const nextEligibleAt = new Date(now.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.techTopicProgress.upsert({
    where: { userId_topic: { userId, topic: pick.topic } },
    update: {
      currentLevel: pick.level,
      timesCovered: { increment: 1 },
      lastSentAt: now,
      nextEligibleAt,
    },
    create: {
      userId,
      topic: pick.topic,
      category: pick.category,
      currentLevel: pick.level,
      timesCovered: 1,
      lastSentAt: now,
      nextEligibleAt,
    },
  });

  const history = await prisma.techTopicHistory.create({
    data: {
      userId,
      topic: pick.topic,
      category: pick.category,
      level: pick.level,
    },
  });

  return { techTopicHistoryId: history.id };
}
