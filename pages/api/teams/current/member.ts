// // // pages/api/teams/current/members.ts
// // import { NextApiRequest, NextApiResponse } from 'next'
// // import { getServerSession } from 'next-auth'
// // import { authOptions } from '@/lib/auth'
// // import { prisma } from '@/lib/prisma'

// // export default async function handler(
// //   req: NextApiRequest,
// //   res: NextApiResponse
// // ) {
// //   if (req.method !== 'GET') {
// //     return res.status(405).json({ message: 'Method not allowed' })
// //   }

// //   try {
// //     const session = await getServerSession(req, res, authOptions)
// //     if (!session?.user?.id) {
// //       return res.status(401).json({ message: 'Unauthorized' })
// //     }

// //     const userId = session.user.id

// //     // Get current active team from session or query
// //     // You can store active team in session or pass as query param
// //     const { teamId } = req.query

// //     let targetTeamId = teamId as string | undefined

// //     // If no teamId provided, get user's first team (any role)
// //     if (!targetTeamId) {
// //       const firstMembership = await prisma.teamMember.findFirst({
// //         where: { userId },
// //         include: { team: true },
// //         orderBy: { createdAt: 'desc' },
// //       })
      
// //       if (!firstMembership) {
// //         return res.status(404).json({ message: 'No teams found' })
// //       }
      
// //       targetTeamId = firstMembership.teamId
// //     }

// //     // Verify user is a member of this team (any role: OWNER, ADMIN, or MEMBER)
// //     const membership = await prisma.teamMember.findFirst({
// //       where: {
// //         teamId: targetTeamId,
// //         userId,
// //       },
// //     })

// //     if (!membership) {
// //       return res.status(403).json({ message: 'Not a member of this team' })
// //     }

// //     // Get all members of the team
// //     const members = await prisma.teamMember.findMany({
// //       where: { teamId: targetTeamId },
// //       include: {
// //         user: {
// //           select: {
// //             id: true,
// //             name: true,
// //             email: true,
// //             image: true,
// //           },
// //         },
// //       },
// //       orderBy: { role: 'asc' }, // Owners first, then admins, then members
// //     })

// //     return res.status(200).json({
// //       data: members.map((member) => ({
// //         id: member.id,
// //         userId: member.userId,
// //         role: member.role,
// //         user: member.user,
// //         createdAt: member.createdAt,
// //       })),
// //       teamId: targetTeamId,
// //     })

// //   } catch (error) {
// //     console.error('Get team members error:', error)
// //     return res.status(500).json({ message: 'Internal server error' })
// //   }
// // }

// // pages/api/teams/current/members.ts
// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ message: 'Method not allowed' })
//   }

//   try {
//     const session = await getServerSession(req, res, authOptions)
//     if (!session?.user?.id) {
//       return res.status(401).json({ message: 'Unauthorized' })
//     }

//     const userId = session.user.id
//     const { teamId } = req.query

//     if (!teamId) {
//       return res.status(400).json({ message: 'Team ID is required' })
//     }

//     // Verify user is a member of this team (any role)
//     const membership = await prisma.teamMember.findFirst({
//       where: {
//         teamId: teamId as string,
//         userId,
//       },
//     })

//     if (!membership) {
//       return res.status(403).json({ message: 'Not a member of this team' })
//     }

//     // Get all members of the team with user details
//     const members = await prisma.teamMember.findMany({
//       where: { teamId: teamId as string },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true,
//           },
//         },
//       },
//       orderBy: [
//         { role: 'asc' }, // OWNER first, then ADMIN, then MEMBER
//         { createdAt: 'desc' }
//       ],
//     })

//     return res.status(200).json({
//       data: members.map((member) => ({
//         id: member.id,
//         userId: member.userId,
//         role: member.role,
//         user: member.user,
//         createdAt: member.createdAt,
//       })),
//       teamId: teamId as string,
//     })

//   } catch (error) {
//     console.error('Get team members error:', error)
//     return res.status(500).json({ message: 'Internal server error' })
//   }
// }


// pages/api/teams/current/members.ts
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

    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' })
    }

    // Check if user is a member of this team
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: teamId as string,
        userId,
      },
      include: {
        team: true,
      },
    })

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this team' })
    }

    // Get all members using your existing pattern
    const members = await prisma.teamMember.findMany({
      where: { 
        teamId: teamId as string 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' }
      ],
    })

    // Format to match expected structure
    const formattedMembers = members.map((member) => ({
      id: member.id,
      userId: member.userId,
      role: member.role,
      user: member.user,
      createdAt: member.createdAt,
    }))

    return res.status(200).json({
      data: formattedMembers,
      teamId: teamId as string,
    })

  } catch (error) {
    console.error('Get team members error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}