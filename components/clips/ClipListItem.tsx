// // components/ClipListItem.tsx

// import { useState } from 'react'
// import { Clip } from '@prisma/client'
// import ClipMenu from './ClipMenu'

// interface ClipListItemProps {
//   clip: Clip
//   onPlay: () => void
//   onUpdate: () => void
// }

// export default function ClipListItem({ clip, onPlay, onUpdate }: ClipListItemProps) {
//   const [imageError, setImageError] = useState(false)

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes'
//     const k = 1024
//     const sizes = ['Bytes', 'KB', 'MB', 'GB']
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
//   }

//   const formatDuration = (seconds: number) => {
//     if (!seconds) return '0:00'
//     const mins = Math.floor(seconds / 60)
//     const secs = Math.floor(seconds % 60)
//     return `${mins}:${secs.toString().padStart(2, '0')}`
//   }

//   const formatDate = (date: Date) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   return (
//     <li>
//       <div className=" py-1 sm:px-6 hover:bg-gray-50 hover:dark:bg-[#191919]" >
//         <div className="flex items-center justify-between">
//           <div className="flex items-center min-w-0 flex-1" onClick={onPlay}>
//             <div className="flex-shrink-0 mr-4">
//               <div className="flex items-center justify-center">
//                 <svg className="size-4text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                 </svg>
//               </div>
//             </div>

//             <div className="min-w-0 flex-1">
//               <div className="flex items-center">
//                 <button type="button" 
//                   onClick={onPlay}
//                   className="text-left flex-1 group"
//                 >
//                   <h3 className="text-md font-medium  truncate group-hover:text-blue-600">
//                     {clip.title}
//                   </h3>
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="ml-4 flex-shrink-0">
//             <ClipMenu clip={clip} onUpdate={onUpdate} />
//           </div>
//         </div>
//       </div>
//     </li>
//   )
// }

// components/ClipListItem.tsx

import { useState } from 'react'
import { Clip } from '@prisma/client'
import { TableRow, TableCell } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link2, Pencil, MoreHorizontal, Download, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import PenIcon from '../ui/pen-icon'

interface ClipListItemProps {
  clip: Clip & { user?: { name?: string; image?: string } | null }
  onPlay: () => void
  onUpdate: () => void
}

export default function ClipListItem({ clip, onPlay, onUpdate }: ClipListItemProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState(clip.title)

  const handleRename = async () => {
    try {
      const response = await fetch(`/api/clips/${clip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      })
      if (response.ok) {
        setIsRenaming(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to rename clip:', error)
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this clip?')) {
      try {
        const response = await fetch(`/api/clips/${clip.id}`, {
          method: 'DELETE',
        })
        if (response.ok) onUpdate()
      } catch (error) {
        console.error('Failed to delete clip:', error)
      }
    }
  }

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/clips/${clip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: true }),
      })
      if (response.ok) {
        const shareUrl = `${window.location.origin}/clipShare/${clip.shareToken}`
        await navigator.clipboard.writeText(shareUrl)
        alert('Share link copied to clipboard!')
      }
    } catch (error) {
      console.error('Failed to share clip:', error)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = clip.fileUrl
    link.download = clip.title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <TableRow
      className="group border-b border-neutral-800/50 hover:bg-neutral-900/40 transition-colors cursor-pointer"
      onClick={onPlay}
    >
      {/* Name Column */}
      <TableCell className="py-1 pl-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          {/* Red Video Icon */}
          <div className="flex-shrink-0">
            <svg
              className="size-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Title & Inline Hover Actions */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isRenaming ? (
              <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-7 text-sm bg-transparent border-neutral-700 focus-visible:ring-neutral-600"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename()
                    if (e.key === 'Escape') setIsRenaming(false)
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2 text-neutral-400 hover:text-neutral-200"
                  onClick={() => setIsRenaming(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs px-2 bg-neutral-800 hover:bg-neutral-700 text-white"
                  onClick={handleRename}
                >
                  Save
                </Button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onPlay}
                  className="text-left truncate text-sm font-medium text-neutral-200 group-hover:text-white transition-colors"
                >
                  {clip.title}
                </button>

                {/* Inline Hover Actions — appear only on row hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">

                  <button
                    title="Copy share link"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare()
                    }}
                    type="button"
                    className="p-1 rounded-sm dark:bg-[#111111] dark:hover:bg-[#222222] hover:bg-accent text-[#979797] border border-border dark:border-[#484848] hover:text-foreground transition-colors"
                  >
                    <Link2 className="w-3.5 h-3.5 -rotate-45" />
                  </button>

                  <button
                    type="button"
                    className="p-1 rounded dark:bg-[#111111] dark:hover:bg-[#222222] hover:bg-accent text-[#979797] border border-border dark:border-[#484848] hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsRenaming(true)
                    }}  >
                    <PenIcon className="w-3.5 h-3.5" />
                  </button>


                </div>
              </>
            )}
          </div>
        </div>
      </TableCell>

      {/* Date Created */}
      <TableCell className="py-1 text-sm text-neutral-500 text-right">
        {format(new Date(clip.createdAt), 'MMM d')}
      </TableCell>

      {/* Created By — Avatar Only */}
      <TableCell className="py-1 text-center w-[80px]">
        <Avatar className="size-6 mx-auto ring-2 ring-transparent group-hover:ring-neutral-700 transition-all">
          <AvatarImage src={clip.user?.image || ''} />
          <AvatarFallback className="text-[10px] bg-neutral-800 text-neutral-400">
            {clip.user?.name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
      </TableCell>

      {/* Actions Dropdown */}
      <TableCell className="py-1 pr-10 text-right w-[60px]" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 dark:bg-neutral-900 border-neutral-800"
          >
            <DropdownMenuItem
              onClick={() => setIsRenaming(true)}
              className="text-sm text-neutral-300 focus:text-white focus:bg-neutral-800"
            >
              <Pencil className="size-4 mr-2 text-neutral-500" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDownload}
              className="text-sm text-neutral-300 focus:text-white focus:bg-neutral-800"
            >
              <Download className="size-4 mr-2 text-neutral-500" /> Download
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-sm text-red-400 focus:text-red-300 focus:bg-red-950/30"
            >
              <Trash2 className="size-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}