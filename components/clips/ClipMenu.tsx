// // components/ClipMenu.tsx

// import { useState, useRef } from 'react'
// import { Clip } from '@prisma/client'

// interface ClipMenuProps {
//   clip: Clip
//   onUpdate: () => void
// }

// export default function ClipMenu({ clip, onUpdate }: ClipMenuProps) {
//   const [isOpen, setIsOpen] = useState(false)
//   const [isRenaming, setIsRenaming] = useState(false)
//   const [newTitle, setNewTitle] = useState(clip.title)
//   const menuRef = useRef<HTMLDivElement>(null)

//   const handleRename = async () => {
//     try {
//       const response = await fetch(`/api/clips/${clip.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ title: newTitle }),
//       })

//       if (response.ok) {
//         setIsRenaming(false)
//         setIsOpen(false)
//         onUpdate()
//       }
//     } catch (error) {
//       console.error('Failed to rename clip:', error)
//     }
//   }

//   const handleDelete = async () => {
//     if (confirm('Are you sure you want to delete this clip?')) {
//       try {
//         const response = await fetch(`/api/clips/${clip.id}`, {
//           method: 'DELETE',
//         })

//         if (response.ok) {
//           onUpdate()
//         }
//       } catch (error) {
//         console.error('Failed to delete clip:', error)
//       }
//     }
//     setIsOpen(false)
//   }

//   const handleShare = async () => {
//     try {
//       // First make the clip public
//       const response = await fetch(`/api/clips/${clip.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ isPublic: true }),
//       })

//       if (response.ok) {
//         const shareUrl = `${window.location.origin}/share/${clip.shareToken}`
//         await navigator.clipboard.writeText(shareUrl)
//         alert('Share link copied to clipboard!')
//       }
//     } catch (error) {
//       console.error('Failed to share clip:', error)
//     }
//     setIsOpen(false)
//   }

//   const handleDownload = () => {
//     const link = document.createElement('a')
//     link.href = clip.fileUrl
//     link.download = clip.title
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//     setIsOpen(false)
//   }

//   return (
//     <div className="relative" ref={menuRef}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="p-1 rounded hover:bg-gray-100"
//       >
//         <svg className="size-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
//         </svg>
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
//           {isRenaming ? (
//             <div className="p-2">
//               <input
//                 type="text"
//                 value={newTitle}
//                 onChange={(e) => setNewTitle(e.target.value)}
//                 className="w-full px-2 py-1 border rounded text-sm"
//                 autoFocus
//               />
//               <div className="flex justify-end gap-x-2 mt-2">
//                 <button
//                   onClick={() => setIsRenaming(false)}
//                   className="text-xs text-gray-600 hover:text-gray-800"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleRename}
//                   className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <>
//               <button
//                 onClick={() => setIsRenaming(true)}
//                 className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//               >
//                 Rename
//               </button>
//               <button
//                 onClick={handleDownload}
//                 className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//               >
//                 Download
//               </button>
//               <button
//                 onClick={handleShare}
//                 className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//               >
//                 Share
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//               >
//                 Delete
//               </button>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

'use client'

import React, { useState } from 'react'
import { Clip } from '@prisma/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimateIcon } from '../animate-ui/icons/icon'
import { Link2 } from '../animate-ui/icons/link-2'
import { Ellipsis } from '../animate-ui/icons/ellipsis'
import { Toast } from '../ui/toast'

interface ClipMenuProps {
  clip: Clip
  onUpdate: () => void
}

export default function ClipMenu({ clip, onUpdate }: ClipMenuProps) {
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
    <div className='flex w-fit justify-center px-1 py-0.5 h-8 rounded-md bg-[#ffffff] dark:bg-[#111111] items-center'>
      <Button variant="ghost" size="icon" className=" !px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]" onClick={handleShare}>
        <AnimateIcon animateOnHover>
          <Link2 className="-rotate-45 h-5 w-5 dark:text-[#8D8D8D]" />
        </AnimateIcon>

      </Button>
      <DropdownMenu>

        <AnimateIcon animateOnHover ><DropdownMenuTrigger className='' asChild>

          <Button
            variant="ghost"
            size="icon"
            className="!px-0 !py-2.5 h-5 w-6 rounded-sm hover:bg-[#F0F0F0] hover:dark:bg-[#222222]"
          >
            <Ellipsis className="h-5 w-5 dark:text-[#8D8D8D]" />
          </Button>

        </DropdownMenuTrigger></AnimateIcon>

        <DropdownMenuContent align="end" className="w-44 !z-50 absolute dark:bg-[#121212] dark:border-[#262626] right-0 top-0">

          {isRenaming ? (
            <div className="p-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-sm"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setIsRenaming(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={handleRename}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <DropdownMenuItem
                onClick={() => setIsRenaming(true)}
                className=""
              >
                Rename
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleDownload}>
                Download
              </DropdownMenuItem>

              <DropdownMenuSeparator className='dark:bg-[#262626]' />

              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
