// import { useState, useCallback, useEffect } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
// import { X, File, Image, Video, Music, FileText } from 'lucide-react';
// import { toast } from 'sonner';

// interface FileWithPreview extends File {
//   preview?: string;
// }

// const formatBytes = (bytes: number): string => {
//   if (bytes === 0) return '0 Bytes';
//   const k = 1024;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
// };

// const getFileIcon = (mimeType: string, fileName: string) => {
//   if (mimeType.startsWith('image/')) {
//     return <Image className="h-12 w-12 text-primary" />;
//   }
//   if (mimeType.startsWith('video/')) {
//     return <Video className="h-12 w-12 text-accent" />;
//   }
//   if (mimeType.startsWith('audio/')) {
//     return <Music className="h-12 w-12 text-purple-400" />;
//   }
//   if (fileName.endsWith('.txt')) {
//     return <FileText className="h-12 w-12 text-blue-400" />;
//   }
//   return <File className="h-12 w-12 text-muted-foreground" />;
// };

// const FileIconDisplay = ({ file }: { file: File }) => {
//   // Create a more stylized file icon display
//   return (
//     <div className="relative size-32 flex items-center justify-center">
//       <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
//       <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
//         {file.type.startsWith('image/') && (file as FileWithPreview).preview ? (
//           <img
//             src={(file as FileWithPreview).preview}
//             alt={file.name}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="flex flex-col items-center justify-center gap-2">
//             {getFileIcon(file.type, file.name)}
//             <div className="text-xs font-bold uppercase tracking-wider text-foreground/80">
//               {file.name.split('.').pop()?.slice(0, 4)}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// interface FileUploadCardProps {
//   onClose?: () => void;
// }

// export function FileUploadCard() {
//   const [files, setFiles] = useState<FileWithPreview[]>([]);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   useEffect(() => {
//     return () => {
//       files.forEach((file) => {
//         if (file.preview) URL.revokeObjectURL(file.preview);
//       });
//     };
//   }, [files]);

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     const filesWithPreview = acceptedFiles.map((file) => {
//       const fileWithPreview = file as FileWithPreview;
//       if (file.type.startsWith('image/')) {
//         fileWithPreview.preview = URL.createObjectURL(file);
//       }
//       return fileWithPreview;
//     });
//     setFiles(filesWithPreview);
//   }, []);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     multiple: false,
//     accept: {
//       'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
//       'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
//       'audio/*': ['.mp3', '.wav', '.ogg'],
//       'text/*': ['.txt'],
//       'application/*': ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
//     },
//   });

//   const handleUpload = async () => {
//     if (files.length === 0) {
//       toast.error('Please select a file to upload');
//       return;
//     }

//     setUploading(true);
//     setUploadProgress(0);

//     const interval = setInterval(() => {
//       setUploadProgress((prev) => {
//         if (prev >= 95) {
//           clearInterval(interval);
//           return prev;
//         }
//         return prev + Math.random() * 15;
//       });
//     }, 200);

//     try {
//       // Simulate upload
//       await new Promise((resolve) => setTimeout(resolve, 3000));

//       clearInterval(interval);
//       setUploadProgress(100);

//       toast.success('Upload successful!');

//       setTimeout(() => {
//         setFiles([]);
//         setUploading(false);
//         setUploadProgress(0);
//       }, 500);
//     } catch (error) {
//       clearInterval(interval);
//       toast.error('Upload failed. Please try again.');
//       setUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   return (
//     <div className="relative w-full max-w-md mx-auto">
//       <div className="bg-black/30 mt-10 rounded-3xl border border-white/20 p-8 relative overflow-hidden">
//         {/* Close button */}


//         {files.length === 0 ? (
//           <div
//             {...getRootProps()}
//             className={`  p-8 text-center cursor-pointer transition-all ${isDragActive
//                 ? 'border-primary bg-primary/5'
//                 : 'border-white/20 hover:border-white/40'
//               }`}
//           >
//             <input {...getInputProps()} />
//             <div className="gap-y-4">
//               <div className="mx-auto  size-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
//                 <File className="h-10 w-10 text-primary" />
//               </div>
//               <div>
//                 <p className="text-xl font-semibold mb-2">
//                   {isDragActive ? 'Drop your file here' : 'Drop file to upload'}
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   or click to browse from your computer
//                 </p>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             <div className="flex items-center gap-4">
//               <FileIconDisplay file={files[0]} />

//               <div className="text-start">
//                 <h3 className="text-xl capitalize font-medium mb-1 truncate max-w-md">
//                   {files[0].name}
//                 </h3>
//                 <p className="text-sm text-muted-foreground">
//                   {formatBytes(files[0].size)}
//                 </p>
//               </div>
//             </div>

//             {uploading && (
//               <div className="gap-y-3 bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin-slow" />
//                     <span className="text-sm font-medium">Uploading ...</span>
//                   </div>
//                   <span className="text-4xl font-bold tabular-nums">
//                     {Math.round(uploadProgress)} %
//                   </span>
//                 </div>
//                 <Progress value={uploadProgress} className="h-2" />
//               </div>
//             )}

//             {!uploading && (
//               <div className="flex gap-3">
//                 <Button
//                   onClick={handleUpload}
//                   className="flex-1 h-12 text-base font-semibold"
//                   size="lg"
//                 >
//                   Upload File
//                 </Button>
//                 <Button
//                   variant="outline"
//                   onClick={() => setFiles([])}
//                   className="h-12 px-6"
//                   size="lg"
//                 >
//                   Remove
//                 </Button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Cloud, X, Lock, Users, EyeOff, Folder,
  FileText, Loader2, Upload, User, ChevronLeft,
  Image, Video, Music,
} from 'lucide-react';
import { Modal, ModalContent, ModalBody } from '@/components/ui/animated-modal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTeamStore } from 'store/teamStore';
import { useTeamSlug } from 'hooks/useTeamSlug';
import useTeams from 'hooks/useTeams';

// ─── Types ─────────────────────────────────────────────────────

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

interface TeamMember {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  role: string;
}

interface UnifiedFileUploaderProps {
  open: boolean;
  onClose: () => void;
  teamId?: string | null;
  members?: TeamMember[];
  currentUserId?: string | null;
  selectedMember?: TeamMember | null;
  assignMode?: 'general' | 'member-specific';
}

interface VisibilityPillsProps {
  visibility: 'PERSONAL' | 'TEAM' | 'PASSWORD_PROTECTED';
  setVisibility: (value: 'PERSONAL' | 'TEAM' | 'PASSWORD_PROTECTED') => void;
  teamId?: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────

const EMPTY_MEMBERS: TeamMember[] = [];

const generateId = () => Math.random().toString(36).substring(2, 9);

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileExtension = (filename: string) =>
  filename.split('.').pop()?.toUpperCase() || 'FILE';

const getFileIcon = (mimeType: string, fileName: string) => {
  if (mimeType.startsWith('image/')) return <Image className="h-12 w-12 text-primary" />;
  if (mimeType.startsWith('video/')) return <Video className="h-12 w-12 text-accent" />;
  if (mimeType.startsWith('audio/')) return <Music className="h-12 w-12 text-purple-400" />;
  if (fileName.endsWith('.txt')) return <FileText className="h-12 w-12 text-blue-400" />;
  return <FileText className="h-12 w-12 text-white/60" />;
};

// ─── Visibility Pills (from code 1) ────────────────────────────

const VisibilityPills = ({ visibility, setVisibility, teamId }: VisibilityPillsProps) => (
  <div className="flex gap-1.5 flex-wrap">
    <button
      type="button"
      onClick={() => setVisibility('PERSONAL')}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
        visibility === 'PERSONAL'
          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
          : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
      }`}
    >
      <EyeOff className="w-2.5 h-2.5" /> Personal
    </button>
    {teamId && (
      <button
        type="button"
        onClick={() => setVisibility('TEAM')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
          visibility === 'TEAM'
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
            : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
        }`}
      >
        <Users className="w-2.5 h-2.5" /> Team
      </button>
    )}
    <button
      type="button"
      onClick={() => setVisibility('PASSWORD_PROTECTED')}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
        visibility === 'PASSWORD_PROTECTED'
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
      }`}
    >
      <Lock className="w-2.5 h-2.5" /> Protected
    </button>
  </div>
);

// ─── Main Component ──────────────────────────────────────────

export function UnifiedFileUploader({
  open,
  onClose,
  teamId: propTeamId,
  members: propMembers,
  currentUserId,
  selectedMember,
  assignMode = 'general',
}: UnifiedFileUploaderProps) {
  const queryClient = useQueryClient();

  // ── Team resolution: prop > store > teams[0] ─────────────────
  const { teams, selectedTeam: storeTeam } = useTeams();
  const storeSlug = useTeamSlug();

  const resolvedTeamId = propTeamId || storeTeam?.id || teams?.[0]?.id || null;
  const resolvedTeamSlug = storeSlug || storeTeam?.slug || teams?.[0]?.slug || null;

  // ── State ───────────────────────────────────────────────────
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [visibility, setVisibility] = useState<'PERSONAL' | 'TEAM' | 'PASSWORD_PROTECTED'>('PERSONAL');
  const [password, setPassword] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [assignToUsers, setAssignToUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [step, setStep] = useState<'select-file' | 'confirm'>('select-file');
  const [showTeamSelector, setShowTeamSelector] = useState(false);

  const isMemberSpecific = assignMode === 'member-specific' && !!selectedMember;
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch team members if not provided ─────────────────────
  const { data: fetchedMembers } = useQuery({
    queryKey: ['team-members', resolvedTeamSlug],
    queryFn: async () => {
      if (!resolvedTeamSlug) return [];
      const res = await fetch(`/api/teams/${resolvedTeamSlug}/members-for-selection`);
      if (!res.ok) throw new Error('Failed to fetch members');
      const data = await res.json();
      return data.members || data.data?.members || [];
    },
    enabled: open && !propMembers && !!resolvedTeamSlug,
  });

  const members = propMembers || fetchedMembers || EMPTY_MEMBERS;
  const availableMembers = members.filter((m) => m.userId !== currentUserId);

  // ── Fetch folders ──────────────────────────────────────────
  const { data: foldersData } = useQuery({
    queryKey: ['folders', resolvedTeamId],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(resolvedTeamId && { teamId: resolvedTeamId }),
      });
      const res = await fetch(`/api/files/folders?${params}`);
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    },
    enabled: open && !!resolvedTeamId,
  });

  // ── Upload mutation ─────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();

      uploadFiles.forEach((f) => formData.append('files', f.file));

      formData.append('visibility', visibility);
      if (resolvedTeamId) formData.append('teamId', resolvedTeamId);
      if (selectedFolder) formData.append('folderId', selectedFolder);
      if (visibility === 'PASSWORD_PROTECTED' && password) {
        formData.append('password', password);
      }

      // Member-specific auto-assign
      if (isMemberSpecific && selectedMember) {
        const targetId = selectedMember.userId ?? selectedMember.user?.id;
        if (targetId) {
          formData.append('assignTo', JSON.stringify([targetId]));
        }
      } else if (assignToUsers.length > 0) {
        formData.append('assignTo', JSON.stringify(assignToUsers));
      }

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success(
        isMemberSpecific && selectedMember
          ? `File uploaded & assigned to ${selectedMember.user.name}`
          : 'Files uploaded successfully',
        {
          position: 'bottom-center',
          style: {
            background: '#191919',
            border: '1px solid #303030',
            color: '#fff',
          },
        }
      );
      setIsUploading(false);
      setGlobalProgress(100);
      setTimeout(() => {
        setGlobalProgress(0);
        handleClose();
      }, 1000);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Upload failed', {
        position: 'bottom-center',
        style: {
          background: '#191919',
          border: '1px solid #303030',
          color: '#fff',
        },
      });
      setIsUploading(false);
      setGlobalProgress(0);
    },
    onSettled: () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    },
  });

  // ── Dropzone ────────────────────────────────────────────────
  const simulateUpload = (index: number) => {
    const interval = setInterval(() => {
      setUploadFiles((prev) => {
        const updated = [...prev];
        if (updated[index] && updated[index].progress < 100) {
          updated[index].progress += Math.random() * 20;
          if (updated[index].progress >= 100) {
            updated[index].progress = 100;
            updated[index].status = 'completed';
            clearInterval(interval);
          }
        }
        return updated;
      });
    }, 300);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        id: generateId(),
        file,
        progress: 0,
        status: 'uploading' as const,
      }));
      setUploadFiles((prev) => {
        newFiles.forEach((_, i) => simulateUpload(prev.length + i));
        return [...prev, ...newFiles];
      });
      setStep('confirm');
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024,
  });

  // ── Handlers ────────────────────────────────────────────────
  const handleClose = () => {
    if (isUploading) return;
    setUploadFiles([]);
    setPassword('');
    setAssignToUsers([]);
    setVisibility('PERSONAL');
    setSelectedFolder(null);
    setGlobalProgress(0);
    setStep('select-file');
    setShowTeamSelector(false);
    onClose();
  };

  const handleUpload = () => {
    setIsUploading(true);
    progressIntervalRef.current = setInterval(() => {
      setGlobalProgress((prev) => {
        if (prev >= 90) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
    uploadMutation.mutate();
  };

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
    if (uploadFiles.length <= 1) setStep('select-file');
  };

  // ── Cleanup ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // ── Render ──────────────────────────────────────────────────

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <>
        <div className="!border-0 !shadow-none">
         

          <div className="!bg-transparent !border-0 !shadow-none !h-full !w-full !px-0 !py-0">
            {/* ── Member chip (member-specific mode) ── */}
            {isMemberSpecific && selectedMember && (
              <div className="flex items-center gap-2.5 px-4 pt-4 pb-1">
                <Avatar className="size-8 border border-white/10 flex-shrink-0">
                  <AvatarImage src={selectedMember.user.image} />
                  <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {selectedMember.user.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {selectedMember.user.name}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {selectedMember.user.email}
                  </p>
                </div>
                <span className="ml-auto text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Auto-assign
                </span>
              </div>
            )}

            {/* ── Tab bar (hidden in member-specific mode) ── */}
            {/* {!isMemberSpecific && (
              <TabsList className="flex w-[50%] !bg-transparent">
                <TabsTrigger
                  value="upload"
                  className="rounded-lg data-[state=active]:bg-[#992626] data-[state=active]:text-white text-white/50 text-sm"
                >
                  Upload
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 text-sm"
                >
                  Settings
                </TabsTrigger>
                <TabsTrigger
                  value="assign"
                  disabled={!resolvedTeamId}
                  className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 text-sm disabled:opacity-30"
                >
                  Assign
                </TabsTrigger>
              </TabsList>
            )} */}

            <div className="bg-black/30 mt-10 rounded-3xl border border-white/20 p-8 relative w-[24rem]">
              <div className="relative bg-gradient-to-b from-[#1a1a2e]/90 to-[#0f0f1a]/95 backdrop-blur-xl border border-white/10 rounded-[1rem] p-1 -mt-10 shadow-2xl overflow-hidden">

                {/* ═══════════════════════════════════════════════════════
                    STEP 1: SELECT FILES (Dropzone)
                ═══════════════════════════════════════════════════════ */}
                {step === 'select-file' && (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Cloud className="w-9 h-9 text-white/25 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-white mb-1">
                      {isDragActive ? 'Drop files here' : 'Drag & drop files'}
                    </h3>
                    <p className="text-xs text-white/35">
                      or click to browse · max 50MB
                    </p>
                    {isMemberSpecific && selectedMember && (
                      <p className="text-[11px] text-purple-400 mt-2.5">
                        Will be assigned to {selectedMember.user.name}
                      </p>
                    )}
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    STEP 2: CONFIRM (File card + settings + upload)
                ═══════════════════════════════════════════════════════ */}
                {step === 'confirm' && uploadFiles.length > 0 && (
                  <div className="space-y-3 p-1">
                    {/* ── Main File Card ── */}
                    <div className="relative bg-gradient-to-b from-[#252538] to-[#1a1a2e] rounded-2xl p-4 border border-white/10 shadow-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />

                      {/* File info row */}
                      <div className="relative flex items-start gap-3 mb-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-14 bg-gradient-to-br from-[#3a3a5c] to-[#2a2a40] rounded-lg flex items-center justify-center shadow-lg border border-white/5">
                            {getFileIcon(uploadFiles[0].file.type, uploadFiles[0].file.name)}
                          </div>
                          <div className="absolute -bottom-1 -left-1 px-1.5 py-0.5 bg-[#1a1a2e] border border-white/20 rounded text-[9px] font-medium text-white/80 tracking-wider">
                            {getFileExtension(uploadFiles[0].file.name)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h3 className="text-white font-medium text-sm truncate pr-5">
                            {uploadFiles[0].file.name}
                          </h3>
                          <p className="text-white/40 text-xs mt-0.5">
                            {formatFileSize(uploadFiles[0].file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(uploadFiles[0].id)}
                          className="absolute top-0 right-0 size-5 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <X className="w-2.5 h-2.5 text-white/50" />
                        </button>
                      </div>

                      {/* ── Visibility Pills ── */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
                            Visibility
                          </span>
                          <VisibilityPills
                            visibility={visibility}
                            setVisibility={setVisibility}
                            teamId={resolvedTeamId}
                          />
                        </div>

                        {visibility === 'PASSWORD_PROTECTED' && (
                          <Input
                            type="password"
                            placeholder="Set password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/5 border-white/10 text-white text-xs rounded-lg focus:border-purple-500/50 h-7"
                          />
                        )}

                        {/* ── Progress Bar ── */}
                        <div className="bg-[#0f0f1a]/80 rounded-xl p-2.5 border border-white/5">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Loader2
                                className={`size-3 text-purple-400 ${
                                  isUploading ? 'animate-spin' : ''
                                }`}
                              />
                              <span className="text-xs text-white/70">
                                {isUploading ? 'Uploading…' : 'Ready'}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-white">
                              {Math.round(uploadFiles[0].progress)}%
                            </span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                              style={{ width: `${uploadFiles[0].progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Extra Files Carousel ── */}
                    {uploadFiles.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {uploadFiles.slice(1).map((f) => (
                          <div
                            key={f.id}
                            className="flex-shrink-0 w-28 bg-white/5 border border-white/10 rounded-xl p-2.5 relative group"
                          >
                            <button
                              type="button"
                              onClick={() => removeFile(f.id)}
                              className="absolute top-1 right-1 size-4 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5 text-white/70" />
                            </button>
                            <p className="text-[10px] text-white/70 truncate">
                              {f.file.name}
                            </p>
                            <p className="text-[9px] text-white/40">
                              {formatFileSize(f.file.size)}
                            </p>
                            <div className="mt-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-400/60 rounded-full"
                                style={{ width: `${f.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Team Selector (if no team resolved) ── */}
                    {!resolvedTeamId && teams && teams.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
                          Select Team
                        </span>
                        <Select
                          value={resolvedTeamId || ''}
                          onValueChange={(val) => {
                            const team = teams.find((t) => t.id === val);
                            if (team) {
                              useTeamStore.getState().setSelectedTeam(team);
                            }
                          }}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs rounded-lg h-8">
                            <SelectValue placeholder="Choose a team" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a2e] border-white/10 rounded-xl">
                            {teams.map((team) => (
                              <SelectItem
                                key={team.id}
                                value={team.id}
                                className="text-white focus:bg-white/10 text-xs"
                              >
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* ── Assign Members (inline, from code 1) ── */}
                    {resolvedTeamId && availableMembers.length > 0 && !isMemberSpecific && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
                          Assign to Members
                        </span>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                          {availableMembers.map((m) => (
                            <button
                              key={m.userId}
                              type="button"
                              onClick={() => {
                                setAssignToUsers((prev) =>
                                  prev.includes(m.userId)
                                    ? prev.filter((id) => id !== m.userId)
                                    : [...prev, m.userId]
                                );
                              }}
                              className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium transition-all border ${
                                assignToUsers.includes(m.userId)
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                  : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <Avatar className="size-4 rounded-full">
                                <AvatarImage src={m.user.image} />
                                <AvatarFallback className="text-[8px] bg-white/10">
                                  {m.user.name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              {m.user.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Folder Selector (inline) ── */}
                    {foldersData?.folders?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
                          Folder
                        </span>
                        <Select
                          value={selectedFolder || 'root'}
                          onValueChange={setSelectedFolder}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs rounded-lg h-8">
                            <SelectValue placeholder="Select folder" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a2e] border-white/10 rounded-xl">
                            <SelectItem
                              value="root"
                              className="text-white focus:bg-white/10 text-xs"
                            >
                              Root (No folder)
                            </SelectItem>
                            {foldersData.folders.map((folder: any) => (
                              <SelectItem
                                key={folder.id}
                                value={folder.id}
                                className="text-white focus:bg-white/10 text-xs"
                              >
                                <div className="flex items-center">
                                  <Folder className="size-3 mr-1.5 text-white/50" />
                                  {folder.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* ── CTA Button ── */}
                    <Button
                      type="button"
                      onClick={handleUpload}
                      disabled={isUploading || uploadFiles.length === 0}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Uploading
                          {isMemberSpecific && selectedMember
                            ? ` & Assigning to ${selectedMember.user.name}…`
                            : '…'}
                        </>
                      ) : (
                        <>
                          <Upload className="size-4 mr-2" />
                          Upload
                          {isMemberSpecific && selectedMember
                            ? ` & Assign to ${selectedMember.user.name}`
                            : assignToUsers.length > 0
                            ? ` & Assign to ${assignToUsers.length} member${
                                assignToUsers.length > 1 ? 's' : ''
                              }`
                            : ` ${uploadFiles.length} file${
                                uploadFiles.length > 1 ? 's' : ''
                              }`}
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setUploadFiles([]);
                        setStep('select-file');
                      }}
                      className="w-full py-1.5 text-gray-500 hover:text-white text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <ChevronLeft className="size-3" /> Choose different file
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>

      {/* ── Global Progress Toast ── */}
      {isUploading && (
        <div className="fixed bottom-6 left-6 z-50">
          <div className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[280px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                <Cloud className="size-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {isMemberSpecific && selectedMember
                    ? `Assigning to ${selectedMember.user.name}…`
                    : 'Uploading files…'}
                </p>
                <p className="text-xs text-white/50">
                  {uploadFiles.length} file{uploadFiles.length !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="text-lg font-semibold text-white">
                {Math.round(globalProgress)}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </Tabs>
  );
}