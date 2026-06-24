import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { DEFAULT_TEST_USER, isTestMode } from 'lib/test-user'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session = await getServerSession(req, res, authOptions)
  
  if (isTestMode && !session) {
    session = { user: DEFAULT_TEST_USER }
  }

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const { url } = req.query

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: 0, message: 'URL is required' })
      }

      // In a real implementation, you would fetch the URL and extract metadata
      // For now, return mock data
      const mockData = {
        success: 1,
        link: url,
        meta: {
          title: 'Sample Link Title',
          description: 'This is a sample description for the linked content.',
          image: {
            url: 'https://via.placeholder.com/400x200?text=Link+Preview'
          }
        }
      }

      return res.json(mockData)
    } catch (error) {
      console.error('Link preview error:', error)
      res.status(500).json({ success: 0, message: 'Failed to fetch link preview' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}