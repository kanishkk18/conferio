// components/upload/file-upload.tsx
import { useRef, useCallback } from 'react';
import { useFileUpload } from 'hooks/useFileUpload';
import { 
  Upload, 
  X, 
  File, 
  Image as ImageIcon, 
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download, // ADD THIS
  ExternalLink, // ADD THIS
} from 'lucide-react';

interface FileUploadProps {
  taskId?: string;
  commentId?: string;
  type: 'task' | 'comment';
  onUploadComplete?: (attachments: any[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
}

export function FileUpload({ 
  taskId, 
  commentId, 
  type, 
  onUploadComplete,
  maxFiles = 5,
  acceptedTypes = "*"
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploads, uploadFiles, removeUpload, clearUploads, isUploading } = useFileUpload({
    onSuccess: onUploadComplete,
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    uploadFiles(files, { taskId, commentId, type });
    
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [uploadFiles, taskId, commentId, type, maxFiles]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="size-5 text-purple-500" />;
    if (file.type.includes('pdf')) return <FileText className="size-5 text-red-500" />;
    return <File className="size-5 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="gap-y-3">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          aria-labelledby='file-upload-label'
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${type}-${taskId || commentId}`}
        />
        {/* ADD cursor-pointer and styling so it's actually clickable */}
        <label
          htmlFor={`file-upload-${type}-${taskId || commentId}`}
          className="flex items-center gap-2   p-1   bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors"
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {/* <span className="text-sm font-medium">
            {isUploading ? 'Uploading...' : 'Attach files'}
          </span> */}
        </label>
      </div>

      {uploads.length > 0 && (
        <div className="gap-y-2">
          {uploads.map((upload, index) => (
            <div 
              key={`${upload.file.name}-${upload.file.size}-${upload.file.lastModified}`}
              className={`
                flex items-center gap-3 p-3 rounded-lg border
                ${upload.status === 'completed' ? 'bg-green-50 border-green-200' : 
                  upload.status === 'error' ? 'bg-red-50 border-red-200' : 
                  'bg-gray-50 border-gray-200'}
              `}
            >
              {getFileIcon(upload.file)}
              
              <div className="flex-1 min-w-0">
                {/* CHANGED: Make filename clickable when completed */}
                {upload.status === 'completed' && upload.url ? (
                  <a 
                    href={upload.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 truncate block"
                    title="Open file (link expires in 1 hour)"
                  >
                    {upload.file.name}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {upload.file.name}
                  </p>
                )}
                
                <p className="text-xs text-gray-500">
                  {formatFileSize(upload.file.size)}
                </p>
                
                {/* ADDED: Image preview for completed image uploads */}
                {upload.status === 'completed' && upload.url && upload.file.type.startsWith('image/') && (
                  <div className="mt-2">
                    <img 
                      src={upload.url} 
                      alt={upload.file.name}
                      className="max-w-[200px] max-h-[120px] rounded-lg border border-gray-200 object-cover"
                    />
                  </div>
                )}

                {upload.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {upload.status === 'completed' && upload.url && (
                  <>
                    <CheckCircle className="size-5 text-green-500" />
                    {/* ADDED: Download button */}
                    <a
                      href={upload.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-indigo-600"
                      title="Download file"
                    >
                      <Download className="size-4" />
                    </a>
                  </>
                )}
                {upload.status === 'error' && (
                  <AlertCircle className="size-5 text-red-500" />
                )}
                {upload.status !== 'uploading' && (
                  <button
                  type='button'
                    onClick={() => removeUpload(upload.file)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// // components/upload/file-upload.tsx
// import { useRef, useCallback } from 'react';
// import { useFileUpload } from 'hooks/useFileUpload';
// import { 
//   Upload, 
//   X, 
//   File, 
//   Image as ImageIcon, 
//   FileText,
//   CheckCircle,
//   AlertCircle,
//   Loader2
// } from 'lucide-react';

// interface FileUploadProps {
//   taskId?: string;
//   commentId?: string;
//   type: 'task' | 'comment';
//   onUploadComplete?: (attachments: any[]) => void;
//   maxFiles?: number;
//   acceptedTypes?: string;
// }

// export function FileUpload({ 
//   taskId, 
//   commentId, 
//   type, 
//   onUploadComplete,
//   maxFiles = 5,
//   acceptedTypes = "*"
// }: FileUploadProps) {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const { uploads, uploadFiles, removeUpload, clearUploads, isUploading } = useFileUpload({
//     onSuccess: onUploadComplete,
//   });

//   const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files) return;
    
//     if (files.length > maxFiles) {
//       alert(`Maximum ${maxFiles} files allowed`);
//       return;
//     }

//     uploadFiles(files, { taskId, commentId, type });
    
//     // Reset input
//     if (inputRef.current) {
//       inputRef.current.value = '';
//     }
//   }, [uploadFiles, taskId, commentId, type, maxFiles]);

//   const getFileIcon = (file: File) => {
//     if (file.type.startsWith('image/')) return <ImageIcon className="size-5 text-purple-500" />;
//     if (file.type.includes('pdf')) return <FileText className="size-5 text-red-500" />;
//     return <File className="size-5 text-blue-500" />;
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   return (
//     <div className="gap-y-3">
//       {/* Upload Button */}
//       <div className="flex items-center gap-3">
//         <input
//           ref={inputRef}
//           type="file"
//           multiple
//           accept={acceptedTypes}
//           onChange={handleFileSelect}
//           className="hidden"
//           id={`file-upload-${type}-${taskId || commentId}`}
//         />
//         <label
//           htmlFor={`file-upload-${type}-${taskId || commentId}`}
//         >
//           {isUploading ? (
//             <Loader2 className="size-5 animate-spin" />
//           ) : (
//             <Upload className="size-5" />
//           )}
//           {/* <span className="text-sm font-medium">
//             {isUploading ? 'Uploading...' : 'Attach files'}
//           </span> */}
//         </label>
      
//       </div>

//       {/* Upload Progress */}
//       {uploads.length > 0 && (
//         <div className="gap-y-2">
//           {uploads.map((upload, index) => (
//             <div 
//               key={index}
//               className={`
//                 flex items-center gap-3 p-3 rounded-lg border
//                 ${upload.status === 'completed' ? 'bg-green-50 border-green-200' : 
//                   upload.status === 'error' ? 'bg-red-50 border-red-200' : 
//                   'bg-gray-50 border-gray-200'}
//               `}
//             >
//               {getFileIcon(upload.file)}
              
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-gray-900 truncate">
//                   {upload.file.name}
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {formatFileSize(upload.file.size)}
//                 </p>
                
//                 {upload.status === 'uploading' && (
//                   <div className="mt-2">
//                     <div className="w-full bg-gray-200 rounded-full h-1.5">
//                       <div 
//                         className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
//                         style={{ width: `${upload.progress}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="flex items-center gap-2">
//                 {upload.status === 'completed' && (
//                   <CheckCircle className="size-5 text-green-500" />
//                 )}
//                 {upload.status === 'error' && (
//                   <AlertCircle className="size-5 text-red-500" />
//                 )}
//                 {upload.status !== 'uploading' && (
//                   <button
//                     onClick={() => removeUpload(upload.file)}
//                     className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
//                   >
//                     <X className="size-4" />
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
