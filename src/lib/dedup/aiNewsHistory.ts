import { prisma } from "@/lib/db/prisma";

const LOOKBACK_DAYS = 7;

// Pragmatic dedup: reuse the titles already stored in past BriefingSection
// rows instead of NewsArticleSeen. NewsArticleSeen is keyed by URL hash, but
// our current AI_NEWS structured output doesn't capture real source URLs
// (see docs/DESIGN.md section 7.3) — revisit if/when that's added.
export async function getRecentAiNewsTitles(userId: string): Promise<string[]> {
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const sections = await prisma.briefingSection.findMany({
    where: {
      sectionType: "AI_NEWS",
      run: { userId, startedAt: { gte: since } },
    },
    select: { contentJson: true },
  });

  const titles: string[] = [];
  for (const section of sections) {
    const content = section.contentJson as { items?: { title?: string }[] } | null;
    for (const item of content?.items ?? []) {
      if (item.title) titles.push(item.title);
    }
  }
  return titles;
}
