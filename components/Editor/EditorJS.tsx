// 'use client'

// import { useEffect, useRef, useState, useCallback } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Bold, Italic, Underline, Code, Link, Image, Table, List, ListOrdered, Quote, Heading1, Heading2, Heading3, SquareCheck as CheckSquare, Minus, Video, FileText, TriangleAlert as AlertTriangle, Palette, Share, Globe, Users, Eye, Settings, Save, MoveHorizontal as MoreHorizontal } from 'lucide-react'
// import { toast } from 'sonner'
// import debounce from 'lodash/debounce'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { Label } from '@/components/ui/label'
// import { Switch } from '@/components/ui/switch'
// import EmojiPicker from 'emoji-picker-react'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import InviteModal from '@/components/InviteModal'

// interface Page {
//   id: string
//   title: string
//   content?: any
//   emoji?: string
//   coverImage?: string
//   isPublished?: boolean
//   publishedUrl?: string
// }

// interface EditorJSProps {
//   page: Page
//   onUpdate: (updates: Partial<Page>) => void
//   workspaceId: string
// }

// export default function EditorJS({ page, onUpdate, workspaceId }: EditorJSProps) {
//   const editorRef = useRef<any>(null)
//   const [editor, setEditor] = useState<any>(null)
//   const [title, setTitle] = useState(page.title)
//   const [isReady, setIsReady] = useState(false)
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false)
//   const [showShareDialog, setShowShareDialog] = useState(false)
//   const [showPublishDialog, setShowPublishDialog] = useState(false)
//   const [isPublished, setIsPublished] = useState(page.isPublished || false)
//   const [members, setMembers] = useState<any[]>([])
//   const [showInviteModal, setShowInviteModal] = useState(false)
//   const [showSlashMenu, setShowSlashMenu] = useState(false)
//   const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 })

//   // Initialize Editor.js
//   useEffect(() => {
//     const initEditor = async () => {
//       if (typeof window === 'undefined') return

//       const EditorJS = (await import('@editorjs/editorjs')).default
//       const Header = (await import('@editorjs/header')).default
//       const List = (await import('@editorjs/list')).default
//       const Paragraph = (await import('@editorjs/paragraph')).default
//       const Image = (await import('@editorjs/image')).default
//       const Table = (await import('@editorjs/table')).default
//       const Quote = (await import('@editorjs/quote')).default
//       const Code = (await import('@editorjs/code')).default
//       const Delimiter = (await import('@editorjs/delimiter')).default
//       const Embed = (await import('@editorjs/embed')).default
//       const Checklist = (await import('@editorjs/checklist')).default
//       const Marker = (await import('@editorjs/marker')).default
//       const InlineCode = (await import('@editorjs/inline-code')).default
//       const Underline = (await import('@editorjs/underline')).default
//       const LinkTool = (await import('@editorjs/link')).default
//       const Raw = (await import('@editorjs/raw')).default
//       const SimpleImage = (await import('@editorjs/simple-image')).default
//       const AttachesTool = (await import('@editorjs/attaches')).default
//       const Warning = (await import('@editorjs/warning')).default
//       const NestedList = (await import('@editorjs/nested-list')).default

//       const editorInstance = new EditorJS({
//         holder: 'editorjs',
//         placeholder: "Type '/' for commands, or start writing...",
//         data: page.content || { blocks: [] },
//         tools: {
//           header: {
//             class: Header,
//             config: {
//               placeholder: 'Enter a header',
//               levels: [1, 2, 3, 4, 5, 6],
//               defaultLevel: 1
//             }
//           },
//           paragraph: {
//             class: Paragraph,
//             inlineToolbar: true,
//           },
//           list: {
//             class: List,
//             inlineToolbar: true,
//             config: {
//               defaultStyle: 'unordered'
//             }
//           },
//           nestedlist: NestedList,
//           checklist: {
//             class: Checklist,
//             inlineToolbar: true,
//           },
//           quote: {
//             class: Quote,
//             inlineToolbar: true,
//             shortcut: 'CMD+SHIFT+O',
//             config: {
//               quotePlaceholder: 'Enter a quote',
//               captionPlaceholder: 'Quote\'s author',
//             },
//           },
//           code: {
//             class: Code,
//             shortcut: 'CMD+SHIFT+C'
//           },
//           delimiter: Delimiter,
//           table: {
//             class: Table,
//             inlineToolbar: true,
//             config: {
//               rows: 2,
//               cols: 3,
//             },
//           },
//           image: {
//             class: Image,
//             config: {
//               endpoints: {
//                 byFile: '/api/uploads/image',
//                 byUrl: '/api/uploads/image-url',
//               }
//             }
//           },
//           simpleImage: SimpleImage,
//           embed: {
//             class: Embed,
//             config: {
//               services: {
//                 youtube: true,
//                 coub: true,
//                 codepen: {
//                   regex: /https?:\/\/codepen\.io\/([^\/\?\&]*)\/pen\/([^\/\?\&]*)/,
//                   embedUrl: 'https://codepen.io/<%= remote_id %>?height=300&theme-id=0&default-tab=css,result&embed-version=2',
//                   html: "<iframe height='300' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>",
//                   height: 300,
//                   width: 600,
//                   id: (groups: string[]) => groups.join('/embed/')
//                 }
//               }
//             }
//           },
//           linkTool: {
//             class: LinkTool,
//             config: {
//               endpoint: '/api/link-preview',
//             }
//           },
//           marker: {
//             class: Marker,
//             shortcut: 'CMD+SHIFT+M',
//           },
//           inlineCode: {
//             class: InlineCode,
//             shortcut: 'CMD+SHIFT+C',
//           },
//           underline: Underline,
//           raw: Raw,
//           attaches: {
//             class: AttachesTool,
//             config: {
//               endpoint: '/api/uploads/file'
//             }
//           },
//           warning: {
//             class: Warning,
//             inlineToolbar: true,
//             shortcut: 'CMD+SHIFT+W',
//             config: {
//               titlePlaceholder: 'Title',
//               messagePlaceholder: 'Message',
//             },
//           },
//         },
//         onChange: async () => {
//           if (editorInstance) {
//             const content = await editorInstance.save()
//             debouncedSave(content)
//           }
//         },
//         onReady: () => {
//           setIsReady(true)
//           console.log('Editor.js is ready to work!')
//         },
//       })

//       setEditor(editorInstance)
//     }

//     initEditor()

//     return () => {
//       if (editorRef.current && editorRef.current.destroy) {
//         editorRef.current.destroy()
//         editorRef.current = null
//       }
//       // Reset initialization flag on cleanup

//     }
//   }, [])

//   const fetchMembers = async () => {
//     try {
//       const response = await fetch(`/api/workspaces/${workspaceId}/invite`)
//       if (response.ok) {
//         const data = await response.json()
//         setMembers(data)
//       }
//     } catch (error) {
//       console.error('Failed to fetch members')
//     }
//   }

//   useEffect(() => {
//     if (workspaceId) {
//       fetchMembers()
//     }
//   }, [workspaceId])

//   const debouncedSave = useCallback(
//     debounce((content: any) => {
//       onUpdate({ content })
//     }, 1000),
//     [onUpdate]
//   )

//   const debouncedTitleSave = useCallback(
//     debounce((title: string) => {
//       onUpdate({ title })
//     }, 500),
//     [onUpdate]
//   )

//   const handleTitleChange = (newTitle: string) => {
//     setTitle(newTitle)
//     debouncedTitleSave(newTitle)
//   }

//   const handleEmojiSelect = (emojiData: any) => {
//     onUpdate({ emoji: emojiData.emoji })
//     setShowEmojiPicker(false)
//   }

//   const handlePublish = async () => {
//     try {
//       const publishedUrl = isPublished ? null : `${window.location.origin}/public/${page.id}`

//       const response = await fetch(`/api/pages/${page.id}/publish`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           isPublished: !isPublished,
//           publishedUrl: publishedUrl
//         }),
//       })

//       if (response.ok) {
//         const data = await response.json()
//         setIsPublished(data.isPublished)
//         onUpdate({ isPublished: data.isPublished, publishedUrl: data.publishedUrl })
//         toast.success(data.isPublished ? 'Page published!' : 'Page unpublished!')
//       }
//     } catch (error) {
//       toast.error('Failed to update publish status')
//     }
//     setShowPublishDialog(false)
//   }

//   const handleShare = async () => {
//     try {
//       const response = await fetch(`/api/pages/${page.id}/share`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ type: 'VIEW' }),
//       })

//       if (response.ok) {
//         const data = await response.json()
//         navigator.clipboard.writeText(data.shareUrl)
//         toast.success('Share link copied to clipboard!')
//       }
//     } catch (error) {
//       toast.error('Failed to create share link')
//     }
//     setShowShareDialog(false)
//   }

//   const insertBlock = async (blockType: string) => {
//     if (!editor) return

//     try {
//       const blockIndex = editor.blocks.getCurrentBlockIndex()

//       switch (blockType) {
//         case 'header1':
//           await editor.blocks.insert('header', { text: '', level: 1 }, {}, blockIndex + 1)
//           break
//         case 'header2':
//           await editor.blocks.insert('header', { text: '', level: 2 }, {}, blockIndex + 1)
//           break
//         case 'header3':
//           await editor.blocks.insert('header', { text: '', level: 3 }, {}, blockIndex + 1)
//           break
//         case 'list':
//           await editor.blocks.insert('list', { style: 'unordered', items: [''] }, {}, blockIndex + 1)
//           break
//         case 'orderedList':
//           await editor.blocks.insert('list', { style: 'ordered', items: [''] }, {}, blockIndex + 1)
//           break
//         case 'checklist':
//           await editor.blocks.insert('checklist', { items: [{ text: '', checked: false }] }, {}, blockIndex + 1)
//           break
//         case 'quote':
//           await editor.blocks.insert('quote', { text: '', caption: '' }, {}, blockIndex + 1)
//           break
//         case 'code':
//           await editor.blocks.insert('code', { code: '' }, {}, blockIndex + 1)
//           break
//         case 'table':
//           await editor.blocks.insert('table', { content: [['', ''], ['', '']] }, {}, blockIndex + 1)
//           break
//         case 'delimiter':
//           await editor.blocks.insert('delimiter', {}, {}, blockIndex + 1)
//           break
//         case 'image':
//           await editor.blocks.insert('image', {}, {}, blockIndex + 1)
//           break
//         case 'embed':
//           await editor.blocks.insert('embed', {}, {}, blockIndex + 1)
//           break
//         case 'warning':
//           await editor.blocks.insert('warning', { title: '', message: '' }, {}, blockIndex + 1)
//           break
//       }

//       setShowSlashMenu(false)
//     } catch (error) {
//       console.error('Error inserting block:', error)
//     }
//   }

//   const slashCommands = [
//     { icon: Heading1, label: 'Heading 1', command: 'header1' },
//     { icon: Heading2, label: 'Heading 2', command: 'header2' },
//     { icon: Heading3, label: 'Heading 3', command: 'header3' },
//     { icon: List, label: 'Bullet List', command: 'list' },
//     { icon: ListOrdered, label: 'Numbered List', command: 'orderedList' },
//     { icon: CheckSquare, label: 'To-do List', command: 'checklist' },
//     { icon: Quote, label: 'Quote', command: 'quote' },
//     { icon: Code, label: 'Code', command: 'code' },
//     { icon: Table, label: 'Table', command: 'table' },
//     { icon: Image, label: 'Image', command: 'image' },
//     { icon: Video, label: 'Embed', command: 'embed' },
//     { icon: Minus, label: 'Divider', command: 'delimiter' },
//     { icon: AlertTriangle, label: 'Callout', command: 'warning' },
//   ]

//   return (
//     <div className="h-full flex flex-col" aria-label="Button">
//       {/* Header */}
//       <div className="sticky top-0  border-b border-gray-200 p-4 z-10" aria-label="Button">
//         <div className="flex items-center justify-between mb-4" aria-label="Button">
//           <div className="flex items-center gap-x-2" aria-label="Button">
//             <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
//               <PopoverTrigger asChild>
//                 <Button variant="ghost" size="sm" className="text-2xl p-1 h-auto">
//                   {page.emoji || '📄'}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0" align="start">
//                 <EmojiPicker onEmojiClick={handleEmojiSelect} />
//               </PopoverContent>
//             </Popover>

//             <Input
//               value={title}
//               onChange={(e) => handleTitleChange(e.target.value)}
//               placeholder="Untitled"
//               className="text-3xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
//             />
//           </div>

//           <div className="flex items-center gap-x-2" aria-label="Button">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setShowShareDialog(true)}
//             >
//               <Share className="size-4 mr-2" />
//               Share
//             </Button>

//             <Button
//               variant={isPublished ? "default" : "outline"}
//               size="sm"
//               onClick={() => setShowPublishDialog(true)}
//             >
//               <Globe className="size-4 mr-2" />
//               {isPublished ? 'Published' : 'Publish'}
//             </Button>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="sm">
//                   <MoreHorizontal className="size-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
//                   <Users className="mr-2 size-4" />
//                   Share & Invite
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => setShowInviteModal(true)}>
//                   <Users className="mr-2 size-4" />
//                   Manage members
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => setShowPublishDialog(true)}>
//                   <Globe className="mr-2 size-4" />
//                   Publish settings
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>
//                   <Eye className="mr-2 size-4" />
//                   Page analytics
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <Settings className="mr-2 size-4" />
//                   Page settings
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>

//         {/* Collaborators */}
//         {members.length > 0 && (
//           <div className="flex items-center gap-x-2 mb-2" aria-label="Button">
//             <span className="text-sm text-gray-500" aria-label="Button">Members:</span>
//             <div className="flex -gap-x-2" aria-label="Button">
//               {members.slice(0, 5).map((member, index) => (
//                 <img
//                   key={index}
//                   src={member.user?.image || `https://ui-avatars.com/api/?name=${member.user?.name}&background=random`}
//                   alt={member.user?.name}
//                   className="size-6 rounded-full border-2 border-white"
//                 />
//               ))}
//               {members.length > 5 && (
//                 <div className="size-6 rounded-full border-2 border-white flex items-center justify-center text-xs" aria-label="Button">
//                   +{members.length - 5}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Editor */}
//       <div className="flex-1 overflow-auto" aria-label="Button">
//         <div className="max-w-4xl mx-auto py-8 px-6" aria-label="Button">
//           <div 
//             id="editorjs" 
//             className="prose prose-lg max-w-none"
//             style={{ minHeight: '500px' }}
//           / aria-label="Button">
//         </div>
//       </div>

//       {/* Slash Command Menu */}
//       {showSlashMenu && (
//         <div 
//           className="fixed  border border-gray-200 rounded-lg shadow-lg p-2 z-50 max-h-80 overflow-y-auto"
//           style={{ 
//             left: slashMenuPosition.x, 
//             top: slashMenuPosition.y,
//             width: '280px'
//           }}
//          aria-label="Button">
//           <div className="text-xs text-gray-500 mb-2 px-2" aria-label="Button">BASIC BLOCKS</div>
//           {slashCommands.map((command) => (
//             <button
//               key={command.command}
//               onClick={() = aria-label="Button"> insertBlock(command.command)}
//               className="w-full flex items-center gap-x-3 px-3 py-2 text-left  rounded-md transition-colors"
//             >
//               <command.icon className="size-4 text-gray-600" />
//               <span className="text-sm" aria-label="Button">{command.label}</span>
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Share Dialog */}
//       <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Share this page</DialogTitle>
//             <DialogDescription>
//               Anyone with the link can view this page
//             </DialogDescription>
//           </DialogHeader>
//           <div className="gap-y-4" aria-label="Button">
//             <div className="flex items-center gap-x-2" aria-label="Button">
//               <Switch id="public-access" />
//               <Label htmlFor="public-access">Allow public access</Label>
//             </div>
//             <div className="flex items-center gap-x-2" aria-label="Button">
//               <Switch id="allow-comments" />
//               <Label htmlFor="allow-comments">Allow comments</Label>
//             </div>
//             <div className="flex items-center gap-x-2" aria-label="Button">
//               <Switch id="allow-editing" />
//               <Label htmlFor="allow-editing">Allow editing</Label>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowShareDialog(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleShare}>
//               Copy link
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Publish Dialog */}
//       <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               {isPublished ? 'Unpublish page' : 'Publish to web'}
//             </DialogTitle>
//             <DialogDescription>
//               {isPublished 
//                 ? 'This page will no longer be accessible via public URL'
//                 : 'Make this page publicly accessible on the web'
//               }
//             </DialogDescription>
//           </DialogHeader>
//           {!isPublished && (
//             <div className="gap-y-4" aria-label="Button">
//               <div className="flex items-center gap-x-2" aria-label="Button">
//                 <Switch id="search-engines" defaultChecked />
//                 <Label htmlFor="search-engines">Allow search engines to index</Label>
//               </div>
//               {/* <div className="flex items-center gap-x-2" aria-label="Button">
//                 <Switch id="password-protect" />
//                 <Label htmlFor="password-protect">Password protect</Label>
//               </div> */}
//             </div>
//           )}
//           <DialogFooter>
//             <p>{`${window.location.origin}/public/${page.id}`}</p>
//             <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handlePublish}>
//               {isPublished ? 'Unpublish' : 'Publish'}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Invite Modal */}
//       <InviteModal
//         open={showInviteModal}
//         onOpenChange={setShowInviteModal}
//         workspaceId={workspaceId}
//         members={members}
//         onMembersUpdate={fetchMembers}
//       />
//     </div>
//   )
// }

// 'use client' perfectly working code 

// import { useEffect, useRef, useState, useCallback } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Bold, Italic, Underline, Code, Link, Image, Table, List, ListOrdered, Quote, Heading1, Heading2, Heading3, SquareCheck as CheckSquare, Minus, Video, FileText, TriangleAlert as AlertTriangle, Palette, Share, Globe, Users, Eye, Settings, Save, MoveHorizontal as MoreHorizontal } from 'lucide-react'
// import { toast } from 'sonner'
// import debounce from 'lodash/debounce'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { Label } from '@/components/ui/label'
// import { Switch } from '@/components/ui/switch'
// import EmojiPicker from 'emoji-picker-react'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import InviteModal from '@/components/InviteModal'
// import {
//   Modal,
//   ModalBody,
//   ModalContent,
//   ModalFooter,
//   ModalHeader,
//   ModalDescription,
//   ModalTitle
// } from '@/components/ui/animated-modal';
// import { FileTextIcon } from '@/components/ui/file-text';
// import { Image as ImageIcon, X, Upload } from 'lucide-react'


// interface Page {
//   id: string
//   title: string
//   content?: any
//   emoji?: string
//   coverImage?: string
//   isPublished?: boolean
//   publishedUrl?: string
//   createdAt: string;
//   updatedAt: string;
// }

// interface EditorJSProps {
//   page: Page
//   onUpdate: (updates: Partial<Page>) => void
//   workspaceId: string
// }

// export default function EditorJS({ page, onUpdate, workspaceId }: EditorJSProps) {
//   const editorRef = useRef<any>(null)
//   const isInitialized = useRef(false)
//   const [editor, setEditor] = useState<any>(null)
//   const [title, setTitle] = useState(page.title)
//   const [isReady, setIsReady] = useState(false)
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false)
//   const [showShareDialog, setShowShareDialog] = useState(false)
//   const [showPublishDialog, setShowPublishDialog] = useState(false)
//   const [isPublished, setIsPublished] = useState(page.isPublished || false)
//   const [members, setMembers] = useState<any[]>([])
//   const [showInviteModal, setShowInviteModal] = useState(false)
//   const [showSlashMenu, setShowSlashMenu] = useState(false)
//   const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 })
//   const [isUploadingCover, setIsUploadingCover] = useState(false)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   // Initialize Editor.js
//   useEffect(() => {
//     // Prevent double initialization in React Strict Mode
//     if (isInitialized.current) return
//     isInitialized.current = true

//     const initEditor = async () => {
//       if (typeof window === 'undefined') return

//       const EditorJS = (await import('@editorjs/editorjs')).default
//       const Header = (await import('@editorjs/header')).default
//       const List = (await import('@editorjs/list')).default
//       const Paragraph = (await import('@editorjs/paragraph')).default
//       const Image = (await import('@editorjs/image')).default
//       const Table = (await import('@editorjs/table')).default
//       const Quote = (await import('@editorjs/quote')).default
//       const Code = (await import('@editorjs/code')).default
//       const Delimiter = (await import('@editorjs/delimiter')).default
//       const Embed = (await import('@editorjs/embed')).default
//       const Checklist = (await import('@editorjs/checklist')).default
//       const Marker = (await import('@editorjs/marker')).default
//       const InlineCode = (await import('@editorjs/inline-code')).default
//       const Underline = (await import('@editorjs/underline')).default
//       const LinkTool = (await import('@editorjs/link')).default
//       const Raw = (await import('@editorjs/raw')).default
//       const SimpleImage = (await import('@editorjs/simple-image')).default
//       const AttachesTool = (await import('@editorjs/attaches')).default
//       const Warning = (await import('@editorjs/warning')).default
//       const NestedList = (await import('@editorjs/nested-list')).default

//       const editorInstance = new EditorJS({
//         holder: 'editorjs',
//         placeholder: "Type '/' for commands, or start writing...",
//         data: page.content || { blocks: [] },
//         tools: {
//           header: {
//             class: Header,
//             config: {
//               placeholder: 'Enter a header',
//               levels: [1, 2, 3, 4, 5, 6],
//               defaultLevel: 1
//             }
//           },
//           paragraph: {
//             class: Paragraph,
//             inlineToolbar: true,
//           },
//           list: {
//             class: List,
//             inlineToolbar: true,
//             config: {
//               defaultStyle: 'unordered'
//             }
//           },
//           nestedlist: NestedList,
//           checklist: {
//             class: Checklist,
//             inlineToolbar: true,
//           },
//           quote: {
//             class: Quote,
//             inlineToolbar: true,
//             shortcut: 'CMD+SHIFT+O',
//             config: {
//               quotePlaceholder: 'Enter a quote',
//               captionPlaceholder: 'Quote\'s author',
//             },
//           },
//           code: {
//             class: Code,
//             shortcut: 'CMD+SHIFT+C'
//           },
//           delimiter: Delimiter,
//           table: {
//             class: Table,
//             inlineToolbar: true,
//             config: {
//               rows: 2,
//               cols: 3,
//             },
//           },
//           image: {
//             class: Image,
//             config: {
//               endpoints: {
//                 byFile: '/api/uploads/image',
//                 byUrl: '/api/uploads/image-url',
//               }
//             }
//           },
//           simpleImage: SimpleImage,
//           embed: {
//             class: Embed,
//             config: {
//               services: {
//                 youtube: true,
//                 coub: true,
//                 codepen: {
//                   regex: /https?:\/\/codepen\.io\/([^\/\?\&]*)\/pen\/([^\/\?\&]*)/,
//                   embedUrl: 'https://codepen.io/ <%= remote_id %>?height=300&theme-id=0&default-tab=css,result&embed-version=2',
//                   html: "<iframe height='300' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>",
//                   height: 300,
//                   width: 600,
//                   id: (groups: string[]) => groups.join('/embed/')
//                 }
//               }
//             }
//           },
//           linkTool: {
//             class: LinkTool,
//             config: {
//               endpoint: '/api/link-preview',
//             }
//           },
//           marker: {
//             class: Marker,
//             shortcut: 'CMD+SHIFT+M',
//           },
//           inlineCode: {
//             class: InlineCode,
//             shortcut: 'CMD+SHIFT+C',
//           },
//           underline: Underline,
//           raw: Raw,
//           attaches: {
//             class: AttachesTool,
//             config: {
//               endpoint: '/api/uploads/file'
//             }
//           },
//           warning: {
//             class: Warning,
//             inlineToolbar: true,
//             shortcut: 'CMD+SHIFT+W',
//             config: {
//               titlePlaceholder: 'Title',
//               messagePlaceholder: 'Message',
//             },
//           },
//         },
//         onChange: async () => {
//           if (editorInstance) {
//             const content = await editorInstance.save()
//             debouncedSave(content)
//           }
//         },
//         onReady: () => {
//           setIsReady(true)
//           console.log('Editor.js is ready to work!')
//         },
//       })

//       editorRef.current = editorInstance
//       setEditor(editorInstance)
//     }

//     initEditor()

//     return () => {
//       if (editorRef.current && editorRef.current.destroy) {
//         editorRef.current.destroy()
//         editorRef.current = null
//       }
//       // Reset initialization flag on cleanup
//       isInitialized.current = false
//     }
//   }, [])

//   const fetchMembers = async () => {
//     try {
//       const response = await fetch(`/api/workspaces/${workspaceId}/invite`)
//       if (response.ok) {
//         const data = await response.json()
//         setMembers(data)
//       }
//     } catch (error) {
//       console.error('Failed to fetch members')
//     }
//   }

//   useEffect(() => {
//     if (workspaceId) {
//       fetchMembers()
//     }
//   }, [workspaceId])

//   const debouncedSave = useCallback(
//     debounce((content: any) => {
//       onUpdate({ content })
//     }, 1000),
//     [onUpdate]
//   )

//   const debouncedTitleSave = useCallback(
//     debounce((title: string) => {
//       onUpdate({ title })
//     }, 500),
//     [onUpdate]
//   )

//   const handleTitleChange = (newTitle: string) => {
//     setTitle(newTitle)
//     debouncedTitleSave(newTitle)
//   }

//   const handleEmojiSelect = (emojiData: any) => {
//     onUpdate({ emoji: emojiData.emoji })
//     setShowEmojiPicker(false)
//   }

//   const handlePublish = async () => {
//     try {
//       const publishedUrl = isPublished ? null : `${window.location.origin}/public/${page.id}`

//       const response = await fetch(`/api/pages/${page.id}/publish`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           isPublished: !isPublished,
//           publishedUrl: publishedUrl
//         }),
//       })

//       if (response.ok) {
//         const data = await response.json()
//         setIsPublished(data.isPublished)
//         onUpdate({ isPublished: data.isPublished, publishedUrl: data.publishedUrl })
//         toast.success(data.isPublished ? 'Page published!' : 'Page unpublished!')
//       }
//     } catch (error) {
//       toast.error('Failed to update publish status')
//     }
//     setShowPublishDialog(false)
//   }

//   const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     // Validate file type
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
//     if (!allowedTypes.includes(file.type)) {
//       toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
//       return
//     }

//     // Validate file size (10MB)
//     if (file.size > 10 * 1024 * 1024) {
//       toast.error('File size must be less than 10MB')
//       return
//     }

//     setIsUploadingCover(true)

//     try {
//       const formData = new FormData()
//       formData.append('image', file)

//       const response = await fetch('/api/uploads/cover', {
//         method: 'POST',
//         body: formData,
//       })

//       const data = await response.json()

//       if (data.success === 1) {
//         onUpdate({ coverImage: data.file.url })
//         toast.success('Cover image updated!')
//       } else {
//         toast.error(data.message || 'Failed to upload cover image')
//       }
//     } catch (error) {
//       console.error('Cover upload error:', error)
//       toast.error('Failed to upload cover image')
//     } finally {
//       setIsUploadingCover(false)
//       // Reset file input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = ''
//       }
//     }
//   }

//   const removeCoverImage = () => {
//     onUpdate({ coverImage: null })
//     toast.success('Cover image removed')
//   }

//   const handleShare = async () => {
//     try {
//       const response = await fetch(`/api/pages/${page.id}/share`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ type: 'VIEW' }),
//       })

//       if (response.ok) {
//         const data = await response.json()
//         navigator.clipboard.writeText(data.shareUrl)
//         toast.success('Share link copied to clipboard!')
//       }
//     } catch (error) {
//       toast.error('Failed to create share link')
//     }
//     setShowShareDialog(false)
//   }

//   const insertBlock = async (blockType: string) => {
//     if (!editor) return

//     try {
//       const blockIndex = editor.blocks.getCurrentBlockIndex()

//       switch (blockType) {
//         case 'header1':
//           await editor.blocks.insert('header', { text: '', level: 1 }, {}, blockIndex + 1)
//           break
//         case 'header2':
//           await editor.blocks.insert('header', { text: '', level: 2 }, {}, blockIndex + 1)
//           break
//         case 'header3':
//           await editor.blocks.insert('header', { text: '', level: 3 }, {}, blockIndex + 1)
//           break
//         case 'list':
//           await editor.blocks.insert('list', { style: 'unordered', items: [''] }, {}, blockIndex + 1)
//           break
//         case 'orderedList':
//           await editor.blocks.insert('list', { style: 'ordered', items: [''] }, {}, blockIndex + 1)
//           break
//         case 'checklist':
//           await editor.blocks.insert('checklist', { items: [{ text: '', checked: false }] }, {}, blockIndex + 1)
//           break
//         case 'quote':
//           await editor.blocks.insert('quote', { text: '', caption: '' }, {}, blockIndex + 1)
//           break
//         case 'code':
//           await editor.blocks.insert('code', { code: '' }, {}, blockIndex + 1)
//           break
//         case 'table':
//           await editor.blocks.insert('table', { content: [['', ''], ['', '']] }, {}, blockIndex + 1)
//           break
//         case 'delimiter':
//           await editor.blocks.insert('delimiter', {}, {}, blockIndex + 1)
//           break
//         case 'image':
//           await editor.blocks.insert('image', {}, {}, blockIndex + 1)
//           break
//         case 'embed':
//           await editor.blocks.insert('embed', {}, {}, blockIndex + 1)
//           break
//         case 'warning':
//           await editor.blocks.insert('warning', { title: '', message: '' }, {}, blockIndex + 1)
//           break
//       }

//       setShowSlashMenu(false)
//     } catch (error) {
//       console.error('Error inserting block:', error)
//     }
//   }

//   const slashCommands = [
//     { icon: Heading1, label: 'Heading 1', command: 'header1' },
//     { icon: Heading2, label: 'Heading 2', command: 'header2' },
//     { icon: Heading3, label: 'Heading 3', command: 'header3' },
//     { icon: List, label: 'Bullet List', command: 'list' },
//     { icon: ListOrdered, label: 'Numbered List', command: 'orderedList' },
//     { icon: CheckSquare, label: 'To-do List', command: 'checklist' },
//     { icon: Quote, label: 'Quote', command: 'quote' },
//     { icon: Code, label: 'Code', command: 'code' },
//     { icon: Table, label: 'Table', command: 'table' },
//     { icon: Image, label: 'Image', command: 'image' },
//     { icon: Video, label: 'Embed', command: 'embed' },
//     { icon: Minus, label: 'Divider', command: 'delimiter' },
//     { icon: AlertTriangle, label: 'Callout', command: 'warning' },
//   ]

//   return (
//     <div className="h-full flex flex-col overflow-hidden" aria-label="Button">
//       {/* Header */}

//       <div className=" border-b border-[#262626] z-10" aria-label="Button"> 
//        <div className="rounded-t-md overflow-hidden" aria-label="Button">

//        <div className="relative w-full" aria-label="Button">
//   {page.coverImage ? (
//     <div className="relative h-64 w-full group" aria-label="Button">
//       <img 
//         src={page.coverImage} 
//         alt="Cover" 
//         className="w-full h-full object-cover"
//       />
//       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2" aria-label="Button">
//         <Button
//           variant="secondary"
//           size="sm"
//           onClick={() => fileInputRef.current?.click()}
//           disabled={isUploadingCover}
//         >
//           <Upload className="size-4 mr-2" />
//           Change Cover
//         </Button>
//         <Button
//           variant="destructive"
//           size="sm"
//           onClick={removeCoverImage}
//         >
//           <X className="size-4 mr-2" />
//           Remove
//         </Button>
//       </div>
//     </div>
//   ) : (
//     <div className="h-32 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center bg-gray-900/50" aria-label="Button">
//       <Button
//         variant="ghost"
//         onClick={() => fileInputRef.current?.click()}
//         disabled={isUploadingCover}
//         className="text-gray-400 hover:text-white"
//       >
//         <ImageIcon className="size-5 mr-2" />
//         {isUploadingCover ? 'Uploading...' : 'Add Cover Image'}
//       </Button>
//     </div>

//   )}

// <input
//     ref={fileInputRef}
//     type="file"
//     accept="image/jpeg,image/png,image/webp,image/gif"
//     onChange={handleCoverImageUpload}
//     className="hidden"
//   />
//   </div>
//       </div>
//        <div className="flex items-center justify-between px-10" aria-label="Button">
//           <div className="flex -mt-10 !justify-center items-center gap-x-2" aria-label="Button">
//             <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
//               <PopoverTrigger asChild>
//                 <div className=" p-1 md:text-7xl  h-auto z-50" aria-label="Button">
//                   {page.emoji || <FileTextIcon className="h-10 w-10 dark:text-[#7D7A75] text-[#201f1f]" />}
//                 </div>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0" align="start">
//                 <EmojiPicker onEmojiClick={handleEmojiSelect} />
//               </PopoverContent>
//             </Popover>

//           </div>


//           <div className="flex items-center gap-x-2" aria-label="Button">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setShowShareDialog(true)}
//             >
//               <Share className="size-4 mr-2" />
//               Share
//             </Button>

//             <Button
//               variant={isPublished ? "default" : "outline"}
//               size="sm"
//               onClick={() => setShowPublishDialog(true)}
//             >
//               <Globe className="size-4 mr-2" />
//               {isPublished ? 'Published' : 'Publish'}
//             </Button>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="sm">
//                   <MoreHorizontal className="size-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
//                   <Users className="mr-2 size-4" />
//                   Share & Invite
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => setShowInviteModal(true)}>
//                   <Users className="mr-2 size-4" />
//                   Manage members
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => setShowPublishDialog(true)}>
//                   <Globe className="mr-2 size-4" />
//                   Publish settings
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>
//                   <Eye className="mr-2 size-4" />
//                   Page analytics
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <Settings className="mr-2 size-4" />
//                   Page settings
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>

//         {/* Collaborators */}
//         {members.length > 0 && (
//           <div className="flex flex-col mt-2 gap-y-2 ml-12 items-start w-fit justify-start gap-x-2 mb-2" aria-label="Button">
//              <div className="" aria-label="Button">
//             <Input
//               value={title}
//               onChange={(e) => handleTitleChange(e.target.value)}
//               placeholder="Doc"
//               className="!text-3xl !max-w-fit !w-[10vw] !h-fit !p-0  bg-transparent shadow-none font-semibold border-none  px-0 focus-visible:ring-0 focus-visible:ring-offset-0 "
//             />
//             </div>
//             <div className="" aria-label="Button">
//             <div className="flex -gap-x-2 " aria-label="Button">
//               {members.slice(0, 5).map((member, index) => (
//                 <img
//                   key={index}
//                   src={member.user?.image || `https://ui-avatars.com/api/?name= ${member.user?.name}&background=random`}
//                   alt={member.user?.name}
//                   className="size-8 rounded-full border-2 border-white"
//                 />
//               ))}
//               {members.length > 5 && (
//                 <div className="size-8 rounded-full border-2 border-white flex items-center justify-center text-xs" aria-label="Button">
//                   +{members.length - 5} 
//                 </div>
//               )}
//             </div>
//             <p></p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Editor */}
//       <div className="flex-1 overflow-auto" aria-label="Button">
//         <div className="max-w-4xl mx-auto py-8 px-6" aria-label="Button">
//           <div 
//             id="editorjs" 
//             className="prose prose-lg max-w-none"
//             style={{ minHeight: '500px' }}
//           / aria-label="Button">
//         </div>
//       </div>

//       {/* Slash Command Menu */}
//       {showSlashMenu && (
//         <div 
//           className="fixed  border border-gray-200 rounded-lg shadow-lg p-2 z-50 max-h-80 overflow-y-auto"
//           style={{ 
//             left: slashMenuPosition.x, 
//             top: slashMenuPosition.y,
//             width: '280px'
//           }}
//          aria-label="Button">
//           <div className="text-xs text-gray-500 mb-2 px-2" aria-label="Button">BASIC BLOCKS</div>
//           {slashCommands.map((command) => (
//             <button
//               key={command.command}
//               onClick={() = aria-label="Button"> insertBlock(command.command)}
//               className="w-full flex items-center gap-x-3 px-3 py-2 text-left  rounded-md transition-colors"
//             >
//               <command.icon className="size-4 text-gray-600" />
//               <span className="text-sm" aria-label="Button">{command.label}</span>
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Share Dialog */}
//       <Modal open={showShareDialog} onOpenChange={setShowShareDialog}>
//               <ModalBody className=" !max-w-[30%] !min-h-20%] !h-[20%] !max-h-[20%] dark:bg-neutral-900 !w-[36%]">

//         <ModalContent>
//           <ModalHeader>
//             <ModalTitle>Share this page</ModalTitle>
//             <ModalDescription>
//               Anyone with the link can view this page
//             </ModalDescription>
//           </ModalHeader>
//           <div className="gap-y-4 mt-5" aria-label="Button">
//             <div className="flex items-center gap-x-2" aria-label="Button">
//               <Switch id="public-access" />
//               <Label htmlFor="public-access">Allow public access</Label>
//             </div>
//             <div className="flex items-center gap-x-2" aria-label="Button">
//               <Switch id="allow-comments" />
//               <Label htmlFor="allow-comments">Allow comments</Label>
//             </div>
//             <div className="flex items-center gap-x-2" aria-label="Button">
//               <Switch id="allow-editing" />
//               <Label htmlFor="allow-editing">Allow editing</Label>
//             </div>
//           </div>

//         </ModalContent>
//         <ModalFooter className='flex gap-2 '>
//             <Button variant="outline" >
//               Cancel
//             </Button>
//             <Button onClick={handleShare} className='bg-[#6347EA] text-[#eee]'>
//               Copy link
//             </Button>
//           </ModalFooter>
//         </ModalBody>
//       </Modal>


//       {/* Publish Dialog */}
//       <Modal open={showPublishDialog} onOpenChange={setShowPublishDialog}>
//       <ModalBody className=" !max-w-[30%] !min-h-15%] !h-[15%] !max-h-[16%] dark:bg-neutral-900 !w-[36%]">

//         <ModalContent>
//           <ModalHeader>
//             <ModalTitle>
//               {isPublished ? 'Unpublish page' : 'Publish to web'}
//             </ModalTitle>
//             <ModalDescription>
//               {isPublished 
//                 ? 'This page will no longer be accessible via public URL'
//                 : 'Make this page publicly accessible on the web'
//               }
//             </ModalDescription>
//           </ModalHeader>
//           <div className=" mt-4" aria-label="Button">
//           {!isPublished && (
//             <div className="gap-y-4" aria-label="Button">
//               <div className="flex items-center gap-x-2" aria-label="Button">
//                 <Switch id="search-engines" defaultChecked />
//                 <Label htmlFor="search-engines">Allow search engines to index</Label>
//               </div>
//             </div>
//           )}

// <p>{`${window.location.origin}/public/${page.id}`}</p>
//          </div>
//         </ModalContent> 
//         <ModalFooter>
//             <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handlePublish}>
//               {isPublished ? 'Unpublish' : 'Publish'}
//             </Button>
//           </ModalFooter>
//         </ModalBody>
//       </Modal>

//       {/* Invite Modal */}
//       <InviteModal
//         open={showInviteModal}
//         onOpenChange={setShowInviteModal}
//         workspaceId={workspaceId}
//         members={members}
//         onMembersUpdate={fetchMembers}
//       />
//     </div>
//   )
// }




'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bold, Italic, Underline, Code, Link, Table, List, ListOrdered, Quote, Heading1, Heading2, Heading3, SquareCheck as CheckSquare, Minus, Video, FileText, TriangleAlert as AlertTriangle, Palette, Share, Globe, Users, Eye, Settings, Save, MoveHorizontal as MoreHorizontal, Star, MessageCircle, UserPlus, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import debounce from 'lodash/debounce'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import EmojiPicker, {
  EmojiStyle,
  Theme,
} from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import InviteModal from '@/components/InviteModal'
import AssignPageModal from '@/components/doc-components/AssignPageModal'
import PageComments from '@/components/doc-components/PageComments'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalDescription,
  ModalTitle
} from '@/components/ui/animated-modal';
import { FileTextIcon } from '@/components/ui/file-text';
import { Image as ImageIcon, X, Upload } from 'lucide-react'
import Image from 'next/image'


interface Page {
  id: string
  title: string
  content?: any
  emoji?: string
  coverImage?: string
  isPublished?: boolean
  publishedUrl?: string
  isFavorite?: boolean
  assignedTo?: {
    user: { name: string; image?: string }
    team: { name: string }
  }
  createdAt: string;
  updatedAt: string;
}

interface EditorJSProps {
  page: Page
  onUpdate: (updates: Partial<Page>) => void
  workspaceId: string
}

export default function EditorJS({ page, onUpdate, workspaceId }: EditorJSProps) {
  const editorRef = useRef<any>(null)
  const isInitialized = useRef(false)
  const [editor, setEditor] = useState<any>(null)
  const [title, setTitle] = useState(page.title)
  const [isReady, setIsReady] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [isPublished, setIsPublished] = useState(page.isPublished || false)
  const [isFavorite, setIsFavorite] = useState(page.isFavorite || false)
  const [members, setMembers] = useState<any[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize Editor.js (same as before)
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
      const Raw = (await import('@editorjs/raw')).default
      const SimpleImage = (await import('@editorjs/simple-image')).default
      const AttachesTool = (await import('@editorjs/attaches')).default
      const Warning = (await import('@editorjs/warning')).default
      const NestedList = (await import('@editorjs/nested-list')).default

      const editorInstance = new EditorJS({
        holder: 'editorjs',
        placeholder: "Type '/' for commands, or start writing...",
        data: page.content || { blocks: [] },
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a header',
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 5
            }
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered'
            }
          },
          nestedlist: NestedList,
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+O',
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
            config: {
              rows: 2,
              cols: 3,
            },
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
          simpleImage: SimpleImage,
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
          marker: {
            class: Marker,
            shortcut: 'CMD+SHIFT+M',
          },
          inlineCode: {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+C',
          },
          underline: Underline,
          raw: Raw,
          attaches: {
            class: AttachesTool,
            config: {
              endpoint: '/api/uploads/file'
            }
          },
          warning: {
            class: Warning,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+W',
            config: {
              titlePlaceholder: 'Title',
              messagePlaceholder: 'Message',
            },
          },
        },
        onChange: async () => {
          if (editorInstance) {
            const content = await editorInstance.save()
            debouncedSaveRef.current?.(content)
          }
        },
        onReady: () => {
          setIsReady(true)
          console.log('Editor.js is ready!')
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

  // Check if page is favorited
  const { } = useQuery({
    queryKey: ['pageFavorites', page.id],
    queryFn: async () => {
      const response = await fetch('/api/pages/favorites')
      if (response.ok) {
        const favorites = await response.json()
        setIsFavorite(favorites.some((f: any) => f.id === page.id))
      }
      return null
    },
  })

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invite`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Failed to fetch members')
    }
  }

  // ── Fetch members on mount ──
  const { } = useQuery({
    queryKey: ['workspaceMembers', workspaceId],
    queryFn: async () => {
      const response = await fetch(`/api/workspaces/${workspaceId}/invite`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
        return data;
      }
      return [];
    },
    enabled: !!workspaceId,
  });

  // const debouncedSave = useCallback(
  //   debounce((content: any) => {
  //     onUpdate({ content })
  //   }, 1000),
  //   [onUpdate]
  // )

  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null)
  useEffect(() => {
    debouncedSaveRef.current = debounce((content) => onUpdate({ content }), 1000)
    return () => { debouncedSaveRef.current?.cancel() }
  }, [onUpdate])

  const debouncedTitleSave = useCallback(
    debounce((title: string) => {
      onUpdate({ title })
    }, 500),
    [onUpdate]
  )

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    debouncedTitleSave(newTitle)
  }

  const handleEmojiSelect = (emojiData: any) => {
    onUpdate({ emoji: emojiData.emoji })
    setShowEmojiPicker(false)
  }

  const handleFavorite = async () => {
    try {
      if (isFavorite) {
        await fetch(`/api/pages/favorites?pageId=${page.id}`, {
          method: 'DELETE',
        })
        setIsFavorite(false)
        toast.success('Removed from favorites')
      } else {
        await fetch('/api/pages/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId: page.id }),
        })
        setIsFavorite(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      toast.error('Failed to update favorite')
    }
  }

  const handlePublish = async () => {
    try {
      const publishedUrl = isPublished ? null : `${window.location.origin}/public/${page.id}`

      const response = await fetch(`/api/pages/${page.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: !isPublished,
          publishedUrl: publishedUrl
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsPublished(data.isPublished)
        onUpdate({ isPublished: data.isPublished, publishedUrl: data.publishedUrl })
        toast.success(data.isPublished ? 'Page published!' : 'Page unpublished!')
      }
    } catch (error) {
      toast.error('Failed to update publish status')
    }
    setShowPublishDialog(false)
  }

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploadingCover(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/uploads/cover', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success === 1) {
        onUpdate({ coverImage: data.file.url })
        toast.success('Cover image updated!')
      } else {
        toast.error(data.message || 'Failed to upload cover image')
      }
    } catch (error) {
      console.error('Cover upload error:', error)
      toast.error('Failed to upload cover image')
    } finally {
      setIsUploadingCover(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeCoverImage = () => {
    onUpdate({ coverImage: null })
    toast.success('Cover image removed')
  }

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/pages/${page.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'VIEW' }),
      })

      if (response.ok) {
        const data = await response.json()
        navigator.clipboard.writeText(data.shareUrl)
        toast.success('Share link copied to clipboard!')
      }
    } catch (error) {
      toast.error('Failed to create share link')
    }
    setShowShareDialog(false)
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto thin-scrollbar rounded-l-lg" aria-label="Button">
      {/* Header */}
      <div className=" z-10" aria-label="Button">
        <div className="rounded-t-md" aria-label="Button">
          <div className="relative w-full" aria-label="Button">
            {page.coverImage ? (
              <div className="relative h-64 w-full group p-2" aria-label="Button">
                <Image
                  src={page.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover rounded-md"
                  width={1200}
                  height={800}
                />
                <div className="absolute bottom-2 top-auto right-2 h-fit inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-2" aria-label="Button">
                  <div className="w-fit gap-2 p-0.5 mb-1 mr-1 gap-x-1 bg-black rounded-md" aria-label="Button">
                    <Button
                      variant="ghost"
                      className="h-full hover:dark:bg-[#222] flex-1 rounded-sm px-1 py-0.5"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingCover}
                    >
                      Change Cover
                    </Button>
                    <Button
                      variant="ghost"

                      className='h-full hover:dark:bg-[#222] flex-1 rounded-sm px-1 py-0.5'
                      onClick={removeCoverImage}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="" aria-label="Button" />
            )}

            <input
              aria-label="Add cover image"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleCoverImageUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex items-center justify-between md:px-14 px-8 mx-2 relative group" aria-label="Button">
          <div className="flex -mt-10 !justify-center items-center gap-x-2" aria-label="Button">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <div className="p-1 md:text-7xl h-auto z-50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" aria-label="Button">
                  {page.emoji ? <span className="" aria-label="Button">{page.emoji}</span> : <FileTextIcon className="md:text-7xl dark:text-[#7D7A75] text-[#201f1f]" />}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <EmojiPicker onEmojiClick={handleEmojiSelect}
                  emojiStyle={EmojiStyle.APPLE}
                  theme={Theme.DARK}
                  width="100%"
                  height={400} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-in-out items-center !gap-x-0.5 mt-2 bg-[#f5f5f5] dark:bg-black rounded-md border dark:border-[#222]" aria-label="Button">
            {/* Favorite Button - NEW */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              className={isFavorite ? 'text-yellow-500' : ''}
            >
              <Star className={`size-4 dark:text-[#7B7B7B] ${isFavorite ? 'fill-yellow-500' : ''}`} />
              {/* {isFavorite ? 'Favorited' : 'Favorite'} */}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingCover}
              className="text-gray-400 hover:text-white dark:text-[#7B7B7B]"
            >
              {isUploadingCover ? <ImageIcon className="size-5 dark:text-[#7B7B7B]" /> : <Image src={page.coverImage} alt="cover" className='size-5 rounded-sm' width={24} height={24} />}
              {/* {isUploadingCover ? 'Uploading...' : 'Add Cover Image'} */}
            </Button>

            {/* Assign Button - NEW */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAssignModal(true)}
            >
              <UserPlus className="size-4 dark:text-[#7B7B7B]" />
            </Button>

            {/* Comments Button - NEW */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowComments(!showComments)}
              className={showComments ? 'bg-gray-100 dark:bg-gray-800' : ''}
            >
              <MessageCircle className="size-4 dark:text-[#7B7B7B]" />

            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShareDialog(true)}
            >
              <Share className="size-4 dark:text-[#7B7B7B]" />

            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPublishDialog(true)}
            >
              <Globe className="size-4 dark:text-[#7B7B7B]" />
              {/* {isPublished ? 'Published' : 'Publish'} */}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="size-4 dark:text-[#7B7B7B]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                  <Users className="mr-2 size-4" />
                  Share & Invite
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowInviteModal(true)}>
                  <Users className="mr-2 size-4" />
                  Manage members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAssignModal(true)}>
                  <UserPlus className="mr-2 size-4" />
                  Assign page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPublishDialog(true)}>
                  <Globe className="mr-2 size-4" />
                  Publish settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* {page.assignedTo ? <p>{page.assignedTo.user.name}</p> : <p>Not</p>} */}
        </div>

        {/* Collaborators & Title */}
        {members.length > 0 && (
          <div className="flex flex-col mt-2 gap-y-2 ml-20 items-start w-fit justify-start gap-x-2 mb-2" aria-label="Button">
            <div>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Doc"
                className="!text-3xl !h-fit !p-0  shadow-none font-semibold border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="flex items-center gap-x-2 " aria-label="Button">
              <div className="flex !-!gap-x-2" aria-label="Button">
                {members.slice(0, 5).map((member, index) => (
                  <img
                    key={index}
                    src={member.user?.image || `https://ui-avatars.com/api/?name=${member.user?.name}&background=random`}
                    alt={member.user?.name}
                    className="size-7 rounded-full border dark:border-[#464646] "
                  />
                ))}
                {members.length > 5 && (
                  <div className="size-7 rounded-full border-2 dark:border-[#464646] flex items-center justify-center text-xs" aria-label="Button">
                    +{members.length - 5}
                  </div>
                )}
              </div>
              <p className="text-sm dark:text-[#848484]">
                • Last updated {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(page.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </p></div>
          </div>
        )}
      </div>

      {/* Main Content Area with Optional Comments Sidebar */}
      <div className="flex-1 flex" aria-label="Button">
        {/* Editor */}
        <div className={`flex-1  transition-all`} aria-label="Button">
          <div className="max-w-5xl mx-auto pt-4 px-3" aria-label="Button">
            <div
              id="editorjs"
              className="prose prose-lg max-w-none"
              style={{ minHeight: '500px' }}
           aria-label="Button" />
          </div>
        </div>

        {showComments && (
          <div className="w-80 border-l dark:border-gray-800 bg-white dark:bg-[#111111] overflow-y-auto p-4" aria-label="Button">
            <PageComments pageId={page.id} />
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Modal open={showShareDialog} onOpenChange={setShowShareDialog}>
        <ModalBody className="!max-w-[30%] !min-h-20%] !h-[20%] !max-h-[20%] dark:bg-neutral-900 !w-[36%]">
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Share this page</ModalTitle>
              <ModalDescription>
                Anyone with the link can view this page
              </ModalDescription>
            </ModalHeader>
            <div className="gap-y-4 mt-5" aria-label="Button">
              <div className="flex items-center gap-x-2" aria-label="Button">
                <Switch id="public-access" />
                <Label htmlFor="public-access">Allow public access</Label>
              </div>
              <div className="flex items-center gap-x-2" aria-label="Button">
                <Switch id="allow-comments" />
                <Label htmlFor="allow-comments">Allow comments</Label>
              </div>
              <div className="flex items-center gap-x-2" aria-label="Button">
                <Switch id="allow-editing" />
                <Label htmlFor="allow-editing">Allow editing</Label>
              </div>
            </div>
          </ModalContent>
          <ModalFooter className='flex gap-2'>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} className='bg-[#6347EA] text-[#eee]'>
              Copy link
            </Button>
          </ModalFooter>
        </ModalBody>
      </Modal>

      {/* Publish Dialog */}
      <Modal open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <ModalBody className="!max-w-[30%] !min-h-15%] !h-[15%] !max-h-[16%] dark:bg-neutral-900 !w-[36%]">
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {isPublished ? 'Unpublish page' : 'Publish to web'}
              </ModalTitle>
              <ModalDescription>
                {isPublished
                  ? 'This page will no longer be accessible via public URL'
                  : 'Make this page publicly accessible on the web'
                }
              </ModalDescription>
            </ModalHeader>
            <div className="mt-4" aria-label="Button">
              {!isPublished && (
                <div className="gap-y-4" aria-label="Button">
                  <div className="flex items-center gap-x-2" aria-label="Button">
                    <Switch id="search-engines" defaultChecked />
                    <Label htmlFor="search-engines">Allow search engines to index</Label>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-4">{`${window.location.origin}/public/${page.id}`}</p>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublish}>
              {isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          </ModalFooter>
        </ModalBody>
      </Modal>

      {/* Assign Modal - NEW */}
      <AssignPageModal
        pageId={page.id}
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        onAssigned={() => {
          toast.success('Page assigned!')
          // Refresh page data to show assignment
        }}
      />

      {/* Invite Modal */}
      <InviteModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        workspaceId={workspaceId}
        members={members}
        onMembersUpdate={fetchMembers}
      />
    </div>
  )
}
