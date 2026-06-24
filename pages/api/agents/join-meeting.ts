import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { meetingTool } from '../../../lib/tools/meeting-tool';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { meetingId } = req.body;
    
    const result = await meetingTool.joinMeetingNow(meetingId, session.user.id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Join meeting error:', error);
    res.status(500).json({ error: 'Failed to deploy meeting bot' });
  }
}