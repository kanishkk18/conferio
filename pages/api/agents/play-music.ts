import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { musicTool } from '../../../lib/tools/music-tool';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { query, action = 'play', volume } = req.body;

    let result;
    switch (action) {
      case 'play':
        result = await musicTool.playMusic(query);
        break;
      case 'pause':
        result = await musicTool.pauseMusic();
        break;
      case 'resume':
        result = await musicTool.resumeMusic();
        break;
      case 'next':
        result = await musicTool.nextSong();
        break;
      case 'previous':
        result = await musicTool.previousSong();
        break;
      case 'volume':
        result = await musicTool.setVolume(volume);
        break;
      default:
        result = await musicTool.playMusic(query);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Music control error:', error);
    res.status(500).json({ error: 'Failed to control music' });
  }
}