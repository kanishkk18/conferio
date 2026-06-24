// pages/api/teams/[slug]/workload/rebalance.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from "models/team";
import { throwIfNotAllowed } from "models/user";
import { prisma } from "@/lib/prisma";
import { recordMetric } from "@/lib/metrics";
import { getRedisClient } from "@/lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await throwIfNoTeamAccess(req, res);

    switch (req.method) {
      case "POST":
        await handlePOST(req, res);
        break;
      default:
        res.setHeader("Allow", "POST");
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || "Something went wrong" } });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, "team", "update");

  const { action, taskId, pageId, fromUserId, toUserId } = req.body as {
    action: "reassign_task" | "reassign_page";
    taskId?: string;
    pageId?: string;
    fromUserId: string;
    toUserId: string;
  };

  const teamId = user.team.id;

  // Verify both users are in the team
  const [fromMember, toMember] = await Promise.all([
    prisma.teamMember.findFirst({ where: { teamId, userId: fromUserId } }),
    prisma.teamMember.findFirst({ where: { teamId, userId: toUserId } }),
  ]);

  if (!fromMember || !toMember) {
    return res.status(400).json({ error: { message: "Both users must be team members" } });
  }

  let result: { success: boolean; message: string } = { success: false, message: "" };

  if (action === "reassign_task" && taskId) {
    // Reassign task: remove from old assignee, add new one
    await prisma.$transaction([
      prisma.taskAssignee.deleteMany({
        where: { taskId, userId: fromUserId },
      }),
      prisma.taskAssignee.upsert({
        where: { taskId_userId: { taskId, userId: toUserId } },
        create: { taskId, userId: toUserId, assignedBy: user.id },
        update: { assignedBy: user.id },
      }),
      // Log activity
      prisma.activityLog.create({
        data: {
          action: "REASSIGNED",
          entityType: "TASK",
          entityId: taskId,
          description: `Task reassigned from ${fromMember.userId} to ${toMember.userId} for workload balance`,
          userId: user.id,
          taskId,
          metadata: { fromUserId, toUserId, reason: "workload_balance" },
        },
      }),
    ]);
    result = { success: true, message: "Task reassigned successfully" };
  } else if (action === "reassign_page" && pageId) {
    await prisma.page.update({
      where: { id: pageId },
      data: { assignedToId: toMember.id, assignedById: user.id },
    });
    result = { success: true, message: "Page reassigned successfully" };
  } else {
    return res.status(400).json({ error: { message: "Invalid action or missing parameters" } });
  }

  // Invalidate cache
  try {
    const redis = getRedisClient();
    await redis.del(`workload:${teamId}`);
  } catch (_) {}

  recordMetric("workload.rebalanced");
  res.status(200).json({ data: result });
};