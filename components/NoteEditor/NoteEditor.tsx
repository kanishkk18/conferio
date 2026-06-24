'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bold, Italic, Underline, Code, Link, Image, List, ListOrdered, Quote, Heading1, Heading2, Heading3, CheckSquare, Minus, Star, Archive, Trash2, Share2, X, Pin, Smile } from 'lucide-react'
import { toast } from 'sonner'
import debounce from 'lodash/debounce'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import EmojiPicker from 'emoji-picker-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalBody
} from '@/components/ui/animated-modal'
import { Ellipsis } from '../animate-ui/icons/ellipsis'

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

export default function NoteEditor({ note, onUpdate, onClose }: NoteEditorProps) {
  const editorRef = useRef<any>(null)
  const isInitialized = useRef(false)
  const [editor, setEditor] = useState<any>(null)
  const [title, setTitle] = useState(note.title)
  const [isReady, setIsReady] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isFavorite, setIsFavorite] = useState(note.isFavorite || false)
  const [isArchived, setIsArchived] = useState(note.isArchived || false)
  const [isPinned, setIsPinned] = useState(note.isPinned || false)
  const [shareUrl, setShareUrl] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)

  // Initialize Editor.js
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    const initEditor = async () => {
      if (typeof window === 'undefined') return

      const EditorJS = (await import('@editorjs/editorjs')).default
      const Header = (await import('@editorjs/header')).default
      const List = (await import('@editorjs/list')).default
      const Paragraph = (await import('@editorjs/paragraph')).default
      const Image = (await import('@editorjs/image')).default
      const Table = (await import('@editorjs/table')).default
      const Quote = (await import('@editorjs/quote')).default
      const Code = (await import('@editorjs/code')).default
      const Delimiter = (await import('@editorjs/delimiter')).default
      const Embed = (await import('@editorjs/embed')).default
      const Checklist = (await import('@editorjs/checklist')).default
      const Marker = (await import('@editorjs/marker')).default
      const InlineCode = (await import('@editorjs/inline-code')).default
      const Underline = (await import('@editorjs/underline')).default
      const LinkTool = (await import('@editorjs/link')).default

      const editorInstance = new EditorJS({
        holder: 'note-editor',
        placeholder: "Type '/' for commands, or start writing...",
        data: note.content || { blocks: [] },
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a header',
              levels: [1, 2, 3],
              defaultLevel: 1
            }
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote author',
            },
          },
          code: {
            class: Code,
            shortcut: 'CMD+SHIFT+C'
          },
          delimiter: Delimiter,
          table: {
            class: Table,
            inlineToolbar: true,
          },
          image: {
            class: Image,
            config: {
              endpoints: {
                byFile: '/api/uploads/image',
                byUrl: '/api/uploads/image-url',
              }
            }
          },
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                coub: true,
                codepen: true,
              }
            }
          },
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link-preview',
            }
          },
          marker: Marker,
          inlineCode: InlineCode,
          underline: Underline,
        },
        onChange: async () => {
          if (editorInstance) {
            const content = await editorInstance.save()
            debouncedSave(content)
          }
        },
        onReady: () => {
          setIsReady(true)
        },
      })

      editorRef.current = editorInstance
      setEditor(editorInstance)
    }

    initEditor()

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy()
        editorRef.current = null
      }
      isInitialized.current = false
    }
  }, [])

  const debouncedSave = useCallback(
    debounce((content: any) => {
      saveNote({ content })
    }, 1000),
    []
  )

  const debouncedTitleSave = useCallback(
    debounce((title: string) => {
      saveNote({ title })
    }, 500),
    []
  )

  const saveNote = async (updates: Partial<Note>) => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedNote = await response.json()
        onUpdate(updatedNote)
      }
    } catch (error) {
      toast.error('Failed to save changes')
    }
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    debouncedTitleSave(newTitle)
  }

  const handleEmojiSelect = (emojiData: any) => {
    saveNote({ emoji: emojiData.emoji })
    setShowEmojiPicker(false)
  }

  const handleFavorite = async () => {
    try {
      const method = isFavorite ? 'DELETE' : 'POST'
      const response = await fetch(`/api/notes/favorite?noteId=${note.id}`, { method })

      if (response.ok) {
        setIsFavorite(!isFavorite)
        onUpdate({ ...note, isFavorite: !isFavorite })
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites')
      }
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const handleArchive = async () => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !isArchived }),
      })

      if (response.ok) {
        setIsArchived(!isArchived)
        onUpdate({ ...note, isArchived: !isArchived })
        toast.success(isArchived ? 'Note restored' : 'Note archived')
        if (!isArchived && onClose) onClose() // Close if archiving
      }
    } catch (error) {
      toast.error('Failed to archive')
    }
  }

  const handlePin = async () => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned }),
      })

      if (response.ok) {
        setIsPinned(!isPinned)
        onUpdate({ ...note, isPinned: !isPinned })
        toast.success(isPinned ? 'Note unpinned' : 'Note pinned')
      }
    } catch (error) {
      toast.error('Failed to pin')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Note deleted')
        if (onClose) onClose()
      }
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/notes/share?noteId=${note.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        setShareUrl(data.shareUrl)
        setShowShareModal(true)
        navigator.clipboard.writeText(data.shareUrl)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      toast.error('Failed to create share link')
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          {/* {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
              <X className="h-4 w-4" />
            </Button>
          )} */}

          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="text-2xl h-10 w-10 p-0">
                {note.emoji || '📝'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <EmojiPicker onEmojiClick={handleEmojiSelect} />
            </PopoverContent>
          </Popover>

          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title"
            className="text-xl font-semibold border-none bg-transparent focus-visible:ring-0 px-0"
          />
        </div>

        <div className="flex items-center gap-1 pr-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePin}
            className={isPinned ? 'text-blue-500' : ''}
          >
            <Pin className={`h-4 w-4 ${isPinned ? 'fill-blue-500' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            className={isFavorite ? 'text-yellow-500' : ''}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Ellipsis/>
                 </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                {isArchived ? 'Restore' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Toolbar */}
      {/* <div className="border-b px-4 py-2 flex items-center gap-1 overflow-x-auto">
        <Button variant="ghost" size="sm" onClick={() => editor?.blocks.insert('header', { level: 1 })}>
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor?.blocks.insert('header', { level: 2 })}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="sm" onClick={() => editor?.blocks.insert('list', { style: 'unordered' })}>
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor?.blocks.insert('list', { style: 'ordered' })}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor?.blocks.insert('checklist')}>
          <CheckSquare className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="sm" onClick={() => editor?.blocks.insert('image')}>
          <Image className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor?.blocks.insert('code')}>
          <Code className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor?.blocks.insert('quote')}>
          <Quote className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor?.blocks.insert('delimiter')}>
          <Minus className="h-4 w-4" />
        </Button>
      </div> */}

      {/* Editor */}
      <div className="flex-1 overflow-y-auto scrollbar-thin2">
        <div className="max-w-3xl mx-auto py-4 px-5">
          <div id="note-editor" className="prose prose-lg max-w-none dark:prose-invert" />
        </div>
      </div>

      {/* Share Modal */}
      <Modal open={showShareModal} onOpenChange={setShowShareModal}>
        <ModalBody>
          <ModalContent className="sm:max-w-md">
            <ModalHeader>
              <ModalTitle>Share Note</ModalTitle>
              <ModalDescription>
                Anyone with this link can view your note
              </ModalDescription>
            </ModalHeader>
            <div className="flex items-center gap-2 mt-4">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={() => navigator.clipboard.writeText(shareUrl)}>
                Copy
              </Button>
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  )
}


// // components/notes/BlockSuiteNoteEditor.tsx
// // Drop-in replacement for the EditorJS NoteEditor.
// // Uses the Vite-built conferio-editor.js bundle from /public/editor/
// // Same props interface as your existing NoteEditor where possible.

// 'use client'

// import { useEffect, useRef, useState, useCallback } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import {
//   Star, Archive, Trash2, Share2, Pin,
//   Loader2, Moon, Sun
// } from 'lucide-react'
// import { toast } from 'sonner'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import EmojiPicker from 'emoji-picker-react'
// import { Ellipsis } from '../animate-ui/icons/ellipsis'
// import Head from 'next/head'

// // ─── Types ─────────────────────────────────────────────────────────────────

// interface Note {
//   id: string
//   title: string
//   content?: any       // stored as base64 Yjs snapshot in DB (string)
//   emoji?: string
//   isArchived?: boolean
//   isPinned?: boolean
//   isFavorite?: boolean
// }

// interface BlockSuiteNoteEditorProps {
//   note: Note
//   onUpdate: (note: Note) => void
//   onClose?: () => void
// }

// // ─── Script loader ──────────────────────────────────────────────────────────

// function loadEditorScript(): Promise<void> {
//   return new Promise((resolve, reject) => {
//     const existing = document.getElementById('conferio-editor-script')
//     if (existing) {
//       // Already loaded — wait for global to be ready
//       const wait = () => (window as any).ConferioEditor ? resolve() : setTimeout(wait, 50)
//       wait()
//       return
//     }

//     const script = document.createElement('script')
//     script.id = 'conferio-editor-script'
//     // After `pnpm build` in conferio-editor, copy dist/conferio-editor.js
//     // to your Next.js public/editor/conferio-editor.js
//     script.src = '/editor/conferio-editor.js'
//     script.onload = () => {
//       // Wait for the global to be set
//       const wait = () => (window as any).ConferioEditor ? resolve() : setTimeout(wait, 50)
//       wait()
//     }
//     script.onerror = () => reject(new Error('Failed to load editor script'))
//     document.head.appendChild(script)
//   })
// }

// // ─── Component ─────────────────────────────────────────────────────────────

// export default function BlockSuiteNoteEditor({
//   note,
//   onUpdate,
//   onClose,
// }: BlockSuiteNoteEditorProps) {
//   const containerRef = useRef<HTMLDivElement>(null)
//   const instanceRef = useRef<any>(null)   // EditorInstance from ConferioEditor
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [title, setTitle] = useState(note.title)
//   const [isFavorite, setIsFavorite] = useState(note.isFavorite || false)
//   const [isArchived, setIsArchived] = useState(note.isArchived || false)
//   const [isPinned, setIsPinned] = useState(note.isPinned || false)
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false)
//   const [isDark, setIsDark] = useState(
//     typeof document !== 'undefined' &&
//     document.documentElement.classList.contains('dark')
//   )

//   // ── Init editor ──────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!containerRef.current) return
//     let destroyed = false

//     async function init() {
//       try {
//         await loadEditorScript()
//         if (destroyed) return

//         const { initEditor } = (window as any).ConferioEditor

//         const instance = await initEditor({
//           container: containerRef.current!,
//           noteId: note.id,
//           mode: 'page',
//           theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',

//           // ── Load existing content ───────────────────────────────────────
//           onLoad: async () => {
//             try {
//               const res = await fetch(`/api/notes/${note.id}/snapshot`)
//               if (!res.ok) return null
//               const data = await res.json()
//               console.log('[NoteEditor] Loaded snapshot:', data.snapshot ? `${data.snapshot.length} chars` : 'null')
//               return data.snapshot ?? null
//             } catch (e) {
//               console.error('[NoteEditor] onLoad error:', e)
//               return null
//             }
//           },

//           // ── Save content ────────────────────────────────────────────────
//           onSave: async (snapshot: string) => {
//             try {
//               console.log('[NoteEditor] Saving snapshot:', snapshot.length, 'chars')
//               const res = await fetch(`/api/notes/${note.id}/snapshot`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ snapshot }),
//               })
//               if (!res.ok) console.error('[NoteEditor] Save failed:', res.status)
//             } catch (e) {
//               console.error('[NoteEditor] onSave error:', e)
//             }
//           },

//           // ── Image upload ────────────────────────────────────────────────
//           onImageUpload: async (file: File) => {
//             const form = new FormData()
//             form.append('file', file)
//             // Adjust to your Conferio upload API endpoint
//             const res = await fetch('/api/upload', {
//               method: 'POST',
//               body: form,
//             })
//             if (!res.ok) throw new Error('Upload failed')
//             const data = await res.json()
//             // Return the public URL of the uploaded image
//             return data.url as string
//           },
//         })

//         instanceRef.current = instance
//         setLoading(false)
//       } catch (e: any) {
//         if (!destroyed) {
//           setError(e.message)
//           setLoading(false)
//         }
//       }
//     }

//     init()

//     return () => {
//       destroyed = true
//       instanceRef.current?.destroy()
//       instanceRef.current = null
//     }
//   }, [note.id])

//   // ── Sync theme changes ────────────────────────────────────────────────────
//   useEffect(() => {
//     const observer = new MutationObserver(() => {
//       const dark = document.documentElement.classList.contains('dark')
//       setIsDark(dark)
//       instanceRef.current?.setTheme(dark ? 'dark' : 'light')
//     })
//     observer.observe(document.documentElement, {
//       attributes: true,
//       attributeFilter: ['class'],
//     })
//     return () => observer.disconnect()
//   }, [])

//   // ── Title save (debounced) ────────────────────────────────────────────────
//   const saveTitleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
//   const handleTitleChange = (newTitle: string) => {
//     setTitle(newTitle)
//     if (saveTitleTimer.current) clearTimeout(saveTitleTimer.current)
//     saveTitleTimer.current = setTimeout(() => {
//       saveNote({ title: newTitle })
//     }, 800)
//   }

//   // ── Note metadata save ────────────────────────────────────────────────────
//   const saveNote = async (updates: Partial<Note>) => {
//     try {
//       const res = await fetch(`/api/notes/${note.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updates),
//       })
//       if (res.ok) {
//         const updated = await res.json()
//         onUpdate(updated)
//       }
//     } catch {
//       toast.error('Failed to save')
//     }
//   }

//   const handleEmojiSelect = (emojiData: any) => {
//     saveNote({ emoji: emojiData.emoji })
//     onUpdate({ ...note, emoji: emojiData.emoji })
//     setShowEmojiPicker(false)
//   }

//   const handleFavorite = async () => {
//     try {
//       const method = isFavorite ? 'DELETE' : 'POST'
//       const res = await fetch(`/api/notes/favorite?noteId=${note.id}`, { method })
//       if (res.ok) {
//         setIsFavorite(!isFavorite)
//         onUpdate({ ...note, isFavorite: !isFavorite })
//         toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites')
//       }
//     } catch { toast.error('Failed') }
//   }

//   const handlePin = async () => {
//     try {
//       const res = await fetch(`/api/notes/${note.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ isPinned: !isPinned }),
//       })
//       if (res.ok) {
//         setIsPinned(!isPinned)
//         onUpdate({ ...note, isPinned: !isPinned })
//         toast.success(isPinned ? 'Unpinned' : 'Pinned')
//       }
//     } catch { toast.error('Failed') }
//   }

//   const handleArchive = async () => {
//     try {
//       const res = await fetch(`/api/notes/${note.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ isArchived: !isArchived }),
//       })
//       if (res.ok) {
//         setIsArchived(!isArchived)
//         onUpdate({ ...note, isArchived: !isArchived })
//         toast.success(isArchived ? 'Restored' : 'Archived')
//         if (!isArchived) onClose?.()
//       }
//     } catch { toast.error('Failed') }
//   }

//   const handleDelete = async () => {
//     if (!confirm('Delete this note?')) return
//     try {
//       const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' })
//       if (res.ok) {
//         toast.success('Deleted')
//         onClose?.()
//       }
//     } catch { toast.error('Failed') }
//   }

//   const handleShare = async () => {
//     try {
//       const res = await fetch(`/api/notes/share?noteId=${note.id}`, { method: 'POST' })
//       if (res.ok) {
//         const data = await res.json()
//         navigator.clipboard.writeText(data.shareUrl)
//         toast.success('Share link copied!')
//       }
//     } catch { toast.error('Failed') }
//   }

//   // ─── Render ───────────────────────────────────────────────────────────────

//   return (
//     <div className="h-full flex flex-col">
//       {/* Header — same as your original NoteEditor */}
//       <Head>
//         <link rel="stylesheet" href="/editor/editor.module.css" /> 
//       </Head>
//       <div className="border-b px-4 py-3 flex items-center justify-between">
//         <div className="flex items-center gap-2 flex-1">
//           <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
//             <PopoverTrigger asChild>
//               <Button variant="ghost" className="text-2xl h-10 w-10 p-0">
//                 {note.emoji || '📝'}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="start">
//               <EmojiPicker onEmojiClick={handleEmojiSelect} />
//             </PopoverContent>
//           </Popover>

//           <Input
//             value={title}
//             onChange={e => handleTitleChange(e.target.value)}
//             placeholder="Note title"
//             className="text-xl font-semibold border-none bg-transparent focus-visible:ring-0 px-0"
//           />
//         </div>

//         <div className="flex items-center gap-1 pr-4">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={handlePin}
//             className={isPinned ? 'text-blue-500' : ''}
//           >
//             <Pin className={`h-4 w-4 ${isPinned ? 'fill-blue-500' : ''}`} />
//           </Button>

//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={handleFavorite}
//             className={isFavorite ? 'text-yellow-500' : ''}
//           >
//             <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500' : ''}`} />
//           </Button>

//           <Button variant="ghost" size="icon" onClick={handleShare}>
//             <Share2 className="h-4 w-4" />
//           </Button>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="icon">
//                 <Ellipsis />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={handleArchive}>
//                 <Archive className="mr-2 h-4 w-4" />
//                 {isArchived ? 'Restore' : 'Archive'}
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={handleDelete} className="text-red-600">
//                 <Trash2 className="mr-2 h-4 w-4" />
//                 Delete
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Editor area */}
//       <div className="flex-1 overflow-hidden relative z-50">
//         {loading && (
//           <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
//             <Loader2 className="w-6 h-6 animate-spin text-primary" />
//           </div>
//         )}
//         {error && (
//           <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm">
//             Failed to load editor: {error}
//           </div>
//         )}
//         {/* BlockSuite mounts here */}
//         <div ref={containerRef} className="w-full h-full !z-[999]" />
//       </div>
//     </div>
//   )
// }