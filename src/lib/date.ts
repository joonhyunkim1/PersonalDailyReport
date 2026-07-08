const KST_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Returns the KST calendar date as "YYYY-MM-DD". */
export function getKstDateLabel(date: Date = new Date()): string {
  return KST_DATE_FORMATTER.format(date);
}

/**
 * Returns the KST calendar date as a UTC-midnight Date, suitable for
 * storing in a `@db.Date` column keyed on "which KST day is this for".
 * Vercel Cron fires at 23:00 UTC (08:00 KST the next day), so deriving
 * the run date from the KST calendar day (not raw UTC truncation) avoids
 * off-by-one-day bugs against BriefingRun's [userId, runDate] uniqueness.
 */
export function getKstDateAsUtcMidnight(date: Date = new Date()): Date {
  return new Date(`${getKstDateLabel(date)}T00:00:00.000Z`);
}
