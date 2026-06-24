

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

// export default function WorkspaceHome() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const { push } = useRouter()
//   const { workspaceId } = router.query
//   const [searchQuery, setSearchQuery] = useState('');
//   const [workspace, setWorkspace] = useState<Workspace | null>(null);
//   const [recentPages, setRecentPages] = useState<Page[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isExpanded, setIsExpanded] = useState(false)
//   const [activePageId, setActivePageId] = useState("")
//   const hasLoadedRef = useRef(false)
//   // const [pages, setPages] = useState<Page[]>([])
//   // const [loadingPages, setLoadingPages] = useState(true)

//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       push('/');
//       return;
//     }

//     if (workspaceId && session) {
//       fetchWorkspace();
//       fetchRecentPages();
//     }
//   }, [workspaceId, session, status, router]);

//   useEffect(() => {
//     if (hasLoadedRef.current) return
//     if (!workspaceId || !session) return

//     hasLoadedRef.current = true
//     fetchWorkspace()
//     fetchRecentPages()
//   }, [workspaceId, session])

//   const fetchWorkspace = async () => {
//     try {
//       const response = await fetch(`/api/workspaces/${workspaceId}`);
//       if (response.ok) {
//         const data = await response.json();
//         setWorkspace(data);
//       } else {
//         push('/docs');
//       }
//     } catch (error) {
//       toast.error('Failed to load workspace');
//       push('/docs');
//     }
//   };

//   const fetchRecentPages = async () => {
//     try {
//       const response = await fetch(
//         `/api/pages?workspaceId=${workspaceId}&limit=10`
//       );
//       if (response.ok) {
//         const data = await response.json();
//         setRecentPages(data);
//       }
//     } catch (error) {
//       console.error('Failed to load recent pages');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createNewPage = async () => {
//     try {
//       const response = await fetch('/api/pages/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           workspaceId,
//           title: 'Doc',
//         }),
//       });

//       if (response.ok) {
//         const page = await response.json();
//         push(`/workspace/${workspaceId}/page/${page.id}`);
//       } else {
//         throw new Error('Failed to create page');
//       }
//     } catch (error) {
//       toast.error('Failed to create page');
//     }
//   };

//   if (status === 'loading' || loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <CircularText
//           text="CONFERIO*CALLS*"
//           onHover="speedUp"
//           spinDuration={5}
//           className="custom-class"
//         />
//       </div>
//     );
//   }

//   return (
//     <ExpandableScreen
//       layoutId="cta-card"
//       defaultExpanded={isExpanded}
//       onExpandChange={setIsExpanded}
//     >
//       <div className="flex dark:bg-[#090909] bg-[#F9F9F9] min-h-screen overflow-x-hidden max-w-screen-2xl w-full">
//         <Mainsidebar />
//         <ScrollArea className="flex-1 flex flex-col overflow-y-auto h-screen">
//           <Header />
//           <div className="flex dark:bg-[#111111] items-center justify-between px-4 py-2 border-b dark:border-[#1C1C1C]">
//             <div className="flex items-center gap-2">
//               <div className="flex items-center gap-1.5 text-sm">
//                 <FileText className="size-4 text-muted-foreground" />
//                 <span className="text-foreground font-medium">Workspace</span>/
//                 {workspace?.name}
//               </div>
//             </div>

//             <div className="flex justify-center items-center gap-2">
//               <AnimateIcon animateOnHover>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="gap-1 bg-transparent dark:border-[#262626] text-foreground hover:bg-muted rounded-lg"
//                 >
//                   <SearchIcon className="w-3.5 h-3.5" />
//                   <Input
//                     placeholder="Search Docs"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="border-none w-fit shadow-none p-0 select-none !focus:ring-0 !focus:outline-none bg-transparent"
//                   />
//                 </Button>
//               </AnimateIcon>
//               <Button
//                 onClick={createNewPage}
//                 size="sm"
//                 className="h-[1.80rem] gap-1.5 bg-[#3530c6] text-primary-foreground hover:bg-primary/90"
//               >
//                 <span className="text-sm font-medium text-white">New Doc</span>
//               </Button>
//             </div>
//           </div>
//           <div className="overflow-auto pb-4 px-4">
            // <div className="flex w-full h-fit max-w-screen items-center justify-start gap-[14px] mt-4">
            //   {recentPages.length === 0 ? (
            //     <p className="text-gray-500 py-8 text-center">
            //       No pages
            //     </p>
            //   ) : (
            //     recentPages.slice(0, 9).map((page) => (
            //       <div key={page.id} className="">
            //         <DocPages pageId={page.id} />
            //       </div>
            //     ))
            //   )}
            // </div>
//             <TemplatesSection />
//             {/* NEW: Three Column Layout with All Sections */}
//             <div className="grid grid-cols-3 gap-4 mt-4">
//               {/* Recent */}
//               <div className="dark:bg-[#111111] bg-[#fff] px-2 py-3 rounded-xl border dark:border-[#222222]">
//                 <div className="flex items-center justify-between mb-4 px-2">
//                   <h3 className="text-foreground font-medium text-sm">Recent</h3>
//                   <button className="text-muted-foreground hover:text-foreground text-xs">
//                     See all
//                   </button>
//                 </div>
//                 <div className="space-y-2">
//                   {recentPages.length === 0 ? (
//                     <p className="text-gray-500 py-4 text-center">
//                       No pages yet. Create your first page!
//                     </p>
//                   ) : (
//                     recentPages.slice(0, 4).map((page) => (
//                       <ExpandableScreenTrigger className='!w-full' key={page.id}>
//                         <div
//                           onClick={() => {
//                             setActivePageId(page.id)
//                             setIsExpanded(true)
//                           }}
//                           className="!w-full cursor-pointer flex items-center gap-2 py-1 px-2 hover:bg-[#F9F9F9] rounded-md dark:hover:bg-[#222222] transition-colors text-left"
//                         >
//                           <div className="h-4 w-4 justify-center items-center flex p-0">
//                             {page.emoji || (
//                               <ClipboardList className="h-4 w-4 dark:text-[#B4B4B4]" />
//                             )}
//                           </div>
//                           <div className="flex justify-center items-center gap-2">
//                             <span className="dark:text-[#B4B4B4] text-sm font-medium truncate block">
//                               {page.title}
//                             </span>
//                             <span className="dark:text-[#6E6E6E] text-[#8D8D8D] text-sm truncate block">
//                               • {new Date(page.updatedAt).toLocaleDateString()}
//                             </span>
//                           </div>
//                         </div>
//                       </ExpandableScreenTrigger>
//                     ))
//                   )}
//                 </div>
//               </div>

//               {/* Favorites - NEW */}
//               <FavoritesSection />
//               <Tabs className='h-full'>
//                 <CreatedAssigned />
//               </Tabs>
//             </div>
//             <WikiSection />
//           </div>
//           <DocsTable />
//         </ScrollArea>
//       </div>
//       <main className="flex-1 w-full flex !overflow-y-hidden">
//         {activePageId && (
//           <DocModalView pageId={activePageId} />
//         )}
//       </main>
//     </ExpandableScreen>
//   );
// }

// function DocModalView({ pageId }: { pageId: string }, { currentPageId }: SidebarProps) {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const { push } = useRouter()

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


//   // useEffect(() => {
//   //   if (!pageId || !workspaceId || !session) return

//   //   setLoading(true)
//   //   fetchPage()
//   // }, [pageId, workspaceId, session])

//   useEffect(() => {
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
//   //     router.push(`/workspace/${workspaceId}`)
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
//       <div className="min-h-screen flex items-center justify-center">
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
//       <ExpandableScreenContent className="bg-[#f1f1f1] dark:bg-[#222222] px-2 border !rounded-lg dark:!border-[#333232] max-h-[96vh] !overflow-y-hidden">
//         <div className="h-10 flex justify-between items-center w-full px-2  pr-6">
//           <div className="flex justify-start items-center gap-0.5">
//             <div
//               className="flex-1 flex items-center min-w-0">
//               <div className="mr-1 text-sm">
//                 <FileText className="h-4 w-4 text-gray-400" />
//               </div>
//               <span className=" dark:text-[#B4B4B4] text-sm font-medium truncate block">{workspace?.name}</span>
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

//           <div className="">

//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setShowShareDialog(true)}
//               className="flex justify-center items-center gap-2 h-7">
//               <Users className="h-4 w-4 text-[#B4B4B4]" />
//               <p className='text-[#B4B4B4] text-sm font-medium truncate block'>Share</p>
//             </Button>
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
//       </ExpandableScreenContent>
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

// function DocPages({ pageId }: { pageId: string }, { currentPageId }: SidebarProps) {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const { workspaceId } = router.query
//   const [page, setPage] = useState<Page | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [pages, setPages] = useState<Page[]>([])
//   const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
//   const [workspace, setWorkspace] = useState<any>(null)
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [isExpanded, setIsExpanded] = useState(false)
//   const [activePageId, setActivePageId] = useState("")


//   // useEffect(() => {
//   //   if (!pageId || !workspaceId || !session) return

//   //   setLoading(true)
//   //   fetchPage()
//   // }, [pageId, workspaceId, session])

//   useEffect(() => {
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


//   if (!page) {
//     return (
//       <div className="min-h-[5rem] flex items-center justify-center">
//         <div className="text-center">

//         </div>
//       </div>
//     )
//   }

//   return (
//     <div>
//       <Card
//         key={pageId}
//         onClick={() => router.push(`/workspace/${workspaceId}/page/${page.id}`)}
//         className="h-[9.5rem] w-36   p-0 rounded-2xl overflow-hidden cursor-pointer dark:bg-[#191919] dark:border-[#1C1C1C]"
//       >
//         <CardContent className="w-full h-16   p-0">

//           {page.coverImage ? (
//             <Image
//               className="h-[4.5rem] max-h-[4.5rem] w-full !object-fill"
//               src={page.coverImage}
//               alt="cover"
//               height={1000}
//               width={1000}
//             />
//           ) : (
//             <Image
//               className="h-[4.5rem] max-h-[4.5rem] w-full !object-fill"
//               src={'https://pub-08af51b0459743828032880ad678a4cf.r2.dev/covers/1777321267309-djCXk3eoQIxHnRfad8iIR.jpg' || 'https://i.pinimg.com/736x/b0/56/0f/b0560faab7952abb1017d685f31b9596.jpg'}
//               alt="cover"
//               height={1000}
//               width={1000}
//             />
//           )}

//         </CardContent>
//         <CardFooter>
//           <div className="flex-1 min-w-0 space-y-2">
//             <AnimateIcon animateOnHover>
//               <div className="-mt-1 h-5 w-5">
//                 {page.emoji || (
//                   <FileTextIcon className="!h-4 !w- dark:text-[#7D7A75] text-[#201f1f]" />
//                 )}
//               </div>
//             </AnimateIcon>
//             <div className="font-medium truncate">
//               {page.title || 'Doc'}
//             </div>
//             <div className="text-sm text-gray-500">
//               {new Date(page.updatedAt).toLocaleDateString('en-US', {
//                 month: 'short',
//                 day: '2-digit',
//               })}
//             </div>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }


'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/doc-components/Header';
import { WikiSection } from '@/components/doc-components/WikiSection';
import DocsTable from '@/components/doc-components/DocsTable';
import Mainsidebar from '@/components/ui/mainSideBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { SearchIcon } from '@/components/animate-ui/icons/search';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ClipboardList } from '@/components/animate-ui/icons/clipboard-list';
import { Input } from '@/components/ui/input';
import { FileTextIcon } from '@/components/ui/file-text';
import TemplatesSection from '@/components/doc-components/DocSections/TemplatesSection';
import FavoritesSection from '@/components/doc-components/DocSections/FavoritesSection';
import { Tabs } from '@/components/animate-ui/components/animate/tabs';
import Image from 'next/image';
import CreatedAssigned from '@/components/doc-components/DocSections/CreatedByMeSection';
import LazyLoader from '@/components/loader/lazyloader';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Page {
  id: string;
  title: string;
  emoji?: string;
  coverImage?: string;
  children?: Page[];
  parentId?: string;
  workspaceId?: string;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
  workspace?: { name: string };
}

export interface WorkspaceMember {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface FavoritePage {
  id: string;
  title: string;
  emoji?: string;
  coverImage?: string;
  workspace: { name: string };
  favoritedAt: string;
  updatedAt: string;
}

export interface AssignedPage {
  id: string;
  title: string;
  emoji?: string;
  author: { name: string; image?: string };
  workspace: { name: string };
  assignedTo: { team: { name: string }; user: { name: string } };
  updatedAt: string;
}

// ─── WorkspaceContext ─────────────────────────────────────────────────────────

export interface WorkspaceData {
  workspace: Workspace | null;
  pages: Page[];
  recentPages: Page[];
  members: WorkspaceMember[];
  favorites: FavoritePage[];
  createdByMe: Page[];
  assignedToMe: AssignedPage[];
  refetchPages: () => Promise<void>;
  refetchFavorites: () => Promise<void>;
  refetchMembers: () => Promise<void>;
  createNewPage: (parentId?: string) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
}

// ─── WorkspaceHome ────────────────────────────────────────────────────────────

export default function WorkspaceHome() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { push } = useRouter();
  const { workspaceId } = router.query;

  const [searchQuery, setSearchQuery] = useState('');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [recentPages, setRecentPages] = useState<Page[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [favorites, setFavorites] = useState<FavoritePage[]>([]);
  const [createdByMe, setCreatedByMe] = useState<Page[]>([]);
  const [assignedToMe, setAssignedToMe] = useState<AssignedPage[]>([]);
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchWorkspace = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (res.ok) setWorkspace(await res.json());
      else push('/docs');
    } catch { push('/docs'); }
  }, [workspaceId, push]);

  // Fetch tree + recent pages. Recent pages are enriched in parallel for coverImage/emoji.
  const fetchPages = useCallback(async () => {
    if (!workspaceId) return;

    // Tree for sidebar
    const treeRes = await fetch(`/api/pages?workspaceId=${workspaceId}&tree=true`);
    if (treeRes.ok) setPages(await treeRes.json());

    // Recent list
    const recentListRes = await fetch(`/api/pages?workspaceId=${workspaceId}&limit=10`);
    if (!recentListRes.ok) return;
    const recentList = await recentListRes.json();

    // Enrich all recent pages in parallel (fast — one batch, not one-by-one)
    const recentFull = await Promise.all(
      recentList.map((p: Page) =>
        fetch(`/api/pages/${p.id}`)
          .then(r => r.ok ? r.json() : p)
          .catch(() => p)
      )
    );
    setRecentPages(recentFull);
  }, [workspaceId]);

  const fetchMembers = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invite`);
      if (res.ok) setMembers(await res.json());
    } catch { }
  }, [workspaceId]);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/pages/favorites');
      if (res.ok) setFavorites(await res.json());
    } catch { }
  }, []);

  const fetchCreatedByMe = useCallback(async () => {
    try {
      const res = await fetch('/api/pages/created-by-me');
      if (res.ok) setCreatedByMe(await res.json());
    } catch { }
  }, []);

  const fetchAssignedToMe = useCallback(async () => {
    try {
      const res = await fetch('/api/pages/assigned-to-me');
      if (res.ok) setAssignedToMe(await res.json());
    } catch { }
  }, []);

  // ── Initial load — everything in parallel, single guard ───────────────────

  useEffect(() => {
    if (status === 'unauthenticated') { push('/'); return; }
    if (!workspaceId || !session || hasFetched.current) return;

    hasFetched.current = true;
    setLoading(true);

    Promise.all([
      fetchWorkspace(),
      fetchPages(),
      fetchMembers(),
      fetchFavorites(),
      fetchCreatedByMe(),
      fetchAssignedToMe(),
    ]).finally(() => setLoading(false));
  }, [workspaceId, session, status]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const createNewPage = useCallback(async (parentId?: string) => {
    try {
      const res = await fetch('/api/pages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, parentId, title: 'Doc' }),
      });
      if (res.ok) {
        const p = await res.json();
        await fetchPages();
        push(`/workspace/${workspaceId}/page/${p.id}`);
      } else throw new Error();
    } catch { toast.error('Failed to create page'); }
  }, [workspaceId, fetchPages, push]);

  const deletePage = useCallback(async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/pages/${pageId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPages();
        toast.success('Page deleted successfully');
      } else throw new Error();
    } catch { toast.error('Failed to delete page'); }
  }, [fetchPages]);

  // ── Shared context object passed to children ───────────────────────────────

  const workspaceData: WorkspaceData = {
    workspace,
    pages,
    recentPages,
    members,
    favorites,
    createdByMe,
    assignedToMe,
    refetchPages: fetchPages,
    refetchFavorites: fetchFavorites,
    refetchMembers: fetchMembers,
    createNewPage,
    deletePage,
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center dark:bg-black justify-center">
        <LazyLoader />
      </div>
    );
  }

  return (
    <>
      <div className="flex dark:bg-[#090909] bg-[#F9F9F9] min-h-screen overflow-x-hidden max-w-screen-2xl w-full">
        <Mainsidebar />
        <ScrollArea className="flex-1 flex flex-col overflow-y-auto h-screen">
          <Header />

          {/* ── Workspace breadcrumb bar ───────────────────────────── */}
          <div className="flex dark:bg-[#111111] items-center justify-between px-4 py-2 border-b dark:border-[#1C1C1C]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-foreground font-medium">Workspace</span>/
                {workspace?.name}
              </div>
            </div>
            <div className="flex justify-center items-center gap-2">
              <AnimateIcon animateOnHover>
                <Button variant="outline" size="sm" className="gap-1 bg-transparent dark:border-[#262626] text-foreground hover:bg-muted rounded-lg">
                  <SearchIcon className="w-3.5 h-3.5" />
                  <Input
                    placeholder="Search Docs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-none w-fit shadow-none p-0 select-none !focus:ring-0 !focus:outline-none bg-transparent"
                  />
                </Button>
              </AnimateIcon>
              <Button
                onClick={() => createNewPage()}
                size="sm"
                className="h-[1.80rem] gap-1.5 dark:bg-white !text-black "
              >
                <span className="text-sm font-medium">New Doc</span>
              </Button>
            </div>
          </div>

          {/* ── Recent pages cards ─────────────────────────────────── */}
          <div className="overflow-auto pb-4 px-4">
            <div className="flex w-full h-fit max-w-screen items-center justify-start gap-[16px] mt-4">
              {recentPages.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">No pages</p>
              ) : (
                recentPages.slice(0, 9).map((page) => (
                  <DocPageCard key={page.id} page={page} />
                ))
              )}
            </div>

            <TemplatesSection />

            {/* ── Three-column layout ────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {/* Recent */}
              <div className="dark:bg-[#111111] bg-[#fff] px-2 py-3 rounded-xl border dark:border-[#222222]">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-foreground font-medium text-sm">Recent</h3>
                  <button type="button" className="text-muted-foreground hover:text-foreground text-xs">See all</button>
                </div>
                <div className="space-y-2">
                  {recentPages.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center">No pages yet. Create your first page!</p>
                  ) : (
                    recentPages.slice(0, 4).map((page) => (
                      <div
                        key={page.id}
                        onClick={() => { push(`/workspace/${workspaceId}/page/${page.id}`); }}
                        className="!w-full cursor-pointer flex items-center gap-2 py-1 px-2 hover:bg-[#F9F9F9] rounded-md dark:hover:bg-[#222222] transition-colors text-left"
                      >
                        <div className="h-4 w-4 justify-center items-center flex p-0">
                          {page.emoji || <ClipboardList className="h-4 w-4 dark:text-[#B4B4B4]" />}
                        </div>
                        <div className="flex justify-center items-center gap-2">
                          <span className="dark:text-[#B4B4B4] text-sm font-medium truncate block">{page.title}</span>
                          <span className="dark:text-[#6E6E6E] text-[#8D8D8D] text-sm truncate block">
                            • {new Date(page.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Favorites */}
              <FavoritesSection
                favorites={favorites}
                onRemove={(pageId) => setFavorites(prev => prev.filter(f => f.id !== pageId))}
              />

              {/* Created / Assigned */}
              <Tabs className="h-full">
                <CreatedAssigned
                  createdByMe={createdByMe}
                  assignedToMe={assignedToMe}
                  onDeleteCreated={(pageId) => {
                    setCreatedByMe(prev => prev.filter(p => p.id !== pageId));
                  }}
                />
              </Tabs>
            </div>

            <WikiSection />
          </div>

          {/* ── DocsTable ─────────────────────────────────────────────── */}
          <DocsTable workspaceData={workspaceData} />
        </ScrollArea>
      </div>
    </>
  );
}

// ─── DocPageCard ──────────────────────────────────────────────────────────────
// Receives the fully populated Page object from the parent (including coverImage).
// No internal fetching — fast and clean.

function DocPageCard({ page }: { page: Page }) {
  const router = useRouter();
  const { workspaceId } = router.query;

  return (
    <Card
      onClick={() => router.push(`/workspace/${workspaceId}/page/${page.id}`)}
      className="h-[9.5rem] w-36 p-0 rounded-2xl overflow-hidden cursor-pointer dark:bg-[#191919] dark:border-[#1C1C1C]"
    >
      <CardContent className="w-full h-16 p-0">
        <Image
          className="h-[5rem] max-h-[5rem] w-full !object-fill"
          src={
            page.coverImage ||
            'https://pub-08af51b0459743828032880ad678a4cf.r2.dev/covers/1777321267309-djCXk3eoQIxHnRfad8iIR.jpg'
          }
          alt="cover"
          height={1000}
          width={1000}
        />
      </CardContent>
      <CardFooter>
        <div className="flex-1 min-w-0 space-y-2">
          <AnimateIcon animateOnHover>
            <div className="-mt-1 h-5 w-5">
              {page.emoji || <FileTextIcon className="!h-4 !w-4 dark:text-[#7D7A75] text-[#201f1f]" />}
            </div>
          </AnimateIcon>
          <div className="font-medium truncate">{page.title || 'Doc'}</div>
          <div className="text-sm text-gray-500">
            {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// ─── DocModalView ─────────────────────────────────────────────────────────────
// Now receives workspaceData (workspace, pages, members) from parent.
// Only fetches the individual page content (one targeted request).

// function DocModalView({
//   pageId,
//   workspaceData,
// }: {
//   pageId: string;
//   workspaceData: WorkspaceData;
// }) {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const { push } = router;
//   const { workspaceId, currentPageId } = router.query;

//   const { workspace, pages, createNewPage, deletePage, refetchPages } = workspaceData;

//   // const [page, setPage] = useState<Page | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [showShareDialog, setShowShareDialog] = useState(false);
//   const { data: page, isLoading: pageLoading } = useQuery({
//     queryKey: ['page', pageId],
//     queryFn: async () => {
//       if (!pageId) return null;
//       const res = await fetch(`/api/pages/${pageId}`);
//       if (!res.ok) throw new Error('Failed to fetch page');
//       return res.json();
//     },
//     enabled: !!pageId,
//   });
//   // Single targeted fetch — only the individual page content
//   // useEffect(() => {
//   //   if (!pageId) return;
//   //   let cancelled = false;
//   //   setLoading(true);

//   //   fetch(`/api/pages/${pageId}`)
//   //     .then(res => res.json())
//   //     .then(data => { if (!cancelled) setPage(data); })
//   //     .finally(() => { if (!cancelled) setLoading(false); });

//   //   return () => { cancelled = true; };
//   // }, [pageId]);

//   useEffect(() => {
//     if (isOpen && inputRef.current) inputRef.current.focus();
//   }, [isOpen]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
//         if (searchQuery === '') setIsOpen(false);
//       }
//     };
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') { setIsOpen(false); setSearchQuery(''); }
//     };
//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//       document.addEventListener('keydown', handleEscape);
//     }
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.removeEventListener('keydown', handleEscape);
//     };
//   }, [isOpen, searchQuery]);

//   const updatePage = async (updates: Partial<Page>) => {
//     try {
//       const res = await fetch(`/api/pages/${pageId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updates),
//       });
//       if (res.ok) await res.json();
//       else throw new Error();
//     } catch { toast.error('Failed to save changes'); }
//   };

//   const handleShare = async () => {
//     try {
//       const res = await fetch(`/api/pages/${pageId}/share`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ type: 'VIEW' }),
//       });
//       if (res.ok) {
//         const data = await res.json();
//         navigator.clipboard.writeText(data.shareUrl);
//         toast.success('Share link copied to clipboard!');
//       }
//     } catch { toast.error('Failed to create share link'); }
//     setShowShareDialog(false);
//   };

//   const toggleExpanded = (id: string) => {
//     setExpandedPages(prev => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   };

//   const renderPageTree = (pageList: Page[], level = 0): React.ReactNode[] => {
//     return pageList.map((p) => {
//       const hasChildren = p.children && p.children.length > 0;
//       const isExpanded = expandedPages.has(p.id);
//       const isActive = currentPageId === p.id;

//       return (
//         <div key={p.id}>
//           <div
//             className={`group flex items-center py-1 px-2 hover:dark:bg-[#333] rounded-sm cursor-pointer`}
//             style={{ paddingLeft: `${level * 16 + 8}px` }}
//           >
//             {hasChildren ? (
//               <button type="button" variant="ghost" size="sm" className="p-0 h-auto w-4 mr-1"
//                 onClick={(e) => { e.stopPropagation(); toggleExpanded(p.id); }}>
//                 {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
//               </Button>
//             ) : <div className="w-4 mr-1" />}

//             <div className="flex-1 flex items-center min-w-0"
//               onClick={() => push(`/workspace/${workspaceId}/page/${p.id}`)}>
//               <div className="mr-2 text-sm">{p.emoji || <FileText className="h-4 w-4 text-gray-400" />}</div>
//               <span className="truncate text-sm">{p.title}</span>
//             </div>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <button type="button" variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 p-1 h-auto"
//                   onClick={(e) => e.stopPropagation()}>
//                   <MoreHorizontal className="h-3 w-3" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={() => createNewPage(p.id)}>
//                   <Plus className="mr-2 h-4 w-4" /> Add subpage
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={() => deletePage(p.id)} className="text-red-600">
//                   <Trash2 className="mr-2 h-4 w-4" /> Delete
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//           {hasChildren && isExpanded && renderPageTree(p.children!, level + 1)}
//         </div>
//       );
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen max-h-screen min-w-screen w-full flex items-center justify-center">
//         <CircularText text="CONFERIO*CALLS*" onHover="speedUp" spinDuration={5} className="custom-class" />
//       </div>
//     );
//   }

//   if (!page) {
//     return (
//       <div className="min-h-[6.6rem] flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
//           <p className="text-gray-600">The page you are looking for does not exist.</p>
//         </div>
//       </div>
//     );
//   }

//   const treeNodes = renderPageTree(pages);

//   return (
//     <>
//       <ExpandableScreenContent className="bg-[#f1f1f1] dark:bg-[#222222] px-2 border !rounded-lg dark:!border-[#333232] max-h-[96vh] !overflow-y-hidden">
//         <div className="h-10 flex justify-between items-center w-full px-2 pr-6">
//           <div className="flex justify-start items-center gap-0.5">
//             <div className="flex-1 flex items-center min-w-0">
//               <div className="mr-1 text-sm"><FileText className="h-4 w-4 text-gray-400" /></div>
//               <span className="dark:text-[#B4B4B4] text-sm font-medium truncate block">{workspace?.name}</span>
//             </div>
//             <div className="text-gray-400">/</div>
//             <div className="flex-1 flex items-center">
//               <div className="mr-1 text-sm">{page.emoji || <FileText className="h-4 w-4 text-gray-400" />}</div>
//               <span className="dark:text-[#B4B4B4] text-sm font-medium truncate block">{page.title}</span>
//             </div>
//           </div>
//           <div>
//             <button type="button" variant="ghost" size="sm" onClick={() => setShowShareDialog(true)}
//               className="flex justify-center items-center gap-2 h-7">
//               <Users className="h-4 w-4 text-[#B4B4B4]" />
//               <p className="text-[#B4B4B4] text-sm font-medium truncate block">Share</p>
//             </Button>
//           </div>
//         </div>

//         <SidebarProvider>
//           <div className="w-full flex h-full dark:bg-transparent">
//             <Sidebar className="!bg-transparent">
//               <SidebarContent>
//                 <SidebarGroup>
//                   <SidebarGroupLabel />
//                   <SidebarGroupContent>
//                     <SidebarMenu>
//                       <div className="border-b dark:border-[#333]">
//                         <div className="flex items-center justify-between mb-1">
//                           <h2 className="font-semibold truncate text-md">{workspace?.name}</h2>
//                           <div className="flex justify-center items-center gap-2">
//                             <div className="relative flex items-center pr-2">
//                               <AnimatePresence mode="wait">
//                                 {!isOpen ? (
//                                   <motion.button key="search-icon"
//                                     initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
//                                     exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}
//                                     onClick={() => setIsOpen(true)}
//                                     className="p-1 hover:bg-gray-100 hover:dark:bg-[#181818] rounded-sm transition-colors"
//                                     aria-label="Open search">
//                                     <Search className="h-4 w-4 text-gray-500" />
//                                   </motion.button>
//                                 ) : (
//                                   <motion.div key="search-input"
//                                     initial={{ width: 40, opacity: 0 }} animate={{ width: 240, opacity: 1 }}
//                                     exit={{ width: 40, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }}
//                                     className="relative overflow-hidden pr-2">
//                                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//                                     <Input ref={inputRef} placeholder="Search pages..."
//                                       value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
//                                       className="w-full pl-9 pr-8 border dark:border-[#333] focus:outline-none focus-visible:ring-0" />
//                                     {searchQuery && (
//                                       <button type="button" onClick={() => setSearchQuery('')}
//                                         className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
//                                         <X className="h-3 w-3 text-gray-400" />
//                                       </button>
//                                     )}
//                                   </motion.div>
//                                 )}
//                               </AnimatePresence>
//                             </div>
//                             <SidebarTrigger className="h-4 w-4 mt-0 z-50" />
//                           </div>
//                         </div>
//                       </div>
//                       <SidebarMenuItem>{treeNodes.length ? treeNodes : 'no pages found'}</SidebarMenuItem>
//                       <SidebarMenuItem>
//                         <SidebarMenuButton className="w-full justify-start" onClick={() => createNewPage()}>
//                           <Plus className="mr-1 h-4 w-4" /> Add Page
//                         </SidebarMenuButton>
//                       </SidebarMenuItem>
//                     </SidebarMenu>
//                   </SidebarGroupContent>
//                 </SidebarGroup>
//               </SidebarContent>
//             </Sidebar>

//             <div className="flex-1 w-full rounded-md dark:bg-[#111111] bg-[#FFFFFF] h-[92vh]">
//               <div className="relative group">
//                 <SidebarAwareTrigger pageCount={treeNodes.length} />
//               </div>
//               <Editor page={page} onUpdate={updatePage} workspaceId={workspaceId as string} />
//             </div>
//           </div>
//         </SidebarProvider>
//       </ExpandableScreenContent>

//       <Modal open={showShareDialog} onOpenChange={setShowShareDialog}>
//         <ModalBody className="!max-w-[30%] !min-h-50% !h-[50%] !max-h-[50%] dark:bg-neutral-900 !w-[36%]">
//           <ModalContent>
//             <ModalHeader>
//               <ModalTitle>Share this page</ModalTitle>
//               <ModalDescription>Anyone with the link can view this page</ModalDescription>
//             </ModalHeader>
//             <div className="space-y-4 mt-5">
//               <div className="flex items-center !gap-x-2">
//                 <Switch id="public-access" /><Label htmlFor="public-access">Allow public access</Label>
//               </div>
//               <div className="flex items-center !gap-x-2">
//                 <Switch id="allow-comments" /><Label htmlFor="allow-comments">Allow comments</Label>
//               </div>
//               <div className="flex items-center !gap-x-2">
//                 <Switch id="allow-editing" /><Label htmlFor="allow-editing">Allow editing</Label>
//               </div>
//             </div>
//           </ModalContent>
//           <ModalFooter className="flex gap-2">
//             <Button variant="outline" onClick={() => setShowShareDialog(false)}>Cancel</Button>
//             <Button onClick={handleShare} className="bg-[#6347EA] text-[#eee]">Copy link</Button>
//           </ModalFooter>
//         </ModalBody>
//       </Modal>
//     </>
//   );
// }