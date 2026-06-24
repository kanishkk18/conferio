// lib/notifications/notification.service.ts
import { PrismaClient } from "@prisma/client";
import type {
  CreateNotificationInput,
  NotificationType,
} from "../../types/notifications";

const prisma = new PrismaClient();

/**
 * Core service to create a notification record in the database.
 * All callers (task events, call events, etc.) go through here.
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<string> {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data ?? {},
      taskId: input.taskId,
      pageId: input.pageId,
      meetingId: input.meetingId,
      fileId: input.fileId,
      callId: input.callId,
      workflowId: input.workflowId,
      channels: input.channels ?? ["in_app"],
      read: false,
      clicked: false,
      actions: input.actions ? JSON.parse(JSON.stringify(input.actions)) : [],
      expiresAt: input.expiresAt,
    },
  });
  return notification.id;
}

/**
 * Create notifications for multiple users at once (batch).
 */
export async function createNotificationForMany(
  userIds: string[],
  input: Omit<CreateNotificationInput, "userId">
): Promise<void> {
  if (userIds.length === 0) return;

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: (input.data as object) ?? {},
      taskId: input.taskId,
      pageId: input.pageId,
      meetingId: input.meetingId,
      fileId: input.fileId,
      callId: input.callId,
      workflowId: input.workflowId,
      channels: input.channels ?? ["in_app"],
      read: false,
      clicked: false,
      actions: input.actions
        ? JSON.parse(JSON.stringify(input.actions))
        : [],
      expiresAt: input.expiresAt,
    })),
  });
}

/** Mark a notification as read */
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true, readAt: new Date() },
  });
}

/** Mark ALL notifications as read for a user */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  });
}

/** Mark a notification as clicked */
export async function markNotificationClicked(
  notificationId: string,
  userId: string
): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { clicked: true, clickedAt: new Date() },
  });
}

/** Fetch unread notifications for a user (for polling / SSE) */
export async function getUnreadNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      read: false,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/** Fetch paginated notifications for a user */
export async function getNotifications(
  userId: string,
  page = 1,
  pageSize = 20
) {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),
  ]);

  return { notifications, total, page, pageSize };
}

/** Delete expired notifications (use in a cron/cleanup job) */
export async function deleteExpiredNotifications(): Promise<void> {
  await prisma.notification.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}
