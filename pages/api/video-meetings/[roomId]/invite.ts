// pages/api/video-meetings/[roomId]/invite.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email/sendEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { roomId } = req.query as { roomId: string };
  const { email } = req.body;

  if (!email?.trim()) return res.status(400).json({ error: 'Email required' });

  const meeting = await prisma.videoConference.findUnique({ where: { roomId } });
  if (!meeting) return res.status(404).json({ error: 'Not found' });

  const meetingUrl = `${process.env.NEXTAUTH_URL}/meeting/${roomId}`;
  const inviterName = session.user.name || 'Someone';

  // If you have an email service (e.g. Resend, SendGrid), send here.
  // Below is a stub — replace with your actual email provider:
  try {
    // Example using fetch to a hypothetical email endpoint:
    await sendEmail({
      to: email,
      subject: `${inviterName} invited you to a meeting`,
      html: `
        <p>${inviterName} has invited you to join a video meeting.</p>
        <p><a href="https://conferio-calls.vercel.app/meeting/${meetingUrl}">Join Meeting: ${meeting.title}</a></p>
        <p>Room ID: ${roomId}</p>
      `
    });
    console.log(`[invite] Would send invite to ${email} for meeting ${roomId}: ${meetingUrl}`);
  } catch (err) {
    console.error('[invite] Email send failed:', err);
    // Don't fail the request if email fails
  }

  return res.status(200).json({
    success: true,
    meetingUrl,
    message: `Invite sent to ${email}`,
  });
}