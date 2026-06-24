// components/ClipList.tsx

import { useState } from 'react'
import { Clip } from '@prisma/client'
import ClipListItem from './ClipListItem'
import VideoModal from './VideoModal'
import { Video } from 'lucide-react'
import ClipButton from './clipButton'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from '@/components/ui/table'


interface ClipListProps {
  clips: Clip[]
  onClipUpdate: () => void
}

export default function ClipList({ clips, onClipUpdate }: ClipListProps) {
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)

  if (clips.length === 0) {
    return (
      <div className="text-center h-screen justify-center flex items-center flex-col -ml-10 w-screen z-50 relative">
        <div className="flex flex-col items-center justify-center py-24 text-center !z-50">
          <div className=" size-14  rounded-2xl bg-zinc-900 flex items-center justify-center mb-4">
            <Video className='size-8 text-zinc-600' />
          </div>
          <p className="text-zinc-400 font-medium mb-1">No clips yet</p>
          <p className="text-zinc-600 text-sm mb-4">Create your first clip and share it with your team</p>
          <ClipButton initialClips={clips} />

        </div>
        <div className="absolute inset-0 -z-50 h-full w-full items-center [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      </div>
    )
  }

  return (
    <>
      {/* <div className=" shadow overflow-hidden sm:rounded-md w-full">
        <ul className="divide-y divide-gray-200">
          {clips.map((clip) => (
            <ClipListItem
              key={clip.id}
              clip={clip}
              onPlay={() => setSelectedClip(clip)}
              onUpdate={onClipUpdate}
            />
          ))}
        </ul>
      </div> */}
      <Table className='!pt-3'>
  <TableHeader>
    <TableRow className="border-none hover:bg-transparent">
      <TableHead className="h-8 py-2 pl-10 text-xs font-medium text-neutral-500">Name</TableHead>
      <TableHead className="h-8 py-2 text-xs font-medium text-neutral-500 text-right">Date created</TableHead>
      <TableHead className="h-8 py-2 text-xs font-medium text-neutral-500 text-center w-[80px]">Created by</TableHead>
      <TableHead className="h-8 py-2 pr-10 text-xs font-medium text-neutral-500 text-right w-[60px]"></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {clips.map((clip) => (
      <ClipListItem 
        key={clip.id} 
        clip={clip} 
        onPlay={() => setSelectedClip(clip)} 
        onUpdate={onClipUpdate} 
      />
    ))}
  </TableBody>
</Table>

      <VideoModal
        clip={selectedClip}
        isOpen={!!selectedClip}
        onClose={() => setSelectedClip(null)}
      />
    </>
  )
}