import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { gemini } from '@/lib/ai/providers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { subject, body } = req.body

  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' })
  }

  try {
    // Use the model from env, fallback to flash
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const genModel = gemini.getGenerativeModel({ model: modelName })
    
    const prompt = `Write a professional email body for the following subject line. Make it concise, natural, and appropriate for business communication.
        
Subject: ${subject}
${body?.trim() ? `\nUser has started writing: ${body.substring(0, 200)}... (incorporate or complete this thought)` : ''}

Requirements:
- Professional but friendly tone
- Concise (2-4 paragraphs max)
- Include appropriate greeting and sign-off
- Only return the email body text, no subject line`

    const result = await genModel.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    return res.status(200).json({ 
      content,
      provider: 'google',
      model: modelName
    })
  } catch (error: any) {
    console.error('[AI Generate Email Error]', error)
    return res.status(500).json({ error: error.message || 'Failed to generate email' })
  }
}