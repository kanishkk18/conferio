// // pages/api/workflows/[id].ts
// import type { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
// import { inngest } from 'inngest/client'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

//   const { id } = req.query as { id: string }

//   if (req.method === 'GET') {
//     const workflow = await prisma.workflow.findUnique({ where: { id } })
//     if (!workflow) return res.status(404).json({ error: 'Not found' })
//     return res.status(200).json({ workflow })
//   }

//   if (req.method === 'PUT') {
//     const { name, description, trigger, triggerConfig, conditions, steps, isActive } = req.body
//     const workflow = await prisma.workflow.update({
//       where: { id },
//       data: { name, description, trigger, triggerConfig, conditions, steps, isActive, updatedAt: new Date() },
//     })
//     return res.status(200).json({ workflow })
//   }

//   if (req.method === 'PATCH') {
//     const workflow = await prisma.workflow.update({
//       where: { id },
//       data: { ...req.body, updatedAt: new Date() },
//     })
//     return res.status(200).json({ workflow })
//   }

//   if (req.method === 'DELETE') {
//     await prisma.workflow.delete({ where: { id } })
//     return res.status(200).json({ success: true })
//   }

//   return res.status(405).json({ error: 'Method not allowed' })
// }

// pages/api/workflows/[id].ts
// GET    /api/workflows/:id        - get workflow with runs
// PATCH  /api/workflows/:id        - update workflow
// DELETE /api/workflows/:id        - delete workflow

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

async function assertCanManage(workflowId: string, userId: string): Promise<boolean> {
  const wf = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!wf) return false;

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: wf.teamId, userId } },
  });
  return !!membership && ["ADMIN", "OWNER", "MANAGER"].includes(membership.role);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

  const userId = (session.user as { id: string }).id;
  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, imageUrl: true } },
        runs: {
          orderBy: { startedAt: "desc" },
          take: 20,
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            durationMs: true,
            error: true,
            retryCount: true,
            steps: true,
          },
        },
      },
    });

    if (!workflow) return res.status(404).json({ error: "Not found" });

    // Verify user is in team
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: workflow.teamId, userId } },
    });
    if (!membership) return res.status(403).json({ error: "Forbidden" });

    return res.status(200).json({ workflow });
  }

  if (req.method === "PATCH") {
    if (!(await assertCanManage(id, userId))) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { name, description, conditions, steps, isActive, triggerConfig } = req.body;

    const updated = await prisma.workflow.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(conditions !== undefined && { conditions: conditions as object[] }),
        ...(steps !== undefined && { steps: steps as object[] }),
        ...(isActive !== undefined && { isActive }),
        ...(triggerConfig !== undefined && { triggerConfig: triggerConfig as object }),
      },
    });

    return res.status(200).json({ workflow: updated });
  }

  if (req.method === "DELETE") {
    if (!(await assertCanManage(id, userId))) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    await prisma.workflow.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).end();
}