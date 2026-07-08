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
      })
    )
    .min(1)
    .max(3),
});

export type AiNewsSchemaType = z.infer<typeof AiNewsSchema>;
