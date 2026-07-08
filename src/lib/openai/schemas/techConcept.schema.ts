import { z } from "zod";

export const TechConceptSchema = z.object({
  topic: z.string(),
  category: z.string(),
  level: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]),
  coreConcept: z.string(),
  background: z.string(),
  pros: z.string(),
  cons: z.string(),
  useCase: z.string(),
  comparison: z.string(),
});

export type TechConceptSchemaType = z.infer<typeof TechConceptSchema>;
