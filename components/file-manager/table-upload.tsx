// // components/file-manager/EnhancedFileManager.tsx
// 'use client';
// import { useState, useEffect } from 'react';
// import { useSearchParams } from 'next/navigation'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import {
//   ImageIcon, Folder, Download, Trash2,
//   Edit, Lock, UserPlus, Eye, EyeOff, FolderOpen, Users, ArrowRightIcon, X, ArrowLeft, ChevronLeft, ChevronRight
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/animated-modal';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { toast } from 'sonner';
// import { format } from 'date-fns';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/animate-ui/components/radix/dropdown-menu';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// // import { Label } from '@/components/ui/label';
// import Image from 'next/image';
// import { EnhancedFileUploader } from '@/components/file-manager/files/fileuploader-dialog';

// // import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import {
//   FileArchiveIcon,
//   FileSpreadsheetIcon,
//   FileTextIcon,
//   HeadphonesIcon,
//   VideoIcon,
//   SearchIcon,

// } from 'lucide-react';
// import {
//   HoverCard,
//   HoverCardContent,
//   HoverCardTrigger,
// } from '@/components/ui/hover-card';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from '@/components/animate-ui/components/animate/tooltip';
// import { Separator } from '@/components/ui/separator';
// // import CircularText from '@/components/ui/CircularTextLoader';
// import DynamicIslandDemo from '@/components/ui/DynamicIslandDemo';
// import { List } from '@/components/animate-ui/icons/list';
// import { AnimateIcon } from '@/components/animate-ui/icons/icon';
// import { CloudUploadIcon } from '@/components/animate-ui/icons/cloud-upload';
// import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard';
// // import { Link2 } from '../animate-ui/icons/link-2'
// import { Ellipsis } from '../animate-ui/icons/ellipsis'
// import { DownloadIcon } from '../animate-ui/icons/download';
// import { User } from '../animate-ui/icons/user';
// import {
//   ExpandableScreen,
//   ExpandableScreenContent,
//   ExpandableScreenTrigger,
//   useExpandableScreen,
// } from "@/components/ui/ExpandableScreen"
// import { GooeyInput } from '../ui/gooey-input';
// import { Link2 } from '../animate-ui/icons/link-2';
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible"
// import { ArrowRight } from '../animate-ui/icons/arrow-right';
// // import { DrivePicker } from '../integrations/google/DrivePicker';
// // import { GooeyInput } from '../ui/gooey-input';

// interface FileItem {
//   id: string;
//   originalName: string;
//   mimeType: string;
//   size: number;
//   formattedSize: string;
//   url: string;
//   ext: string;
//   folderId: string;
//   createdAt: string;
//   visibility: 'PERSONAL' | 'TEAM' | 'PASSWORD_PROTECTED';
//   isOwner: boolean;
//   isAssigned: boolean;
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     image: string | null;
//   };
//   team?: {
//     id: string;
//     name: string;
//   };
//   assignedTo: Array<{
//     id: string;
//     user: {
//       id: string;
//       name: string;
//       email: string;
//       image: string;
//     };
//   }>;
//   folder?: {
//     id: string;
//     name: string;
//   };
// }

// interface FolderItem {
//   id: string;
//   name: string;
//   parentId: string | null;
//   _count: {
//     files: number;
//   };
// }

// interface Team {
//   id: string;
//   name: string;
//   slug: string;
//   role: string;
// }

// export default function EnhancedFileManager() {
//   const queryClient = useQueryClient();
//   // const [activeTab, setActiveTab] = useState('all');
//   const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
//   const searchParams = useSearchParams()
//   const queryType = searchParams.get('type') // 'image', 'video', 'audio', 'document'
//   const queryVisibility = searchParams.get('visibility') // 'personal', 'team', 'assigned', 'protected'
//   // Team selection
//   const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

//   // Dialog states
//   const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
//   const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
//   const [renameDialogOpen, setRenameDialogOpen] = useState(false);
//   const [assignDialogOpen, setAssignDialogOpen] = useState(false);
//   const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
//   const [moveDialogOpen, setMoveDialogOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
//   const [newFolderName, setNewFolderName] = useState('');
//   const [newFileName, setNewFileName] = useState('');
//   const [password, setPassword] = useState('');
//   const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
//   const [hoveredRow, setHoveredRow] = useState<string | null>(null);
//   const [verifiedFiles, setVerifiedFiles] = useState<Set<string>>(new Set());
//   const [isOpen, setIsOpen] = useState(false);

//   // Fetch user's teams
//   const { data: teamsData } = useQuery({
//     queryKey: ['my-teams'],
//     queryFn: async () => {
//       const res = await fetch('/api/teams/my-teams');
//       if (!res.ok) throw new Error('Failed to fetch teams');
//       return res.json();
//     },
//   });

//   const [activeTab, setActiveTab] = useState(() => {
//     if (queryVisibility === 'personal') return 'personal'
//     if (queryVisibility === 'team') return 'team'
//     if (queryVisibility === 'assigned') return 'assigned'
//     return 'all'
//   })
//   // Set default team on load
//   useEffect(() => {
//     if (teamsData?.teams?.length > 0 && !selectedTeamId) {
//       setSelectedTeamId(teamsData.teams[0].id);
//     }
//   }, [teamsData, selectedTeamId]);

//   const { data: filesData,
//     // isLoading: filesLoading 
//   } = useQuery({
//     queryKey: ['files', activeTab, selectedFolder, searchQuery, selectedTeamId, queryType],
//     queryFn: async () => {
//       const params = new URLSearchParams({
//         visibility: activeTab === 'assigned' ? 'assigned' : activeTab === 'personal' ? 'personal' : activeTab === 'team' ? 'team' : 'all',
//         ...(selectedFolder && { folderId: selectedFolder }),
//         ...(searchQuery && { keyword: searchQuery }),
//         ...(selectedTeamId && { teamId: selectedTeamId }),
//         ...(queryType && { type: queryType }), // Add type filter from URL
//         pageSize: '50',
//         pageNumber: '1',
//       })

//       const res = await fetch(`/api/files/all?${params}`)
//       if (!res.ok) throw new Error('Failed to fetch files')
//       return res.json()
//     },
//     enabled: !!selectedTeamId || activeTab === 'personal',
//   })

//   // Fetch files based on active tab and filters
//   // const { data: filesData, isLoading: filesLoading } = useQuery({
//   //   queryKey: ['files', activeTab, selectedFolder, searchQuery, selectedTeamId],
//   //   queryFn: async () => {
//   //     const params = new URLSearchParams({
//   //       visibility: activeTab === 'assigned' ? 'assigned' : activeTab === 'personal' ? 'personal' : activeTab === 'team' ? 'team' : 'all',
//   //       ...(selectedFolder && { folderId: selectedFolder }),
//   //       ...(searchQuery && { keyword: searchQuery }),
//   //       ...(selectedTeamId && { teamId: selectedTeamId }),
//   //       pageSize: '50',
//   //       pageNumber: '1',
//   //     });

//   //     const res = await fetch(`/api/files/all?${params}`);
//   //     if (!res.ok) throw new Error('Failed to fetch files');
//   //     return res.json();
//   //   },
//   //   enabled: !!selectedTeamId || activeTab === 'personal',
//   // });


//   // Fetch folders
//   const { data: foldersData } = useQuery({
//     queryKey: ['folders', selectedFolder, selectedTeamId],
//     queryFn: async () => {
//       const params = new URLSearchParams({
//         ...(selectedFolder && { parentId: selectedFolder }),
//         ...(selectedTeamId && { teamId: selectedTeamId }),
//       });
//       const res = await fetch(`/api/files/folders?${params}`);
//       if (!res.ok) throw new Error('Failed to fetch folders');
//       return res.json();
//     },
//     enabled: !!selectedTeamId || activeTab === 'personal',
//   });

//   // Fetch team members for assignment - use the by-id endpoint
//   const {
//     data: membersData,
//     // isLoading: membersLoading,
//     error: membersError
//   } = useQuery({
//     queryKey: ['team-members', selectedTeamId],
//     queryFn: async () => {
//       if (!selectedTeamId) return { data: [] }
//       const res = await fetch(`/api/teams/by-id/${selectedTeamId}/members`)
//       if (!res.ok) {
//         const errorData = await res.json().catch(() => ({}))
//         throw new Error(errorData.message || 'Failed to fetch members')
//       }
//       return res.json()
//     },
//     enabled: !!selectedTeamId,
//     retry: 1,
//   })

//   // Debug log to see what's happening
//   useEffect(() => {
//     if (membersData) {
//       console.log('Team members loaded:', membersData.data?.length, 'members')
//     }
//     if (membersError) {
//       console.error('Failed to load members:', membersError)
//     }
//   }, [membersData, membersError])

//   // Then use the slug for members API
//   // const { data: membersData, isLoading: membersLoading, error: membersError } = useQuery({
//   //   queryKey: ['team-members', selectedTeamId],
//   //   queryFn: async () => {
//   //     if (!selectedTeamId) return { data: [] }
//   //     const res = await fetch(`/api/teams/by-id/${selectedTeamId}/members`)
//   //     if (!res.ok) {
//   //       const error = await res.json()
//   //       throw new Error(error.message || 'Failed to fetch members')
//   //     }
//   //     return res.json()
//   //   },
//   //   enabled: !!selectedTeamId,
//   // })

//   // Get current user ID from session (you'll need to implement this)
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   const { } = useQuery({
//     queryKey: ['currentUser-session'],
//     queryFn: async () => {
//       const res = await fetch('/api/auth/session');
//       const data = await res.json();
//       setCurrentUserId(data?.user?.id || null);
//       return data;
//     },
//   });

//   // Filter members to exclude current user for assignment
//   const availableMembers = membersData?.data?.filter(
//     (member: any) => member.userId !== currentUserId
//   ) || [];


//   // Calculate storage percentage and formatting

//   // Mutations
//   const deleteMutation = useMutation({
//     mutationFn: async (fileId: string) => {
//       const res = await fetch(`/api/files/${fileId}`, {
//         method: 'DELETE',
//       });
//       if (!res.ok) throw new Error('Failed to delete file');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['files'] });
//       toast.success('File deleted successfully');
//     },
//   });

//   const renameMutation = useMutation({
//     mutationFn: async ({ fileId, name }: { fileId: string; name: string }) => {
//       const res = await fetch(`/api/files/${fileId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ originalName: name }),
//       });
//       if (!res.ok) throw new Error('Failed to rename file');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['files'] });
//       toast.success('File renamed successfully');
//       setRenameDialogOpen(false);
//     },
//   });

//   const createFolderMutation = useMutation({
//     mutationFn: async (name: string) => {
//       const res = await fetch('/api/files/folders', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name,
//           parentId: selectedFolder,
//           teamId: selectedTeamId,
//         }),
//       });
//       if (!res.ok) throw new Error('Failed to create folder');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['folders'] });
//       toast.success('Folder created successfully');
//       setCreateFolderDialogOpen(false);
//       setNewFolderName('');
//     },
//   });

//   const assignMutation = useMutation({
//     mutationFn: async ({ fileId, userIds }: { fileId: string; userIds: string[] }) => {
//       const res = await fetch(`/api/files/${fileId}/assign`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userIds }),
//       });
//       if (!res.ok) throw new Error('Failed to assign file');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['files'] });
//       toast.success('File assigned successfully');
//       setAssignDialogOpen(false);
//       setSelectedUsers([]);
//     },
//   });

//   const moveToFolderMutation = useMutation({
//     mutationFn: async ({ fileId, folderId }: { fileId: string; folderId: string | null }) => {
//       const res = await fetch(`/api/files/${fileId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ folderId }),
//       });
//       if (!res.ok) throw new Error('Failed to move file');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['files'] });
//       toast.success('File moved successfully');
//       setMoveDialogOpen(false);
//     },
//   });

//   // const verifyPasswordMutation = useMutation({
//   //   mutationFn: async ({ fileId, password }: { fileId: string; password: string }) => {
//   //     const res = await fetch(`/api/files/${fileId}/verify-password`, {
//   //       method: 'POST',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify({ password }),
//   //     });
//   //     if (!res.ok) throw new Error('Invalid password');
//   //     return res.json();
//   //   },
//   //   onSuccess: (data) => {
//   //     window.open(data.url, '_blank');
//   //     setPasswordDialogOpen(false);
//   //     setPassword('');
//   //   },
//   //   onError: () => {
//   //     alert('Invalid password');
//   //   },
//   // });

//   // In EnhancedFileManager.tsx, update the verify mutation:

//   // const verifyPasswordMutation = useMutation({
//   //   mutationFn: async ({ fileId, password }: { fileId: string; password: string }) => {
//   //     const res = await fetch(`/api/files/${fileId}/verify-password`, {
//   //       method: 'POST',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify({ password }),
//   //     })
//   //     if (!res.ok) {
//   //       const error = await res.json()
//   //       throw new Error(error.message || 'Invalid password')
//   //     }
//   //     return res.json()
//   //   },
//   //   onSuccess: (data) => {
//   //     // Open in new tab with proper URL
//   //     if (data.url) {
//   //       const newWindow = window.open(data.url, '_blank')
//   //       if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
//   //         // Popup blocked, try direct download
//   //         const link = document.createElement('a')
//   //         link.href = data.url
//   //         link.target = '_blank'
//   //         link.download = data.fileName || 'download'
//   //         document.body.appendChild(link)
//   //         link.click()
//   //         document.body.removeChild(link)
//   //       }
//   //     }
//   //     setPasswordDialogOpen(false)
//   //     setPassword('')
//   //     toast.success('File opened successfully')
//   //   },
//   //   onError: (error: any) => {
//   //     alert(error.message || 'Invalid password')
//   //   },
//   // })

//   const verifyPasswordMutation = useMutation({
//     mutationFn: async ({ fileId, password }: { fileId: string; password: string }) => {
//       const res = await fetch(`/api/files/${fileId}/verify-password`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ password }),
//       })
//       if (!res.ok) {
//         const error = await res.json()
//         throw new Error(error.message || 'Invalid password')
//       }
//       return res.json()
//     },
//     onSuccess: (data, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['files'] });
//       // Open in new tab with proper URL
//       if (data.url) {
//         const newWindow = window.open(data.url, '_blank')
//         if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
//           // Popup blocked, try direct download
//           const link = document.createElement('a')
//           link.href = data.url
//           link.target = '_blank'
//           link.download = data.fileName || 'download'
//           document.body.appendChild(link)
//           link.click()
//           document.body.removeChild(link)
//         }
//       }
//       // Mark file as verified so ExpandableScreen shows content
//       handlePasswordVerified(variables.fileId);
//       setPasswordDialogOpen(false)
//       setPassword('')
//       toast.success('File unlocked successfully')
//     },
//     onError: (error: any) => {
//       alert(error.message || 'Invalid password')
//     },
//   })

//   // Handlers
//   const handleDelete = (fileId: string) => {
//     if (confirm('Are you sure you want to delete this file?')) {
//       deleteMutation.mutate(fileId);
//     }
//   };

//   const handleRename = () => {
//     if (selectedFile && newFileName.trim()) {
//       renameMutation.mutate({ fileId: selectedFile.id, name: newFileName });
//     }
//   };

//   const handleCreateFolder = () => {
//     if (newFolderName.trim()) {
//       createFolderMutation.mutate(newFolderName);
//     }
//   };

//   const handleAssign = () => {
//     if (selectedFile && selectedUsers.length > 0) {
//       assignMutation.mutate({ fileId: selectedFile.id, userIds: selectedUsers });
//     }
//   };

//   const handleDownload = (file: FileItem) => {
//     if (file.visibility === 'PASSWORD_PROTECTED' && !file.isOwner) {
//       setSelectedFile(file);
//       setPasswordDialogOpen(true);
//     } else {
//       window.open(file.url, '_blank');
//     }
//   };


//   // const getFileIcon = (mimeType: string) => {
//   //   if (mimeType.startsWith('image/')) return <ImageIcon className="size-5" />;
//   //   if (mimeType.startsWith('video/')) return <Video className="size-5" />;
//   //   if (mimeType.startsWith('audio/')) return <Music className="size-5" />;
//   //   if (mimeType.includes('pdf')) return <FileText className="size-5 text-red-500" />;
//   //   return <FileText className="size-5" />;
//   // };


//   const getFileIcon = (mimeType: string) => {
//     if (mimeType.startsWith('image/'))
//       return <ImageIcon className="size-3.5 text-green-400" />;
//     if (mimeType.startsWith('video/'))
//       return <VideoIcon className="size-3.5 text-red-500" />;
//     if (mimeType.startsWith('audio/'))
//       return <HeadphonesIcon className="size-3.5 text-pink-500" />;
//     if (mimeType.includes('pdf'))
//       return <FileTextIcon className="size-3.5 text-purple-500" />;
//     if (mimeType.includes('word') || mimeType.includes('doc'))
//       return <FileTextIcon className="size-3.5 text-blue-600" />;
//     if (mimeType.includes('excel') || mimeType.includes('sheet'))
//       return <FileSpreadsheetIcon className="size-3.5 text-yellow-500" />;
//     if (mimeType.includes('zip') || mimeType.includes('rar'))
//       return <FileArchiveIcon className="size-3.5 text-orange-500" />;
//     return <FileTextIcon className="size-3.5" />;
//   };



//   const getVisibilityBadge = (visibility: string) => {
//     switch (visibility) {
//       case 'PERSONAL':
//         return <Badge variant="secondary" className="text-xs !py-0.5 "><EyeOff className=" size-3   mr-1" /> Personal</Badge>;
//       case 'TEAM':
//         return <Badge variant="default" className="text-xs !py-0.5"><Eye className=" size-3   mr-1" /> Team</Badge>;
//       case 'PASSWORD_PROTECTED':
//         return <Badge variant="destructive" className="text-xs !py-0.5"><Lock className=" size-3   mr-1" /> Protected</Badge>;
//       default:
//         return null;
//     }
//   };

//   const isFileLocked = (file: FileItem) => {
//     return file.visibility === 'PASSWORD_PROTECTED' && !file.isOwner && !verifiedFiles.has(file.id);
//   };

//   const handlePasswordVerified = (fileId: string) => {
//     setVerifiedFiles(prev => new Set([fileId]));
//   };

//   const files = filesData?.files || [];
//   const folders = foldersData?.folders || [];
//   const teams = teamsData?.teams || [];

//   return (
//     <Tabs className="flex h-full">

//       <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#222] px-2">

//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className='!bg-transparent rounded-none -mb-1 gap-1'>
//             <TabsTrigger value="all" className="hover:border-[#B4B4B4] border-transparent border-b rounded-none data-[state=active]:bg-[#cccaca] dark:data-[state=active]:border-[#f4f4f4] hover:dark:border-[#2c22f5]">All</TabsTrigger>
//             <TabsTrigger value="personal" className="hover:border-[#B4B4B4] border-transparent border-b rounded-none data-[state=active]:bg-[#cccaca] dark:data-[state=active]:border-[#f4f4f4] hover:dark:border-[#2c22f5]">Personal</TabsTrigger>
//             <TabsTrigger value="team" disabled={!selectedTeamId} className="hover:border-[#B4B4B4] border-transparent border-b rounded-none data-[state=active]:bg-[#cccaca] dark:data-[state=active]:border-[#f4f4f4] hover:dark:border-[#2c22f5]">Team</TabsTrigger>
//             <TabsTrigger value="assigned" className="hover:border-[#B4B4B4] border-transparent border-b rounded-none data-[state=active]:bg-[#cccaca] dark:data-[state=active]:border-[#f4f4f4] hover:dark:border-[#2c22f5]">Assigned</TabsTrigger>
//           </TabsList>
//         </Tabs>

//         <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
//           <div className="flex justify-center items-center gap-2">
//             <Collapsible className='flex h-fit' onOpenChange={setIsOpen}>
//               <CollapsibleTrigger className=' p-0 text-center h-6 rounded-full'>
//                 {isOpen ? <ChevronRight className='h-4 w-4 dark:text-[#B4B4B4]' /> : <ChevronLeft className='h-4 w-4 dark:text-[#B4B4B4]' />}</CollapsibleTrigger>
//               <CollapsibleContent>
//                 <DynamicIslandDemo />
//               </CollapsibleContent>
//             </Collapsible>

//             <Separator orientation="vertical" className='h-6 mr-0.5 w-[0.5px] dark:!bg-[#303030]' />

//             {teams.length > 0 && (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild className='!px-0 !py-0'>
//                   <Button variant="ghost" size="icon" className="relative h-7 w-7 !px-0.5 !py-0.5 rounded-full hover:dark:bg-[#000]">
//                     <Users className="h-4 w-4 text-[#B4B4B4]" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="center" className="w-56">
//                   <DropdownMenuLabel>Select Team</DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   {teams.map((team: Team) => (
//                     <DropdownMenuItem
//                       key={team.id}
//                       onClick={() => setSelectedTeamId(team.id)}
//                       className="flex items-center justify-between cursor-pointer"
//                     >
//                       <div className="flex items-center gap-2">
//                         <Users className=" size-4  text-[#B4B4B4]" />
//                         <span>{team.name}</span>
//                       </div>
//                       <Badge variant="outline" className="text-xs">
//                         {team.role}
//                       </Badge>
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             )}
//             <Separator orientation="vertical" className='h-6 mr-0.5 dark:!bg-[#303030]' />

//             <GooeyInput
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search..."
//               className=""

//             />

//             <Separator orientation="vertical" className='h-6 mr-0.5 dark:!bg-[#303030]' />
//             <TabsList className="border dark:!border-[#303030] bg-transparent   p-0 overflow-hidden rounded-xl">
//               <TooltipProvider >
//                 <Tooltip>
//                   <TooltipTrigger >
//                     <span>
//                       <TabsTrigger
//                         value="Grid"
//                         onClick={() => setViewMode('grid')}
//                         className="group py-2 rounded-none"
//                       >
//                         <AnimateIcon animateOnHover>
//                           <LayoutDashboard className=" size-4  dark:text-white" />
//                         </AnimateIcon>
//                       </TabsTrigger>
//                     </span>
//                   </TooltipTrigger>
//                   <TooltipContent className="px-2 py-1 text-xs">
//                     Grid View
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//               <Separator orientation="vertical" className="dark:!bg-[#303030]" />
//               <TooltipProvider >
//                 <Tooltip>
//                   <TooltipTrigger onClick={() => setViewMode('list')} className='!bg-transparent'>
//                     <span>
//                       <AnimateIcon animateOnHover>
//                         <TabsTrigger
//                           value="List"
//                           className="py-2 h-full w-full rounded-none !bg-transparent"
//                         >
//                           <List animateOnView className=" size-4  dark:text-white" />
//                         </TabsTrigger>
//                       </AnimateIcon>
//                     </span>
//                   </TooltipTrigger>
//                   <TooltipContent className="px-2 py-1 text-xs">
//                     List View
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             </TabsList>


//             <AnimateIcon animateOnHover><Button
//               onClick={() => setUploadDialogOpen(true)} variant="outline"
//               size="default"
//               className=" flex rounded-xl hover:bg-blue-700 bg-[#5C47CD] text-white"
//             >
//               <CloudUploadIcon pathLength={1} className="mr-0.5 h-5 w-5" />
//               <p>Upload</p>
//             </Button>
//             </AnimateIcon>
//           </div>
//         </div>
//       </div>
//       {/* Main Content */}
//       <div className="flex-1 flex flex-col px-4 pt-2">



//         {/* Files Display */}
//         {viewMode === 'grid' ? (
//           <div className=" grid pt-0 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 pb-2 h-full">

//             <Card className=" rounded-2xl group relative border-t-2 border-white border-none px-1 !py-1 pt-3 dark:bg-neutral-800 shadow overflow-hidden">
//               <div className="flex items-center justify-between mb-5">
//                 <h3 className="font-semibold">Folders</h3>
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => setCreateFolderDialogOpen(true)}
//                 >
//                   <FolderOpen className=" size-4 " />
//                 </Button>
//               </div>

//               <div className="space-y-1 pt-1 px-1 bg-[#F8F9FA] dark:bg-[#191919]  h-[calc(100%-3.2rem)] overflow-y-auto rounded-xl">
//                 <Button
//                   variant={selectedFolder === null ? "outline" : "ghost"}
//                   className="w-full justify-start rounded-lg hover:dark:bg-[#333]"
//                   onClick={() => setSelectedFolder(null)}
//                 >
//                   <Folder className=" size-4  mr-2" />
//                   All Files
//                 </Button>

//                 {folders.map((folder: FolderItem) => (
//                   <Button
//                     key={folder.id}
//                     variant={selectedFolder === folder.id ? "outline" : "ghost"}
//                     className="w-full justify-start rounded-lg hover:dark:bg-[#333]"
//                     onClick={() => setSelectedFolder(folder.id)}
//                   >
//                     <Folder className=" size-4  mr-2" />
//                     <span className="truncate">{folder.name}</span>
//                     <span className="ml-auto text-xs text-muted-foreground">
//                       {folder._count.files}
//                     </span>
//                   </Button>
//                 ))}
//               </div>
//             </Card>

//             {/* {folders.map((folder: FolderItem) => (
//               <Card
//                 key={folder.id}
//                 className="p-4 cursor-pointer hover:bg-accent transition-colors"
//                 onClick={() => setSelectedFolder(folder.id)}
//               >
//                 <div className="flex items-center gap-3">
//                   <Folder className=" size-10  text-blue-500" />
//                   <div>
//                     <p className="font-medium truncate">{folder.name}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {folder._count.files} items
//                     </p>
//                   </div>
//                 </div>
//               </Card>
//             ))} */}

//             {/* <DrivePicker
//   mode="import"
//   teamId={selectedTeamId ?? undefined}
//   onSelect={(file, action, result) => {
//     if (action === 'import' && result?.file) {
//       console.log('Imported file:', result.file)
//       queryClient.invalidateQueries({ queryKey: ['files'] })
//     }
//     if (action === 'share' && result?.shareUrl) {
//       console.log('Share URL:', result.shareUrl)
//     }
//   }}
//   onClose={() => setUploadDialogOpen(false)}
// /> */}


//             {files.map((file: FileItem) => (
//               // <>
//               //   <ExpandableScreen
//               //     layoutId="cta-card"
//               //     triggerRadius="100px"
//               //     contentRadius="24px"
//               //   >


//               //     <Card
//               //       key={file.id}
//               //       className= " rounded-2xl group relative border-t-2 border-white border-none h-fit   p-1   pt-3 dark:bg-neutral-800 shadow"
//               //       >

//               //       <div className="flex justify-between items-center w-full ">
//               //         <ExpandableScreenTrigger>
//               //           <div className="flex justify-start items-start gap-2 px-1">

//               //             <Avatar className="size-8">
//               //               <AvatarImage src={file.user.image || ''} />
//               //               <AvatarFallback>
//               //                 {file.user.name?.[0]}
//               //               </AvatarFallback>
//               //             </Avatar>

//               //             <div className="flex flex-col">
//               //               {/* <input
//               //         type="checkbox"
//               //         checked={selectedFiles.includes(file.id)}
//               //         onChange={() => handleSelectFile(file.id)}
//               //         className="mt-1 rounded"
//               //       />    */}
//               //               <h3
//               //                 className="font-medium text-xs truncate"
//               //                 title={file.originalName}
//               //               >
//               //                 {file.originalName.slice(0, 20)}
//               //               </h3>
//               //               <p className="text-xs text-neutral-500">
//               //                 {file.user.name} • {file.formattedSize} • {file.ext.toUpperCase()}
//               //               </p>

//               //               {/* <p className="text-xs text-muted-foreground">
//               //           {new Date(file.createdAt).toLocaleDateString()}
//               //         </p> */}
//               //             </div>

//               //           </div>
//               //         </ExpandableScreenTrigger>
//               //         <div className="flex justify-center">
//               //           {/* {file.assignedTo.length > 0 && (
//               //           <div className="flex items-center gap-1">
//               //             <div className="flex -!gap-x-2">
//               //               {file.assignedTo.slice(0, 3).map((assignment) => (
//               //                 <Avatar key={assignment.id} className=" size-6  border-2 border-background">
//               //                   <AvatarImage src={assignment.user.image || ''} />
//               //                   <AvatarFallback className="text-[10px]">
//               //                     {assignment.user.name?.[0]}
//               //                   </AvatarFallback>
//               //                 </Avatar>
//               //               ))}
//               //               {file.assignedTo.length > 3 && (
//               //                 <span className="text-xs text-muted-foreground ml-1">
//               //                   +{file.assignedTo.length - 3}
//               //                 </span>
//               //               )}
//               //             </div>
//               //           </div>
//               //         )} */}
//               //           {getVisibilityBadge(file.visibility)}

//               //           <DropdownMenu>
//               //             <DropdownMenuTrigger >
//               //               <AnimateIcon animateOnHover >
//               //                 <DropdownMenuTrigger className='' >
//               //                   <Button
//               //                     variant="ghost"
//               //                     size="icon"
//               //                     className="!px-0 !-rotate-90 !py-2.5 h-5 w-6 rounded-sm hover:bg-[#F0F0F0] hover:dark:bg-[#222222]"
//               //                   >
//               //                     <Ellipsis className="  h-5 w-5 dark:text-[#8D8D8D]" />
//               //                   </Button>
//               //                 </DropdownMenuTrigger>
//               //               </AnimateIcon>
//               //             </DropdownMenuTrigger>
//               //             <DropdownMenuContent align="end">
//               //               <DropdownMenuItem onClick={() => handleDownload(file)}>
//               //                 <Download className=" size-4  mr-2" /> Open
//               //               </DropdownMenuItem>
//               //               {/* ANY team member can assign */}
//               //               {selectedTeamId && (
//               //                 <DropdownMenuItem
//               //                   onClick={() => {
//               //                     setSelectedFile(file);
//               //                     setAssignDialogOpen(true);
//               //                   }}
//               //                 >
//               //                   <UserPlus className=" size-4  mr-2" /> Assign to Member
//               //                 </DropdownMenuItem>
//               //               )}
//               //               {file.isOwner && (
//               //                 <>
//               //                   <DropdownMenuItem
//               //                     onClick={() => {
//               //                       setSelectedFile(file);
//               //                       setNewFileName(file.originalName);
//               //                       setRenameDialogOpen(true);
//               //                     }}
//               //                   >
//               //                     <Edit className=" size-4  mr-2" /> Rename
//               //                   </DropdownMenuItem>
//               //                   <DropdownMenuItem
//               //                     onClick={() => {
//               //                       setSelectedFile(file);
//               //                       setMoveDialogOpen(true);
//               //                     }}
//               //                   >
//               //                     <FolderOpen className=" size-4  mr-2" /> Move to Folder
//               //                   </DropdownMenuItem>
//               //                   <DropdownMenuItem
//               //                     onClick={() => handleDelete(file.id)}
//               //                     className="text-destructive"
//               //                   >
//               //                     <Trash2 className=" size-4  mr-2" /> Delete
//               //                   </DropdownMenuItem>
//               //                 </>
//               //               )}
//               //             </DropdownMenuContent>
//               //           </DropdownMenu>
//               //         </div>
//               //       </div>


//               //       <div className=" group relative">
//               //         <div className="absolute inset-0 rounded-md opacity-0 py-1 px-2 group-hover:opacity-100 transition-opacity flex items-end h-fit justify-end gap-2">

//               //           <div className='flex w-fit justify-center px-1 py-0.5 h-8 rounded-md bg-[#ffffff] dark:bg-[#111111] items-center'>
//               //             {/* <Button variant="ghost" size="icon" className=" !px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
//               //             <AnimateIcon animateOnHover>
//               //               <Link2 className="-rotate-45 h-5 w-5 dark:text-[#8D8D8D]" />
//               //             </AnimateIcon>
//               //           </Button> */}

//               //             <Button onClick={() => handleDownload(file)} variant="ghost" size="icon" className=" !px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
//               //               <AnimateIcon animateOnHover>
//               //                 <DownloadIcon className="h-5 w-5 dark:text-[#8D8D8D]" />
//               //               </AnimateIcon>
//               //             </Button>

//               //             {file.isOwner && (
//               //               <>
//               //                 <Button className=' !px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]'
//               //                   variant="ghost" size="icon"
//               //                   onClick={() => {
//               //                     setSelectedFile(file);
//               //                     setNewFileName(file.originalName);
//               //                     setRenameDialogOpen(true);
//               //                   }}
//               //                 >
//               //                   <Edit className="h-6 w-6 dark:text-[#8D8D8D]" />
//               //                 </Button>

//               //               </>
//               //             )}

//               //             {selectedTeamId && (
//               //               <Button onClick={() => {
//               //                 setSelectedFile(file);
//               //                 setAssignDialogOpen(true);
//               //               }}
//               //                 variant="ghost" size="icon" className=" !px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
//               //                 <AnimateIcon animateOnHover>
//               //                   <User className="h-5 w-5 dark:text-[#8D8D8D]" />
//               //                 </AnimateIcon>
//               //               </Button>
//               //             )}
//               //           </div>
//               //         </div>

//               //         {file.mimeType.startsWith('image/') && (
//               //           <div className="mt-3">
//               //             <Image
//               //               src={file.url}
//               //               alt={file.originalName}
//               //               className="w-full h-48 max-h-48 object-cover rounded-xl"
//               //               height={1000}
//               //               width={1000}
//               //               unoptimized
//               //             />
//               //           </div>
//               //         )}
//               //         {file.mimeType.startsWith('video/') && (
//               //           <div className="mt-3">
//               //             <video
//               //               autoPlay={false}
//               //               loop
//               //               muted
//               //               src={file.url}
//               //               className="w-full min-h-48 h-48 object-cover rounded-xl"
//               //             />
//               //           </div>
//               //         )}
//               //         {file.mimeType.startsWith('audio/') && (
//               //           <div className="mt-3 border rounded-lg bg-muted/30 p-3">
//               //             <div className="flex items-center gap-3">
//               //               <div className="flex-shrink-0  size-10  bg-blue-500 text-white rounded-full flex items-center justify-center">
//               //                 🎵
//               //               </div>
//               //               <div className="flex-1 min-w-0">
//               //                 <audio
//               //                   controls
//               //                   src={file.url}
//               //                   className="mt-2 w-full"
//               //                 />
//               //               </div>
//               //             </div>
//               //           </div>
//               //         )}
//               //         {file.mimeType === 'application/pdf' && (
//               //           <div className="overflow-hidden max-h-32 w-full mt-3 rounded-lg border">
//               //             <iframe
//               //               src={file.url}
//               //               className="w-full max-h-48 h-48 rounded" // fixed height
//               //               title={file.originalName}
//               //             />
//               //           </div>
//               //         )}
//               //         {(file.mimeType === 'application/msword' ||
//               //           file.mimeType ===
//               //           'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
//               //             <div className="overflow-hidden w-full mt-3 rounded-lg border h-48">
//               //               <iframe
//               //                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
//               //                 className="w-full h-full rounded"
//               //                 title={file.originalName}
//               //               />
//               //             </div>
//               //           )}
//               //         {(file.mimeType === 'application/zip' ||
//               //           file.mimeType === 'application/x-zip-compressed' ||
//               //           file.mimeType === 'application/vnd.rar' ||
//               //           file.mimeType === 'application/x-rar-compressed' ||
//               //           file.ext?.toLowerCase() === 'zip' ||
//               //           file.ext?.toLowerCase() === 'rar') && (
//               //             <div className="mt-3 border h-48 max-h-48 rounded-lg bg-muted/30 p-3">
//               //               <div className="flex items-center gap-3">
//               //                 <div className="flex-shrink-0  size-10  bg-yellow-500 text-white rounded-full flex items-center justify-center">
//               //                   📦
//               //                 </div>
//               //                 <div className="flex-1 min-w-0">
//               //                   <p className="text-sm font-medium truncate">
//               //                     {file.originalName}
//               //                   </p>
//               //                   <p className="text-xs text-muted-foreground">
//               //                     {file.ext?.toUpperCase()} • {file.formattedSize}
//               //                   </p>
//               //                   <a
//               //                     href={file.url}
//               //                     download
//               //                     className="mt-2 inline-block text-sm text-blue-600 hover:underline"
//               //                   >
//               //                     Download Archive
//               //                   </a>
//               //                 </div>
//               //               </div>
//               //             </div>

//               //           )}
//               //       </div>
//               //     </Card>

//               //     <ExpandableScreenContent className="bg-[#000]  max-w-7xl max-h-[96%] !rounded-lg !overflow-hidden border border-[#181818]">
//               //       <div className="bg-[#191919] border-t border-[#1F1F1F] h-10 w-full flex justify-between items-center pr-10
//               //       ">
//               //         <div className="flex justify-start items-center gap-2 px-4">

//               //           <Avatar className="size-6">
//               //             <AvatarImage src={file.user.image || ''} />
//               //             <AvatarFallback>
//               //               {file.user.name?.[0]}
//               //             </AvatarFallback>
//               //           </Avatar>

//               //           <div className="flex flex-col">
//               //             {/* <input
//               //         type="checkbox"
//               //         checked={selectedFiles.includes(file.id)}
//               //         onChange={() => handleSelectFile(file.id)}
//               //         className="mt-1 rounded"
//               //       />    */}
//               //             <h3
//               //               className="font-medium text-xs truncate"
//               //               title={file.originalName}
//               //             >
//               //               {file.originalName.slice(0, 20)}
//               //             </h3>
//               //             <p className="text-xs text-neutral-500">
//               //                 {file.user.name} 
//               //                 • {file.formattedSize} • {file.ext.toUpperCase()}
//               //               </p> 

//               //           {/* <p className="text-xs text-muted-foreground">
//               //           {new Date(file.createdAt).toLocaleDateString()}
//               //         </p> */}
//               //           </div>

//               //         </div>
//               //         <div className="flex justify-end items-center gap-2">

//               //           {file.assignedTo.length > 0 && (
//               //             <div className="flex items-center gap-1">
//               //                <p className="text-xs text-neutral-500">Assigned:</p> <div className="flex -!gap-x-2">
//               //                 {file.assignedTo.slice(0, 3).map((assignment) => (
//               //                   <Avatar key={assignment.id} className=" size-6  border-2 border-background">
//               //                     <AvatarImage src={assignment.user.image || ''} />
//               //                     <AvatarFallback className="text-[10px]">
//               //                       {assignment.user.name?.[0]}
//               //                     </AvatarFallback>
//               //                   </Avatar>
//               //                 ))}
//               //                 {file.assignedTo.length > 3 && (
//               //                   <span className="text-xs text-muted-foreground  size-6  border-2 border-background bg-red-500 rounded-full text-center">
//               //                     +{file.assignedTo.length - 3}
//               //                   </span>
//               //                 )}
//               //               </div>
//               //             </div>
//               //           )}
//               //           <div className=" flex h-fit justify-end gap-0">

//               //             <div className='flex w-fit justify-center gap-1 items-center'>
//               //               <Button variant="ghost" size="icon" className=" !px-0 !py-2.5 h-7 w-7 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
//               //                 <AnimateIcon animateOnHover>
//               //                   <Link2 className="-rotate-45 h-7 w-7 dark:text-[#d0cfcf]" />
//               //                 </AnimateIcon>
//               //               </Button>

//               //               <Button onClick={() => handleDownload(file)} variant="ghost" size="icon" className=" !px-0 !py-2.5 h-7 w-7 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
//               //                 <AnimateIcon animateOnHover>
//               //                   <DownloadIcon className="h-7 w-7 dark:text-[#d0cfcf]" />
//               //                 </AnimateIcon>
//               //               </Button>

//               //               {file.isOwner && (
//               //                 <>
//               //                   <Button className=' !px-0 !py-2.5 h-7 w-7 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]'
//               //                     variant="ghost" size="icon"
//               //                     onClick={() => {
//               //                       setSelectedFile(file);
//               //                       setNewFileName(file.originalName);
//               //                       setRenameDialogOpen(true);
//               //                     }}
//               //                   >
//               //                     <Edit className="h-7 w-7 dark:text-[#d0cfcf]" />
//               //                   </Button>

//               //                 </>
//               //               )}

//               //               {selectedTeamId && (
//               //                 <Button onClick={() => {
//               //                   setSelectedFile(file);
//               //                   setAssignDialogOpen(true);
//               //                 }}
//               //                   variant="ghost" size="icon" className=" !px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
//               //                   <AnimateIcon animateOnHover>
//               //                     <User className="h-5 w-5 dark:text-[#d0cfcf]" />
//               //                   </AnimateIcon>
//               //                 </Button>
//               //               )}
//               //               <DropdownMenu>
//               //                 <DropdownMenuTrigger >
//               //                   <AnimateIcon animateOnHover >
//               //                     <DropdownMenuTrigger className='' >
//               //                       <Button
//               //                         variant="ghost"
//               //                         size="icon"
//               //                         className="!px-0 !-rotate-90 !py-2.5 h-5 w-6 rounded-sm hover:bg-[#F0F0F0] hover:dark:bg-[#222222]"
//               //                       >
//               //                         <Ellipsis className="  h-5 w-5 dark:text-[#d0cfcf]" />
//               //                       </Button>
//               //                     </DropdownMenuTrigger>
//               //                   </AnimateIcon>
//               //                 </DropdownMenuTrigger>
//               //                 <DropdownMenuContent align="end">
//               //                   <DropdownMenuItem onClick={() => handleDownload(file)}>
//               //                     <Download className=" size-4  mr-2" /> Open
//               //                   </DropdownMenuItem>
//               //                   {/* ANY team member can assign */}
//               //                   {selectedTeamId && (
//               //                     <DropdownMenuItem
//               //                       onClick={() => {
//               //                         setSelectedFile(file);
//               //                         setAssignDialogOpen(true);
//               //                       }}
//               //                     >
//               //                       <UserPlus className=" size-4  mr-2" /> Assign to Member
//               //                     </DropdownMenuItem>
//               //                   )}
//               //                   {file.isOwner && (
//               //                     <>
//               //                       <DropdownMenuItem
//               //                         onClick={() => {
//               //                           setSelectedFile(file);
//               //                           setNewFileName(file.originalName);
//               //                           setRenameDialogOpen(true);
//               //                         }}
//               //                       >
//               //                         <Edit className=" size-4  mr-2" /> Rename
//               //                       </DropdownMenuItem>
//               //                       <DropdownMenuItem
//               //                         onClick={() => {
//               //                           setSelectedFile(file);
//               //                           setMoveDialogOpen(true);
//               //                         }}
//               //                       >
//               //                         <FolderOpen className=" size-4  mr-2" /> Move to Folder
//               //                       </DropdownMenuItem>
//               //                       <DropdownMenuItem
//               //                         onClick={() => handleDelete(file.id)}
//               //                         className="text-destructive"
//               //                       >
//               //                         <Trash2 className=" size-4  mr-2" /> Delete
//               //                       </DropdownMenuItem>
//               //                     </>
//               //                   )}
//               //                 </DropdownMenuContent>
//               //               </DropdownMenu>
//               //             </div>
//               //           </div>
//               //           {getVisibilityBadge(file.visibility)}

//               //         </div>

//               //       </div>
//               //       <div className="flex h-full items-center justify-center w-full overflow-y-auto">
//               //         {file.mimeType.startsWith('image/') && (
//               //           <div className="mt-3">
//               //             <Image
//               //               src={file.url}
//               //               alt={file.originalName}
//               //               className=" object-cover rounded-xl"
//               //               height={1000}
//               //               width={1000}
//               //             />
//               //           </div>
//               //         )}
//               //         {file.mimeType.startsWith('video/') && (
//               //           <div className="mt-3">
//               //             <video
//               //               autoPlay={false}
//               //               loop
//               //               muted
//               //               src={file.url}
//               //               className="w-full min-h-48 h-48 object-cover rounded-xl"
//               //             />
//               //           </div>
//               //         )}
//               //         {file.mimeType.startsWith('audio/') && (
//               //           <div className="mt-3 border rounded-lg bg-muted/30 p-3">
//               //             <div className="flex items-center gap-3">
//               //               <div className="flex-shrink-0  size-10  bg-blue-500 text-white rounded-full flex items-center justify-center">
//               //                 🎵
//               //               </div>
//               //               <div className="flex-1 min-w-0">
//               //                 <audio
//               //                   controls
//               //                   src={file.url}
//               //                   className="mt-2 w-full"
//               //                 />
//               //               </div>
//               //             </div>
//               //           </div>
//               //         )}
//               //         {file.mimeType === 'application/pdf' && (
//               //           <div className="overflow-hidden max-h-32 w-full mt-3 rounded-lg border">
//               //             <iframe
//               //               src={file.url}
//               //               className="w-full max-h-48 h-48 rounded" // fixed height
//               //               title={file.originalName}
//               //             />
//               //           </div>
//               //         )}
//               //         {(file.mimeType === 'application/msword' ||
//               //           file.mimeType ===
//               //           'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
//               //             <div className="overflow-hidden w-full mt-3 rounded-lg border h-48">
//               //               <iframe
//               //                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
//               //                 className="w-full h-full rounded"
//               //                 title={file.originalName}
//               //               />
//               //             </div>
//               //           )}
//               //         {(file.mimeType === 'application/zip' ||
//               //           file.mimeType === 'application/x-zip-compressed' ||
//               //           file.mimeType === 'application/vnd.rar' ||
//               //           file.mimeType === 'application/x-rar-compressed' ||
//               //           file.ext?.toLowerCase() === 'zip' ||
//               //           file.ext?.toLowerCase() === 'rar') && (
//               //             <div className="mt-3 border h-48 max-h-48 rounded-lg bg-muted/30 p-3">
//               //               <div className="flex items-center gap-3">
//               //                 <div className="flex-shrink-0  size-10  bg-yellow-500 text-white rounded-full flex items-center justify-center">
//               //                   📦
//               //                 </div>
//               //                 <div className="flex-1 min-w-0">
//               //                   <p className="text-sm font-medium truncate">
//               //                     {file.originalName}
//               //                   </p>
//               //                   <p className="text-xs text-muted-foreground">
//               //                     {file.ext?.toUpperCase()} • {file.formattedSize}
//               //                   </p>
//               //                   <a
//               //                     href={file.url}
//               //                     download
//               //                     className="mt-2 inline-block text-sm text-blue-600 hover:underline"
//               //                   >
//               //                     Download Archive
//               //                   </a>
//               //                 </div>
//               //               </div>
//               //             </div>

//               //           )}
//               //       </div>
//               //     </ExpandableScreenContent>

//               //   </ExpandableScreen>
//               // </>

//               <ExpandableScreen
//                 key={file.id}
//                 layoutId={`file-${file.id}`}
//                 triggerRadius="100px"
//                 contentRadius="24px"
//               >
//                 {/* Trigger - shows lock overlay if file is password protected */}
//                 <ExpandableScreenTrigger>
//                   <div className="relative">
//                     {/* Normal card content */}
//                     <Card className="rounded-2xl group relative border-t-2 border-white border-none h-fit   p-1   pt-3 dark:bg-neutral-800 shadow">
//                       {/* ... all your existing card content ... */}
//                       <div className="flex justify-between items-center w-full">
//                         <div className="flex justify-start items-start gap-2 px-1">
//                           <Avatar className="size-8">
//                             <AvatarImage src={file.user.image || ''} />
//                             <AvatarFallback>
//                               {file.user.name?.[0]}
//                             </AvatarFallback>
//                           </Avatar>
//                           <div className="flex flex-col">
//                             <h3 className="font-medium text-xs truncate" title={file.originalName}>
//                               {file.originalName.slice(0, 20)}
//                             </h3>
//                             <p className="text-xs text-neutral-500">
//                               {file.user.name} • {file.formattedSize} • {file.ext.toUpperCase()}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex justify-center">
//                           {getVisibilityBadge(file.visibility)}
//                           <DropdownMenu>
//                             <DropdownMenuTrigger>
//                               <AnimateIcon animateOnHover>
//                                 <Button
//                                   variant="ghost"
//                                   size="icon"
//                                   className="!px-0 !-rotate-90 !py-2.5 h-5 w-6 rounded-sm hover:bg-[#F0F0F0] hover:dark:bg-[#222222]"
//                                 >
//                                   <Ellipsis className="h-5 w-5 dark:text-[#8D8D8D]" />
//                                 </Button>
//                               </AnimateIcon>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end">
//                               <DropdownMenuItem onClick={() => handleDownload(file)}>
//                                 <Download className=" size-4  mr-2" /> Open
//                               </DropdownMenuItem>
//                               {selectedTeamId && (
//                                 <DropdownMenuItem
//                                   onClick={() => {
//                                     setSelectedFile(file);
//                                     setAssignDialogOpen(true);
//                                   }}
//                                 >
//                                   <UserPlus className=" size-4  mr-2" /> Assign to Member
//                                 </DropdownMenuItem>
//                               )}
//                               {file.isOwner && (
//                                 <>
//                                   <DropdownMenuItem
//                                     onClick={() => {
//                                       setSelectedFile(file);
//                                       setNewFileName(file.originalName);
//                                       setRenameDialogOpen(true);
//                                     }}
//                                   >
//                                     <Edit className=" size-4  mr-2" /> Rename
//                                   </DropdownMenuItem>
//                                   <DropdownMenuItem
//                                     onClick={() => {
//                                       setSelectedFile(file);
//                                       setMoveDialogOpen(true);
//                                     }}
//                                   >
//                                     <FolderOpen className=" size-4  mr-2" /> Move to Folder
//                                   </DropdownMenuItem>
//                                   <DropdownMenuItem
//                                     onClick={() => handleDelete(file.id)}
//                                     className="text-destructive"
//                                   >
//                                     <Trash2 className=" size-4  mr-2" /> Delete
//                                   </DropdownMenuItem>
//                                 </>
//                               )}
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </div>
//                       </div>

//                       {/* File preview section - same as before */}
//                       <div className="group relative">
//                         <div className="absolute inset-0 rounded-md opacity-0 py-1 px-2 group-hover:opacity-100 transition-opacity flex items-end h-fit justify-end gap-2">
//                           <div className='flex w-fit justify-center px-1 py-0.5 h-8 rounded-md bg-[#ffffff] dark:bg-[#111111] items-center'>
//                             <Button onClick={() => handleDownload(file)} variant="ghost" size="icon" className="!px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
//                               <AnimateIcon animateOnHover>
//                                 <DownloadIcon className="h-5 w-5 dark:text-[#8D8D8D]" />
//                               </AnimateIcon>
//                             </Button>
//                             {file.isOwner && (
//                               <Button className='!px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]'
//                                 variant="ghost" size="icon"
//                                 onClick={() => {
//                                   setSelectedFile(file);
//                                   setNewFileName(file.originalName);
//                                   setRenameDialogOpen(true);
//                                 }}
//                               >
//                                 <Edit className="h-6 w-6 dark:text-[#8D8D8D]" />
//                               </Button>
//                             )}
//                             {selectedTeamId && (
//                               <Button onClick={() => {
//                                 setSelectedFile(file);
//                                 setAssignDialogOpen(true);
//                               }}
//                                 variant="ghost" size="icon" className="!px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
//                                 <AnimateIcon animateOnHover>
//                                   <User className="h-5 w-5 dark:text-[#8D8D8D]" />
//                                 </AnimateIcon>
//                               </Button>
//                             )}
//                           </div>
//                         </div>

//                         {/* File content rendering - same as your existing code */}
//                         {file.mimeType.startsWith('image/') && (
//                           <div className="mt-3">
//                             <Image
//                               src={file.url}
//                               alt={file.originalName}
//                               className="w-full h-48 max-h-48 object-cover rounded-xl"
//                               height={1000}
//                               width={1000}
//                               unoptimized
//                             />
//                           </div>
//                         )}
//                         {file.mimeType.startsWith('video/') && (
//                           <div className="mt-3">
//                             <video
//                               autoPlay={false}
//                               loop
//                               muted
//                               src={file.url}
//                               className="w-full min-h-48 h-48 object-cover rounded-xl"
//                             />
//                           </div>
//                         )}
//                         {file.mimeType.startsWith('audio/') && (
//                           <div className="mt-3 border rounded-lg bg-muted/30 p-3">
//                             <div className="flex items-center gap-3">
//                               <div className="flex-shrink-0  size-10  bg-blue-500 text-white rounded-full flex items-center justify-center">
//                                 🎵
//                               </div>
//                               <div className="flex-1 min-w-0">
//                                 <audio controls src={file.url} className="mt-2 w-full" />
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                         {file.mimeType === 'application/pdf' && (
//                           <div className="overflow-hidden max-h-32 w-full mt-3 rounded-lg border">
//                             <iframe
//                               src={file.url}
//                               className="w-full max-h-48 h-48 rounded"
//                               title={file.originalName}
//                               sandbox='allow-same-origin allow-popups'
//                             />
//                           </div>
//                         )}
//                         {(file.mimeType === 'application/msword' ||
//                           file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
//                             <div className="overflow-hidden w-full mt-3 rounded-lg border h-48">
//                               <iframe
//                                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
//                                 className="w-full h-full rounded"
//                                 title={file.originalName}
//                                 sandbox='allow-same-origin allow-popups'
//                               />
//                             </div>
//                           )}
//                         {(file.mimeType === 'application/zip' ||
//                           file.mimeType === 'application/x-zip-compressed' ||
//                           file.mimeType === 'application/vnd.rar' ||
//                           file.mimeType === 'application/x-rar-compressed' ||
//                           file.ext?.toLowerCase() === 'zip' ||
//                           file.ext?.toLowerCase() === 'rar') && (
//                             <div className="mt-3 border h-48 max-h-48 rounded-lg bg-muted/30 p-3">
//                               <div className="flex items-center gap-3">
//                                 <div className="flex-shrink-0  size-10  bg-yellow-500 text-white rounded-full flex items-center justify-center">
//                                   📦
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   <p className="text-sm font-medium truncate">{file.originalName}</p>
//                                   <p className="text-xs text-muted-foreground">{file.ext?.toUpperCase()} • {file.formattedSize}</p>
//                                   <a href={file.url} download className="mt-2 inline-block text-sm text-blue-600 hover:underline">
//                                     Download Archive
//                                   </a>
//                                 </div>
//                               </div>
//                             </div>
//                           )}
//                       </div>
//                     </Card>

//                     {/* LOCK OVERLAY - Shows when file is password protected and not verified */}
//                     {isFileLocked(file) && (
//                       <div
//                         className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl cursor-pointer"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setSelectedFile(file);
//                           setPasswordDialogOpen(true);
//                         }}
//                       >
//                         <div className="relative w-full h-full rounded-2xl overflow-hidden">
//                           <Image
//                             src="https://i.pinimg.com/1200x/7b/95/a2/7b95a2e1ecf7a65120d0417c44d2a66e.jpg"
//                             alt="Locked"
//                             width={1000}
//                             height={1000}
//                             fill
//                             sizes="(max-width: 768px) 100vw, 50vw"
//                             className="object-cover opacity-90"
//                           />
//                           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">

//                             <p className="text-[#b4b4b4] text-sm mt-8 opacity-90 font-medium">Click to unlock</p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </ExpandableScreenTrigger>

//                 {/* Content - shows lock image if not verified, otherwise shows actual content */}
//                 <ExpandableScreenContent className="bg-[#000] max-w-7xl max-h-[96%] !rounded-lg !overflow-hidden border border-[#181818]">
//                   {isFileLocked(file) ? (
//                     // LOCKED STATE - Shows lock image in expanded view
//                     <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#191919]">
//                       <Image
//                         src="https://i.pinimg.com/1200x/7b/95/a2/7b95a2e1ecf7a65120d0417c44d2a66e.jpg"
//                         alt="Locked"
//                         width={1000}
//                         height={1000}
//                         className="object-cover opacity-60"
//                       />
//                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
//                         <Lock className=" size-16  text-white mb-4" />
//                         <p className="text-white text-lg font-medium mb-2">This file is password protected</p>
//                         <p className="text-neutral-400 text-sm mb-6">Enter password to view content</p>
//                         <Button
//                           onClick={() => setPasswordDialogOpen(true)}
//                           className="bg-white text-black hover:bg-neutral-200"
//                         >
//                           <Lock className=" size-4  mr-2" />
//                           Enter Password
//                         </Button>
//                       </div>
//                     </div>
//                   ) : (
//                     // UNLOCKED STATE - Shows actual file content (your existing content code)
//                     <>
//                       <div className="bg-[#191919] border-t border-[#1F1F1F] h-10 w-full flex justify-between items-center pr-10">
//                         <div className="flex justify-start items-center gap-2 px-4">
//                           <Avatar className="size-6">
//                             <AvatarImage src={file.user.image || ''} />
//                             <AvatarFallback>{file.user.name?.[0]}</AvatarFallback>
//                           </Avatar>
//                           <div className="flex flex-col">
//                             <h3 className="font-medium text-xs truncate" title={file.originalName}>
//                               {file.originalName.slice(0, 20)}
//                             </h3>
//                             <p className="text-xs text-neutral-500">
//                               {file.user.name} • {file.formattedSize} • {file.ext.toUpperCase()}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex justify-end items-center gap-2">
//                           {file.assignedTo.length > 0 && (
//                             <div className="flex items-center gap-1">
//                               <p className="text-xs text-neutral-500">Assigned:</p>
//                               <div className="flex -!gap-x-2">
//                                 {file.assignedTo.slice(0, 3).map((assignment) => (
//                                   <Avatar key={assignment.id} className=" size-6  border-2 border-background">
//                                     <AvatarImage src={assignment.user.image || ''} />
//                                     <AvatarFallback className="text-[10px]">{assignment.user.name?.[0]}</AvatarFallback>
//                                   </Avatar>
//                                 ))}
//                                 {file.assignedTo.length > 3 && (
//                                   <span className="text-xs text-muted-foreground  size-6  border-2 border-background bg-red-500 rounded-full text-center">
//                                     +{file.assignedTo.length - 3}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                           <div className="flex h-fit justify-end gap-0">
//                             <div className='flex w-fit justify-center gap-1 items-center'>
//                               <Button variant="ghost" size="icon" className="!px-0 !py-2.5 h-7 w-7 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
//                                 <AnimateIcon animateOnHover>
//                                   <Link2 className="-rotate-45 h-7 w-7 dark:text-[#d0cfcf]" />
//                                 </AnimateIcon>
//                               </Button>
//                               <Button onClick={() => handleDownload(file)} variant="ghost" size="icon" className="!px-0 !py-2.5 h-7 w-7 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
//                                 <AnimateIcon animateOnHover>
//                                   <DownloadIcon className="h-7 w-7 dark:text-[#d0cfcf]" />
//                                 </AnimateIcon>
//                               </Button>
//                               {file.isOwner && (
//                                 <Button className='!px-0 !py-2.5 h-7 w-7 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]'
//                                   variant="ghost" size="icon"
//                                   onClick={() => {
//                                     setSelectedFile(file);
//                                     setNewFileName(file.originalName);
//                                     setRenameDialogOpen(true);
//                                   }}
//                                 >
//                                   <Edit className="h-7 w-7 dark:text-[#d0cfcf]" />
//                                 </Button>
//                               )}
//                               {selectedTeamId && (
//                                 <Button onClick={() => {
//                                   setSelectedFile(file);
//                                   setAssignDialogOpen(true);
//                                 }}
//                                   variant="ghost" size="icon" className="!px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
//                                   <AnimateIcon animateOnHover>
//                                     <User className="h-5 w-5 dark:text-[#d0cfcf]" />
//                                   </AnimateIcon>
//                                 </Button>
//                               )}
//                               <DropdownMenu>
//                                 <DropdownMenuTrigger>
//                                   <AnimateIcon animateOnHover>
//                                     <Button
//                                       variant="ghost"
//                                       size="icon"
//                                       className="!px-0 !-rotate-90 !py-2.5 h-5 w-6 rounded-sm hover:bg-[#F0F0F0] hover:dark:bg-[#222222]"
//                                     >
//                                       <Ellipsis className="h-5 w-5 dark:text-[#d0cfcf]" />
//                                     </Button>
//                                   </AnimateIcon>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent align="end">
//                                   <DropdownMenuItem onClick={() => handleDownload(file)}>
//                                     <Download className=" size-4  mr-2" /> Open
//                                   </DropdownMenuItem>
//                                   {selectedTeamId && (
//                                     <DropdownMenuItem
//                                       onClick={() => {
//                                         setSelectedFile(file);
//                                         setAssignDialogOpen(true);
//                                       }}
//                                     >
//                                       <UserPlus className=" size-4  mr-2" /> Assign to Member
//                                     </DropdownMenuItem>
//                                   )}
//                                   {file.isOwner && (
//                                     <>
//                                       <DropdownMenuItem
//                                         onClick={() => {
//                                           setSelectedFile(file);
//                                           setNewFileName(file.originalName);
//                                           setRenameDialogOpen(true);
//                                         }}
//                                       >
//                                         <Edit className=" size-4  mr-2" /> Rename
//                                       </DropdownMenuItem>
//                                       <DropdownMenuItem
//                                         onClick={() => {
//                                           setSelectedFile(file);
//                                           setMoveDialogOpen(true);
//                                         }}
//                                       >
//                                         <FolderOpen className=" size-4  mr-2" /> Move to Folder
//                                       </DropdownMenuItem>
//                                       <DropdownMenuItem
//                                         onClick={() => handleDelete(file.id)}
//                                         className="text-destructive"
//                                       >
//                                         <Trash2 className=" size-4  mr-2" /> Delete
//                                       </DropdownMenuItem>
//                                     </>
//                                   )}
//                                 </DropdownMenuContent>
//                               </DropdownMenu>
//                             </div>
//                           </div>
//                           {getVisibilityBadge(file.visibility)}
//                         </div>
//                       </div>
//                       <div className="flex h-full items-center justify-center w-full overflow-y-auto scrollbar-thin2">
//                         {file.mimeType.startsWith('image/') && (
//                           <div className="">
//                             <Image
//                               src={file.url}
//                               alt={file.originalName}
//                               className="object-cover rounded-xl"
//                               height={1000}
//                               width={1000}
//                             />
//                           </div>
//                         )}
//                         {file.mimeType.startsWith('video/') && (
//                           <div className="max-h-full">
//                             <video
//                               autoPlay={true}
//                               loop
//                               controls
//                               src={file.url}
//                               className="w-full h-full object-contain rounded-xl"
//                             />
//                           </div>
//                         )}
//                         {file.mimeType.startsWith('audio/') && (
//                           <div className="mt-3 border rounded-lg bg-muted/30 p-3">
//                             <div className="flex items-center gap-3">
//                               <div className="flex-shrink-0  size-10  bg-blue-500 text-white rounded-full flex items-center justify-center">
//                                 🎵
//                               </div>
//                               <div className="flex-1 min-w-0">
//                                 <audio controls src={file.url} className="mt-2 w-full" />
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                         {file.mimeType === 'application/pdf' && (
//                           <div className="overflow-hidden max-h-full h-full w-full rounded-lg border">
//                             <iframe
//                               src={file.url}
//                               className="w-full max-h-full h-full rounded"
//                               title={file.originalName}
//                               sandbox='allow-same-origin allow-popups'
//                             />
//                           </div>
//                         )}
//                         {(file.mimeType === 'application/msword' ||
//                           file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
//                             <div className="overflow-hidden w-full rounded-lg border h-full">
//                               <iframe
//                                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
//                                 className="w-full h-full rounded"
//                                 title={file.originalName}
//                                 sandbox='allow-same-origin allow-popups'
//                               />
//                             </div>
//                           )}
//                         {(file.mimeType === 'application/zip' ||
//                           file.mimeType === 'application/x-zip-compressed' ||
//                           file.mimeType === 'application/vnd.rar' ||
//                           file.mimeType === 'application/x-rar-compressed' ||
//                           file.ext?.toLowerCase() === 'zip' ||
//                           file.ext?.toLowerCase() === 'rar') && (
//                             <div className=" border h-full max-h-full rounded-lg bg-muted/30 p-3">
//                               <div className="flex items-center gap-3">
//                                 <div className="flex-shrink-0  size-10  bg-yellow-500 text-white rounded-full flex items-center justify-center">
//                                   📦
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   <p className="text-sm font-medium truncate">{file.originalName}</p>
//                                   <p className="text-xs text-muted-foreground">{file.ext?.toUpperCase()} • {file.formattedSize}</p>
//                                   <a href={file.url} download className="mt-2 inline-block text-sm text-blue-600 hover:underline">
//                                     Download Archive
//                                   </a>
//                                 </div>
//                               </div>
//                             </div>
//                           )}
//                       </div>
//                     </>
//                   )}
//                 </ExpandableScreenContent>
//               </ExpandableScreen>
//             ))}

//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div className="rounded-lg ">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="text-xs px-0">
//                     <TableHead className="h-7 "></TableHead>
//                     <TableHead className="h-7">Name</TableHead>
//                     <TableHead className="h-7 w-[100px] ">Last Modified</TableHead>
//                     <TableHead className="h-7 w-[100px] text-end">Visibility</TableHead>
//                     <TableHead className="h-7 w-[100px] text-center">Type</TableHead>
//                     <TableHead className="h-7 w-[100px] text-end ">Uploaded</TableHead>
//                     <TableHead className="h-7 text-start w-[100px]">Size</TableHead>
//                     <TableHead className="h-7  text-end">
//                       Actions
//                     </TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {files.map((file: FileItem) => (
//                     <TableRow
//                       key={file.id}
//                       className="relative !rounded-md"
//                       onMouseEnter={() => setHoveredRow(file.id)}
//                       onMouseLeave={() => setHoveredRow(null)}
//                     >
//                       <TableCell className="py-1 px-0 h-0 !rounded-md">
//                         <div className="flex p-0 justify-center items-center">
//                           {(hoveredRow === file.id ||
//                             selectedFiles.includes(file.id)) && (
//                               <Checkbox
//                                 checked={selectedFiles.length === files.length}
//                                 onCheckedChange={(checked) => {
//                                   if (checked) setSelectedFiles(files.map(f => f.id));
//                                   else setSelectedFiles([]);
//                                 }}
//                               />

//                             )}
//                         </div>
//                       </TableCell>
//                       <TableCell className="">
//                         <div className="flex items-center gap-1">
//                           <div className="size-6 h-4 w-4 flex items-center justify-center text-muted-foreground/80">
//                             {getFileIcon(file.mimeType)}
//                           </div>
//                           <HoverCard>
//                             <HoverCardTrigger className="cursor-pointer ">
//                               <p className="text-sm font-[400] truncate !text-gray-400">{file.originalName}</p>
//                             </HoverCardTrigger>
//                             <HoverCardContent className="dark:bg-black flex justify-center items-center overflow-hidden border p-1 h-80 min-w-40 w-auto">
//                               {file.mimeType.startsWith('image/') && (
//                                 <Image
//                                   className="w-full h-full object-cover rounded-sm"
//                                   src={file.url}
//                                   alt=""
//                                   height={1000}
//                                   width={1000}
//                                 />
//                               )}
//                               {file.mimeType.startsWith('video/') && (
//                                 <video
//                                   autoPlay
//                                   loop
//                                   src={file.url}
//                                   className="w-full h-full object-cover rounded"
//                                 />
//                               )}
//                               {file.mimeType.startsWith('audio/') && (
//                                 <audio controls src={file.url} className="" />
//                               )}
//                               {file.mimeType === 'application/pdf' && (
//                                 <iframe
//                                   src={file.url}
//                                   className=" w-full h-full object-cover "
//                                   title={file.originalName}
//                                   sandbox='allow-same-origin allow-popups'
//                                 />
//                               )}
//                               {(file.mimeType === 'application/msword' ||
//                                 file.mimeType ===
//                                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
//                                   <div className="overflow-hidden w-full mt-3 rounded-lg border h-[80vh]">
//                                     <iframe
//                                       src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
//                                       className="w-full h-full rounded"
//                                       title={file.originalName}
//                                       sandbox='allow-same-origin allow-popups'
//                                     />
//                                   </div>
//                                 )}
//                               {(file.mimeType === 'application/zip' ||
//                                 file.mimeType ===
//                                 'application/x-zip-compressed' ||
//                                 file.mimeType === 'application/vnd.rar' ||
//                                 file.mimeType ===
//                                 'application/x-rar-compressed' ||
//                                 file.ext?.toLowerCase() === 'zip' ||
//                                 file.ext?.toLowerCase() === 'rar') && (
//                                   <div className="mt-3 border rounded-lg bg-muted/30 p-3">
//                                     <div className="flex items-center gap-3">
//                                       <div className="flex-shrink-0  size-10  bg-yellow-500 text-white rounded-full flex items-center justify-center">
//                                         📦
//                                       </div>
//                                       <div className="flex-1 min-w-0">
//                                         <p className="text-sm font-medium truncate">
//                                           {file.originalName}
//                                         </p>
//                                         <p className="text-xs text-muted-foreground">
//                                           {file.ext?.toUpperCase()} •{' '}
//                                           {file.formattedSize}
//                                         </p>
//                                         <a
//                                           href={file.url}
//                                           download
//                                           className="mt-2 inline-block text-sm text-blue-600 hover:underline"
//                                         >
//                                           Download Archive
//                                         </a>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 )}

//                               {(file.mimeType ===
//                                 'application/vnd.ms-excel' ||
//                                 file.mimeType ===
//                                 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
//                                 file.ext?.toLowerCase() === 'xls' ||
//                                 file.ext?.toLowerCase() === 'xlsx') && (
//                                   <div className="overflow-hidden w-full mt-3 rounded-lg border h-[80vh]">
//                                     <iframe
//                                       src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
//                                       className="w-full h-full rounded"
//                                       title={file.originalName}
//                                       sandbox='allow-same-origin allow-popups'
//                                     />
//                                   </div>
//                                 )}
//                             </HoverCardContent>
//                           </HoverCard>
//                         </div>
//                       </TableCell>
//                       <TableCell className="py-1 text-md truncate font-[500] dark:text-neutral-400">
//                         {format(new Date(file.createdAt), 'MMM d, yyyy')}
//                       </TableCell>
//                       <TableCell className="py-1 text-md text-end truncate font-[500] dark:text-neutral-400">{getVisibilityBadge(file.visibility)}</TableCell>

//                       <TableCell className="py-1 text-center">
//                         <Badge variant="secondary" className="text-xs">
//                           {file.mimeType.split('/')[1]?.toUpperCase().slice(0, 7)}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="py-1 justify-center text-center gap-1 items-center flex !mr-2">

//                         <Avatar className=" size-6 ">
//                           <AvatarImage src={file.user.image || ''} />
//                           <AvatarFallback>{file.user.name?.[0]}</AvatarFallback>
//                         </Avatar>
//                         {/* <span>{file.user.name}</span> */}

//                       </TableCell>
//                       <TableCell className="py-1 text-sm truncate font-medium dark:text-neutral-400">
//                         {file.formattedSize}
//                       </TableCell>
//                       <TableCell className="py-1 flex justify-end">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger >
//                             <AnimateIcon animateOnHover >
//                               <DropdownMenuTrigger className='' >
//                                 <Button
//                                   variant="ghost"
//                                   size="icon"
//                                   className="!px-0 !py-2.5 h-5 w-6 rounded-sm hover:bg-[#F0F0F0] hover:dark:bg-[#222222]"
//                                 >
//                                   <Ellipsis className="h-5 w-5 dark:text-[#8D8D8D]" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                             </AnimateIcon>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem onClick={() => handleDownload(file)}>
//                               <Download className=" size-4  mr-2" /> Open
//                             </DropdownMenuItem>
//                             {/* ANY team member can assign */}
//                             {selectedTeamId && (
//                               <DropdownMenuItem
//                                 onClick={() => {
//                                   setSelectedFile(file);
//                                   setAssignDialogOpen(true);
//                                 }}
//                               >
//                                 <UserPlus className=" size-4  mr-2" /> Assign to Member
//                               </DropdownMenuItem>
//                             )}
//                             {file.isOwner && (
//                               <>
//                                 <DropdownMenuItem
//                                   onClick={() => {
//                                     setSelectedFile(file);
//                                     setNewFileName(file.originalName);
//                                     setRenameDialogOpen(true);
//                                   }}
//                                 >
//                                   <Edit className=" size-4  mr-2" /> Rename
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem
//                                   onClick={() => {
//                                     setSelectedFile(file);
//                                     setMoveDialogOpen(true);
//                                   }}
//                                 >
//                                   <FolderOpen className=" size-4  mr-2" /> Move to Folder
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem
//                                   onClick={() => handleDelete(file.id)}
//                                   className="text-destructive"
//                                 >
//                                   <Trash2 className=" size-4  mr-2" /> Delete
//                                 </DropdownMenuItem>
//                               </>
//                             )}
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>

//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Create Folder Dialog */}
//       <Modal open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
//         <ModalBody className='!h-[26%] !max-h-[26%] '>
//           <ModalContent>
//             <ModalHeader>
//               <ModalTitle>Create New Folder</ModalTitle>
//             </ModalHeader>
//             <div className="space-y-4 mt-5">
//               <Input
//                 placeholder="Folder name"
//                 value={newFolderName}
//                 onChange={(e) => setNewFolderName(e.target.value)}
//               />
//               <Button onClick={handleCreateFolder} className="w-full">
//                 Create Folder
//               </Button>
//             </div>
//           </ModalContent>
//         </ModalBody>
//       </Modal>

//       {/* Rename Dialog */}
//       <Modal open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
//         <ModalBody className='!h-[20vh] !max-h-[20vh] '>
//           <ModalContent>
//             <ModalHeader>
//               <ModalTitle>Rename File</ModalTitle>
//             </ModalHeader>
//             <div className="space-y-4 mt-8">
//               <Input
//                 value={newFileName}
//                 onChange={(e) => setNewFileName(e.target.value)}
//               />
//               <Button onClick={handleRename} className="w-full">
//                 Rename
//               </Button>
//             </div>
//           </ModalContent>
//         </ModalBody>
//       </Modal>

//       {/* Assign Dialog - Shows ALL team members except current user */}
//       <Modal open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
//         <ModalBody>
//           <ModalContent className="max-w-md">
//             <ModalHeader>
//               <ModalTitle>Assign File to Team Members</ModalTitle>
//               <p className="text-sm text-muted-foreground">
//                 Select members to assign this file to. They will be notified and can access it from Assigned to Me.
//               </p>
//             </ModalHeader>
//             <div className="space-y-6 mt-5">
//               {availableMembers.length === 0 ? (
//                 <p className="text-center text-muted-foreground py-4">
//                   No other team members available to assign
//                 </p>
//               ) : (
//                 <div className="max-h-64 overflow-y-auto space-y-2">
//                   {availableMembers.map((member: any) => (
//                     <div
//                       key={member.userId}
//                       className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer"
//                       onClick={() => {
//                         if (selectedUsers.includes(member.userId)) {
//                           setSelectedUsers(selectedUsers.filter(id => id !== member.userId));
//                         } else {
//                           setSelectedUsers([...selectedUsers, member.userId]);
//                         }
//                       }}
//                     >
//                       <Checkbox checked={selectedUsers.includes(member.userId)} />
//                       <Avatar className=" size-8 ">
//                         <AvatarImage src={member.user.image} />
//                         <AvatarFallback>{member.user.name?.[0]}</AvatarFallback>
//                       </Avatar>
//                       <div className="flex-1">
//                         <p className="font-medium">{member.user.name}</p>
//                         <p className="text-sm text-muted-foreground">{member.user.email}</p>
//                       </div>
//                       <Badge variant="outline" className="text-xs">
//                         {member.role}
//                       </Badge>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               <Button
//                 onClick={handleAssign}
//                 className="w-full"
//                 disabled={selectedUsers.length === 0 || availableMembers.length === 0}
//               >
//                 Assign to {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''}
//               </Button>
//             </div>
//           </ModalContent>
//         </ModalBody>
//       </Modal>

//       {/* Move to Folder Dialog */}
//       <Modal open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
//         <ModalBody>
//           <ModalContent>
//             <ModalHeader>
//               <ModalTitle>Move to Folder</ModalTitle>
//             </ModalHeader>
//             <div className="space-y-2">
//               <Button
//                 variant={selectedFile?.folderId === null ? "secondary" : "ghost"}
//                 className="w-full justify-start"
//                 onClick={() => selectedFile && moveToFolderMutation.mutate({ fileId: selectedFile.id, folderId: null })}
//               >
//                 <Folder className=" size-4  mr-2" />
//                 Root (No folder)
//               </Button>
//               {folders.map((folder: FolderItem) => (
//                 <Button
//                   key={folder.id}
//                   variant={selectedFile?.folderId === folder.id ? "secondary" : "ghost"}
//                   className="w-full justify-start"
//                   onClick={() => selectedFile && moveToFolderMutation.mutate({ fileId: selectedFile.id, folderId: folder.id })}
//                 >
//                   <Folder className=" size-4  mr-2" />
//                   {folder.name}
//                 </Button>
//               ))}
//             </div>
//           </ModalContent>
//         </ModalBody>
//       </Modal>

//       {/* Password Verification Dialog */}
//       <Modal open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
//         <ModalBody>
//           <ModalContent>
//             <ModalHeader>
//               <ModalTitle>Enter Password to Access File</ModalTitle>
//             </ModalHeader>
//             <div className="space-y-4">
//               <Input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//               <Button
//                 onClick={() => selectedFile && verifyPasswordMutation.mutate({ fileId: selectedFile.id, password })}
//                 className="w-full"
//               >
//                 Verify & Download
//               </Button>
//             </div>
//           </ModalContent>
//         </ModalBody>
//       </Modal>

//       {/* Upload Dialog */}
//       <EnhancedFileUploader
//         open={uploadDialogOpen}
//         onClose={() => setUploadDialogOpen(false)}
//         teamId={selectedTeamId}
//         members={availableMembers}
//         currentUserId={currentUserId}
//       />
//     </Tabs>
//   );
// }

'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ImageIcon, Folder, Download, Trash2,
  Edit, Lock, UserPlus, Eye, EyeOff, FolderOpen, Users, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/animated-modal';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { EnhancedFileUploader } from '@/components/file-manager/files/fileuploader-dialog';
import {
  FileArchiveIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  VideoIcon,
  SearchIcon,
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip';
import { Separator } from '@/components/ui/separator';
import DynamicIslandDemo from '@/components/ui/DynamicIslandDemo';
import { List } from '@/components/animate-ui/icons/list';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { CloudUploadIcon } from '@/components/animate-ui/icons/cloud-upload';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard';
import { Ellipsis } from '../animate-ui/icons/ellipsis';
import { DownloadIcon } from '../animate-ui/icons/download';
import { User } from '../animate-ui/icons/user';
import {
  ExpandableScreen,
  ExpandableScreenContent,
  ExpandableScreenTrigger,
} from "@/components/ui/ExpandableScreen";
import { GooeyInput } from '../ui/gooey-input';
import { Link2 } from '../animate-ui/icons/link-2';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Suspense } from 'react';
import { Link as LinkIcon, Star, Pencil, MoreHorizontal } from 'lucide-react';
import PenIcon from "../ui/pen-icon";


interface FileItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  formattedSize: string;
  url: string;
  ext: string;
  folderId: string;
  createdAt: string;
  visibility: 'PERSONAL' | 'TEAM' | 'PASSWORD_PROTECTED';
  isOwner: boolean;
  isAssigned: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  team?: {
    id: string;
    name: string;
  };
  assignedTo: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
    };
  }>;
  folder?: {
    id: string;
    name: string;
  };
}

interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  _count: {
    files: number;
  };
}

interface Team {
  id: string;
  name: string;
  slug: string;
  role: string;
}

function FileManagerContent() {
  const queryClient = useQueryClient();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const queryType = searchParams.get('type');
  const queryVisibility = searchParams.get('visibility');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [verifiedFiles, setVerifiedFiles] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const { data: teamsData } = useQuery({
    queryKey: ['my-teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams/my-teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    },
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (queryVisibility === 'personal') return 'personal';
    if (queryVisibility === 'team') return 'team';
    if (queryVisibility === 'assigned') return 'assigned';
    return 'all';
  });

  useEffect(() => {
    if (teamsData?.teams?.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teamsData.teams[0].id);
    }
  }, [teamsData, selectedTeamId]);

  const { data: filesData } = useQuery({
    queryKey: ['files', activeTab, selectedFolder, searchQuery, selectedTeamId, queryType],
    queryFn: async () => {
      const params = new URLSearchParams({
        visibility: activeTab === 'assigned' ? 'assigned' : activeTab === 'personal' ? 'personal' : activeTab === 'team' ? 'team' : 'all',
        ...(selectedFolder && { folderId: selectedFolder }),
        ...(searchQuery && { keyword: searchQuery }),
        ...(selectedTeamId && { teamId: selectedTeamId }),
        ...(queryType && { type: queryType }),
        pageSize: '50',
        pageNumber: '1',
      });

      const res = await fetch(`/api/files/all?${params}`);
      if (!res.ok) throw new Error('Failed to fetch files');
      return res.json();
    },
    enabled: !!selectedTeamId || activeTab === 'personal',
  });

  const { data: foldersData } = useQuery({
    queryKey: ['folders', selectedFolder, selectedTeamId],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(selectedFolder && { parentId: selectedFolder }),
        ...(selectedTeamId && { teamId: selectedTeamId }),
      });
      const res = await fetch(`/api/files/folders?${params}`);
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    },
    enabled: !!selectedTeamId || activeTab === 'personal',
  });

  const {
    data: membersData,
    error: membersError
  } = useQuery({
    queryKey: ['team-members', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return { data: [] };
      const res = await fetch(`/api/teams/by-id/${selectedTeamId}/members`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch members');
      }
      return res.json();
    },
    enabled: !!selectedTeamId,
    retry: 1,
  });

  useEffect(() => {
    if (membersData) {
      console.log('Team members loaded:', membersData.data?.length, 'members');
    }
    if (membersError) {
      console.error('Failed to load members:', membersError);
    }
  }, [membersData, membersError]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useQuery({
    queryKey: ['currentUser-session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      setCurrentUserId(data?.user?.id || null);
      return data;
    },
  });

  const availableMembers = membersData?.data?.filter(
    (member: any) => member.userId !== currentUserId
  ) || [];

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete file');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File deleted successfully');
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ fileId, name }: { fileId: string; name: string }) => {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalName: name }),
      });
      if (!res.ok) throw new Error('Failed to rename file');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File renamed successfully');
      setRenameDialogOpen(false);
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/files/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parentId: selectedFolder,
          teamId: selectedTeamId,
        }),
      });
      if (!res.ok) throw new Error('Failed to create folder');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder created successfully');
      setCreateFolderDialogOpen(false);
      setNewFolderName('');
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ fileId, userIds }: { fileId: string; userIds: string[] }) => {
      const res = await fetch(`/api/files/${fileId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
      });
      if (!res.ok) throw new Error('Failed to assign file');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File assigned successfully');
      setAssignDialogOpen(false);
      setSelectedUsers([]);
    },
  });

  const moveToFolderMutation = useMutation({
    mutationFn: async ({ fileId, folderId }: { fileId: string; folderId: string | null }) => {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      });
      if (!res.ok) throw new Error('Failed to move file');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File moved successfully');
      setMoveDialogOpen(false);
    },
  });

  const verifyPasswordMutation = useMutation({
    mutationFn: async ({ fileId, password }: { fileId: string; password: string }) => {
      const res = await fetch(`/api/files/${fileId}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Invalid password');
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      if (data.url) {
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          const link = document.createElement('a');
          link.href = data.url;
          link.target = '_blank';
          link.download = data.fileName || 'download';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      handlePasswordVerified(variables.fileId);
      setPasswordDialogOpen(false);
      setPassword('');
      toast.success('File unlocked successfully');
    },
    onError: (error: any) => {
      alert(error.message || 'Invalid password');
    },
  });

  const handleDelete = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(fileId);
    }
  };

  const handleRename = () => {
    if (selectedFile && newFileName.trim()) {
      renameMutation.mutate({ fileId: selectedFile.id, name: newFileName });
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName);
    }
  };

  const handleAssign = () => {
    if (selectedFile && selectedUsers.length > 0) {
      assignMutation.mutate({ fileId: selectedFile.id, userIds: selectedUsers });
    }
  };

  const handleDownload = (file: FileItem) => {
    if (file.visibility === 'PASSWORD_PROTECTED' && !file.isOwner) {
      setSelectedFile(file);
      setPasswordDialogOpen(true);
    } else {
      window.open(file.url, '_blank');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/'))
      return <ImageIcon className="size-3.5 text-green-400" />;
    if (mimeType.startsWith('video/'))
      return <VideoIcon className="size-3.5 text-red-500" />;
    if (mimeType.startsWith('audio/'))
      return <HeadphonesIcon className="size-3.5 text-pink-500" />;
    if (mimeType.includes('pdf'))
      return <FileTextIcon className="size-3.5 text-purple-500" />;
    if (mimeType.includes('word') || mimeType.includes('doc'))
      return <FileTextIcon className="size-3.5 text-blue-600" />;
    if (mimeType.includes('excel') || mimeType.includes('sheet'))
      return <FileSpreadsheetIcon className="size-3.5 text-yellow-500" />;
    if (mimeType.includes('zip') || mimeType.includes('rar'))
      return <FileArchiveIcon className="size-3.5 text-orange-500" />;
    return <FileTextIcon className="size-3.5" />;
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'PERSONAL':
        return <Badge variant="secondary" className="text-xs !py-0.5 "><EyeOff className=" size-3   mr-1" /> Personal</Badge>;
      case 'TEAM':
        return <Badge variant="default" className="text-xs !py-0.5"><Eye className=" size-3   mr-1" /> Team</Badge>;
      case 'PASSWORD_PROTECTED':
        return <Badge variant="destructive" className="text-xs !py-0.5"><Lock className=" size-3   mr-1" /> Protected</Badge>;
      default:
        return null;
    }
  };

  const isFileLocked = (file: FileItem) => {
    return file.visibility === 'PASSWORD_PROTECTED' && !file.isOwner && !verifiedFiles.has(file.id);
  };

  const handlePasswordVerified = (fileId: string) => {
    setVerifiedFiles(prev => new Set([...Array.from(prev), fileId]));
  };

  const files = filesData?.files || [];
  const folders = foldersData?.folders || [];
  const teams = teamsData?.teams || [];

  return (
    <Tabs className="flex h-full">
      <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#222] px-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='!bg-transparent rounded-none -mb-1 gap-1'>
            <TabsTrigger value="all" className="hover:border-[#B4B4B4] border-transparent border-b rounded-none data-[state=active]:bg-[#cccaca] dark:data-[state=active]:border-[#f4f4f4] hover:dark:border-[#2c22f5]">All</TabsTrigger>
            <TabsTrigger value="personal" className="hover:border-[#B4B4B4] border-transparent border-b rounded-none data-[state=active]:bg-[#cccaca] dark:data-[state=active]:border-[#f4f4f4] hover:dark:border-[#2c22f5]">Personal</TabsTrigger>
            <TabsTrigger value="team" disabled={!selectedTeamId} className="hover:border-[#B4B4B4] border-transparent border-b rounded-none data-[state=active]:bg-[#cccaca] dark:data-[state=active]:border-[#f4f4f4] hover:dark:border-[#2c22f5]">Team</TabsTrigger>
            <TabsTrigger value="assigned" className="hover:border-[#B4B4B4] border-transparent border-b rounded-none data-[state=active]:bg-[#cccaca] dark:data-[state=active]:border-[#f4f4f4] hover:dark:border-[#2c22f5]">Assigned</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex justify-center items-center gap-2">
            <Collapsible className='flex h-fit' onOpenChange={setIsOpen}>
              <CollapsibleTrigger className=' p-0 text-center h-6 rounded-full'>
                {isOpen ? <ChevronRight className='h-4 w-4 dark:text-[#B4B4B4]' /> : <ChevronLeft className='h-4 w-4 dark:text-[#B4B4B4]' />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <DynamicIslandDemo />
              </CollapsibleContent>
            </Collapsible>

            <Separator orientation="vertical" className='h-6 mr-0.5 w-[0.5px] dark:!bg-[#303030]' />

            {teams.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild className='!px-0 !py-0'>
                  <Button variant="ghost" size="icon" className="relative h-7 w-7 !px-0.5 !py-0.5 rounded-full hover:dark:bg-[#000]">
                    <Users className="h-4 w-4 text-[#B4B4B4]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  <DropdownMenuLabel>Select Team</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {teams.map((team: Team) => (
                    <DropdownMenuItem
                      key={team.id}
                      onClick={() => setSelectedTeamId(team.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Users className=" size-4  text-[#B4B4B4]" />
                        <span>{team.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {team.role}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Separator orientation="vertical" className='h-6 mr-0.5 dark:!bg-[#303030]' />

            <GooeyInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className=""
            />

            <Separator orientation="vertical" className='h-6 mr-0.5 dark:!bg-[#303030]' />
            <TabsList className="border dark:!border-[#303030] bg-transparent h-8 !p-0 overflow-hidden rounded-xl">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span>
                      <TabsTrigger
                        value="Grid"
                        onClick={() => setViewMode('grid')}
                        className="group py-2 rounded-none"
                      >
                        <AnimateIcon animateOnHover>
                          <LayoutDashboard className=" size-4  dark:text-white" />
                        </AnimateIcon>
                      </TabsTrigger>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Grid View
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Separator orientation="vertical" className="dark:!bg-[#303030]" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger onClick={() => setViewMode('list')} className='!bg-transparent'>
                    <span>
                      <AnimateIcon animateOnHover>
                        <TabsTrigger
                          value="List"
                          className="py-2 h-full w-full rounded-none !bg-transparent"
                        >
                          <List animateOnView className=" size-4  dark:text-white" />
                        </TabsTrigger>
                      </AnimateIcon>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    List View
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsList>

            <AnimateIcon animateOnHover>
              <Button
                onClick={() => setUploadDialogOpen(true)} variant="ghost"
                size="sm"
                className=" flex rounded-xl hover:bg-[#ffffff] dark:bg-[#EEE] dark:text-black"
              >
                <CloudUploadIcon pathLength={1} className="mr-0.5 h-5 w-5" />
                <p>Upload</p>
              </Button>
            </AnimateIcon>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col pt-2">
        {viewMode === 'grid' ? (
          <div className=" grid pt-0 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 pb-2 px-4 h-full">
            <Card className=" rounded-2xl group relative border-t-2 border-white border-none px-1 !py-1 pt-3 dark:bg-neutral-800 shadow overflow-hidden">
              <div className="flex items-center justify-between mb-4 px-0.5 py-0.5">
                <h3 className="font-semibold">Folders</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCreateFolderDialogOpen(true)}
                >
                  <FolderOpen className=" size-4 " />
                </Button>
              </div>

              <div className="space-y-1 pt-1 px-1 bg-[#F8F9FA] dark:bg-[#191919]  h-[calc(100%-3.2rem)] overflow-y-auto rounded-xl">
                <Button
                  variant={selectedFolder === null ? "outline" : "ghost"}
                  className="w-full justify-start rounded-lg hover:dark:bg-[#333]"
                  onClick={() => setSelectedFolder(null)}
                >
                  <Folder className=" size-4 mr-2" />
                  All Files
                </Button>

                {folders.map((folder: FolderItem) => (
                  <Button
                    key={folder.id}
                    variant={selectedFolder === folder.id ? "outline" : "ghost"}
                    className="w-full justify-start rounded-lg hover:dark:bg-[#333]"
                    onClick={() => setSelectedFolder(folder.id)}
                  >
                    <Folder className=" size-4  mr-2" />
                    <span className="truncate">{folder.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {folder._count.files}
                    </span>
                  </Button>
                ))}
              </div>
            </Card>

            {files.map((file: FileItem) => (
              <ExpandableScreen
                key={file.id}
                layoutId={`file-${file.id}`}
                triggerRadius="100px"
                contentRadius="24px"
              >
                <ExpandableScreenTrigger>
                  <div className="relative">
                    <Card className="rounded-2xl group relative border-t-2 border-white border-none h-fit   p-1   pt-3 dark:bg-neutral-800 shadow">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex justify-start items-start gap-2 px-1">
                          <Avatar className="size-8">
                            <AvatarImage src={file.user.image || ''} />
                            <AvatarFallback>
                              {file.user.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <h3 className="font-medium text-xs truncate" title={file.originalName}>
                              {file.originalName.slice(0, 20)}
                            </h3>
                            <p className="text-xs text-neutral-500">
                              {file.user.name} • {file.formattedSize} • {file.ext.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          {getVisibilityBadge(file.visibility)}
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <AnimateIcon animateOnHover>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="!px-0 !-rotate-90 !py-2.5 h-5 w-6 rounded-sm hover:bg-[#F0F0F0] hover:dark:bg-[#222222]"
                                >
                                  <Ellipsis className="h-5 w-5 dark:text-[#8D8D8D]" />
                                </Button>
                              </AnimateIcon>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(file)}>
                                <Download className=" size-4  mr-2" /> Open
                              </DropdownMenuItem>
                              {selectedTeamId && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedFile(file);
                                    setAssignDialogOpen(true);
                                  }}
                                >
                                  <UserPlus className=" size-4  mr-2" /> Assign to Member
                                </DropdownMenuItem>
                              )}
                              {file.isOwner && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFile(file);
                                      setNewFileName(file.originalName);
                                      setRenameDialogOpen(true);
                                    }}
                                  >
                                    <Edit className=" size-4  mr-2" /> Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFile(file);
                                      setMoveDialogOpen(true);
                                    }}
                                  >
                                    <FolderOpen className=" size-4  mr-2" /> Move to Folder
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(file.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className=" size-4  mr-2" /> Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="group relative">
                        <div className="absolute inset-0 rounded-md opacity-0 py-1 px-2 group-hover:opacity-100 transition-opacity flex items-end h-fit justify-end gap-2">
                          <div className='flex w-fit justify-center px-1 py-0.5 h-8 rounded-md bg-[#ffffff] dark:bg-[#111111] items-center'>
                            <Button onClick={() => handleDownload(file)} variant="ghost" size="icon" className="!px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
                              <AnimateIcon animateOnHover>
                                <DownloadIcon className="h-5 w-5 dark:text-[#8D8D8D]" />
                              </AnimateIcon>
                            </Button>
                            {file.isOwner && (
                              <Button className='!px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]'
                                variant="ghost" size="icon"
                                onClick={() => {
                                  setSelectedFile(file);
                                  setNewFileName(file.originalName);
                                  setRenameDialogOpen(true);
                                }}
                              >
                                <Edit className="h-6 w-6 dark:text-[#8D8D8D]" />
                              </Button>
                            )}
                            {selectedTeamId && (
                              <Button onClick={() => {
                                setSelectedFile(file);
                                setAssignDialogOpen(true);
                              }}
                                variant="ghost" size="icon" className="!px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
                                <AnimateIcon animateOnHover>
                                  <User className="h-5 w-5 dark:text-[#8D8D8D]" />
                                </AnimateIcon>
                              </Button>
                            )}
                          </div>
                        </div>

                        {file.mimeType.startsWith('image/') && (
                          <div className="mt-3">
                            <Image
                              src={file.url}
                              alt={file.originalName}
                              className="w-full h-48 max-h-48 object-cover rounded-xl"
                              height={1000}
                              width={1000}
                              unoptimized
                            />
                          </div>
                        )}
                        {file.mimeType.startsWith('video/') && (
                          <div className="mt-3">
                            <video
                              aria-label="Video player"
                              autoPlay={false}
                              loop
                              muted
                              src={file.url}
                              className="w-full min-h-48 h-48 object-cover rounded-xl"
                            />
                          </div>
                        )}
                        {file.mimeType.startsWith('audio/') && (
                          <div className="mt-3 border rounded-lg bg-muted/30 p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0  size-10  bg-blue-500 text-white rounded-full flex items-center justify-center">
                                🎵
                              </div>
                              <div className="flex-1 min-w-0">
                                <audio aria-label='audio player' controls src={file.url} className="mt-2 w-full" />
                              </div>
                            </div>
                          </div>
                        )}
                        {file.mimeType === 'application/pdf' && (
                          <div className="overflow-hidden max-h-32 w-full mt-3 rounded-lg border">
                            <iframe
                              src={file.url}
                              className="w-full max-h-48 h-48 rounded"
                              title={file.originalName}
                              sandbox='allow-same-origin allow-popups'
                            />
                          </div>
                        )}
                        {(file.mimeType === 'application/msword' ||
                          file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                            <div className="overflow-hidden w-full mt-3 rounded-lg border h-48">
                              <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
                                className="w-full h-full rounded"
                                title={file.originalName}
                                sandbox='allow-same-origin allow-popups'
                              />
                            </div>
                          )}
                        {(file.mimeType === 'application/zip' ||
                          file.mimeType === 'application/x-zip-compressed' ||
                          file.mimeType === 'application/vnd.rar' ||
                          file.mimeType === 'application/x-rar-compressed' ||
                          file.ext?.toLowerCase() === 'zip' ||
                          file.ext?.toLowerCase() === 'rar') && (
                            <div className="mt-3 border h-48 max-h-48 rounded-lg bg-muted/30 p-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0  size-10  bg-yellow-500 text-white rounded-full flex items-center justify-center">
                                  📦
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.originalName}</p>
                                  <p className="text-xs text-muted-foreground">{file.ext?.toUpperCase()} • {file.formattedSize}</p>
                                  <a href={file.url} download className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                                    Download Archive
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    </Card>

                    {isFileLocked(file) && (
                      <div
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                          setPasswordDialogOpen(true);
                        }}
                      >
                        <div className="relative w-full h-full rounded-2xl overflow-hidden">
                          <Image
                            src="https://i.pinimg.com/1200x/7b/95/a2/7b95a2e1ecf7a65120d0417c44d2a66e.jpg"
                            alt="Locked"
                            width={1000}
                            height={1000}
                            className="object-cover opacity-90"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                            <p className="text-[#b4b4b4] text-sm mt-8 opacity-90 font-medium">Click to unlock</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ExpandableScreenTrigger>

                <ExpandableScreenContent className="bg-[#000] max-w-7xl max-h-[96%] !rounded-lg !overflow-hidden border border-[#181818]">
                  {isFileLocked(file) ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#191919]">
                      <Image
                        src="https://i.pinimg.com/1200x/7b/95/a2/7b95a2e1ecf7a65120d0417c44d2a66e.jpg"
                        alt="Locked"
                        width={1000}
                        height={1000}
                        className="object-cover opacity-60"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                        <Lock className=" size-16  text-white mb-4" />
                        <p className="text-white text-lg font-medium mb-2">This file is password protected</p>
                        <p className="text-neutral-400 text-sm mb-6">Enter password to view content</p>
                        <Button
                          onClick={() => setPasswordDialogOpen(true)}
                          className="bg-white text-black hover:bg-neutral-200"
                        >
                          <Lock className=" size-4  mr-2" />
                          Enter Password
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-[#191919] border-t border-[#1F1F1F] h-10 w-full flex justify-between items-center pr-10">
                        <div className="flex justify-start items-center gap-2 px-4">
                          <Avatar className="size-6">
                            <AvatarImage src={file.user.image || ''} />
                            <AvatarFallback>{file.user.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <h3 className="font-medium text-xs truncate" title={file.originalName}>
                              {file.originalName.slice(0, 20)}
                            </h3>
                            <p className="text-xs text-neutral-500">
                              {file.user.name} • {file.formattedSize} • {file.ext.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end items-center gap-2">
                          {file.assignedTo.length > 0 && (
                            <div className="flex items-center gap-1">
                              <p className="text-xs text-neutral-500">Assigned:</p>
                              <div className="flex -!gap-x-2">
                                {file.assignedTo.slice(0, 3).map((assignment) => (
                                  <Avatar key={assignment.id} className=" size-6  border-2 border-background">
                                    <AvatarImage src={assignment.user.image || ''} />
                                    <AvatarFallback className="text-[10px]">{assignment.user.name?.[0]}</AvatarFallback>
                                  </Avatar>
                                ))}
                                {file.assignedTo.length > 3 && (
                                  <span className="text-xs text-muted-foreground  size-6  border-2 border-background bg-red-500 rounded-full text-center">
                                    +{file.assignedTo.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="flex h-fit justify-end gap-0">
                            <div className='flex w-fit justify-center gap-1 items-center'>
                              <Button variant="ghost" size="icon" className="!px-0 !py-2.5 h-7 w-7 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
                                <AnimateIcon animateOnHover>
                                  <Link2 className="-rotate-45 h-7 w-7 dark:text-[#d0cfcf]" />
                                </AnimateIcon>
                              </Button>
                              <Button onClick={() => handleDownload(file)} variant="ghost" size="icon" className="!px-0 !py-2.5 h-7 w-7 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
                                <AnimateIcon animateOnHover>
                                  <DownloadIcon className="h-7 w-7 dark:text-[#d0cfcf]" />
                                </AnimateIcon>
                              </Button>
                              {file.isOwner && (
                                <Button className='!px-0 !py-2.5 h-7 w-7 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]'
                                  variant="ghost" size="icon"
                                  onClick={() => {
                                    setSelectedFile(file);
                                    setNewFileName(file.originalName);
                                    setRenameDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-7 w-7 dark:text-[#d0cfcf]" />
                                </Button>
                              )}
                              {selectedTeamId && (
                                <Button onClick={() => {
                                  setSelectedFile(file);
                                  setAssignDialogOpen(true);
                                }}
                                  variant="ghost" size="icon" className="!px-0 !py-2.5 h-5 w-6 hover:bg-[#F0F0F0] rounded-sm hover:dark:bg-[#222222]">
                                  <AnimateIcon animateOnHover>
                                    <User className="h-5 w-5 dark:text-[#d0cfcf]" />
                                  </AnimateIcon>
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <AnimateIcon animateOnHover>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="!px-0 !-rotate-90 !py-2.5 h-5 w-6 rounded-sm hover:bg-[#F0F0F0] hover:dark:bg-[#222222]"
                                    >
                                      <Ellipsis className="h-5 w-5 dark:text-[#d0cfcf]" />
                                    </Button>
                                  </AnimateIcon>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDownload(file)}>
                                    <Download className=" size-4  mr-2" /> Open
                                  </DropdownMenuItem>
                                  {selectedTeamId && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedFile(file);
                                        setAssignDialogOpen(true);
                                      }}
                                    >
                                      <UserPlus className=" size-4  mr-2" /> Assign to Member
                                    </DropdownMenuItem>
                                  )}
                                  {file.isOwner && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedFile(file);
                                          setNewFileName(file.originalName);
                                          setRenameDialogOpen(true);
                                        }}
                                      >
                                        <Edit className=" size-4  mr-2" /> Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedFile(file);
                                          setMoveDialogOpen(true);
                                        }}
                                      >
                                        <FolderOpen className=" size-4  mr-2" /> Move to Folder
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDelete(file.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className=" size-4  mr-2" /> Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {getVisibilityBadge(file.visibility)}
                        </div>
                      </div>
                      <div className="flex h-full items-center justify-center w-full overflow-y-auto scrollbar-thin2">
                        {file.mimeType.startsWith('image/') && (
                          <div className="">
                            <Image
                              src={file.url}
                              alt={file.originalName}
                              className="object-cover rounded-xl"
                              height={1000}
                              width={1000}
                            />
                          </div>
                        )}
                        {file.mimeType.startsWith('video/') && (
                          <div className="max-h-full">
                            <video
                              aria-label="video player"
                              autoPlay={true}
                              loop
                              controls
                              src={file.url}
                              className="w-full h-full object-contain rounded-xl"
                            />
                          </div>
                        )}
                        {file.mimeType.startsWith('audio/') && (
                          <div className="mt-3 border rounded-lg bg-muted/30 p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0  size-10  bg-blue-500 text-white rounded-full flex items-center justify-center">
                                🎵
                              </div>
                              <div className="flex-1 min-w-0">
                                <audio aria-label="audio player" controls src={file.url} className="mt-2 w-full" />
                              </div>
                            </div>
                          </div>
                        )}
                        {file.mimeType === 'application/pdf' && (
                          <div className="overflow-hidden max-h-full h-full w-full rounded-lg border">
                            <iframe
                              src={file.url}
                              className="w-full max-h-full h-full rounded"
                              title={file.originalName}
                              sandbox='allow-same-origin allow-popups'
                            />
                          </div>
                        )}
                        {(file.mimeType === 'application/msword' ||
                          file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                            <div className="overflow-hidden w-full rounded-lg border h-full">
                              <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
                                className="w-full h-full rounded"
                                title={file.originalName}
                                sandbox='allow-same-origin allow-popups'
                              />
                            </div>
                          )}
                        {(file.mimeType === 'application/zip' ||
                          file.mimeType === 'application/x-zip-compressed' ||
                          file.mimeType === 'application/vnd.rar' ||
                          file.mimeType === 'application/x-rar-compressed' ||
                          file.ext?.toLowerCase() === 'zip' ||
                          file.ext?.toLowerCase() === 'rar') && (
                            <div className=" border h-full max-h-full rounded-lg bg-muted/30 p-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0  size-10  bg-yellow-500 text-white rounded-full flex items-center justify-center">
                                  📦
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.originalName}</p>
                                  <p className="text-xs text-muted-foreground">{file.ext?.toUpperCase()} • {file.formattedSize}</p>
                                  <a href={file.url} download className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                                    Download Archive
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    </>
                  )}
                </ExpandableScreenContent>
              </ExpandableScreen>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="h-7 py-1 pl-4 text-xs font-medium text-neutral-500 w-[50%]">Name</TableHead>
                    <TableHead className="h-7 py-1 text-xs font-medium text-neutral-500">Last Modified</TableHead>
                    <TableHead className="h-7 py-1 text-xs font-medium text-neutral-500">Visibility</TableHead>
                    <TableHead className="h-7 py-1 text-xs font-medium text-neutral-500 text-center">Type</TableHead>
                    <TableHead className="h-7 py-1 text-xs font-medium text-neutral-500 text-end">Size</TableHead>
                    <TableHead className="h-7 py-1 text-xs font-medium text-neutral-500 text-center w-[80px]">Uploaded</TableHead>
                    <TableHead className="h-7 py-1 pr-4 text-xs font-medium text-neutral-500 text-end w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file: FileItem) => (
                    <TableRow
                      key={file.id}
                      className="group  !border-b border-[#222] hover:bg-neutral-900/40 transition-colors cursor-pointer"
                      onMouseEnter={() => setHoveredRow(file.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {/* Name Column */}
                      <TableCell className="py-1 pl-4">
                        <div className="flex items-center gap-2.5">
                          <div className="size-4 flex items-center justify-center text-neutral-400">
                            {getFileIcon(file.mimeType)}
                          </div>

                          <div className="flex justify-center items-center gap-2">
                            <HoverCard>
                              <HoverCardTrigger className="cursor-pointer">
                                <p className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors truncate max-w-[200px]">
                                  {file.originalName}
                                </p>
                              </HoverCardTrigger>
                              <HoverCardContent className="dark:bg-black flex justify-center items-center overflow-hidden border border-neutral-800 p-1 h-80 min-w-40 w-auto">
                                {file.mimeType.startsWith('image/') && (
                                  <Image
                                    className="w-full h-full object-cover rounded-sm"
                                    src={file.url}
                                    alt=""
                                    height={1000}
                                    width={1000}
                                  />
                                )}
                                {file.mimeType.startsWith('video/') && (
                                  <video
                                    aria-label='video player'
                                    autoPlay
                                    loop
                                    src={file.url}
                                    className="w-full h-full object-cover rounded"
                                  />
                                )}
                                {file.mimeType.startsWith('audio/') && (
                                  <audio aria-label='audio player' controls src={file.url} className="" />
                                )}
                                {file.mimeType === 'application/pdf' && (
                                  <iframe
                                    src={file.url}
                                    className="w-full h-full object-cover"
                                    title={file.originalName}
                                    sandbox='allow-same-origin allow-popups'
                                  />
                                )}
                                {(file.mimeType === 'application/msword' ||
                                  file.mimeType ===
                                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                                    <div className="overflow-hidden w-full mt-3 rounded-lg border border-neutral-800 h-[80vh]">
                                      <iframe
                                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
                                        className="w-full h-full rounded"
                                        title={file.originalName}
                                        sandbox='allow-same-origin allow-popups'
                                      />
                                    </div>
                                  )}
                                {(file.mimeType === 'application/zip' ||
                                  file.mimeType ===
                                  'application/x-zip-compressed' ||
                                  file.mimeType === 'application/vnd.rar' ||
                                  file.mimeType ===
                                  'application/x-rar-compressed' ||
                                  file.ext?.toLowerCase() === 'zip' ||
                                  file.ext?.toLowerCase() === 'rar') && (
                                    <div className="mt-3 border border-neutral-800 rounded-lg bg-neutral-900/50 p-3">
                                      <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 size-10 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center text-lg">
                                          📦
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate text-neutral-200">
                                            {file.originalName}
                                          </p>
                                          <p className="text-xs text-neutral-500">
                                            {file.ext?.toUpperCase()} • {file.formattedSize}
                                          </p>
                                          <a
                                            href={file.url}
                                            download
                                            className="mt-2 inline-block text-sm text-blue-400 hover:text-blue-300 hover:underline"
                                          >
                                            Download Archive
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                {(file.mimeType ===
                                  'application/vnd.ms-excel' ||
                                  file.mimeType ===
                                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                                  file.ext?.toLowerCase() === 'xls' ||
                                  file.ext?.toLowerCase() === 'xlsx') && (
                                    <div className="overflow-hidden w-full mt-3 rounded-lg border border-neutral-800 h-[80vh]">
                                      <iframe
                                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
                                        className="w-full h-full rounded"
                                        title={file.originalName}
                                        sandbox='allow-same-origin allow-popups'
                                      />
                                    </div>
                                  )}
                              </HoverCardContent>
                            </HoverCard>


                            <AnimateIcon animateOnHover className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              <div className="flex items-center gap-1.5 flex-shrink-0 relative">
                                <button
                                  type="button"
                                  className="p-1 rounded dark:bg-[#111111] dark:hover:bg-[#222222] hover:bg-accent text-[#979797] border border-border dark:border-[#484848] hover:text-foreground transition-colors"
                                  onClick={() => handleDownload(file)} >
                                  <Link2 className="w-3.5 h-3.5 -rotate-45" />
                                </button>
                                <button
                                  type="button"
                                  className="p-1 rounded dark:bg-[#111111] dark:hover:bg-[#222222] hover:bg-accent text-[#979797] border border-border dark:border-[#484848] hover:text-foreground transition-colors"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                                {file.isOwner && (
                                  <button
                                    type="button"
                                    className="p-1 rounded dark:bg-[#111111] dark:hover:bg-[#222222] hover:bg-accent text-[#979797] border border-border dark:border-[#484848] hover:text-foreground transition-colors"
                                    onClick={() => {
                                      setSelectedFile(file);
                                      setNewFileName(file.originalName);
                                      setRenameDialogOpen(true);
                                    }} >
                                    <PenIcon className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                            </AnimateIcon>
                          </div>
                        </div>
                      </TableCell>

                      {/* Last Modified */}
                      <TableCell className="py-1 text-sm text-neutral-500">
                        {format(new Date(file.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="py-1 text-md text-start truncate font-[500] dark:text-neutral-400">
                        {getVisibilityBadge(file.visibility)}</TableCell>

                      {/* Type */}
                      <TableCell className="py-1 text-center">
                        <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                          {file.ext || file.mimeType.split('/')[1]?.slice(0, 4)}
                        </span>
                      </TableCell>

                      {/* Size */}
                      <TableCell className="py-1 text-sm text-neutral-500 text-end">
                        {file.formattedSize}
                      </TableCell>

                      {/* Uploaded By (Avatar only) */}
                      <TableCell className="py-1 text-center">
                        <Avatar className="size-6 mx-auto ring-2 ring-transparent group-hover:ring-neutral-700 transition-all">
                          <AvatarImage src={file.user.image || ''} />
                          <AvatarFallback className="text-[10px] bg-neutral-800 text-neutral-400">
                            {file.user.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-1 pr-4 text-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 dark:bg-neutral-900 border-neutral-800">
                            <DropdownMenuItem onClick={() => handleDownload(file)} className="text-sm">
                              <Download className="size-4 mr-2 text-neutral-500" /> Open
                            </DropdownMenuItem>
                            {selectedTeamId && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedFile(file);
                                  setAssignDialogOpen(true);
                                }}
                                className="text-sm"
                              >
                                <UserPlus className="size-4 mr-2 text-neutral-500" /> Assign to Member
                              </DropdownMenuItem>
                            )}
                            {file.isOwner && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedFile(file);
                                    setNewFileName(file.originalName);
                                    setRenameDialogOpen(true);
                                  }}
                                  className="text-sm"
                                >
                                  <Edit className="size-4 mr-2 text-neutral-500" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedFile(file);
                                    setMoveDialogOpen(true);
                                  }}
                                  className="text-sm"
                                >
                                  <FolderOpen className="size-4 mr-2 text-neutral-500" /> Move to Folder
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-neutral-800" />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(file.id)}
                                  className="text-sm text-red-400 focus:text-red-300 focus:bg-red-950/30"
                                >
                                  <Trash2 className="size-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <Modal open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
        <ModalBody className='!h-[26%] !max-h-[26%] '>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Create New Folder</ModalTitle>
            </ModalHeader>
            <div className="space-y-4 mt-5">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <Button onClick={handleCreateFolder} className="w-full">
                Create Folder
              </Button>
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>

      <Modal open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <ModalBody className='!h-[20vh] !max-h-[20vh] '>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Rename File</ModalTitle>
            </ModalHeader>
            <div className="space-y-4 mt-8">
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
              <Button onClick={handleRename} className="w-full">
                Rename
              </Button>
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>

      <Modal open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <ModalBody>
          <ModalContent className="max-w-md">
            <ModalHeader>
              <ModalTitle>Assign File to Team Members</ModalTitle>
              <p className="text-sm text-muted-foreground">
                Select members to assign this file to. They will be notified and can access it from Assigned to Me.
              </p>
            </ModalHeader>
            <div className="space-y-6 mt-5">
              {availableMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No other team members available to assign
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {availableMembers.map((member: any) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer"
                      onClick={() => {
                        if (selectedUsers.includes(member.userId)) {
                          setSelectedUsers(selectedUsers.filter(id => id !== member.userId));
                        } else {
                          setSelectedUsers([...selectedUsers, member.userId]);
                        }
                      }}
                    >
                      <Checkbox checked={selectedUsers.includes(member.userId)} />
                      <Avatar className=" size-8 ">
                        <AvatarImage src={member.user.image} />
                        <AvatarFallback>{member.user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <Button
                onClick={handleAssign}
                className="w-full"
                disabled={selectedUsers.length === 0 || availableMembers.length === 0}
              >
                Assign to {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>

      <Modal open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <ModalBody>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Move to Folder</ModalTitle>
            </ModalHeader>
            <div className="space-y-2">
              <Button
                variant={selectedFile?.folderId === null ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => selectedFile && moveToFolderMutation.mutate({ fileId: selectedFile.id, folderId: null })}
              >
                <Folder className=" size-4  mr-2" />
                Root (No folder)
              </Button>
              {folders.map((folder: FolderItem) => (
                <Button
                  key={folder.id}
                  variant={selectedFile?.folderId === folder.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => selectedFile && moveToFolderMutation.mutate({ fileId: selectedFile.id, folderId: folder.id })}
                >
                  <Folder className=" size-4  mr-2" />
                  {folder.name}
                </Button>
              ))}
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>

      <Modal open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <ModalBody>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Enter Password to Access File</ModalTitle>
            </ModalHeader>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                onClick={() => selectedFile && verifyPasswordMutation.mutate({ fileId: selectedFile.id, password })}
                className="w-full"
              >
                Verify & Download
              </Button>
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>

      <EnhancedFileUploader
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        teamId={selectedTeamId}
        members={availableMembers}
        currentUserId={currentUserId}
      />
    </Tabs>
  );
}


function FileManagerSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-neutral-800 rounded" />
        <div className="h-64 w-full bg-neutral-800 rounded" />
      </div>
    </div>
  );
}

export default function EnhancedFileManager() {
  return (
    <Suspense fallback={<FileManagerSkeleton />}>
      <FileManagerContent />
    </Suspense>
  );
}