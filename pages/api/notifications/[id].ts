// pages/api/notifications/[id].ts
/**
 * PATCH /api/notifications/:id  → mark read or clicked
 * DELETE /api/notifications/:id → dismiss/delete a notification
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "lib/auth";
import {
  markNotificationRead,
  markNotificationClicked,
} from "lib/notifications/notification.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;
  const id = req.query.id as string;

  if (req.method === "PATCH") {
    const { action } = req.body as { action: "read" | "clicked" };

    try {
      if (action === "read") {
        await markNotificationRead(id, userId);
      } else if (action === "clicked") {
        await markNotificationClicked(id, userId);
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[Notification PATCH]", err);
      return res.status(500).json({ error: "Update failed" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.notification.deleteMany({ where: { id, userId } });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[Notification DELETE]", err);
      return res.status(500).json({ error: "Delete failed" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}