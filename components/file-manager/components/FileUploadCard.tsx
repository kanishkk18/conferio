import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, File, Image, Video, Music, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface FileWithPreview extends File {
  preview?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (mimeType: string, fileName: string) => {
  if (mimeType.startsWith('image/')) {
    return <Image className="h-12 w-12 text-primary" />;
  }
  if (mimeType.startsWith('video/')) {
    return <Video className="h-12 w-12 text-accent" />;
  }
  if (mimeType.startsWith('audio/')) {
    return <Music className="h-12 w-12 text-purple-400" />;
  }
  if (fileName.endsWith('.txt')) {
    return <FileText className="h-12 w-12 text-blue-400" />;
  }
  return <File className="h-12 w-12 text-muted-foreground" />;
};

const FileIconDisplay = ({ file }: { file: File }) => {
  // Create a more stylized file icon display
  return (
    <div className="relative size-32 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
      <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
        {file.type.startsWith('image/') && (file as FileWithPreview).preview ? (
          <img
            src={(file as FileWithPreview).preview}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            {getFileIcon(file.type, file.name)}
            <div className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              {file.name.split('.').pop()?.slice(0, 4)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface FileUploadCardProps {
  onClose?: () => void;
}

export function FileUploadCard() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map((file) => {
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    });
    setFiles(filesWithPreview);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'text/*': ['.txt'],
      'application/*': ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    },
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 3000));

      clearInterval(interval);
      setUploadProgress(100);

      toast.success('Upload successful!');

      setTimeout(() => {
        setFiles([]);
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      clearInterval(interval);
      toast.error('Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="bg-black/30 mt-10 rounded-3xl border border-white/20 p-8 relative overflow-hidden">
        {/* Close button */}


        {files.length === 0 ? (
          <div
            {...getRootProps()}
            className={`  p-8 text-center cursor-pointer transition-all ${isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-white/20 hover:border-white/40'
              }`}
          >
            <input {...getInputProps()} />
            <div className="gap-y-4">
              <div className="mx-auto  size-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <File className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-xl font-semibold mb-2">
                  {isDragActive ? 'Drop your file here' : 'Drop file to upload'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse from your computer
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <FileIconDisplay file={files[0]} />

              <div className="text-start">
                <h3 className="text-xl capitalize font-medium mb-1 truncate max-w-md">
                  {files[0].name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(files[0].size)}
                </p>
              </div>
            </div>

            {uploading && (
              <div className="gap-y-3 bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin-slow" />
                    <span className="text-sm font-medium">Uploading ...</span>
                  </div>
                  <span className="text-4xl font-bold tabular-nums">
                    {Math.round(uploadProgress)} %
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {!uploading && (
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  className="flex-1 h-12 text-base font-semibold"
                  size="lg"
                >
                  Upload File
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFiles([])}
                  className="h-12 px-6"
                  size="lg"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
