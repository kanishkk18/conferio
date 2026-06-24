

// 'use client';

// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';
// import { useEffect, useRef, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Plus, FileText, File, Search, X } from 'lucide-react';
// import { toast } from 'sonner';
// import { Header } from '@/components/doc-components/Header';
// import Mainsidebar from '@/components/ui/mainSideBar';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { AnimateIcon } from '@/components/animate-ui/icons/icon';
// import { SearchIcon } from '@/components/animate-ui/icons/search';
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
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

// import { motion, AnimatePresence } from "framer-motion";
// import Image from 'next/image';

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
//   emoji?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export default function WorkspaceHome() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const { workspaceId } = query
//   const [searchQuery, setSearchQuery] = useState('');
//   const [workspace, setWorkspace] = useState<Workspace | null>(null);
//   const [recentPages, setRecentPages] = useState<Page[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isExpanded, setIsExpanded] = useState(false)
//   const [activePageId, setActivePageId] = useState("")
//   const hasLoadedRef = useRef(false)

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
//                 <span className="text-foreground font-medium">Docs</span>/
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
//                     className="border-none w-fit shadow-none p-0 select-none focus:ring-0 focus:outline-none bg-transparent"
//                   />
//                 </Button>
//               </AnimateIcon>

//               <Button
//                 onClick={createNewPage}
//                 size="sm"
//                 className="h-8 gap-1.5 bg-[#3530c6] text-primary-foreground hover:bg-primary/90"
//               >
//                 <span className="text-sm font-medium text-white">New Doc</span>
//               </Button>
//             </div>
//           </div>
//           <div className="overflow-auto pb-8 px-6">
//             <div className="flex w-full max-w-screen items-center justify-start gap-[14px] mt-6">
//               {recentPages.length === 0 ? (
//                 <p className="text-gray-500 py-8 text-center">
//                   No pages yet. Create your first page to get started!
//                 </p>
//               ) : (
//                 recentPages.slice(0, 9).map((page) => (
//                   <ExpandableScreenTrigger key={page.id}>
//                     <Card
//                       onClick={() => {
//                         setActivePageId(page.id)
//                         setIsExpanded(true)
//                       }}
//                       className="h-[9.5rem] w-36   p-0 rounded-2xl overflow-hidden cursor-pointer dark:bg-[#191919] dark:border-[#1C1C1C]"
//                     >
//                       <CardContent className="w-full h-16   p-0">
//                         {page.coverImage ? (
//                           <Image
//                             className="h-40 w-full !object-fill"
//                             src={page.coverImage}
//                             alt="cover"
//                             height={1000}
//                             width={1000}
//                           />
//                         ) : (
//                           <Image
//                             className="h-full w-full !object-fill"
//                             src="https://i.pinimg.com/736x/7c/24/13/7c241321ebef19d2a34a9a2aaf2a3504.jpg"
//                             alt="default"
//                             height={1000}
//                             width={1000}
//                           />
//                         )}
//                       </CardContent>
//                       <CardFooter>
//                         <div className="flex-1 min-w-0 space-y-2">
//                           <AnimateIcon animateOnHover>
//                             <div className="-mt-3 h-5 w-5">
//                               {page.emoji || (
//                                 <FileTextIcon className="h-5 w-5 dark:text-[#7D7A75] text-[#201f1f]" />
//                               )}
//                             </div>
//                           </AnimateIcon>
//                           <div className="font-medium truncate">
//                             {page.title || 'Doc'}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {new Date(page.updatedAt).toLocaleDateString('en-US', {
//                               month: 'short',
//                               day: '2-digit',
//                             })}
//                           </div>
//                         </div>
//                       </CardFooter>
//                     </Card>
//                   </ExpandableScreenTrigger>
//                 ))
//               )}
//             </div>
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
//                     <p className="text-gray-500 py-8 text-center">
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

//             </div>


//           </div>
//         </ScrollArea>
//       </div>

//       <ExpandableScreenContent className="bg-[#f1f1f1] dark:bg-[#222222] p-2 border max-h-[95vh] !overflow-y-hidden">
//         <main className="flex-1 w-full flex !overflow-y-hidden">
//           {activePageId && (
//             <DocModalView pageId={activePageId} />
//           )}
//         </main>
//       </ExpandableScreenContent>
//     </ExpandableScreen>
//   );
// }

// function DocModalView({ pageId }: { pageId: string }, { currentPageId }: SidebarProps) {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const { workspaceId } = query
//   const [page, setPage] = useState<Page | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [pages, setPages] = useState<Page[]>([])
//   const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
//   const [workspace, setWorkspace] = useState<any>(null)
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const inputRef = useRef<HTMLInputElement>(null);
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
//   //       push(`/workspace/${workspaceId}`)
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
//       <div className="min-h-screen min-w-screen w-full flex items-center justify-center">
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
//           <h2 className="text-2xl font-bold mb-2">Page not found</h2>
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
//             className={`group flex items-center py-1 px-2 hover:dark:bg-[#262626] rounded-sm cursor-pointer ${isActive ? '' : ''
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
//     <SidebarProvider className=''>
//       <div className="w-full flex h-full dark:bg-[#222222]">
//         <Sidebar className='!bg-transparent'>
//           <SidebarContent>
//             <SidebarGroup>
//               <SidebarGroupLabel></SidebarGroupLabel>
//               <SidebarGroupContent>
//                 <SidebarMenu>
//                   <div className=" border-b ">
//                     <div className="flex items-center justify-between mb-1">
//                       <h2 className="font-semibold truncate text-md">{workspace?.name}</h2>
//                       <div className="flex justify-center items-center gap-2">
//                         <div className="relative flex items-center">
//                           <AnimatePresence mode="wait">
//                             {!isOpen ? (
//                               <motion.button
//                                 key="search-icon"
//                                 initial={{ opacity: 0, scale: 0.8 }}
//                                 animate={{ opacity: 1, scale: 1 }}
//                                 exit={{ opacity: 0, scale: 0.8 }}
//                                 transition={{ duration: 0.15 }}
//                                 onClick={() => setIsOpen(true)}
//                                 className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//                                 aria-label="Open search"
//                               >
//                                 <Search className="h-5 w-5 text-gray-500" />
//                               </motion.button>
//                             ) : (
//                               <motion.div
//                                 key="search-input"
//                                 initial={{ width: 40, opacity: 0 }}
//                                 animate={{ width: 240, opacity: 1 }}
//                                 exit={{ width: 40, opacity: 0 }}
//                                 transition={{ duration: 0.2, ease: "easeOut" }}
//                                 className="relative overflow-hidden"
//                               >
//                                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//                                 <Input
//                                   ref={inputRef}
//                                   placeholder="Search pages..."
//                                   value={searchQuery}
//                                   onChange={(e) => setSearchQuery(e.target.value)}
//                                   className="w-full pl-9 pr-8"
//                                 />
//                                 {searchQuery && (
//                                   <button
//                                     onClick={() => setSearchQuery("")}
//                                     className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
//                                   >
//                                     <X className="h-3 w-3 text-gray-400" />
//                                   </button>
//                                 )}
//                               </motion.div>
//                             )}
//                           </AnimatePresence>
//                         </div>
//                         <SidebarTrigger className="h-4 w-4 mt-0 z-50 " />
//                       </div>
//                     </div>
//                   </div>

//                   <SidebarMenuItem>

//                     {renderPageTree(pages) || "no pages found"}

//                   </SidebarMenuItem>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton className="w-full justify-start" onClick={() => createNewPage()}>
//                       <Plus className="mr-1 h-4 w-4" />
//                       Add Page
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>
//           </SidebarContent>


//         </Sidebar>
//         <div className="flex-1 w-full rounded-md  dark:bg-[#111111] bg-[#FFFFFF] h-[92vh]">
//           <SidebarTrigger className="z-50 absolute ">
//             {page.parentId}
//           </SidebarTrigger>

//           <Editor
//             page={page}
//             onUpdate={updatePage}
//             workspaceId={workspaceId as string}
//           />
//         </div>
//       </div>
//     </SidebarProvider>
//   )
// }

'use client'

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Search, Star, Archive, Trash2, Share2, MoreHorizontal, Pin } from 'lucide-react';
import { toast } from 'sonner';
// import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import CircularText from '@/components/ui/CircularTextLoader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import NoteEditor from '@/components/NoteEditor';

interface Note {
  id: string;
  title: string;
  emoji?: string;
  content?: any;
  isArchived: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
  preview?: string;
  _count?: { blocks: number };
}

export default function NotesPage() {
  const { data: session, status } = useSession();
  const { push } = useRouter()

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [shareNote, setShareNote] = useState<Note | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      push('/');
      return;
    }

    if (session) {
      fetchNotes();
    }
  }, [session, status, activeTab]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      let url = '/api/notes?';

      if (activeTab === 'archived') url += 'archived=true&';
      else if (activeTab === 'favorites') url += 'favorite=true&';
      else url += 'archived=false&';

      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: { blocks: [] },
        }),
      });

      if (response.ok) {
        const note = await response.json();
        setNotes([note, ...notes]);
        openEditor(note);
        toast.success('Note created');
      }
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const deleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter(n => n.id !== noteId));
        toast.success('Note deleted');
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const toggleArchive = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !note.isArchived }),
      });

      if (response.ok) {
        if (activeTab !== 'all') {
          setNotes(notes.filter(n => n.id !== note.id));
        } else {
          setNotes(notes.map(n => n.id === note.id ? { ...n, isArchived: !n.isArchived } : n));
        }
        toast.success(note.isArchived ? 'Note restored' : 'Note archived');
      }
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const toggleFavorite = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const method = note.isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`/api/notes/favorite?noteId=${note.id}`, { method });

      if (response.ok) {
        if (activeTab === 'favorites' && note.isFavorite) {
          setNotes(notes.filter(n => n.id !== note.id));
        } else {
          setNotes(notes.map(n => n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n));
        }
        toast.success(note.isFavorite ? 'Removed from favorites' : 'Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const togglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });

      if (response.ok) {
        fetchNotes();
        toast.success(note.isPinned ? 'Note unpinned' : 'Note pinned');
      }
    } catch (error) {
      toast.error('Failed to pin note');
    }
  };

  // const handleShare = async (note: Note, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   try {
  //     const response = await fetch(`/api/notes/share?noteId=${note.id}`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setShareUrl(data.shareUrl);
  //       setShareNote(note);
  //       navigator.clipboard.writeText(data.shareUrl);
  //       toast.success('Share link copied!');
  //     }
  //   } catch (error) {
  //     toast.error('Failed to create share link');
  //   }
  // };

  const handleShare = async (note: Note) => {
    try {
      const res = await fetch(`/api/notes/share?noteId=${note.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error('Failed to create share');

      const data = await res.json();
      setShareUrl(data.shareUrl);
      setShareNote(note);
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

  const openEditor = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleNoteUpdate = (updatedNote: Note) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? { ...n, ...updatedNote } : n));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularText
          text="NOTES*LOADING*"
          onHover="speedUp"
          spinDuration={5}
          className="custom-class"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative ">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">My Notes</h1>
            <p className="text-muted-foreground mt-1">Personal notes and thoughts</p>
          </div>
          <Button onClick={createNote} className="bg-[#3530c6] hover:bg-[#2a26a0]">
            <Plus className="size-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchNotes()}
              className="pl-9"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No notes found</h3>
            <p className="text-muted-foreground mt-2">
              {activeTab === 'archived'
                ? 'No archived notes'
                : activeTab === 'favorites'
                  ? 'No favorite notes'
                  : 'Create your first note to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                onClick={() => openEditor(note)}
                className={`cursor-pointer hover:shadow-md transition-shadow group ${note.color ? `border-l-4 border-l-${note.color}` : ''
                  }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl">{note.emoji || '📝'}</span>
                      <h3 className="font-semibold truncate">
                        {note.title || 'Untitled'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {note.isPinned && <Pin className="h-3 w-3 text-blue-500 fill-blue-500" />}
                      {note.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {note.preview || 'No content'}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    <span>{note._count?.blocks || 0} blocks</span>
                  </div>
                </CardContent>
                <CardFooter className="p-2 pt-0 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => togglePin(note, e)}
                  >
                    <Pin className={`h-3 w-3 ${note.isPinned ? 'text-blue-500 fill-blue-500' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => toggleFavorite(note, e)}
                  >
                    <Star className={`h-3 w-3 ${note.isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleShare(note, e)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => toggleArchive(note, e)}>
                        <Archive className="mr-2 h-4 w-4" />
                        {note.isArchived ? 'Restore' : 'Archive'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => deleteNote(note.id, e)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
        {/* <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]"></div> */}
        {/* </div>  */}


      </div>

      {/* Note Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          {selectedNote && (
            <NoteEditor
              note={selectedNote}
              onUpdate={handleNoteUpdate}
              onClose={() => setIsEditorOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={!!shareNote} onOpenChange={() => setShareNote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Note</DialogTitle>
            <DialogDescription>
              Anyone with this link can view your note
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-4">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button onClick={() => navigator.clipboard.writeText(shareUrl)}>
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}