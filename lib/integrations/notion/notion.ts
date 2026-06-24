// lib/integrations/notion/notion.ts
const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

export interface NotionPage {
  id: string
  title: string
  url: string
  icon?: string
  cover?: string
  createdTime: string
  lastEditedTime: string
  parentType: 'workspace' | 'page' | 'database'
  parentId?: string
  properties: Record<string, unknown>
  archived: boolean
}

export interface NotionDatabase {
  id: string
  title: string
  url: string
  icon?: string
  createdTime: string
  lastEditedTime: string
  properties: Record<string, { type: string; name: string }>
}

export interface NotionBlock {
  id: string
  type: string
  content: string
  children?: NotionBlock[]
}

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }
}

function extractTitle(page: any): string {
  if (page.properties?.title?.title?.[0]?.plain_text) return page.properties.title.title[0].plain_text
  if (page.properties?.Name?.title?.[0]?.plain_text) return page.properties.Name.title[0].plain_text
  const titleProp = Object.values(page.properties ?? {}).find((p: any) => p.type === 'title') as any
  return titleProp?.title?.[0]?.plain_text ?? 'Untitled'
}

function extractIcon(page: any): string | undefined {
  if (page.icon?.type === 'emoji') return page.icon.emoji
  if (page.icon?.type === 'external') return page.icon.external?.url
  return undefined
}

function mapPage(raw: any): NotionPage {
  return {
    id: raw.id,
    title: extractTitle(raw),
    url: raw.url,
    icon: extractIcon(raw),
    cover: raw.cover?.external?.url ?? raw.cover?.file?.url,
    createdTime: raw.created_time,
    lastEditedTime: raw.last_edited_time,
    parentType: raw.parent?.type?.replace('_id', '') ?? 'workspace',
    parentId: raw.parent?.page_id ?? raw.parent?.database_id,
    properties: raw.properties ?? {},
    archived: raw.archived ?? false,
  }
}

export async function searchNotionPages(token: string, query = '', limit = 20): Promise<NotionPage[]> {
  const body: any = { page_size: limit, filter: { value: 'page', property: 'object' } }
  if (query) body.query = query

  const res = await fetch(`${NOTION_API}/search`, {
    method: 'POST',
    headers: notionHeaders(token),
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (data.status === 401) throw new Error('Notion not connected')
  return (data.results ?? []).filter((r: any) => r.object === 'page').map(mapPage)
}

export async function searchNotionDatabases(token: string, query = ''): Promise<NotionDatabase[]> {
  const body: any = { page_size: 20, filter: { value: 'database', property: 'object' } }
  if (query) body.query = query

  const res = await fetch(`${NOTION_API}/search`, {
    method: 'POST',
    headers: notionHeaders(token),
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return (data.results ?? []).filter((r: any) => r.object === 'database').map((db: any) => ({
    id: db.id,
    title: db.title?.[0]?.plain_text ?? 'Untitled',
    url: db.url,
    icon: extractIcon(db),
    createdTime: db.created_time,
    lastEditedTime: db.last_edited_time,
    properties: Object.fromEntries(
      Object.entries(db.properties ?? {}).map(([k, v]: [string, any]) => [k, { type: v.type, name: k }])
    ),
  }))
}

export async function getNotionPage(token: string, pageId: string): Promise<NotionPage> {
  const res = await fetch(`${NOTION_API}/pages/${pageId}`, { headers: notionHeaders(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Notion page fetch failed')
  return mapPage(data)
}

export async function getNotionPageBlocks(token: string, pageId: string): Promise<NotionBlock[]> {
  const res = await fetch(`${NOTION_API}/blocks/${pageId}/children?page_size=100`, {
    headers: notionHeaders(token),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Notion blocks fetch failed')
  return (data.results ?? []).map(blockToConferio)
}

function blockToConferio(block: any): NotionBlock {
  const type = block.type
  const content = block[type]

  let text = ''
  if (content?.rich_text) {
    text = content.rich_text.map((t: any) => t.plain_text).join('')
  } else if (content?.caption) {
    text = content.caption.map((t: any) => t.plain_text).join('')
  }

  return { id: block.id, type, content: text }
}

/**
 * Convert Notion blocks to Conferio page content (JSON compatible with your Page model).
 * Returns a TipTap/ProseMirror-compatible JSON structure.
 */
export function notionBlocksToPageContent(blocks: NotionBlock[]): object {
  const content = blocks.map((block) => {
    switch (block.type) {
      case 'heading_1':
        return { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: block.content }] }
      case 'heading_2':
        return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: block.content }] }
      case 'heading_3':
        return { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: block.content }] }
      case 'bulleted_list_item':
        return { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: block.content }] }] }] }
      case 'numbered_list_item':
        return { type: 'orderedList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: block.content }] }] }] }
      case 'code':
        return { type: 'codeBlock', content: [{ type: 'text', text: block.content }] }
      case 'quote':
        return { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: block.content }] }] }
      case 'divider':
        return { type: 'horizontalRule' }
      default:
        return block.content
          ? { type: 'paragraph', content: [{ type: 'text', text: block.content }] }
          : { type: 'paragraph' }
    }
  }).filter(Boolean)

  return { type: 'doc', content }
}
