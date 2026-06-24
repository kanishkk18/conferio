// pages/api/workflows/templates.ts
// GET  /api/workflows/templates                - list all templates
// POST /api/workflows/templates/:id/install    - create workflow from template

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { WORKFLOW_TEMPLATES } from "../../../lib/workflows/templates";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    const { category } = req.query;
    const templates =
      category && category !== "all"
        ? WORKFLOW_TEMPLATES.filter((t) => t.category === category)
        : WORKFLOW_TEMPLATES;

    return res.status(200).json({ templates });
  }

  if (req.method === "POST") {
    const userId = (session.user as { id: string }).id;
    const { templateId, teamId, customizations } = req.body;

    const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return res.status(404).json({ error: "Template not found" });

    // Verify user is admin/owner in team
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (!membership || !["ADMIN", "OWNER", "MANAGER"].includes(membership.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const workflow = await prisma.workflow.create({
      data: {
        name: customizations?.name || template.name,
        description: customizations?.description || template.description,
        teamId,
        trigger: template.trigger,
        triggerConfig: (template.triggerConfig as object) || null,
        conditions: (template.conditions as object[]) || null,
        steps: template.steps as object[],
        isActive: true,
        createdById: userId,
      },
    });

    // Increment template usage count in DB if stored
    await prisma.workflowTemplate.updateMany({
      where: { name: template.name },
      data: { usageCount: { increment: 1 } },
    });

    return res.status(201).json({ workflow });
  }

  return res.status(405).end();
}