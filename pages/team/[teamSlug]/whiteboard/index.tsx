// // pages/teams/[teamSlug]/whiteboard/index.tsx
// // Team whiteboard rooms list — create and open rooms

// import React, { useMemo, useRef, useState } from "react";
// import type { GetServerSideProps, NextPage } from "next";
// import Head from "next/head";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import type { Room, Team, User } from "@prisma/client";
// import {
//   Globe,
//   MoreVertical,
//   Search,
// } from "lucide-react";
// import { Header } from "@/components/doc-components/Header";
// import Mainsidebar from "@/components/ui/mainSideBar";
// import {
//   LayoutGrid,
//   List,
//   Link as LinkIcon,
//   ArrowUpDown,
//   ChevronDown,
// } from "lucide-react";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { AnimateIcon } from "@/components/animate-ui/icons/icon";
// import { ChartSpline } from "@/components/animate-ui/icons/chart-spline";
// import { Link2 } from "@/components/animate-ui/icons/link-2";
// import { Star } from "@/components/animate-ui/icons/star";
// import { Brush } from "@/components/animate-ui/icons/brush";
// import PenIcon from "@/components/ui/pen-icon";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuShortcut,
//   DropdownMenuSub,
//   DropdownMenuSubContent,
//   DropdownMenuSubTrigger,
//   DropdownMenuTrigger,
// } from '@/components/animate-ui/components/radix/dropdown-menu';
// import { MoreHorizontal, Pencil } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import LazyLoader from "@/components/loader/lazyloader";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   type DialogContentProps,
// } from '@/components/animate-ui/components/radix/dialog'
// import Image from "next/image";


// interface BoardItem {
//   id: string;
//   name: string;
//   description: string | null;
//   isPublic: boolean;
//   thumbnail: string | null;
//   createdAt: string;
//   updatedAt: string;
//   owner: { id: string; name: string | null; image: string | null };
//   _count: { collaborators: number };
//   userRole: string;
// }

// interface Props {
//   boards: BoardItem[];
//   currentUserId: string;
// }

// interface Board {
//   id: string;
//   name: string;
//   teamId: string;
//   createdBy: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // interface PageProps {
// //   boards: Board[];
// //   teamId: string;
// //   userId: string;

// // }

// type RoomWithUser = Room & { createdBy: Pick<User, "id" | "name" | "image"> };

// interface PageProps {
//   team: Pick<Team, "slug" | "id" | "name">;
//   rooms: RoomWithUser[];
//   canCreate: boolean;
//   name: string;
//   teamId: string;
//   createdBy: string;
//   createdAt: string;
//   updatedAt: string;
// }

// function formatRelative(dateStr: string) {
//   const d = new Date(dateStr);
//   const now = new Date();
//   const diffMs = now.getTime() - d.getTime();
//   const diffMin = Math.floor(diffMs / 60000);
//   if (diffMin < 60) return `${diffMin}m ago`;
//   const diffH = Math.floor(diffMin / 60);
//   if (diffH < 24) return `${diffH}h ago`;
//   return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
// }

// function formatDate(dateStr: string) {
//   const d = new Date(dateStr);
//   return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
// }


// const WhiteboardsPage: NextPage<PageProps> = ({ team, rooms: initialRooms, canCreate }) => {
//   const router = useRouter();
//   const { push } = useRouter()

//   const [rooms, setRooms] = useState(initialRooms);
//   const [showCreate, setShowCreate] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [newRoomName, setNewRoomName] = useState("");
//   const [viewMode, setViewMode] = useState<"grid" | "list">("list");
//   const [hovered, setHovered] = useState(false);
//   const [query, setQuery] = useState("");
//   const [editingRoom, setEditingRoom] = useState<{
//     id: string;
//     name: string;
//   } | null>(null);
//   const [newName, setNewName] = useState("");
//   const [isUpdating, setIsUpdating] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const handleRename = async (roomId: string) => {
//     if (!newName.trim() || newName.trim() === editingRoom?.name) {
//       setEditingRoom(null);
//       return;
//     }

//     setIsUpdating(true);
//     try {
//       const res = await fetch(`/api/team/${team.slug}/rooms`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ roomId, name: newName.trim() }),
//       });

//       if (!res.ok) throw new Error("Failed");
//       const { room } = await res.json();

//       setEditingRoom(null);
//       // Optionally refresh data or update local state
//       // push(`/team/${team.slug}/whiteboard/${room.slug}`);
//     } catch {
//       alert("Failed to rename room. Please try again.");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handleCreate = async () => {
//     if (!newRoomName.trim() || creating) return;
//     setCreating(true);

//     try {
//       const res = await fetch(`/api/team/${team.slug}/rooms`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name: newRoomName.trim() }),
//       });

//       if (!res.ok) throw new Error("Failed");
//       const { room } = await res.json();

//       // Navigate to new room
//       push(`/team/${team.slug}/whiteboard/${room.slug}`);
//     } catch {
//       setCreating(false);
//       alert("Failed to create whiteboard. Please try again.");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this room?")) return;

//     try {
//       const res = await fetch(`/api/team/${team.slug}/rooms?roomId=${id}`, {
//         method: "DELETE",
//       });

//       if (!res.ok) throw new Error("Failed");

//       // Update local state
//       setRooms(prev => prev.filter(room => room.id !== id));

//       // If the current page is this room, redirect
//       if (router.pathname === "/team/[teamSlug]/whiteboard/[roomSlug]" && router.query.roomId === id) {
//         push(`/team/${team.slug}/whiteboard`);
//       }
//     } catch (e) {
//       console.error("Failed to delete room:", e);
//       alert("Failed to delete room");
//     }
//   };

//   const filteredBoards = useMemo(() => {
//     return rooms.filter(room =>
//       room.name.toLowerCase().includes(query.toLowerCase())
//     );
//   }, [rooms, query]);

//   return (
//     <>
//       <Head>
//         <title>Whiteboards . {team.name}</title>
//       </Head>
//       <div className="flex w-screen !overflow-y-hidden max-h-screen h-screen">

//         <Mainsidebar />
//         <div className="min-h-screen dark:bg-[#111111] text-gray-100 w-full overflow-y-auto scrollbar-thin2">
//           <Header />
//           <header className="sticky top-0 ">
//             <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
//               <div className="flex justify-center items-center gap-2">
//                 <div className="size-6 flex items-center justify-center">
//                   <PenIcon size={16} className="text-black dark:text-white" />
//                 </div>
//                 <h1 className="text-md font-semibold text-black dark:text-white">All Whiteboards</h1>
//               </div>

//               <div className="flex items-center gap-3">
//                 {/* Search */}
//                 <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
//                   <TabsList className="bg-secondary border divide-x-1 divide-[#333] border-border h-9 rounded-xl !px-0 !py-0 dark:border-[#333]">
//                     <TabsTrigger value="list" className="px-2.5 py-1.5 rounded-xl rounded-r-none data-[state=active]:bg-accent">
//                       <List className="size-4" />
//                     </TabsTrigger>

//                     <TabsTrigger value="grid" className="px-2.5 py-1.5 rounded-xl rounded-l-none data-[state=active]:bg-accent">
//                       <LayoutGrid className="size-4" />
//                     </TabsTrigger>
//                   </TabsList>
//                 </Tabs>
//                 {canCreate && (
//                   <Button
//                     variant="default"
//                     size="sm"
//                     onClick={() => setShowCreate(true)}
//                     className="flex justify-center items-center text-white h-8 !px-1.5 bg-blue-600 hover:bg-blue-700 text-sm"
//                   >
//                     {/* <Plus size={16} /> */}
//                     {creating ? "Creating..." : "New Whiteboard"}
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </header>

//           {/* ─── Content ─────────────────────────────────────────────────────── */}
//           <main className="max-w-full mx-auto bg-transparent relative">
//             {rooms.length === 0 ? (
//               <div className="flex flex-col items-center bg-transparent justify-center text-center relative group h-screen">
//                 <div className="z-20 w-full h-full flex justify-center items-center flex-col">
//                   {/* <div className=" size-16  rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
//                     <svg className="size-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
//                     </svg>
//                   </div> */}
//                   <Image
//                     src="https://i.pinimg.com/1200x/83/e3/4a/83e34a9eabb6ea03a585288b079efcf7.jpg"
//                     alt={'Create events'}
//                     className="w-auto rounded-md h-[130px] mb-3"
//                     height={1000}
//                     width={1000}
//                   />
//                   <p className="text-zinc-400 font-medium mb-1">No whiteboards yet</p>
//                   <p className="text-zinc-600 text-sm mb-6">Create your first collaborative whiteboard</p>
//                   {canCreate && (
//                     <button
//                       onClick={() => setShowCreate(true)}
//                       className="  p-2    bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
//                     >
//                       Create Whiteboard
//                     </button>
//                   )}
//                 </div>
//                 <div className="absolute inset-0 z-10 h-full w-full items-center [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

//               </div>
//             ) : (
//               <>

//                 <div className="px-4 py-8">
//                   {viewMode === "list" ? (

//                     <div className="">
//                       <div>
//                         {/* Sort & Search row */}
//                         <div className="flex items-center justify-between mb-2 px-4">
//                           <div className="flex items-center gap-1.5">
//                             <button type="button" className="flex items-center gap-1.5 text-sm border rounded-xl border-border dark:border-[#222] text-[#646464] dark:text-[#B4B4B4] hover:text-foreground transition-colors px-2 py-1">
//                               <ArrowUpDown className="w-3.5 h-3.5" />
//                               Sort
//                             </button>
//                             <p className="text-sm text-[#646464] dark:text-[#B4B4B4] border rounded-xl border-border dark:border-[#222] px-2 py-1">
//                               {rooms.length} whiteboard{rooms.length !== 1 ? "s" : ""}
//                             </p>
//                           </div>

//                           <div className="relative sm:block flex w-56 pl-3 justify-center items-center text-sm border rounded-xl border-border dark:border-[#222] text-muted-foreground hover:text-foreground transition-colors px-2 py-1">

//                             <Search className="w-3.5 h-3.5 absolute top-3" />

//                             <input
//                               type="text"
//                               placeholder="Search..."
//                               value={query}
//                               onChange={(e) => setQuery(e.target.value)}
//                               className="pl-12 pr-4 py-1 rounded-xl
//                     text-sm text-gray-300 placeholder-[#191919] outline-none focus-visible:no-underline
//                      bg-transparent"  />
//                           </div>
//                         </div>

//                         {/* Table */}
//                         <div className="border-t border-border dark:border-[#1F1F1F]">
//                           {/* Header */}
//                           <div className="grid grid-cols-[1fr_140px_140px_140px_140px_80px_40px] gap-2 px-4 py-1.5 text-xs font-medium text-[#646464] dark:text-[#B4B4B4] border-b border-border dark:border-[#1F1F1F]">
//                             <span>Name</span>
//                             <span>Location</span>
//                             <span>Date updated</span>
//                             <span>Date created</span>
//                             <span className="flex items-center gap-1">
//                               Date viewed
//                               <ArrowUpDown className=" size-3  " />
//                             </span>
//                             <span>Creator</span>
//                             <span></span>
//                           </div>
//                         </div>
//                       </div>

//                       {rooms.map((room) => (
//                         <div
//                           key={room.id}
//                           className="grid grid-cols-[1fr_140px_140px_140px_140px_80px_40px] gap-2 px-8 py-1 items-center border-b border-border dark:border-[#1F1F1F] hover:dark:bg-[#191919] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
//                           onMouseEnter={() => setHovered(true)}
//                           onMouseLeave={() => setHovered(false)}
//                         >
//                           {/* Name */}
//                           <AnimateIcon animateOnHover className="flex items-center gap-2 min-w-0">
//                             <div onClick={() => push(`/team/${team.slug}/whiteboard/${room.slug}`)} className="size-4 bg-yellow-400 rounded-[2px] font-bold text-black p-0.5 flex-shrink-0">
//                               <ChartSpline className="h-full w-full scale-y-110 rotate-90 -translate-y-[1px] -ml-[1px]" />
//                             </div>
//                             <span onClick={() => push(`/team/${team.slug}/whiteboard/${room.slug}`)} className="text-sm font-medium dark:text-[#EEE] text-[#111] hover:dark:text-primary truncate">{room.name}</span>
//                             {hovered && (
//                               <div className="flex items-center gap-1.5 flex-shrink-0 relative">
//                                 <button type="button" className="p-1 rounded dark:bg-[#111111] dark:hover:bg-[#222222] hover:bg-accent text-[#979797] border border-border dark:border-[#484848] hover:text-foreground transition-colors">
//                                   <Link2 className="w-3.5 h-3.5 -rotate-45" />
//                                 </button>
//                                 <button type="button" className="p-1 rounded dark:bg-[#111111] dark:hover:bg-[#222222] hover:bg-accent text-[#979797] border border-border dark:border-[#484848] hover:text-foreground transition-colors">
//                                   <Star className="w-3.5 h-3.5" />
//                                 </button>

//                                 <Dialog>
//                                   <DialogTrigger>
//                                     <button type="button" className="p-1 rounded dark:bg-[#111111] dark:hover:bg-[#222222] hover:bg-accent text-[#979797] border border-border dark:border-[#484848] hover:text-foreground transition-colors">
//                                       <PenIcon className="w-3.5 h-3.5" />
//                                     </button>
//                                   </DialogTrigger>
//                                   <DialogContent onClick={(e) => {
//                                     e.stopPropagation();
//                                     setEditingRoom({ id: room.id, name: room.name });
//                                     setNewName(room.name);
//                                     // Focus input after popover opens
//                                     setTimeout(() => inputRef.current?.focus(), 50);
//                                   }} className="dark:border-[#272727] border-[#111] bg-[#111] !border !w-[16rem] !max-w-[20rem] !left-[5rem]">
//                                     <div className="space-y-2 px-1">
//                                       <label htmlFor={`update-whiteboard-${room.id}`} className="text-sm font-medium text-gray-700 dark:text-[#3b3b3b]">Update Whiteboard</label>
//                                       <Input
//                                         id={`update-whiteboard-${room.id}`}
//                                         className="!border dark:!border-[#272727]"
//                                         ref={inputRef}
//                                         value={newName}
//                                         onChange={(e) => setNewName(e.target.value)}
//                                         placeholder="Whiteboard name"
//                                         onKeyDown={(e) => {
//                                           if (e.key === "Enter") handleRename(room.id);
//                                           if (e.key === "Escape") setEditingRoom(null);
//                                         }}
//                                         disabled={isUpdating}
//                                       />
//                                       <div className="flex justify-end gap-2 pt-1">
//                                         <Button
//                                           variant="ghost"
//                                           size="sm"
//                                           onClick={() => setEditingRoom(null)}
//                                           disabled={isUpdating}
//                                         >
//                                           Cancel
//                                         </Button>
//                                         <Button
//                                           size="sm"
//                                           onClick={() => handleRename(room.id)}
//                                           disabled={!newName.trim() || newName.trim() === room.name || isUpdating}

//                                         >
//                                           Save{isUpdating && <LazyLoader
//                                           />}
//                                         </Button>
//                                       </div>
//                                     </div>

//                                   </DialogContent>
//                                 </Dialog>
//                               </div>
//                             )}
//                           </AnimateIcon>

//                           {/* Location */}
//                           <div className="text-sm text-[#646464] dark:text-[#B4B4B4] truncate">
//                             {team.name ? (
//                               <span className="flex items-center gap-1">
//                                 <Globe className="w-3.5 h-3.5" />
//                                 {team.name}
//                               </span>
//                             ) : (
//                               "–"
//                             )}
//                           </div>

//                           {/* Date updated */}
//                           <div className="text-sm text-[#646464] dark:text-[#B4B4B4]">
//                             {formatDate(room.updatedAt)}
//                           </div>

//                           {/* Date created */}
//                           <div className="text-sm text-[#646464] dark:text-[#B4B4B4]">
//                             {formatDate(room.createdAt)}
//                           </div>

//                           {/* Date viewed */}
//                           <div className="text-sm text-[#646464] dark:text-[#B4B4B4]">
//                             {room.dateViewed || formatRelative(room.updatedAt)}
//                           </div>

//                           {/* Creator */}
//                           <div className="flex items-center justify-start">
//                             <div className="size-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
//                               {room.createdBy.name?.substring(0, 2) || "?"}
//                             </div>
//                           </div>

//                           {/* More */}
//                           <div className="relative flex items-center justify-center">
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button variant="outline"
//                                   className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
//                                 >
//                                   <MoreVertical className="size-4" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent>
//                                 <DropdownMenuGroup>
//                                   <DropdownMenuItem>
//                                     <Link
//                                       href={`/team/${team.slug}/whiteboard/${room.slug}`}
//                                       className="flex items-center gap-2"
//                                     >
//                                       Open
//                                     </Link>
//                                   </DropdownMenuItem>

//                                 </DropdownMenuGroup>
//                                 <DropdownMenuSeparator />
//                                 <DropdownMenuGroup>
//                                   <DropdownMenuGroup>
//                                     <DropdownMenuSub>
//                                       <DropdownMenuSubTrigger>update</DropdownMenuSubTrigger>
//                                       <DropdownMenuSubContent
//                                         className="dark:bg-[#111111] bg-white border border-border dark:border-[#323232]"
//                                         onClick={(e) => {
//                                           e.stopPropagation();
//                                           setEditingRoom({ id: room.id, name: room.name });
//                                           setNewName(room.name);
//                                           // Focus input after popover opens
//                                           setTimeout(() => inputRef.current?.focus(), 50);
//                                         }}>

//                                         <div className="space-y-2 px-1">
//                                           <label htmlFor={`update-whiteboard-sub-${room.id}`} className="text-sm font-medium text-gray-700 dark:text-[#3b3b3b]">Update Whiteboard</label>
//                                           <Input
//                                             id={`update-whiteboard-sub-${room.id}`}
//                                             className="!border dark:!border-[#272727]"
//                                             ref={inputRef}
//                                             value={newName}
//                                             onChange={(e) => setNewName(e.target.value)}
//                                             placeholder="Whiteboard name"
//                                             onKeyDown={(e) => {
//                                               if (e.key === "Enter") handleRename(room.id);
//                                               if (e.key === "Escape") setEditingRoom(null);
//                                             }}
//                                             disabled={isUpdating}
//                                           />
//                                           <div className="flex justify-end gap-2 pt-1">
//                                             <Button
//                                               variant="ghost"
//                                               size="sm"
//                                               onClick={() => setEditingRoom(null)}
//                                               disabled={isUpdating}
//                                             >
//                                               Cancel
//                                             </Button>
//                                             <Button
//                                               size="sm"
//                                               onClick={() => handleRename(room.id)}
//                                               disabled={!newName.trim() || newName.trim() === room.name || isUpdating}

//                                             >
//                                               Save{isUpdating && <LazyLoader
//                                               />}
//                                             </Button>
//                                           </div>
//                                         </div>


//                                       </DropdownMenuSubContent>
//                                     </DropdownMenuSub>

//                                   </DropdownMenuGroup>
//                                   <DropdownMenuItem
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handleDelete(room.id);
//                                     }}
//                                   >Delete</DropdownMenuItem>
//                                 </DropdownMenuGroup>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </div>

//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 px-8">

//                       {rooms.map((room) => (
//                         <Link
//                           key={room.id}
//                           href={`/team/${team.slug}/whiteboard/${room.slug}`}
//                           className="group relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 overflow-hidden"
//                         >
//                           {/* Preview area */}
//                           <div className="aspect-video bg-[#0f0f0f] relative overflow-hidden">
//                             {room.thumbnailUrl ? (
//                               // eslint-disable-next-line @next/next/no-img-element
//                               <img
//                                 src={room.thumbnailUrl}
//                                 alt={`${room.name} preview`}
//                                 className="w-full h-full object-contain p-3 opacity-70 group-hover:opacity-100 transition-opacity"
//                               />
//                             ) : (
//                               <div className="absolute inset-0 flex items-center justify-center">
//                                 {/* Dot grid preview */}
//                                 <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
//                                   <defs>
//                                     <pattern id={`dots-${room.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
//                                       <circle cx="2" cy="2" r="1" fill="white" />
//                                     </pattern>
//                                   </defs>
//                                   <rect width="100%" height="100%" fill={`url(#dots-${room.id})`} />
//                                 </svg>
//                                 <span className="absolute text-zinc-700 text-xs font-medium">Empty canvas</span>
//                               </div>
//                             )}

//                             {/* Hover overlay */}
//                             <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
//                               <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg shadow-lg">
//                                 Open
//                               </span>
//                             </div>
//                           </div>

//                           {/* Meta */}
//                           <div className="p-3 flex items-center justify-between">
//                             <div className="flex flex-col">
//                               <p className="text-sm font-medium text-zinc-200 truncate">{room.name}</p>
//                               <div className="flex items-center gap-1.5 mt-1">
//                                 {room.createdBy.image ? (
//                                   <img
//                                     src={room.createdBy.image}
//                                     alt={room.createdBy.name ?? ""}
//                                     className="size-4 rounded-full"
//                                   />
//                                 ) : (
//                                   <div className="size-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-zinc-400">
//                                     {(room.createdBy.name ?? "?")[0]}
//                                   </div>
//                                 )}
//                                 <span className="text-xs text-zinc-500 truncate">
//                                   {room.createdBy.name ?? "Unknown"}
//                                 </span>

//                               </div>
//                             </div>
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button variant="outline"
//                                   className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
//                                 >
//                                   <MoreVertical className="size-4" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent>
//                                 <DropdownMenuGroup>
//                                   <DropdownMenuItem>
//                                     <Link
//                                       href={`/team/${team.slug}/whiteboard/${room.slug}`}
//                                       className="flex items-center gap-2"
//                                     >
//                                       Open
//                                     </Link>
//                                   </DropdownMenuItem>

//                                 </DropdownMenuGroup>
//                                 <DropdownMenuSeparator />
//                                 <DropdownMenuGroup>
//                                   <DropdownMenuGroup>
//                                     <DropdownMenuSub>
//                                       <DropdownMenuSubTrigger>update</DropdownMenuSubTrigger>
//                                       <DropdownMenuSubContent
//                                         className="dark:bg-[#111111] bg-white border border-border dark:border-[#323232]"
//                                         onClick={(e) => {
//                                           e.stopPropagation();
//                                           setEditingRoom({ id: room.id, name: room.name });
//                                           setNewName(room.name);
//                                           // Focus input after popover opens
//                                           setTimeout(() => inputRef.current?.focus(), 50);
//                                         }}>

//                                         <div className="space-y-2 px-1">
//                                           <label htmlFor={`update-whiteboard-grid-${room.id}`} className="text-sm font-medium text-gray-700 dark:text-[#3b3b3b]">Update Whiteboard</label>
//                                           <Input
//                                             id={`update-whiteboard-grid-${room.id}`}
//                                             className="!border dark:!border-[#272727]"
//                                             ref={inputRef}
//                                             value={newName}
//                                             onChange={(e) => setNewName(e.target.value)}
//                                             placeholder="Whiteboard name"
//                                             onKeyDown={(e) => {
//                                               if (e.key === "Enter") handleRename(room.id);
//                                               if (e.key === "Escape") setEditingRoom(null);
//                                             }}
//                                             disabled={isUpdating}
//                                           />
//                                           <div className="flex justify-end gap-2 pt-1">
//                                             <Button
//                                               variant="ghost"
//                                               size="sm"
//                                               onClick={() => setEditingRoom(null)}
//                                               disabled={isUpdating}
//                                             >
//                                               Cancel
//                                             </Button>
//                                             <Button
//                                               size="sm"
//                                               onClick={() => handleRename(room.id)}
//                                               disabled={!newName.trim() || newName.trim() === room.name || isUpdating}

//                                             >
//                                               Save{isUpdating && <LazyLoader
//                                               />}
//                                             </Button>
//                                           </div>
//                                         </div>


//                                       </DropdownMenuSubContent>
//                                     </DropdownMenuSub>

//                                   </DropdownMenuGroup>
//                                   <DropdownMenuItem
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handleDelete(room.id);
//                                     }}
//                                   >Delete</DropdownMenuItem>
//                                 </DropdownMenuGroup>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </div>

//                         </Link>
//                       ))}

//                     </div>
//                   )}
//                 </div>
//               </>
//             )}
//           </main>

//           {showCreate && (
//             <div
//               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//               onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
//             >
//               <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
//                 <h2 className="text-lg font-semibold text-zinc-100 mb-1">New Whiteboard</h2>
//                 <p className="text-sm text-zinc-500 mb-5">Give your whiteboard a name</p>

//                 <input
                  
//                   type="text"
//                   placeholder="e.g. Q3 Planning, Sprint Retrospective…"
//                   value={newRoomName}
//                   onChange={(e) => setNewRoomName(e.target.value)}
//                   onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowCreate(false); }}
//                   className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
//                   maxLength={80}
//                 />

//                 <div className="flex gap-3 mt-5">
//                   <button
//                     onClick={() => setShowCreate(false)}
//                     className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button type="button"
//                     onClick={handleCreate}
//                     disabled={!newRoomName.trim() || creating}
//                     className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
//                   >
//                     {creating ? (
//                       <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     ) : null}
//                     {creating ? "Creating…" : "Create"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//     </>
//   );
// };

// export const getServerSideProps = async (ctx) => {
//   const session = await getServerSession(ctx.req, ctx.res, authOptions);

//   if (!session?.user?.id) {
//     return { redirect: { destination: `/login?callbackUrl=${ctx.resolvedUrl}`, permanent: false } };
//   }

//   const { teamSlug } = ctx.params as { teamSlug: string };

//   const team = await prisma.team.findUnique({
//     where: { slug: teamSlug },
//     include: {
//       members: {
//         where: { userId: session.user.id },
//         select: { id: true, role: true },
//       },
//     },
//   });

//   if (!team || !team.members.length) return { notFound: true };

//   const membership = team.members[0];
//   const canCreate = ["ADMIN", "OWNER", "MANAGER", "MEMBER"].includes(membership.role);

//   const rooms = await prisma.room.findMany({
//     where: { teamId: team.id, isArchived: false },
//     include: { createdBy: { select: { id: true, name: true, image: true } } },
//     orderBy: { updatedAt: "desc" },
//   });

//   return {
//     props: {
//       team: { id: team.id, name: team.name, slug: team.slug },
//       rooms: JSON.parse(JSON.stringify(rooms)),
//       canCreate,
//     },
//   };
// };

// export default WhiteboardsPage;

// pages/teams/[teamSlug]/whiteboard/index.tsx
// Team whiteboard rooms list — create and open rooms

import React, { useMemo, useRef, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Room, Team, User } from "@prisma/client";
import { Globe, MoreVertical, PlusIcon, Search } from "lucide-react";
import { Header } from "@/components/doc-components/Header";
import Mainsidebar from "@/components/ui/mainSideBar";
import { LayoutGrid, List, ArrowUpDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { ChartSpline } from "@/components/animate-ui/icons/chart-spline";
import { Link2 } from "@/components/animate-ui/icons/link-2";
import { Star } from "@/components/animate-ui/icons/star";
import PenIcon from "@/components/ui/pen-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import { Input } from "@/components/ui/input";
import LazyLoader from "@/components/loader/lazyloader";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from '@/components/animate-ui/components/radix/dialog';
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type RoomWithUser = Room & { createdBy: Pick<User, "id" | "name" | "image"> };

interface PageProps {
  team: Pick<Team, "slug" | "id" | "name">;
  rooms: RoomWithUser[];
  canCreate: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RenameFormProps {
  roomId: string;
  roomName: string;
  inputRef: React.RefObject<HTMLInputElement>;
  newName: string;
  isUpdating: boolean;
  onChangeName: (v: string) => void;
  onSave: (roomId: string) => void;
  onCancel: () => void;
  labelSuffix?: string;
}

function RenameForm({
  roomId,
  roomName,
  inputRef,
  newName,
  isUpdating,
  onChangeName,
  onSave,
  onCancel,
  labelSuffix = "",
}: RenameFormProps) {
  return (
    <div className="space-y-2 px-1">
      <label
        htmlFor={`update-whiteboard-${labelSuffix}-${roomId}`}
        className="text-sm font-medium text-gray-700 dark:text-[#3b3b3b]"
      >
        Update Whiteboard
      </label>
      <Input
        id={`update-whiteboard-${labelSuffix}-${roomId}`}
        className="!border dark:!border-[#272727]"
        ref={inputRef}
        value={newName}
        onChange={(e) => onChangeName(e.target.value)}
        placeholder="Whiteboard name"
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(roomId);
          if (e.key === "Escape") onCancel();
        }}
        disabled={isUpdating}
      />
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isUpdating}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => onSave(roomId)}
          disabled={!newName.trim() || newName.trim() === roomName || isUpdating}
        >
          Save{isUpdating && <LazyLoader />}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface RoomDropdownMenuProps {
  room: RoomWithUser;
  teamSlug: string;
  inputRef: React.RefObject<HTMLInputElement>;
  newName: string;
  isUpdating: boolean;
  labelSuffix?: string;
  onOpenRenameForm: (room: RoomWithUser) => void;
  onChangeName: (v: string) => void;
  onSave: (roomId: string) => void;
  onCancelRename: () => void;
  onDelete: (id: string) => void;
}

function RoomDropdownMenu({
  room,
  teamSlug,
  inputRef,
  newName,
  isUpdating,
  labelSuffix = "",
  onOpenRenameForm,
  onChangeName,
  onSave,
  onCancelRename,
  onDelete,
}: RoomDropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link
              href={`/team/${teamSlug}/whiteboard/${room.slug}`}
              className="flex items-center gap-2"
            >
              Open
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>update</DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                className="dark:bg-[#111111] bg-white border border-border dark:border-[#323232]"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRenameForm(room);
                }}
              >
                <RenameForm
                  roomId={room.id}
                  roomName={room.name}
                  inputRef={inputRef}
                  newName={newName}
                  isUpdating={isUpdating}
                  onChangeName={onChangeName}
                  onSave={onSave}
                  onCancel={onCancelRename}
                  labelSuffix={`sub-${labelSuffix}`}
                />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete(room.id);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface ListRowHoverActionsProps {
  room: RoomWithUser;
  inputRef: React.RefObject<HTMLInputElement>;
  newName: string;
  isUpdating: boolean;
  onOpenRenameForm: (room: RoomWithUser) => void;
  onChangeName: (v: string) => void;
  onSave: (roomId: string) => void;
  onCancelRename: () => void;
}

function ListRowHoverActions({
  room,
  inputRef,
  newName,
  isUpdating,
  onOpenRenameForm,
  onChangeName,
  onSave,
  onCancelRename,
}: ListRowHoverActionsProps) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0 relative">
      <button
        type="button"
        className="p-1 rounded dark:bg-[#111111] dark:hover:bg-[#222222] hover:bg-accent text-[#979797] border border-border dark:border-[#484848] hover:text-foreground transition-colors"
      >
        <Link2 className="w-3.5 h-3.5 -rotate-45" />
      </button>
      <button
        type="button"
        className="p-1 rounded dark:bg-[#111111] dark:hover:bg-[#222222] hover:bg-accent text-[#979797] border border-border dark:border-[#484848] hover:text-foreground transition-colors"
      >
        <Star className="w-3.5 h-3.5" />
      </button>
      <Dialog>
        <DialogTrigger>
          <button
            type="button"
            className="p-1 rounded dark:bg-[#111111] dark:hover:bg-[#222222] hover:bg-accent text-[#979797] border border-border dark:border-[#484848] hover:text-foreground transition-colors"
          >
            <PenIcon className="w-3.5 h-3.5" />
          </button>
        </DialogTrigger>
        <DialogContent
          onClick={(e) => {
            e.stopPropagation();
            onOpenRenameForm(room);
          }}
          className="dark:border-[#272727] border-[#111] bg-[#111] !border !w-[16rem] !max-w-[20rem] !left-[5rem]"
        >
          <RenameForm
            roomId={room.id}
            roomName={room.name}
            inputRef={inputRef}
            newName={newName}
            isUpdating={isUpdating}
            onChangeName={onChangeName}
            onSave={onSave}
            onCancel={onCancelRename}
            labelSuffix="dialog"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface ListRowProps {
  room: RoomWithUser;
  team: Pick<Team, "slug" | "id" | "name">;
  hovered: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  newName: string;
  isUpdating: boolean;
  onHover: (v: boolean) => void;
  onNavigate: (slug: string) => void;
  onOpenRenameForm: (room: RoomWithUser) => void;
  onChangeName: (v: string) => void;
  onSave: (roomId: string) => void;
  onCancelRename: () => void;
  onDelete: (id: string) => void;
}

function ListRow({
  room,
  team,
  hovered,
  inputRef,
  newName,
  isUpdating,
  onHover,
  onNavigate,
  onOpenRenameForm,
  onChangeName,
  onSave,
  onCancelRename,
  onDelete,
}: ListRowProps) {
  return (
    <div
      key={room.id}
      className="grid grid-cols-[1fr_140px_140px_140px_140px_80px_40px] gap-2 px-8 py-1 items-center border-b border-border dark:border-[#1F1F1F] hover:dark:bg-[#191919] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Name */}
      <AnimateIcon animateOnHover className="flex items-center gap-2 min-w-0">
        <div
          onClick={() => onNavigate(room.slug)}
          className="size-4 bg-yellow-400 rounded-[2px] font-bold text-black p-0.5 flex-shrink-0"
        >
          <ChartSpline className="h-full w-full scale-y-110 rotate-90 -translate-y-[1px] -ml-[1px]" />
        </div>
        <span
          onClick={() => onNavigate(room.slug)}
          className="text-sm font-medium dark:text-[#EEE] text-[#111] hover:dark:text-primary truncate"
        >
          {room.name}
        </span>
        {hovered && (
          <ListRowHoverActions
            room={room}
            inputRef={inputRef}
            newName={newName}
            isUpdating={isUpdating}
            onOpenRenameForm={onOpenRenameForm}
            onChangeName={onChangeName}
            onSave={onSave}
            onCancelRename={onCancelRename}
          />
        )}
      </AnimateIcon>

      {/* Location */}
      <div className="text-sm text-[#646464] dark:text-[#B4B4B4] truncate">
        {team.name ? (
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            {team.name}
          </span>
        ) : "–"}
      </div>

      {/* Date updated */}
      <div className="text-sm text-[#646464] dark:text-[#B4B4B4]">
        {formatDate(room.updatedAt)}
      </div>

      {/* Date created */}
      <div className="text-sm text-[#646464] dark:text-[#B4B4B4]">
        {formatDate(room.createdAt)}
      </div>

      {/* Date viewed */}
      <div className="text-sm text-[#646464] dark:text-[#B4B4B4]">
        {room.dateViewed || formatRelative(room.updatedAt)}
      </div>

      {/* Creator avatar */}
      <div className="flex items-center justify-start">
        <div className="size-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
          {room.createdBy.name?.substring(0, 2) || "?"}
        </div>
      </div>

      {/* More menu */}
      <div className="relative flex items-center justify-center">
        <RoomDropdownMenu
          room={room}
          teamSlug={team.slug}
          inputRef={inputRef}
          newName={newName}
          isUpdating={isUpdating}
          labelSuffix="list"
          onOpenRenameForm={onOpenRenameForm}
          onChangeName={onChangeName}
          onSave={onSave}
          onCancelRename={onCancelRename}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface GridCardPreviewProps {
  room: RoomWithUser;
}

function GridCardPreview({ room }: GridCardPreviewProps) {
  if (room.thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={room.thumbnailUrl}
        alt={`${room.name} preview`}
        className="w-full h-full object-contain p-3 opacity-70 group-hover:opacity-100 transition-opacity"
      />
    );
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`dots-${room.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${room.id})`} />
      </svg>
      <span className="absolute text-zinc-700 text-xs font-medium">Empty canvas</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface GridCardMetaProps {
  room: RoomWithUser;
}

function GridCardMeta({ room }: GridCardMetaProps) {
  return (
    <div className="flex flex-col">
      <p className="text-sm font-medium text-zinc-200 truncate">{room.name}</p>
      <div className="flex items-center gap-1.5 mt-1">
        {room.createdBy.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={room.createdBy.image}
            alt={room.createdBy.name ?? ""}
            className="size-4 rounded-full"
          />
        ) : (
          <div className="size-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-zinc-400">
            {(room.createdBy.name ?? "?")[0]}
          </div>
        )}
        <span className="text-xs text-zinc-500 truncate">
          {room.createdBy.name ?? "Unknown"}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface GridCardProps {
  room: RoomWithUser;
  team: Pick<Team, "slug" | "id" | "name">;
  inputRef: React.RefObject<HTMLInputElement>;
  newName: string;
  isUpdating: boolean;
  onOpenRenameForm: (room: RoomWithUser) => void;
  onChangeName: (v: string) => void;
  onSave: (roomId: string) => void;
  onCancelRename: () => void;
  onDelete: (id: string) => void;
}

function GridCard({
  room,
  team,
  inputRef,
  newName,
  isUpdating,
  onOpenRenameForm,
  onChangeName,
  onSave,
  onCancelRename,
  onDelete,
}: GridCardProps) {
  return (
    <Link
      key={room.id}
      href={`/team/${team.slug}/whiteboard/${room.slug}`}
      className="group relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 overflow-hidden"
    >
      {/* Preview area */}
      <div className="aspect-video bg-[#0f0f0f] relative overflow-hidden">
        <GridCardPreview room={room} />
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg shadow-lg">
            Open
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="p-3 flex items-center justify-between">
        <GridCardMeta room={room} />
        <RoomDropdownMenu
          room={room}
          teamSlug={team.slug}
          inputRef={inputRef}
          newName={newName}
          isUpdating={isUpdating}
          labelSuffix="grid"
          onOpenRenameForm={onOpenRenameForm}
          onChangeName={onChangeName}
          onSave={onSave}
          onCancelRename={onCancelRename}
          onDelete={onDelete}
        />
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  canCreate: boolean;
  onCreateClick: () => void;
}

function EmptyState({ canCreate, onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center bg-transparent justify-center text-center relative group h-screen">
      <div className="z-20 w-full h-full flex justify-center items-center flex-col">
        <Image
          src="https://i.pinimg.com/1200x/83/e3/4a/83e34a9eabb6ea03a585288b079efcf7.jpg"
          alt="Create events"
          className="w-auto rounded-md h-[130px] mb-3"
          height={1000}
          width={1000}
        />
        <p className="text-zinc-400 font-medium mb-1">No whiteboards yet</p>
        <p className="text-zinc-600 text-sm mb-6">Create your first collaborative whiteboard</p>
        {canCreate && (
          <button type="button"
            onClick={onCreateClick}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Create Whiteboard
          </button>
        )}
      </div>
      <div className="absolute inset-0 z-10 h-full w-full items-center [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface ListHeaderRowProps {
  roomCount: number;
  query: string;
  onQueryChange: (v: string) => void;
}

function ListHeaderRow({ roomCount, query, onQueryChange }: ListHeaderRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm border rounded-xl border-border dark:border-[#222] text-[#646464] dark:text-[#B4B4B4] hover:text-foreground transition-colors px-2 py-1"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort
          </button>
          <p className="text-sm text-[#646464] dark:text-[#B4B4B4] border rounded-xl border-border dark:border-[#222] px-2 py-1">
            {roomCount} whiteboard{roomCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="relative sm:block flex w-56 pl-3 justify-center items-center text-sm border rounded-xl border-border dark:border-[#222] text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
          <Search className="w-3.5 h-3.5 absolute top-3" />
          <input
            aria-label='search-input'
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-12 pr-4 py-1 rounded-xl text-sm text-gray-300 placeholder-[#191919] outline-none focus-visible:no-underline bg-transparent"
          />
        </div>
      </div>

      <div className="border-t border-border dark:border-[#1F1F1F]">
        <div className="grid grid-cols-[1fr_140px_140px_140px_140px_80px_40px] gap-2 px-4 py-1.5 text-xs font-medium text-[#646464] dark:text-[#B4B4B4] border-b border-border dark:border-[#1F1F1F]">
          <span>Name</span>
          <span>Location</span>
          <span>Date updated</span>
          <span>Date created</span>
          <span className="flex items-center gap-1">
            Date viewed
            <ArrowUpDown className="size-3" />
          </span>
          <span>Creator</span>
          <span />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface CreateModalProps {
  newRoomName: string;
  creating: boolean;
  onNameChange: (v: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

function CreateModal({ newRoomName, creating, onNameChange, onCreate, onClose }: CreateModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">New Whiteboard</h2>
        <p className="text-sm text-zinc-500 mb-5">Give your whiteboard a name</p>
        <input
          aria-label='text-input'
          type="text"
          placeholder="e.g. Q3 Planning, Sprint Retrospective…"
          value={newRoomName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCreate();
            if (e.key === "Escape") onClose();
          }}
          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          maxLength={80}
        />
        <div className="flex gap-3 mt-5">
          <button type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={!newRoomName.trim() || creating}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {creating && (
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {creating ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page component ────────────────────────────────────────────────────────────

const WhiteboardsPage: NextPage<PageProps> = ({ team, rooms: initialRooms, canCreate }) => {
  const router = useRouter();
  const { push } = useRouter();

  const [rooms, setRooms] = useState(initialRooms);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [hovered, setHovered] = useState(false);
  const [query, setQuery] = useState("");
  const [editingRoom, setEditingRoom] = useState<{ id: string; name: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openRenameForm = (room: RoomWithUser) => {
    setEditingRoom({ id: room.id, name: room.name });
    setNewName(room.name);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleRename = async (roomId: string) => {
    if (!newName.trim() || newName.trim() === editingRoom?.name) {
      setEditingRoom(null);
      return;
    }
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/team/${team.slug}/rooms`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, name: newName.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setEditingRoom(null);
    } catch {
      alert("Failed to rename room. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreate = async () => {
    if (!newRoomName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/team/${team.slug}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoomName.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      const { room } = await res.json();
      push(`/team/${team.slug}/whiteboard/${room.slug}`);
    } catch {
      setCreating(false);
      alert("Failed to create whiteboard. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      const res = await fetch(`/api/team/${team.slug}/rooms?roomId=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setRooms((prev) => prev.filter((r) => r.id !== id));
      if (
        router.pathname === "/team/[teamSlug]/whiteboard/[roomSlug]" &&
        router.query.roomId === id
      ) {
        push(`/team/${team.slug}/whiteboard`);
      }
    } catch (e) {
      console.error("Failed to delete room:", e);
      alert("Failed to delete room");
    }
  };

  const filteredRooms = useMemo(
    () => rooms.filter((r) => r.name.toLowerCase().includes(query.toLowerCase())),
    [rooms, query],
  );

  // Shared rename-form props for both list and grid
  const renameFormProps = {
    inputRef,
    newName,
    isUpdating,
    onOpenRenameForm: openRenameForm,
    onChangeName: setNewName,
    onSave: handleRename,
    onCancelRename: () => setEditingRoom(null),
  };

  return (
    <>
      <Head>
        <title>Whiteboards · {team.name}</title>
      </Head>
      <div className="flex w-screen !overflow-y-hidden max-h-screen h-screen">
        <Mainsidebar />
        <div className="min-h-screen dark:bg-[#111111] text-gray-100 w-full overflow-y-auto scrollbar-thin2">
          <Header />
          <header className="sticky top-0">
            <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex justify-center items-center gap-2">
                <div className="size-6 flex items-center justify-center">
                  <PenIcon size={16} className="text-black dark:text-white" />
                </div>
                <h1 className="text-md font-semibold text-black dark:text-white">All Whiteboards</h1>
              </div>

              <div className="flex items-center gap-3">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
                  <TabsList className="bg-secondary border divide-x-1 divide-[#333] border-border h-9 rounded-xl !px-0 !py-0 dark:border-[#333]">
                    <TabsTrigger value="list" className="px-2.5 py-1.5 rounded-xl rounded-r-none data-[state=active]:bg-accent">
                      <List className="size-4" />
                    </TabsTrigger>
                    <TabsTrigger value="grid" className="px-2.5 py-1.5 rounded-xl rounded-l-none data-[state=active]:bg-accent">
                      <LayoutGrid className="size-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {canCreate && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowCreate(true)}
                    className="flex justify-center items-center rounded-lg gap-1 dark:text-black text-white h-8 !px-1.5 dark:bg-white hover:bg-blue-700 text-sm"
                  >
                    <PlusIcon size={14} className="dark:text-black" />
                    {creating ? "Creating..." : "New Whiteboard"}
                  </Button>
                )}
              </div>
            </div>
          </header>

          <main className="max-w-full mx-auto bg-transparent relative">
            {rooms.length === 0 ? (
              <EmptyState canCreate={canCreate} onCreateClick={() => setShowCreate(true)} />
            ) : (
              <div className="px-0 py-8">
                {viewMode === "list" ? (
                  <div>
                    <ListHeaderRow
                      roomCount={rooms.length}
                      query={query}
                      onQueryChange={setQuery}
                    />
                    {filteredRooms.map((room) => (
                      <ListRow
                        key={room.id}
                        room={room}
                        team={team}
                        hovered={hovered}
                        onHover={setHovered}
                        onNavigate={(slug) => push(`/team/${team.slug}/whiteboard/${slug}`)}
                        onDelete={handleDelete}
                        {...renameFormProps}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 px-8">
                    {filteredRooms.map((room) => (
                      <GridCard
                        key={room.id}
                        room={room}
                        team={team}
                        onDelete={handleDelete}
                        {...renameFormProps}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>

          {showCreate && (
            <CreateModal
              newRoomName={newRoomName}
              creating={creating}
              onNameChange={setNewRoomName}
              onCreate={handleCreate}
              onClose={() => setShowCreate(false)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: { destination: `/login?callbackUrl=${ctx.resolvedUrl}`, permanent: false },
    };
  }

  const { teamSlug } = ctx.params as { teamSlug: string };

  const team = await prisma.team.findUnique({
    where: { slug: teamSlug },
    include: {
      members: {
        where: { userId: session.user.id },
        select: { id: true, role: true },
      },
    },
  });

  if (!team || !team.members.length) return { notFound: true };

  const membership = team.members[0];
  const canCreate = ["ADMIN", "OWNER", "MANAGER", "MEMBER"].includes(membership.role);

  const rooms = await prisma.room.findMany({
    where: { teamId: team.id, isArchived: false },
    include: { createdBy: { select: { id: true, name: true, image: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return {
    props: {
      team: { id: team.id, name: team.name, slug: team.slug },
      rooms: JSON.parse(JSON.stringify(rooms)),
      canCreate,
    },
  };
};

export default WhiteboardsPage;