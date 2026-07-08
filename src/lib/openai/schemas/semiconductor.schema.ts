import { z } from "zod";

export const SemiconductorSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string(),
        industryImpact: z.string(),
        aiEngineerImpact: z.string(),
      })
    )
    .min(1)
    .max(3),
});

export type SemiconductorSchemaType = z.infer<typeof SemiconductorSchema>;
