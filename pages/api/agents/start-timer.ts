import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { timeTrackingTool } from '../../../lib/tools/time-tracking-tool';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { taskId, description } = req.body;
    
    const result = await timeTrackingTool.startTimer(
      session.user.id,
      taskId,
      description
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to start timer'
    });
  }
}