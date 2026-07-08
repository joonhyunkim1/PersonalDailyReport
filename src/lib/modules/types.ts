import type { $Enums } from "@/generated/prisma/client";

export type SectionType = $Enums.SectionType;

export interface ModuleContext {
  today: string; // KST date label, e.g. "2026-07-08"
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
}

export interface SectionModule<T> {
  type: SectionType;
  generate(ctx: ModuleContext): Promise<ModuleResult<T>>;
}
