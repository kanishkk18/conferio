// pages/api/workflows/trigger.ts
// Called internally when domain events occur (task created, meeting ended, etc.)
// This is the single entry point for all workflow triggers.

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { workflowEngine } from "../../../lib/workflows/engine";
import type { TriggerPayload } from "../../../types/workflow";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // This endpoint is called server-side (internal), not by browser.
  // Verify internal secret for server-to-server calls.
  const secret = req.headers["x-workflow-secret"];
  const isInternalCall = secret === process.env.WORKFLOW_INTERNAL_SECRET;

  if (!isInternalCall) {
    // If called from browser, require session
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: "Unauthorized" });
  }

  const { trigger, payload, sync = false } = req.body as {
    trigger: string;
    payload: TriggerPayload;
    sync?: boolean;
  };

  if (!trigger || !payload?.teamId) {
    return res.status(400).json({ error: "trigger and payload.teamId required" });
  }

  try {
    const runIds = await workflowEngine.trigger(trigger, payload, { sync });
    return res.status(202).json({ queued: runIds.length, runIds });
  } catch (err) {
    console.error("[WorkflowTrigger] error:", err);
    return res.status(500).json({ error: "Failed to trigger workflows" });
  }
}

/**
 * Helper to call this endpoint from other API routes.
 * Usage: await triggerWorkflow("task.created", { teamId, data: { ... } })
 */
export async function triggerWorkflow(
  trigger: string,
  payload: TriggerPayload,
  opts: { sync?: boolean } = {}
): Promise<void> {
  // In the same process: call engine directly (most efficient)
  await workflowEngine.trigger(trigger, payload, opts).catch((err) => {
    console.error(`[triggerWorkflow] ${trigger} failed:`, err);
  });
}