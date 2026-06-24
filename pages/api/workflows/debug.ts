// pages/api/workflows/debug.ts
// TEMPORARY debug endpoint - delete after confirming workflows work.
// Hit: POST /api/workflows/debug { teamId, trigger, data }
// This lets you fire any workflow trigger directly from the browser/curl.

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkflowEngine } from "@/lib/workflows/engine";
import type { TriggerPayload } from "types/workflow";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { teamId, trigger, data } = req.body as {
    teamId: string;
    trigger: string;
    data?: Record<string, unknown>;
  };

  if (!teamId || !trigger) {
    return res.status(400).json({ error: "teamId and trigger required" });
  }

  // Show what workflows exist for this team + trigger
  const matchingWorkflows = await prisma.workflow.findMany({
    where: { teamId, trigger, isActive: true },
    select: { id: true, name: true, trigger: true, isActive: true, steps: true, conditions: true },
  });

  const payload: TriggerPayload = {
    teamId,
    userId: session.user.id,
    data: data ?? {},
    timestamp: new Date().toISOString(),
  };

  const engine = new WorkflowEngine(prisma);
  const runIds = await engine.trigger(trigger, payload);

  // Wait a moment then check run statuses
  await new Promise((r) => setTimeout(r, 2000));

  const runs = runIds.length > 0
    ? await prisma.workflowRun.findMany({
        where: { id: { in: runIds } },
        select: { id: true, status: true, error: true, steps: true, completedAt: true },
      })
    : [];

  return res.status(200).json({
    message: "Debug complete",
    trigger,
    teamId,
    matchingWorkflows,
    runIds,
    runs,
  });
}