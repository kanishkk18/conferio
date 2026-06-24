// 'use client'

// import { useRef, useState, useEffect } from 'react'
// import { FileText, File, MoreHorizontal, Trash2, Star, UserPlus } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { toast } from 'sonner'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/animate-ui/components/radix/dropdown-menu'
// import { UserCheck, Clock } from 'lucide-react'
// import { useRouter } from 'next/router'
// import {
//   Tabs,
//   TabsContent,
//   TabsContents,
//   TabsList,
//   TabsTrigger,
// } from '@/components/animate-ui/components/animate/tabs';

// interface Page {
//   id: string
//   title: string
//   emoji?: string
//   coverImage?: string
//   workspace: { name: string }
//   updatedAt: string
//   _count?: { favoritedBy: number }
// }

// interface AssignedPage {
//   id: string
//   title: string
//   emoji?: string
//   author: { name: string; image?: string }
//   workspace: { name: string }
//   assignedTo: {
//     team: { name: string }
//     user: { name: string }
//   }
//   updatedAt: string
// }




// export default function CreatedAssigned () {

//   return(
//        <div className="dark:bg-[#111111] bg-[#fff] h-full px-4 py-2.5 rounded-xl border dark:border-[#222222]">
//       <div className="flex items-center justify-between mb-2">
//        <TabsList className='dark:bg-[#191919] !py-0.5 !h-fit'>
//                   <TabsTrigger value="account" className='dark:bg-[#111] dark:text-[#B4B4B4]'> <FileText className='h-3 w-3 '/> Created</TabsTrigger>
//                   <TabsTrigger value="password" className='dark:bg-[#111] dark:text-[#B4B4B4]' > <UserCheck className="size-3" /> Assigned</TabsTrigger>
//                 </TabsList>
//         <button type="button"  className="text-muted-foreground hover:text-foreground text-xs">
//           See all 
//         </button>
//       </div>
//       <TabsContents className='overflow-y-auto'>
//       <TabsContent value="account" className="gap-y-1">
//          <CreatedByMeSection />
//       </TabsContent>
//        <TabsContent value="password" className='gap-y-1'>
//            <AssignedToMeSection />
//          </TabsContent>
//       </TabsContents>
//     </div>
   
//   )
// }

//  function CreatedByMeSection() {
//   const [pages, setPages] = useState<Page[]>([])
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()
//   const { workspaceId } = router.query

//   const hasFetched = useRef(false);
//  useEffect(() => {
//     if (!hasFetched.current) {
//       hasFetched.current = true;
//       fetchCreatedByMe();
//     }
//   }, []);

//   const fetchCreatedByMe = async () => {
//     try {
//       const response = await fetch('/api/pages/created-by-me')
//       if (response.ok) {
//         const data = await response.json()
//         setPages(data)
//       }
//     } catch (error) {
//       console.error('Failed to fetch created pages')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleFavorite = async (pageId: string) => {
//     try {
//       const response = await fetch('/api/pages/favorites', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ pageId }),
//       })

//       if (response.ok) {
//         toast.success('Added to favorites')
//       }
//     } catch (error) {
//       toast.error('Failed to add favorite')
//     }
//   }

//   const handleDelete = async (pageId: string) => {
//     if (!confirm('Are you sure you want to delete this page?')) return

//     try {
//       const response = await fetch(`/api/pages/${pageId}`, {
//         method: 'DELETE',
//       })

//       if (response.ok) {
//         setPages(pages.filter(p => p.id !== pageId))
//         toast.success('Page deleted')
//       }
//     } catch (error) {
//       toast.error('Failed to delete page')
//     }
//   }

//   if (loading) {
//     return <div className="py-4 text-sm text-gray-500">Loading&hellip;</div>
//   }

//   if (pages.length === 0) {
//     return (
//       <div className="dark:bg-[#111111] bg-[#fff] px-4 py-3">
//         <div className="flex flex-col items-center justify-center py-8">
//           <div className=" rounded flex items-center justify-center mb-3">
//             <FileText className="h-8 w-8 dark:text-[#7D7A75] text-[#201f1f]" />
//           </div>
//           <p className="dark:text-[#7D7A75] text-[#201f1f] text-xs text-center">
//             Pages you create will appear here.
//           </p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <>
//      {pages.slice(0, 4).map((page) => (
//           <div
//             key={page.id}
//             className="!w-full cursor-pointer flex items-center gap-2 py-0 px-2 hover:bg-[#F9F9F9] rounded-md dark:hover:bg-[#222222] transition-colors text-left"
//             onClick={() => router.push(`/workspace/${workspaceId}/page/${page.id}`)}
//           >
            
//             <div className="flex justify-start items-center gap-2">
//               <div className="h-4 w-4 justify-center items-center flex p-0">
//               {page.emoji ? (
//                 <span className="">{page.emoji}</span>
//               ) : (
//                 <FileText className="h-4 w-4 dark:text-[#B4B4B4]" />
//               )}
//             </div>
//             <span className="dark:text-[#B4B4B4] text-sm font-medium truncate bloc">
//                 {page.title}
//               </span>
//               <span className="dark:text-[#6E6E6E] text-[#8D8D8D] text-sm truncate block">
//                 • in {page.workspace.name} • {new Date(page.updatedAt).toLocaleDateString()}
//               </span>
//             </div>
            
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="opacity-0 group-hover:opacity-100 p-0"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <MoreHorizontal className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={(e) => {
//                   e.stopPropagation()
//                   handleFavorite(page.id)
//                 }}>
//                   <Star className="mr-2 h-4 w-4" />
//                   Add to Favorites
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={(e) => {
//                   e.stopPropagation()
//                   router.push(`/workspace/${workspaceId}/page/${page.id}?assign=true`)
//                 }}>
//                   <UserPlus className="mr-2 h-4 w-4" />
//                   Assign to Member
//                 </DropdownMenuItem>
//                 <DropdownMenuItem 
//                   className="text-red-600"
//                   onClick={(e) => {
//                     e.stopPropagation()
//                     handleDelete(page.id)
//                   }}
//                 >
//                   <Trash2 className="mr-2 h-4 w-4" />
//                   Delete
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         ))}
//     </>
//   )
// }


// function AssignedToMeSection() {
//   const [pages, setPages] = useState<AssignedPage[]>([])
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()
//   const { workspaceId } = router.query

//   const hasFetchedAssigned = useRef(false);
//   useEffect(() => {
//     if (!hasFetchedAssigned.current) {
//       hasFetchedAssigned.current = true;
//       fetchAssignedPages();
//     }
//   }, []);

//   const fetchAssignedPages = async () => {
//     try {
//       const response = await fetch('/api/pages/assigned-to-me')
//       if (response.ok) {
//         const data = await response.json()
//         setPages(data)
//       }
//     } catch (error) {
//       console.error('Failed to fetch assigned pages')
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) {
//     return <div className="py-4 text-sm text-gray-500">Loading&hellip;</div>
//   } 

//   if (pages.length === 0) {
//     return (
//       <div className="dark:bg-[#111111] bg-[#fff] px-4 py-3 rounded-xl ">
//         <div className="flex flex-col items-center justify-center py-6">
//           <div className=" rounded flex items-center justify-center mb-2">
//             <UserCheck className="h-8 w-8 dark:text-[#7D7A75] text-[#201f1f]" />
//           </div>
//           <p className="dark:text-[#7D7A75] text-[#201f1f] text-xs text-center">
//             No pages assigned to you yet.
//           </p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <>
//       {pages.slice(0, 4).map((page) => (
//           <div
//             key={page.id}
//             className="!w-full cursor-pointer flex items-center gap-2 py-1 px-2 hover:bg-[#F9F9F9] rounded-md dark:hover:bg-[#222222] transition-colors text-left"
//             onClick={() => router.push(`/workspace/${workspaceId}/page/${page.id}`)}
//           >
//             <div className="h-4 w-4 justify-center items-center flex p-0">
//               {page.emoji ? (
//                 <span className="">{page.emoji}</span>
//               ) : (
//                 <FileText className="h-4 w-4 dark:text-[#B4B4B4]" />
//               )}
//             </div>
//             <div className=" flex gap-1.5 justify-start items-center text-center">

//               <span className="dark:text-[#B4B4B4] text-sm font-medium truncate block">
//                 {page.title.slice(0, 16)}
//               </span>

//               <div className="flex items-center gap-2 dark:text-[#B4B4B4] text-xs font-medium truncate">
//                 <span>From {page.author.name}</span>
//                 <span>•</span>

//                 {/* <span className="flex items-center gap-1 dark:text-[#6E6E6E] text-[#8D8D8D] text-xs truncate">
//                   <Clock className="size-3" />
//                   {new Date(page.updatedAt).toLocaleDateString()}
//                 </span> */}

//               </div>

//               <div className="dark:text-[#6E6E6E] text-[#8D8D8D] text-sm truncate block">
//                 {page.assignedTo.team.name}
//               </div>
//             </div>
//           </div>
//         ))}
//     </>
//   )
// }


'use client'

import { FileText, MoreHorizontal, Trash2, Star, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/router'
import { UserCheck } from 'lucide-react'
import {
  TabsContent, TabsContents, TabsList, TabsTrigger,
} from '@/components/animate-ui/components/animate/tabs'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu'

interface Page {
  id: string
  title: string
  emoji?: string
  workspace: { name: string }
  updatedAt: string
}

interface AssignedPage {
  id: string
  title: string
  emoji?: string
  author: { name: string; image?: string }
  workspace: { name: string }
  assignedTo: { team: { name: string }; user: { name: string } }
  updatedAt: string
}

interface Props {
  createdByMe: Page[]
  assignedToMe: AssignedPage[]
  onDeleteCreated: (pageId: string) => void
}

export default function CreatedAssigned({ createdByMe, assignedToMe, onDeleteCreated }: Props) {
  const router = useRouter()
  const {push} = useRouter()

  const { workspaceId } = router.query

  const handleFavorite = async (pageId: string) => {
    try {
      const res = await fetch('/api/pages/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      })
      if (res.ok) toast.success('Added to favorites')
    } catch {
      toast.error('Failed to add favorite')
    }
  }

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return
    try {
      const res = await fetch(`/api/pages/${pageId}`, { method: 'DELETE' })
      if (res.ok) {
        onDeleteCreated(pageId)
        toast.success('Page deleted')
      }
    } catch {
      toast.error('Failed to delete page')
    }
  }

  return (
    <div className="dark:bg-[#111111] bg-[#fff] h-full px-4 py-2.5 rounded-xl border dark:border-[#222222]">
      <div className="flex items-center justify-between mb-2">
        <TabsList className="dark:bg-[#191919] !py-0.5 !h-fit">
          <TabsTrigger value="account" className=" dark:data-[state=active]:bg-[#111111] dark:text-[#B4B4B4]">
            <FileText className="h-3 w-3" /> Created
          </TabsTrigger>
          <TabsTrigger value="password" className=" dark:data-[state=active]:bg-[#111111] dark:text-[#B4B4B4]">
            <UserCheck className="size-3" /> Assigned
          </TabsTrigger>
        </TabsList>
        <button type="button" className="text-muted-foreground hover:text-foreground text-xs">
          See all
        </button>
      </div>

      <TabsContents className="overflow-y-auto">
        {/* ── Created by me ── */}
        <TabsContent value="account" className="gap-y-1">
          {createdByMe.length === 0 ? (
            <div className="dark:bg-[#111111] bg-[#fff] px-4 py-3">
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-8 w-8 dark:text-[#7D7A75] text-[#201f1f] mb-3" />
                <p className="dark:text-[#7D7A75] text-[#201f1f] text-xs text-center">
                  Pages you create will appear here.
                </p>
              </div>
            </div>
          ) : (
            createdByMe.slice(0, 4).map((page) => (
              <div
                key={page.id}
                className="!w-full cursor-pointer flex items-center gap-2 py-0 px-2 hover:bg-[#F9F9F9] rounded-md dark:hover:bg-[#222222] transition-colors text-left"
                onClick={() => push(`/workspace/${workspaceId}/page/${page.id}`)}
              >
                <div className="flex justify-start items-center gap-2">
                  <div className="h-4 w-4 justify-center items-center flex p-0">
                    {page.emoji
                      ? <span>{page.emoji}</span>
                      : <FileText className="h-4 w-4 dark:text-[#B4B4B4]" />
                    }
                  </div>
                  <span className="dark:text-[#B4B4B4] text-sm font-medium truncate">
                    {page.title}
                  </span>
                  <span className="dark:text-[#6E6E6E] text-[#8D8D8D] text-sm truncate block">
                    • in {page.workspace.name} • {new Date(page.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost" size="sm"
                      className="opacity-0 group-hover:opacity-100 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleFavorite(page.id) }}>
                      <Star className="mr-2 h-4 w-4" /> Add to Favorites
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      push(`/workspace/${workspaceId}/page/${page.id}?assign=true`)
                    }}>
                      <UserPlus className="mr-2 h-4 w-4" /> Assign to Member
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => { e.stopPropagation(); handleDelete(page.id) }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </TabsContent>

        {/* ── Assigned to me ── */}
        <TabsContent value="password" className="gap-y-1">
          {assignedToMe.length === 0 ? (
            <div className="dark:bg-[#111111] bg-[#fff] px-4 py-3 rounded-xl">
              <div className="flex flex-col items-center justify-center py-6">
                <UserCheck className="h-8 w-8 dark:text-[#7D7A75] text-[#201f1f] mb-2" />
                <p className="dark:text-[#7D7A75] text-[#201f1f] text-xs text-center">
                  No pages assigned to you yet.
                </p>
              </div>
            </div>
          ) : (
            assignedToMe.slice(0, 4).map((page) => (
              <div
                key={page.id}
                className="!w-full cursor-pointer flex items-center gap-2 py-1 px-2 hover:bg-[#F9F9F9] rounded-md dark:hover:bg-[#222222] transition-colors text-left"
                onClick={() => push(`/workspace/${workspaceId}/page/${page.id}`)}
              >
                <div className="h-4 w-4 justify-center items-center flex p-0">
                  {page.emoji
                    ? <span>{page.emoji}</span>
                    : <FileText className="h-4 w-4 dark:text-[#B4B4B4]" />
                  }
                </div>
                <div className="flex gap-1.5 justify-start items-center">
                  <span className="dark:text-[#B4B4B4] text-sm font-medium truncate block">
                    {page.title.slice(0, 16)}
                  </span>
                  <span className="flex items-center gap-2 dark:text-[#B4B4B4] text-xs font-medium truncate">
                    From {page.author.name}
                  </span>
                  <span className="dark:text-[#6E6E6E] text-[#8D8D8D] text-sm truncate block">
                    {page.assignedTo.team.name}
                  </span>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </TabsContents>
    </div>
  )
}