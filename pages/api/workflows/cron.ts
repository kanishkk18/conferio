// pages/api/workflows/cron.ts
// Called by Vercel Cron (vercel.json) or external cron every minute.
// Handles: scheduled workflows, pending run processing, due reminders, due-soon tasks.
//
// vercel.json config:
// {
//   "crons": [{ "path": "/api/workflows/cron", "schedule": "* * * * *" }]
// }

import type { NextApiRequest, NextApiResponse } from "next";
import { workflowEngine } from "../../../lib/workflows/engine";
import {
  processScheduledWorkflows,
  processDueReminders,
  processDueSoonTasks,
} from "../../../lib/workflows/scheduler";

export const maxDuration = 60; // Vercel Pro: up to 300s; Free: 10s

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vercel cron sends Authorization header; external callers use secret
  const authHeader = req.headers.authorization;
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isInternalCall =
    req.headers["x-workflow-secret"] === process.env.WORKFLOW_INTERNAL_SECRET;

  if (!isVercelCron && !isInternalCall && process.env.NODE_ENV === "production") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const results = await Promise.allSettled([
    processScheduledWorkflows(),
    processDueReminders(),
    processDueSoonTasks(),
    workflowEngine.processPendingRuns(20), // Process up to 20 pending runs per tick
  ]);

  const [scheduled, reminders, dueSoon, pendingRuns] = results;

  return res.status(200).json({
    ok: true,
    scheduled:
      scheduled.status === "fulfilled" ? scheduled.value : { error: String(scheduled.reason) },
    reminders:
      reminders.status === "fulfilled"
        ? { processed: reminders.value }
        : { error: String(reminders.reason) },
    dueSoon:
      dueSoon.status === "fulfilled"
        ? { processed: dueSoon.value }
        : { error: String(dueSoon.reason) },
    pendingRuns:
      pendingRuns.status === "fulfilled"
        ? { processed: pendingRuns.value }
        : { error: String(pendingRuns.reason) },
    timestamp: new Date().toISOString(),
  });
}