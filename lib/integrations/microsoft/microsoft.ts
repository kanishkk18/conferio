// lib/integrations/microsoft/microsoft.ts
const GRAPH_API = 'https://graph.microsoft.com/v1.0'

export interface OneDriveFile {
  id: string
  name: string
  size?: number
  mimeType: string
  webUrl: string
  downloadUrl?: string
  createdDateTime: string
  lastModifiedDateTime: string
  isFolder: boolean
  parentPath?: string
  formattedSize: string
  extension: string
  icon: string
}

export interface TeamsMessage {
  id: string
  content: string
  from: { displayName: string; email?: string; userId?: string }
  createdDateTime: string
  importance: string
  attachments: { id: string; name: string; contentUrl: string }[]
  reactions: { reactionType: string; count: number }[]
}

export interface TeamsChannel {
  id: string
  displayName: string
  description?: string
  webUrl: string
}

export interface TeamsTeam {
  id: string
  displayName: string
  description?: string
  webUrl?: string
}

function graphHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function formatSize(bytes?: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(1)} GB`
}

function getFileIcon(name: string, isFolder: boolean): string {
  if (isFolder) return '📁'
  const ext = name.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    pdf: '📑', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
    ppt: '📽️', pptx: '📽️', zip: '🗜️', png: '🖼️', jpg: '🖼️',
    jpeg: '🖼️', gif: '🖼️', mp4: '🎬', mp3: '🎵', txt: '📄',
  }
  return icons[ext ?? ''] ?? '📎'
}

function mapDriveFile(raw: any): OneDriveFile {
  const isFolder = !!raw.folder
  return {
    id: raw.id,
    name: raw.name,
    size: raw.size,
    mimeType: raw.file?.mimeType ?? (isFolder ? 'folder' : 'application/octet-stream'),
    webUrl: raw.webUrl,
    downloadUrl: raw['@microsoft.graph.downloadUrl'],
    createdDateTime: raw.createdDateTime,
    lastModifiedDateTime: raw.lastModifiedDateTime,
    isFolder,
    parentPath: raw.parentReference?.path,
    formattedSize: formatSize(raw.size),
    extension: raw.name.split('.').pop()?.toLowerCase() ?? '',
    icon: getFileIcon(raw.name, isFolder),
  }
}

// ── OneDrive ──────────────────────────────────────────────────────────────

export async function listOneDriveFiles(
  token: string,
  folderId?: string,
  options: { search?: string; pageToken?: string } = {}
): Promise<{ files: OneDriveFile[]; nextLink?: string }> {
  let url: string

  if (options.search) {
    url = `${GRAPH_API}/me/drive/root/search(q='${encodeURIComponent(options.search)}')?$top=30&$select=id,name,size,file,folder,webUrl,createdDateTime,lastModifiedDateTime,parentReference`
  } else {
    const base = folderId && folderId !== 'root'
      ? `${GRAPH_API}/me/drive/items/${folderId}/children`
      : `${GRAPH_API}/me/drive/root/children`
    url = `${base}?$top=30&$select=id,name,size,file,folder,webUrl,createdDateTime,lastModifiedDateTime,parentReference&$orderby=name`
    if (options.pageToken) url += `&$skiptoken=${options.pageToken}`
  }

  const res = await fetch(url, { headers: graphHeaders(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'OneDrive list failed')

  return {
    files: (data.value ?? []).map(mapDriveFile),
    nextLink: data['@odata.nextLink'],
  }
}

export async function getOneDriveFileShareLink(
  token: string,
  fileId: string,
  type: 'view' | 'edit' = 'view'
): Promise<string> {
  const res = await fetch(`${GRAPH_API}/me/drive/items/${fileId}/createLink`, {
    method: 'POST',
    headers: graphHeaders(token),
    body: JSON.stringify({ type, scope: 'anonymous' }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'OneDrive share failed')
  return data.link?.webUrl ?? ''
}

export async function downloadOneDriveFile(
  token: string,
  fileId: string
): Promise<{ buffer: Buffer; mimeType: string; name: string }> {
  // First get metadata
  const metaRes = await fetch(`${GRAPH_API}/me/drive/items/${fileId}?$select=name,file,size`, {
    headers: graphHeaders(token),
  })
  const meta = await metaRes.json()

  // Download content
  const contentRes = await fetch(`${GRAPH_API}/me/drive/items/${fileId}/content`, {
    headers: graphHeaders(token),
  })
  if (!contentRes.ok) throw new Error('OneDrive download failed')
  const buffer = Buffer.from(await contentRes.arrayBuffer())
  return { buffer, mimeType: meta.file?.mimeType ?? 'application/octet-stream', name: meta.name }
}

// ── Teams ─────────────────────────────────────────────────────────────────

export async function listTeams(token: string): Promise<TeamsTeam[]> {
  const res = await fetch(`${GRAPH_API}/me/joinedTeams`, { headers: graphHeaders(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Teams list failed')
  return (data.value ?? []).map((t: any) => ({
    id: t.id,
    displayName: t.displayName,
    description: t.description,
    webUrl: t.webUrl,
  }))
}

export async function listTeamsChannels(token: string, teamId: string): Promise<TeamsChannel[]> {
  const res = await fetch(`${GRAPH_API}/teams/${teamId}/channels`, { headers: graphHeaders(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Teams channels fetch failed')
  return (data.value ?? []).map((c: any) => ({
    id: c.id,
    displayName: c.displayName,
    description: c.description,
    webUrl: c.webUrl,
  }))
}

export async function getTeamsChannelMessages(
  token: string,
  teamId: string,
  channelId: string,
  limit = 20
): Promise<TeamsMessage[]> {
  const res = await fetch(
    `${GRAPH_API}/teams/${teamId}/channels/${channelId}/messages?$top=${limit}`,
    { headers: graphHeaders(token) }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Teams messages fetch failed')
  return (data.value ?? []).map((m: any) => ({
    id: m.id,
    content: m.body?.content?.replace(/<[^>]+>/g, '') ?? '',
    from: {
      displayName: m.from?.user?.displayName ?? 'Unknown',
      email: m.from?.user?.userIdentityType === 'aadUser' ? undefined : undefined,
      userId: m.from?.user?.id,
    },
    createdDateTime: m.createdDateTime,
    importance: m.importance,
    attachments: (m.attachments ?? []).map((a: any) => ({
      id: a.id, name: a.name, contentUrl: a.contentUrl,
    })),
    reactions: (m.reactions ?? []).reduce((acc: any[], r: any) => {
      const existing = acc.find((x) => x.reactionType === r.reactionType)
      if (existing) existing.count++
      else acc.push({ reactionType: r.reactionType, count: 1 })
      return acc
    }, []),
  }))
}

export async function sendTeamsMessage(
  token: string,
  teamId: string,
  channelId: string,
  content: string
): Promise<void> {
  await fetch(`${GRAPH_API}/teams/${teamId}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: graphHeaders(token),
    body: JSON.stringify({ body: { contentType: 'html', content } }),
  })
}
