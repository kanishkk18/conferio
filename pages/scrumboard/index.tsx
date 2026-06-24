// // pages/dashboard/index.tsx
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { AppLayout } from 'components/Layout/app-layout';
// import { 
//   Plus, 
//   Clock, 
//   Users, 
//   Layout,

//   Trash2,

// } from 'lucide-react';
// import Link from 'next/link';
// import { formatDistanceToNow } from 'date-fns';
// import { Archive, LayoutDashboard } from 'lucide-react';

// interface Board {
//   id: string;
//   title: string;
//   description: string | null;
//   coverImage: string | null;
//   createdAt: string;
//   updatedAt: string;
//   owner: {
//     id: string;
//     name: string | null;
//     image: string | null;
//   };
//   members: Array<{
//     id: string;
//     role: string;
//     user: {
//       id: string;
//       name: string | null;
//       image: string | null;
//     };
//   }>;
//   _count: {
//     columns: number;
//   };
// }

// export default function Dashboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [isCreating, setIsCreating] = useState(false);
//   const [newBoardTitle, setNewBoardTitle] = useState('');
//   const [showArchived, setShowArchived] = useState(false);

//   const { data: archivedBoards } = useQuery({
//     queryKey: ['boards', 'archived'],
//     queryFn: async () => {
//       const res = await fetch('/api/boards/archived');
//       if (!res.ok) throw new Error('Failed to fetch archived boards');
//       return res.json();
//     },
//     enabled: showArchived,
//   });


//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       push('/login');
//     }
//   }, [status, router]);

//   const { data: boards, isLoading } = useQuery({
//     queryKey: ['boards'],
//     queryFn: async () => {
//       const res = await fetch('/api/boards');
//       if (!res.ok) throw new Error('Failed to fetch boards');
//       return res.json() as Promise<Board[]>;
//     },
//     enabled: !!session,
//   });

//   const createBoardMutation = useMutation({
//     mutationFn: async (title: string) => {
//       const res = await fetch('/api/boards', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title }),
//       });
//       if (!res.ok) throw new Error('Failed to create board');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['boards'] });
//       setIsCreating(false);
//       setNewBoardTitle('');
//     },
//   });

//   const deleteBoardMutation = useMutation({
//     mutationFn: async (boardId: string) => {
//       const res = await fetch(`/api/boards/${boardId}`, {
//         method: 'DELETE',
//       });
//       if (!res.ok) throw new Error('Failed to delete board');
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['boards'] });
//     },
//   });

//   const handleCreateBoard = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (newBoardTitle.trim()) {
//       createBoardMutation.mutate(newBoardTitle.trim());
//     }
//   };

//   if (status === 'loading' || isLoading) {
//     return (
//       <AppLayout>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="animate-pulse space-y-4">
//             <div className="h-8 bg-gray-200 rounded w-1/4"></div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {[...Array(4)].map((_, i) => (
//                 <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </AppLayout>
//     );
//   }

//   return (
//     <AppLayout>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Your Boards</h1>
//             <p className="text-gray-500 mt-1">Manage your projects and tasks</p>
//           </div>
//           <button
//             onClick={() => setIsCreating(true)}
//             className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
//           >
//             <Plus className="size-5" />
//             Create Board
//           </button>
//         </div>

//         {isCreating && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Board</h2>
//               <form onSubmit={handleCreateBoard}>
//                 <input
//                   type="text"
//                   value={newBoardTitle}
//                   onChange={(e) => setNewBoardTitle(e.target.value)}
//                   placeholder="Board title"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
//                   autoFocus
//                 />
//                 <div className="flex justify-end gap-3">
//                   <button
//                     type="button"
//                     onClick={() => setIsCreating(false)}
//                     className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={!newBoardTitle.trim() || createBoardMutation.isPending}
//                     className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {createBoardMutation.isPending ? 'Creating&hellip;' : 'Create'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {boards?.map((board) => (
//             <div
//               key={board.id}
//               className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
//             >
//               <Link href={`/board/${board.id}`}>
//                 <div 
//                   className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative"
//                   style={board.coverImage ? { backgroundImage: `url(${board.coverImage})`, backgroundSize: 'cover' } : {}}
//                 >
//                   <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
//                 </div>
//                 <div className="p-4">
//                   <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{board.title}</h3>
//                   {board.description && (
//                     <p className="text-gray-500 text-sm line-clamp-2 mb-3">{board.description}</p>
//                   )}
//                   <div className="flex items-center justify-between text-sm text-gray-500">
//                     <div className="flex items-center gap-4">
//                       <span className="flex items-center gap-1">
//                         <Layout className="size-4" />
//                         {board._count.columns} columns
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <Users className="size-4" />
//                         {board.members.length}
//                       </span>
//                     </div>
//                     <span className="text-xs">
//                       {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
//                     </span>
//                   </div>
//                 </div>
//               </Link>

//               <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                 <button
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     if (confirm('Are you sure you want to delete this board?')) {
//                       deleteBoardMutation.mutate(board.id);
//                     }
//                   }}
//                   className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm text-red-600 hover:text-red-700 transition-colors"
//                 >
//                   <Trash2 className="size-4" />
//                 </button>
//               </div>
//             </div>
//           ))}

//           {/* Create new board card */}
//           <button
//             onClick={() => setIsCreating(true)}
//             className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
//           >
//             <div className=" size-12  rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center mb-3 transition-colors">
//               <Plus className="size-6 text-gray-400 group-hover:text-indigo-600" />
//             </div>
//             <span className="text-gray-500 group-hover:text-indigo-600 font-medium">Create new board</span>
//           </button>
//         </div>
//       </div>
//     </AppLayout>
//   );
// }


// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import {
//   // Layout,
//   Trash2,
//   Archive,
//   RotateCcw,
//   LayoutIcon,
//   PlusIcon,
// } from 'lucide-react';
// import Layout from '@/components/Layout/Layout';
// import Image from 'next/image';
// import { MagicCard } from '@/components/magicui/magic-card';
// import { useTheme } from 'next-themes';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import Mainsidebar from '@/components/ui/mainSideBar';
// import { Header } from '@/components/doc-components/Header';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { SquareKanban } from '@/components/animate-ui/icons/square-kanban';
// import { AnimateIcon } from '@/components/animate-ui/icons/icon';
// import { Users } from '@/components/animate-ui/icons/users';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from '@/components/animate-ui/components/animate/tooltip';
// import { Trash2Icon } from '@/components/animate-ui/icons/trash-2';
// import { AnimatePresence, motion } from "framer-motion"
// import { GooeyFilter } from "@/components/ui/gooey-filter"
// import { useScreenSize } from "hooks/use-screen-size"

// interface Board {
//   id: string;
//   title: string;
//   description: string | null;
//   coverImage: string | null;
//   isArchived: boolean;
//   createdAt: string;
//   updatedAt: string;
//   owner: {
//     id: string;
//     name: string | null;
//     image: string | null;
//   };
//   members: Array<{
//     id: string;
//     role: string;
//     user: {
//       id: string;
//       name: string | null;
//       image: string | null;
//     };
//   }>;
//   _count: {
//     columns: number;
//   };
// }

// interface TooltipDemoProps {
//   openDelay?: number;
//   closeDelay?: number;
//   side?: 'top' | 'bottom' | 'left' | 'right';
//   sideOffset?: number;
//   align?: 'start' | 'center' | 'end';
//   alignOffset?: number;
// }


// export default function Scrumboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const { push } = useRouter()

//   const queryClient = useQueryClient();
//   const [isCreating, setIsCreating] = useState(false);
//   const [newBoardTitle, setNewBoardTitle] = useState('');
//   const [showArchived, setShowArchived] = useState(false);
//   const { theme } = useTheme();
//   const [activeTab, setActiveTab] = useState(0)
//   const [isGooeyEnabled, setIsGooeyEnabled] = useState(true)
//   const screenSize = useScreenSize()


//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       push('/login');
//     }
//   }, [status, router]);

//   // Active boards query
//   const { data: boards, isLoading } = useQuery({
//     queryKey: ['boards'],
//     queryFn: async () => {
//       const res = await fetch('/api/boards');
//       if (!res.ok) throw new Error('Failed to fetch boards');
//       return res.json() as Promise<Board[]>;
//     },
//     enabled: !!session && !showArchived,
//   });

//   // Archived boards query
//   const { data: archivedBoards, isLoading: isLoadingArchived } = useQuery({
//     queryKey: ['boards', 'archived'],
//     queryFn: async () => {
//       const res = await fetch('/api/boards/archived');
//       if (!res.ok) throw new Error('Failed to fetch archived boards');
//       return res.json() as Promise<Board[]>;
//     },
//     enabled: !!session && showArchived,
//   });

//   const createBoardMutation = useMutation({
//     mutationFn: async (title: string) => {
//       const res = await fetch('/api/boards', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title }),
//       });
//       if (!res.ok) throw new Error('Failed to create board');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['boards'] });
//       setIsCreating(false);
//       setNewBoardTitle('');
//     },
//   });

//   const deleteBoardMutation = useMutation({
//     mutationFn: async (boardId: string) => {
//       const res = await fetch(`/api/boards/${boardId}`, {
//         method: 'DELETE',
//       });
//       if (!res.ok) throw new Error('Failed to delete board');
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['boards'] });
//       queryClient.invalidateQueries({ queryKey: ['boards', 'archived'] });
//     },
//   });

//   const toggleArchiveMutation = useMutation({
//     mutationFn: async ({ boardId, isArchived }: { boardId: string; isArchived: boolean }) => {
//       const res = await fetch(`/api/boards/${boardId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ isArchived }),
//       });
//       if (!res.ok) throw new Error('Failed to update board');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['boards'] });
//       queryClient.invalidateQueries({ queryKey: ['boards', 'archived'] });
//     },
//   });

//   const handleCreateBoard = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (newBoardTitle.trim()) {
//       createBoardMutation.mutate(newBoardTitle.trim());
//     }
//   };

//   const displayBoards = showArchived ? archivedBoards : boards;
//   const isLoadingData = showArchived ? isLoadingArchived : isLoading;

//   if (status === 'loading' || isLoadingData) {
//     return (

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="animate-pulse space-y-4">
//           <div className="h-8 bg-gray-200 rounded w-1/4"></div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
//             ))}
//           </div>
//         </div>
//       </div>

//     );
//   }

//   const TAB_CONTENT = [
//     {
//       title: "Active",
//       files: [
//         "learning-to-meditate.md",
//         "spring-garden-plans.md",
//         "travel-wishlist.md",
//         "new-coding-projects.md",
//       ],
//     },
//     {
//       title: "Archived",
//       files: [
//         "year-in-review.md",
//         "marathon-training-log.md",
//         "recipe-collection.md",
//         "book-reflections.md",
//       ],
//     },

//   ]


//   return (
//     <div className="flex w-full h-full">
//       <Mainsidebar />

//       {displayBoards && displayBoards.length > 0 ? (
//         <Layout>
//           <GooeyFilter
//             id="gooey-filter"
//             strength={screenSize.lessThan("sm") ? 10 : 10}
//           />

//           <div className="w-full h-full overflow-y-auto">
//             <Header />

//             <div className="flex flex-col justify-start !px-2 py-0 gap-0 mt-2 items-start w-full min-h-[92vh] !max-h-[93vh] relative">
//               <div
//                 className="absolute inset-0"
//                 style={{ filter: isGooeyEnabled ? "url(#gooey-filter)" : "none" }}
//               >
//                 <div className="flex w-full max-w-sm ml-6">
//                   {TAB_CONTENT.map((_, index) => (
//                     <div key={` ${ index }`} className="relative bg-[#111] ml-6 flex-1 h-8 md:h-10">
//                       {activeTab === index && (
//                         <motion.div
//                           layoutId="active-tab"
//                           className="absolute inset-0 bg-blue-500"
//                           transition={{
//                             type: "spring",
//                             bounce: 0.0,
//                             duration: 0.4,
//                           }}
//                         />
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 {/* Content panel */}

//                 <main className="relative p-[6px] bg-gradient-to-b from-[#3793FF]/80 to-[#0017E4]/90 w-full max-w-[95vw] mx-auto !min-h-[85vh] !max-h-[85vh] !overflow-hidden rounded-xl">
//                   <div className="bg-[#FFF] dark:bg-[#111] w-full box-shadow dark:shadow-none rounded-2xl m-0 !min-h-[100%] !h-[83.2vh] px-4 py-5 text-center border-b border-r dark:border-[#262626] font-jakarta text-lg text-mid-grey">

//                     <div className="flex h-full items-center justify-center w-full">

//                       <div className="max-h-[95%] h-[95%] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-0 px-4 w-full">

//                         {!showArchived && (
//                           <Card className="h-52 dark:bg-[#1e1e1f] bg-[#F9F9FA] w-64 p-0 overflow-hidden border-none shadow-sm rounded-lg">
//                             <MagicCard
//                               gradientColor={
//                                 theme === 'dark' ? '' : ''
//                               }
//                               className="p-0 bg-transparent h-full"
//                             >
//                               <CardContent className="flex flex-col space-y-4 p-2 bg-transparent boder-none overflow-hidden h-full w-full ">
//                                 <Image
//                                   src="https://i.pinimg.com/1200x/f2/be/85/f2be854e748d3557367ebd2eaebfafee.jpg"
//                                   alt="Add Board"
//                                   width={1000}
//                                   height={1000}
//                                   className="object-cover h-[9rem] w-full rounded-lg transition-transform duration-300 group-hover:scale-105"
//                                 />
//                                 <div className=" flex justify-center items-center ">
//                                   <Button
//                                     onClick={() => setIsCreating(true)}
//                                     variant="default"
//                                     size="sm"
//                                     className="w-full hover:bg-[#5C47CD] text-white dark:text-[#191919] bg-[#5C47CD] dark:bg-[#EEE]"
//                                   >
//                                     Create Board
//                                   </Button>
//                                 </div>
//                               </CardContent>
//                             </MagicCard>
//                           </Card>)}


//                         {displayBoards?.map((board) => (
//                           <div
//                             key={board.id}
//                             className="group relative hover:shadow-md h-fit rounded-lg transition-all duration-200 "
//                           >
//                             <Card className="h-52 dark:bg-[#1e1e1f] bg-[#F9F9FA] w-64 p-0 overflow-hidden border-none rounded-lg">
//                               <CardContent className="flex flex-col !gap-y-4 p-2 bg-transparent boder-none overflow-hidden h-fit w-full ">

//                                 <div
//                                   className=" bg-gradient-to-br from-[#3793FF] to-[#0017E4] relative h-[9rem] w-full rounded-lg transition-transform duration-300 group-hover:scale-105"
//                                   style={board.coverImage ? {
//                                     backgroundImage: `url(${board.coverImage})`,
//                                     backgroundSize: 'cover',
//                                     backgroundPosition: 'center'
//                                   } : {}}
//                                 >
//                                   {/* <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div> */}
//                                   {!board.coverImage && (
//                                     <div className="absolute inset-0 flex items-center justify-center">
//                                       <LayoutIcon className="size-8 text-white/50" />
//                                     </div>
//                                   )}
//                                 </div>


//                                 <div className=" flex justify-center items-center ">

//                                   <Button
//                                     onClick={() => push(`/board/${board.id}`)}
//                                     variant="outline"
//                                     size="sm"
//                                     className="w-full hover:bg-[#fff] hover:dark:bg-[#fff] text-[#111] dark:text-[#191919] bg-[#e1e0e0] dark:bg-[#e1e0e0]"
//                                   >
//                                     {board.title}
//                                   </Button>
//                                 </div>
//                               </CardContent>

//                             </Card>
//                             <div className="absolute inset-0 w-fit h-fit top-3 left-auto right-6 gap-2 p-1.5 rounded-sm border cursor-pointer dark:border-[#222] bg-white/80 dark:bg-[#191919] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col ">

//                               <TooltipProvider

//                                 openDelay={200}
//                                 closeDelay={200}
//                               >
//                                 <Tooltip
//                                   side="right"
//                                   sideOffset={6}
//                                   align="center"
//                                   alignOffset={0}
//                                 >
//                                   <TooltipTrigger>
//                                     <div
//                                       onClick={(e) => {
//                                         e.preventDefault();
//                                         e.stopPropagation();
//                                         toggleArchiveMutation.mutate({
//                                           boardId: board.id,
//                                           isArchived: !board.isArchived
//                                         });
//                                       }}
//                                       className={`  ${board.isArchived
//                                         ? ' '
//                                         : ' '
//                                         }`}
//                                       title={board.isArchived ? 'Restore' : 'Archive'}
//                                     >
//                                       {board.isArchived ? (
//                                         <RotateCcw className="size-4" />
//                                       ) : (
//                                         <Archive className="size-4" />
//                                       )}
//                                     </div>
//                                   </TooltipTrigger>

//                                   <TooltipContent className='!flex justify-center text-center items-center gap-1'>
//                                     <div className="flex justify-center items-center text-center gap-1">
//                                       {board.isArchived ?
//                                         <RotateCcw className=" size-3  " /> : <Archive className=" size-3  " />
//                                       }
//                                       <p>{board.isArchived ? 'Restore' : 'Archive'}</p></div>

//                                   </TooltipContent>
//                                 </Tooltip>
//                                 <Tooltip
//                                   side="right"
//                                   sideOffset={8}
//                                   align="center"
//                                   alignOffset={2}
//                                 >
//                                   <TooltipTrigger>
//                                     <AnimateIcon animateOnHover>
//                                       <Users className="size-4" />
//                                     </AnimateIcon>
//                                   </TooltipTrigger>

//                                   <TooltipContent>
//                                     <AnimateIcon animateOnHover className='flex justify-center items-center gap-1'>
//                                       <Users className=" size-3  " />
//                                       <p>{board.members.length}</p>
//                                     </AnimateIcon>
//                                   </TooltipContent>
//                                 </Tooltip>

//                                 <Tooltip
//                                   side="right"
//                                   sideOffset={8}
//                                   align="center"
//                                   alignOffset={2}
//                                 >
//                                   <TooltipTrigger>
//                                     <AnimateIcon animateOnHover>
//                                       <SquareKanban className="size-4" />
//                                     </AnimateIcon>
//                                   </TooltipTrigger>

//                                   <TooltipContent >
//                                     <AnimateIcon animateOnHover className='flex justify-center items-center gap-1'>
//                                       <SquareKanban className=" size-3  " />
//                                       <p>{board._count.columns}</p>
//                                     </AnimateIcon>
//                                   </TooltipContent>
//                                 </Tooltip>

//                                 <Tooltip
//                                   side="right"
//                                   sideOffset={8}
//                                   align="center"
//                                   alignOffset={2}
//                                 >
//                                   <TooltipTrigger>
//                                     <AnimateIcon animateOnHover>
//                                       {/* {(board.isArchived || showArchived) && ( */}
//                                       <div
//                                         onClick={(e) => {
//                                           e.preventDefault();
//                                           e.stopPropagation();
//                                           if (confirm('Are you sure? This will permanently delete the board and all its data.')) {
//                                             deleteBoardMutation.mutate(board.id);
//                                           }
//                                         }}
//                                         className=" text-red-600 hover:text-red-700 transition-colors"
//                                         title="Delete permanently"
//                                       >
//                                         <Trash2Icon className="size-4" />
//                                       </div>
//                                       {/* )} */}
//                                     </AnimateIcon>
//                                   </TooltipTrigger>

//                                   <TooltipContent>
//                                     <AnimateIcon animateOnHover className='flex justify-center items-center gap-1'>
//                                       {/* {(board.isArchived || showArchived) && ( */}

//                                       <div
//                                         className=" text-red-600 hover:text-red-700 transition-colors flex justify-center items-center gap-1"
//                                       >
//                                         <Trash2Icon className=" size-3  " />
//                                         <p>Delete</p>
//                                       </div>
//                                       {/* )} */}
//                                     </AnimateIcon>
//                                   </TooltipContent>
//                                 </Tooltip>
//                               </TooltipProvider>
//                             </div>

//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </main>


//               </div>
//               <div className="relative flex w-full max-w-sm ml-6">
//                 {TAB_CONTENT.map((tab, index) => (
//                   <button
//                     key={`${index}-${tab.title}`}
//                     onClick={() => setActiveTab(index)}
//                     className="flex-1 h-8 md:h-10"
//                   >
//                     <span
//                       className={`
//                 w-full max-w-xs h-full flex items-center justify-center
//                 ${activeTab === index ? "text-white" : "text-muted-foreground"}
//               `}
//                     >
//                       {tab.title}
//                     </span>
//                   </button>
//                 ))}
//               </div>

//             </div>
//           </div>


//         </Layout>
//       ) : (
//         <div className="h-screen w-screen  flex flex-col justify-center items-center relative ">
//           <div className="z-50 w-full py-4 flex !justify-end items-end pr-8">

//             <Tabs defaultValue="account" className="w-fit justify-center flex items-start py-0 ">
//               <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
//                 <TabsList className='!py-1 dark:bg-[#1a1a1a] bg-[#f5f5f5] rounded-xl px-1 border-none shadow-none'>
//                   <TabsTrigger
//                     onClick={() => setShowArchived(false)}
//                     value="account"
//                     className='py-2 px-6 rounded-full data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-gray-500 dark:text-gray-400 transition-all duration-200'
//                   >
//                     Active
//                   </TabsTrigger>
//                   <TabsTrigger
//                     onClick={() => setShowArchived(true)}
//                     value="password"
//                     className='py-2 px-6 rounded-full data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-gray-500 dark:text-gray-400 transition-all duration-200'
//                   >
//                     Archived
//                   </TabsTrigger>
//                 </TabsList>
//               </div>
//             </Tabs>
//           </div>
//           <div
//             className="flex flex-col items-center justify-center
//                h-full w-full text-center z-50"
//           >
//             <Image
//               src="https://i.pinimg.com/1200x/f2/be/85/f2be854e748d3557367ebd2eaebfafee.jpg"
//               alt="boards"
//               className="w-auto rounded-md h-[150px] mb-2"
//               height={1000}
//               width={1000}
//             />

//             <p className="text-zinc-400 font-medium mb-1">No boards yet</p>

//             <p className="text-zinc-600 text-sm">Create a board to organize your work</p>
//             <div className="mt-3">

//               <AnimateIcon animateOnHover>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setIsCreating(true)}
//                   className="aspect-square flex justify-center text-center items-center max-sm:p-0 text-sm bg-[#fff] border-none text-black dark:bg-white dark:text-black"
//                 >
//                   <PlusIcon className="opacity-1"
//                     size={16}
//                     aria-hidden="true" />
//                   <span className="max-sm:sr-only">Create Board</span>
//                 </Button>

//               </AnimateIcon>

//             </div>
//           </div>
//           <div className="absolute inset-0 z-10 h-full w-full items-center [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
//         </div>

//       )}

//       {isCreating && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Board</h2>
//             <form onSubmit={handleCreateBoard}>
//               <input
//                 type="text"
//                 value={newBoardTitle}
//                 onChange={(e) => setNewBoardTitle(e.target.value)}
//                 placeholder="Board title"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
                
//               />
//               <div className="flex justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setIsCreating(false)}
//                   className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={!newBoardTitle.trim() || createBoardMutation.isPending}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {createBoardMutation.isPending ? 'Creating&hellip;' : 'Create'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trash2,
  Archive,
  RotateCcw,
  LayoutIcon,
  PlusIcon,
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import Image from 'next/image';
import { MagicCard } from '@/components/magicui/magic-card';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Mainsidebar from '@/components/ui/mainSideBar';
import { Header } from '@/components/doc-components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SquareKanban } from '@/components/animate-ui/icons/square-kanban';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Users } from '@/components/animate-ui/icons/users';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip';
import { Trash2Icon } from '@/components/animate-ui/icons/trash-2';
import { AnimatePresence, motion } from "framer-motion";
import { GooeyFilter } from "@/components/ui/gooey-filter";
import { useScreenSize } from "hooks/use-screen-size";

interface Board {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
  _count: {
    columns: number;
  };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface BoardActionsProps {
  board: Board;
  onArchiveToggle: (boardId: string, isArchived: boolean) => void;
  onDelete: (boardId: string) => void;
}

function BoardActions({ board, onArchiveToggle, onDelete }: BoardActionsProps) {
  return (
    <TooltipProvider openDelay={200} closeDelay={200}>
      {/* Archive / Restore */}
      <Tooltip side="right" sideOffset={6} align="center" alignOffset={0}>
        <TooltipTrigger>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onArchiveToggle(board.id, !board.isArchived);
            }}
            title={board.isArchived ? 'Restore' : 'Archive'}
          >
            {board.isArchived ? (
              <RotateCcw className="size-4" />
            ) : (
              <Archive className="size-4" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="!flex justify-center text-center items-center gap-1">
          <div className="flex justify-center items-center text-center gap-1">
            {board.isArchived ? (
              <RotateCcw className="size-3" />
            ) : (
              <Archive className="size-3" />
            )}
            <p>{board.isArchived ? 'Restore' : 'Archive'}</p>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Members count */}
      <Tooltip side="right" sideOffset={8} align="center" alignOffset={2}>
        <TooltipTrigger>
          <AnimateIcon animateOnHover>
            <Users className="size-4" />
          </AnimateIcon>
        </TooltipTrigger>
        <TooltipContent>
          <AnimateIcon animateOnHover className="flex justify-center items-center gap-1">
            <Users className="size-3" />
            <p>{board.members.length}</p>
          </AnimateIcon>
        </TooltipContent>
      </Tooltip>

      {/* Columns count */}
      <Tooltip side="right" sideOffset={8} align="center" alignOffset={2}>
        <TooltipTrigger>
          <AnimateIcon animateOnHover>
            <SquareKanban className="size-4" />
          </AnimateIcon>
        </TooltipTrigger>
        <TooltipContent>
          <AnimateIcon animateOnHover className="flex justify-center items-center gap-1">
            <SquareKanban className="size-3" />
            <p>{board._count.columns}</p>
          </AnimateIcon>
        </TooltipContent>
      </Tooltip>

      {/* Delete */}
      <Tooltip side="right" sideOffset={8} align="center" alignOffset={2}>
        <TooltipTrigger>
          <AnimateIcon animateOnHover>
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Are you sure? This will permanently delete the board and all its data.')) {
                  onDelete(board.id);
                }
              }}
              className="text-red-600 hover:text-red-700 transition-colors"
              title="Delete permanently"
            >
              <Trash2Icon className="size-4" />
            </div>
          </AnimateIcon>
        </TooltipTrigger>
        <TooltipContent>
          <AnimateIcon animateOnHover className="flex justify-center items-center gap-1">
            <div className="text-red-600 hover:text-red-700 transition-colors flex justify-center items-center gap-1">
              <Trash2Icon className="size-3" />
              <p>Delete</p>
            </div>
          </AnimateIcon>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface BoardCardProps {
  board: Board;
  onNavigate: (boardId: string) => void;
  onArchiveToggle: (boardId: string, isArchived: boolean) => void;
  onDelete: (boardId: string) => void;
}

function BoardCard({ board, onNavigate, onArchiveToggle, onDelete }: BoardCardProps) {
  return (
    <div className="group relative hover:shadow-md h-fit rounded-lg transition-all duration-200">
      <Card className="h-52 dark:bg-[#1e1e1f] bg-[#F9F9FA] w-64 p-0 overflow-hidden border-none rounded-lg">
        <CardContent className="flex flex-col !gap-y-4 p-2 bg-transparent border-none overflow-hidden h-fit w-full">
          <BoardCoverImage board={board} />
          <div className="flex justify-center items-center">
            <Button
              onClick={() => onNavigate(board.id)}
              variant="outline"
              size="sm"
              className="w-full hover:bg-[#fff] hover:dark:bg-[#fff] text-[#111] dark:text-[#191919] bg-[#e1e0e0] dark:bg-[#e1e0e0]"
            >
              {board.title}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="absolute inset-0 w-fit h-fit top-3 left-auto right-6 gap-2 p-1.5 rounded-sm border cursor-pointer dark:border-[#222] bg-white/80 dark:bg-[#191919] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col">
        <BoardActions
          board={board}
          onArchiveToggle={onArchiveToggle}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function BoardCoverImage({ board }: { board: Board }) {
  return (
    <div
      className="bg-gradient-to-br from-[#3793FF] to-[#0017E4] relative h-[9rem] w-full rounded-lg transition-transform duration-300 group-hover:scale-105"
      style={
        board.coverImage
          ? { backgroundImage: `url(${board.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { backgroundImage: `url(https://pub-08af51b0459743828032880ad678a4cf.r2.dev/manual-upload/d07fce3952137aaaa71817e4ece3450a.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }
      }
    >
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface CreateBoardCardProps {
  onCreateClick: () => void;
  theme: string | undefined;
}

function CreateBoardCard({ onCreateClick, theme }: CreateBoardCardProps) {
  return (
    <Card className="h-52 dark:bg-[#1e1e1f] bg-[#F9F9FA] w-64 p-0 overflow-hidden border-none shadow-sm rounded-lg">
      <MagicCard
        gradientColor={theme === 'dark' ? '' : ''}
        className="p-0 bg-transparent h-full"
      >
        <CardContent className="flex flex-col space-y-4 p-2 bg-transparent border-none overflow-hidden h-full w-full">
          <Image
            src="https://i.pinimg.com/1200x/f2/be/85/f2be854e748d3557367ebd2eaebfafee.jpg"
            alt="Add Board"
            width={1000}
            height={1000}
            className="object-cover h-[9rem] w-full rounded-lg transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex justify-center items-center">
            <Button
              onClick={onCreateClick}
              variant="default"
              size="sm"
              className="w-full hover:bg-[#5C47CD] text-white dark:text-[#191919] bg-[#5C47CD] dark:bg-[#EEE]"
            >
              Create Board
            </Button>
          </div>
        </CardContent>
      </MagicCard>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const TAB_CONTENT = [
  { title: "Active" },
  { title: "Archived" },
];

interface GooeyTabsProps {
  activeTab: number;
  onTabChange: (index: number) => void;
  isGooeyEnabled: boolean;
}

function GooeyTabs({ activeTab, onTabChange, isGooeyEnabled }: GooeyTabsProps) {
  return (
    <div className="flex flex-col justify-start !px-2 py-0 gap-0 mt-2 items-start w-full min-h-[97vh] !max-h-[98vh] relative">
      <div
        className="absolute inset-0"
        style={{ filter: isGooeyEnabled ? "url(#gooey-filter)" : "none" }}
      >
        <TabIndicators activeTab={activeTab} />
      </div>

      <div className="relative flex w-full max-w-sm ml-6">
        {TAB_CONTENT.map((tab, index) => (
          <button type="button"
            key={`${index}-${tab.title}`}
            onClick={() => onTabChange(index)}
            className="flex-1 h-8 md:h-10 dark:text-black"
          >
            <span
              className={`w-full max-w-xs h-full flex items-center justify-center ${
                activeTab === index ? "text-black" : "text-black"
              }`}
            >
              {tab.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TabIndicators({ activeTab }: { activeTab: number }) {
  return (
    <div className="flex w-full max-w-sm ml-6">
      {TAB_CONTENT.map((_, index) => (
        <div key={`${index}`} className="relative ml-6 flex-1 h-8 md:h-10">
          {activeTab === index && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 bg-[#ffffff] dark:bg-[#111]"
              transition={{ type: "spring", bounce: 0.0, duration: 0.2 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface BoardGridProps {
  boards: Board[];
  showArchived: boolean;
  theme: string | undefined;
  onCreateClick: () => void;
  onNavigate: (boardId: string) => void;
  onArchiveToggle: (boardId: string, isArchived: boolean) => void;
  onDelete: (boardId: string) => void;
}

function BoardGrid({
  boards,
  showArchived,
  theme,
  onCreateClick,
  onNavigate,
  onArchiveToggle,
  onDelete,
}: BoardGridProps) {
  return (
    <div className="max-h-[98%] h-[98%] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-0 px-4 w-full">
      {!showArchived && (
        <CreateBoardCard onCreateClick={onCreateClick} theme={theme} />
      )}
      {boards.map((board) => (
        <BoardCard
          key={board.id}
          board={board}
          onNavigate={onNavigate}
          onArchiveToggle={onArchiveToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface CreateBoardModalProps {
  newBoardTitle: string;
  isPending: boolean;
  onChange: (title: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function CreateBoardModal({
  newBoardTitle,
  isPending,
  onChange,
  onSubmit,
  onCancel,
}: CreateBoardModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Board</h2>
        <form onSubmit={onSubmit}>
          <input
          aria-label='text-input'
            type="text"
            value={newBoardTitle}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Board title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newBoardTitle.trim() || isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  onCreateClick: () => void;
  onShowArchived: (value: boolean) => void;
}

function EmptyState({ onCreateClick, onShowArchived }: EmptyStateProps) {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center relative">
      <div className="z-50 w-full py-4 flex !justify-end items-end pr-8">
        <Tabs defaultValue="account" className="w-fit justify-center flex items-start py-0">
          <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            <TabsList className="!py-1 dark:bg-[#1a1a1a] bg-[#f5f5f5] rounded-xl px-1 border-none shadow-none">
              <TabsTrigger
                onClick={() => onShowArchived(false)}
                value="account"
                className="py-2 px-6 rounded-full data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-gray-500 dark:text-gray-400 transition-all duration-200"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                onClick={() => onShowArchived(true)}
                value="password"
                className="py-2 px-6 rounded-full data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-gray-500 dark:text-gray-400 transition-all duration-200"
              >
                Archived
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      <div className="flex flex-col items-center justify-center h-full w-full text-center z-50">
        <Image
          src="https://i.pinimg.com/1200x/f2/be/85/f2be854e748d3557367ebd2eaebfafee.jpg"
          alt="boards"
          className="w-auto rounded-md h-[150px] mb-2"
          height={1000}
          width={1000}
        />
        <p className="text-zinc-400 font-medium mb-1">No boards yet</p>
        <p className="text-zinc-600 text-sm">Create a board to organize your work</p>
        <div className="mt-3">
          <AnimateIcon animateOnHover>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateClick}
              className="aspect-square flex justify-center text-center items-center max-sm:p-0 text-sm bg-[#fff] border-none text-black dark:bg-white dark:text-black"
            >
              <PlusIcon className="opacity-1" size={16} aria-hidden="true" />
              <span className="max-sm:sr-only">Create Board</span>
            </Button>
          </AnimateIcon>
        </div>
      </div>

      <div className="absolute inset-0 z-10 h-full w-full items-center [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface MainContentPanelProps {
  boards: Board[];
  showArchived: boolean;
  theme: string | undefined;
  activeTab: number;
  isGooeyEnabled: boolean;
  screenSize: ReturnType<typeof useScreenSize>;
  onCreateClick: () => void;
  onNavigate: (boardId: string) => void;
  onArchiveToggle: (boardId: string, isArchived: boolean) => void;
  onDelete: (boardId: string) => void;
  onTabChange: (index: number) => void;
}

function MainContentPanel({
  boards,
  showArchived,
  theme,
  activeTab,
  isGooeyEnabled,
  screenSize,
  onCreateClick,
  onNavigate,
  onArchiveToggle,
  onDelete,
  onTabChange,
}: MainContentPanelProps) {
  return (
    <Layout>
      <GooeyFilter
        id="gooey-filter"
        strength={screenSize.lessThan("sm") ? 10 : 10}
      />
      <div className="w-full h-full overflow-y-auto">
        <Header />
        <div className="flex flex-col justify-start !px-2 py-0 gap-0 mt-2 items-start w-full min-h-[92vh] !max-h-[93vh] relative">
          <div
            className="absolute inset-0"
            style={{ filter: isGooeyEnabled ? "url(#gooey-filter)" : "none" }}
          >
            <TabIndicators activeTab={activeTab} />
            <main className="relative w-full max-w-[95vw] mx-auto !min-h-[85vh] !max-h-[85vh] !overflow-hidden rounded-xl">
              <div className="bg-[#FFF] dark:bg-[#111] w-full box-shadow dark:shadow-none rounded-2xl m-0 !min-h-[100%] !h-[83.2vh] px-4 py-5 text-center border-b border-r dark:border-[#262626] font-jakarta text-lg text-mid-grey">
                <div className="flex h-full items-center justify-center w-full">
                  <BoardGrid
                    boards={boards}
                    showArchived={showArchived}
                    theme={theme}
                    onCreateClick={onCreateClick}
                    onNavigate={onNavigate}
                    onArchiveToggle={onArchiveToggle}
                    onDelete={onDelete}
                  />
                </div>
              </div>
            </main>
          </div>

          <div className="relative flex w-full max-w-sm ml-6">
            {TAB_CONTENT.map((tab, index) => (
              <button type="button"
                key={`${index}-${tab.title}`}
                onClick={() => onTabChange(index)}
                className="flex-1 h-8 md:h-10"
              >
                <span
                  className={`w-full max-w-xs h-full flex items-center justify-center ${
                    activeTab === index ? "text-white" : "text-muted-foreground"
                  }`}
                >
                  {tab.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ─── Page component ────────────────────────────────────────────────────────────

export default function Scrumboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { push } = useRouter();

  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isGooeyEnabled] = useState(true);
  const screenSize = useScreenSize();

  useEffect(() => {
    if (status === 'unauthenticated') {
      push('/login');
    }
  }, [status, router]);

  const { data: boards, isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await fetch('/api/boards');
      if (!res.ok) throw new Error('Failed to fetch boards');
      return res.json() as Promise<Board[]>;
    },
    enabled: !!session && !showArchived,
  });

  const { data: archivedBoards, isLoading: isLoadingArchived } = useQuery({
    queryKey: ['boards', 'archived'],
    queryFn: async () => {
      const res = await fetch('/api/boards/archived');
      if (!res.ok) throw new Error('Failed to fetch archived boards');
      return res.json() as Promise<Board[]>;
    },
    enabled: !!session && showArchived,
  });

  const createBoardMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to create board');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setIsCreating(false);
      setNewBoardTitle('');
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: async (boardId: string) => {
      const res = await fetch(`/api/boards/${boardId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete board');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['boards', 'archived'] });
    },
  });

  const toggleArchiveMutation = useMutation({
    mutationFn: async ({ boardId, isArchived }: { boardId: string; isArchived: boolean }) => {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived }),
      });
      if (!res.ok) throw new Error('Failed to update board');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['boards', 'archived'] });
    },
  });

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardTitle.trim()) {
      createBoardMutation.mutate(newBoardTitle.trim());
    }
  };

  const handleArchiveToggle = (boardId: string, isArchived: boolean) => {
    toggleArchiveMutation.mutate({ boardId, isArchived });
  };

  const handleDelete = (boardId: string) => {
    deleteBoardMutation.mutate(boardId);
  };

  const displayBoards = showArchived ? archivedBoards : boards;
  const isLoadingData = showArchived ? isLoadingArchived : isLoading;

  if (status === 'loading' || isLoadingData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasBoards = displayBoards && displayBoards.length > 0;

  return (
    <div className="flex w-full h-full">
      <Mainsidebar />

      {hasBoards ? (
        <MainContentPanel
          boards={displayBoards}
          showArchived={showArchived}
          theme={theme}
          activeTab={activeTab}
          isGooeyEnabled={isGooeyEnabled}
          screenSize={screenSize}
          onCreateClick={() => setIsCreating(true)}
          onNavigate={(id) => push(`/board/${id}`)}
          onArchiveToggle={handleArchiveToggle}
          onDelete={handleDelete}
          onTabChange={setActiveTab}
        />
      ) : (
        <EmptyState
          onCreateClick={() => setIsCreating(true)}
          onShowArchived={setShowArchived}
        />
      )}

      {isCreating && (
        <CreateBoardModal
          newBoardTitle={newBoardTitle}
          isPending={createBoardMutation.isPending}
          onChange={setNewBoardTitle}
          onSubmit={handleCreateBoard}
          onCancel={() => setIsCreating(false)}
        />
      )}
    </div>
  );
}