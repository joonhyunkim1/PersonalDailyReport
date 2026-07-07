-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('CODING_TEST', 'TECH_CONCEPT', 'INTERVIEW', 'AI_NEWS', 'JOB_MARKET', 'SEMICONDUCTOR', 'STOCK_MARKET');

-- CreateEnum
CREATE TYPE "SectionStatus" AS ENUM ('SUCCESS', 'FALLBACK', 'ERROR');

-- CreateEnum
CREATE TYPE "TopicLevel" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Seoul',
    "deliveryHour" INTEGER NOT NULL DEFAULT 8,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefingRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "runDate" DATE NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "totalCostUsd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "emailMessageId" TEXT,
    "errorSummary" TEXT,

    CONSTRAINT "BriefingRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefingSection" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "sectionType" "SectionType" NOT NULL,
    "status" "SectionStatus" NOT NULL,
    "contentJson" JSONB NOT NULL,
    "tokensInput" INTEGER NOT NULL DEFAULT 0,
    "tokensOutput" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BriefingSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodingProblemHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemName" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "topicTag" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodingProblemHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechTopicCatalog" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TechTopicCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechTopicHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "level" "TopicLevel" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechTopicHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechTopicProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "currentLevel" "TopicLevel" NOT NULL DEFAULT 'BASIC',
    "timesCovered" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" TIMESTAMP(3),
    "nextEligibleAt" TIMESTAMP(3),

    CONSTRAINT "TechTopicProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestionHistory" (
    "id" TEXT NOT NULL,
    "techTopicHistoryId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "level" "TopicLevel" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewQuestionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticleSeen" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "urlHash" TEXT NOT NULL,
    "sourceType" "SectionType" NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsArticleSeen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailDeliveryLog" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'resend',
    "messageId" TEXT,
    "event" TEXT,
    "rawPayload" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailDeliveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "BriefingRun_status_idx" ON "BriefingRun"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BriefingRun_userId_runDate_key" ON "BriefingRun"("userId", "runDate");

-- CreateIndex
CREATE INDEX "BriefingSection_runId_sectionType_idx" ON "BriefingSection"("runId", "sectionType");

-- CreateIndex
CREATE INDEX "CodingProblemHistory_userId_sentAt_idx" ON "CodingProblemHistory"("userId", "sentAt");

-- CreateIndex
CREATE INDEX "CodingProblemHistory_userId_problemName_idx" ON "CodingProblemHistory"("userId", "problemName");

-- CreateIndex
CREATE UNIQUE INDEX "TechTopicCatalog_topic_key" ON "TechTopicCatalog"("topic");

-- CreateIndex
CREATE INDEX "TechTopicHistory_userId_sentAt_idx" ON "TechTopicHistory"("userId", "sentAt");

-- CreateIndex
CREATE INDEX "TechTopicHistory_userId_topic_idx" ON "TechTopicHistory"("userId", "topic");

-- CreateIndex
CREATE INDEX "TechTopicProgress_userId_currentLevel_idx" ON "TechTopicProgress"("userId", "currentLevel");

-- CreateIndex
CREATE INDEX "TechTopicProgress_userId_nextEligibleAt_idx" ON "TechTopicProgress"("userId", "nextEligibleAt");

-- CreateIndex
CREATE UNIQUE INDEX "TechTopicProgress_userId_topic_key" ON "TechTopicProgress"("userId", "topic");

-- CreateIndex
CREATE INDEX "NewsArticleSeen_userId_sourceType_seenAt_idx" ON "NewsArticleSeen"("userId", "sourceType", "seenAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticleSeen_userId_urlHash_key" ON "NewsArticleSeen"("userId", "urlHash");

-- CreateIndex
CREATE UNIQUE INDEX "EmailDeliveryLog_runId_key" ON "EmailDeliveryLog"("runId");

-- AddForeignKey
ALTER TABLE "BriefingRun" ADD CONSTRAINT "BriefingRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefingSection" ADD CONSTRAINT "BriefingSection_runId_fkey" FOREIGN KEY ("runId") REFERENCES "BriefingRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingProblemHistory" ADD CONSTRAINT "CodingProblemHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechTopicHistory" ADD CONSTRAINT "TechTopicHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechTopicProgress" ADD CONSTRAINT "TechTopicProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewQuestionHistory" ADD CONSTRAINT "InterviewQuestionHistory_techTopicHistoryId_fkey" FOREIGN KEY ("techTopicHistoryId") REFERENCES "TechTopicHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticleSeen" ADD CONSTRAINT "NewsArticleSeen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailDeliveryLog" ADD CONSTRAINT "EmailDeliveryLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "BriefingRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
