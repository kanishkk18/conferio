'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Cloud, X, Lock, Users, EyeOff, Folder,
  FileText, Loader2, Upload, User, ChevronLeft,
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

interface UploadFile {
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

interface MemberFileAssignProps {
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

const VisibilityPills = ({ visibility, setVisibility, teamId }: VisibilityPillsProps) => (
  <div className="flex gap-1.5 flex-wrap">
    <button type="button"
      onClick={() => setVisibility('PERSONAL')}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${visibility === 'PERSONAL'
        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
        }`}
    >
      <EyeOff className="w-2.5 h-2.5" /> Personal
    </button>
    {teamId && (
      <button type="button"
        onClick={() => setVisibility('TEAM')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${visibility === 'TEAM'
          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
          }`}
      >
        <Users className="w-2.5 h-2.5" /> Team
      </button>
    )}
    <button type="button"
      onClick={() => setVisibility('PASSWORD_PROTECTED')}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${visibility === 'PASSWORD_PROTECTED'
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
        }`}
    >
      <Lock className="w-2.5 h-2.5" /> Protected
    </button>
  </div>
);

const EMPTY_MEMBERS: any[] = []


export function MemberFileAssign({
  open,
  onClose,
  teamId,
  members = EMPTY_MEMBERS,
  currentUserId,
  selectedMember,
  assignMode = 'general',
}: MemberFileAssignProps) {
  const queryClient = useQueryClient();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [visibility, setVisibility] = useState<'PERSONAL' | 'TEAM' | 'PASSWORD_PROTECTED'>('PERSONAL');
  const [password, setPassword] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [assignToUsers, setAssignToUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [step, setStep] = useState<'select-file' | 'confirm'>('select-file');

  const isMemberSpecific = assignMode === 'member-specific' && !!selectedMember;

  // ── Folders ─────────────────────────────────────────────────
  const { data: foldersData } = useQuery({
    queryKey: ['folders', teamId],
    queryFn: async () => {
      const params = new URLSearchParams({ ...(teamId && { teamId }) });
      const res = await fetch(`/api/files/folders?${params}`);
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    },
    enabled: open,
  });

  // ── Upload mutation ──────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      uploadFiles.forEach(f => formData.append('files', f.file));
      formData.append('visibility', visibility);
      if (teamId) formData.append('teamId', teamId);
      if (selectedFolder) formData.append('folderId', selectedFolder);
      if (visibility === 'PASSWORD_PROTECTED' && password) formData.append('password', password);

      if (isMemberSpecific && selectedMember) {
        const targetId = selectedMember.userId ?? selectedMember.user?.id;
        if (targetId) {
          formData.append('assignTo', JSON.stringify([targetId]));
        }
      } else if (assignToUsers.length > 0) {
        formData.append('assignTo', JSON.stringify(assignToUsers));
      }

      const res = await fetch('/api/files/member-assign-upload', { method: 'POST', body: formData });
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
        { position: 'bottom-center', style: { background: '#191919', border: '1px solid #303030', color: '#fff' } }
      );
      setIsUploading(false);
      setGlobalProgress(100);
      setTimeout(() => { setGlobalProgress(0); handleClose(); }, 1000);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Upload failed', {
        position: 'bottom-center',
        style: { background: '#191919', border: '1px solid #303030', color: '#fff' },
      });
      setIsUploading(false);
      setGlobalProgress(0);
    },
  });

  // ── Dropzone ─────────────────────────────────────────────────
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({ file, progress: 0, status: 'uploading' as const }));
    setUploadFiles(prev => {
      newFiles.forEach((_, i) => simulateUpload(prev.length + i));
      return [...prev, ...newFiles];
    });
    setStep('confirm');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: true, maxSize: 50 * 1024 * 1024,
  });

  // ── Helpers ──────────────────────────────────────────────────
  const handleClose = () => {
    if (isUploading) return;
    setUploadFiles([]);
    setPassword('');
    setAssignToUsers([]);
    setVisibility('PERSONAL');
    setSelectedFolder(null);
    setGlobalProgress(0);
    setStep('select-file');
    onClose();
  };

  const handleUpload = () => {
    setIsUploading(true);
    const interval = setInterval(() => {
      setGlobalProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return prev; }
        return prev + Math.random() * 15;
      });
    }, 500);
    uploadMutation.mutate();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string) => filename.split('.').pop()?.toUpperCase() || 'FILE';

  // Guard: members must be array for general mode
  const safeMembers = Array.isArray(members) ? members : [];
  const availableMembers = safeMembers.filter(m => m.userId !== currentUserId);



  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <Modal open={open} onOpenChange={handleClose}>
        <ModalBody className="!border-0 !shadow-none !min-w-[35%] !w-[35%] !h-[64vh]">
          <img
            className="absolute opacity-50 -bottom-0 w-full left-1/2 -translate-x-1/2 h-auto pointer-events-none"
            src="https://res.cloudinary.com/kanishkkcloud18/image/upload/v1775306460/ruixen_moon_muce3s.png"
            alt=""
          />

          <ModalContent className="!bg-transparent !border-0 !shadow-none !h-full !w-full !px-0 !py-0">

            {/* ── Member chip (member-specific mode) ── */}
            {isMemberSpecific && selectedMember && (
              <div className="flex items-center gap-2.5 px-4 pt-4 pb-1">
                <Avatar className=" size-8  border border-white/10 flex-shrink-0">
                  <AvatarImage src={selectedMember.user.image} />
                  <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {selectedMember.user.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{selectedMember.user.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{selectedMember.user.email}</p>
                </div>
                <span className="ml-auto text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Auto-assign
                </span>
              </div>
            )}

            {/* ── Tab bar (hidden in member-specific mode) ── */}
            {!isMemberSpecific && (
              <TabsList className="flex w-[50%] !bg-transparent">
                <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-[#992626] data-[state=active]:text-white text-white/50 text-sm">
                  Upload
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 text-sm">
                  Settings
                </TabsTrigger>
                <TabsTrigger value="assign" disabled={!teamId} className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 text-sm disabled:opacity-30">
                  Assign
                </TabsTrigger>
              </TabsList>
            )}

            <div className="relative w-full max-w-[22rem] mx-auto my-auto">
              <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-purple-600/30 blur-3xl rounded-full pointer-events-none" />
              <div className="relative bg-gradient-to-b from-[#1a1a2e]/90 to-[#0f0f1a]/95 backdrop-blur-xl border border-white/10 rounded-[1rem] p-1 -mt-10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />

                {/* ══════════════════════════════════════════════════════
                    MEMBER-SPECIFIC UPLOAD FLOW
                ══════════════════════════════════════════════════════ */}
                {isMemberSpecific ? (
                  <div className="space-y-3 p-1">

                    {/* Step 1 — Drop zone */}
                    {step === 'select-file' && (
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
                          }`}
                      >
                        <input {...getInputProps()} />
                        <Cloud className="w-9 h-9 text-white/25 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-white mb-1">
                          {isDragActive ? 'Drop files here' : 'Drag & drop files'}
                        </h3>
                        <p className="text-xs text-white/35">or click to browse · max 50MB</p>
                        <p className="text-[11px] text-purple-400 mt-2.5">
                          Will be assigned to {selectedMember!.user.name}
                        </p>
                      </div>
                    )}

                    {/* Step 2 — Confirm */}
                    {step === 'confirm' && uploadFiles.length > 0 && (
                      <div className="space-y-3">

                        {/* File card */}
                        <div className="relative bg-gradient-to-b from-[#252538] to-[#1a1a2e] rounded-2xl p-4 border border-white/10 shadow-xl overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />

                          {/* File info row */}
                          <div className="relative flex items-start gap-3 mb-4">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-14 bg-gradient-to-br from-[#3a3a5c] to-[#2a2a40] rounded-lg flex items-center justify-center shadow-lg border border-white/5">
                                <FileText className="size-6 text-white/60" />
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
                            <button type="button"
                              onClick={() => { setUploadFiles([]); setStep('select-file'); }}
                              className="absolute top-0 right-0  size-5 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                              <X className="w-2.5 h-2.5 text-white/50" />
                            </button>
                          </div>

                          {/* Compact visibility + progress */}
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Visibility</span>
                              <VisibilityPills visibility={visibility} setVisibility={setVisibility} teamId={teamId} />
                            </div>

                            {visibility === 'PASSWORD_PROTECTED' && (
                              <Input
                                type="password"
                                placeholder="Set password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="bg-white/5 border-white/10 text-white text-xs rounded-lg focus:border-purple-500/50 h-7"
                              />
                            )}

                            {/* Progress bar */}
                            <div className="bg-[#0f0f1a]/80 rounded-xl p-2.5 border border-white/5">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <Loader2 className={` size-3   text-purple-400 ${isUploading ? 'animate-spin' : ''}`} />
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

                        {/* Extra files */}
                        {uploadFiles.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {uploadFiles.slice(1).map((f) => (
                              <div key={f.id} className="flex-shrink-0 w-28 bg-white/5 border border-white/10 rounded-xl p-2.5 relative group">
                                <button type="button"
                                  onClick={() => setUploadFiles(prev => prev.filter((up) => up.id !== f.id))}
                                  className="absolute top-1 right-1  size-4  rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-2.5 h-2.5 text-white/70" />
                                </button>
                                <p className="text-[10px] text-white/70 truncate">{f.file.name}</p>
                                <p className="text-[9px] text-white/40">{formatFileSize(f.file.size)}</p>
                                <div className="mt-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-400/60 rounded-full" style={{ width: `${f.progress}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* CTA */}
                        <Button type="button"
                          onClick={handleUpload}
                          disabled={isUploading || uploadFiles.length === 0}
                          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {isUploading ? (
                            <><Loader2 className=" size-4  mr-2 animate-spin" />Uploading & Assigning…</>
                          ) : (
                            <><Upload className=" size-4  mr-2" />Upload & Assign to {selectedMember!.user.name}</>
                          )}
                        </Button>

                        <button type="button"
                          onClick={() => { setUploadFiles([]); setStep('select-file'); }}
                          className="w-full py-1.5 text-gray-500 hover:text-white text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <ChevronLeft className=" size-3  " /> Choose different file
                        </button>
                      </div>
                    )}
                  </div>

                ) : (
                  /* ══════════════════════════════════════════════════════
                      GENERAL UPLOAD FLOW (original tabs behaviour)
                  ══════════════════════════════════════════════════════ */
                  <>
                    {/* Upload tab */}
                    <TabsContent value="upload" className="space-y-4 mt-0">
                      {step === 'select-file' && (
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
                            }`}
                        >
                          <input {...getInputProps()} />
                          <Cloud className=" size-10  text-white/30 mx-auto mb-3" />
                          <h3 className="text-sm font-medium text-white mb-1">
                            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                          </h3>
                          <p className="text-xs text-white/40">or click to browse (max 50MB)</p>
                        </div>
                      )}

                      {step === 'confirm' && uploadFiles.length > 0 && (
                        <div className="space-y-4">
                          <div className="relative bg-gradient-to-b from-[#252538] to-[#1a1a2e] rounded-2xl p-5 border border-white/10 shadow-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />
                            <div className="relative flex items-start gap-4 mb-4">
                              <div className="relative flex-shrink-0">
                                <div className="w-14 h-16 bg-gradient-to-br from-[#3a3a5c] to-[#2a2a40] rounded-lg flex items-center justify-center shadow-lg border border-white/5">
                                  <FileText className=" size-7  text-white/60" />
                                </div>
                                <div className="absolute -bottom-1 -left-1 px-2 py-0.5 bg-[#1a1a2e] border border-white/20 rounded text-[10px] font-medium text-white/80 tracking-wider">
                                  {getFileExtension(uploadFiles[0].file.name)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 pt-1">
                                <h3 className="text-white font-medium text-base truncate pr-6">{uploadFiles[0].file.name}</h3>
                                <p className="text-white/40 text-sm mt-0.5">{formatFileSize(uploadFiles[0].file.size)}</p>
                              </div>
                              <button type="button" onClick={() => { setUploadFiles([]); setStep('select-file'); }} className="absolute top-0 right-0 size-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                <X className=" size-3   text-white/50" />
                              </button>
                            </div>

                            {/* Compact visibility */}
                            <div className="mb-3 space-y-1.5">
                              <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Visibility</span>
                              <VisibilityPills visibility={visibility} setVisibility={setVisibility} teamId={teamId} />
                              {visibility === 'PASSWORD_PROTECTED' && (
                                <Input type="password" placeholder="Set password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 bg-white/5 border-white/10 text-white text-xs rounded-lg focus:border-purple-500/50 h-7" />
                              )}
                            </div>

                            <div className="bg-[#0f0f1a]/80 rounded-xl p-3 border border-white/5">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Loader2 className={` size-4  text-purple-400 ${isUploading ? 'animate-spin' : ''}`} />
                                  <span className="text-sm text-white/80">{isUploading ? 'Uploading...' : 'Ready to upload'}</span>
                                </div>
                                <span className="text-sm font-medium text-white">{Math.round(uploadFiles[0].progress)}%</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: `${uploadFiles[0].progress}%` }} />
                              </div>
                            </div>
                          </div>

                          {uploadFiles.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                              {uploadFiles.slice(1).map((f, i) => (
                                <div key={f.id} className="flex-shrink-0 w-32 bg-white/5 border border-white/10 rounded-xl p-3 relative group">
                                  <button type="button" onClick={() => setUploadFiles(prev => prev.filter((up) => up.id !== f.id + 1))} className="absolute top-1 right-1  size-5  rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className=" size-3   text-white/70" />
                                  </button>
                                  <p className="text-xs text-white/70 truncate">{f.file.name}</p>
                                  <p className="text-[10px] text-white/40">{formatFileSize(f.file.size)}</p>
                                  <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-400/60 rounded-full transition-all" style={{ width: `${f.progress}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <Button type="button" onClick={handleUpload} disabled={isUploading || uploadFiles.length === 0} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed">
                            {isUploading ? <><Loader2 className=" size-5  mr-2 animate-spin" />Uploading&hellip;</> : <><Upload className=" size-5  mr-2" />Upload {uploadFiles.length} file{uploadFiles.length > 1 ? 's' : ''}</>}
                          </Button>
                          <button type="button" onClick={() => { setUploadFiles([]); setStep('select-file'); }} className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors flex items-center justify-center gap-1">
                            <ChevronLeft className=" size-4 " /> Choose different file
                          </button>
                        </div>
                      )}
                    </TabsContent>

                    {/* Settings tab */}
                    <TabsContent value="settings" className="space-y-4 mt-0 px-2">
                      <div className="space-y-3">
                        <Label className="text-white/70 text-sm">Visibility</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { key: 'PERSONAL', icon: <EyeOff className=" size-4  mb-2 text-white/70" />, label: 'Personal', sub: 'Only you', show: true },
                            { key: 'TEAM', icon: <Users className=" size-4  mb-2 text-white/70" />, label: 'Team', sub: 'Members', show: !!teamId },
                            { key: 'PASSWORD_PROTECTED', icon: <Lock className=" size-4  mb-2 text-white/70" />, label: 'Protected', sub: 'Password', show: true },
                          ].filter(v => v.show).map(v => (
                            <div key={v.key} onClick={() => setVisibility(v.key as any)} className={`border rounded-xl p-3 cursor-pointer transition-all ${visibility === v.key ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'}`}>
                              {v.icon}
                              <p className="font-medium text-sm text-white">{v.label}</p>
                              <p className="text-[10px] text-white/40">{v.sub}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {visibility === 'PASSWORD_PROTECTED' && (
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-white/70 text-sm">Password</Label>
                          <Input id="password" type="password" placeholder="Set a password" value={password} onChange={e => setPassword(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 rounded-xl" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm">Destination Folder</Label>
                        <Select value={selectedFolder || 'root'} onValueChange={setSelectedFolder}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl focus:ring-purple-500/30">
                            <SelectValue placeholder="Select folder" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a2e] border-white/10 rounded-xl">
                            <SelectItem value="root" className="text-white focus:bg-white/10">Root (No folder)</SelectItem>
                            {foldersData?.folders.map((folder: any) => (
                              <SelectItem key={folder.id} value={folder.id} className="text-white focus:bg-white/10">
                                <div className="flex items-center"><Folder className=" size-4  mr-2 text-white/50" />{folder.name}</div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>

                    {/* Assign tab */}
                    <TabsContent value="assign" className="space-y-4 mt-0">
                      {!teamId ? (
                        <div className="text-center py-8 text-white/40">
                          <Users className=" size-8  mx-auto mb-2 opacity-50" /><p className="text-sm">Select a team first</p>
                        </div>
                      ) : availableMembers.length === 0 ? (
                        <div className="text-center py-8 text-white/40"><p className="text-sm">No other members available</p></div>
                      ) : (
                        <>
                          <p className="text-sm text-white/50 mb-3">Assign to team members</p>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {availableMembers.map(m => (
                              <div key={m.userId} onClick={() => setAssignToUsers(prev => prev.includes(m.userId) ? prev.filter(id => id !== m.userId) : [...prev, m.userId])} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${assignToUsers.includes(m.userId) ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'}`}>
                                <Checkbox checked={assignToUsers.includes(m.userId)} className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500" />
                                <Avatar className=" size-8  border border-white/10"><AvatarImage src={m.user.image} /><AvatarFallback className="bg-white/10 text-white text-xs">{m.user.name?.[0]}</AvatarFallback></Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-white truncate">{m.user.name}</p>
                                  <p className="text-xs text-white/40 truncate">{m.user.email}</p>
                                </div>
                                <Badge variant="outline" className="text-[10px] border-white/20 text-white/60">{m.role}</Badge>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </TabsContent>
                  </>
                )}
              </div>
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>

      {/* ── Global progress toast ── */}
      {isUploading && (
        <div className="fixed bottom-6 left-6 z-50">
          <div className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[280px]">
            <div className="flex items-center gap-3 mb-3">
              <div className=" size-10  bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                <Cloud className=" size-5  text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {isMemberSpecific && selectedMember ? `Assigning to ${selectedMember.user.name}…` : 'Uploading files…'}
                </p>
                <p className="text-xs text-white/50">{uploadFiles.length} file{uploadFiles.length !== 1 ? 's' : ''}</p>
              </div>
              <span className="text-lg font-semibold text-white">{Math.round(globalProgress)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: `${globalProgress}%` }} />
            </div>
          </div>
        </div>
      )}
    </Tabs>
  );
}