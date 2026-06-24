/*
  Warnings:

  - You are about to drop the `collaborators` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shareToken]` on the table `Whiteboard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ScreenShareStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'ENDED');

-- DropForeignKey
ALTER TABLE "Whiteboard" DROP CONSTRAINT "Whiteboard_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "collaborators" DROP CONSTRAINT "collaborators_userId_fkey";

-- DropForeignKey
ALTER TABLE "collaborators" DROP CONSTRAINT "collaborators_whiteboardId_fkey";

-- AlterTable
ALTER TABLE "Whiteboard" ADD COLUMN     "shareToken" TEXT;

-- DropTable
DROP TABLE "collaborators";

-- CreateTable
CREATE TABLE "whiteboard_collaborators" (
    "id" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EDITOR',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whiteboard_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screen_share_sessions" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" "ScreenShareStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screen_share_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_locations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whiteboard_collaborators_whiteboardId_idx" ON "whiteboard_collaborators"("whiteboardId");

-- CreateIndex
CREATE INDEX "whiteboard_collaborators_userId_idx" ON "whiteboard_collaborators"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "whiteboard_collaborators_whiteboardId_userId_key" ON "whiteboard_collaborators"("whiteboardId", "userId");

-- CreateIndex
CREATE INDEX "screen_share_sessions_adminId_idx" ON "screen_share_sessions"("adminId");

-- CreateIndex
CREATE INDEX "screen_share_sessions_employeeId_idx" ON "screen_share_sessions"("employeeId");

-- CreateIndex
CREATE INDEX "screen_share_sessions_teamId_status_idx" ON "screen_share_sessions"("teamId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_locations_userId_key" ON "user_locations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Whiteboard_shareToken_key" ON "Whiteboard"("shareToken");

-- AddForeignKey
ALTER TABLE "Whiteboard" ADD CONSTRAINT "Whiteboard_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whiteboard_collaborators" ADD CONSTRAINT "whiteboard_collaborators_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "Whiteboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whiteboard_collaborators" ADD CONSTRAINT "whiteboard_collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_share_sessions" ADD CONSTRAINT "screen_share_sessions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
