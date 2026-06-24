// lib/notifications.ts
// Centralized notification creation service

import { PrismaClient } from "@prisma/client";
import type { CreateNotificationInput } from "types/notifications";

const prisma = new PrismaClient();

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: (input.data as object) || {},
        taskId: input.taskId || null,
        pageId: input.pageId || null,
        meetingId: input.meetingId || null,
        fileId: input.fileId || null,
        callId: input.callId || null,
        workflowId: input.workflowId || null,
        channels: input.channels || ["in_app"],
        actions: (input.actions as object[]) || [],
        expiresAt: input.expiresAt || null,
      },
    });
  } catch (err) {
    console.error("[createNotification] failed:", err);
  }
}

export async function createBulkNotifications(
  inputs: CreateNotificationInput[]
): Promise<void> {
  try {
    await prisma.notification.createMany({
      data: inputs.map((input) => ({
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: (input.data as object) || {},
        taskId: input.taskId || null,
        pageId: input.pageId || null,
        meetingId: input.meetingId || null,
        fileId: input.fileId || null,
        callId: input.callId || null,
        workflowId: input.workflowId || null,
        channels: input.channels || ["in_app"],
        actions: (input.actions as object[]) || [],
        expiresAt: input.expiresAt || null,
      })),
      skipDuplicates: true,
    });
  } catch (err) {
    console.error("[createBulkNotifications] failed:", err);
  }
}
