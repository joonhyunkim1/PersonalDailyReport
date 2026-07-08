import { z } from "zod";

export const InterviewSchema = z.object({
  topic: z.string(),
  level: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]),
  questions: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      followUp: z.string(),
    })
  ),
});

export type InterviewSchemaType = z.infer<typeof InterviewSchema>;
