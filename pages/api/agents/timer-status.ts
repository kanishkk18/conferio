import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { timeTrackingTool } from '../../../lib/tools/time-tracking-tool';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const status = await timeTrackingTool.getStatus(session.user.id);
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get timer status' });
  }
}