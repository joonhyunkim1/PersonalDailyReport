import { logger } from "@/lib/logger";
import type { ModuleResult, SectionType } from "@/lib/modules/types";

const RETRY_BACKOFF_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fail-soft wrapper (docs/DESIGN.md section 2.2 / 6.6 / Phase 5): one retry
// with a short backoff, then fall back to static placeholder content so the
// email always goes out instead of the whole run failing over one section.
export async function withRetryFallback<T>(
  sectionType: SectionType,
  fn: () => Promise<ModuleResult<T>>,
  fallbackContent: T
): Promise<ModuleResult<T>> {
  try {
    return await fn();
  } catch (firstError) {
    logger.warn("module failed, retrying", {
      sectionType,
      error: firstError instanceof Error ? firstError.message : String(firstError),
    });

    await sleep(RETRY_BACKOFF_MS);

    try {
      return await fn();
    } catch (secondError) {
      const errorMessage =
        secondError instanceof Error ? secondError.message : String(secondError);
      logger.error("module failed after retry, using fallback content", {
        sectionType,
        error: errorMessage,
      });

      return {
        status: "FALLBACK",
        content: fallbackContent,
        tokensInput: 0,
        tokensOutput: 0,
        costUsd: 0,
        errorMessage,
      };
    }
  }
}
