// pages/api/notifications/mark-all-read.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "lib/auth";
import { markAllNotificationsRead } from "lib/notifications/notification.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await markAllNotificationsRead(session.user.id);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[Mark all read]", err);
    return res.status(500).json({ error: "Failed to mark all as read" });
  }
}