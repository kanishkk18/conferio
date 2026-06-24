
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { HTTPSTATUS } from '@/lib/http-status'
import { IntegrationAppType, IntegrationProvider, IntegrationCategory } from '@prisma/client'

const SUPPORTED_INTEGRATIONS: IntegrationAppType[] = [
  IntegrationAppType.GOOGLE_MEET_AND_CALENDAR,
  IntegrationAppType.ZOOM_MEETING,
  IntegrationAppType.OUTLOOK_CALENDAR
]
const appTypeToProviderMap: Record<IntegrationAppType, IntegrationProvider> = {
  [IntegrationAppType.GOOGLE_MEET_AND_CALENDAR]: IntegrationProvider.GOOGLE,
  [IntegrationAppType.ZOOM_MEETING]: IntegrationProvider.ZOOM,
  [IntegrationAppType.OUTLOOK_CALENDAR]: IntegrationProvider.MICROSOFT,
}

const appTypeToCategoryMap: Record<IntegrationAppType, IntegrationCategory> = {
  [IntegrationAppType.GOOGLE_MEET_AND_CALENDAR]: IntegrationCategory.CALENDAR_AND_VIDEO_CONFERENCING,
  [IntegrationAppType.ZOOM_MEETING]: IntegrationCategory.VIDEO_CONFERENCING,
  [IntegrationAppType.OUTLOOK_CALENDAR]: IntegrationCategory.CALENDAR,
}

const appTypeToTitleMap: Record<IntegrationAppType, string> = {
  [IntegrationAppType.GOOGLE_MEET_AND_CALENDAR]: "Google Meet & Calendar",
  [IntegrationAppType.ZOOM_MEETING]: "Zoom",
  [IntegrationAppType.OUTLOOK_CALENDAR]: "Outlook Calendar",
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
        message: 'Method not allowed'
      })
    }

    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: 'Authentication required'
      })
    }

    const userIntegrations = await prisma.integration.findMany({
      where: { userId: session.user.id },
      select: { appType: true }
    })

    const connectedAppTypes = new Set(
      userIntegrations.map(integration => integration.appType)
    )

    const integrations = SUPPORTED_INTEGRATIONS.map((appType) => ({
      provider: appTypeToProviderMap[appType],
      title: appTypeToTitleMap[appType],
      app_type: appType,
      category: appTypeToCategoryMap[appType],
      isConnected: connectedAppTypes.has(appType),
    }))

    return res.status(HTTPSTATUS.OK).json({
      message: "Fetched user integrations successfully",
      integrations,
    })
  } catch (error) {
    console.error('Failed to fetch user integrations:', error)
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error'
    })
  }
}