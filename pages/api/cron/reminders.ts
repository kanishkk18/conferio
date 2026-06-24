// pages/api/cron/reminders.ts
/**
 * GET /api/cron/reminders
 * Called by a cron job (e.g. Vercel Cron, GitHub Actions, or node-cron) every minute.
 * Finds all PENDING reminders whose dueDate has passed and fires notifications.
 *
 * Secure with a secret header: CRON_SECRET env var.
 *
 * Vercel cron config (vercel.json):
 * {
 *   "crons": [{ "path": "/api/cron/reminders", "schedule": "* * * * *" }]
 * }
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { notifyReminderDue } from "../../../lib/notifications/notification.triggers";
import { broadcastToUser } from "../notifications/stream";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  // Verify cron secret
  const secret = req.headers["x-cron-secret"] ?? req.query.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = new Date();

  // Find all due, un-notified reminders
  const dueReminders = await prisma.reminder.findMany({
    where: {
      status: "PENDING",
      dueDate: { lte: now },
      notifiedAt: null,
    },
    take: 100,
  });

  if (dueReminders.length === 0) {
    return res.status(200).json({ processed: 0 });
  }

  let processed = 0;

  for (const reminder of dueReminders) {
    try {
      await notifyReminderDue({
        userId: reminder.userId,
        reminderId: reminder.id,
        title: reminder.title,
        description: reminder.description ?? undefined,
        taskId: reminder.taskId ?? undefined,
        meetingId: reminder.meetingId ?? undefined,
      });

      // Broadcast over SSE
      const notification = await prisma.notification.findFirst({
        where: { userId: reminder.userId, type: "REMINDER_DUE" },
        orderBy: { createdAt: "desc" },
      });
      if (notification) {
        broadcastToUser(reminder.userId, { type: "notification", notification });
      }

      // Mark reminder as notified
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          notifiedAt: now,
          status: reminder.isRecurring ? "PENDING" : "NOTIFIED",
        },
      });

      processed++;
    } catch (err) {
      console.error(`[Cron Reminders] Failed for reminder ${reminder.id}:`, err);
    }
  }

  return res.status(200).json({ processed });
}