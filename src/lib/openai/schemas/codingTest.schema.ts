import { z } from "zod";

export const CodingTestSchema = z.object({
  problems: z
    .array(
      z.object({
        name: z.string(),
        platform: z.string(),
        difficulty: z.string(),
        reason: z.string(),
        learningPoint: z.string(),
        companyRelevance: z.string(),
      })
    )
    .min(1)
    .max(3),
});

export type CodingTestSchemaType = z.infer<typeof CodingTestSchema>;
