import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { taskTool } from '../../../lib/tools/task-tool';
import { aiRouter } from '../../../lib/ai/router';
import { contextManager } from '../../../lib/context/manager';

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
        intent: 'extract_tasks',
        prompt: `Extract task details from: "${command}"
        
Return JSON with:
- title (string, required)
- description (string, optional)
- priority (enum: "LOW", "MEDIUM", "HIGH", "URGENT", default: "MEDIUM")
- dueDate (string, optional - natural language like "tomorrow", "next week")
- assignee (string, optional - name or email)
- boardName (string, optional)
- columnName (string, optional, default: "To Do")`,
        userId: session.user.id,
        requireJson: true,
        context: await contextManager.getRecentContext(session.user.id),
      });

      const result = await taskTool.createTask({
        ...extraction.json,
        userId: session.user.id,
      });

      return res.status(200).json(result);
    }

    const result = await taskTool.createTask({
      ...directInput,
      userId: session.user.id,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      error: 'Failed to create task',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}