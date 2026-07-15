type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const line = { timestamp: new Date().toISOString(), level, message, ...meta };
  const out = JSON.stringify(line);
  if (level === "error") console.error(out);
  else if (level === "warn") console.warn(out);
  else console.log(out);
}

// Minimal structured (JSON-lines) logger — Vercel captures stdout/stderr
// as-is, so plain console.log lines don't carry queryable fields. This
// keeps a consistent {timestamp, level, message, ...meta} shape without
// pulling in a full logging library for a single-user MVP.
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};
