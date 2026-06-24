// types/search.ts

export type SearchCategory =
  | 'all'
  | 'tasks'
  | 'boards'
  | 'pages'
  | 'files'
  | 'meetings'
  | 'members'
  | 'channels'
  | 'reminders'
  | 'time-entries'

export type SearchResultType =
  | 'task'
  | 'board'
  | 'page'
  | 'file'
  | 'meeting'
  | 'member'
  | 'channel'
  | 'reminder'
  | 'time-entry'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle?: string       // e.g. board name for tasks, workspace for pages
  description?: string    // snippet / preview text
  url: string             // navigate to this on click
  icon?: string           // emoji or icon name
  meta?: Record<string, string | number | boolean | null>
  // Extra context fields
  status?: string
  priority?: string
  dueDate?: string
  memberName?: string
  memberEmail?: string
  memberAvatar?: string
  boardTitle?: string
  columnTitle?: string
  workspaceName?: string
  teamName?: string
  fileSize?: string
  mimeType?: string
  startTime?: string
  createdAt?: string
  updatedAt?: string
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  category: SearchCategory
  took: number // ms
}

export interface RecentSearch {
  query: string
  timestamp: number
}

export interface SearchFilters {
  category: SearchCategory
  query: string
}