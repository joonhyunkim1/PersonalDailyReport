-- AlterEnum
BEGIN;
CREATE TYPE "SectionType_new" AS ENUM ('CODING_TEST', 'TECH_CONCEPT', 'INTERVIEW', 'AI_NEWS', 'JOB_MARKET', 'STOCK_MARKET');
ALTER TABLE "BriefingSection" ALTER COLUMN "sectionType" TYPE "SectionType_new" USING ("sectionType"::text::"SectionType_new");
ALTER TABLE "NewsArticleSeen" ALTER COLUMN "sourceType" TYPE "SectionType_new" USING ("sourceType"::text::"SectionType_new");
ALTER TYPE "SectionType" RENAME TO "SectionType_old";
ALTER TYPE "SectionType_new" RENAME TO "SectionType";
DROP TYPE "SectionType_old";
COMMIT;
