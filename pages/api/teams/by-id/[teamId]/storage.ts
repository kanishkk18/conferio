// pages/api/teams/[teamId]/storage.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const userId = session.user.id
    const { teamId } = req.query

    if (!teamId || typeof teamId !== 'string') {
      return res.status(400).json({ message: 'Team ID required' })
    }

    // Check if user is team member
    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    })

    if (!membership) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Get or create team storage record
    let teamStorage = await prisma.teamStorage.findUnique({
      where: { teamId },
    })

    // If no record exists, create with default 10GB quota
    if (!teamStorage) {
      teamStorage = await prisma.teamStorage.create({
        data: {
          teamId,
          usedStorage: BigInt(0),
          quota: BigInt(10 * 1024 * 1024 * 1024), // 10GB
        },
      })
    }

    // Calculate actual usage from files
    const filesAggregate = await prisma.file.aggregate({
      where: { teamId },
      _sum: { size: true },
    })

    const actualUsage = filesAggregate._sum.size || BigInt(0)
    
    // Update if different
    if (actualUsage !== teamStorage.usedStorage) {
      teamStorage = await prisma.teamStorage.update({
        where: { teamId },
        data: { usedStorage: actualUsage },
      })
    }

    const usagePercentage = teamStorage.quota > 0 
      ? (Number(teamStorage.usedStorage) / Number(teamStorage.quota)) * 100 
      : 0

    return res.status(200).json({
      usedStorage: teamStorage.usedStorage.toString(),
      quota: teamStorage.quota.toString(),
      usagePercentage,
      formattedUsed: formatBytes(Number(teamStorage.usedStorage)),
      formattedQuota: formatBytes(Number(teamStorage.quota)),
    })

  } catch (error) {
    console.error('Get team storage error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}