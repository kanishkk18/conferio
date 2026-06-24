// pages/api/integrations/salesforce/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getToken } from '@/lib/integrations/token-manager'
import {
  searchSalesforceContacts, searchSalesforceAccounts,
  getOpenOpportunities, getRecentLeads,
} from '@/lib/integrations/crm/salesforce'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

  const token = await getToken(session.user.id, 'salesforce')
  if (!token) return res.status(403).json({ error: 'Salesforce not connected', connectUrl: '/api/integrations/salesforce/connect' })

  const instanceUrl = token.metadata.instanceUrl as string
  const { action, search } = req.query as Record<string, string>

  try {
    if (action === 'contacts' && search) return res.status(200).json({ contacts: await searchSalesforceContacts(token.accessToken, instanceUrl, search) })
    if (action === 'accounts' && search) return res.status(200).json({ accounts: await searchSalesforceAccounts(token.accessToken, instanceUrl, search) })
    if (action === 'opportunities') return res.status(200).json({ opportunities: await getOpenOpportunities(token.accessToken, instanceUrl) })
    if (action === 'leads') return res.status(200).json({ leads: await getRecentLeads(token.accessToken, instanceUrl) })
    return res.status(400).json({ error: 'Invalid action. Use: contacts | accounts | opportunities | leads' })
  } catch (e: any) { return res.status(500).json({ error: e.message }) }
}