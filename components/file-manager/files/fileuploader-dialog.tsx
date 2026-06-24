
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Cloud, 
  X, 
  Lock, 
  Users, 
  EyeOff,
  Folder,

} from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle , ModalBody } from '@/components/ui/animated-modal';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UploadFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

interface EnhancedFileUploaderProps {
  open: boolean;
  onClose: () => void;
  teamId?: string | null;
  members?: any[];
  currentUserId?: string | null;
}

export function EnhancedFileUploader({ open, onClose, teamId, members = [], currentUserId }: EnhancedFileUploaderProps) {
  const queryClient = useQueryClient();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [visibility, setVisibility] = useState<'PERSONAL' | 'TEAM' | 'PASSWORD_PROTECTED'>('PERSONAL');
  const [password, setPassword] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [assignToUsers, setAssignToUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('upload');

  // Fetch folders
  const { data: foldersData } = useQuery({
    queryKey: ['folders', teamId],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(teamId && { teamId }),
      });
      const res = await fetch(`/api/files/folders?${params}`);
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    },
    enabled: open,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();

      uploadFiles.forEach((uploadFile) => {
        formData.append('files', uploadFile.file);
      });

      formData.append('visibility', visibility);
      if (teamId) formData.append('teamId', teamId);
      if (selectedFolder) formData.append('folderId', selectedFolder);
      if (visibility === 'PASSWORD_PROTECTED' && password) {
        formData.append('password', password);
      }
      if (assignToUsers.length > 0) {
        formData.append('assignTo', JSON.stringify(assignToUsers));
      }

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Upload failed');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Files uploaded successfully');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Upload failed');
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));
    setUploadFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach((_, index) => {
      simulateUpload(uploadFiles.length + index);
    });
  }, [uploadFiles.length]);

  const simulateUpload = (index: number) => {
    const interval = setInterval(() => {
      setUploadFiles(prev => {
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 25 * 1024 * 1024,
  });

  const handleClose = () => {
    setUploadFiles([]);
    setPassword('');
    setAssignToUsers([]);
    setVisibility('PERSONAL');
    setSelectedFolder(null);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allCompleted = uploadFiles.length > 0 && uploadFiles.every(f => f.status === 'completed');

  // Filter members to exclude current user
  const availableMembers = members.filter(m => m.userId !== currentUserId);

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalBody>
      <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>Upload Files {teamId && '- Team'}</ModalTitle>
        </ModalHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="assign" disabled={!teamId}>
              Assign
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="gap-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
            >
              <input {...getInputProps()} />
              <Cloud className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse (max 50MB per file)
              </p>
              <Button type="button" variant="outline">
                Browse Files
              </Button>
            </div>

            {uploadFiles.length > 0 && (
              <div className="gap-y-3 max-h-64 overflow-y-auto">
                {uploadFiles.map((uploadFile, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">
                          {uploadFile.file.name}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(uploadFile.file.size)}
                        </span>
                      </div>
                      {uploadFile.status === 'uploading' && (
                        <div className="gap-y-1">
                          <Progress value={uploadFile.progress} className="h-1" />
                          <p className="text-xs text-muted-foreground">
                            {Math.round(uploadFile.progress)}%
                          </p>
                        </div>
                      )}
                      {uploadFile.status === 'completed' && (
                        <p className="text-xs text-green-600">Ready to upload</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== index))}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="gap-y-4">
            <div className="gap-y-2">
              <Label>Visibility</Label>
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    visibility === 'PERSONAL' ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setVisibility('PERSONAL')}
                >
                  <EyeOff className="size-5 mb-2" />
                  <p className="font-medium text-sm">Personal</p>
                  <p className="text-xs text-muted-foreground">Only you can see</p>
                </div>

                {teamId && (
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      visibility === 'TEAM' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setVisibility('TEAM')}
                  >
                    <Users className="size-5 mb-2" />
                    <p className="font-medium text-sm">Team</p>
                    <p className="text-xs text-muted-foreground">Team members can view</p>
                  </div>
                )}

                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    visibility === 'PASSWORD_PROTECTED' ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setVisibility('PASSWORD_PROTECTED')}
                >
                  <Lock className="size-5 mb-2" />
                  <p className="font-medium text-sm">Protected</p>
                  <p className="text-xs text-muted-foreground">Password required</p>
                </div>
              </div>
            </div>

            {visibility === 'PASSWORD_PROTECTED' && (
              <div className="gap-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Set a password for this file"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <div className="gap-y-2">
              <Label>Destination Folder</Label>
              <Select value={selectedFolder || 'root'} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Root (No folder)</SelectItem>
                  {foldersData?.folders.map((folder: any) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center">
                        <Folder className="size-4 mr-2" />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="assign" className="gap-y-4">
            {!teamId ? (
              <p className="text-center text-muted-foreground py-4">
                Select a team first to assign files to members
              </p>
            ) : availableMembers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No other team members available
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Select team members to assign this file to
                </p>
                <div className="gap-y-2 max-h-64 overflow-y-auto">
                  {availableMembers.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => {
                        if (assignToUsers.includes(member.userId)) {
                          setAssignToUsers(prev => prev.filter(id => id !== member.userId));
                        } else {
                          setAssignToUsers(prev => [...prev, member.userId]);
                        }
                      }}
                    >
                      <Checkbox checked={assignToUsers.includes(member.userId)} />
                      <Avatar className="size-8">
                        <AvatarImage src={member.user.image} />
                        <AvatarFallback>{member.user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.user.name}</p>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => uploadMutation.mutate()}
            disabled={uploadFiles.length === 0 || !allCompleted || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading...' : `Upload ${uploadFiles.length} file${uploadFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </ModalContent>
      </ModalBody>
    </Modal>
  );
}

// 'use client';

// import { useState, useCallback } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import {
//   Cloud,
//   X,
//   Lock,
//   Users,
//   EyeOff,
//   Folder,
//   FileText,
//   Loader2,
//   Upload
// } from 'lucide-react';
// import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from '@/components/ui/animated-modal';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { toast } from 'sonner';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';

// interface UploadFile {
//   file: File;
//   progress: number;
//   status: 'uploading' | 'completed' | 'error';
// }

// interface EnhancedFileUploaderProps {
//   open: boolean;
//   onClose: () => void;
//   teamId?: string | null;
//   members?: any[];
//   currentUserId?: string | null;
// }

// const EMPTY_MEMBERS: any[] = [];

// export function EnhancedFileUploader({ open, onClose, teamId, members = EMPTY_MEMBERS, currentUserId }: EnhancedFileUploaderProps) {
//   const queryClient = useQueryClient();
//   const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
//   const [visibility, setVisibility] = useState<'PERSONAL' | 'TEAM' | 'PASSWORD_PROTECTED'>('PERSONAL');
//   const [password, setPassword] = useState('');
//   const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
//   const [assignToUsers, setAssignToUsers] = useState<string[]>([]);
//   const [activeTab, setActiveTab] = useState('upload');
//   const [isUploading, setIsUploading] = useState(false);
//   const [globalProgress, setGlobalProgress] = useState(0);

//   // Fetch folders
//   const { data: foldersData } = useQuery({
//     queryKey: ['folders', teamId],
//     queryFn: async () => {
//       const params = new URLSearchParams({
//         ...(teamId && { teamId }),
//       });
//       const res = await fetch(`/api/files/folders?${params}`);
//       if (!res.ok) throw new Error('Failed to fetch folders');
//       return res.json();
//     },
//     enabled: open,
//   });

//   const uploadMutation = useMutation({
//     mutationFn: async () => {
//       const formData = new FormData();

//       uploadFiles.forEach((uploadFile) => {
//         formData.append('files', uploadFile.file);
//       });

//       formData.append('visibility', visibility);
//       if (teamId) formData.append('teamId', teamId);
//       if (selectedFolder) formData.append('folderId', selectedFolder);
//       if (visibility === 'PASSWORD_PROTECTED' && password) {
//         formData.append('password', password);
//       }
//       if (assignToUsers.length > 0) {
//         formData.append('assignTo', JSON.stringify(assignToUsers));
//       }

//       const res = await fetch('/api/files/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Upload failed');
//       }

//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['files'] });
//       toast.success('Files uploaded successfully', {
//         position: 'bottom-center',
//         style: {
//           background: '#191919',
//           border: '1px solid #303030',
//           color: '#fff'
//         }
//       });
//       setIsUploading(false);
//       setGlobalProgress(100);
//       setTimeout(() => {
//         setGlobalProgress(0);
//         handleClose();
//       }, 1000);
//     },
//     onError: (error: any) => {
//       toast.error(error.message || 'Upload failed', {
//         position: 'bottom-center',
//         style: {
//           background: '#191919',
//           border: '1px solid #303030',
//           color: '#fff'
//         }
//       });
//       setIsUploading(false);
//       setGlobalProgress(0);
//     },
//   });

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     const newFiles = acceptedFiles.map(file => ({
//       file,
//       progress: 0,
//       status: 'uploading' as const,
//     }));
//     setUploadFiles(prev => [...prev, ...newFiles]);

//     newFiles.forEach((_, index) => {
//       simulateUpload(uploadFiles.length + index);
//     });
//   }, [uploadFiles.length]);

//   const simulateUpload = (index: number) => {
//     const interval = setInterval(() => {
//       setUploadFiles(prev => {
//         const updated = [...prev];
//         if (updated[index] && updated[index].progress < 100) {
//           updated[index].progress += Math.random() * 20;
//           if (updated[index].progress >= 100) {
//             updated[index].progress = 100;
//             updated[index].status = 'completed';
//             clearInterval(interval);
//           }
//         }
//         return updated;
//       });
//     }, 300);
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     multiple: true,
//     maxSize: 50 * 1024 * 1024,
//   });

//   const handleClose = () => {
//     if (!isUploading) {
//       setUploadFiles([]);
//       setPassword('');
//       setAssignToUsers([]);
//       setVisibility('PERSONAL');
//       setSelectedFolder(null);
//       setGlobalProgress(0);
//       onClose();
//     }
//   };

//   const handleUpload = () => {
//     setIsUploading(true);
//     const progressInterval = setInterval(() => {
//       setGlobalProgress(prev => {
//         if (prev >= 90) {
//           clearInterval(progressInterval);
//           return prev;
//         }
//         return prev + Math.random() * 15;
//       });
//     }, 500);

//     uploadMutation.mutate();
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const getFileExtension = (filename: string) => {
//     return filename.split('.').pop()?.toUpperCase() || 'FILE';
//   };

//   const allCompleted = uploadFiles.length > 0 && uploadFiles.every(f => f.status === 'completed');
//   const availableMembers = members.filter(m => m.userId !== currentUserId);

//   return (
//     <Tabs value={activeTab} onValueChange={setActiveTab}>
//       <Modal open={open} onOpenChange={handleClose}>
//         <ModalBody className=" !border-0 !shadow-none !min-w-[35%] !w-[35%] !h-[64vh] ">
//           <img className="absolute opacity-50 -bottom-0 w-full left-1/2 -translate-x-1/2 h-auto pointer-events-none" src="https://res.cloudinary.com/kanishkkcloud18/image/upload/v1775306460/ruixen_moon_muce3s.png" alt="" />

//           <ModalContent className="!bg-transparent !border-0 !shadow-none !h-full !w-full !px-0 !py-0">
//             <TabsList className="flex w-[50%] !bg-transparent">
//               <TabsTrigger
//                 value="upload"
//                 className="rounded-lg data-[state=active]:bg-[#992626] data-[state=active]:text-white text-white/50 text-sm"
//               >
//                 Upload
//               </TabsTrigger>
//               <TabsTrigger
//                 value="settings"
//                 className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 text-sm"
//               >
//                 Settings
//               </TabsTrigger>
//               <TabsTrigger
//                 value="assign"
//                 disabled={!teamId}
//                 className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 text-sm disabled:opacity-30"
//               >
//                 Assign
//               </TabsTrigger>
//             </TabsList>

//             <div className="relative w-full max-w-[22rem] mx-auto my-auto ">
//               <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-purple-600/30 blur-3xl rounded-full pointer-events-none" />
//               <div className="relative bg-gradient-to-b from-[#1a1a2e]/90 to-[#0f0f1a]/95 backdrop-blur-xl border border-white/10 rounded-[1rem] p-1 -mt-10 shadow-2xl overflow-hidden">
//                 <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />

//                 {/* <button 
//                   onClick={handleClose}
//                   disabled={isUploading}
//                   className="absolute top-4 right-4 z-20 size-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors disabled:opacity-50"
//                 >
//                   <X className="size-4text-white/70" />
//                 </button> */}

//                 {/* <ModalHeader className="mb-6">
//                   <ModalTitle className="text-xl font-semibold text-white">Upload Files</ModalTitle>
//                 </ModalHeader> */}

//                 <>


//                   <TabsContent value="upload" className="gap-y-4 mt-0">
//                     {uploadFiles.length === 0 ? (
//                       <div
//                         {...getRootProps()}
//                         className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
//                           }`}
//                       >
//                         <input {...getInputProps()} />
//                         <Cloud className="size-10 text-white/30 mx-auto mb-3" />
//                         <h3 className="text-sm font-medium text-white mb-1">
//                           {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
//                         </h3>
//                         <p className="text-xs text-white/40">or click to browse (max 50MB)</p>
//                       </div>
//                     ) : (
//                       <div className="gap-y-4">
//                         {/* Main File Card - Exact Design from Image */}
//                         <div className="relative bg-gradient-to-b from-[#252538] to-[#1a1a2e] rounded-2xl p-5 border border-white/10 shadow-xl overflow-hidden">
//                           <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />

//                           <div className="relative flex items-start gap-4 mb-6">
//                             <div className="relative flex-shrink-0">
//                               <div className="w-14 h-16 bg-gradient-to-br from-[#3a3a5c] to-[#2a2a40] rounded-lg flex items-center justify-center shadow-lg border border-white/5">
//                                 <FileText className="size-8 text-white/60" />
//                               </div>
//                               <div className="absolute -bottom-1 -left-1 px-2 py-0.5 bg-[#1a1a2e] border border-white/20 rounded text-[10px] font-medium text-white/80 tracking-wider">
//                                 {getFileExtension(uploadFiles[0].file.name)}
//                               </div>
//                             </div>

//                             <div className="flex-1 min-w-0 pt-1">
//                               <h3 className="text-white font-medium text-base truncate pr-6">
//                                 {uploadFiles[0].file.name}
//                               </h3>
//                               <p className="text-white/40 text-sm mt-0.5">
//                                 {formatFileSize(uploadFiles[0].file.size)}
//                               </p>
//                             </div>

//                             <button type="button"
//                               onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== 0))}
//                               className="absolute top-0 right-0 size-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
//                             >
//                               <X className="size-3 text-white/50" />
//                             </button>
//                           </div>

//                           {/* Progress Section - Exact from Image */}
//                           <div className="relative bg-[#0f0f1a]/80 rounded-xl p-3 border border-white/5">
//                             <div className="flex items-center justify-between mb-2">
//                               <div className="flex items-center gap-2">
//                                 <Loader2 className="size-4text-purple-400 animate-spin" />
//                                 <span className="text-sm text-white/80">Uploading&hellip;</span>
//                               </div>
//                               <span className="text-sm font-medium text-white">
//                                 {Math.round(uploadFiles[0].progress)}%
//                               </span>
//                             </div>

//                             <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
//                               <div
//                                 className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
//                                 style={{ width: `${uploadFiles[0].progress}%` }}
//                               />
//                             </div>
//                           </div>
//                         </div>

//                         {/* Additional Files Carousel */}
//                         {uploadFiles.length > 1 && (
//                           <div className="gap-y-2">
//                             <p className="text-xs text-white/40 px-1">Additional files ({uploadFiles.length - 1})</p>
//                             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//                               {uploadFiles.slice(1).map((uploadFile) => (
//                                 <div
//                                   key={uploadFile.id} 
//                                   className="flex-shrink-0 w-32 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/[0.07] transition-colors relative group"
//                                 >
//                                   <button type="button" 
//                                     onClick={() => setUploadFiles(prev => prev.filter((up) => up.id !== uploadFile.id))}
//                                     className="absolute top-1 right-1 size-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//                                   >
//                                     <X className="size-3 text-white/70" />
//                                   </button>

//                                   <div className="flex items-center gap-2 mb-0">
//                                     {/* <div className="size-8 bg-gradient-to-br from-[#3a3a5c] to-[#2a2a40] rounded flex items-center justify-center">
//                                       <FileText className="size-4text-white/50" />
//                                     </div>
//                                     <span className="text-[10px] font-medium text-white/60 bg-white/10 px-1.5 py-0.5 rounded">
//                                       {getFileExtension(uploadFile.file.name)}
//                                     </span> */}
//                                   </div>
//                                   <p className="text-xs text-white/70 truncate">{uploadFile.file.name}</p>
//                                   <p className="text-[10px] text-white/40">{formatFileSize(uploadFile.file.size)}</p>

//                                   <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
//                                     <div
//                                       className="h-full bg-purple-400/60 rounded-full transition-all"
//                                       style={{ width: `${uploadFile.progress}%` }}
//                                     />
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}

//                         {/* <div
//                           {...getRootProps()}
//                           className="border border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:bg-white/[0.03] transition-colors"
//                         >
//                           <input {...getInputProps()} />
//                           <p className="text-sm text-white/50">+ Add more files</p>
//                         </div> */}

//                         <div className="mt-4">
//                           <Button type="button" 
//                             onClick={handleUpload}
//                             disabled={isUploading || uploadFiles.length === 0}
//                             className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
//                           >
//                             {isUploading ? (
//                               <>
//                                 <Loader2 className="size-5 mr-2 animate-spin" />
//                                 Uploading {uploadFiles.length} file{uploadFiles.length > 1 ? 's' : ''}&hellip;
//                               </>
//                             ) : (
//                               <>
//                                 <Upload className="size-5 mr-2" />
//                                 Start Upload
//                               </>
//                             )}
//                           </Button>
//                         </div>
//                       </div>
//                     )}
//                   </TabsContent>

//                   <TabsContent value="settings" className="gap-y-4 mt-0 px-2">
//                     <div className="gap-y-3">
//                       <Label className="text-white/70 text-sm">Visibility</Label>
//                       <div className="grid grid-cols-3 gap-3">
//                         <div
//                           className={`border rounded-xl p-3 cursor-pointer transition-all ${visibility === 'PERSONAL' ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
//                             }`}
//                           onClick={() => setVisibility('PERSONAL')}
//                         >
//                           <EyeOff className="size-4mb-2 text-white/70" />
//                           <p className="font-medium text-sm text-white">Personal</p>
//                           <p className="text-[10px] text-white/40">Only you</p>
//                         </div>

//                         {teamId && (
//                           <div
//                             className={`border rounded-xl p-3 cursor-pointer transition-all ${visibility === 'TEAM' ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
//                               }`}
//                             onClick={() => setVisibility('TEAM')}
//                           >
//                             <Users className="size-4mb-2 text-white/70" />
//                             <p className="font-medium text-sm text-white">Team</p>
//                             <p className="text-[10px] text-white/40">Members</p>
//                           </div>
//                         )}

//                         <div
//                           className={`border rounded-xl p-3 cursor-pointer transition-all ${visibility === 'PASSWORD_PROTECTED' ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
//                             }`}
//                           onClick={() => setVisibility('PASSWORD_PROTECTED')}
//                         >
//                           <Lock className="size-4mb-2 text-white/70" />
//                           <p className="font-medium text-sm text-white">Protected</p>
//                           <p className="text-[10px] text-white/40">Password</p>
//                         </div>
//                       </div>
//                     </div>

//                     {visibility === 'PASSWORD_PROTECTED' && (
//                       <div className="gap-y-2">
//                         <Label htmlFor="password" className="text-white/70 text-sm">Password</Label>
//                         <Input
//                           id="password"
//                           type="password"
//                           placeholder="Set a password"
//                           value={password}
//                           onChange={(e) => setPassword(e.target.value)}
//                           className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 rounded-xl"
//                         />
//                       </div>
//                     )}

//                     <div className="gap-y-2">
//                       <Label className="text-white/70 text-sm">Destination Folder</Label>
//                       <Select value={selectedFolder || 'root'} onValueChange={setSelectedFolder}>
//                         <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl focus:ring-purple-500/30">
//                           <SelectValue placeholder="Select folder" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-[#1a1a2e] border-white/10 rounded-xl">
//                           <SelectItem value="root" className="text-white focus:bg-white/10">Root (No folder)</SelectItem>
//                           {foldersData?.folders.map((folder: any) => (
//                             <SelectItem key={folder.id} value={folder.id} className="text-white focus:bg-white/10">
//                               <div className="flex items-center">
//                                 <Folder className="size-4mr-2 text-white/50" />
//                                 {folder.name}
//                               </div>
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </TabsContent>

//                   <TabsContent value="assign" className="gap-y-4 mt-0">
//                     {!teamId ? (
//                       <div className="text-center py-8 text-white/40">
//                         <Users className="size-8 mx-auto mb-2 opacity-50" />
//                         <p className="text-sm">Select a team first</p>
//                       </div>
//                     ) : availableMembers.length === 0 ? (
//                       <div className="text-center py-8 text-white/40">
//                         <p className="text-sm">No other members available</p>
//                       </div>
//                     ) : (
//                       <>
//                         <p className="text-sm text-white/50 mb-3">Assign to team members</p>
//                         <div className="gap-y-2 max-h-48 overflow-y-auto pr-1">
//                           {availableMembers.map((member) => (
//                             <div
//                               key={member.userId}
//                               className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${assignToUsers.includes(member.userId)
//                                 ? 'border-purple-500/50 bg-purple-500/10'
//                                 : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
//                                 }`}
//                               onClick={() => {
//                                 if (assignToUsers.includes(member.userId)) {
//                                   setAssignToUsers(prev => prev.filter(id => id !== member.userId));
//                                 } else {
//                                   setAssignToUsers(prev => [...prev, member.userId]);
//                                 }
//                               }}
//                             >
//                               <Checkbox
//                                 checked={assignToUsers.includes(member.userId)}
//                                 className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
//                               />
//                               <Avatar className="size-8 border border-white/10">
//                                 <AvatarImage src={member.user.image} />
//                                 <AvatarFallback className="bg-white/10 text-white text-xs">{member.user.name?.[0]}</AvatarFallback>
//                               </Avatar>
//                               <div className="flex-1 min-w-0">
//                                 <p className="font-medium text-sm text-white truncate">{member.user.name}</p>
//                                 <p className="text-xs text-white/40 truncate">{member.user.email}</p>
//                               </div>
//                               <Badge variant="outline" className="text-[10px] border-white/20 text-white/60">
//                                 {member.role}
//                               </Badge>
//                             </div>
//                           ))}
//                         </div>
//                       </>
//                     )}
//                   </TabsContent>
//                 </>

//                 {/* <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
//                   <button type="button"  
//                     variant="outline" 
//                     onClick={handleClose}
//                     disabled={isUploading}
//                     className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl"
//                   >
//                     Cancel
//                   </Button>
//                   <button type="button"  
//                     onClick={handleUpload }
//                     disabled={uploadFiles.length === 0 || !allCompleted || uploadMutation.isPending}
//                     className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {uploadMutation.isPending ? (
//                       <span className="flex items-center gap-2">
//                         <Loader2 className="size-4animate-spin" />
//                         Uploading...
//                       </span>
//                     ) : (
//                       `Upload ${uploadFiles.length > 0 ? `(${uploadFiles.length})` : ''}`
//                     )}
//                   </Button>
//                 </div> */}
//               </div>
//             </div>
//           </ModalContent>
//         </ModalBody>
//       </Modal>

//       {/* Global Upload Progress - Bottom Left */}
//       {isUploading && (
//         <div className="fixed bottom-6 left-6 z-50">
//           <div className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[280px]">
//             <div className="flex items-center gap-3 mb-3">
//               <div className="size-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
//                 <Cloud className="size-5 text-purple-400" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-sm font-medium text-white">Uploading files&hellip;</p>
//                 <p className="text-xs text-white/50">{uploadFiles.length} file{uploadFiles.length !== 1 ? 's' : ''}</p>
//               </div>
//               <span className="text-lg font-semibold text-white">{Math.round(globalProgress)}%</span>
//             </div>

//             <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
//               <div
//                 className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
//                 style={{ width: `${globalProgress}%` }}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </Tabs>
//   );
// }
