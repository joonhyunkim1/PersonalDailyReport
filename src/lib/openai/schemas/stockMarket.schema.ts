import { z } from "zod";

export const StockMarketSchema = z.object({
  summary: z.string(),
  upDownFactors: z.string(),
  aiIndustryImpact: z.string(),
  todayEvents: z.string(),
});

export type StockMarketSchemaType = z.infer<typeof StockMarketSchema>;
