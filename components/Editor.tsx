'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import EditorJS to avoid SSR issues
const EditorJS = dynamic(() => import('./Editor/EditorJS'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-x-4 mb-4">
          <Skeleton className="size-8 rounded" />
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto gap-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
})

interface Page {
  id: string
  title: string
  content?: any
  emoji?: string
  coverImage?: string
  isPublished?: boolean
  publishedUrl?: string
}

interface EditorProps {
  page: Page
  onUpdate: (updates: Partial<Page>) => void
  workspaceId: string
}

export default function Editor(props: EditorProps) {
  return <EditorJS {...props} />
}
