// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/lib/auth"
// import { prisma } from "@/lib/prisma"
// import { MemberRole } from '@prisma/client'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)

//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   // POST - Add members to channel
//   if (req.method === 'POST') {
//     try {
//       const { channelId, memberIds } = req.body

//       if (!channelId || !memberIds || !Array.isArray(memberIds)) {
//         return res.status(400).json({ error: 'Missing channelId or memberIds' })
//       }

//       // Get the channel to find serverId
//       const channel = await prisma.channel.findUnique({
//         where: { id: channelId },
//         include: { server: true }
//       })

//       if (!channel) {
//         return res.status(404).json({ error: 'Channel not found' })
//       }

//       // Check if current user is admin/mod of this server
//       const currentMember = await prisma.member.findFirst({
//         where: { 
//           serverId: channel.serverId, 
//           userId: session.user.id 
//         }
//       })

//       if (!currentMember || (currentMember.role !== MemberRole.ADMIN && currentMember.role !== MemberRole.MODERATOR)) {
//         return res.status(403).json({ error: 'Not authorized to add members' })
//       }

//       // Check if members are already in channel
//       const existingMembers = await prisma.channelMember.findMany({
//         where: {
//           channelId: channelId,
//           memberId: { in: memberIds }
//         }
//       })

//       const existingMemberIds = existingMembers.map(m => m.memberId)
//       const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id))

//       if (newMemberIds.length === 0) {
//         return res.status(200).json({ message: 'All members already in channel' })
//       }

//       // Add members to channel
//       const created = await prisma.channelMember.createMany({
//         data: newMemberIds.map(memberId => ({
//           channelId: channelId,
//           memberId: memberId,
//           role: 'MEMBER'
//         })),
//         skipDuplicates: true
//       })

//       // Return updated channel members
//       const updatedMembers = await prisma.channelMember.findMany({
//         where: { channelId: channelId },
//         include: {
//           member: {
//             include: {
//               user: {
//                 select: {
//                   id: true,
//                   name: true,
//                   email: true,
//                   image: true,
//                 }
//               }
//             }
//           }
//         }
//       })

//       res.status(200).json({ 
//         message: `Added ${created.count} members`,
//         data: updatedMembers 
//       })

//     } catch (error) {
//       console.error('Error adding channel members:', error)
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   }
  
//   // GET - Get channel members
//   else if (req.method === 'GET') {
//     try {
//       const { channelId } = req.query

//       if (!channelId) {
//         return res.status(400).json({ error: 'Missing channelId' })
//       }

//       const members = await prisma.channelMember.findMany({
//         where: { channelId: channelId as string },
//         include: {
//           member: {
//             include: {
//               user: {
//                 select: {
//                   id: true,
//                   name: true,
//                   email: true,
//                   image: true,
//                 }
//               }
//             }
//           }
//         }
//       })

//       res.status(200).json({ data: members })
//     } catch (error) {
//       console.error('Error fetching channel members:', error)
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   }
  
//   else {
//     res.status(405).json({ error: 'Method not allowed' })
//   }
// }

import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // POST - Add team members to channel
  if (req.method === 'POST') {
    try {
      const { channelId, memberIds } = req.body

      if (!channelId || !memberIds || !Array.isArray(memberIds)) {
        return res.status(400).json({ error: 'Missing channelId or memberIds' })
      }

      // Get the channel
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: { server: true }
      })

      if (!channel) {
        return res.status(404).json({ error: 'Channel not found' })
      }

      // Check if current user is admin/owner of the team
      const server = await prisma.server.findUnique({
        where: { id: channel.serverId }
      })

      if (!server) {
        return res.status(404).json({ error: 'Server not found' })
      }

      // Find the team
      const team = await prisma.team.findFirst({
        where: {
          members: {
            some: { userId: server.userId }
          }
        }
      })

      // Check if current user has permission
      const currentTeamMember = await prisma.teamMember.findFirst({
        where: {
          teamId: team?.id,
          userId: session.user.id
        }
      })

      if (!currentTeamMember || (currentTeamMember.role !== 'ADMIN' && currentTeamMember.role !== 'OWNER')) {
        return res.status(403).json({ error: 'Not authorized to add members' })
      }

      // memberIds are TeamMember IDs - we need to find or create ChannelMember records
      // First, get the TeamMember records to find their userIds
      const teamMembersToAdd = await prisma.teamMember.findMany({
        where: {
          id: { in: memberIds }
        }
      })

      // Check which users are already in the channel via Member model
      const existingMembers = await prisma.member.findMany({
        where: {
          serverId: channel.serverId,
          userId: { in: teamMembersToAdd.map(tm => tm.userId) }
        }
      })

      const existingUserIds = existingMembers.map(m => m.userId)
      const newTeamMembers = teamMembersToAdd.filter(tm => !existingUserIds.includes(tm.userId))

      // Create Member records for users not yet in the server
      if (newTeamMembers.length > 0) {
        await prisma.member.createMany({
          data: newTeamMembers.map(tm => ({
            userId: tm.userId,
            serverId: channel.serverId,
            role: tm.role === 'ADMIN' || tm.role === 'OWNER' ? 'ADMIN' : 'GUEST'
          })),
          skipDuplicates: true
        })
      }

      // Now get all Member IDs for these users
      const allMembers = await prisma.member.findMany({
        where: {
          serverId: channel.serverId,
          userId: { in: teamMembersToAdd.map(tm => tm.userId) }
        }
      })

      // Check existing ChannelMembers
      const existingChannelMembers = await prisma.channelMember.findMany({
        where: {
          channelId: channelId,
          memberId: { in: allMembers.map(m => m.id) }
        }
      })

      const existingMemberIds = existingChannelMembers.map(cm => cm.memberId)
      const newMemberIds = allMembers.filter(m => !existingMemberIds.includes(m.id))

      // Add to ChannelMember
      if (newMemberIds.length > 0) {
        await prisma.channelMember.createMany({
          data: newMemberIds.map(m => ({
            channelId: channelId,
            memberId: m.id,
            role: 'MEMBER'
          })),
          skipDuplicates: true
        })
      }

      // Return updated channel members
      const updatedMembers = await prisma.channelMember.findMany({
        where: { channelId: channelId },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                }
              }
            }
          }
        }
      })

      res.status(200).json({ 
        message: `Added ${newMemberIds.length} members`,
        data: updatedMembers 
      })

    } catch (error) {
      console.error('Error adding channel members:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  // GET - Get channel members
  else if (req.method === 'GET') {
    try {
      const { channelId } = req.query

      if (!channelId) {
        return res.status(400).json({ error: 'Missing channelId' })
      }

      const members = await prisma.channelMember.findMany({
        where: { channelId: channelId as string },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                }
              }
            }
          }
        }
      })

      res.status(200).json({ data: members })
    } catch (error) {
      console.error('Error fetching channel members:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}