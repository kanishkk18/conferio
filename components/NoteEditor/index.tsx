import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const NoteEditorJS = dynamic(() => import('./NoteEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-x-4 mb-4">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto gap-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
})

interface Note {
  id: string
  title: string
  content?: any
  emoji?: string
  isArchived?: boolean
  isPinned?: boolean
  isFavorite?: boolean
}

interface NoteEditorProps {
  note: Note
  onUpdate: (note: Note) => void
  onClose?: () => void
}

export default function NoteEditor(props: NoteEditorProps) {
  return <NoteEditorJS {...props} />
}
