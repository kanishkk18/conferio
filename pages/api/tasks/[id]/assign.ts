// pages/api/tasks/[taskId]/assign.ts
/**
 * Example: POST /api/tasks/:taskId/assign
 * Assigns a user to a task and fires the TASK_ASSIGNED notification.
 *
 * This pattern should be replicated for every domain event.
 * See lib/notifications/notification.triggers.ts for all available triggers.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "lib/auth";
import { PrismaClient } from "@prisma/client";
import { notifyTaskAssigned, notifyTaskUnassigned } from "../../../../lib/notifications/notification.triggers";
import { broadcastToUser } from "../../notifications/stream";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { taskId } = req.query as { taskId: string };

  // ── POST: assign user ──────────────────────────────────────────────────
  if (req.method === "POST") {
    const { userId: assigneeId } = req.body as { userId: string };

    // 1. Fetch task + board + column info
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: { include: { board: true } },
      },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    // 2. Fetch assignee info
    const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
    if (!assignee) return res.status(404).json({ error: "User not found" });

    // 3. Create TaskAssignee record
    await prisma.taskAssignee.upsert({
      where: { taskId_userId: { taskId, userId: assigneeId } },
      create: { taskId, userId: assigneeId, assignedBy: session.user.id },
      update: {},
    });

    // 4. Create + broadcast notification
    const assignedByUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    await notifyTaskAssigned({
      assigneeUserId: assigneeId,
      assignedByName: assignedByUser?.name ?? "Someone",
      taskId,
      taskTitle: task.title,
      boardId: task.column.boardId,
      boardTitle: task.column.board.title,
      columnTitle: task.column.title,
    });

    // 5. Push via SSE so the toast appears instantly
    const notification = await prisma.notification.findFirst({
      where: { userId: assigneeId, taskId, type: "TASK_ASSIGNED" },
      orderBy: { createdAt: "desc" },
    });
    if (notification) {
      broadcastToUser(assigneeId, {
        type: "notification",
        notification,
      });
    }

    return res.status(200).json({ success: true });
  }

  // ── DELETE: unassign user ─────────────────────────────────────────────
  if (req.method === "DELETE") {
    const { userId: assigneeId } = req.body as { userId: string };

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: { include: { board: true } } },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    await prisma.taskAssignee.deleteMany({
      where: { taskId, userId: assigneeId },
    });

    const removedByUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    await notifyTaskUnassigned({
      removedUserId: assigneeId,
      removedByName: removedByUser?.name ?? "Someone",
      taskId,
      taskTitle: task.title,
      boardId: task.column.boardId,
      boardTitle: task.column.board.title,
    });

    const notification = await prisma.notification.findFirst({
      where: { userId: assigneeId, taskId, type: "TASK_UNASSIGNED" },
      orderBy: { createdAt: "desc" },
    });
    if (notification) {
      broadcastToUser(assigneeId, { type: "notification", notification });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}