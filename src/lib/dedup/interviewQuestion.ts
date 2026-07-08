import { prisma } from "@/lib/db/prisma";
import type { TopicLevel } from "@/types/briefing";

export async function recordInterviewQuestions(
  techTopicHistoryId: string,
  level: TopicLevel,
  questions: { question: string }[]
): Promise<void> {
  if (questions.length === 0) return;
  await prisma.interviewQuestionHistory.createMany({
    data: questions.map((q) => ({
      techTopicHistoryId,
      level,
      question: q.question,
    })),
  });
}
