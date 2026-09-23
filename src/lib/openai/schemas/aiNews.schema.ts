import { z } from "zod";

export const AiNewsSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string(),
        whyItMatters: z.string(),
        researcherView: z.string(),
        engineerView: z.string(),
        // Concrete facts/figures from the source (dates, numbers, specs,
        // partners) — the DR_to_Insta Instagram channel builds its posts
        // from these, so they must come from the research, not be invented.
        keyFacts: z.array(z.string()).min(2).max(4),
        sourceName: z.string().nullable(),
        sourceUrl: z.string().nullable(),
        publishedDate: z.string().nullable(),
      })
    )
    .min(5)
    .max(6),
});

export type AiNewsSchemaType = z.infer<typeof AiNewsSchema>;
