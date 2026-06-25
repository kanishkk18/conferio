// components/upload/upload-toast.tsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  X, 
  File, 
  Image as ImageIcon, 
  FileText,
  FileArchive,
  FileVideo,
  FileAudio,
  FileType,
} from 'lucide-react';

interface UploadItem {
  file: File;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
}

interface UploadToastProps {
  uploads: UploadItem[];
  onClose: () => void;
}

export function UploadToast({ uploads, onClose }: UploadToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const activeUploads = uploads.filter(u => u.status === 'uploading');
  const completedUploads = uploads.filter(u => u.status === 'completed');
  const errorCount = uploads.filter(u => u.status === 'error').length;
  const completedCount = completedUploads.length;
  const totalUploads = uploads.length;
  
  // Calculate overall progress
  const overallProgress = uploads.length > 0
    ? Math.round(uploads.reduce((acc, u) => acc + u.progress, 0) / uploads.length)
    : 0;

  const isAllDone = activeUploads.length === 0 && totalUploads > 0;

  // Show toast when there are uploads
  useEffect(() => {
    if (totalUploads > 0) {
      setIsVisible(true);
      setIsExiting(false);
    }
  }, [totalUploads]);

  // Auto-dismiss after all uploads complete (longer delay to show previews)
  useEffect(() => {
    if (isAllDone) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 400);
      }, 3000); // 3 seconds to show previews before disappearing
      return () => clearTimeout(timer);
    }
  }, [isAllDone, onClose]);

  if (!isVisible) return null;

  const getFileIcon = (file: File, size: string = "size-3.5") => {
    if (file.type.startsWith('image/')) return <ImageIcon className={`${size} text-purple-500`} />;
    if (file.type.includes('pdf')) return <FileText className={`${size} text-red-500`} />;
    if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')) return <FileArchive className={`${size} text-yellow-600`} />;
    if (file.type.startsWith('video/')) return <FileVideo className={`${size} text-blue-500`} />;
    if (file.type.startsWith('audio/')) return <FileAudio className={`${size} text-pink-500`} />;
    return <File className={`${size} text-blue-500`} />;
  };

  const getStatusIcon = () => {
    if (errorCount > 0 && activeUploads.length === 0) {
      return <AlertCircle className="size-5 text-red-500" />;
    }
    if (isAllDone) {
      return <CheckCircle className="size-5 text-green-500" />;
    }
    return <Upload className="size-5 text-indigo-500 animate-bounce" />;
  };

  const getStatusText = () => {
    if (isAllDone && errorCount === 0) {
      return `${completedCount} file${completedCount > 1 ? 's' : ''} uploaded`;
    }
    if (isAllDone && errorCount > 0) {
      return `${completedCount} uploaded, ${errorCount} failed`;
    }
    return `Uploading ${activeUploads.length} of ${totalUploads}...`;
  };

  const getProgressColor = () => {
    if (isAllDone && errorCount === 0) return 'bg-green-500';
    if (isAllDone && errorCount > 0) return 'bg-red-500';
    return 'bg-indigo-500';
  };

  // Dynamic width based on content
  const getToastWidth = () => {
    const imageCount = completedUploads.filter(u => u.file.type.startsWith('image/')).length;
    if (imageCount > 2) return 'w-96';
    if (imageCount > 0) return 'w-80';
    return 'w-72';
  };

  return createPortal(
    <div
      className={`fixed bottom-4 left-4 z-50 transition-all duration-400 ease-out ${
        isExiting 
          ? 'opacity-0 translate-y-4 scale-95' 
          : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className={`${getToastWidth()} bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 pb-2">
          <div className="flex items-center gap-2.5">
            {getStatusIcon()}
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {getStatusText()}
            </span>
          </div>
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(() => {
                setIsVisible(false);
                onClose();
              }, 400);
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isAllDone ? 'Complete' : `${overallProgress}%`}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ease-out ${getProgressColor()}`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* File Previews */}
        <div className="px-3 pb-3">
          {/* Image Previews Grid */}
          {completedUploads.filter(u => u.file.type.startsWith('image/')).length > 0 && (
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {completedUploads
                .filter(u => u.file.type.startsWith('image/') && u.url)
                .slice(0, 6)
                .map((upload, index) => (
                  <div 
                    key={`preview-${upload.file.name}-${index}`}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                  >
                    <img 
                      src={upload.url} 
                      alt={upload.file.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Hover overlay with filename */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end">
                      <div className="w-full p-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[9px] text-white truncate font-medium">
                          {upload.file.name}
                        </p>
                      </div>
                    </div>
                    {/* Success badge */}
                    <div className="absolute top-0.5 right-0.5">
                      <div className="bg-green-500 rounded-full p-0.5 shadow-sm">
                        <CheckCircle className="size-2.5 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              {/* Show count if more than 6 images */}
              {completedUploads.filter(u => u.file.type.startsWith('image/')).length > 6 && (
                <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    +{completedUploads.filter(u => u.file.type.startsWith('image/')).length - 6}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Non-image files list */}
          {(uploads.filter(u => !u.file.type.startsWith('image/')).length > 0) && (
            <div className="space-y-1.5">
              {uploads
                .filter(u => !u.file.type.startsWith('image/'))
                .map((upload, index) => (
                  <div key={`file-${upload.file.name}-${index}`} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-2.5 py-2">
                    {/* File type icon with colored background */}
                    <div className={`
                      p-1.5 rounded-md
                      ${upload.file.type.includes('pdf') 
                        ? 'bg-red-50 dark:bg-red-900/20' 
                        : upload.file.type.includes('zip') || upload.file.type.includes('rar')
                        ? 'bg-yellow-50 dark:bg-yellow-900/20'
                        : upload.file.type.startsWith('video/')
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : upload.file.type.startsWith('audio/')
                        ? 'bg-pink-50 dark:bg-pink-900/20'
                        : 'bg-blue-50 dark:bg-blue-900/20'
                      }
                    `}>
                      {getFileIcon(upload.file, "size-4")}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        {upload.file.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {upload.file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </p>
                    </div>

                    {/* Status */}
                    {upload.status === 'uploading' && (
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-indigo-500 min-w-[28px] text-right">
                          {upload.progress}%
                        </span>
                      </div>
                    )}
                    {upload.status === 'completed' && (
                      <CheckCircle className="size-4 text-green-500 flex-shrink-0" />
                    )}
                    {upload.status === 'error' && (
                      <AlertCircle className="size-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Uploading images (show placeholder with progress) */}
          {uploads.filter(u => u.file.type.startsWith('image/') && u.status === 'uploading').length > 0 && (
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {uploads
                .filter(u => u.file.type.startsWith('image/') && u.status === 'uploading')
                .slice(0, 6)
                .map((upload, index) => (
                  <div 
                    key={`uploading-${upload.file.name}-${index}`}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                  >
                    {/* Placeholder icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="size-5 text-gray-300 dark:text-gray-500" />
                    </div>
                    {/* Progress overlay */}
                    <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 flex items-end p-1">
                      <div className="w-full">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-center text-gray-500 mt-0.5">
                          {upload.progress}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}