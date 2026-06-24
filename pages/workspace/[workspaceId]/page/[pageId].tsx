// 'use client';

// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';
// import { useEffect, useRef, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Plus, FileText, File, Search, X } from 'lucide-react';
// import { toast } from 'sonner';
// import { Header } from '@/components/doc-components/Header';
// import { WikiSection } from '@/components/doc-components/WikiSection';
// import DocsTable from '@/components/doc-components/DocsTable';
// import Mainsidebar from '@/components/ui/mainSideBar';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { AnimateIcon } from '@/components/animate-ui/icons/icon';
// import { SearchIcon } from '@/components/animate-ui/icons/search';
// import {
//   Card,
//   CardContent,
//   CardFooter,
// } from '@/components/ui/card';
// import { ClipboardList } from '@/components/animate-ui/icons/clipboard-list';
// import { Input } from '@/components/ui/input';
// import CircularText from '@/components/ui/CircularTextLoader';
// import { FileTextIcon } from '@/components/ui/file-text';
// import {
//   ExpandableScreen,
//   ExpandableScreenContent,
//   ExpandableScreenTrigger,
// } from "@/components/ui/ExpandableScreen"
// import Editor from '@/components/Editor'
// import TemplatesSection from '@/components/doc-components/DocSections/TemplatesSection'
// // import CreatedByMeSection from '@/components/doc-components/DocSections/CreatedByMeSection'
// // import AssignedToMeSection from '@/components/doc-components/DocSections/AssignedToMeSection'
// import FavoritesSection from '@/components/doc-components/DocSections/FavoritesSection'
// import {
//   Sidebar,
//   SidebarProvider,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarTrigger,
//   useSidebar,
// } from "@/components/doc-components/Sidebar"
// import {
//   LogOut,
//   ChevronRight,
//   ChevronDown,
//   MoreHorizontal,
//   Trash2,
//   Edit3
// } from 'lucide-react'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/animate-ui/components/radix/dropdown-menu'
// import {
//   Tabs,
// } from '@/components/animate-ui/components/animate/tabs';
// import { motion, AnimatePresence } from "framer-motion";
// import Image from 'next/image';
// import CreatedAssigned from '@/components/doc-components/DocSections/CreatedByMeSection';
// import { Users } from '@/components/animate-ui/icons/users';
// import {
//   Modal,
//   ModalBody,
//   ModalContent,
//   ModalFooter,
//   ModalHeader,
//   ModalDescription,
//   ModalTitle
// } from '@/components/ui/animated-modal';
// import { Switch } from '@/components/ui/switch';
// import { Label } from '@/components/ui/label';

// interface Page {
//   id: string
//   title: string
//   content?: any
//   emoji?: string
//   coverImage?: string
//   workspaceId: string
//   authorId: string
//   createdAt: string
//   updatedAt: string
// }

// interface Page {
//   id: string
//   title: string
//   emoji?: string
//   children?: Page[]
//   parentId?: string
// }

// interface SidebarProps {
//   workspaceId: string
//   currentPageId?: string
// }

// interface Workspace {
//   id: string;
//   name: string;
//   slug: string;
//   description?: string;
// }

// interface Page {
//   id: string;
//   title: string;
//   coverImage?: string;
//   workspace: { name: string }
//   emoji?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // export function PageView() {
// //   const { data: session, status } = useSession()
// //   const router = useRouter()
// //   const { workspaceId, pageId } = router.query
// //   const [page, setPage] = useState<Page | null>(null)
// //   const [loading, setLoading] = useState(true)


// //   useEffect(() => {
// //     if (status === 'unauthenticated') {
// //       router.push('/')
// //       return
// //     }

// //     if (pageId && workspaceId && session) {
// //       fetchPage()
// //     }
// //   }, [pageId, workspaceId, session, status, router])

// //   const fetchPage = async () => {
// //     try {
// //       const response = await fetch(`/api/pages/${pageId}`)
// //       if (response.ok) {
// //         const data = await response.json()
// //         setPage(data)
// //       } else if (response.status === 404) {
// //         router.push(`/workspace/${workspaceId}`)
// //         toast.error('Page not found')
// //       } else {
// //         throw new Error('Failed to load page')
// //       }
// //     } catch (error) {
// //       toast.error('Failed to load page')
// //       router.push(`/workspace/${workspaceId}`)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const updatePage = async (updates: Partial<Page>) => {
// //     try {
// //       const response = await fetch(`/api/pages/${pageId}`, {
// //         method: 'PATCH',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(updates),
// //       })

// //       if (response.ok) {
// //         const updatedPage = await response.json()
// //         setPage(updatedPage)
// //       } else {
// //         throw new Error('Failed to update page')
// //       }
// //     } catch (error) {
// //       toast.error('Failed to save changes')
// //     }
// //   }

// //   if (status === 'loading' || loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
// //       </div>
// //     )
// //   }

// //   if (!page) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <div className="text-center">
// //           <h2 className="text-2xl font-bold mb-2">Page not found</h2>
// //           <p className="text-gray-600">The page you're looking for doesn't exist.</p>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <>


// //     <div className=" flex h-full">


// //       <div className="flex-1 overflow-auto">
// //         <div>


// //         </div>
// //         <Editor
// //           page={page}
// //           onUpdate={updatePage}
// //           workspaceId={workspaceId as string}
// //         />
// //       </div>
// //     </div>
// //   </>

// //   )
// // }

// export default function DocModalView() {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const { push } = useRouter()
//   const { back } = useRouter()
//   const { workspaceId } = router.query
//   const [page, setPage] = useState<Page | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [pages, setPages] = useState<Page[]>([])
//   const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
//   const [workspace, setWorkspace] = useState<any>(null)
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [showShareDialog, setShowShareDialog] = useState(false)
//   const { pageId } = router.query
//   const { currentPageId } = router.query
//   const [isExpanded, setIsExpanded] = useState(false)

//   useEffect(() => {
//     if (!pageId || !workspaceId || !session) return

//     setLoading(true)
//     // fetchPage()
//   }, [pageId, workspaceId, session])

//   useEffect(() => {
//     const { workspaceId, pageId } = router.query
//     if (!pageId || !workspaceId || !session) return

//     let cancelled = false
//     setLoading(true)

//     fetch(`/api/pages/${pageId}`)
//       .then(res => res.json())
//       .then(data => {
//         if (!cancelled) setPage(data)
//       })
//       .finally(() => {
//         if (!cancelled) setLoading(false)
//       })

//     return () => {
//       cancelled = true
//     }
//   }, [pageId, workspaceId])

//   useEffect(() => {
//     if (isOpen && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isOpen]);

//   // Close when clicking outside or pressing Escape
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
//         if (searchQuery === "") {
//           setIsOpen(false);
//         }
//       }
//     };

//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         setIsOpen(false);
//         setSearchQuery("");
//       }
//     };

//     if (isOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//       document.addEventListener("keydown", handleEscape);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, [isOpen, searchQuery]);

//   // const fetchPage = async () => {
//   //   try {
//   //     const response = await fetch(`/api/pages/${pageId}`)
//   //     if (response.ok) {
//   //       const data = await response.json()
//   //       setPage(data)
//   //     } else if (response.status === 404) {
//   //       router.push(`/workspace/${workspaceId}`)
//   //       toast.error('Page not found')
//   //     } else {
//   //       throw new Error('Failed to load page')
//   //     }
//   //   } catch (error) {
//   //     toast.error('Failed to load page')
//   //     push(`/workspace/${workspaceId}`)
//   //   } finally {
//   //     setLoading(false)
//   //   }
//   // }

//   const updatePage = async (updates: Partial<Page>) => {
//     try {
//       const response = await fetch(`/api/pages/${pageId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updates),
//       })

//       if (response.ok) {
//         const updatedPage = await response.json()
//         setPage(updatedPage)
//       } else {
//         throw new Error('Failed to update page')
//       }
//     } catch (error) {
//       toast.error('Failed to save changes')
//     }
//   }

//   useEffect(() => {
//     if (workspaceId) {
//       fetchWorkspace()
//       fetchPages()
//     }
//   }, [workspaceId])

//   const fetchWorkspace = async () => {
//     try {
//       const response = await fetch(`/api/workspaces/${workspaceId}`)
//       if (response.ok) {
//         const data = await response.json()
//         setWorkspace(data)
//       }
//     } catch (error) {
//       console.error('Failed to fetch workspace')
//     }
//   }

//   const fetchPages = async () => {
//     try {
//       const response = await fetch(`/api/pages?workspaceId=${workspaceId}&tree=true`)
//       if (response.ok) {
//         const data = await response.json()
//         setPages(data)
//       }
//     } catch (error) {
//       console.error('Failed to fetch pages')
//     }
//   }

//   const createNewPage = async (parentId?: string) => {
//     try {
//       const response = await fetch('/api/pages/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           workspaceId,
//           parentId,
//           title: 'Doc',
//         }),
//       })

//       if (response.ok) {
//         const page = await response.json()
//         await fetchPages()
//         push(`/workspace/${workspaceId}/page/${page.id}`)
//       } else {
//         throw new Error('Failed to create page')
//       }
//     } catch (error) {
//       toast.error('Failed to create page')
//     }
//   }

//   const deletePage = async (pageId: string) => {
//     if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
//       return
//     }

//     try {
//       const response = await fetch(`/api/pages/${pageId}`, {
//         method: 'DELETE',
//       })

//       if (response.ok) {
//         await fetchPages()
//         if (currentPageId === pageId) {
//           push(`/workspace/${workspaceId}`)
//         }
//         toast.success('Page deleted successfully')
//       } else {
//         throw new Error('Failed to delete page')
//       }
//     } catch (error) {
//       toast.error('Failed to delete page')
//     }
//   }

//   const handleShare = async () => {
//     try {
//       const response = await fetch(`/api/pages/${pageId}/share`, {
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

//   const toggleExpanded = (pageId: string) => {
//     const newExpanded = new Set(expandedPages)
//     if (newExpanded.has(pageId)) {
//       newExpanded.delete(pageId)
//     } else {
//       newExpanded.add(pageId)
//     }
//     setExpandedPages(newExpanded)
//   }

//   if (status === 'loading' || loading) {
//     return (
//       <div className="min-h-screen max-h-screen min-w-screen w-full flex items-center justify-center">
//         <CircularText
//           text="CONFERIO*CALLS*"
//           onHover="speedUp"
//           spinDuration={5}
//           className="custom-class"
//         />
//       </div>
//     )
//   }

//   if (!page) {
//     return (
//       <div className="min-h-[6.6rem] flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
//           <p className="text-gray-600">The page you are looking for does not exist.</p>
//         </div>
//       </div>
//     )
//   }

//   const renderPageTree = (pages: Page[], level = 0) => {
//     return pages.map((page) => {
//       const hasChildren = page.children && page.children.length > 0
//       const isExpanded = expandedPages.has(page.id)
//       const isActive = currentPageId === page.id

//       return (
//         <div key={page.id}>
//           <div
//             className={`group flex items-center py-1 px-2 hover:dark:bg-[#333] rounded-sm cursor-pointer ${isActive ? '' : ''
//               }`}
//             style={{ paddingLeft: `${level * 16 + 8}px` }}
//           >
//             {hasChildren ? (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="p-0 h-auto w-4 mr-1"
//                 onClick={(e) => {
//                   e.stopPropagation()
//                   toggleExpanded(page.id)
//                 }}
//               >
//                 {isExpanded ? (
//                   <ChevronDown className="h-3 w-3" />
//                 ) : (
//                   <ChevronRight className="h-3 w-3" />
//                 )}
//               </Button>
//             ) : (
//               <div className="w-4 mr-1" />
//             )}

//             <div
//               className="flex-1 flex items-center min-w-0"
//               onClick={() => push(`/workspace/${workspaceId}/page/${page.id}`)}
//             >
//               <div className="mr-2 text-sm">
//                 {page.emoji || <FileText className="h-4 w-4 text-gray-400" />}
//               </div>
//               <span className="truncate text-sm">{page.title}</span>
//             </div>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="opacity-0 group-hover:opacity-100 p-1 h-auto"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <MoreHorizontal className="h-3 w-3" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={() => createNewPage(page.id)}>
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add subpage
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={() => deletePage(page.id)} className="text-red-600">
//                   <Trash2 className="mr-2 h-4 w-4" />
//                   Delete
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>

//           {hasChildren && isExpanded && (
//             <div>
//               {renderPageTree(page.children!, level + 1)}
//             </div>
//           )}
//         </div>
//       )
//     })
//   }

//   return (
//     <>
//       <div className="bg-[#f1f1f1] dark:bg-[#222222] w-full px-2 border !rounded-lg dark:!border-[#333232] h-screen max-h-screen !overflow-y-hidden">
//         <div className="h-10 flex justify-between items-center w-full px-2">
//           <div className="flex justify-start items-center gap-0.5 !z-[9999]">
//             <div
//               onClick={() => push(`/workspace/${workspaceId}`)}
//               className="flex-1 flex items-center min-w-0 cursor-pointer">
//               <div className="mr-1 text-sm">
//                 <FileText className="h-4 w-4 text-gray-400" />
//               </div>
//               <span onClick={() => push(`/workspace/${workspaceId}`)} className=" dark:text-[#B4B4B4] text-sm font-medium truncate block">{workspace?.name}</span>
//             </div>
//             <div className="text-gray-400">/</div>
//             <div
//               className="flex-1 flex items-center">
//               <div className="mr-1 text-sm">
//                 {page.emoji || <FileText className="h-4 w-4 text-gray-400" />}
//               </div>
//               <span className=" dark:text-[#B4B4B4] text-sm font-medium truncate block">{page.title}</span>
//             </div>
//           </div>

//           <div className=" flex justify-center items-center gap-2">

//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setShowShareDialog(true)}
//               className="flex justify-center items-center gap-2 h-7">
//               <Users className="h-4 w-4 text-[#B4B4B4]" />
//               <p className='text-[#B4B4B4] text-sm font-medium truncate block'>Share</p>
//             </Button>

//             <X className="h-4 w-4 text-[#B4B4B4]" onClick={() => back()} />
//           </div>

//         </div>
//         <SidebarProvider className=''>
//           <div className="w-full flex h-full dark:bg-transparent">
//             <Sidebar className='!bg-transparent'>
//               <SidebarContent>
//                 <SidebarGroup>
//                   <SidebarGroupLabel></SidebarGroupLabel>
//                   <SidebarGroupContent>
//                     <SidebarMenu>
//                       <div className=" border-b dark:border-[#333]">
//                         <div className="flex items-center justify-between mb-1">
//                           <h2 className="font-semibold truncate text-md">{workspace?.name}</h2>
//                           <div className="flex justify-center items-center gap-2">
//                             <div className="relative flex items-center pr-2">
//                               <AnimatePresence mode="wait">
//                                 {!isOpen ? (
//                                   <motion.button
//                                     key="search-icon"
//                                     initial={{ opacity: 0, scale: 0.8 }}
//                                     animate={{ opacity: 1, scale: 1 }}
//                                     exit={{ opacity: 0, scale: 0.8 }}
//                                     transition={{ duration: 0.15 }}
//                                     onClick={() => setIsOpen(true)}
//                                     className="p-1 hover:bg-gray-100 hover:dark:bg-[#181818] rounded-sm transition-colors"
//                                     aria-label="Open search"
//                                   >
//                                     <Search className="h-4 w-4 text-gray-500" />
//                                   </motion.button>
//                                 ) : (
//                                   <motion.div
//                                     key="search-input"
//                                     initial={{ width: 40, opacity: 0 }}
//                                     animate={{ width: 240, opacity: 1 }}
//                                     exit={{ width: 40, opacity: 0 }}
//                                     transition={{ duration: 0.2, ease: "easeOut" }}
//                                     className="relative overflow-hidden pr-2"
//                                   >
//                                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//                                     <Input
//                                       ref={inputRef}
//                                       placeholder="Search pages..."
//                                       value={searchQuery}
//                                       onChange={(e) => setSearchQuery(e.target.value)}
//                                       className="w-full pl-9 pr-8 border dark:border-[#333] focus:outline-none focus-visible:ring-0 "
//                                     />
//                                     {searchQuery && (
//                                       <button
//                                         onClick={() => setSearchQuery("")}
//                                         className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
//                                       >
//                                         <X className="h-3 w-3 text-gray-400" />
//                                       </button>
//                                     )}
//                                   </motion.div>
//                                 )}
//                               </AnimatePresence>
//                             </div>
//                             <SidebarTrigger className="h-4 w-4 mt-0 z-50 " />
//                           </div>
//                         </div>
//                       </div>
//                       <SidebarMenuItem>
//                         {renderPageTree(pages) || "no pages found"}
//                       </SidebarMenuItem>
//                       <SidebarMenuItem>
//                         <SidebarMenuButton className="w-full justify-start" onClick={() => createNewPage()}>
//                           <Plus className="mr-1 h-4 w-4" />
//                           Add Page
//                         </SidebarMenuButton>
//                       </SidebarMenuItem>
//                     </SidebarMenu>
//                   </SidebarGroupContent>
//                 </SidebarGroup>
//               </SidebarContent>
//             </Sidebar>
//             <div className="flex-1 w-full rounded-md  dark:bg-[#111111] bg-[#FFFFFF] h-[92vh]">
//               <div className=" relative group">
//                 <SidebarAwareTrigger pageCount={renderPageTree(pages).length} />
//               </div>
//               <Editor
//                 page={page}
//                 onUpdate={updatePage}
//                 workspaceId={workspaceId as string}
//               />
//             </div>
//           </div>
//         </SidebarProvider>
//       </div>
//       <Modal open={showShareDialog} onOpenChange={setShowShareDialog}>
//         <ModalBody className="!max-w-[30%] !min-h-50% !h-[50%] !max-h-[50%] dark:bg-neutral-900 !w-[36%]">
//           <ModalContent>
//             <ModalHeader>
//               <ModalTitle>Share this page</ModalTitle>
//               <ModalDescription>
//                 Anyone with the link can view this page
//               </ModalDescription>
//             </ModalHeader>
//             <div className="space-y-4 mt-5">
//               <div className="flex items-center !gap-x-2">
//                 <Switch id="public-access" />
//                 <Label htmlFor="public-access">Allow public access</Label>
//               </div>
//               <div className="flex items-center !gap-x-2">
//                 <Switch id="allow-comments" />
//                 <Label htmlFor="allow-comments">Allow comments</Label>
//               </div>
//               <div className="flex items-center !gap-x-2">
//                 <Switch id="allow-editing" />
//                 <Label htmlFor="allow-editing">Allow editing</Label>
//               </div>
//             </div>
//           </ModalContent>
//           <ModalFooter className='flex gap-2'>
//             <Button variant="outline" onClick={() => setShowShareDialog(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleShare} className='bg-[#6347EA] text-[#eee]'>
//               Copy link
//             </Button>
//           </ModalFooter>
//         </ModalBody>
//       </Modal>
//     </>
//   )
// }

// function SidebarAwareTrigger({
//   pageCount,
// }: {
//   pageCount: number
// }) {
//   const { open } = useSidebar()
//   return (
//     <div className="">
//       {open ? (
//         // Sidebar is open — trigger already visible inside sidebar, show nothing here
//         null
//       ) : (
//         // Sidebar is closed — show trigger with page count
//         <SidebarTrigger className="z-50 absolute top-3 left-3 !w-fit !px-1 flex justify-center items-center border dark:border-[#232323] dark:bg-[#111] hover:bg-red-500">
//           <div className="text-sm text-[#B4B4B4] flex justify-center items-center gap-1">
//             <FileText className="h-3 w-4" />
//             <p>{pageCount}</p>
//             <p>Pages</p></div>
//         </SidebarTrigger>
//       )}

//     </div>
//   )
// }

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import Mainsidebar from '@/components/ui/mainSideBar';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import CircularText from '@/components/ui/CircularTextLoader';
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/doc-components/Sidebar';
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import Image from 'next/image';
import { Users } from '@/components/animate-ui/icons/users';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalDescription,
  ModalTitle,
} from '@/components/ui/animated-modal';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Editor from '@/components/Editor';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Page {
  id: string;
  title: string;
  content?: any;
  emoji?: string;
  coverImage?: string;
  workspaceId?: string;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
  parentId?: string;
  children?: Page[];
  workspace?: { name: string };
}

interface AnimatedSearchProps {
  isOpen: boolean;
  searchQuery: string;
  inputRef: React.RefObject<HTMLInputElement>;
  onOpen: () => void;
  onQueryChange: (v: string) => void;
  onClear: () => void;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// ─── PageTreeItem ─────────────────────────────────────────────────────────────
// Extracted to fix jsx-max-depth violations at lines 618, 629, 630, 642.
// All behaviour is identical to the original renderPageTree inner JSX.

interface PageTreeItemProps {
  page: Page;
  level: number;
  isExpanded: boolean;
  isActive: boolean;
  workspaceId: string;
  currentPageId?: string | string[];
  onNavigate: (pageId: string) => void;
  onToggleExpanded: (pageId: string) => void;
  onCreateSubpage: (parentId: string) => void;
  onDelete: (pageId: string) => void;
  renderChildren: (pages: Page[], level: number) => React.ReactNode;
}

function PageTreeItem({
  page,
  level,
  isExpanded,
  isActive,
  onNavigate,
  onToggleExpanded,
  onCreateSubpage,
  onDelete,
  renderChildren,
}: PageTreeItemProps) {
  const hasChildren = page.children && page.children.length > 0;

  return (
    <div key={page.id}>
      <div
        className={`group flex items-center py-1 px-2 hover:dark:bg-[#333] rounded-sm cursor-pointer ${isActive ? '' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto w-4 mr-1"
            onClick={e => { e.stopPropagation(); onToggleExpanded(page.id); }}
          >
            {isExpanded
              ? <ChevronDown className="h-3 w-3" />
              : <ChevronRight className="h-3 w-3" />}
          </Button>
        ) : (
          <div className="w-4 mr-1" />
        )}

        {/* Page title row */}
        <div
          className="flex-1 flex items-center min-w-0"
          onClick={() => onNavigate(page.id)}
        >
          <div className="mr-2 text-sm">
            {page.emoji || <FileText className="h-4 w-4 text-gray-400" />}
          </div>
          <span className="truncate text-sm">{page.title}</span>
        </div>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 p-1 h-auto"
              onClick={e => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCreateSubpage(page.id)}>
              <Plus className="mr-2 h-4 w-4" />
              Add subpage
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(page.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Recursive children */}
      {hasChildren && isExpanded && (
        <div>{renderChildren(page.children!, level + 1)}</div>
      )}
    </div>
  );
}


function AnimatedSearch({
  isOpen, searchQuery, inputRef, onOpen, onQueryChange, onClear,
}: AnimatedSearchProps) {
  return (
    <div className="relative flex items-center pr-2">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="search-icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={onOpen}
            className="p-1 hover:bg-gray-100 hover:dark:bg-[#181818] rounded-sm transition-colors"
            aria-label="Open search"
          >
            <Search className="h-4 w-4 text-gray-500" />
          </motion.button>
        ) : (
          <motion.div
            key="search-input"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative overflow-hidden pr-2"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Search pages..."
              value={searchQuery}
              onChange={e => onQueryChange(e.target.value)}
              className="w-full pl-9 pr-8 border dark:border-[#333] focus:outline-none focus-visible:ring-0"
            />
            {searchQuery && (
              <button type="button"
                onClick={onClear}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SidebarAwareTrigger ──────────────────────────────────────────────────────

function SidebarAwareTrigger({ pageCount }: { pageCount: number }) {
  const { open } = useSidebar();
  if (open) return null;
  return (
    <SidebarTrigger className="z-50 absolute top-3 left-3 !w-fit !px-1 flex justify-center items-center border dark:border-[#232323] dark:bg-[#111] hover:bg-red-500">
      <div className="text-sm text-[#B4B4B4] flex justify-center items-center gap-1">
        <FileText className="h-3 w-4" />
        <p>{pageCount}</p>
        <p>Pages</p>
      </div>
    </SidebarTrigger>
  );
}

// ─── DocModalView (main page) ─────────────────────────────────────────────────

export default function DocModalView() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { push, back } = router;
  const { workspaceId, pageId, currentPageId } = router.query;

  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [workspace, setWorkspace] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!pageId || !workspaceId || !session) return;
    setLoading(true);
  }, [pageId, workspaceId, session]);

  useEffect(() => {
    const { workspaceId, pageId } = router.query;
    if (!pageId || !workspaceId || !session) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/pages/${pageId}`)
      .then(res => res.json())
      .then(data => { if (!cancelled) setPage(data); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [pageId, workspaceId]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        if (searchQuery === '') setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); setSearchQuery(''); }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, searchQuery]);

  useEffect(() => {
    if (workspaceId) { fetchWorkspace(); fetchPages(); }
  }, [workspaceId]);

  // ── Data fetchers ──────────────────────────────────────────────────────────

  const fetchWorkspace = async () => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (res.ok) setWorkspace(await res.json());
    } catch { console.error('Failed to fetch workspace'); }
  };

  const fetchPages = async () => {
    try {
      const res = await fetch(`/api/pages?workspaceId=${workspaceId}&tree=true`);
      if (res.ok) setPages(await res.json());
    } catch { console.error('Failed to fetch pages'); }
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const updatePage = async (updates: Partial<Page>) => {
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) setPage(await res.json());
      else throw new Error('Failed to update page');
    } catch { toast.error('Failed to save changes'); }
  };

  const createNewPage = async (parentId?: string) => {
    try {
      const res = await fetch('/api/pages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, parentId, title: 'Doc' }),
      });
      if (res.ok) {
        const newPage = await res.json();
        await fetchPages();
        push(`/workspace/${workspaceId}/page/${newPage.id}`);
      } else throw new Error('Failed to create page');
    } catch { toast.error('Failed to create page'); }
  };

  const deletePage = async (targetPageId: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/pages/${targetPageId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPages();
        if (currentPageId === targetPageId) push(`/workspace/${workspaceId}`);
        toast.success('Page deleted successfully');
      } else throw new Error('Failed to delete page');
    } catch { toast.error('Failed to delete page'); }
  };

  const handleShare = async () => {
    try {
      const res = await fetch(`/api/pages/${pageId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'VIEW' }),
      });
      if (res.ok) {
        const data = await res.json();
        navigator.clipboard.writeText(data.shareUrl);
        toast.success('Share link copied to clipboard!');
      }
    } catch { toast.error('Failed to create share link'); }
    setShowShareDialog(false);
  };

  const toggleExpanded = (targetPageId: string) => {
    const next = new Set(expandedPages);
    if (next.has(targetPageId)) next.delete(targetPageId);
    else next.add(targetPageId);
    setExpandedPages(next);
  };

  // ── Page tree renderer ─────────────────────────────────────────────────────

  const renderPageTree = (pageList: Page[], level = 0): React.ReactNode => {
    return pageList.map(p => (
      <PageTreeItem
        key={p.id}
        page={p}
        level={level}
        isExpanded={expandedPages.has(p.id)}
        isActive={currentPageId === p.id}
        workspaceId={workspaceId as string}
        currentPageId={currentPageId}
        onNavigate={id => push(`/workspace/${workspaceId}/page/${id}`)}
        onToggleExpanded={toggleExpanded}
        onCreateSubpage={createNewPage}
        onDelete={deletePage}
        renderChildren={renderPageTree}
      />
    ));
  };

  // ── Loading / not-found guards ─────────────────────────────────────────────

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen max-h-screen min-w-screen w-full flex items-center justify-center">
        <CircularText text="CONFERIO*CALLS*" onHover="speedUp" spinDuration={5} className="custom-class" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-[6.6rem] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
          <p className="text-gray-600">The page you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const pageTreeNodes = renderPageTree(pages);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="bg-[#f1f1f1] dark:bg-[#222222] w-full px-2 border !rounded-lg dark:!border-[#333232] h-screen max-h-screen !overflow-y-hidden">

        {/* ── Top bar ── */}
        <div className="h-10 flex justify-between items-center w-full px-2">
          <div className="flex justify-start items-center gap-0.5 !z-[9999]">
            <div
              onClick={() => push(`/workspace/${workspaceId}`)}
              className="flex-1 flex items-center min-w-0 cursor-pointer"
            >
              <div className="mr-1 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <span
                onClick={() => push(`/workspace/${workspaceId}`)}
                className="dark:text-[#B4B4B4] text-sm font-medium truncate block"
              >
                {workspace?.name}
              </span>
            </div>
            <div className="text-gray-400">/</div>
            <div className="flex-1 flex items-center">
              <div className="mr-1 text-sm">
                {page.emoji || <FileText className="h-4 w-4 text-gray-400" />}
              </div>
              <span className="dark:text-[#B4B4B4] text-sm font-medium truncate block">{page.title}</span>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareDialog(true)}
              className="flex justify-center items-center gap-2 h-7"
            >
              <Users className="h-4 w-4 text-[#B4B4B4]" />
              <p className="text-[#B4B4B4] text-sm font-medium truncate block">Share</p>
            </Button>
            <X className="h-4 w-4 text-[#B4B4B4]" onClick={() => back()} />
          </div>
        </div>

        {/* ── Sidebar + editor ── */}
        <SidebarProvider>
          <div className="w-full flex h-full dark:bg-transparent">
            <Sidebar className="!bg-transparent">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel />
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <div className="border-b dark:border-[#333]">
                        <div className="flex items-center justify-between mb-1">
                          <h2 className="font-semibold truncate text-md">{workspace?.name}</h2>
                          <div className="flex justify-center items-center gap-2">
                            {/* Animated search ── */}
                            <AnimatedSearch
                              isOpen={isOpen}
                              searchQuery={searchQuery}
                              inputRef={inputRef}
                              onOpen={() => setIsOpen(true)}
                              onQueryChange={setSearchQuery}
                              onClear={() => setSearchQuery('')}
                            />
                            <SidebarTrigger className="h-4 w-4 mt-0 z-50" />
                          </div>
                        </div>
                      </div>

                      <SidebarMenuItem>
                        {pageTreeNodes || 'no pages found'}
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="w-full justify-start" onClick={() => createNewPage()}>
                          <Plus className="mr-1 h-4 w-4" />
                          Add Page
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>

            <div className="flex-1 w-full rounded-md dark:bg-[#111111] bg-[#FFFFFF] h-[92vh]">
              <div className="relative group">
                <SidebarAwareTrigger pageCount={Array.isArray(pageTreeNodes) ? pageTreeNodes.length : 0} />
              </div>
              <Editor page={page} onUpdate={updatePage} workspaceId={workspaceId as string} />
            </div>
          </div>
        </SidebarProvider>
      </div>

      {/* ── Share modal ── */}
      <Modal open={showShareDialog} onOpenChange={setShowShareDialog}>
        <ModalBody className="!max-w-[30%] !min-h-50% !h-[50%] !max-h-[50%] dark:bg-neutral-900 !w-[36%]">
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Share this page</ModalTitle>
              <ModalDescription>Anyone with the link can view this page</ModalDescription>
            </ModalHeader>
            <div className="space-y-4 mt-5">
              <div className="flex items-center !gap-x-2">
                <Switch id="public-access" />
                <Label htmlFor="public-access">Allow public access</Label>
              </div>
              <div className="flex items-center !gap-x-2">
                <Switch id="allow-comments" />
                <Label htmlFor="allow-comments">Allow comments</Label>
              </div>
              <div className="flex items-center !gap-x-2">
                <Switch id="allow-editing" />
                <Label htmlFor="allow-editing">Allow editing</Label>
              </div>
            </div>
          </ModalContent>
          <ModalFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>Cancel</Button>
            <Button onClick={handleShare} className="bg-[#6347EA] text-[#eee]">Copy link</Button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </>
  );
}