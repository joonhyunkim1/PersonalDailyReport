import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js's build-time file tracing statically analyzes imports and
  // misses @sparticuz/chromium's Brotli binary assets (loaded dynamically
  // at runtime), so the cron route's Vercel deployment was missing
  // node_modules/@sparticuz/chromium/bin/* entirely, breaking PDF
  // generation (renderBriefingPdf) in production. Force-include them.
  outputFileTracingIncludes: {
    "/api/cron/daily-briefing": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
