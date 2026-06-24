// 'use client'

// import { useQuery } from '@tanstack/react-query'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Clock, Calendar } from 'lucide-react'
// import Link from 'next/link'
// import { useParams } from 'next/navigation'

// export default function PublicProfile() {
//   const params = useParams()
//   const username = params.username as string

//   const { data, isLoading, error } = useQuery({
//     queryKey: ['public-events', username],
//     queryFn: async () => {
//       const response = await fetch(`/api/event/public/${username}`)
//       if (!response.ok) throw new Error('Failed to fetch public events')
//       return response.json()
//     },
//   })

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     )
//   }

//   if (error || !data?.user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">User not found</h1>
//           <p className="text-gray-600">The user you're looking for doesn't exist or has no public events.</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white shadow">
//         <div className="container mx-auto px-4 py-8">
//           <div className="text-center">
//             {data.user.imageUrl && (
//               <img
//                 src={data.user.imageUrl}
//                 alt={data.user.name}
//                 className=" size-24  rounded-full mx-auto mb-4"
//               />
//             )}
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               {data.user.name}
//             </h1>
//             <p className="text-gray-600">
//               Book a meeting with me
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-8">
//         {data.events?.length > 0 ? (
//           <div className="max-w-4xl mx-auto">
//             <h2 className="text-xl font-semibold text-gray-900 mb-6">
//               Available Meeting Types
//             </h2>
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {data.events.map((event: any) => (
//                 <Card key={event.id} className="hover:shadow-lg transition-shadow">
//                   <CardHeader>
//                     <CardTitle className="text-lg">{event.title}</CardTitle>
//                     <CardDescription className="flex items-center gap-4">
//                       <span className="flex items-center gap-1">
//                         <Clock className="size-4" />
//                         {event.duration} min
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <Calendar className="size-4" />
//                         {event.locationType.replace('_', ' ').toLowerCase()}
//                       </span>
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     {event.description && (
//                       <p className="text-gray-600 mb-4 text-sm">
//                         {event.description}
//                       </p>
//                     )}
//                     <Link href={`/${username}/${event.slug}`}>
//                       <Button className="w-full">
//                         Book Meeting
//                       </Button>
//                     </Link>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="text-center py-16">
//             <h2 className="text-xl font-semibold text-gray-900 mb-2">
//               No public events available
//             </h2>
//             <p className="text-gray-600">
//               This user hasn't created any public booking events yet.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// 'use client'

// import { useQuery } from '@tanstack/react-query'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Clock, Calendar, User, CalendarCheck } from 'lucide-react' // Added new icons
// import Link from 'next/link'
// import { useParams, useRouter } from 'next/navigation' // Added useRouter
// import { Skeleton } from '@/components/ui/skeleton' // Added skeleton loading

// export default function PublicProfile() {
//   const params = useParams()
//   const router = useRouter()
//   const username = params.username as string

//   const { data, isLoading, error } = useQuery({
//     queryKey: ['public-profile', username],
//     queryFn: async () => {
//       const response = await fetch(`/api/event/public/${username}`)
//       if (!response.ok) {
//         // Handle 404 specifically
//         if (response.status === 404) {
//           throw new Error('User not found')
//         }
//         throw new Error('Failed to fetch profile data')
//       }
//       return response.json()
//     },
//     retry: false, // Don't retry on failure
//     staleTime: 60 * 1000, // Cache for 1 minute
//   })

//   // Loading state with skeleton UI
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="bg-white shadow">
//           <div className="container mx-auto px-4 py-8">
//             <div className="text-center">
//               <Skeleton className=" size-24  rounded-full mx-auto mb-4" />
//               <Skeleton className="h-8 w-64 mx-auto mb-2" />
//               <Skeleton className="h-5 w-80 mx-auto" />
//             </div>
//           </div>
//         </div>

//         <div className="container mx-auto px-4 py-8">
//           <div className="max-w-4xl mx-auto">
//             <Skeleton className="h-6 w-48 mb-6" />
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {[1, 2, 3].map((i) => (
//                 <Card key={i}>
//                   <CardHeader>
//                     <Skeleton className="h-6 w-3/4 mb-2" />
//                     <div className="flex gap-4">
//                       <Skeleton className="h-4 w-20" />
//                       <Skeleton className="h-4 w-24" />
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     <Skeleton className="h-4 w-full mb-4" />
//                     <Skeleton className="h-4 w-full mb-4" />
//                     <Skeleton className="h-10 w-full" />
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Error state
//   if (error || !data?.user) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
//           <div className="bg-gray-100  size-16  rounded-full flex items-center justify-center mx-auto mb-4">
//             <User className="size-8 text-gray-500" />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
//           <p className="text-gray-600 mb-6">
//             {error?.message || "The user you're looking for doesn't exist or hasn't set up their profile."}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-3 justify-center">
//             <Button onClick={() => router.push('/')}>Go to Homepage</Button>
//             <Button variant="outline" onClick={() => router.refresh()}>
//               Try Again
//             </Button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Profile Header */}
//       <div className="bg-white shadow">
//         <div className="container mx-auto px-4 py-8">
//           <div className="text-center">
//             {data.user.imageUrl ? (
//               <img
//                 src={data.user.imageUrl}
//                 alt={data.user.name}
//                 className=" size-24  rounded-full mx-auto mb-4 border-4 border-white shadow"
//               />
//             ) : (
//               <div className=" size-24  rounded-full bg-gray-200 border-4 border-white flex items-center justify-center mx-auto mb-4 shadow">
//                 <User className=" size-12  text-gray-400" />
//               </div>
//             )}
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               {data.user.name}
//             </h1>
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               {data.user.bio || "Book a meeting with me"}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Events Section */}
//       <div className="container mx-auto px-4 py-8">
//         {data.events?.length > 0 ? (
//           <div className="max-w-6xl mx-auto">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
//                 <CalendarCheck className="size-5" />
//                 <span>Available Meeting Types</span>
//               </h2>
//               <span className="text-sm text-gray-500">
//                 {data.events.length} {data.events.length === 1 ? 'option' : 'options'}
//               </span>
//             </div>

//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {data.events.map((event: any) => (
//                 <Card 
//                   key={event.id} 
//                   className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
//                 >
//                   <CardHeader>
//                     <CardTitle className="text-lg">{event.title}</CardTitle>
//                     <CardDescription className="flex flex-wrap gap-2">
//                       <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
//                         <Clock className=" size-3  " />
//                         {event.duration} min
//                       </span>
//                       <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
//                         <Calendar className=" size-3  " />
//                         {formatLocationType(event.locationType)}
//                       </span>
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="flex-grow">
//                     {event.description && (
//                       <p className="text-gray-600 mb-4 text-sm line-clamp-3">
//                         {event.description}
//                       </p>
//                     )}
//                     <Link href={`/${username}/${event.slug}`}>
//                       <Button className="w-full">
//                         Book Now
//                       </Button>
//                     </Link>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="max-w-2xl mx-auto text-center py-16">
//             <div className="bg-gray-100  size-16  rounded-full flex items-center justify-center mx-auto mb-4">
//               <CalendarCheck className="size-8 text-gray-500" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 mb-2">
//               No Meeting Types Available
//             </h2>
//             <p className="text-gray-600 mb-6">
//               This user hasn't created any public booking options yet.
//             </p>
//             <Button onClick={() => router.push('/')}>
//               Browse Other Profiles
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// // Helper function to format location type
// function formatLocationType(locationType: string) {
//   return locationType
//     .replace(/_/g, ' ')
//     .toLowerCase()
//     .replace(/\b\w/g, char => char.toUpperCase())
// }


'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, User, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useState } from 'react'
import { toast } from "sonner"


interface PublicProfileResponse {
  user: {
    id: string;
    name: string;
    imageUrl?: string;
    bio?: string;
  };
  events: Array<{
    id: string;
    title: string;
    description?: string;
    slug: string;
    duration: number;
    locationType: string;
  }>;
}

export default function PublicProfile() {
  const router = useRouter()
  const { username } = router.query
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (router.isReady) {
      setIsReady(true)
    }
  }, [router.isReady])

  const { data, isLoading, error, refetch } = useQuery<PublicProfileResponse>({
    queryKey: ['public-profile', username],
    queryFn: async () => {
      if (!username || typeof username !== 'string') {
        throw new Error('Username is required')
      }

      const response = await fetch(`/api/event/public/${username}?t=${Date.now()}`)
      const responseData = await response.json()

      console.log('API response:', responseData) // Debug log

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found')
        }
        throw new Error('Failed to fetch profile data')
      }

      return responseData
    },
    retry: false,
    staleTime: 60 * 1000,
    enabled: isReady && !!username && typeof username === 'string',
  })

  // Debug log to check data
  useEffect(() => {
    if (data) {
      console.log('Public profile data:', data)
    }
  }, [data])

  if (!isReady || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Loading skeleton UI */}
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <div className="bg-gray-100  size-16  rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="size-8 text-gray-500" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error.message}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push('/')} aria-label="Go to homepage">
              Go to Homepage
            </Button>
            <Button variant="outline" onClick={() => refetch()} aria-label="Try loading again">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!data?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <div className="bg-gray-100  size-16  rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="size-8 text-gray-500" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">
            The user you're looking for doesn't exist or hasn't set up their profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push('/')} aria-label="Go to homepage">
              Go to Homepage
            </Button>
            <Button variant="outline" onClick={() => refetch()} aria-label="Try loading again">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            {data.user.imageUrl ? (
              <img
                src={data.user.imageUrl}
                alt={data.user.name}
                className=" size-24  rounded-full mx-auto mb-4 border-4 border-white shadow"
              />
            ) : (
              <div className=" size-24  rounded-full bg-gray-200 border-4 border-white flex items-center justify-center mx-auto mb-4 shadow">
                <User className=" size-12  text-gray-400" />
              </div>
            )}
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {data.user.name}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {data.user.bio || "Book a meeting with me"}
            </p>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="container mx-auto px-4 py-8">
        {data.events && data.events.length > 0 ? (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="size-5" />
                <span>Available Meeting Types</span>
              </h2>
              <span className="text-sm text-gray-500">
                {data.events.length} {data.events.length === 1 ? 'option' : 'options'}
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.events.map((event) => (
                <Card
                  key={event.id}
                  className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="flex flex-wrap gap-2">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                        <Clock className=" size-3  " />
                        {event.duration} min
                      </span>
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                        <Calendar className=" size-3  " />
                        {formatLocationType(event.locationType)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {event.description && (
                      <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                        {event.description}
                      </p>
                    )}
                    <Link href={`/${username}/${event.slug}`} passHref>
                      <Button className="w-full">
                        Book Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-gray-100  size-16  rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="size-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Meeting Types Available
            </h2>
            <p className="text-gray-600 mb-6">
              This user hasn't created any public booking options yet.
            </p>
            <Button onClick={() => router.push('/')} aria-label="Browse other profiles">
              Browse Other Profiles
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to format location type
function formatLocationType(locationType: string) {
  return locationType
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase())
}