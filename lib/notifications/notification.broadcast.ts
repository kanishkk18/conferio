// lib/notifications/notification.broadcast.ts
/**
 * Utility: create a notification record AND immediately broadcast it over SSE.
 *
 * Use this instead of calling createNotification + broadcastToUser separately.
 * This keeps your API routes clean.
 
 */
import { PrismaClient } from "@prisma/client";
import { createNotification, createNotificationForMany } from "./notification.service";
import { broadcastToUser } from "../../pages/api/notifications/stream";
import type { CreateNotificationInput } from "../../types/notifications";

const prisma = new PrismaClient();

export async function createAndBroadcast(
  input: CreateNotificationInput
): Promise<void> {
  const id = await createNotification(input);

  // Fetch full record to broadcast
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (notification) {
    broadcastToUser(input.userId, { type: "notification", notification });
  }
}

export async function createAndBroadcastForMany(
  userIds: string[],
  input: Omit<CreateNotificationInput, "userId">
): Promise<void> {
  if (userIds.length === 0) return;

  await createNotificationForMany(userIds, input);

  // Fetch the just-created notifications and broadcast each
  const notifications = await prisma.notification.findMany({
    where: {
      userId: { in: userIds },
      type: input.type,
    },
    orderBy: { createdAt: "desc" },
    take: userIds.length,
  });

  const seen = new Set<string>();
  for (const n of notifications) {
    if (!seen.has(n.userId)) {
      seen.add(n.userId);
      broadcastToUser(n.userId, { type: "notification", notification: n });
    }
  }
}
