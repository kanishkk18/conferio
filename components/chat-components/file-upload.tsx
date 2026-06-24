// "use client";

// import React from "react";
// import "@uploadthing/react/styles.css";
// import { FileIcon, X } from "lucide-react";
// import Image from "next/image";

// import { UploadDropzone } from "@/lib/uploadthing";

// interface FileUploadProps {
//   onChange: (url?: string) => void;
//   value: string;
//   endpoint: "messageFile" | "serverImage";
// }

// export function FileUpload({
//   onChange,
//   value,
//   endpoint
// }: FileUploadProps) {
//   const fileType = value?.split(".").pop();

//   if (value && fileType !== "pdf") {
//     return (
//       <div className="relative h-20 w-20">
//         <Image fill src={value} alt="Upload" className="rounded-full" />
//         <button
//           onClick={() => onChange("")}
//           className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
//           type="button"
//         >
//           <X className="h-4 w-4" />
//         </button>
//       </div>
//     );
//   }

//   if (value && fileType === "pdf") {
//     return (
//       <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
//         <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
//         <a
//           href={value}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
//         >
//           {value}
//         </a>
//         <button
//           onClick={() => onChange("")}
//           className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
//           type="button"
//         >
//           <X className="h-4 w-4" />
//         </button>
//       </div>
//     );
//   }

//   return (
//     <UploadDropzone
//       endpoint={endpoint}
//       onClientUploadComplete={(res) => {
//         onChange(res?.[0].url);
//       }}
//       onUploadError={(error: Error) => console.error(error.message)}
//     />
//   );
// }


// "use client";

// import React, { useState } from "react";
// import { FileIcon, X, Upload, AlertCircle } from "lucide-react";
// import Image from "next/image";
// import { toast } from "react-hot-toast";

// interface FileUploadProps {
//   onChange: (url?: string) => void;
//   value: string;
//   endpoint: "messageFile" | "serverImage";
// }

// export function FileUpload({ onChange, value, endpoint }: FileUploadProps) {
//   const [isUploading, setIsUploading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const fileType = value?.split(".").pop();

//   const handleFileUpload = async (file: File) => {
//     setIsUploading(true);
//     setError(null);
    
//     try {
//       // Get presigned URL from our API
//       const response = await fetch('/api/upload', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           fileName: file.name,
//           fileType: file.type,
//           endpoint
//         }),
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to get upload URL');
//       }

//       const { presignedUrl, fileUrl } = data;
      
//       // Upload the file directly to S3 using the presigned URL
//       const uploadResponse = await fetch(presignedUrl, {
//         method: 'PUT',
//         body: file,
//         headers: {
//           'Content-Type': file.type,
//         },
//       });

//       if (!uploadResponse.ok) {
//         throw new Error('Upload failed');
//       }

//       onChange(fileUrl);
//       toast.success('File uploaded successfully');
//     } catch (error) {
//       console.error("Upload failed:", error);
//       const errorMessage = error.message || 'Upload failed. Please try again.';
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // ✅ Preview image
//   if (value && fileType !== "pdf") {
//     return (
//       <div className="relative h-20 w-20">
//         <Image fill src={value} alt="Upload" className="rounded-full object-cover" />
//         <button
//           onClick={() => onChange("")}
//           className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
//           type="button"
//         >
//           <X className="h-4 w-4" />
//         </button>
//       </div>
//     );
//   }

//   // ✅ Preview PDF
//   if (value && fileType === "pdf") {
//     return (
//       <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
//         <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
//         <a
//           href={value}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
//         >
//           {value}
//         </a>
//         <button
//           onClick={() => onChange("")}
//           className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
//           type="button"
//         >
//           <X className="h-4 w-4" />
//         </button>
//       </div>
//     );
//   }

//   // ✅ Upload Button (no dropzone)
//   return (
//     <div className="flex flex-col items-center">
//       <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//         <Upload className="h-4 w-4" />
//         {isUploading ? "Uploading..." : "Choose File"}
//         <input
//           type="file"
//           className="hidden"
//           onChange={(e) => {
//             if (e.target.files && e.target.files[0]) {
//               // Validate file size
//               const file = e.target.files[0];
//               const maxSize = endpoint === "serverImage" ? 4 * 1024 * 1024 : 10 * 1024 * 1024; // 4MB for images, 10MB for files
              
//               if (file.size > maxSize) {
//                 setError(`File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
//                 return;
//               }
              
//               handleFileUpload(file);
//             }
//           }}
//           accept={endpoint === "serverImage" ? "image/*" : "image/*,application/pdf"}
//           disabled={isUploading}
//         />
//       </label>
      
//       {error && (
//         <div className="mt-2 flex items-center gap-1 text-red-500 text-sm">
//           <AlertCircle className="h-4 w-4" />
//           <span>{error}</span>
//         </div>
//       )}
      
//       <p className="text-xs text-gray-500 mt-2">
//         {endpoint === "serverImage" 
//           ? "Supports: JPG, PNG, GIF (Max 4MB)" 
//           : "Supports: Images, PDF (Max 10MB)"}
//       </p>
//     </div>
//   );
// }
// "use client";

// import React, { useState, useEffect } from "react";
// import { FileIcon, X, Upload, AlertCircle, ImageIcon } from "lucide-react";
// import Image from "next/image";

// interface FileUploadProps {
//   onChange: (url?: string) => void;
//   value: string;
//   endpoint: "messageFile" | "serverImage";
// }

// export function FileUpload({ onChange, value, endpoint }: FileUploadProps) {
//   const [isUploading, setIsUploading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [imageError, setImageError] = useState(false);

//   const fileType = value?.split(".").pop();

//   useEffect(() => {
//     // Reset image error when value changes
//     setImageError(false);
//   }, [value]);

//   const handleFileUpload = async (file: File) => {
//     setIsUploading(true);
//     setError(null);
//     setImageError(false);
    
//     try {
//       // Convert file to base64 for server upload
//       const reader = new FileReader();
//       const fileData = await new Promise<string>((resolve, reject) => {
//         reader.onload = () => resolve(reader.result as string);
//         reader.onerror = reject;
//         reader.readAsDataURL(file);
//       });

//       // Upload through our API
//       const response = await fetch('/api/upload', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           fileName: file.name,
//           fileType: file.type,
//           endpoint,
//           fileData
//         }),
//       });

//       const data = await response.json();
      
//       if (!response.ok || !data.success) {
//         throw new Error(data.error || `Upload failed with status ${response.status}`);
//       }

//       onChange(data.fileUrl);
      
//     } catch (error) {
//       console.error("Upload failed:", error);
//       const errorMessage = error.message || 'Upload failed. Please try again.';
//       setError(errorMessage);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleImageError = () => {
//     setImageError(true);
//   };

//   // ✅ Show uploaded image (with error handling)
//   if (value && fileType !== "pdf") {
//     return (
//       <div className="relative h-20 w-20">
//         {imageError ? (
//           <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
//             <ImageIcon className="h-8 w-8 text-gray-400" />
//             <span className="sr-only">Image failed to load</span>
//           </div>
//         ) : (
//           <Image 
//             src={value} 
//             alt="Upload" 
//             className="rounded-full object-cover" 
//             fill
//             unoptimized
//             onError={handleImageError}
//           />
//         )}
//         <button
//           onClick={() => onChange("")}
//           className="bg-red-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
//           type="button"
//         >
//           <X className="h-4 w-4" />
//         </button>
//         {imageError && (
//           <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
//             <p className="text-white text-xs text-center px-1">Access Denied</p>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // ✅ Preview PDF
//   if (value && fileType === "pdf") {
//     return (
//       <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
//         <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
//         <a
//           href={value}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
//         >
//           {value.split('/').pop()}
//         </a>
//         <button
//           onClick={() => onChange("")}
//           className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
//           type="button"
//         >
//           <X className="h-4 w-4" />
//         </button>
//       </div>
//     );
//   }

//   // ✅ Upload Button
//   return (
//     <div className="flex flex-col items-center">
//       <label className={`cursor-pointer ${isUploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors`}>
//         <Upload className="h-4 w-4" />
//         {isUploading ? "Uploading..." : "Choose File"}
//         <input
//           type="file"
//           className="hidden"
//           onChange={(e) => {
//             if (e.target.files && e.target.files[0] && !isUploading) {
//               const file = e.target.files[0];
//               const maxSize = endpoint === "serverImage" ? 4 * 1024 * 1024 : 10 * 1024 * 1024;
              
//               if (file.size > maxSize) {
//                 setError(`File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
//                 return;
//               }
              
//               handleFileUpload(file);
//             }
//           }}
//           accept={endpoint === "serverImage" ? "image/*" : "image/*,application/pdf"}
//           disabled={isUploading}
//         />
//       </label>
      
//       {error && (
//         <div className="mt-2 flex items-center gap-1 text-red-500 text-sm max-w-xs">
//           <AlertCircle className="h-4 w-4 flex-shrink-0" />
//           <span>{error}</span>
//         </div>
//       )}
      
//       <p className="text-xs text-gray-500 mt-2 text-center">
//         {endpoint === "serverImage" 
//           ? "Supports: JPG, PNG, GIF (Max 4MB)" 
//           : "Supports: Images, PDF (Max 10MB)"}
//       </p>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import { FileIcon, X, Upload, AlertCircle, ImageIcon } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "messageFile" | "serverImage";
}

export function FileUpload({ onChange, value, endpoint }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const fileType = value?.split(".").pop();

  useEffect(() => {
    // Reset image error when value changes
    setImageError(false);
  }, [value]);

  const handleFilesUpload = async (files: File[]) => {
    setIsUploading(true);
    setError(null);
    setImageError(false);
    
    try {
      const uploadPromises = files.map(file => 
        new Promise<string>(async (resolve, reject) => {
          try {
            // Convert file to base64 for server upload
            const reader = new FileReader();
            const fileData = await new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });

            // Upload through our API
            const response = await fetch('/api/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                endpoint,
                fileData
              }),
            });

            const data = await response.json();
            
            if (!response.ok || !data.success) {
              throw new Error(data.error || `Upload failed for ${file.name}`);
            }

            resolve(data.fileUrl);
          } catch (error) {
            reject(error);
          }
        })
      );

      const fileUrls = await Promise.all(uploadPromises);
      
      // For now, use only the first file URL
      // You might want to modify this to handle multiple URLs
      if (fileUrls.length > 0) {
        onChange(fileUrls[0]);
      }
      
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage = error.message || 'Upload failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // ✅ Show uploaded image (with error handling)
  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-20 w-20">
        {imageError ? (
          <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-400" />
            <span className="sr-only">Image failed to load</span>
          </div>
        ) : (
          <Image 
            src={value} 
            alt="Upload" 
            className="rounded-full object-cover" 
            width={1000}
            height={1000}
            unoptimized
            onError={handleImageError}
          />
        )}
        <button
          onClick={() => onChange("")}
          className="bg-red-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
        {imageError && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <p className="text-white text-xs text-center px-1">Access Denied</p>
          </div>
        )}
      </div>
    );
  }

  // ✅ Preview PDF
  if (value && fileType === "pdf") {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {value.split('/').pop()}
        </a>
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ✅ Upload Button
  return (
    <div className="flex flex-col items-center">
      <label className={`cursor-pointer ${isUploading ? 'bg-gray-400' : 'bg-blue-700 hover:bg-blue-600'} text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors`}>
        <Upload className="h-4 w-4" />
        {isUploading ? "Uploading..." : "Choose File"}
        {/* <input
          type="file"
          multiple // Allow multiple files
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0 && !isUploading) {
              const files = Array.from(e.target.files);
              const maxSize = endpoint === "serverImage" ? 4 * 1024 * 1024 : 10 * 1024 * 1024;
              const maxSizeMB = maxSize / 1024 / 1024;
              
              // Check maximum file count (optional, but good practice)
              if (files.length > 10) {
                setError(`Maximum 10 files allowed. You selected ${files.length} files.`);
                return;
              }
              
              // Validate each file
              for (const file of files) {
                if (file.size > maxSize) {
                  setError(`"${file.name}" is too large. Maximum size is ${maxSizeMB}MB.`);
                  return;
                }
                
                const allowedTypes = endpoint === "serverImage" 
                  ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                  : ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
                
                if (!allowedTypes.includes(file.type)) {
                  setError(`"${file.name}" has invalid type. Allowed: ${endpoint === "serverImage" ? 'Images only' : 'Images and PDFs'}`);
                  return;
                }
              }
              
              // Clear any previous errors
              setError(null);
              
              // Upload all files at once (pass the array)
              handleFilesUpload(files);
            }
          }}
          accept={endpoint === "serverImage" ? "image/*" : "image/*,application/pdf"}
          disabled={isUploading} 
        /> */}

<input
aria-label='Upload file'
  type="file"
  multiple
  className="hidden"
  onChange={(e) => {
    if (e.target.files && e.target.files.length > 0 && !isUploading) {
      const files = Array.from(e.target.files);
      const maxSize = endpoint === "serverImage" ? 4 * 1024 * 1024 : 10 * 1024 * 1024;
      const maxSizeMB = maxSize / 1024 / 1024;
      
      if (files.length > 10) {
        setError(`Maximum 10 files allowed. You selected ${files.length} files.`);
        return;
      }
      
      // Validate each file
      for (const file of files) {
        if (file.size > maxSize) {
          setError(`"${file.name}" is too large. Maximum size is ${maxSizeMB}MB.`);
          return;
        }
        
        // O(1) lookup with Set.has() instead of O(n) array.includes()
        const allowedTypes = endpoint === "serverImage" 
                  ? new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
                  : new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']);
        
        if (!allowedTypes.has(file.type)) {
          setError(`"${file.name}" has invalid type. Allowed: ${endpoint === "serverImage" ? 'Images only' : 'Images and PDFs'}`);
          return;
        }
      }
      
      setError(null);
      handleFilesUpload(files);
    }
  }}
  accept={endpoint === "serverImage" ? "image/*" : "image/*,application/pdf"}
  disabled={isUploading}
/>
      </label>
      
      {error && (
        <div className="mt-2 flex items-center gap-1 text-red-500 text-sm max-w-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* <p className="text-xs text-gray-500 mt-2 text-center">
        {endpoint === "serverImage" 
          ? "Supports: JPG, PNG, GIF, WEBP (Max 4MB)" 
          : "Supports: Images, PDF (Max 10MB)"}
      </p> */}
      
      {/* <p className="text-xs text-gray-400 mt-1 text-center">
        {endpoint === "messageFile" ? "Multiple files supported" : "Single file only"}
      </p> */}
    </div>
  );
}
