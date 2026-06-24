// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { FileText, Star, X } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { toast } from 'sonner'
// import { useRouter } from 'next/router'
// import { ClipboardList } from '@/components/animate-ui/icons/clipboard-list'

// interface FavoritePage {
//   id: string
//   title: string
//   emoji?: string
//   coverImage?: string
//   workspace: { name: string }
//   favoritedAt: string
//   updatedAt: string
// }

// export default function FavoritesSection() {
//   const [favorites, setFavorites] = useState<FavoritePage[]>([])
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()
//   const { workspaceId } = router.query

//   const hasFetched = useRef(false);
//   useEffect(() => {
//     if (!hasFetched.current) {
//       hasFetched.current = true;
//       fetchFavorites();
//     }
//   }, []);

//   const fetchFavorites = async () => {
//     try {
//       const response = await fetch('/api/pages/favorites')
//       if (response.ok) {
//         const data = await response.json()
//         setFavorites(data)
//       }
//     } catch (error) {
//       console.error('Failed to fetch favorites')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const removeFavorite = async (pageId: string, e: React.MouseEvent) => {
//     e.stopPropagation()
    
//     try {
//       const response = await fetch(`/api/pages/favorites?pageId=${pageId}`, {
//         method: 'DELETE',
//       })

//       if (response.ok) {
//         setFavorites(favorites.filter(f => f.id !== pageId))
//         toast.success('Removed from favorites')
//       }
//     } catch (error) {
//       toast.error('Failed to remove favorite')
//     }
//   }

//   if (loading) {
//     return <div className="py-4 text-sm text-gray-500">Loading&hellip;</div>
//   }

//   if (favorites.length === 0) {
//     return (
//       <div className="dark:bg-[#111111] bg-[#fff] px-4 py-3 rounded-xl border dark:border-[#222222]">
//         <h3 className="text-foreground font-medium text-sm mb-3 flex items-center gap-2">
//           <Star className="size-4 text-yellow-500" />
//           Favorites
//         </h3>
//         <div className="flex flex-col items-center justify-center py-8">
//           <div className="w-12 h-14 bg-secondary rounded flex items-center justify-center mb-3">
//             <Star className="size-5 text-muted-foreground" />
//           </div>
//           <p className="text-muted-foreground text-xs text-center">
//             Your favorited Docs will show here.
//           </p>
//           <p className="text-muted-foreground text-xs text-center mt-1">
//             Click the star icon on any page to add it here.
//           </p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="dark:bg-[#111111] bg-[#fff] px-4 py-3 rounded-xl border dark:border-[#222222]">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-foreground font-medium text-sm flex items-center gap-2">
//           <Star className="size-4 text-yellow-500" />
//           Favorites
//         </h3>
//         <button type="button"  className="text-muted-foreground hover:text-foreground text-xs">
//           {favorites.length} items
//         </button>
//       </div>
//       <div className="space-y-0.5 max-h-64 overflow-y-auto">
//         {favorites.slice(0, 4).map((page) => (
//           <div
//             key={page.id}
//             className="group justify-between hover:bg-secondary !w-full cursor-pointer flex items-center gap-2 py-1 px-2 hover:bg-[#F9F9F9] rounded-md dark:hover:bg-[#222222] transition-colors text-left"
//             onClick={() => router.push(`/workspace/${workspaceId}/page/${page.id}`)}
//           >
//             <div className="flex justify-start items-center gap-2">
//               <div className="h-4 w-4 justify-center items-center flex p-0">
//                 {page.emoji ? (
//                   <span className="text-sm">{page.emoji}</span>
//                 ) : (
//                   <ClipboardList className="h-4 w-4 dark:text-[#B4B4B4]" />
//               )}
//             </div> <span className="dark:text-[#B4B4B4] text-sm font-medium truncate block">
//                 {page.title}
//               </span>
//               <span className="dark:text-[#6E6E6E] text-[#8D8D8D] text-sm truncate block">
//                 • in {page.workspace.name}
//               </span>
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-yellow-500 hover:text-yellow-600"
//               onClick={(e) => removeFavorite(page.id, e)}
//             >
//               <X className="h-3 w-3" />
//             </Button>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }


'use client'

import { FileText, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/router'
import { ClipboardList } from '@/components/animate-ui/icons/clipboard-list'

interface FavoritePage {
  id: string
  title: string
  emoji?: string
  coverImage?: string
  workspace: { name: string }
  favoritedAt: string
  updatedAt: string
}

interface Props {
  favorites: FavoritePage[]
  onRemove: (pageId: string) => void
}

export default function FavoritesSection({ favorites, onRemove }: Props) {
  const router = useRouter()
  const { push } = useRouter()
  const { workspaceId } = router.query

  const removeFavorite = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/pages/favorites?pageId=${pageId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        onRemove(pageId)
        toast.success('Removed from favorites')
      }
    } catch {
      toast.error('Failed to remove favorite')
    }
  }

  if (favorites.length === 0) {
    return (
      <div className="dark:bg-[#111111] bg-[#fff] px-4 py-3 rounded-xl border dark:border-[#222222]">
        <h3 className="text-foreground font-medium text-sm mb-3 flex items-center gap-2">
          <Star className="size-4 text-yellow-500" /> Favorites
        </h3>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-14 bg-secondary rounded flex items-center justify-center mb-3">
            <Star className="size-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-xs text-center">
            Your favorited Docs will show here.
          </p>
          <p className="text-muted-foreground text-xs text-center mt-1">
            Click the star icon on any page to add it here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="dark:bg-[#111111] bg-[#fff] px-4 py-3 rounded-xl border dark:border-[#222222]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-medium text-sm flex items-center gap-2">
          <Star className="size-4 text-yellow-500" /> Favorites
        </h3>
        <button type="button" className="text-muted-foreground hover:text-foreground text-xs">
          {favorites.length} items
        </button>
      </div>
      <div className="space-y-0.5 max-h-64 overflow-y-auto">
        {favorites.slice(0, 4).map((page) => (
          <div
            key={page.id}
            className="group justify-between hover:bg-secondary !w-full cursor-pointer flex items-center gap-2 py-1 px-2 hover:bg-[#F9F9F9] rounded-md dark:hover:bg-[#222222] transition-colors text-left"
            onClick={() => push(`/workspace/${workspaceId}/page/${page.id}`)}
          >
            <div className="flex justify-start items-center gap-2">
              <div className="h-4 w-4 justify-center items-center flex p-0">
                {page.emoji
                  ? <span className="text-sm">{page.emoji}</span>
                  : <ClipboardList className="h-4 w-4 dark:text-[#B4B4B4]" />
                }
              </div>
              <span className="dark:text-[#B4B4B4] text-sm font-medium truncate block">
                {page.title}
              </span>
              <span className="dark:text-[#6E6E6E] text-[#8D8D8D] text-sm truncate block">
                • in {page.workspace.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-yellow-500 hover:text-yellow-600"
              onClick={(e) => removeFavorite(page.id, e)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}