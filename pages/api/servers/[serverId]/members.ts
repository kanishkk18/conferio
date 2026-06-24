// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/lib/auth"
// import { prisma } from "@/lib/prisma"

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { serverId } = req.query
//   const session = await getServerSession(req, res, authOptions)

//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   try {
//     // Check if current user is member of this server
//     const currentMember = await prisma.member.findFirst({
//       where: { 
//         serverId: serverId as string, 
//         userId: session.user.id 
//       }
//     })

//     if (!currentMember) {
//       return res.status(403).json({ error: 'Not a member of this server' })
//     }

//     // Get ALL members of this server
//     const members = await prisma.member.findMany({
//       where: { 
//         serverId: serverId as string 
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true,
//           }
//         }
//       },
//       orderBy: {
//         role: 'asc'
//       }
//     })

//     res.status(200).json({ data: members })
//   } catch (error) {
//     console.error('Error fetching members:', error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// }

import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { serverId } = req.query
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // First, find the Server to get its userId (owner)
    const server = await prisma.server.findUnique({
      where: { id: serverId as string }
    })

    if (!server) {
      return res.status(404).json({ error: 'Server not found' })
    }

    // Find the Team that this Server belongs to (via the owner)
    // Server.userId is the creator - we need to find their team
    const team = await prisma.team.findFirst({
      where: {
        members: {
          some: {
            userId: server.userId
          }
        }
      }
    })

    if (!team) {
      // Fallback: return just the server owner as member
      const owner = await prisma.user.findUnique({
        where: { id: server.userId },
        select: { id: true, name: true, email: true, image: true }
      })
      
      return res.status(200).json({ 
        data: [{
          id: server.userId,
          role: 'ADMIN',
          user: owner
        }] 
      })
    }

    // Get ALL TeamMembers of this team (not just Server Members)
    const teamMembers = await prisma.teamMember.findMany({
      where: { 
        teamId: team.id 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        role: 'asc'
      }
    })

    // Map TeamMember to the format expected by the component
    const mappedMembers = teamMembers.map(tm => ({
      id: tm.id,  // TeamMember ID
      userId: tm.userId,
      role: tm.role,  // ADMIN, OWNER, MEMBER, CLIENT, MANAGER, INTERN
      user: tm.user,
      teamId: tm.teamId
    }))

    res.status(200).json({ data: mappedMembers })
  } catch (error) {
    console.error('Error fetching team members:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}