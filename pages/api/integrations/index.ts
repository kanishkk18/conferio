// pages/api/integrations/index.ts
/**
 * GET  /api/integrations          → list all integrations with connection status
 * DELETE /api/integrations?provider=google → disconnect a provider
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'lib/auth'
import { prisma } from 'lib/prisma'
import { disconnectProvider } from 'lib/integrations/token-manager'
import type { TokenProvider } from 'lib/integrations/token-manager'
import { PROVIDER_CONFIGS } from 'lib/integrations/providers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const userId = session.user.id

    // ── GET: list all integrations with status ──────────────────────────
    if (req.method === 'GET') {
        const integrations = await (prisma as any).integration.findMany({
            where: { userId },
            select: {
                appType: true,
                isConnected: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        // Map DB records to provider status
        const connectedMap: Record<string, {
            connected: boolean
            metadata: Record<string, unknown>
            connectedAt: string
        }> = {}

        const APP_TYPE_TO_PROVIDER: Record<string, string> = {
            GOOGLE_MEET_AND_CALENDAR: 'google',
            SLACK: 'slack',
            NOTION: 'notion',
            JIRA: 'jira',
            MICROSOFT_ONEDRIVE: 'microsoft',
            BOX: 'box',
            DROPBOX: 'dropbox',
            SALESFORCE: 'salesforce',
            DISCORD: 'discord',
        }

        for (const integration of integrations) {
            const provider = APP_TYPE_TO_PROVIDER[integration.app_type]
            if (provider) {
                connectedMap[provider] = {
                    connected: integration.isConnected,
                    metadata: (integration.metadata as Record<string, unknown>) ?? {},
                    connectedAt: integration.updatedAt?.toISOString(),
                }
            }
        }

        // Return all providers with their status
        const result = PROVIDER_CONFIGS.map((config) => ({
            ...config,
            connected: connectedMap[config.id]?.connected ?? false,
            connectedAt: connectedMap[config.id]?.connectedAt,
            accountName: connectedMap[config.id]?.metadata?.accountName as string | undefined,
            accountEmail: connectedMap[config.id]?.metadata?.accountEmail as string | undefined,
            accountAvatar: connectedMap[config.id]?.metadata?.accountAvatar as string | undefined,
        }))

        return res.status(200).json({ integrations: result })
    }

    // ── DELETE: disconnect a provider ───────────────────────────────────
    if (req.method === 'DELETE') {
        const { provider } = req.query as { provider: string }

        if (!provider) {
            return res.status(400).json({ error: 'provider query param required' })
        }

        try {
            await disconnectProvider(userId, provider as TokenProvider)
            return res.status(200).json({ success: true, provider })
        } catch (err: any) {
            return res.status(500).json({ error: err.message })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
}