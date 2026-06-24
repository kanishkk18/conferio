'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StarsBackground } from '@/components/animate-ui/components/backgrounds/stars';
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileIcon, X, Upload, AlertCircle, ImageIcon } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "messageFile" | "serverImage";
}

const formSchema = z.object({
  name: z.string().min(1, { message: 'Server name is required.' }),
  imageUrl: z.string().min(1, { message: 'Server image is required.' }),
});

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]);

const FILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf'
]);

export function InitialModal() {
  const { push } = useRouter()
  const { refresh } = useRouter()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
    },
  });
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();

      // Calculate mouse position relative to card center
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      setMousePosition({ x, y });

      // Calculate rotation (limited range for subtle effect)
      const rotateX = -(y / rect.height) * 5; // Max 5 degrees rotation
      const rotateY = (x / rect.width) * 5; // Max 5 degrees rotation

      setRotation({ x: rotateX, y: rotateY });
    }
  };

  // Reset rotation when not hovering
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post('/api/servers', values);

      form.reset();
      if (response.data?.id) {
        push(`/servers/${response.data.id}`);
      } else {
        refresh();
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollArea>
      <div className=" relative h-screen max-h-screen !overflow-hidden w-screen flex bg-black justify-center items-center">
        {/* <img className='absolute inset-0 h-screen w-screen object-cover object-bottom ' src="https://res.cloudinary.com/kanishkkcloud18/image/upload/v1775594729/copy_of_af4634b348cac90d4d45087085cfb435_ceepfh_f810fc.jpg" alt="" /> */}
        <div className=" h-full absolute inset-0 opacity-80 !z-50 top-0 left-0">
          <StarsBackground />
        </div>
        <div className=" w-fit z-50">

          <div className="w-full flex items-center justify-center p-8">
            <motion.div
              ref={cardRef}
              className="relative rounded-2xl overflow-hidden"
              style={{
                width: "400px",
                height: "390px",
                transformStyle: "preserve-3d",
                backgroundColor: "#0B0F1A",
              }}
              initial={{ y: 0 }}
              animate={{
                y: isHovered ? -8 : 0,
                rotateX: rotation.x,
                rotateY: rotation.y,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {/* Background layers */}
              <div className="absolute inset-0 z-0 bg-[#0B0F1A]" />
              <div
                className="absolute inset-0 z-[1]"
                style={{
                  background: "radial-gradient(125% 125% at 50% 10%, #000 40%, #4c1d95 100%)",
                }}
              />
              <div
                className="absolute inset-0 z-[2] opacity-20 mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
              <motion.div
                className="absolute inset-0 z-[3] pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 80%, rgba(255,255,255,0.03) 100%)",
                }}
                animate={{ opacity: isHovered ? 0.6 : 0.4 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1/2 z-[4] pointer-events-none blur-xl"
                style={{
                  background: "radial-gradient(ellipse at bottom center, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",

                }}
                animate={{ opacity: isHovered ? 0.8 : 0.6 }}
              />

              {/* Content */}
              <motion.div
                className="relative z-10 flex flex-col h-full px-6 pb-6"
                animate={{ z: isHovered ? 20 : 10 }}
              >
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col h-full !gap-y-5"
                  >
                    {/* SERVER AVATAR - Clickable upload area */}
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center gap-y-2">
                          <FormControl>
                            <div className="relative group cursor-pointer">
                              {/* Hidden FileUpload trigger */}
                              <div className="overflow-hidden border-b border-[#333]">
                                <FileUpload
                                  endpoint="serverImage"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </div>

                              {/* Visible avatar circle */}

                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Header text */}
                    <div className="gap-y-2 text-start">
                      <motion.h2
                        className="text-2xl font-semibold text-white tracking-tight"
                        animate={{ y: isHovered ? -2 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        First ChatSpace
                      </motion.h2>
                      <motion.p
                        className="text-sm text-gray-400 font-normal"
                        animate={{ y: isHovered ? -1 : 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                      >
                        Create your first ChatSpace to get started
                      </motion.p>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Input + Button row */}
                    <div className="flex items-center gap-2 p-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                disabled={isLoading}
                                placeholder="Enter server name"
                                className="bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-2 text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-red-400 mt-1" />
                          </FormItem>
                        )}
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="shrink-0 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-colors disabled:opacity-50"
                        disabled={isLoading}
                        type="submit"
                      >
                        {isLoading ? "Creating..." : "Create"}
                      </motion.button>
                    </div>
                  </form>
                </Form>
              </motion.div>

              {/* Top edge highlight */}
              <div
                className="absolute top-0 left-0 right-0 h-px z-[5] pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                }}
              />
            </motion.div>
          </div> </div>

      </div>
    </ScrollArea>
  );
}


export function FileUpload({ onChange, value, endpoint }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const inputId = React.useId();

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
      <div className="relative h-[200px] !min-w-[300px] !w-[400px] rounded-xl">
        {imageError ? (
          <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-400" />
            <span className="sr-only">Image failed to load</span>
          </div>
        ) : (
          <Image
            src={value}
            alt="Upload"
            className="h-full w-full object-cover"
            width={600}
            height={600}
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
      <label htmlFor={inputId} aria-label="Upload server image or file" className={`cursor-pointer ${isUploading ? 'bg-gray-400' : ''} text-white rounded-md flex items-center gap-2 transition-colors`}>
       <span className="sr-only">Upload files</span>
        <div className="relative min-h-[200px] max-h-[200px] h-[200px] !min-w-[300px] !w-[400px] rounded-xl">
          <img src="https://i.pinimg.com/736x/f9/87/31/f987319a7b1de5fa32355efbf35475ae.jpg" alt="" className='h-full w-full object-cover' />
        </div>
        <input
          aria-label='Upload file'
          id={inputId}
          type="file"
          multiple
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

                // const allowedTypes = endpoint === "serverImage" 
                //   ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                //   : ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

                // if (!allowedTypes.includes(file.type)) {
                //   setError(`"${file.name}" has invalid type. Allowed: ${endpoint === "serverImage" ? 'Images only' : 'Images and PDFs'}`);
                //   return;
                // } 
                const allowedTypes = endpoint === "serverImage" ? IMAGE_TYPES : FILE_TYPES;

                if (!allowedTypes.has(file.type)) {
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
