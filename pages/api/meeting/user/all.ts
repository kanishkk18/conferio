// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { withErrorHandling } from '@/lib/middleware'
// import { HTTPSTATUS } from '@/lib/http-status'
// import { MeetingFilterEnum, MeetingFilterEnumType } from '@/lib/utils'
// import { MeetingStatus } from '@prisma/client'

// const handler = async (req: NextRequest) => {
//   const session = await getServerSession(authOptions)
  
//   if (!session?.user?.id) {
//     return NextResponse.json(
//       { message: 'Authentication required' },
//       { status: HTTPSTATUS.UNAUTHORIZED }
//     )
//   }

//   const url = new URL(req.url)
//   const filter = (url.searchParams.get('filter') as MeetingFilterEnumType) || MeetingFilterEnum.UPCOMING

//   let where: any = { userId: session.user.id }

//   if (filter === MeetingFilterEnum.UPCOMING) {
//     where.status = MeetingStatus.SCHEDULED
//     where.startTime = { gt: new Date() }
//   } else if (filter === MeetingFilterEnum.PAST) {
//     where.status = MeetingStatus.SCHEDULED
//     where.startTime = { lt: new Date() }
//   } else if (filter === MeetingFilterEnum.CANCELLED) {
//     where.status = MeetingStatus.CANCELLED
//   } else {
//     where.status = MeetingStatus.SCHEDULED
//     where.startTime = { gt: new Date() }
//   }

//   const meetings = await prisma.meeting.findMany({
//     where,
//     include: {
//       event: true,
//     },
//     orderBy: { startTime: 'asc' },
//   })

//   return NextResponse.json(
//     {
//       message: "Meetings fetched successfully",
//       meetings: meetings || [],
//     },
//     { status: HTTPSTATUS.OK }
//   )
// }

// export const GET = withErrorHandling(handler)

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { HTTPSTATUS } from '@/lib/http-status'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
import { getSession } from 'next-auth/react'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only handle GET requests
    if (req.method !== 'GET') {
      return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
        message: 'Method not allowed'
      })
    }

    // Authentication
    // const session = await getServerSession(req, res, authOptions)
  const session = await getSession({ req })

    if (!session?.user) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
        message: 'Unauthorized - Please sign in' 
      })
    }
    
    const userId = session.user.id
    console.log('Fetching meetings for user:', userId) // Debugging

    const filter = req.query.filter as string || 'upcoming';

    let where: any = { userId }

switch (filter.toLowerCase()) {
  case 'upcoming':
    where.status = 'SCHEDULED'
    where.startTime = { gt: new Date() }
    break;
  case 'past':
    where.status = 'SCHEDULED'
    where.startTime = { lt: new Date() }
    break;
  case 'cancelled':
    where.status = 'CANCELLED'
    break;
  default:
    where.status = 'SCHEDULED'
    where.startTime = { gt: new Date() }
}

    // Fetch meetings with related event data
    const meetings = await prisma.meeting.findMany({
      where: { userId },
      include: {
        event: true,
      },
      orderBy: { startTime: 'asc' }
    })

    return res.status(HTTPSTATUS.OK).json({
      message: "Meetings fetched successfully",
      meetings: meetings || [],
    })
  } catch (error) {
    console.error('Error fetching meetings:', error)
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error'
    })
  }
}