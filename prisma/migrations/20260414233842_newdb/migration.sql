/*
  Warnings:

  - A unique constraint covering the columns `[executionId]` on the table `workflow_runs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "workflow_runs_startedAt_idx";

-- DropIndex
DROP INDEX "workflow_runs_workflowId_status_idx";

-- DropIndex
DROP INDEX "workflows_teamId_isActive_idx";

-- DropIndex
DROP INDEX "workflows_trigger_idx";

-- AlterTable
ALTER TABLE "workflow_runs" ADD COLUMN     "apiCallsMade" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "computeTimeMs" INTEGER,
ADD COLUMN     "errorCode" TEXT,
ADD COLUMN     "executionId" TEXT,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxRetries" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "nextRetryAt" TIMESTAMP(3),
ADD COLUMN     "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "workerId" TEXT,
ALTER COLUMN "startedAt" DROP NOT NULL,
ALTER COLUMN "startedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "workflows" ADD COLUMN     "executionMode" TEXT NOT NULL DEFAULT 'async',
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rateLimitPerHour" INTEGER NOT NULL DEFAULT 100;

-- CreateTable
CREATE TABLE "workflow_step_logs" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "stepId" TEXT NOT NULL,
    "stepType" TEXT NOT NULL,
    "stepName" TEXT,
    "status" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,

    CONSTRAINT "workflow_step_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledEmail" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "to" TEXT[],
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "cc" TEXT[],
    "bcc" TEXT[],
    "replyToMessageId" TEXT,
    "threadId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workflow_step_logs_runId_stepIndex_idx" ON "workflow_step_logs"("runId", "stepIndex");

-- CreateIndex
CREATE INDEX "workflow_step_logs_stepType_status_idx" ON "workflow_step_logs"("stepType", "status");

-- CreateIndex
CREATE INDEX "ScheduledEmail_userId_status_idx" ON "ScheduledEmail"("userId", "status");

-- CreateIndex
CREATE INDEX "ScheduledEmail_scheduledAt_status_idx" ON "ScheduledEmail"("scheduledAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_runs_executionId_key" ON "workflow_runs"("executionId");

-- CreateIndex
CREATE INDEX "workflow_runs_workflowId_status_queuedAt_idx" ON "workflow_runs"("workflowId", "status", "queuedAt");

-- CreateIndex
CREATE INDEX "workflow_runs_status_nextRetryAt_idx" ON "workflow_runs"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "workflow_runs_queuedAt_idx" ON "workflow_runs"("queuedAt");

-- CreateIndex
CREATE INDEX "workflow_runs_isArchived_queuedAt_idx" ON "workflow_runs"("isArchived", "queuedAt");

-- CreateIndex
CREATE INDEX "workflow_runs_executionId_idx" ON "workflow_runs"("executionId");

-- CreateIndex
CREATE INDEX "workflows_teamId_isActive_trigger_idx" ON "workflows"("teamId", "isActive", "trigger");

-- CreateIndex
CREATE INDEX "workflows_isActive_lastRunAt_idx" ON "workflows"("isActive", "lastRunAt");

-- CreateIndex
CREATE INDEX "workflows_trigger_executionMode_idx" ON "workflows"("trigger", "executionMode");

-- AddForeignKey
ALTER TABLE "workflow_step_logs" ADD CONSTRAINT "workflow_step_logs_runId_fkey" FOREIGN KEY ("runId") REFERENCES "workflow_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledEmail" ADD CONSTRAINT "ScheduledEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
