import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { meetingTool } from '../../../lib/tools/meeting-tool';
import { aiRouter } from '../../../lib/ai/router';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { command, ...directInput } = req.body;

    if (command) {
      const extraction = await aiRouter.route({
        intent: 'extract_meeting_details',
        prompt: `Extract meeting details from: "${command}"

Return JSON with:
- title (string, required)
- participants (array of strings, required - names or emails)
- dateTime (string, required - natural language or ISO)
- duration (number, optional, default: 30)
- description (string, optional)
- platform (enum: "google_meet", "zoom", "teams", default: "google_meet")
- deployBot (boolean, default: true)`,
        userId: session.user.id,
        requireJson: true,
      });

      const result = await meetingTool.scheduleMeeting({
        ...extraction.json,
        userId: session.user.id,
      });

      return res.status(200).json(result);
    }

    const result = await meetingTool.scheduleMeeting({
      ...directInput,
      userId: session.user.id,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Schedule meeting error:', error);
    res.status(500).json({ error: 'Failed to schedule meeting' });
  }
}