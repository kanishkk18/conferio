

// "use client";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/reui/table";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/animate-ui/components/animate/tooltip";
// import { Label } from "@/components/ui/label";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import InviteModal from "@/components/InviteModal";
// import {
//   Modal,
//   ModalBody,
//   ModalContent,
//   ModalDescription,
//   ModalFooter,
//   ModalHeader,
//   ModalTitle,
// } from "@/components/ui/animated-modal";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
//   DropdownMenuCheckboxItem,
// } from "@/components/animate-ui/components/radix/dropdown-menu";
// import { Switch } from "@/components/ui/switch";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   FileText,
//   MoreHorizontal,
//   Search,
//   SlidersHorizontal,
//   Users,
//   Plus,
//   Trash2,
//   Star,
//   Archive,
//   Share2,
//   X,
//   Pin,
//   UserCheck,
//   Clock,
//   Calendar,
//   Loader2,
//   ArrowUpRight,
//   CheckCircle,
//   Info,
//   AlarmClock,
// } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";
// import { useEffect, useState, useRef } from "react";
// import CircularText from "@/components/ui/CircularTextLoader";
// import { AnimateIcon } from "../animate-ui/icons/icon";
// import { FileTextIcon } from "../ui/file-text";
// import { toast } from "sonner";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Card,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import NoteEditor from "@/components/NoteEditor";
// import { ClipboardList } from "@/components/animate-ui/icons/clipboard-list";
// // import { AlarmClock as AlarmClockIcon } from "../animate-ui/icons/alarm-clock";
// import { format, parseISO } from 'date-fns'
// import Link from "next/link";
// import MeetingDetail from "pages/meetings/[id]";
// import { redirect } from "next/navigation";

// // ─── Types ───────────────────────────────────────────────────────────────────

// interface Workspace {
//   id: string;
//   name: string;
//   slug: string;
//   description?: string;
// }

// interface Page {
//   id: string;
//   title: string;
//   createdAt: string;
//   updatedAt: string;
//   content?: any;
//   emoji?: string;
//   coverImage?: string;
//   isPublished?: boolean;
//   publishedUrl?: string;
//   children?: Page[];
//   parentId?: string;
// }

// interface Note {
//   id: string;
//   title: string;
//   emoji?: string;
//   content?: any;
//   isArchived: boolean;
//   isPinned: boolean;
//   isFavorite: boolean;
//   color?: string;
//   createdAt: string;
//   updatedAt: string;
//   preview?: string;
//   _count?: { blocks: number };
// }

// interface FavoritePage {
//   id: string;
//   title: string;
//   emoji?: string;
//   coverImage?: string;
//   workspace: { name: string };
//   favoritedAt: string;
//   updatedAt: string;
// }

// interface AssignedPage {
//   id: string;
//   title: string;
//   emoji?: string;
//   author: { name: string; image?: string };
//   workspace: { name: string };
//   assignedTo: {
//     team: { name: string };
//     user: { name: string };
//   };
//   updatedAt: string;
// }

// interface UserTask {
//   id: string;
//   title: string;
//   dueTime: string;
//   priority: string;
//   itsDone: boolean;
//   category?: { icon?: string };
// }

// interface Meeting {
//   id: string;
//   meetingName: string | null;
//   meetingUrl: string;
//   status: string;
//   videoUrl: string | null;
//   audioUrl: string | null;
//   s3VideoKey: string | null;
//   s3AudioKey: string | null;
//   duration: number | null;
//   transcript: any[];
//   speakers: string[];
//   summary: string | null;
//   actionItems: any[];
//   keyPoints: string[];
//   createdAt: string;
//   chatMessages: any[];
// }

// // ─── Columns ─────────────────────────────────────────────────────────────────

// const allColumns = ["Project", "Team", "Tech", "Created At", "Contributors", "Status", "action"] as const;

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// function formatDuration(seconds: number) {
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   if (hours > 0) return `${hours}h ${minutes}m`;
//   return `${minutes}m`;
// }

// function MeetingStatusBadge({ status }: { status: string }) {
//   const map: Record<string, { label: string; className: string }> = {
//     completed: { label: "Completed", className: "bg-green-100 text-green-700" },
//     recording: { label: "Recording", className: "bg-red-100 text-red-700 animate-pulse" },
//     processing: { label: "Processing", className: "bg-yellow-100 text-yellow-700" },
//     pending: { label: "Pending", className: "bg-gray-100 text-gray-600" },
//   };
//   const { label, className } = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
//   return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${className}`}>{label}</span>;
// }


// // ─── Main DocsTable ───────────────────────────────────────────────────────────

// function DocsTable({ page, currentPageId }: { page?: Page; currentPageId?: string }) {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const { push } = useRouter()

//   const { workspaceId } = router.query;

//   // Docs state
//   const [pages, setPages] = useState<Page[]>([]);
//   const [recentPages, setRecentPages] = useState<Page[]>([]);
//   const [members, setMembers] = useState<any[]>([]);
//   const [workspace, setWorkspace] = useState<Workspace | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [visibleColumns, setVisibleColumns] = useState<string[]>([...allColumns]);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [showInviteModal, setShowInviteModal] = useState(false);

//   // Notes state
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [notesLoading, setNotesLoading] = useState(false);
//   const [notesSearch, setNotesSearch] = useState("");

//   const [selectedNote, setSelectedNote] = useState<Note | null>(null);
//   const [isEditorOpen, setIsEditorOpen] = useState(false);
//   const [shareNote, setShareNote] = useState<Note | null>(null);
//   const [shareUrl, setShareUrl] = useState("");

//   // Favorites state
//   const [favorites, setFavorites] = useState<FavoritePage[]>([]);
//   const [favoritesLoading, setFavoritesLoading] = useState(false);

//   // Assigned state
//   const [assignedPages, setAssignedPages] = useState<AssignedPage[]>([]);
//   const [assignedLoading, setAssignedLoading] = useState(false);

//   // Reminders state
//   const [tasks, setTasks] = useState<UserTask[]>([]);
//   const [tasksLoading, setTasksLoading] = useState(false);

//   // Meetings state
//   const [meetings, setMeetings] = useState<Meeting[]>([]);
//   const [meetingsLoading, setMeetingsLoading] = useState(false);
//   const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
//   const [meetingModalOpen, setMeetingModalOpen] = useState(false);

//   const toggleColumn = (col: string) =>
//     setVisibleColumns((prev) =>
//       prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
//     );

//   // ── Initial fetches ────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (workspaceId && session) {
//       fetchWorkspace();
//       fetchRecentPages();
//       fetchPages();
//       fetchMembers();
//     }
//   }, [workspaceId, session]);

//   if (status === "unauthenticated") {
//     redirect('/auth/login');
//   }

//   const fetchPages = async () => {
//     try {
//       const r = await fetch(`/api/pages?workspaceId=${workspaceId}&tree=true`);
//       if (r.ok) setPages(await r.json());
//     } catch { }
//   };

//   const fetchWorkspace = async () => {
//     try {
//       const r = await fetch(`/api/workspaces/${workspaceId}`);
//       if (r.ok) setWorkspace(await r.json());
//       else push("/docs");
//     } catch { push("/docs"); }
//   };

//   const fetchRecentPages = async () => {
//     try {
//       const r = await fetch(`/api/pages?workspaceId=${workspaceId}`);
//       if (r.ok) setRecentPages(await r.json());
//     } catch { } finally { setLoading(false); }
//   };

//   const fetchMembers = async () => {
//     try {
//       const r = await fetch(`/api/workspaces/${workspaceId}/invite`);
//       if (r.ok) setMembers(await r.json());
//     } catch { }
//   };

//   // ── Tab-triggered fetches ─────────────────────────────────────────────────

//   const fetchNotes = async () => {
//     setNotesLoading(true);
//     try {
//       let url = "/api/notes?";
//       // if (notesTab === "archived") url += "archived=true&";
//       // else if (notesTab === "favorites") url += "favorite=true&";
//       // else url += "archived=false&";
//       if (notesSearch) url += `search=${encodeURIComponent(notesSearch)}&`;
//       const r = await fetch(url);
//       if (r.ok) setNotes(await r.json());
//     } catch { toast.error("Failed to load notes"); }
//     finally { setNotesLoading(false); }
//   };

//   const fetchFavorites = async () => {
//     setFavoritesLoading(true);
//     try {
//       const r = await fetch("/api/pages/favorites");
//       if (r.ok) setFavorites(await r.json());
//     } catch { } finally { setFavoritesLoading(false); }
//   };

//   const fetchAssigned = async () => {
//     setAssignedLoading(true);
//     try {
//       const r = await fetch("/api/pages/assigned-to-me");
//       if (r.ok) setAssignedPages(await r.json());
//     } catch { } finally { setAssignedLoading(false); }
//   };

//   const fetchTasks = async () => {
//     setTasksLoading(true);
//     try {
//       const r = await fetch("/api/task");
//       if (r.ok) setTasks(await r.json());
//     } catch { } finally { setTasksLoading(false); }
//   };

//   const fetchMeetings = async () => {
//     setMeetingsLoading(true);
//     try {
//       const r = await fetch("/api/aimeetings");
//       if (r.ok) setMeetings(await r.json());
//     } catch { } finally { setMeetingsLoading(false); }
//   };

//   // ── Actions ───────────────────────────────────────────────────────────────

//   const handleShare = async () => {
//     try {
//       const r = await fetch(`/api/pages/${page?.id}/share`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ type: "VIEW" }),
//       });
//       if (r.ok) {
//         const data = await r.json();
//         navigator.clipboard.writeText(data.shareUrl);
//         toast.success("Share link copied to clipboard!");
//       }
//     } catch { toast.error("Failed to create share link"); }
//     setShowShareModal(false);
//   };

//   const createNewPage = async (parentId?: string) => {
//     try {
//       const r = await fetch("/api/pages/create", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ workspaceId, parentId, title: "Untitled" }),
//       });
//       if (r.ok) {
//         const p = await r.json();
//         await fetchPages();
//         push(`/workspace/${workspaceId}/page/${p.id}`);
//       } else throw new Error();
//     } catch { toast.error("Failed to create page"); }
//   };

//   const deletePage = async (pageId: string) => {
//     if (!confirm("Are you sure you want to delete this page? This action cannot be undone.")) return;
//     try {
//       const r = await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
//       if (r.ok) {
//         await fetchPages();
//         if (currentPageId === pageId) push(`/workspace/${workspaceId}`);
//         toast.success("Page deleted successfully");
//       } else throw new Error();
//     } catch { toast.error("Failed to delete page"); }
//   };

//   // Notes actions
//   const createNote = async () => {
//     try {
//       const r = await fetch("/api/notes", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ title: "Untitled Note", content: { blocks: [] } }),
//       });
//       if (r.ok) {
//         const note = await r.json();
//         setNotes([note, ...notes]);
//         setSelectedNote(note);
//         setIsEditorOpen(true);
//         toast.success("Note created");
//       }
//     } catch { toast.error("Failed to create note"); }
//   };

//   const deleteNote = async (noteId: string, e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (!confirm("Are you sure?")) return;
//     try {
//       const r = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
//       if (r.ok) { setNotes(notes.filter((n) => n.id !== noteId)); toast.success("Note deleted"); }
//     } catch { toast.error("Failed to delete note"); }
//   };

//   const toggleFavoriteNote = async (note: Note, e: React.MouseEvent) => {
//     e.stopPropagation();
//     try {
//       const method = note.isFavorite ? "DELETE" : "POST";
//       const r = await fetch(`/api/notes/favorite?noteId=${note.id}`, { method });
//       if (r.ok) {
//         // if (notesTab === "favorites" && note.isFavorite) setNotes(notes.filter((n) => n.id !== note.id));
//         // else setNotes(notes.map((n) => n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n));
//         toast.success(note.isFavorite ? "Removed from favorites" : "Added to favorites");
//       }
//     } catch { toast.error("Failed to update favorite"); }
//   };

//   const toggleArchiveNote = async (note: Note, e: React.MouseEvent) => {
//     e.stopPropagation();
//     try {
//       const r = await fetch(`/api/notes/${note.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isArchived: !note.isArchived }),
//       });
//       if (r.ok) {
//         // if (notesTab !== "all") setNotes(notes.filter((n) => n.id !== note.id));
//         // else setNotes(notes.map((n) => n.id === note.id ? { ...n, isArchived: !n.isArchived } : n));
//         toast.success(note.isArchived ? "Note restored" : "Note archived");
//       }
//     } catch { toast.error("Failed to update note"); }
//   };

//   const removeFavorite = async (pageId: string, e: React.MouseEvent) => {
//     e.stopPropagation();
//     try {
//       const r = await fetch(`/api/pages/favorites?pageId=${pageId}`, { method: "DELETE" });
//       if (r.ok) { setFavorites(favorites.filter((f) => f.id !== pageId)); toast.success("Removed from favorites"); }
//     } catch { toast.error("Failed to remove favorite"); }
//   };

//   const openMeetingDetail = (meetingId: string) => {
//     setSelectedMeetingId(meetingId);
//     setMeetingModalOpen(true);
//   };

//   if (status === "loading" || loading) {
//     return (
//       <div className="h-full flex items-center justify-center">
//         <CircularText text="CONFERIO*CALLS*" onHover="speedUp" spinDuration={5} className="custom-class" />
//       </div>
//     );
//   }

//   // ── Render ────────────────────────────────────────────────────────────────

//   return (
//     <>
//       <Tabs
//         defaultValue="all"
//         className="w-full pb-10"
//         onValueChange={(val) => {
//           if (val === "notes") fetchNotes();
//           if (val === "favorites") fetchFavorites();
//           if (val === "assigned") fetchAssigned();
//           if (val === "reminders") fetchTasks();
//           if (val === "meeting-notes") fetchMeetings();
//         }}
//       >
//         <div className="flex flex-wrap items-center justify-between bg-white dark:bg-transparent">
//           <TabsList className="bg-transparent flex justify-between w-full px-4 rounded-none border-b">
//             <div>
//               <TabsTrigger value="all">All</TabsTrigger>
//               <TabsTrigger value="notes">Notes</TabsTrigger>
//               <TabsTrigger value="reminders">Reminders</TabsTrigger>
//               <TabsTrigger value="assigned">
//                 <UserCheck className="h-4 w-4" />
//                 <p>Assigned</p>
//                 {assignedPages.length > 0 && (
//                   <span className="text-xs text-muted-foreground">{assignedPages.length}</span>
//                 )}
//               </TabsTrigger>
//               <TabsTrigger value="favorites">
//                 <Star className="h-3 w-3 mr-1" />
//                 <p>Favorites </p>
//                 {favorites.length > 0 && (
//                   <span className="text-xs text-muted-foreground">{favorites.length}</span>
//                 )}
//               </TabsTrigger>
//               <TabsTrigger value="meeting-notes">Meeting Notes</TabsTrigger>
//             </div>

//             <div className="flex items-center gap-2">

//               {/* <div className="flex items-center justify-between mb-4">
//                 <div className="relative flex-1 max-w-sm">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     placeholder="Search notes..."
//                     value={notesSearch}
//                     onChange={(e) => setNotesSearch(e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && fetchNotes()}
//                     className="pl-9"
//                   />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Button onClick={createNote} className="bg-[#3530c6] hover:bg-[#2a26a0]" size="sm">
//                     <Plus className="size-4 mr-1" /> New Note
//                   </Button>
//                 </div>
//               </div> */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" size="sm" className="flex items-center gap-1.5 px-2 py-1.5 text-muted-foreground text-sm">
//                     <SlidersHorizontal className="size-4" />
//                     Filters
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-48">
//                   {allColumns.map((col) => (
//                     <DropdownMenuCheckboxItem
//                       key={col}
//                       checked={visibleColumns.includes(col)}
//                       onCheckedChange={() => toggleColumn(col)}
//                     >
//                       {col}
//                     </DropdownMenuCheckboxItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </TabsList>

//           {/* ── All Docs Tab ─────────────────────────────────────────────── */}
//           <TabsContent value="all" className="w-full min-w-full">
//             <Table className="w-full">
//               <TableHeader>
//                 <TableRow>
//                   {visibleColumns.includes("Project") && <TableHead className="w-[300px] h-0 pl-10 py-1">Name</TableHead>}
//                   {visibleColumns.includes("Team") && <TableHead className="w-[100px] h-0 py-0">Location</TableHead>}
//                   {visibleColumns.includes("Tech") && <TableHead className="w-[100px] h-0 py-0">Tags</TableHead>}
//                   {visibleColumns.includes("Created At") && <TableHead className="w-[100px] h-0 py-0">Date updated</TableHead>}
//                   {visibleColumns.includes("Contributors") && <TableHead className="w-[100px] h-0 py-0">Date viewed</TableHead>}
//                   {visibleColumns.includes("Status") && <TableHead className="w-[50px] h-0 py-0">Sharing</TableHead>}
//                   {visibleColumns.includes("action") && <TableHead className="w-[50px] h-0 py-0">Actions</TableHead>}
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {recentPages.length > 0 ? (
//                   recentPages.map((p) => (
//                     <TableRow key={p.id} className="cursor-pointer dark:hover:bg-[#191919] hover:bg-[#fff]">
//                       {visibleColumns.includes("Project") && (
//                         <AnimateIcon animateOnHover>
//                           <TableCell
//                             className="font-medium flex gap-2 pl-10 h-0 py-0 text-sm dark:text-[#EEEEEE]"
//                             onClick={() => push(`/workspace/${workspaceId}/page/${p.id}`)}
//                           >
//                             <div className="mt-2 !h-3 !w-3">{p.emoji || <FileText className="!h-4 !w-4 mt-1 dark:text-[#7D7A75] text-[#201f1f]" />}</div>
//                             <p className="text-sm mt-2">{p.title || "Doc"}</p>
//                           </TableCell>
//                         </AnimateIcon>
//                       )}
//                       {visibleColumns.includes("Team") && <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">Everything</TableCell>}
//                       {visibleColumns.includes("Tech") && <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">-</TableCell>}
//                       {visibleColumns.includes("Created At") && (
//                         <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
//                           {new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
//                         </TableCell>
//                       )}
//                       {visibleColumns.includes("action") && (
//                         <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-2">
//                           {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
//                         </TableCell>
//                       )}
//                       {visibleColumns.includes("Status") && (
//                         <TableCell className="min-w-[120px] py-0 h-0">
//                           {members.length > 0 && (
//                             <div className="flex -gap-x-1">
//                               <TooltipProvider>
//                                 {members.slice(0, 5).map((member, index) => (
//                                   <Tooltip key={member.user?.id || index}>
//                                     <TooltipTrigger>
//                                       <Avatar className="h-6 w-6 hover:z-10">
//                                         <AvatarImage
//                                           src={member.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user?.name ?? "U")}&background=random`}
//                                           alt={member.user?.name}
//                                         />
//                                         <AvatarFallback>{member.user?.name?.[0] ?? "U"}</AvatarFallback>
//                                       </Avatar>
//                                     </TooltipTrigger>
//                                     <TooltipContent>
//                                       <p className="font-semibold">{member.user?.name}</p>
//                                       <p className="text-xs">{member.user?.email}</p>
//                                     </TooltipContent>
//                                   </Tooltip>
//                                 ))}
//                               </TooltipProvider>
//                             </div>
//                           )}
//                         </TableCell>
//                       )}
//                       {visibleColumns.includes("Contributors") && (
//                         <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-2">
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <MoreHorizontal className="h-4 w-4 cursor-pointer" />
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end">
//                               <DropdownMenuItem onClick={() => setShowShareModal(true)}>
//                                 <Users className="mr-2 h-4 w-4" /> Share & Invite
//                               </DropdownMenuItem>
//                               <DropdownMenuItem onClick={() => setShowInviteModal(true)}>
//                                 <Users className="mr-2 h-4 w-4" /> Manage members
//                               </DropdownMenuItem>
//                               <DropdownMenuSeparator />
//                               <DropdownMenuItem onClick={() => createNewPage(p.id)}>
//                                 <Plus className="mr-2 h-4 w-4" /> Add subpage
//                               </DropdownMenuItem>
//                               <DropdownMenuItem onClick={() => deletePage(p.id)} className="text-red-600">
//                                 <Trash2 className="mr-2 h-4 w-4" /> Delete
//                               </DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </TableCell>
//                       )}
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={visibleColumns.length} className="text-center py-12 text-muted-foreground">
//                       No pages found. Create your first page to get started.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TabsContent>

//           {/* ── Notes Tab ───────────────────────────────────────────────── */}
//           <TabsContent value="notes" className="w-full min-w-full   p-4 ">


//             {notesLoading ? (
//               <div className="flex items-center justify-center py-16">
//                 <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
//               </div>
//             ) : notes.length === 0 ? (
//               <div className="text-center py-16 text-muted-foreground">
//                 <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
//                 <p className="text-sm">No notes found. Create your first note!</p>
//               </div>
//             ) : (
//               <div className="">
//                 <>
//                   <Table className="w-full">
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead className="w-[300px] h-0 pl-10 py-1">Note</TableHead>
//                         <TableHead className="w-[100px] h-0 py-0">Content</TableHead>
//                         <TableHead className="w-[100px] h-0 py-0">Blocks</TableHead>
//                         <TableHead className="w-[100px] h-0 py-0">Priority</TableHead>
//                         <TableHead className="w-[100px] h-0 py-0">Updated Date</TableHead>
//                         <TableHead className="w-[100px] h-0 py-0">Status</TableHead>
//                         <TableHead className="w-[100px] h-0 py-0">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody className="!px-0">
//                       {notes.map((note) => (
//                         <TableRow key={note.id} onClick={() => { setSelectedNote(note); setIsEditorOpen(true); }} className="dark:hover:bg-[#191919] cursor-pointer hover:bg-[#FCFCFC] transition-shadow group">
//                           <TableCell className="font-medium flex gap-2 pl-10 h-0 py-4 text-sm dark:text-[#EEEEEE]">

//                             <div className="flex items-center gap-2 flex-1 min-w-0">
//                               <span className="text-sm">{note.emoji || <FileText className="!h-4 !w-4 dark:text-[#7D7A75] text-[#201f1f]" />}</span>
//                               <h3 className="font-semibold capitalize truncate">{note.title || "Untitled"}</h3>
//                             </div>
//                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                               {note.isPinned && <Pin className="h-3 w-3 text-blue-500 fill-blue-500" />}
//                               {note.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
//                             </div>

//                           </TableCell>
//                           <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
//                             <p className="text-sm  mt-2 line-clamp-2">{note.preview || "No content"}</p>
//                           </TableCell>

//                           <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
//                             <span>{note._count?.blocks || 0} blocks</span>
//                           </TableCell>
//                           <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
//                             <span className={cn(
//                               "text-[10px] font-semibold px-2 py-0.5 rounded-full",
//                               note.isPinned ? "bg-red-100 text-red-700" :
//                                 note.isFavorite ? "bg-yellow-100 text-yellow-700" :
//                                   "bg-gray-100 text-gray-600"
//                             )}>
//                               {note.isPinned ? "Pinned" : note.isFavorite ? "Favorite" : "Normal"}
//                             </span>
//                           </TableCell>
//                           <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">{new Date(note.updatedAt).toLocaleDateString()}</TableCell>
//                           <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
//                             {note.isArchived
//                               ? <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="h-3 w-3" /> Archived </span>
//                               : <span className="text-xs text-muted-foreground">_</span>
//                             }
//                           </TableCell>
//                           <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
//                             {/* <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => toggleFavoriteNote(note, e)}>
//                               <Star className={cn("h-3 w-3", note.isFavorite && "text-yellow-500 fill-yellow-500")} />
//                             </Button> */}
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
//                                   <MoreHorizontal className="h-3 w-3" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuItem onClick={(e) => toggleArchiveNote(note, e)}>
//                                   <Archive className="mr-2 h-4 w-4" /> {note.isArchived ? "Restore" : "Archive"}
//                                 </DropdownMenuItem>
//                                 <DropdownMenuSeparator />
//                                 <DropdownMenuItem onClick={(e) => deleteNote(note.id, e)} className="text-red-600">
//                                   <Trash2 className="mr-2 h-4 w-4" /> Delete
//                                 </DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </>

//               </div>
//             )}
//           </TabsContent>

//           {/* ── Reminders Tab ───────────────────────────────────────────── */}
//           <TabsContent value="reminders" className="w-full min-w-full">

//             {tasksLoading ? (
//               <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
//             ) : tasks.length === 0 ? (
//               <div className="text-center py-16 text-muted-foreground">
//                 <AlarmClock className="h-12 w-12 mx-auto mb-3 opacity-30" />
//                 <p className="text-sm">No reminders yet.</p>
//               </div>
//             ) : (
//               <Table className="w-full">
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="pl-4">Task</TableHead>
//                     <TableHead>Priority</TableHead>
//                     <TableHead>Due Date</TableHead>
//                     <TableHead>Status</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {tasks.map((t) => (
//                     <TableRow key={t.id} className="dark:hover:bg-[#191919]">
//                       <TableCell className="pl-4 font-medium text-sm">{t.title}</TableCell>
//                       <TableCell>
//                         <span className={cn(
//                           "text-[10px] font-semibold px-2 py-0.5 rounded-full",
//                           t.priority === "HIGH" ? "bg-red-100 text-red-700" :
//                             t.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
//                               "bg-gray-100 text-gray-600"
//                         )}>
//                           {t.priority}
//                         </span>
//                       </TableCell>
// <TableCell className="text-sm text-muted-foreground">
//   {format(typeof t.dueTime === 'string' ? parseISO(t.dueTime) : t.dueTime, "MMM dd, yyyy")}
// </TableCell>                      <TableCell>
//                         {t.itsDone
//                           ? <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="h-3 w-3" /> Done</span>
//                           : <span className="text-xs text-muted-foreground">Pending</span>
//                         }
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </TabsContent>

//           {/* ── Assigned Tab ────────────────────────────────────────────── */}
//           <TabsContent value="assigned" className="w-full min-w-full   p-4 ">

//             {assignedLoading ? (
//               <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
//             ) : assignedPages.length === 0 ? (
//               <div className="text-center py-16 text-muted-foreground">
//                 <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
//                 <p className="text-sm">No pages assigned to you yet.</p>
//               </div>
//             ) : (
//               <Table className="w-full">
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="pl-10">Page</TableHead>
//                     <TableHead>Assigned by</TableHead>
//                     <TableHead>Team</TableHead>
//                     <TableHead>Last updated</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {assignedPages.map((p) => (
//                     <TableRow key={p.id} className="cursor-pointer dark:hover:bg-[#191919]" onClick={() => push(`/workspace/${workspaceId}/page/${p.id}`)}>
//                       <TableCell className="pl-10 flex items-center gap-2 font-medium text-sm">
//                         {p.emoji ? <span>{p.emoji}</span> : <FileText className="h-4 w-4 text-muted-foreground" />}
//                         {p.title}
//                       </TableCell>
//                       <TableCell className="text-muted-foreground text-sm">{p.author.name}</TableCell>
//                       <TableCell className="text-sm text-blue-600">{p.assignedTo?.team?.name ?? "—"}</TableCell>
//                       <TableCell className="text-muted-foreground text-sm">{new Date(p.updatedAt).toLocaleDateString()}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </TabsContent>

//           {/* ── Favorites Tab ───────────────────────────────────────────── */}
//           <TabsContent value="favorites" className="w-full min-w-full   p-0">

//             {favoritesLoading ? (
//               <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
//             ) : favorites.length === 0 ? (
//               <div className="text-center py-16 text-muted-foreground">
//                 <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
//                 <p className="text-sm">No favorites yet. Star a page to add it here.</p>
//               </div>
//             ) : (
//               <Table className="w-full">
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="pl-10">Page</TableHead>
//                     <TableHead>Workspace</TableHead>
//                     <TableHead>Favorited</TableHead>
//                     <TableHead>Last updated</TableHead>
//                     <TableHead></TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {favorites.map((fav) => (
//                     <TableRow key={fav.id} className="cursor-pointer dark:hover:bg-[#191919]" onClick={() => push(`/workspace/${workspaceId}/page/${fav.id}`)}>
//                       <TableCell className="pl-10 flex items-center gap-2 font-medium text-sm">
//                         {fav.emoji ? <span>{fav.emoji}</span> : <ClipboardList className="h-4 w-4 dark:text-[#B4B4B4]" />}
//                         {fav.title}
//                       </TableCell>
//                       <TableCell className="text-muted-foreground text-sm">{fav.workspace.name}</TableCell>
//                       <TableCell className="text-muted-foreground text-sm">{new Date(fav.favoritedAt).toLocaleDateString()}</TableCell>
//                       <TableCell className="text-muted-foreground text-sm">{new Date(fav.updatedAt).toLocaleDateString()}</TableCell>
//                       <TableCell>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-7 w-7 text-yellow-500 hover:text-yellow-600"
//                           onClick={(e) => removeFavorite(fav.id, e)}
//                         >
//                           <X className="h-3 w-3" />
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </TabsContent>

//           {/* ── Meeting Notes Tab ────────────────────────────────────────── */}
//           <TabsContent value="meeting-notes" className="w-full min-w-full   p-0">

//             {meetingsLoading ? (
//               <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
//             ) : meetings.length === 0 ? (
//               <div className="text-center py-16 text-muted-foreground">
//                 <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
//                 <p className="text-sm mb-4">No meetings recorded yet.</p>
//                 <Link href="/meetings/new">
//                   <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
//                     <Plus className="h-3 w-3 mr-1" /> Join Your First Meeting
//                   </Button>
//                 </Link>
//               </div>
//             ) : (
//               <Table className="w-full">
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="pl-10">Meeting</TableHead>
//                     <TableHead>Date</TableHead>
//                     <TableHead>Duration</TableHead>
//                     <TableHead>Speakers</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead></TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {meetings.map((m) => (
//                     <TableRow
//                       key={m.id}
//                       className="cursor-pointer dark:hover:bg-[#191919] hover:bg-[#f9f9f9]"
//                       onClick={() => openMeetingDetail(m.id)}
//                     >
//                       <TableCell className="pl-10 font-medium text-sm">
//                         <div className="flex items-center gap-2">
//                           <div className="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
//                             <Calendar className="h-3.5 w-3.5 text-blue-500" />
//                           </div>
//                           <span className="truncate max-w-[220px]">{m.meetingName || "Untitled Meeting"}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-muted-foreground text-sm">
//                         {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
//                       </TableCell>
//                       <TableCell className="text-muted-foreground text-sm">
//                         {m.duration ? formatDuration(m.duration) : "—"}
//                       </TableCell>
//                       <TableCell className="text-muted-foreground text-sm">
//                         {m.speakers?.length ? (
//                           <span className="flex items-center gap-1">
//                             <Users className="h-3 w-3" /> {m.speakers.length}
//                           </span>
//                         ) : "—"}
//                       </TableCell>
//                       <TableCell><MeetingStatusBadge status={m.status} /></TableCell>
//                       <TableCell>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-7 w-7 opacity-0 group-hover:opacity-100"
//                           onClick={(e) => { e.stopPropagation(); openMeetingDetail(m.id); }}
//                         >
//                           <ArrowUpRight className="h-3.5 w-3.5" />
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </TabsContent>
//         </div>
//       </Tabs>

//       {/* ── Share Modal ─────────────────────────────────────────────────────── */}
//       <Modal open={showShareModal} onOpenChange={setShowShareModal}>
//         <ModalBody>
//           <ModalContent>
//             <ModalHeader>
//               <ModalTitle>Share this page</ModalTitle>
//               <ModalDescription>Anyone with the link can view this page</ModalDescription>
//             </ModalHeader>
//             <div className="space-y-4 mt-4">
//               <div className="flex items-center gap-x-2">
//                 <Switch id="public-access" />
//                 <Label htmlFor="public-access">Allow public access</Label>
//               </div>
//               <div className="flex items-center gap-x-2">
//                 <Switch id="allow-comments" />
//                 <Label htmlFor="allow-comments">Allow comments</Label>
//               </div>
//               <div className="flex items-center gap-x-2">
//                 <Switch id="allow-editing" />
//                 <Label htmlFor="allow-editing">Allow editing</Label>
//               </div>
//             </div>
//           </ModalContent>
//           <ModalFooter className="gap-3">
//             <Button variant="outline" onClick={() => setShowShareModal(false)}>Cancel</Button>
//             <Button onClick={handleShare}>Copy link</Button>
//           </ModalFooter>
//         </ModalBody>
//       </Modal>

//       {/* ── Invite Modal ────────────────────────────────────────────────────── */}
//       <InviteModal
//         open={showInviteModal}
//         onOpenChange={setShowInviteModal}
//         workspaceId={workspaceId as string}
//         members={members}
//         onMembersUpdate={fetchMembers}
//       />

//       {/* ── Note Editor Modal ───────────────────────────────────────────────── */}
//       <Modal open={isEditorOpen} onOpenChange={setIsEditorOpen}>
//         <ModalBody className="max-w-5xl h-[60vh] !p-0">
//           <ModalContent className="w-full h-full !px-0 !py-0">
//             {selectedNote && (
//               <NoteEditor
//                 note={selectedNote}
//                 onUpdate={(updated) => setNotes(notes.map((n) => n.id === updated.id ? { ...n, ...updated } : n))}
//                 onClose={() => setIsEditorOpen(false)}
//               />
//             )}
//           </ModalContent>
//         </ModalBody>
//       </Modal>

//       {/* ── Note Share Dialog ──────────────────────────────────────────────── */}
//       <Dialog open={!!shareNote} onOpenChange={() => setShareNote(null)}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Share Note</DialogTitle>
//             <DialogDescription>Anyone with this link can view your note</DialogDescription>
//           </DialogHeader>
//           <div className="flex items-center gap-2 mt-4">
//             <Input value={shareUrl} readOnly className="flex-1" />
//             <Button onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy</Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ── Meeting Detail Modal ────────────────────────────────────────────── */}
//       <MeetingDetail
//         id={selectedMeetingId}
//         open={meetingModalOpen}
//         onClose={() => { setMeetingModalOpen(false); setSelectedMeetingId(null); }}
//       />
//     </>
//   );
// }

// export default DocsTable;


"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/reui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/animate/tooltip";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import InviteModal from "@/components/InviteModal";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/animated-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  MoreHorizontal,
  SlidersHorizontal,
  Users,
  Plus,
  Trash2,
  Star,
  Archive,
  X,
  Pin,
  UserCheck,
  Calendar,
  Loader2,
  ArrowUpRight,
  CheckCircle,
  AlarmClock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AnimateIcon } from "../animate-ui/icons/icon";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NoteEditor from "@/components/NoteEditor";
import { ClipboardList } from "@/components/animate-ui/icons/clipboard-list";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import MeetingDetail from "pages/meetings/[id]";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Page {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  content?: any;
  emoji?: string;
  coverImage?: string;
  isPublished?: boolean;
  publishedUrl?: string;
  children?: Page[];
  parentId?: string;
}

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

interface FavoritePage {
  id: string;
  title: string;
  emoji?: string;
  coverImage?: string;
  workspace: { name: string };
  favoritedAt: string;
  updatedAt: string;
}

interface AssignedPage {
  id: string;
  title: string;
  emoji?: string;
  author: { name: string; image?: string };
  workspace: { name: string };
  assignedTo: {
    team: { name: string };
    user: { name: string };
  };
  updatedAt: string;
}

interface UserTask {
  id: string;
  title: string;
  dueTime: string;
  priority: string;
  itsDone: boolean;
  category?: { icon?: string };
}

interface Meeting {
  id: string;
  meetingName: string | null;
  meetingUrl: string;
  status: string;
  videoUrl: string | null;
  audioUrl: string | null;
  s3VideoKey: string | null;
  s3AudioKey: string | null;
  duration: number | null;
  transcript: any[];
  speakers: string[];
  summary: string | null;
  actionItems: any[];
  keyPoints: string[];
  createdAt: string;
  chatMessages: any[];
}

// WorkspaceData is defined in WorkspaceHome and passed down.
// We only declare the shape we need here to keep DocsTable self-contained.
export interface WorkspaceData {
  workspace: { id: string; name: string; slug: string; description?: string } | null;
  pages: Page[];
  recentPages: Page[];
  members: { user: { id: string; name: string; email: string; image?: string } }[];
  favorites: FavoritePage[];
  assignedToMe: AssignedPage[];
  refetchPages: () => Promise<void>;
  refetchMembers: () => Promise<void>;
  createNewPage: (parentId?: string) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
}

// ─── Columns ─────────────────────────────────────────────────────────────────

const allColumns = ["Project", "Team", "Tech", "Created At", "Contributors", "Status", "action"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function MeetingStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    completed: { label: "Completed", className: "bg-green-100 text-green-700" },
    recording: { label: "Recording", className: "bg-red-100 text-red-700 animate-pulse" },
    processing: { label: "Processing", className: "bg-yellow-100 text-yellow-700" },
    pending: { label: "Pending", className: "bg-gray-100 text-gray-600" },
  };
  const { label, className } = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}

// ─── Main DocsTable ───────────────────────────────────────────────────────────
// All workspace/pages/members/favorites/assigned data comes from the parent
// via workspaceData — no initial fetch useEffect inside this component.
// Only notes, reminders, and meetings are lazy-fetched on tab switch.

function DocsTable({ workspaceData }: { workspaceData: WorkspaceData }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { push } = useRouter();
  const { workspaceId } = router.query;

  // ── Destructure shared data from parent ─────────────────────────────────
  const {
    workspace,
    recentPages,
    members,
    favorites: parentFavorites,
    assignedToMe: parentAssigned,
    refetchPages,
    refetchMembers,
    createNewPage,
    deletePage,
  } = workspaceData;

  // ── Local UI state ───────────────────────────────────────────────────────
  const [visibleColumns, setVisibleColumns] = useState<string[]>([...allColumns]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Notes — lazy (loaded on tab switch)
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesSearch, setNotesSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [shareNote, setShareNote] = useState<Note | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  // Favorites tab — starts from parent data, refreshable on tab switch
  const [favorites, setFavorites] = useState<FavoritePage[]>(parentFavorites);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Assigned tab — starts from parent data, refreshable on tab switch
  const [assignedPages, setAssignedPages] = useState<AssignedPage[]>(parentAssigned);
  const [assignedLoading, setAssignedLoading] = useState(false);

  // Reminders — lazy
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Meetings — lazy
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  // Keep local tab copies in sync when parent re-fetches
  useEffect(() => { setFavorites(parentFavorites); }, [parentFavorites]);
  useEffect(() => { setAssignedPages(parentAssigned); }, [parentAssigned]);

  // ── Column toggle ────────────────────────────────────────────────────────
  const toggleColumn = (col: string) =>
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );

  // ── Tab-triggered lazy fetches ───────────────────────────────────────────
  // These only run when the user clicks that tab — never on mount.

  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      let url = "/api/notes?";
      if (notesSearch) url += `search=${encodeURIComponent(notesSearch)}&`;
      const r = await fetch(url);
      if (r.ok) setNotes(await r.json());
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchFavoritesTab = async () => {
    setFavoritesLoading(true);
    try {
      const r = await fetch("/api/pages/favorites");
      if (r.ok) setFavorites(await r.json());
    } catch { } finally {
      setFavoritesLoading(false);
    }
  };

  const fetchAssignedTab = async () => {
    setAssignedLoading(true);
    try {
      const r = await fetch("/api/pages/assigned-to-me");
      if (r.ok) setAssignedPages(await r.json());
    } catch { } finally {
      setAssignedLoading(false);
    }
  };

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const r = await fetch("/api/task");
      if (r.ok) setTasks(await r.json());
    } catch { } finally {
      setTasksLoading(false);
    }
  };

  const fetchMeetings = async () => {
    setMeetingsLoading(true);
    try {
      const r = await fetch("/api/aimeetings");
      if (r.ok) setMeetings(await r.json());
    } catch { } finally {
      setMeetingsLoading(false);
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleShare = async () => {
    try {
      const r = await fetch(`/api/pages/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "VIEW" }),
      });
      if (r.ok) {
        const data = await r.json();
        navigator.clipboard.writeText(data.shareUrl);
        toast.success("Share link copied to clipboard!");
      }
    } catch {
      toast.error("Failed to create share link");
    }
    setShowShareModal(false);
  };

  // Notes actions
  const createNote = async () => {
    try {
      const r = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Note", content: { blocks: [] } }),
      });
      if (r.ok) {
        const note = await r.json();
        setNotes([note, ...notes]);
        setSelectedNote(note);
        setIsEditorOpen(true);
        toast.success("Note created");
      }
    } catch {
      toast.error("Failed to create note");
    }
  };

  const deleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure?")) return;
    try {
      const r = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (r.ok) {
        setNotes(notes.filter((n) => n.id !== noteId));
        toast.success("Note deleted");
      }
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const toggleArchiveNote = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const r = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: !note.isArchived }),
      });
      if (r.ok) {
        toast.success(note.isArchived ? "Note restored" : "Note archived");
      }
    } catch {
      toast.error("Failed to update note");
    }
  };

  const removeFavorite = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const r = await fetch(`/api/pages/favorites?pageId=${pageId}`, { method: "DELETE" });
      if (r.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== pageId));
        toast.success("Removed from favorites");
      }
    } catch {
      toast.error("Failed to remove favorite");
    }
  };

  const openMeetingDetail = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setMeetingModalOpen(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Tabs
        defaultValue="all"
        className="w-full pb-10"
        onValueChange={(val) => {
          if (val === "notes") fetchNotes();
          if (val === "favorites") fetchFavoritesTab();
          if (val === "assigned") fetchAssignedTab();
          if (val === "reminders") fetchTasks();
          if (val === "meeting-notes") fetchMeetings();
        }}
      >
        <div className="flex flex-wrap items-center justify-between bg-white dark:bg-transparent">
          <TabsList className="bg-transparent flex justify-between w-full px-4 rounded-none border-b">
            <div>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
              <TabsTrigger value="assigned">
                <UserCheck className="h-4 w-4" />
                <p>Assigned</p>
                {assignedPages.length > 0 && (
                  <span className="text-xs text-muted-foreground">{assignedPages.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="h-3 w-3 mr-1" />
                <p>Favorites</p>
                {favorites.length > 0 && (
                  <span className="text-xs text-muted-foreground">{favorites.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="meeting-notes">Meeting Notes</TabsTrigger>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 px-2 py-1.5 text-muted-foreground text-sm"
                  >
                    <SlidersHorizontal className="size-4" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  {allColumns.map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col}
                      checked={visibleColumns.includes(col)}
                      onCheckedChange={() => toggleColumn(col)}
                    >
                      {col}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TabsList>

          {/* ── All Docs Tab ──────────────────────────────────────────────── */}
          <TabsContent value="all" className="w-full min-w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes("Project") && (
                    <TableHead className="w-[300px] h-0 pl-10 py-1">Name</TableHead>
                  )}
                  {visibleColumns.includes("Team") && (
                    <TableHead className="w-[100px] h-0 py-0">Location</TableHead>
                  )}
                  {visibleColumns.includes("Tech") && (
                    <TableHead className="w-[100px] h-0 py-0">Tags</TableHead>
                  )}
                  {visibleColumns.includes("Created At") && (
                    <TableHead className="w-[100px] h-0 py-0">Date updated</TableHead>
                  )}
                  {visibleColumns.includes("Contributors") && (
                    <TableHead className="w-[100px] h-0 py-0">Date viewed</TableHead>
                  )}
                  {visibleColumns.includes("Status") && (
                    <TableHead className="w-[50px] h-0 py-0">Sharing</TableHead>
                  )}
                  {visibleColumns.includes("action") && (
                    <TableHead className="w-[50px] h-0 py-0">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPages.length > 0 ? (
                  recentPages.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer dark:hover:bg-[#191919] hover:bg-[#fff]"
                    >
                      {visibleColumns.includes("Project") && (
                        <AnimateIcon animateOnHover>
                          <TableCell
                            className="font-medium flex gap-2 pl-10 h-0 py-0 text-sm dark:text-[#EEEEEE]"
                            onClick={() => push(`/workspace/${workspaceId}/page/${p.id}`)}
                          >
                            <div className="mt-2 !h-3 !w-3">
                              {p.emoji || (
                                <FileText className="!h-4 !w-4 mt-1 dark:text-[#7D7A75] text-[#201f1f]" />
                              )}
                            </div>
                            <p className="text-sm mt-2">{p.title || "Doc"}</p>
                          </TableCell>
                        </AnimateIcon>
                      )}
                      {visibleColumns.includes("Team") && (
                        <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
                          Everything
                        </TableCell>
                      )}
                      {visibleColumns.includes("Tech") && (
                        <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
                          -
                        </TableCell>
                      )}
                      {visibleColumns.includes("Created At") && (
                        <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
                          {new Date(p.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </TableCell>
                      )}
                      {visibleColumns.includes("action") && (
                        <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-2">
                          {new Date(p.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </TableCell>
                      )}
                      {visibleColumns.includes("Status") && (
                        <TableCell className="min-w-[120px] py-0 h-0">
                          {members.length > 0 && (
                            <div className="flex -gap-x-1">
                              <TooltipProvider>
                                {members.slice(0, 5).map((member, index) => (
                                  <Tooltip key={member.user?.id || index}>
                                    <TooltipTrigger>
                                      <Avatar className="h-6 w-6 hover:z-10">
                                        <AvatarImage
                                          src={
                                            member.user?.image ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                              member.user?.name ?? "U"
                                            )}&background=random`
                                          }
                                          alt={member.user?.name}
                                        />
                                        <AvatarFallback>
                                          {member.user?.name?.[0] ?? "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-semibold">{member.user?.name}</p>
                                      <p className="text-xs">{member.user?.email}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </TooltipProvider>
                            </div>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.includes("Contributors") && (
                        <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <MoreHorizontal className="h-4 w-4 cursor-pointer" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setShowShareModal(true)}>
                                <Users className="mr-2 h-4 w-4" /> Share & Invite
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setShowInviteModal(true)}>
                                <Users className="mr-2 h-4 w-4" /> Manage members
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => createNewPage(p.id)}>
                                <Plus className="mr-2 h-4 w-4" /> Add subpage
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deletePage(p.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No pages found. Create your first page to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* ── Notes Tab ────────────────────────────────────────────────── */}
          <TabsContent value="notes" className="w-full min-w-full p-4">
            {notesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notes found. Create your first note!</p>
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px] h-0 pl-10 py-1">Note</TableHead>
                    <TableHead className="w-[100px] h-0 py-0">Content</TableHead>
                    <TableHead className="w-[100px] h-0 py-0">Blocks</TableHead>
                    <TableHead className="w-[100px] h-0 py-0">Priority</TableHead>
                    <TableHead className="w-[100px] h-0 py-0">Updated Date</TableHead>
                    <TableHead className="w-[100px] h-0 py-0">Status</TableHead>
                    <TableHead className="w-[100px] h-0 py-0">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="!px-0">
                  {notes.map((note) => (
                    <TableRow
                      key={note.id}
                      onClick={() => {
                        setSelectedNote(note);
                        setIsEditorOpen(true);
                      }}
                      className="dark:hover:bg-[#191919] cursor-pointer hover:bg-[#FCFCFC] transition-shadow group"
                    >
                      <TableCell className="font-medium flex gap-2 pl-10 h-0 py-4 text-sm dark:text-[#EEEEEE]">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm">
                            {note.emoji || (
                              <FileText className="!h-4 !w-4 dark:text-[#7D7A75] text-[#201f1f]" />
                            )}
                          </span>
                          <h3 className="font-semibold capitalize truncate">
                            {note.title || "Untitled"}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {note.isPinned && (
                            <Pin className="h-3 w-3 text-blue-500 fill-blue-500" />
                          )}
                          {note.isFavorite && (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
                        <p className="text-sm mt-2 line-clamp-2">
                          {note.preview || "No content"}
                        </p>
                      </TableCell>
                      <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
                        <span>{note._count?.blocks || 0} blocks</span>
                      </TableCell>
                      <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                            note.isPinned
                              ? "bg-red-100 text-red-700"
                              : note.isFavorite
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {note.isPinned ? "Pinned" : note.isFavorite ? "Favorite" : "Normal"}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
                        {note.isArchived ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle className="h-3 w-3" /> Archived
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">_</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[#646464] dark:text-[#B4B4B4] h-0 py-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => toggleArchiveNote(note, e)}>
                              <Archive className="mr-2 h-4 w-4" />
                              {note.isArchived ? "Restore" : "Archive"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => deleteNote(note.id, e)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* ── Reminders Tab ────────────────────────────────────────────── */}
          <TabsContent value="reminders" className="w-full min-w-full">
            {tasksLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <AlarmClock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No reminders yet.</p>
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Task</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((t) => (
                    <TableRow key={t.id} className="dark:hover:bg-[#191919]">
                      <TableCell className="pl-4 font-medium text-sm">{t.title}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                            t.priority === "HIGH"
                              ? "bg-red-100 text-red-700"
                              : t.priority === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {t.priority}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(
                          typeof t.dueTime === "string" ? parseISO(t.dueTime) : t.dueTime,
                          "MMM dd, yyyy"
                        )}
                      </TableCell>
                      <TableCell>
                        {t.itsDone ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle className="h-3 w-3" /> Done
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* ── Assigned Tab ─────────────────────────────────────────────── */}
          <TabsContent value="assigned" className="w-full min-w-full p-4">
            {assignedLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : assignedPages.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No pages assigned to you yet.</p>
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-10">Page</TableHead>
                    <TableHead>Assigned by</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Last updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedPages.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer dark:hover:bg-[#191919]"
                      onClick={() => push(`/workspace/${workspaceId}/page/${p.id}`)}
                    >
                      <TableCell className="pl-10 flex items-center gap-2 font-medium text-sm">
                        {p.emoji ? (
                          <span>{p.emoji}</span>
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                        {p.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {p.author.name}
                      </TableCell>
                      <TableCell className="text-sm text-blue-600">
                        {p.assignedTo?.team?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* ── Favorites Tab ────────────────────────────────────────────── */}
          <TabsContent value="favorites" className="w-full min-w-full p-0">
            {favoritesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No favorites yet. Star a page to add it here.</p>
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-10">Page</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Favorited</TableHead>
                    <TableHead>Last updated</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {favorites.map((fav) => (
                    <TableRow
                      key={fav.id}
                      className="cursor-pointer dark:hover:bg-[#191919]"
                      onClick={() => push(`/workspace/${workspaceId}/page/${fav.id}`)}
                    >
                      <TableCell className="pl-10 flex items-center gap-2 font-medium text-sm">
                        {fav.emoji ? (
                          <span>{fav.emoji}</span>
                        ) : (
                          <ClipboardList className="h-4 w-4 dark:text-[#B4B4B4]" />
                        )}
                        {fav.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {fav.workspace.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(fav.favoritedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(fav.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-yellow-500 hover:text-yellow-600"
                          onClick={(e) => removeFavorite(fav.id, e)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* ── Meeting Notes Tab ─────────────────────────────────────────── */}
          <TabsContent value="meeting-notes" className="w-full min-w-full p-0">
            {meetingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm mb-4">No meetings recorded yet.</p>
                <Link href="/meetings/new">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-3 w-3 mr-1" /> Join Your First Meeting
                  </Button>
                </Link>
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-10">Meeting</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Speakers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((m) => (
                    <TableRow
                      key={m.id}
                      className="cursor-pointer dark:hover:bg-[#191919] hover:bg-[#f9f9f9]"
                      onClick={() => openMeetingDetail(m.id)}
                    >
                      <TableCell className="pl-10 font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <span className="truncate max-w-[220px]">
                            {m.meetingName || "Untitled Meeting"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(m.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {m.duration ? formatDuration(m.duration) : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {m.speakers?.length ? (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {m.speakers.length}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <MeetingStatusBadge status={m.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMeetingDetail(m.id);
                          }}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* ── Share Modal ───────────────────────────────────────────────────── */}
      <Modal open={showShareModal} onOpenChange={setShowShareModal}>
        <ModalBody>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Share this page</ModalTitle>
              <ModalDescription>Anyone with the link can view this page</ModalDescription>
            </ModalHeader>
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-x-2">
                <Switch id="public-access" />
                <Label htmlFor="public-access">Allow public access</Label>
              </div>
              <div className="flex items-center gap-x-2">
                <Switch id="allow-comments" />
                <Label htmlFor="allow-comments">Allow comments</Label>
              </div>
              <div className="flex items-center gap-x-2">
                <Switch id="allow-editing" />
                <Label htmlFor="allow-editing">Allow editing</Label>
              </div>
            </div>
          </ModalContent>
          <ModalFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare}>Copy link</Button>
          </ModalFooter>
        </ModalBody>
      </Modal>

      {/* ── Invite Modal ──────────────────────────────────────────────────── */}
      <InviteModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        workspaceId={workspaceId as string}
        members={members}
        onMembersUpdate={refetchMembers}
      />

      {/* ── Note Editor Modal ─────────────────────────────────────────────── */}
      <Modal open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <ModalBody className="max-w-5xl h-[60vh] !p-0">
          <ModalContent className="w-full h-full !px-0 !py-0">
            {selectedNote && (
              <NoteEditor
                note={selectedNote}
                onUpdate={(updated) =>
                  setNotes(notes.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)))
                }
                onClose={() => setIsEditorOpen(false)}
              />
            )}
          </ModalContent>
        </ModalBody>
      </Modal>

      {/* ── Note Share Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!shareNote} onOpenChange={() => setShareNote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Note</DialogTitle>
            <DialogDescription>Anyone with this link can view your note</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-4">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Meeting Detail Modal ──────────────────────────────────────────── */}
      <MeetingDetail
        id={selectedMeetingId}
        open={meetingModalOpen}
        onClose={() => {
          setMeetingModalOpen(false);
          setSelectedMeetingId(null);
        }}
      />
    </>
  );
}

export default DocsTable;