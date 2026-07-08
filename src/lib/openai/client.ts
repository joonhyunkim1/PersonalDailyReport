import OpenAI from "openai";
import { env } from "@/lib/env";

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

// Model tiering per docs/DESIGN.md section 6.2. Re-verify these ids
// periodically against OpenAI's current model list — names/pricing churn.
export const MODELS = {
  reasoning: "gpt-5.4",
  mini: "gpt-5.4-mini",
} as const;
