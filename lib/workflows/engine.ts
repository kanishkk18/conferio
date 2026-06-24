// lib/workflows/engine.ts
// Core workflow execution engine - supports sync, async (Postgres queue), and Inngest modes

import { PrismaClient } from "@prisma/client";
import type {
  WorkflowStep,
  WorkflowCondition,
  StepExecutionResult,
  TriggerPayload,
  ConditionOperator,
} from "../../types/workflow";
import { createNotification } from "../notifications";

const prisma = new PrismaClient();

// ─── Condition Evaluator ──────────────────────────────────────────────────────

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function evaluateCondition(
  condition: WorkflowCondition,
  data: Record<string, unknown>
): boolean {
  const value = getNestedValue(data, condition.field);

  switch (condition.operator as ConditionOperator) {
    case "equals":
      return value === condition.value;
    case "not_equals":
      return value !== condition.value;
    case "contains":
      return typeof value === "string" && value.includes(condition.value as string);
    case "not_contains":
      return typeof value === "string" && !value.includes(condition.value as string);
    case "gt":
      return (value as number) > (condition.value as number);
    case "lt":
      return (value as number) < (condition.value as number);
    case "gte":
      return (value as number) >= (condition.value as number);
    case "lte":
      return (value as number) <= (condition.value as number);
    case "is_empty":
      return value === null || value === undefined || value === "";
    case "is_not_empty":
      return value !== null && value !== undefined && value !== "";
    case "in":
      return Array.isArray(condition.value) && (condition.value as unknown[]).includes(value);
    case "not_in":
      return Array.isArray(condition.value) && !(condition.value as unknown[]).includes(value);
    default:
      return false;
  }
}

export function evaluateConditions(
  conditions: WorkflowCondition[] | null | undefined,
  data: Record<string, unknown>
): boolean {
  if (!conditions || conditions.length === 0) return true;

  // Support AND/OR logic groups
  let result = evaluateCondition(conditions[0], data);
  for (let i = 1; i < conditions.length; i++) {
    const cond = conditions[i];
    const val = evaluateCondition(cond, data);
    if (cond.logicOperator === "OR") {
      result = result || val;
    } else {
      result = result && val;
    }
  }
  return result;
}

// ─── Template interpolation ───────────────────────────────────────────────────

function interpolate(template: string, context: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const val = getNestedValue(context, path);
    return val !== undefined ? String(val) : match;
  });
}

function interpolateConfig(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === "string") {
      result[key] = interpolate(value, context);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = interpolateConfig(value as Record<string, unknown>, context);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ─── Step Handlers ────────────────────────────────────────────────────────────

async function handleCreateTask(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> {
  const interpolated = interpolateConfig(config, context);
  const task = await prisma.task.create({
    data: {
      title: interpolated.title as string,
      description: (interpolated.description as string) || null,
      columnId: interpolated.columnId as string,
      boardId: interpolated.boardId as string,
      priority: (interpolated.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT") || "MEDIUM",
      status: "TODO",
      dueDate: interpolated.dueDate ? new Date(interpolated.dueDate as string) : null,
    },
  });
  return { taskId: task.id, title: task.title };
}

async function handleUpdateTask(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> {
  const taskId = (config.taskId as string) || (context.entityId as string);
  const interpolated = interpolateConfig(config, context);

  const updateData: Record<string, unknown> = {};
  if (interpolated.status) updateData.status = interpolated.status;
  if (interpolated.priority) updateData.priority = interpolated.priority;
  if (interpolated.title) updateData.title = interpolated.title;
  if (interpolated.description) updateData.description = interpolated.description;
  if (interpolated.dueDate) updateData.dueDate = new Date(interpolated.dueDate as string);

  const task = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });
  return { taskId: task.id };
}

async function handleAssignTask(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> {
  const taskId = (config.taskId as string) || (context.entityId as string);
  const userId = (config.userId as string) || (context.userId as string);

  await prisma.taskAssignee.upsert({
    where: { taskId_userId: { taskId, userId } },
    update: {},
    create: { taskId, userId },
  });

  // Fire notification
  await createNotification({
    userId,
    type: "TASK_ASSIGNED",
    title: "Task assigned to you",
    body: `You've been assigned a task via workflow automation`,
    taskId,
    channels: ["in_app", "email"],
  });

  return { taskId, userId };
}

async function handleSendNotification(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> {
  const interpolated = interpolateConfig(config, context);
  const userIds = Array.isArray(interpolated.userIds)
    ? (interpolated.userIds as string[])
    : [interpolated.userId as string].filter(Boolean);

  await Promise.all(
    userIds.map((userId) =>
      createNotification({
        userId,
        type: (interpolated.notificationType as string || "WORKFLOW_EXECUTED") as Parameters<typeof createNotification>[0]["type"],
        title: interpolated.title as string,
        body: interpolated.body as string,
        data: context,
        workflowId: context.workflowId as string,
        channels: (interpolated.channels as string[]) || ["in_app"],
      })
    )
  );

  return { notified: userIds.length };
}

async function handleSendWebhook(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> {
  const url = config.url as string;
  const method = (config.method as string) || "POST";
  const headers = (config.headers as Record<string, string>) || {};
  const bodyTemplate = config.body as Record<string, unknown> | undefined;

  const body = bodyTemplate ? interpolateConfig(bodyTemplate, context) : context;

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
  }

  return { statusCode: response.status };
}

async function handleDelay(
  config: Record<string, unknown>
): Promise<unknown> {
  const ms = (config.durationMs as number) || 0;
  // In serverless: we don't actually sleep here.
  // Instead this signals the queue to re-schedule after ms.
  // For sync mode, cap delay at 5s to prevent timeouts.
  if (ms > 0 && ms <= 5000) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
  return { delayedMs: ms };
}

async function handleConditionBranch(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> {
  const conditions = config.conditions as ReturnType<typeof evaluateConditions> extends boolean
    ? import("../../types/workflow").WorkflowCondition[]
    : never;
  const result = evaluateConditions(conditions as Parameters<typeof evaluateConditions>[0], context);
  return { conditionMet: result, branch: result ? "true" : "false" };
}

async function handleCreateMeeting(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> {
  const interpolated = interpolateConfig(config, context);
  // Creates a VideoMeeting record
  const meeting = await prisma.videoMeeting.create({
    data: {
      title: interpolated.title as string,
      roomName: `workflow-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdById: (interpolated.createdById || context.userId) as string,
      scheduledAt: interpolated.scheduledAt ? new Date(interpolated.scheduledAt as string) : null,
      settings: (interpolated.settings as object) || {},
    },
  });
  return { meetingId: meeting.id, roomName: meeting.roomName };
}

async function handleScheduleReminder(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> {
  const interpolated = interpolateConfig(config, context);
  const reminder = await prisma.reminder.create({
    data: {
      title: interpolated.title as string,
      description: interpolated.description as string || null,
      dueDate: new Date(interpolated.dueDate as string),
      userId: (interpolated.userId || context.userId) as string,
      taskId: (interpolated.taskId || context.entityId) as string | null,
      timezone: interpolated.timezone as string || "UTC",
    },
  });
  return { reminderId: reminder.id };
}

async function handleApproveTimeEntry(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> {
  const entryId = (config.timeEntryId || context.entityId) as string;
  const approverId = (config.approverId || context.userId) as string;
  const action = config.action as "approve" | "reject";

  await prisma.timeEntry.update({
    where: { id: entryId },
    data: {
      billableStatus: action === "approve" ? "APPROVED" : "REJECTED",
      approvedBy: approverId,
      approvedAt: new Date(),
    },
  });

  return { entryId, action };
}

async function handleAiSummarize(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> {
  // Calls our own AI endpoint or Anthropic API
  const text = interpolate(config.text as string || "{{data}}", context);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, options: config.options }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) throw new Error(`AI call failed: ${response.status}`);

    const result = await response.json();
    return { summary: result.summary };
  } catch (err) {
    console.error("AI step failed:", err);
    return { summary: null, error: (err as Error).message };
  }
}

// ─── Step Router ──────────────────────────────────────────────────────────────

const STEP_HANDLERS: Record<
  string,
  (config: Record<string, unknown>, context: Record<string, unknown>) => Promise<unknown>
> = {
  CREATE_TASK: handleCreateTask,
  UPDATE_TASK: handleUpdateTask,
  ASSIGN_TASK: handleAssignTask,
  SEND_NOTIFICATION: handleSendNotification,
  SEND_EMAIL: async (config, ctx) => {
    // Delegate to existing email infrastructure
    const interpolated = interpolateConfig(config, ctx);
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(interpolated),
    });
    return { sent: true };
  },
  SEND_WEBHOOK: handleSendWebhook,
  UPDATE_FIELD: handleUpdateTask, // Reuse with partial data
  CONDITION: handleConditionBranch,
  DELAY: handleDelay,
  AI_SUMMARIZE: handleAiSummarize,
  CREATE_MEETING: handleCreateMeeting,
  SCHEDULE_REMINDER: handleScheduleReminder,
  APPROVE_TIME_ENTRY: handleApproveTimeEntry,
  ASSIGN_FILE: async (config, ctx) => {
    const fileId = (config.fileId || ctx.entityId) as string;
    const userId = (config.userId || ctx.userId) as string;
    await prisma.fileAssignment.upsert({
      where: { fileId_userId: { fileId, userId } },
      update: {},
      create: { fileId, userId, assignedBy: ctx.userId as string || userId },
    });
    return { fileId, userId };
  },
  CREATE_BOARD_COMMENT: async (config, ctx) => {
    const interpolated = interpolateConfig(config, ctx);
    const comment = await prisma.boardComment.create({
      data: {
        content: interpolated.content as string,
        taskId: (interpolated.taskId || ctx.entityId) as string,
        userId: (interpolated.userId || ctx.userId) as string,
      },
    });
    return { commentId: comment.id };
  },
};

// ─── Main Engine ──────────────────────────────────────────────────────────────

export class WorkflowEngine {
  constructor(private db: PrismaClient = prisma) {}

  /**
   * Find and trigger all matching workflows for an event.
   * Called from API routes when domain events occur.
   */
  async trigger(
    trigger: string,
    payload: TriggerPayload,
    opts: { sync?: boolean } = {}
  ): Promise<string[]> {
    const workflows = await this.db.workflow.findMany({
      where: {
        trigger,
        isActive: true,
        teamId: payload.teamId,
      },
      orderBy: { createdAt: "asc" },
    });

    const runIds: string[] = [];

    for (const wf of workflows) {
      const conditions = wf.conditions as Parameters<typeof evaluateConditions>[0];
      if (!evaluateConditions(conditions, { ...payload.data, ...payload })) {
        continue;
      }

      if (opts.sync) {
        const runId = await this.executeSync(wf.id, payload);
        runIds.push(runId);
      } else {
        const runId = await this.enqueue(wf.id, payload);
        runIds.push(runId);
      }
    }

    return runIds;
  }

  /**
   * Enqueue a workflow run for async processing.
   */
  async enqueue(workflowId: string, payload: TriggerPayload): Promise<string> {
    const run = await this.db.workflowRun.create({
      data: {
        workflowId,
        status: "pending",
        triggerData: payload as object,
        steps: [],
      },
    });

    // If Inngest is configured, send to Inngest
    if (process.env.INNGEST_EVENT_KEY) {
      await this.sendToInngest(run.id, workflowId, payload);
    }
    // Otherwise the polling processor will pick it up

    return run.id;
  }

  /**
   * Execute a workflow synchronously (for manual triggers, small workflows).
   */
  async executeSync(workflowId: string, payload: TriggerPayload): Promise<string> {
    const run = await this.db.workflowRun.create({
      data: {
        workflowId,
        status: "running",
        triggerData: payload as object,
        startedAt: new Date(),
        steps: [],
      },
    });

    await this.executeRun(run.id);
    return run.id;
  }

  /**
   * Core run executor - called by polling worker, Inngest handler, or sync mode.
   */
  async executeRun(runId: string): Promise<void> {
    const run = await this.db.workflowRun.findUniqueOrThrow({
      where: { id: runId },
      include: { workflow: true },
    });

    if (run.status === "cancelled") return;

    const startedAt = new Date();

    // Mark as running
    await this.db.workflowRun.update({
      where: { id: runId },
      data: { status: "running", startedAt },
    });

    const workflow = run.workflow;
    const steps = workflow.steps as WorkflowStep[];
    const triggerData = run.triggerData as Record<string, unknown>;
    const context: Record<string, unknown> = {
      ...triggerData,
      workflowId: workflow.id,
      runId,
      teamId: workflow.teamId,
    };

    const stepResults: StepExecutionResult[] = [];

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepStart = Date.now();

        try {
          const output = await STEP_HANDLERS[step.type]?.(step.config, context);

          // Inject step output into context for subsequent steps
          context[`step_${i}_output`] = output;
          context[`${step.id}_output`] = output;

          stepResults.push({
            stepId: step.id,
            stepType: step.type as StepExecutionResult["stepType"],
            status: "success",
            output,
            durationMs: Date.now() - stepStart,
            startedAt: new Date(stepStart),
            completedAt: new Date(),
          });

          // Save progress incrementally
          await this.db.workflowRun.update({
            where: { id: runId },
            data: { steps: stepResults as object[] },
          });
        } catch (stepErr) {
          const errMsg = (stepErr as Error).message;
          stepResults.push({
            stepId: step.id,
            stepType: step.type as StepExecutionResult["stepType"],
            status: "failed",
            error: errMsg,
            durationMs: Date.now() - stepStart,
            startedAt: new Date(stepStart),
          });

          // Step error policy
          if (step.onError === "continue") {
            continue;
          }
          // Default: stop on error
          throw stepErr;
        }
      }

      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      await this.db.$transaction([
        this.db.workflowRun.update({
          where: { id: runId },
          data: {
            status: "completed",
            completedAt,
            durationMs,
            steps: stepResults as object[],
          },
        }),
        this.db.workflow.update({
          where: { id: workflow.id },
          data: {
            runCount: { increment: 1 },
            successCount: { increment: 1 },
            lastRunAt: completedAt,
          },
        }),
      ]);
    } catch (err) {
      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();
      const errorMsg = (err as Error).message;

      // Retry logic
      const maxRetries = 3;
      const retryCount = (run.retryCount || 0) + 1;

      await this.db.$transaction([
        this.db.workflowRun.update({
          where: { id: runId },
          data: {
            status: retryCount < maxRetries ? "pending" : "failed",
            error: errorMsg,
            completedAt,
            durationMs,
            steps: stepResults as object[],
            retryCount,
          },
        }),
        this.db.workflow.update({
          where: { id: workflow.id },
          data: {
            runCount: { increment: 1 },
            failureCount: { increment: 1 },
            lastRunAt: completedAt,
          },
        }),
      ]);

      // Notify workflow creator of failure
      await createNotification({
        userId: workflow.createdById,
        type: "WORKFLOW_FAILED",
        title: `Workflow "${workflow.name}" failed`,
        body: errorMsg,
        workflowId: workflow.id,
        channels: ["in_app"],
      }).catch(() => {}); // Don't throw if notification fails
    }
  }

  /**
   * Send run to Inngest for durable execution (Phase 2+).
   */
  private async sendToInngest(
    runId: string,
    workflowId: string,
    payload: TriggerPayload
  ): Promise<void> {
    await fetch("https://inn.gs/e/workflow.run.queued", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_EVENT_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "workflow.run.queued",
        data: { runId, workflowId, payload },
      }),
    });
  }

  /**
   * Poll pending runs from Postgres (Phase 1 - no Redis needed).
   * Called by the cron endpoint: /api/workflows/cron
   */
  async processPendingRuns(batchSize = 10): Promise<number> {
    const pending = await this.db.workflowRun.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      take: batchSize,
    });

    let processed = 0;
    for (const run of pending) {
      try {
        await this.executeRun(run.id);
        processed++;
      } catch (e) {
        console.error(`[WorkflowEngine] Failed to process run ${run.id}:`, e);
      }
    }

    return processed;
  }
}

export const workflowEngine = new WorkflowEngine();
