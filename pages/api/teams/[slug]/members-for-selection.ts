// // pages/api/teams/[slug]/members-for-selection.ts
// import { NextApiRequest, NextApiResponse } from 'next'
// import { getTeam, throwIfNoTeamAccess } from 'models/team'
// import { throwIfNotAllowed } from 'models/user'
// import { HTTPSTATUS } from '@/lib/http-status'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({ message: 'Method not allowed' })
//   }

//   try {
//     const teamMember = await throwIfNoTeamAccess(req, res)
//     throwIfNotAllowed(teamMember, 'team_member', 'read')

//     const { slug } = req.query
    
//     const team = await getTeam({ slug: slug as string })
    
//     if (!team) {
//       return res.status(HTTPSTATUS.NOT_FOUND).json({ message: 'Team not found' })
//     }

//     // Get all members with their user details
//     const members = await prisma.teamMember.findMany({
//       where: { teamId: team.id },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true,
//           }
//         }
//       }
//     })

//     // Format for frontend
//     const formattedMembers = members.map(m => ({
//       id: m.user.id,
//       teamMemberId: m.id,
//       name: m.user.name,
//       email: m.user.email,
//       image: m.user.image,
//       role: m.role,
//     }))

//     return res.status(HTTPSTATUS.OK).json({
//       data: {
//         team: {
//           id: team.id,
//           name: team.name,
//           slug: team.slug,
//         },
//         members: formattedMembers,
//       }
//     })

//   } catch (error: any) {
//     console.error('Error fetching team members:', error)
//     return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
//       message: error.message || 'Internal server error',
//     })
//   }
// }

// pages/api/teams/[slug]/members-for-selection.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getTeam, throwIfNoTeamAccess } from 'models/team'
import { HTTPSTATUS } from '@/lib/http-status'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'


// Only these roles can schedule team meetings
const CAN_SCHEDULE_TEAM_MEETING = [Role.OWNER, Role.ADMIN, Role.MANAGER]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({ message: 'Method not allowed' })
  }

  try {
    const teamMember = await throwIfNoTeamAccess(req, res)
    
    // Check if user has permission to schedule team meetings
    if (!CAN_SCHEDULE_TEAM_MEETING.includes(teamMember.role as any)) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({ 
        message: 'Only owners, admins, and managers can schedule team meetings' 
      })
    }

    const { slug } = req.query
    
    const team = await getTeam({ slug: slug as string })
    
    if (!team) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({ message: 'Team not found' })
    }

    // Get all members with their user details
    const members = await prisma.teamMember.findMany({
      where: { teamId: team.id },
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
    })

    // Format for frontend
    const formattedMembers = members.map(m => ({
      id: m.user.id,
      teamMemberId: m.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      role: m.role,
    }))

    return res.status(HTTPSTATUS.OK).json({
      data: {
        team: {
          id: team.id,
          name: team.name,
          slug: team.slug,
        },
        members: formattedMembers,
      }
    })

  } catch (error: any) {
    console.error('Error fetching team members:', error)
    return res.status(error.status || HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message || 'Internal server error',
    })
  }
}