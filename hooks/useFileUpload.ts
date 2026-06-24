// import { useState, useCallback } from 'react';
// import { useMutation } from '@tanstack/react-query';

// interface UploadProgress {
//   file: File;
//   progress: number;
//   status: 'pending' | 'uploading' | 'completed' | 'error';
//   url?: string;
//   attachmentId?: string;
// }

// interface UseFileUploadOptions {
//   onSuccess?: (attachments: any[]) => void;
//   onError?: (error: Error) => void;
// }

// export function useFileUpload(options: UseFileUploadOptions = {}) {
//   const [uploads, setUploads] = useState<UploadProgress[]>([]);

//   const uploadMutation = useMutation({
//     mutationFn: async ({ 
//       file, 
//       taskId, 
//       commentId,
//       type 
//     }: { 
//       file: File; 
//       taskId?: string;
//       commentId?: string;
//       type: 'task' | 'comment';
//     }) => {
//       const presignedRes = await fetch('/api/upload/presigned-url', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           filename: file.name,
//           contentType: file.type,
//           fileSize: file.size,
//         }),
//       });

//       if (!presignedRes.ok) throw new Error('Failed to get upload URL');
//       const { uploadURL, fileUrl, key } = await presignedRes.json();

//       const uploadRes = await fetch(uploadURL, {
//         method: 'PUT',
//         body: file,
//         headers: { 'Content-Type': file.type },
//       });

//       if (!uploadRes.ok) throw new Error('Failed to upload file to S3');

//       const confirmRes = await fetch('/api/upload/confirm', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           key,
//           taskId,
//           commentId,
//           type,
//           contentType: file.type,
//           size: file.size,
//         }),
//       });

//       if (!confirmRes.ok) throw new Error('Failed to confirm upload');
//       return confirmRes.json();
//     },
//   });

//   const uploadFiles = useCallback(async (
//     files: FileList | null,
//     metadata: { taskId?: string; commentId?: string; type: 'task' | 'comment' }
//   ) => {
//     if (!files || files.length === 0) return;

//     const newUploads: UploadProgress[] = Array.from(files).map(file => ({
//       file,
//       progress: 0,
//       status: 'pending',
//     }));

//     setUploads(prev => [...prev, ...newUploads]);

//     const results = await Promise.all(
//       newUploads.map(async (upload) => {
//         try {
//           setUploads(prev => {
//             const updated = [...prev];
//             const idx = updated.findIndex(u => u.file === upload.file);
//             if (idx !== -1) updated[idx].status = 'uploading';
//             return updated;
//           });

//           const result = await uploadMutation.mutateAsync({
//             file: upload.file,
//             ...metadata,
//           });

//           setUploads(prev => {
//             const updated = [...prev];
//             const idx = updated.findIndex(u => u.file === upload.file);
//             if (idx !== -1) {
//               updated[idx].status = 'completed';
//               updated[idx].url = result.url;
//               updated[idx].attachmentId = result.id;
//             }
//             return updated;
//           });

//           return result;
//         } catch (error) {
//           setUploads(prev => {
//             const updated = [...prev];
//             const idx = updated.findIndex(u => u.file === upload.file);
//             if (idx !== -1) updated[idx].status = 'error';
//             return updated;
//           });
//           throw error;
//         }
//       })
//     );

//     options.onSuccess?.(results);
//     return results;
//   }, [uploadMutation, options]);

//   const removeUpload = useCallback((file: File) => {
//     setUploads(prev => prev.filter(u => u.file !== file));
//   }, []);

//   const clearUploads = useCallback(() => {
//     setUploads([]);
//   }, []);

//   return {
//     uploads,
//     uploadFiles,
//     removeUpload,
//     clearUploads,
//     isUploading: uploadMutation.isPending,
//   };
// }

// hooks/useFileUpload.ts
// import { useState, useCallback } from 'react';
// import { useMutation } from '@tanstack/react-query';

// interface UploadProgress {
//   file: File;
//   progress: number;
//   status: 'pending' | 'uploading' | 'completed' | 'error';
//   url?: string;
//   attachmentId?: string;
// }

// interface UseFileUploadOptions {
//   onSuccess?: (attachments: any[]) => void;
//   onError?: (error: Error) => void;
// }

// export function useFileUpload(options: UseFileUploadOptions = {}) {
//   const [uploads, setUploads] = useState<UploadProgress[]>([]);

//   const uploadMutation = useMutation({
//     mutationFn: async ({ 
//       file, 
//       taskId, 
//       commentId,
//       type 
//     }: { 
//       file: File; 
//       taskId?: string;
//       commentId?: string;
//       type: 'task' | 'comment';
//     }) => {
//       // Step 1: Get presigned URL
//       const presignedRes = await fetch('/api/upload/presigned-url', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           filename: file.name,
//           contentType: file.type,
//           fileSize: file.size,
//         }),
//       });

//       if (!presignedRes.ok) {
//         throw new Error('Failed to get upload URL');
//       }

//       const { uploadURL, fileUrl, key } = await presignedRes.json();

//       // Step 2: Upload to S3
//       const uploadRes = await fetch(uploadURL, {
//         method: 'PUT',
//         body: file,
//         headers: {
//           'Content-Type': file.type,
//         },
//       });

//       if (!uploadRes.ok) {
//         throw new Error('Failed to upload file to S3');
//       }

//       // Step 3: Confirm upload and save to database
//       const confirmRes = await fetch('/api/upload/confirm', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           key,
//           taskId,
//           commentId,
//           type,
//           contentType: file.type,
//           size: file.size,
//         }),
//       });

//       if (!confirmRes.ok) {
//         throw new Error('Failed to confirm upload');
//       }

//       return confirmRes.json();
//     },
//   });

//   const uploadFiles = useCallback(async (
//     files: FileList | null,
//     metadata: { taskId?: string; commentId?: string; type: 'task' | 'comment' }
//   ) => {
//     if (!files || files.length === 0) return;

//     const newUploads: UploadProgress[] = Array.from(files).map(file => ({
//       file,
//       progress: 0,
//       status: 'pending',
//     }));

//     setUploads(prev => [...prev, ...newUploads]);

//     const results = await Promise.all(
//       newUploads.map(async (upload, index) => {
//         try {
//           setUploads(prev => {
//             const updated = [...prev];
//             const idx = updated.findIndex(u => u.file === upload.file);
//             if (idx !== -1) updated[idx].status = 'uploading';
//             return updated;
//           });

//           const result = await uploadMutation.mutateAsync({
//             file: upload.file,
//             ...metadata,
//           });

//           setUploads(prev => {
//             const updated = [...prev];
//             const idx = updated.findIndex(u => u.file === upload.file);
//             if (idx !== -1) {
//               updated[idx].status = 'completed';
//               updated[idx].url = result.url;
//               updated[idx].attachmentId = result.id;
//             }
//             return updated;
//           });

//           return result;
//         } catch (error) {
//           setUploads(prev => {
//             const updated = [...prev];
//             const idx = updated.findIndex(u => u.file === upload.file);
//             if (idx !== -1) updated[idx].status = 'error';
//             return updated;
//           });
//           throw error;
//         }
//       })
//     );

//     options.onSuccess?.(results);
//     return results;
//   }, [uploadMutation, options]);

//   const removeUpload = useCallback((file: File) => {
//     setUploads(prev => prev.filter(u => u.file !== file));
//   }, []);

//   const clearUploads = useCallback(() => {
//     setUploads([]);
//   }, []);

//   return {
//     uploads,
//     uploadFiles,
//     removeUpload,
//     clearUploads,
//     isUploading: uploadMutation.isPending,
//   };
// }

// hooks/useFileUpload.ts
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  attachmentId?: string;
  error?: string;
}

interface UseFileUploadOptions {
  onSuccess?: (attachments: any[]) => void;
  onError?: (error: Error) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  // Helper function to upload with XMLHttpRequest for progress tracking
  const uploadToS3 = useCallback((uploadURL: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploads(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(u => u.file === file);
            if (idx !== -1) updated[idx].progress = progress;
            return updated;
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('PUT', uploadURL, true);
      xhr.setRequestHeader('Content-Type', file.type);
      // xhr.setRequestHeader('x-amz-acl', 'public-read'); // Optional: make file publicly readable
      xhr.send(file);
    });
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async ({ 
      file, 
      taskId, 
      commentId,
      type 
    }: { 
      file: File; 
      taskId?: string;
      commentId?: string;
      type: 'task' | 'comment';
    }) => {
      // Step 1: Get presigned URL from your API
      const presignedRes = await fetch('/api/uploads/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignedRes.ok) {
        const error = await presignedRes.text();
        throw new Error(`Failed to get upload URL: ${error}`);
      }

      const { uploadURL, fileUrl, key } = await presignedRes.json();

      if (!uploadURL || !key) {
        throw new Error('Invalid response from server: missing uploadURL or key');
      }

      // Step 2: Upload directly to S3 using XMLHttpRequest
      await uploadToS3(uploadURL, file);

      // Step 3: Confirm upload with your backend
      const confirmRes = await fetch('/api/uploads/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          taskId,
          commentId,
          type,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!confirmRes.ok) {
        const error = await confirmRes.text();
        throw new Error(`Failed to confirm upload: ${error}`);
      }

      const result = await confirmRes.json();
      return { ...result, fileUrl: result.url }; // Use the presigned URL from confirm.ts
    },
    onError: (error) => {
      console.error('Upload error:', error);
      options.onError?.(error as Error);
    },
  });

  const uploadFiles = useCallback(async (
    files: FileList | null,
    metadata: { taskId?: string; commentId?: string; type: 'task' | 'comment' }
  ) => {
    if (!files || files.length === 0) return;

    const newUploads: UploadProgress[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploads(prev => [...prev, ...newUploads]);

    const results = await Promise.allSettled(
      newUploads.map(async (upload) => {
        try {
          setUploads(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(u => u.file === upload.file);
            if (idx !== -1) {
              updated[idx].status = 'uploading';
              updated[idx].progress = 0;
            }
            return updated;
          });

          const result = await uploadMutation.mutateAsync({
            file: upload.file,
            ...metadata,
          });

          setUploads(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(u => u.file === upload.file);
            if (idx !== -1) {
              updated[idx].status = 'completed';
              updated[idx].progress = 100;
              // updated[idx].url = result.fileUrl;
              updated[idx].url = result.url || result.fileUrl;
              updated[idx].attachmentId = result.id;
            }
            return updated;
          });

          return result;
        } catch (error) {
          setUploads(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(u => u.file === upload.file);
            if (idx !== -1) {
              updated[idx].status = 'error';
              updated[idx].error = (error as Error).message;
            }
            return updated;
          });
          throw error;
        }
      })
    );

    const successful = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    if (successful.length > 0) {
      options.onSuccess?.(successful);
    }

    return successful;
  }, [uploadMutation, uploadToS3, options]);

  const removeUpload = useCallback((file: File) => {
    setUploads(prev => prev.filter(u => u.file !== file));
  }, []);

  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);

  const retryUpload = useCallback(async (file: File, metadata: { taskId?: string; commentId?: string; type: 'task' | 'comment' }) => {
    // Remove the failed upload first
    setUploads(prev => prev.filter(u => u.file !== file));
    // Retry
    await uploadFiles([file] as unknown as FileList, metadata);
  }, [uploadFiles]);

  return {
    uploads,
    uploadFiles,
    removeUpload,
    clearUploads,
    retryUpload,
    isUploading: uploadMutation.isPending,
  };
}
