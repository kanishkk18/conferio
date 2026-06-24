-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('FEATURE', 'BUG', 'TASK', 'EPIC', 'SUBTASK');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "actualHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "estimatedHours" DOUBLE PRECISION,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "taskType" TEXT NOT NULL DEFAULT 'TASK',
ADD COLUMN     "workloadWeight" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "WorkloadSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalTasks" INTEGER NOT NULL,
    "completedTasks" INTEGER NOT NULL,
    "inProgressTasks" INTEGER NOT NULL,
    "overdueTasks" INTEGER NOT NULL,
    "totalHours" DOUBLE PRECISION NOT NULL,
    "workloadScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WorkloadSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkloadSnapshot_userId_date_key" ON "WorkloadSnapshot"("userId", "date");
