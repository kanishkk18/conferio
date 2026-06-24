/*
  Warnings:

  - You are about to drop the column `lastActivity` on the `whiteboard_collaborators` table. All the data in the column will be lost.
  - You are about to drop the `CursorPosition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Element` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Whiteboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WhiteboardActivityLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ShapeType" AS ENUM ('RECTANGLE', 'CIRCLE', 'ELLIPSE', 'TRIANGLE', 'POLYGON', 'LINE', 'ARROW', 'TEXT', 'IMAGE', 'CONNECTOR');

-- DropForeignKey
ALTER TABLE "CursorPosition" DROP CONSTRAINT "CursorPosition_userId_fkey";

-- DropForeignKey
ALTER TABLE "CursorPosition" DROP CONSTRAINT "CursorPosition_whiteboardId_fkey";

-- DropForeignKey
ALTER TABLE "Element" DROP CONSTRAINT "Element_whiteboardId_fkey";

-- DropForeignKey
ALTER TABLE "Whiteboard" DROP CONSTRAINT "Whiteboard_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "WhiteboardActivityLog" DROP CONSTRAINT "WhiteboardActivityLog_whiteboardId_fkey";

-- DropForeignKey
ALTER TABLE "whiteboard_collaborators" DROP CONSTRAINT "whiteboard_collaborators_whiteboardId_fkey";

-- AlterTable
ALTER TABLE "whiteboard_collaborators" DROP COLUMN "lastActivity";

-- DropTable
DROP TABLE "CursorPosition";

-- DropTable
DROP TABLE "Element";

-- DropTable
DROP TABLE "Whiteboard";

-- DropTable
DROP TABLE "WhiteboardActivityLog";

-- DropEnum
DROP TYPE "WhiteboardRole";

-- CreateTable
CREATE TABLE "cursor_positions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "userName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursor_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whiteboards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled Whiteboard',
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "gridSize" INTEGER NOT NULL DEFAULT 20,
    "snapToGrid" BOOLEAN NOT NULL DEFAULT true,
    "showGrid" BOOLEAN NOT NULL DEFAULT true,
    "zoom" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "panX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "panY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "backgroundColor" TEXT NOT NULL DEFAULT '#1a1a1a',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whiteboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whiteboard_shapes" (
    "id" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "type" "ShapeType" NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "fill" TEXT NOT NULL DEFAULT '#3b82f6',
    "stroke" TEXT NOT NULL DEFAULT '#1f2937',
    "strokeWidth" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "opacity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "text" TEXT,
    "imageUrl" TEXT,
    "imageKey" TEXT,
    "metadata" JSONB,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whiteboard_shapes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whiteboard_connections" (
    "id" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "fromShapeId" TEXT NOT NULL,
    "toShapeId" TEXT NOT NULL,
    "fromPort" TEXT,
    "toPort" TEXT,
    "style" TEXT NOT NULL DEFAULT 'solid',
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "strokeWidth" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whiteboard_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whiteboard_comments" (
    "id" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "shapeId" TEXT,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whiteboard_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whiteboard_versions" (
    "id" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whiteboard_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whiteboard_activities" (
    "id" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whiteboard_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cursor_positions_whiteboardId_idx" ON "cursor_positions"("whiteboardId");

-- CreateIndex
CREATE INDEX "cursor_positions_userId_idx" ON "cursor_positions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "whiteboards_shareToken_key" ON "whiteboards"("shareToken");

-- CreateIndex
CREATE INDEX "whiteboards_ownerId_idx" ON "whiteboards"("ownerId");

-- CreateIndex
CREATE INDEX "whiteboards_shareToken_idx" ON "whiteboards"("shareToken");

-- CreateIndex
CREATE INDEX "whiteboard_shapes_whiteboardId_idx" ON "whiteboard_shapes"("whiteboardId");

-- CreateIndex
CREATE INDEX "whiteboard_connections_whiteboardId_idx" ON "whiteboard_connections"("whiteboardId");

-- CreateIndex
CREATE INDEX "whiteboard_connections_fromShapeId_idx" ON "whiteboard_connections"("fromShapeId");

-- CreateIndex
CREATE INDEX "whiteboard_connections_toShapeId_idx" ON "whiteboard_connections"("toShapeId");

-- CreateIndex
CREATE INDEX "whiteboard_comments_whiteboardId_idx" ON "whiteboard_comments"("whiteboardId");

-- CreateIndex
CREATE INDEX "whiteboard_comments_authorId_idx" ON "whiteboard_comments"("authorId");

-- CreateIndex
CREATE INDEX "whiteboard_versions_whiteboardId_idx" ON "whiteboard_versions"("whiteboardId");

-- CreateIndex
CREATE UNIQUE INDEX "whiteboard_versions_whiteboardId_version_key" ON "whiteboard_versions"("whiteboardId", "version");

-- CreateIndex
CREATE INDEX "whiteboard_activities_whiteboardId_idx" ON "whiteboard_activities"("whiteboardId");

-- CreateIndex
CREATE INDEX "whiteboard_activities_userId_idx" ON "whiteboard_activities"("userId");

-- CreateIndex
CREATE INDEX "whiteboard_activities_createdAt_idx" ON "whiteboard_activities"("createdAt");

-- AddForeignKey
ALTER TABLE "cursor_positions" ADD CONSTRAINT "cursor_positions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursor_positions" ADD CONSTRAINT "cursor_positions_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "whiteboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whiteboards" ADD CONSTRAINT "whiteboards_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whiteboard_collaborators" ADD CONSTRAINT "whiteboard_collaborators_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "whiteboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whiteboard_shapes" ADD CONSTRAINT "whiteboard_shapes_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "whiteboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whiteboard_connections" ADD CONSTRAINT "whiteboard_connections_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "whiteboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whiteboard_comments" ADD CONSTRAINT "whiteboard_comments_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "whiteboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whiteboard_comments" ADD CONSTRAINT "whiteboard_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whiteboard_versions" ADD CONSTRAINT "whiteboard_versions_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "whiteboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whiteboard_activities" ADD CONSTRAINT "whiteboard_activities_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "whiteboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
