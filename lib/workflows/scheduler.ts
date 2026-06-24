// lib/workflows/scheduler.ts
// Handles scheduled workflow triggers using cron expressions.
// Called from /api/workflows/cron (Vercel cron job or external cron).

import { PrismaClient } from "@prisma/client";
import { workflowEngine } from "./engine";
import type { TriggerPayload } from "../../types/workflow";

const prisma = new PrismaClient();

/**
 * Parse a cron expression and check if it should fire now.
 * Uses a simple ±30s window for cron matching.
 */
function cronShouldFire(expression: string, now: Date = new Date()): boolean {
  try {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) return false;

    const [minuteExpr, hourExpr, domExpr, monthExpr, dowExpr] = parts;

    const matchField = (expr: string, value: number, min: number, max: number): boolean => {
      if (expr === "*") return true;
      if (expr.includes("/")) {
        const [, step] = expr.split("/");
        return value % parseInt(step) === 0;
      }
      if (expr.includes(",")) {
        return expr.split(",").some((v) => parseInt(v) === value);
      }
      if (expr.includes("-")) {
        const [start, end] = expr.split("-").map(Number);
        return value >= start && value <= end;
      }
      return parseInt(expr) === value;
    };

    return (
      matchField(minuteExpr, now.getUTCMinutes(), 0, 59) &&
      matchField(hourExpr, now.getUTCHours(), 0, 23) &&
      matchField(domExpr, now.getUTCDate(), 1, 31) &&
      matchField(monthExpr, now.getUTCMonth() + 1, 1, 12) &&
      matchField(dowExpr, now.getUTCDay(), 0, 6)
    );
  } catch {
    return false;
  }
}

/**
 * Process all scheduled workflows - called by cron endpoint every minute.
 */
export async function processScheduledWorkflows(): Promise<{
  checked: number;
  triggered: number;
}> {
  const scheduledWorkflows = await prisma.workflow.findMany({
    where: {
      trigger: "schedule",
      isActive: true,
    },
    include: {
      team: {
        include: {
          members: { include: { user: true } },
        },
      },
    },
  });

  let triggered = 0;
  const now = new Date();

  for (const wf of scheduledWorkflows) {
    const config = wf.triggerConfig as Record<string, unknown> | null;
    const schedule = config?.schedule as string | undefined;

    if (!schedule) continue;

    if (cronShouldFire(schedule, now)) {
      const memberIds = wf.team.members.map((m) => m.userId);

      const payload: TriggerPayload = {
        teamId: wf.teamId,
        data: {
          teamMemberIds: memberIds,
          teamName: wf.team.name,
          scheduledAt: now.toISOString(),
          workflowName: wf.name,
        },
        timestamp: now.toISOString(),
      };

      try {
        await workflowEngine.enqueue(wf.id, payload);
        triggered++;
      } catch (e) {
        console.error(`[Scheduler] Failed to queue workflow ${wf.id}:`, e);
      }
    }
  }

  return { checked: scheduledWorkflows.length, triggered };
}

/**
 * Process due reminders - called alongside scheduled workflows.
 */
export async function processDueReminders(): Promise<number> {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  const dueReminders = await prisma.reminder.findMany({
    where: {
      status: "PENDING",
      dueDate: { gte: fiveMinutesAgo, lte: now },
      notifiedAt: null,
    },
    take: 50,
  });

  for (const reminder of dueReminders) {
    try {
      await prisma.notification.create({
        data: {
          userId: reminder.userId,
          type: "REMINDER_DUE",
          title: reminder.title,
          body: reminder.description || "Your reminder is due",
          data: { reminderId: reminder.id },
          taskId: reminder.taskId,
          meetingId: reminder.meetingId,
          channels: ["in_app"],
        },
      });

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { notifiedAt: now, status: "NOTIFIED" },
      });
    } catch (e) {
      console.error(`[Scheduler] Failed to process reminder ${reminder.id}:`, e);
    }
  }

  return dueReminders.length;
}

/**
 * Process tasks due soon (24h warning).
 */
export async function processDueSoonTasks(): Promise<number> {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const dueSoonTasks = await prisma.task.findMany({
    where: {
      dueDate: { gte: in24h, lte: in25h },
      status: { not: "DONE" },
    },
    include: {
      assignees: { include: { user: true } },
      column: { include: { board: { include: { owner: true } } } },
    },
    take: 100,
  });

  for (const task of dueSoonTasks) {
    const teamId = task.column?.board?.owner?.id; // fallback - real app would have teamId on task

    const payload: TriggerPayload = {
      teamId: teamId || "",
      entityId: task.id,
      entityType: "task",
      data: {
        taskId: task.id,
        taskTitle: task.title,
        assigneeId: task.assignees[0]?.userId,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
      },
      timestamp: now.toISOString(),
    };

    await workflowEngine.trigger("task.due_soon", payload).catch(() => {});
  }

  return dueSoonTasks.length;
}
