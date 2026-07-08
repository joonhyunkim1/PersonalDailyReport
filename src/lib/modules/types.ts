import type { $Enums } from "@/generated/prisma/client";

export type SectionType = $Enums.SectionType;

export interface ModuleContext {
  today: string; // KST date label, e.g. "2026-07-08"
  userId: string;
  /** Results from modules this module depends on (e.g. INTERVIEW reads TECH_CONCEPT's output). */
  upstream?: Record<string, unknown>;
}

export interface ModuleResult<T> {
  status: "SUCCESS" | "FALLBACK" | "ERROR";
  content: T;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  errorMessage?: string;
  /** Internal orchestrator bookkeeping not meant for email rendering
   * (e.g. TECH_CONCEPT passes its TechTopicHistory id so INTERVIEW can
   * link its questions to it). */
  meta?: Record<string, unknown>;
}

export interface SectionModule<T> {
  type: SectionType;
  generate(ctx: ModuleContext): Promise<ModuleResult<T>>;
}
