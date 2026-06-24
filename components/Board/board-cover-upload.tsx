

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Upload, X, Search, Loader2 } from 'lucide-react';
import { Modal, ModalBody, ModalContent, ModalTrigger } from '../ui/animated-modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Image from 'next/image';

interface BoardCoverUploadProps {
  boardId: string;
  currentCover?: string | null;
  onClose: () => void;
  open: boolean;
}

interface UnsplashImage {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  author: string;
}

export function BoardCoverUpload({ boardId, currentCover, onClose, open }: BoardCoverUploadProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'upload' | 'unsplash'>('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload local file mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Get presigned URL
      const res = await fetch(`/api/boards/${boardId}/cover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'local',
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!res.ok) throw new Error('Failed to get upload URL');
      const { uploadURL, fileUrl, key } = await res.json();

      // Upload to S3
      const uploadRes = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) throw new Error('Failed to upload to S3');

      // Confirm upload
      const confirmRes = await fetch(`/api/boards/${boardId}/cover`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, fileUrl }),
      });

      if (!confirmRes.ok) throw new Error('Failed to confirm upload');
      return confirmRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      onClose();
    },
  });

  // Set Unsplash cover mutation
  const unsplashMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const res = await fetch(`/api/boards/${boardId}/cover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'unsplash', unsplashUrl: imageUrl }),
      });
      if (!res.ok) throw new Error('Failed to set cover');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      onClose();
    },
  });

  // Remove cover mutation
  const removeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/boards/${boardId}/cover`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove cover');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      onClose();
    },
  });

  const searchUnsplash = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setUnsplashImages(data.images || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(selectedFile);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal open={true} onOpenChange={() => {onClose()}}>
      <ModalBody className='!min-w-[35rem] !h-[60vh]'>
      <ModalContent className='w-full h-full rounded-xl !py-2 !px-0 overflow-hidden dark:bg-[#111] shadow-2xl'>

        <div className="flex border-b border-border dark:border-[#222] ">
          <div className="flex justify-start items-center w-[50%]">
          <button 
            onClick={() => setActiveTab('upload')}
            type='button'
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'upload' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'
            }`}
          >
            <Upload className="size-4" /> Upload
          </button>
          <button type="button" 
            onClick={() => setActiveTab('unsplash')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'unsplash' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'
            }`}
          >
            <ImageIcon className="size-4" /> Search
          </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto scrollbar-thin2 max-h-[50vh]">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  aria-label='file'
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="space-y-3">
                    <Image
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg object-cover"
                      width={400}
                      height={400}
                    />
                    <p className="text-sm text-gray-600">{selectedFile.name}</p>
                    <div className="flex gap-2 justify-center">
                      <button type="button" 
                        onClick={() => setSelectedFile(null)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                      >
                        Change
                      </button>
                      <button type="button" 
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isUploading && <Loader2 className="size-3 animate-spin" />}
                        Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 text-gray-500 hover:text-indigo-600"
                  >
                    <Upload className="size-8" />
                    <span>Click to select an image</span>
                    <span className="text-xs text-gray-400">Max 5MB</span>
                  </button>
                )}
              </div>

              {currentCover && (
                <Button type="button" 
                  onClick={() => removeMutation.mutate()}
                  disabled={removeMutation.isPending}
                  className="w-full py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm"
                >
                  Remove Current Cover
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchUnsplash()}
                  placeholder="Search for images..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="button" 
                  onClick={searchUnsplash}
                  disabled={isSearching}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                </Button>
              </div>

              {unsplashImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {unsplashImages.map((img) => (
                    <button type="button" 
                      key={img.id}
                      onClick={() => unsplashMutation.mutate(img.url)}
                      disabled={unsplashMutation.isPending}
                      className="relative group aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500"
                    >
                      <Image
                        src={img.thumb}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                        width={500}
                        height={500}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-white text-xs truncate">by {img.author}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {isSearching ? 'Searching...' : 'Search for images'}
                </div>
              )}
            </div>
          )}
        </div>
     
   
    </ModalContent>
    </ModalBody>
   </Modal> 
  );
}
