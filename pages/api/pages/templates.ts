import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from 'lib/auth'

// Pre-built template content
const TEMPLATES = {
  'meeting-notes': {
    title: 'Meeting Notes',
    emoji: '📝',
    content: {
      blocks: [
        {
          type: 'header',
          data: { text: 'Meeting Notes', level: 1 },
        },
        {
          type: 'paragraph',
          data: { text: '<b>Date:</b> [Insert Date]<br><b>Attendees:</b> [Insert Names]<br><b>Meeting Type:</b> [Weekly/Monthly/Ad-hoc]' },
        },
        {
          type: 'header',
          data: { text: 'Agenda', level: 2 },
        },
        {
          type: 'list',
          data: {
            style: 'unordered',
            items: ['Agenda item 1', 'Agenda item 2', 'Agenda item 3'],
          },
        },
        {
          type: 'header',
          data: { text: 'Discussion Points', level: 2 },
        },
        {
          type: 'paragraph',
          data: { text: '[Record key discussion points here]' },
        },
        {
          type: 'header',
          data: { text: 'Action Items', level: 2 },
        },
        {
          type: 'checklist',
          data: {
            items: [
              { text: 'Action item 1 - Owner: [Name] - Due: [Date]', checked: false },
              { text: 'Action item 2 - Owner: [Name] - Due: [Date]', checked: false },
            ],
          },
        },
        {
          type: 'header',
          data: { text: 'Next Meeting', level: 2 },
        },
        {
          type: 'paragraph',
          data: { text: '[Date, time, and location of next meeting]' },
        },
      ],
    },
  },
  'wiki': {
    title: 'Wiki Page',
    emoji: '📚',
    content: {
      blocks: [
        {
          type: 'header',
          data: { text: 'Page Title', level: 1 },
        },
        {
          type: 'paragraph',
          data: { text: 'Brief description or summary of this wiki page.' },
        },
        {
          type: 'header',
          data: { text: 'Overview', level: 2 },
        },
        {
          type: 'paragraph',
          data: { text: '[Provide an overview of the topic]' },
        },
        {
          type: 'header',
          data: { text: 'Details', level: 2 },
        },
        {
          type: 'paragraph',
          data: { text: '[Add detailed information here]' },
        },
        {
          type: 'header',
          data: { text: 'Related Links', level: 2 },
        },
        {
          type: 'list',
          data: {
            style: 'unordered',
            items: ['Related resource 1', 'Related resource 2', 'Related resource 3'],
          },
        },
        {
          type: 'header',
          data: { text: 'Last Updated', level: 2 },
        },
        {
          type: 'paragraph',
          data: { text: '[Date] by [Author]' },
        },
      ],
    },
  },
  'project-overview': {
    title: 'Project Overview',
    emoji: '🚀',
    content: {
      blocks: [
        {
          type: 'header',
          data: { text: 'Project Overview', level: 1 },
        },
        {
          type: 'paragraph',
          data: { text: '<b>Project Name:</b> [Insert Name]<br><b>Status:</b> [Planning/In Progress/Completed]<br><b>Timeline:</b> [Start Date] - [End Date]' },
        },
        {
          type: 'header',
          data: { text: 'Project Goals', level: 2 },
        },
        {
          type: 'list',
          data: {
            style: 'unordered',
            items: ['Goal 1', 'Goal 2', 'Goal 3'],
          },
        },
        {
          type: 'header',
          data: { text: 'Team Members', level: 2 },
        },
        {
          type: 'table',
          data: {
            content: [
              ['Name', 'Role', 'Responsibilities'],
              ['[Name 1]', '[Role]', '[Responsibilities]'],
              ['[Name 2]', '[Role]', '[Responsibilities]'],
            ],
          },
        },
        {
          type: 'header',
          data: { text: 'Milestones', level: 2 },
        },
        {
          type: 'list',
          data: {
            style: 'ordered',
            items: ['Milestone 1 - [Date]', 'Milestone 2 - [Date]', 'Milestone 3 - [Date]'],
          },
        },
        {
          type: 'header',
          data: { text: 'Resources', level: 2 },
        },
        {
          type: 'list',
          data: {
            style: 'unordered',
            items: ['Resource 1', 'Resource 2', 'Resource 3'],
          },
        },
      ],
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    // Return list of available templates
    const templates = Object.entries(TEMPLATES).map(([key, template]) => ({
      id: key,
      title: template.title,
      emoji: template.emoji,
      category: key,
    }))

    res.json(templates)
  }

  else if (req.method === 'POST') {
    const { templateId, workspaceId } = req.body

    if (!TEMPLATES[templateId as keyof typeof TEMPLATES]) {
      return res.status(400).json({ error: 'Invalid template' })
    }

    const template = TEMPLATES[templateId as keyof typeof TEMPLATES]

    try {
      const page = await prisma.page.create({
        data: {
          title: template.title,
          content: template.content,
          emoji: template.emoji,
          workspaceId,
          authorId: session.user.id,
          templateCategory: templateId,
        },
      })

      res.json(page)
    } catch (error) {
      console.error('Error creating from template:', error)
      res.status(500).json({ error: 'Failed to create page from template' })
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}