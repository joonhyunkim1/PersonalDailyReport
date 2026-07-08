import { z } from "zod";

export const JobMarketSchema = z.object({
  items: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        requiredSkills: z.array(z.string()),
        whyRelevant: z.string(),
      })
    )
    .min(1)
    .max(5),
});

export type JobMarketSchemaType = z.infer<typeof JobMarketSchema>;
