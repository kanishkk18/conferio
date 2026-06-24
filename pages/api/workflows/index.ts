// // pages/api/workflows/index.ts
// import type { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

//   if (req.method === 'GET') {
//     const { teamId } = req.query as { teamId: string }
//     if (!teamId) return res.status(400).json({ error: 'teamId required' })

//     const workflows = await prisma.workflow.findMany({
//       where: { teamId },
//       include: { _count: { select: { runs: true } } },
//       orderBy: { createdAt: 'desc' },
//     })
//     return res.status(200).json({ workflows })
//   }

//   if (req.method === 'POST') {
//     const { teamId, name, description, trigger, triggerConfig, conditions, steps, isActive } = req.body
//     if (!teamId || !name || !trigger) return res.status(400).json({ error: 'teamId, name, trigger required' })

//     const workflow = await prisma.workflow.create({
//       data: {
//         teamId,
//         name,
//         description,
//         trigger,
//         triggerConfig: triggerConfig ?? {},
//         conditions: conditions ?? [],
//         steps: steps ?? [],
//         isActive: isActive ?? false,
//         createdById: session.user.id,
//       },
//     })
//     return res.status(201).json({ workflow })
//   }

//   return res.status(405).json({ error: 'Method not allowed' })
// }


// pages/api/workflows/index.ts
// GET /api/workflows - list team workflows
// POST /api/workflows - create workflow

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import type { CreateWorkflowInput } from "../../../types/workflow";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

  const userId = (session.user as { id: string }).id;

  if (req.method === "GET") {
    const { teamId, page = "1", pageSize = "20" } = req.query;

    if (!teamId) return res.status(400).json({ error: "teamId required" });

    // Verify user is in team
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: teamId as string, userId } },
    });
    if (!membership) return res.status(403).json({ error: "Not a team member" });

    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where: { teamId: teamId as string },
        include: {
          createdBy: { select: { id: true, name: true, imageUrl: true } },
          runs: {
            orderBy: { startedAt: "desc" },
            take: 1,
            select: { id: true, status: true, startedAt: true, completedAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(pageSize as string),
      }),
      prisma.workflow.count({ where: { teamId: teamId as string } }),
    ]);

    return res.status(200).json({ workflows, total, page: parseInt(page as string) });
  }

  if (req.method === "POST") {
    const body = req.body as CreateWorkflowInput;

    if (!body.name || !body.teamId || !body.trigger || !body.steps?.length) {
      return res.status(400).json({ error: "name, teamId, trigger, and steps are required" });
    }

    // Verify user is admin or owner in team
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: body.teamId, userId } },
    });
    if (!membership || !["ADMIN", "OWNER", "MANAGER"].includes(membership.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const workflow = await prisma.workflow.create({
      data: {
        name: body.name,
        description: body.description || null,
        teamId: body.teamId,
        trigger: body.trigger,
        triggerConfig: (body.triggerConfig as object) || null,
        conditions: (body.conditions as object[]) || null,
        steps: body.steps as object[],
        isActive: body.isActive ?? true,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({ workflow });
  }

  return res.status(405).end();
}