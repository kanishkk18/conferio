// pages/api/meetings/join.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust path to your authOptions
import { prisma } from '@/lib/prisma';
import { HTTPSTATUS } from '@/lib/http-status';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: 'Unauthorized' });
    }

    const { meetingId } = req.body;
    const userId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name;

    if (!userEmail) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({ message: 'User email not found' });
    }

    // Check if user is host
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { userId: true },
    });

    if (meeting?.userId === userId) {
      // User is host, upsert join record
      await prisma.meetingAttendee.upsert({
        where: {
          meetingId_email: {
            meetingId,
            email: userEmail,
          },
        },
        update: { status: 'joined' },
        create: {
          meetingId,
          userId,
          email: userEmail,
          name: userName || userEmail,
          status: 'joined',
        },
      });
    } else {
      // User is attendee, update existing record
      await prisma.meetingAttendee.updateMany({
        where: {
          meetingId,
          OR: [
            { userId },
            { email: userEmail },
          ],
        },
        data: {
          status: 'joined',
        },
      });
    }

    return res.status(HTTPSTATUS.OK).json({ message: 'Join tracked successfully' });

  } catch (error) {
    console.error('Error tracking join:', error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
}