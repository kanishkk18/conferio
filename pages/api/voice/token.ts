// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth';
// import { authOptions } from 'lib/auth';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'gpt-4o-realtime-preview-2024-10-01',
//         voice: 'alloy',
//       }),
//     });

//     const data = await response.json();
//     res.status(200).json(data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create session' });
//   }
// }

// pages/api/voice/token.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-10-01',
        voice: 'alloy',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    const data = await response.json();
    
    // Return the client_secret properly structured
    res.status(200).json({
      client_secret: {
        value: data.client_secret?.value || data.client_secret,
      },
    });
  } catch (error) {
    console.error('Voice token error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
}