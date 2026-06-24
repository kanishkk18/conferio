import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { reminderTool } from '../../../lib/tools/reminder-tool';
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
        intent: 'extract_reminder',
        prompt: `Extract reminder details from: "${command}"

Return JSON with:
- title (string, required)
- time (string, required - natural language like "in 1 hour", "tomorrow at 2pm")
- description (string, optional)
- priority (enum: "LOW", "MEDIUM", "HIGH", default: "MEDIUM")`,
        userId: session.user.id,
        requireJson: true,
      });

      const result = await reminderTool.createReminder({
        ...extraction.json,
        userId: session.user.id,
      });

      return res.status(200).json(result);
    }

    const result = await reminderTool.createReminder({
      ...directInput,
      userId: session.user.id,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
}