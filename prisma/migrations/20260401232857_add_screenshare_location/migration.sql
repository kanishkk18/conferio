/*
  Warnings:

  - You are about to drop the column `actualHours` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedHours` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `taskType` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `workloadWeight` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `WorkloadSnapshot` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ChannelRole" AS ENUM ('ADMIN', 'MODERATOR', 'MEMBER', 'VIEWER');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "actualHours",
DROP COLUMN "completedAt",
DROP COLUMN "estimatedHours",
DROP COLUMN "startedAt",
DROP COLUMN "taskType",
DROP COLUMN "workloadWeight";

-- DropTable
DROP TABLE "WorkloadSnapshot";

-- DropEnum
DROP TYPE "TaskType";

-- CreateTable
CREATE TABLE "message_threads" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "lastReplyAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread_replies" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "thread_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_reactions" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_bookmarks" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_members" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "ChannelRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_meetings" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "startedBy" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "participants" JSONB[],

    CONSTRAINT "channel_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_threads_messageId_key" ON "message_threads"("messageId");

-- CreateIndex
CREATE INDEX "message_threads_messageId_idx" ON "message_threads"("messageId");

-- CreateIndex
CREATE INDEX "thread_replies_threadId_idx" ON "thread_replies"("threadId");

-- CreateIndex
CREATE INDEX "thread_replies_memberId_idx" ON "thread_replies"("memberId");

-- CreateIndex
CREATE INDEX "message_reactions_messageId_idx" ON "message_reactions"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "message_reactions_messageId_memberId_emoji_key" ON "message_reactions"("messageId", "memberId", "emoji");

-- CreateIndex
CREATE INDEX "message_bookmarks_userId_idx" ON "message_bookmarks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "message_bookmarks_messageId_userId_key" ON "message_bookmarks"("messageId", "userId");

-- CreateIndex
CREATE INDEX "channel_members_channelId_idx" ON "channel_members"("channelId");

-- CreateIndex
CREATE INDEX "channel_members_memberId_idx" ON "channel_members"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "channel_members_channelId_memberId_key" ON "channel_members"("channelId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "channel_meetings_roomName_key" ON "channel_meetings"("roomName");

-- CreateIndex
CREATE INDEX "channel_meetings_channelId_idx" ON "channel_meetings"("channelId");

-- CreateIndex
CREATE INDEX "channel_meetings_status_idx" ON "channel_meetings"("status");

-- AddForeignKey
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_replies" ADD CONSTRAINT "thread_replies_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "message_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_replies" ADD CONSTRAINT "thread_replies_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_bookmarks" ADD CONSTRAINT "message_bookmarks_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_bookmarks" ADD CONSTRAINT "message_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_meetings" ADD CONSTRAINT "channel_meetings_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
