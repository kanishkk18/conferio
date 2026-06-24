// pages/api/workflows/[id]/run.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WorkflowEngine } from '@/lib/workflows/engine'
import type { TriggerPayload } from 'types/workflow'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query as { id: string }

  const workflow = await prisma.workflow.findUnique({ where: { id } })
  if (!workflow) return res.status(404).json({ error: 'Workflow not found' })

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: workflow.teamId, userId: session.user.id } },
  })
  if (!membership) return res.status(403).json({ error: 'Forbidden' })

  const payload: TriggerPayload = {
    teamId: workflow.teamId,
    userId: session.user.id,
    data: { ...(req.body?.data ?? {}), manual: true },
    timestamp: new Date().toISOString(),
  }

  const engine = new WorkflowEngine(prisma)
  const runId = await engine.enqueue(workflow.id, payload)

  return res.status(200).json({ success: true, runId, message: 'Workflow queued' })
}