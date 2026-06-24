// lib/integrations/google/drive.ts
/**
 * Google Drive API wrapper.
 * All functions accept an accessToken — get it via getValidGoogleToken(userId).
 */

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: number
  modifiedTime: string
  createdTime: string
  webViewLink?: string
  webContentLink?: string
  iconLink?: string
  thumbnailLink?: string
  parents?: string[]
  owners?: { displayName: string; emailAddress: string; photoLink?: string }[]
  shared: boolean
  starred: boolean
  // Derived
  extension: string
  category: 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'video' | 'audio' | 'folder' | 'other'
  formattedSize: string
}

export interface DriveListResponse {
  files: DriveFile[]
  nextPageToken?: string
}

export interface DriveFolder {
  id: string
  name: string
  parents?: string[]
}

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'

// ── Helpers ───────────────────────────────────────────────────────────────

function getCategory(mimeType: string): DriveFile['category'] {
  if (mimeType === 'application/vnd.google-apps.folder') return 'folder'
  if (mimeType.includes('google-apps.document') || mimeType.includes('wordprocessingml')) return 'document'
  if (mimeType.includes('google-apps.spreadsheet') || mimeType.includes('spreadsheetml')) return 'spreadsheet'
  if (mimeType.includes('google-apps.presentation') || mimeType.includes('presentationml')) return 'presentation'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'other'
}

function getExtension(name: string, mimeType: string): string {
  const dotIdx = name.lastIndexOf('.')
  if (dotIdx !== -1) return name.slice(dotIdx + 1).toLowerCase()
  if (mimeType.includes('google-apps.document')) return 'gdoc'
  if (mimeType.includes('google-apps.spreadsheet')) return 'gsheet'
  if (mimeType.includes('google-apps.presentation')) return 'gslides'
  if (mimeType.includes('google-apps.folder')) return 'folder'
  return ''
}

function formatSize(bytes?: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}

function mapFile(raw: any): DriveFile {
  return {
    id: raw.id,
    name: raw.name,
    mimeType: raw.mimeType,
    size: raw.size ? parseInt(raw.size) : undefined,
    modifiedTime: raw.modifiedTime,
    createdTime: raw.createdTime,
    webViewLink: raw.webViewLink,
    webContentLink: raw.webContentLink,
    iconLink: raw.iconLink,
    thumbnailLink: raw.thumbnailLink,
    parents: raw.parents,
    owners: raw.owners,
    shared: raw.shared ?? false,
    starred: raw.starred ?? false,
    extension: getExtension(raw.name, raw.mimeType),
    category: getCategory(raw.mimeType),
    formattedSize: formatSize(raw.size ? parseInt(raw.size) : undefined),
  }
}

const FILE_FIELDS = 'id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,iconLink,thumbnailLink,parents,owners,shared,starred'

// ── API functions ─────────────────────────────────────────────────────────

/**
 * List files in a folder (default: root).
 */
export async function listDriveFiles(
  accessToken: string,
  options: {
    folderId?: string
    pageToken?: string
    pageSize?: number
    orderBy?: string
    mimeTypeFilter?: string
  } = {}
): Promise<DriveListResponse> {
  const {
    folderId = 'root',
    pageToken,
    pageSize = 30,
    orderBy = 'modifiedTime desc',
    mimeTypeFilter,
  } = options

  let q = `'${folderId}' in parents and trashed = false`
  if (mimeTypeFilter) q += ` and mimeType = '${mimeTypeFilter}'`

  const params = new URLSearchParams({
    q,
    pageSize: String(pageSize),
    orderBy,
    fields: `nextPageToken,files(${FILE_FIELDS})`,
    ...(pageToken ? { pageToken } : {}),
  })

  const res = await fetch(`${DRIVE_API}/files?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message ?? 'Drive list failed')
  }

  const data = await res.json()
  return {
    files: (data.files ?? []).map(mapFile),
    nextPageToken: data.nextPageToken,
  }
}

/**
 * Search files by name or content.
 */
export async function searchDriveFiles(
  accessToken: string,
  query: string,
  pageSize = 20
): Promise<DriveFile[]> {
  const q = `fullText contains '${query.replace(/'/g, "\\'")}' and trashed = false`

  const params = new URLSearchParams({
    q,
    pageSize: String(pageSize),
    orderBy: 'modifiedTime desc',
    fields: `files(${FILE_FIELDS})`,
  })

  const res = await fetch(`${DRIVE_API}/files?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) throw new Error('Drive search failed')
  const data = await res.json()
  return (data.files ?? []).map(mapFile)
}

/**
 * Get a single file's metadata.
 */
export async function getDriveFile(
  accessToken: string,
  fileId: string
): Promise<DriveFile> {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?fields=${FILE_FIELDS}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Drive file fetch failed')
  return mapFile(await res.json())
}

/**
 * Download a file's binary content.
 * For Google Docs/Sheets/Slides, exports to a compatible format.
 */
export async function downloadDriveFile(
  accessToken: string,
  fileId: string,
  mimeType: string
): Promise<{ buffer: Buffer; exportedMimeType: string }> {
  let url: string
  let exportedMimeType = mimeType

  // Google Workspace files need export
  const EXPORT_MAP: Record<string, string> = {
    'application/vnd.google-apps.document':     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.google-apps.spreadsheet':  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.google-apps.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  }

  if (EXPORT_MAP[mimeType]) {
    exportedMimeType = EXPORT_MAP[mimeType]
    url = `${DRIVE_API}/files/${fileId}/export?mimeType=${encodeURIComponent(exportedMimeType)}`
  } else {
    url = `${DRIVE_API}/files/${fileId}?alt=media`
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) throw new Error('Drive download failed')
  const buffer = Buffer.from(await res.arrayBuffer())
  return { buffer, exportedMimeType }
}

/**
 * Make a file shareable (anyone with link can view).
 */
export async function shareDriveFile(
  accessToken: string,
  fileId: string,
  role: 'reader' | 'writer' | 'commenter' = 'reader'
): Promise<string> {
  // Create a "anyone" permission
  await fetch(`${DRIVE_API}/files/${fileId}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role, type: 'anyone' }),
  })

  // Get the updated file with webViewLink
  const file = await getDriveFile(accessToken, fileId)
  return file.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`
}

/**
 * Get recent files (starred or recently modified).
 */
export async function getRecentDriveFiles(
  accessToken: string,
  limit = 10
): Promise<DriveFile[]> {
  const params = new URLSearchParams({
    q: 'trashed = false',
    pageSize: String(limit),
    orderBy: 'modifiedTime desc',
    fields: `files(${FILE_FIELDS})`,
  })

  const res = await fetch(`${DRIVE_API}/files?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) throw new Error('Drive recent files failed')
  const data = await res.json()
  return (data.files ?? []).map(mapFile)
}

/**
 * List folder breadcrumb (parent chain).
 */
export async function getDriveBreadcrumb(
  accessToken: string,
  folderId: string
): Promise<{ id: string; name: string }[]> {
  const crumbs: { id: string; name: string }[] = []
  let currentId = folderId

  while (currentId && currentId !== 'root') {
    const res = await fetch(
      `${DRIVE_API}/files/${currentId}?fields=id,name,parents`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!res.ok) break
    const data = await res.json()
    crumbs.unshift({ id: data.id, name: data.name })
    currentId = data.parents?.[0]
    if (!currentId) break
  }

  crumbs.unshift({ id: 'root', name: 'My Drive' })
  return crumbs
}
