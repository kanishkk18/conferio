// // components/board/comment-with-attachments.tsx
// "use client";

// import { useState } from 'react';
// import { useSession } from 'next-auth/react';
// import { User, X, Trash2, File, MessageSquare } from 'lucide-react';
// import { format } from 'date-fns';

// interface CommentWithAttachmentsProps {
//   taskId: string;
//   comments: any[];
//   onAddComment: (content: string, attachments: any[]) => void;
//   onDeleteComment: (commentId: string) => void;
// }

// export function CommentWithAttachments({ 
//   taskId, 
//   comments, 
//   onAddComment,
//   onDeleteComment 
// }: CommentWithAttachmentsProps) {
//   const { data: session } = useSession();
//   const [content, setContent] = useState('');
//   const [pendingFiles, setPendingFiles] = useState<File[]>([]);
//   const [isWriting, setIsWriting] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)]);
//     }
//   };

//   const removeFile = (index: number) => {
//     setPendingFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   const uploadFile = async (file: File): Promise<any> => {
//     // Step 1: Get presigned URL
//     const res = await fetch("/api/uploads/presigned-url", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         filename: file.name,
//         contentType: file.type,
//         fileSize: file.size,
//       }),
//     });
    
//     if (!res.ok) throw new Error('Failed to get upload URL');
//     const { uploadURL, key } = await res.json();

//     // Step 2: Upload to S3
//     const uploadRes = await fetch(uploadURL, {
//       method: "PUT",
//       headers: { "Content-Type": file.type },
//       body: file,
//     });

//     if (!uploadRes.ok) throw new Error('Failed to upload to S3');

//     // Build file URL
//     const fileUrl = `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.r2.cloudflarestorage.com/${key}`;z


//     return { 
//       filename: file.name, 
//       url: fileUrl, 
//       key, 
//       mimeType: file.type, 
//       size: file.size 
//     };
//   };

//   const handleSubmit = async () => {
//     if (!content.trim() && pendingFiles.length === 0) return;
    
//     setUploading(true);
//     try {
//       // Upload all files first
//       const attachments = await Promise.all(pendingFiles.map(uploadFile));
      
//       // Then create comment with attachments
//       onAddComment(content, attachments);
      
//       setContent('');
//       setPendingFiles([]);
//       setIsWriting(false);
//     } catch (error) {
//       console.error("Failed to submit:", error);
//       alert("Failed to upload. Please try again.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="gap-y-4" >
//       <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//         <MessageSquare className="size-4" />
//         Comments ({comments.length})
//       </h3>

//       {/* Existing Comments */}
//       {comments.map((comment) => (
//         <div key={comment.id} className="flex gap-3" >
//           <div className="size-8 rounded-full flex items-center justify-center flex-shrink-0" >
//             {comment.user?.image ? (
//               <img src={comment.user.image} alt="" className="size-8 rounded-full" />
//             ) : (
//               <User className="size-4 text-indigo-600" />
//             )}
//           </div>
//           <div className="flex-1" >
//             <div className=" rounded-lg p-3" >
//               <div className="flex items-center justify-between mb-1" >
//                 <span className="font-medium text-sm text-gray-900" >{comment.user?.name || 'Unknown'}</span>
//                 <div className="flex items-center gap-2" >
//                   <span className="text-xs text-gray-500" >
//                     {format(new Date(comment.createdAt), 'MMM d, yyyy')}
//                   </span>
//                   {comment.user?.id === session?.user?.id && (
//                     <button type="button" 
//                       onClick={() = > onDeleteComment(comment.id)}
//                       className="p-1 hover:bg-red-100 text-red-600 rounded"
//                     >
//                       <Trash2 className="size-3" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//               {comment.content && <p className="text-sm text-gray-700">{comment.content}</p>}
              
//               {/* Comment Attachments */}
//               {comment.attachments?.length > 0 && (
//                 <div className="flex flex-wrap gap-2 mt-2" >
//                   {comment.attachments.map((att: any) => (
//                     <a
//                       key={att.id}
//                       href={att.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs "
//                     >
//                       <File className="size-3" />
//                       <span className="truncate max-w-[150px]" >{att.filename}</span>
//                     </a>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       ))}

//       {/* Add Comment */}
//       <div className="flex gap-3" >
//         <div className="size-8 rounded-full flex items-center justify-center flex-shrink-0" >
//           {session?.user?.image ? (
//             <img src={session.user.image} alt="" className="size-8 rounded-full" />
//           ) : (
//             <User className="size-4 text-indigo-600" />
//           )}
//         </div>
//         <div className="flex-1" >
//           {isWriting ? (
//             <div className="gap-y-3" >
//               <textarea
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 placeholder="Write a comment..."
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[80px] text-sm"
//                 
//               />
              
//               {/* File Upload Input */}
//               <div className="flex items-center gap-2" >
//                 <input
//                   type="file"
//                   multiple
//                   onChange={handleFileSelect}
//                   className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//                 />
//               </div>

//               {/* Pending Files */}
//               {pendingFiles.length > 0 && (
//                 <div className="flex flex-wrap gap-2" >
//                   {pendingFiles.map((file, idx) => (
//                     <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs" >
//                       {file.name}
//                       <button type="button"  onClick={() = > removeFile(idx)} className="hover:text-indigo-900">
//                         <X className="size-3" />
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               )}

//               <div className="flex justify-end gap-2" >
//                 <button type="button" 
//                   onClick={() = > { setIsWriting(false); setContent(''); setPendingFiles([]); }}
//                   className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
//                   disabled={uploading}
//                 >
//                   Cancel
//                 </button>
//                 <button type="button" 
//                   onClick={handleSubmit}
//                   disabled={(!content.trim() && pendingFiles.length === 0) || uploading}
//                   className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
//                  >
//                   {uploading ? 'Uploading...' : 'Comment'}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <button type="button" 
//               onClick={() = > setIsWriting(true)}
//               className="w-full text-left px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 transition-colors"
//             >
//               Write a comment...
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
  // working for aws s3 but not for r2 

// // components/board/comment-with-attachments.tsx
// "use client";

// import { useState } from 'react';
// import { useSession } from 'next-auth/react';
// import { User, X, Trash2, File, MessageSquare } from 'lucide-react';
// import { format } from 'date-fns';

// interface CommentWithAttachmentsProps {
//   taskId: string;
//   comments: any[];
//   onAddComment: (content: string, attachments: any[]) => void;
//   onDeleteComment: (commentId: string) => void;
// }

// export function CommentWithAttachments({ 
//   taskId, 
//   comments, 
//   onAddComment,
//   onDeleteComment 
// }: CommentWithAttachmentsProps) {
//   const { data: session } = useSession();
//   const [content, setContent] = useState('');
//   const [pendingFiles, setPendingFiles] = useState<File[]>([]);
//   const [isWriting, setIsWriting] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)]);
//     }
//   };

//   const removeFile = (index: number) => {
//     setPendingFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   const uploadFile = async (file: File): Promise<any> => {
//     // Step 1: Get presigned URL
//     const res = await fetch("/api/uploads/presigned-url", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         filename: file.name,
//         contentType: file.type,
//         fileSize: file.size,
//       }),
//     });
    
//     if (!res.ok) throw new Error('Failed to get upload URL');
//     const { uploadURL, key } = await res.json();

//     // Step 2: Upload to R2
//     const uploadRes = await fetch(uploadURL, {
//       method: "PUT",
//       headers: { "Content-Type": file.type },
//       body: file,
//     });

//     if (!uploadRes.ok) throw new Error('Failed to upload to R2');

//     // FIX: Use NEXT_PUBLIC_ prefix so browser can read it
//     const fileUrl = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${key}`;

//     return { 
//       filename: file.name, 
//       url: fileUrl, 
//       key, 
//       mimeType: file.type, 
//       size: file.size 
//     };
//   };

//   const handleSubmit = async () => {
//     if (!content.trim() && pendingFiles.length === 0) return;
    
//     setUploading(true);
//     try {
//       // Upload all files first (your original flow)
//       const attachments = await Promise.all(pendingFiles.map(uploadFile));
      
//       // Then create comment with attachments (your original flow)
//       onAddComment(content, attachments);
      
//       setContent('');
//       setPendingFiles([]);
//       setIsWriting(false);
//     } catch (error) {
//       console.error("Failed to submit:", error);
//       alert("Failed to upload. Please try again.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="gap-y-4" aria-label="Button">
//       <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//         <MessageSquare className="size-4" />
//         Comments ({comments.length})
//       </h3>

//       {/* Existing Comments */}
//       {comments.map((comment) => (
//         <div key={comment.id} className="flex gap-3" aria-label="Button">
//           <div className="size-8 rounded-full flex items-center justify-center flex-shrink-0" aria-label="Button">
//             {comment.user?.image ? (
//               <img src={comment.user.image} alt="" className="size-8 rounded-full" />
//             ) : (
//               <User className="size-4 text-indigo-600" />
//             )}
//           </div>
//           <div className="flex-1" aria-label="Button">
//             <div className=" rounded-lg p-3" aria-label="Button">
//               <div className="flex items-center justify-between mb-1" aria-label="Button">
//                 <span className="font-medium text-sm text-gray-900 line-clamp-1" aria-label="Button">{comment.user?.name || 'Unknown'}</span>
//                 <div className="flex items-center gap-2" aria-label="Button">
//                   <span className="text-xs text-gray-500" aria-label="Button">
//                     {format(new Date(comment.createdAt), 'MMM d, yyyy')}
//                   </span>
//                   {comment.user?.id === session?.user?.id && (
//                     <button type="button" 
//                       onClick={() => onDeleteComment(comment.id)}
//                       className="p-1 hover:bg-red-100 text-red-600 rounded"
//                     >
//                       <Trash2 className="size-3" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//               {comment.content && <p className="text-sm text-gray-700">{comment.content}</p>}
              
//               {/* Comment Attachments */}
//               {comment.attachments?.length > 0 && (
//                 <div className="flex flex-wrap gap-2 mt-2" aria-label="Button">
//                   {comment.attachments.map((att: any) => (
//                     <a
//                       key={att.id}
//                       href={att.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs "
//                     >
//                       <File className="size-3" />
//                       <span className="truncate max-w-[150px]" aria-label="Button">{att.filename}</span>
//                     </a>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       ))}

//       {/* Add Comment */}
//       <div className="flex gap-3" aria-label="Button">
//         <div className="size-8 rounded-full flex items-center justify-center flex-shrink-0" aria-label="Button">
//           {session?.user?.image ? (
//             <img src={session.user.image} alt="" className="size-8 rounded-full" />
//           ) : (
//             <User className="size-4 text-indigo-600" />
//           )}
//         </div>
//         <div className="flex-1" aria-label="Button">
//           {isWriting ? (
//             <div className="space-y-3" aria-label="Button">
//               <textarea
//               aria-label="Write a comment"
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 placeholder="Write a comment&hellip;"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[80px] text-sm"
                
//               />
              
//               {/* File Upload Input */}
//               <div className="flex items-center gap-2" aria-label="Button">
//                 <input
//                   aria-label="Upload file"
//                   type="file"
//                   multiple
//                   onChange={handleFileSelect}
//                   className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//                 />
//               </div>

//               {/* Pending Files */}
//               {pendingFiles.length > 0 && (
//                 <div className="flex flex-wrap gap-2" aria-label="Button">
//                   {pendingFiles.map((file, idx) => (
//                     <span key={`${file.name}-${file.size}-${file.lastModified}`} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs" aria-label="Button">
//                       {file.name}
//                       <button type="button"  onClick={() => removeFile(idx)} className="hover:text-indigo-900">
//                         <X className="size-3" />
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               )}

//               <div className="flex justify-end gap-2" aria-label="Button">
//                 <button type="button" 
//                   onClick={() => { setIsWriting(false); setContent(''); setPendingFiles([]); }}
//                   className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
//                   disabled={uploading}
//                 >
//                   Cancel
//                 </button>
//                 <button type="button" 
//                   onClick={handleSubmit}
//                   disabled={(!content.trim() && pendingFiles.length === 0) || uploading}
//                   className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
//                  >
//                   {uploading ? 'Uploading&hellip;' : 'Comment'}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <button type="button" 
//               onClick={() => setIsWriting(true)}
//               className="w-full text-left px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 transition-colors"
//             >
//               Write a comment&hellip;
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, X, Trash2, File, Paperclip, Send, Bold, Italic, Link2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CommentWithAttachmentsProps {
  taskId: string;
  comments: any[];
  onAddComment: (content: string, attachments: any[]) => void;
  onDeleteComment: (commentId: string) => void;
}

function CommentCard({ comment, onDelete, currentUserId }: {
  comment: any;
  onDelete: (id: string) => void;
  currentUserId?: string;
}) {
  return (
    <div className="group rounded-lg border border-gray-100 dark:border-white/[0.06] bg-gray-50/80 dark:bg-white/[0.03] p-3 transition-colors hover:border-gray-200 dark:hover:border-white/10">
      <div className="flex items-start gap-2.5">
        <div className="size-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {comment.user?.image ? (
            <img src={comment.user.image} alt="" className="size-7 rounded-full object-cover" />
          ) : (
            <User className="size-3.5 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate">
              {comment.user?.name || 'Unknown'}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
              </span>
              {comment.user?.id === currentUserId && (
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 rounded transition-all"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </div>
          </div>
          {comment.content && (
            <p className="text-[13px] text-gray-600 dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
          {comment.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {comment.attachments.map((att: any) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-white/[0.06] border border-gray-150 dark:border-white/10 rounded-md text-[11px] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {att.mimeType?.startsWith('image/') ? (
                    <ImageIcon className="size-3 text-indigo-400" />
                  ) : (
                    <File className="size-3 text-indigo-400" />
                  )}
                  <span className="truncate max-w-[120px]">{att.filename}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentWithAttachments({
  taskId,
  comments,
  onAddComment,
  onDeleteComment,
}: CommentWithAttachmentsProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }, [content]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File): Promise<any> => {
    const res = await fetch("/api/uploads/presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      }),
    });

    if (!res.ok) throw new Error('Failed to get upload URL');
    const { uploadURL, key } = await res.json();

    const uploadRes = await fetch(uploadURL, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) throw new Error('Failed to upload to R2');

    const fileUrl = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${key}`;

    return {
      filename: file.name,
      url: fileUrl,
      key,
      mimeType: file.type,
      size: file.size,
    };
  };

  const handleSubmit = async () => {
    if (!content.trim() && pendingFiles.length === 0) return;

    setUploading(true);
    try {
      const attachments = await Promise.all(pendingFiles.map(uploadFile));
      onAddComment(content, attachments);
      setContent('');
      setPendingFiles([]);
      setIsFocused(false);
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const hasContent = content.trim().length > 0 || pendingFiles.length > 0;

  return (
    <div className="flex flex-col">
      {/* Comment header */}
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
        Comments ({comments.length})
      </h3>

      {/* Comment cards */}
      <div className="space-y-2.5">
        {comments.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 py-2">No comments yet</p>
        )}
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onDelete={onDeleteComment}
            currentUserId={session?.user?.id}
          />
        ))}
      </div>

      {/* Sticky comment input at bottom */}
      <div className="sticky bottom-0 -mx-4 mt-4 px-4 pt-3 pb-1 bg-white dark:bg-neutral-950 border-t border-gray-100 dark:border-white/[0.06]">
        <div
          className={cn(
            "rounded-lg border transition-all duration-150",
            isFocused
              ? "border-indigo-400 dark:border-indigo-500/60 shadow-[0_0_0_2px_rgba(99,102,241,0.1)] dark:shadow-[0_0_0_2px_rgba(99,102,241,0.15)]"
              : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/15"
          )}
        >
          {/* Main input row */}
          <div className="flex items-start gap-2.5 p-2.5">
            <div className="size-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5">
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="size-7 rounded-full object-cover" />
              ) : (
                <User className="size-3.5 text-gray-400" />
              )}
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Write a comment..."
              className="flex-1 text-[13px] bg-transparent resize-none outline-none min-h-[24px] max-h-[140px] placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-800 dark:text-gray-200 leading-relaxed"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
                if (e.key === 'Escape') {
                  setIsFocused(false);
                  textareaRef.current?.blur();
                }
              }}
            />
          </div>

          {/* Pending files */}
          {pendingFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-2">
              {pendingFiles.map((file, idx) => (
                <span
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded text-[11px] font-medium"
                >
                  {file.name}
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Bottom toolbar */}
          {(isFocused || hasContent) && (
            <div className="flex items-center justify-between px-2 py-1.5 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] rounded-b-lg">
              <div className="flex items-center gap-0.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Upload file"
                />
                <button
                  type="button"
                  title="Attach file"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
                >
                  <Paperclip className="size-4" />
                </button>
                <button
                  type="button"
                  title="Bold"
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
                >
                  <Bold className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Italic"
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
                >
                  <Italic className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Add link"
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
                >
                  <Link2 className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Add image"
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
                >
                  <ImageIcon className="size-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:block">
                  ⌘+Enter to send
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={(!content.trim() && pendingFiles.length === 0) || uploading}
                  className="h-7 px-3 text-xs gap-1.5 rounded-md"
                >
                  <Send className="size-3" />
                  {uploading ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}