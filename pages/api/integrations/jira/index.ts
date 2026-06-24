// pages/api/integrations/jira/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getToken } from '@/lib/integrations/token-manager'
import { searchJiraIssues, listJiraProjects, getJiraMyIssues, getJiraIssue, addJiraComment } from '@/lib/integrations/jira/jira'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

  const token = await getToken(session.user.id, 'jira')
  if (!token) return res.status(403).json({ error: 'Jira not connected', connectUrl: '/api/integrations/jira/connect' })

  const { cloudId, cloudUrl } = token.metadata as { cloudId: string; cloudUrl: string }

  if (req.method === 'GET') {
    const { action, search, projectKey, issueKey } = req.query as Record<string, string>
    try {
      if (action === 'projects') return res.status(200).json({ projects: await listJiraProjects(token.accessToken, cloudId) })
      if (action === 'my-issues') return res.status(200).json({ issues: await getJiraMyIssues(token.accessToken, cloudId, cloudUrl) })
      if (action === 'issue' && issueKey) return res.status(200).json({ issue: await getJiraIssue(token.accessToken, cloudId, cloudUrl, issueKey) })
      if (action === 'search' && search) return res.status(200).json({ issues: await searchJiraIssues(token.accessToken, cloudId, cloudUrl, search, { projectKey }) })
      return res.status(400).json({ error: 'Invalid action' })
    } catch (e: any) { return res.status(500).json({ error: e.message }) }
  }

  if (req.method === 'POST') {
    const { action, issueKey, comment } = req.body
    if (action === 'comment' && issueKey && comment) {
      try {
        await addJiraComment(token.accessToken, cloudId, issueKey, comment)
        return res.status(200).json({ success: true })
      } catch (e: any) { return res.status(500).json({ error: e.message }) }
    }
    return res.status(400).json({ error: 'Invalid action' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}