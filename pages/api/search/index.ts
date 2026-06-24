// pages/api/search/index.ts
/**
 * GET /api/search?q=...&category=all&limit=20
 *
 * Universal search across:
 *  - Tasks (title, description) → board + column context
 *  - Boards (title, description)
 *  - Pages / Docs (title, content text)
 *  - Files (originalName, description)
 *  - Meetings (guestName, guestEmail, additionalInfo)
 *  - Team Members (name, email)
 *  - Channels (name)
 *  - Reminders (title, description)
 *  - Time Entries (description, task title)
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { SearchCategory, SearchResponse, SearchResult } from 'types/search'
import { getToken } from '@/lib/integrations/token-manager'
import { searchSlackMessages } from '@/lib/integrations/slack/slack'
import { searchNotionPages } from '@/lib/integrations/notion/notion'
import { searchJiraIssues } from '@/lib/integrations/jira/jira'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50
const CATEGORY_LIMIT = 5 // per-category results when searching 'all'

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function excerpt(text: string | null | undefined, max = 80): string {
  if (!text) return ''
  const cleaned = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return cleaned.length > max ? cleaned.slice(0, max) + '…' : cleaned
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id
  const query = ((req.query.q as string) ?? '').trim()
  const category = ((req.query.category as string) ?? 'all') as SearchCategory
  const limit = Math.min(parseInt((req.query.limit as string) ?? String(DEFAULT_LIMIT)), MAX_LIMIT)

  if (!query || query.length < 1) {
    return res.status(200).json({ results: [], total: 0, query, category, took: 0 })
  }

  const start = Date.now()
  const results: SearchResult[] = []

  // Get user's team memberships for scoping
  const teamMemberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true, team: { select: { name: true } } },
  })
  const teamIds = teamMemberships.map((m) => m.teamId)

  // Get user's board access
  const boardAccess = await prisma.board.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    select: { id: true },
  })
  const boardIds = boardAccess.map((b) => b.id)

  // Get user's workspaces
  const workspaceMemberships = await prisma.workspaceMembership.findMany({
    where: { userId },
    select: { workspaceId: true, workspace: { select: { name: true } } },
  })
  const workspaceIds = workspaceMemberships.map((m) => m.workspaceId)

  const perLimit = category === 'all' ? CATEGORY_LIMIT : limit
  const contains = { contains: query, mode: 'insensitive' as const }

  // ── TASKS ────────────────────────────────────────────────────────────────
  if (category === 'all' || category === 'tasks') {
    const tasks = await prisma.task.findMany({
      where: {
        boardId: { in: boardIds },
        isArchived: false,
        OR: [
          { title: contains },
          { description: contains },
        ],
      },
      include: {
        column: { include: { board: true } },
        assignees: { include: { user: { select: { name: true, image: true } } }, take: 3 },
      },
      take: perLimit,
      orderBy: { updatedAt: 'desc' },
    })

    for (const task of tasks) {
      results.push({
        id: task.id,
        type: 'task',
        title: task.title,
        subtitle: `${task.column.board.title} › ${task.column.title}`,
        description: excerpt(task.description),
        url: `/boards/${task.boardId}?task=${task.id}`,
        icon: '📋',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate?.toISOString(),
        boardTitle: task.column.board.title,
        columnTitle: task.column.title,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })
    }
  }

  // ── BOARDS ───────────────────────────────────────────────────────────────
  if (category === 'all' || category === 'boards') {
    const boards = await prisma.board.findMany({
      where: {
        id: { in: boardIds },
        isArchived: false,
        OR: [
          { title: contains },
          { description: contains },
        ],
      },
      include: {
        _count: { select: { members: true, columns: true } },
      },
      take: perLimit,
      orderBy: { updatedAt: 'desc' },
    })

    for (const board of boards) {
      results.push({
        id: board.id,
        type: 'board',
        title: board.title,
        subtitle: `${board._count.members} members · ${board._count.columns} columns`,
        description: excerpt(board.description),
        url: `/boards/${board.id}`,
        icon: '🗂️',
        createdAt: board.createdAt.toISOString(),
        updatedAt: board.updatedAt.toISOString(),
      })
    }
  }

  // ── PAGES / DOCS ─────────────────────────────────────────────────────────
  if (category === 'all' || category === 'pages') {
    const pages = await prisma.page.findMany({
      where: {
        workspaceId: { in: workspaceIds },
        OR: [
          { title: contains },
          // Search JSON content as text cast — works with PostgreSQL
        ],
      },
      include: {
        workspace: { select: { name: true } },
        author: { select: { name: true } },
      },
      take: perLimit,
      orderBy: { updatedAt: 'desc' },
    })

    for (const page of pages) {
      results.push({
        id: page.id,
        type: 'page',
        title: page.title,
        subtitle: page.workspace.name,
        description: `by ${page.author.name}`,
        url: `/docs/${page.workspaceId}/pages/${page.id}`,
        icon: page.emoji ?? '📄',
        workspaceName: page.workspace.name,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      })
    }
  }

  // ── FILES ─────────────────────────────────────────────────────────────────
  if (category === 'all' || category === 'files') {
    const files = await prisma.file.findMany({
      where: {
        OR: [
          { userId },
          { teamId: { in: teamIds } },
          { assignedTo: { some: { userId } } },
        ],
        originalName: contains,
      },
      include: {
        user: { select: { name: true } },
        team: { select: { name: true } },
        folder: { select: { name: true } },
      },
      take: perLimit,
      orderBy: { createdAt: 'desc' },
    })

    for (const file of files) {
      const ext = file.ext.toLowerCase()
      const icon =
        file.mimeType.startsWith('image/') ? '🖼️' :
        file.mimeType.startsWith('video/') ? '🎬' :
        file.mimeType.startsWith('audio/') ? '🎵' :
        ext === 'pdf' ? '📑' :
        ['doc', 'docx'].includes(ext) ? '📝' :
        ['xls', 'xlsx'].includes(ext) ? '📊' :
        ['zip', 'rar'].includes(ext) ? '🗜️' : '📎'

      results.push({
        id: file.id,
        type: 'file',
        title: file.originalName,
        subtitle: file.folder ? `📁 ${file.folder.name}` : (file.team?.name ?? 'Personal'),
        description: `${formatFileSize(file.size)} · Uploaded by ${file.user.name}`,
        url: `/files/${file.id}`,
        icon,
        teamName: file.team?.name,
        fileSize: formatFileSize(file.size),
        mimeType: file.mimeType,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      })
    }
  }

  // ── MEETINGS ─────────────────────────────────────────────────────────────
  if (category === 'all' || category === 'meetings') {
    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { userId },
          { meetingAttendees: { some: { userId } } },
        ],
        OR: [
          { guestName: contains },
          { guestEmail: contains },
          { additionalInfo: contains },
        ],
      } as any,
      include: {
        event: { select: { title: true } },
        _count: { select: { meetingAttendees: true } },
      },
      take: perLimit,
      orderBy: { startTime: 'desc' },
    })

    for (const meeting of meetings) {
      const isPast = new Date(meeting.startTime) < new Date()
      results.push({
        id: meeting.id,
        type: 'meeting',
        title: meeting.event.title || `Meeting with ${meeting.guestName}`,
        subtitle: `with ${meeting.guestName}`,
        description: excerpt(meeting.additionalInfo) ||
          `${meeting._count.meetingAttendees} attendee(s)`,
        url: `/meetings/${meeting.id}`,
        icon: isPast ? '📅' : '🗓️',
        status: meeting.status,
        startTime: meeting.startTime.toISOString(),
        createdAt: meeting.createdAt.toISOString(),
        updatedAt: meeting.updatedAt.toISOString(),
      })
    }
  }

  // ── TEAM MEMBERS ─────────────────────────────────────────────────────────
  if (category === 'all' || category === 'members') {
    const members = await prisma.user.findMany({
      where: {
        teamMembers: { some: { teamId: { in: teamIds } } },
        OR: [
          { name: contains },
          { email: contains },
          { username: contains },
        ],
      },
      take: perLimit,
      orderBy: { name: 'asc' },
    })

    for (const member of members) {
      results.push({
        id: member.id,
        type: 'member',
        title: member.name,
        subtitle: member.email,
        description: member.username ? `@${member.username}` : undefined,
        url: `/team/members/${member.id}`,
        icon: '👤',
        memberName: member.name,
        memberEmail: member.email,
        memberAvatar: member.image ?? member.imageUrl ?? undefined,
        createdAt: member.createdAt.toISOString(),
        updatedAt: member.updatedAt.toISOString(),
      })
    }
  }

  // ── CHANNELS ─────────────────────────────────────────────────────────────
  if (category === 'all' || category === 'channels') {
    // Find channels in servers where the user is a member
    const userServers = await prisma.member.findMany({
      where: { userId },
      select: { serverId: true },
    })
    const serverIds = userServers.map((s) => s.serverId)

    const channels = await prisma.channel.findMany({
      where: {
        serverId: { in: serverIds },
        name: contains,
      },
      include: {
        server: { select: { name: true } },
      },
      take: perLimit,
      orderBy: { name: 'asc' },
    })

    for (const channel of channels) {
      const typeIcon =
        channel.type === 'AUDIO' ? '🔊' :
        channel.type === 'VIDEO' ? '📹' : '#️⃣'

      results.push({
        id: channel.id,
        type: 'channel',
        title: channel.name,
        subtitle: channel.server.name,
        url: `/servers/${channel.serverId}/channels/${channel.id}`,
        icon: typeIcon,
        createdAt: channel.createdAt.toISOString(),
        updatedAt: channel.updatedAt.toISOString(),
      })
    }
  }

  // ── REMINDERS ────────────────────────────────────────────────────────────
  if (category === 'all' || category === 'reminders') {
    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        OR: [
          { title: contains },
          { description: contains },
        ],
      },
      take: perLimit,
      orderBy: { dueDate: 'asc' },
    })

    for (const reminder of reminders) {
      const isPast = new Date(reminder.dueDate) < new Date()
      results.push({
        id: reminder.id,
        type: 'reminder',
        title: reminder.title,
        subtitle: reminder.status,
        description: excerpt(reminder.description),
        url: reminder.taskId
          ? `/tasks/${reminder.taskId}`
          : reminder.meetingId
          ? `/meetings/${reminder.meetingId}`
          : `/reminders`,
        icon: isPast ? '⏰' : '🔔',
        status: reminder.status,
        dueDate: reminder.dueDate.toISOString(),
        createdAt: reminder.createdAt.toISOString(),
        updatedAt: reminder.updatedAt.toISOString(),
      })
    }
  }

  // ── TIME ENTRIES ─────────────────────────────────────────────────────────
  if (category === 'all' || category === 'time-entries') {
    const entries = await prisma.timeEntry.findMany({
      where: {
        userId,
        OR: [
          { description: contains },
          { task: { title: contains } },
        ],
      },
      include: {
        task: { select: { title: true } },
        team: { select: { name: true } },
      },
      take: perLimit,
      orderBy: { startTime: 'desc' },
    })

    for (const entry of entries) {
      const hours = Math.floor(entry.duration / 60)
      const mins = entry.duration % 60
      const durationStr = `${hours}h ${mins}m`

      results.push({
        id: entry.id,
        type: 'time-entry',
        title: entry.description ?? entry.task?.title ?? 'Time Entry',
        subtitle: entry.team.name,
        description: `${durationStr} · ${entry.billableStatus}`,
        url: `/time-tracking?entry=${entry.id}`,
        icon: '⏱️',
        status: entry.billableStatus,
        teamName: entry.team.name,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })
    }
  }

//   if (category === 'all' || category === 'slack') {
//   const slackToken = await getToken(userId, 'slack')
//   if (slackToken) {
//     const slackMessages = await searchSlackMessages(slackToken.accessToken, query, 5)
//     for (const msg of slackMessages) {
//       results.push({
//         id: msg.ts,
//         type: 'slack-message' as any,
//         title: msg.text.slice(0, 80),
//         subtitle: `Slack · ${msg.userName}`,
//         url: '#slack',
//         icon: '💬',
//         createdAt: new Date(parseFloat(msg.ts) * 1000).toISOString(),
//       })
//     }
//   }
// }

if (category === 'all' || category === 'notion') {
  const notionToken = await getToken(userId, 'notion')
  if (notionToken) {
    const notionPages = await searchNotionPages(notionToken.accessToken, query, 5)
    for (const page of notionPages) {
      results.push({
        id: page.id,
        type: 'notion-page' as any,
        title: page.title,
        subtitle: 'Notion',
        url: page.url,
        icon: page.icon ?? '📄',
        createdAt: page.createdTime,
      })
    }
  }
}

  const took = Date.now() - start

  return res.status(200).json({
    results,
    total: results.length,
    query,
    category,
    took,
  })
}