// lib/integrations/storage/storage-providers.ts
/**
 * Box + Dropbox API wrappers
 */

export interface StorageFile {
  id: string
  name: string
  size?: number
  mimeType: string
  path: string
  modified: string
  created: string
  isFolder: boolean
  shareUrl?: string
  downloadUrl?: string
  icon: string
  formattedSize: string
  provider: 'box' | 'dropbox'
}

function formatSize(bytes?: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function getIcon(name: string, isFolder: boolean): string {
  if (isFolder) return '📁'
  const ext = name.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    pdf: '📑', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
    ppt: '📽️', pptx: '📽️', zip: '🗜️', png: '🖼️', jpg: '🖼️',
    gif: '🖼️', mp4: '🎬', mp3: '🎵',
  }
  return icons[ext ?? ''] ?? '📎'
}

// ── BOX ───────────────────────────────────────────────────────────────────

const BOX_API = 'https://api.box.com/2.0'

export async function listBoxFiles(
  token: string,
  folderId = '0',
  options: { search?: string } = {}
): Promise<{ files: StorageFile[]; nextToken?: string }> {
  let url: string

  if (options.search) {
    url = `${BOX_API}/search?query=${encodeURIComponent(options.search)}&limit=30`
  } else {
    url = `${BOX_API}/folders/${folderId}/items?limit=30&fields=id,name,size,type,content_modified_at,content_created_at,parent,shared_link`
  }

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Box list failed')

  const items = data.entries ?? data.items ?? []
  return {
    files: items.map((item: any) => ({
      id: item.id,
      name: item.name,
      size: item.size,
      mimeType: item.type === 'folder' ? 'folder' : 'application/octet-stream',
      path: item.parent?.name ?? '/',
      modified: item.content_modified_at ?? item.modified_at ?? '',
      created: item.content_created_at ?? item.created_at ?? '',
      isFolder: item.type === 'folder',
      shareUrl: item.shared_link?.url,
      icon: getIcon(item.name, item.type === 'folder'),
      formattedSize: formatSize(item.size),
      provider: 'box' as const,
    })),
    nextToken: data.next_marker,
  }
}

export async function shareBoxFile(token: string, fileId: string): Promise<string> {
  const res = await fetch(`${BOX_API}/files/${fileId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ shared_link: { access: 'open', permissions: { can_view: true } } }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Box share failed')
  return data.shared_link?.url ?? ''
}

export async function downloadBoxFile(token: string, fileId: string): Promise<Buffer> {
  const res = await fetch(`${BOX_API}/files/${fileId}/content`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Box download failed')
  return Buffer.from(await res.arrayBuffer())
}

// ── DROPBOX ───────────────────────────────────────────────────────────────

const DROPBOX_API = 'https://api.dropboxapi.com/2'
const DROPBOX_CONTENT_API = 'https://content.dropboxapi.com/2'

export async function listDropboxFiles(
  token: string,
  path = '',
  options: { search?: string; cursor?: string } = {}
): Promise<{ files: StorageFile[]; hasMore: boolean; cursor?: string }> {
  let url: string
  let body: object

  if (options.search) {
    url = `${DROPBOX_API}/files/search_v2`
    body = { query: options.search, options: { max_results: 30 } }
  } else if (options.cursor) {
    url = `${DROPBOX_API}/files/list_folder/continue`
    body = { cursor: options.cursor }
  } else {
    url = `${DROPBOX_API}/files/list_folder`
    body = { path: path || '', limit: 30, include_media_info: false }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_summary ?? 'Dropbox list failed')

  const entries = options.search ? (data.matches ?? []).map((m: any) => m.metadata?.metadata) : (data.entries ?? [])

  return {
    files: entries.filter(Boolean).map((item: any) => ({
      id: item.id ?? item.path_lower,
      name: item.name,
      size: item.size,
      mimeType: item['.tag'] === 'folder' ? 'folder' : 'application/octet-stream',
      path: item.path_display ?? item.path_lower ?? '/',
      modified: item.server_modified ?? item.client_modified ?? '',
      created: item.client_modified ?? '',
      isFolder: item['.tag'] === 'folder',
      icon: getIcon(item.name, item['.tag'] === 'folder'),
      formattedSize: formatSize(item.size),
      provider: 'dropbox' as const,
    })),
    hasMore: data.has_more,
    cursor: data.cursor,
  }
}

export async function shareDropboxFile(token: string, path: string): Promise<string> {
  const res = await fetch(`${DROPBOX_API}/sharing/create_shared_link_with_settings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, settings: { requested_visibility: 'public' } }),
  })
  const data = await res.json()
  // If link already exists, get it
  if (data.error_summary?.startsWith('shared_link_already_exists')) {
    const listRes = await fetch(`${DROPBOX_API}/sharing/list_shared_links`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    })
    const listData = await listRes.json()
    return listData.links?.[0]?.url?.replace('dl=0', 'dl=1') ?? ''
  }
  if (!res.ok) throw new Error(data.error_summary ?? 'Dropbox share failed')
  return data.url?.replace('dl=0', 'dl=1') ?? ''
}

export async function downloadDropboxFile(token: string, path: string): Promise<{ buffer: Buffer; name: string }> {
  const res = await fetch(`${DROPBOX_CONTENT_API}/files/download`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Dropbox-API-Arg': JSON.stringify({ path }),
    },
  })
  if (!res.ok) throw new Error('Dropbox download failed')
  const metadata = JSON.parse(res.headers.get('dropbox-api-result') ?? '{}')
  return { buffer: Buffer.from(await res.arrayBuffer()), name: metadata.name ?? 'file' }
}
