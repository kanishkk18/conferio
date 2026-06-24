'use client';
import { Button } from '../ui/button';

import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Dayjs } from 'dayjs';
import { RadioGroupDemo } from '../radio-group-demo';
import { DropDownCategory } from '../categories/select-category';
import Category from 'interfaces/category';
import Loading from '../common/loading';
import { redirect, useRouter } from 'next/navigation';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from '../ui/animated-modal';
import {
  ArrowRight,
  Calendar,
  CloudUpload,
  Disc2,
  EllipsisIcon,
  Flag,
  Plus,
  PlusCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RiGatsbyLine, RiNextjsLine, RiReactjsLine } from '@remixicon/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PopoverDatePicker from '../ui/popoverPicker';
import { Separator } from '../ui/separator';
// import { FileUploaderDialog } from '../file-manager/files/fileuploader-dialog';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';
import { Upload, X, File, ImageIcon, Video, Music } from 'lucide-react';
import { toast } from 'sonner';
import { formatBytes } from '@/lib/utils';
import { FileUploadCard } from '../file-manager/components/FileUploadCard';
import { ScrollArea } from '../ui/scroll-area';
import CreateEvent from 'pages/events/create/page';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import LazyLoader from '../loader/lazyloader';

interface FileWithPreview extends File {
  preview?: string;
}

export function TaskForm(props: { children?: React.ReactNode }) {
  const { children } = props;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('3');
  const [createdAt, setCreatedAt] = useState<Dayjs | null>(null);
  const [dueTime, setDueTime] = useState<Dayjs | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const isFormValid = title.trim() !== '' && dueTime !== null;
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const Router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    locationType: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleNewTask = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    const taskData = {
      title,
      description,
      priority,
      createdAt: createdAt ? createdAt.toISOString() : null,
      dueTime: dueTime ? dueTime.toISOString() : null,
      category: category ? category : null,
    };

    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        body: JSON.stringify(taskData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating new task:', error);
    }
    setIsLoading(false);
  };

 if (status === 'unauthenticated') {
     redirect('/auth/login');
  }

  const createEventMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/event/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.refresh();
      setIsOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    createEventMutation.mutate(formData);
  };

  const locationOptions = [
    {
      id: 'JITSI_MEET',
      label: 'Conferio',
      logo: 'https://res.cloudinary.com/kanishkkcloud18/image/upload/v1718475378/CONFERIO/gbkp0siuxyro0cgjq9rq.png',
    },
    {
      id: 'GOOGLE_MEET_AND_CALENDAR',
      label: 'Google ',
      logo: 'https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_18_2x.png',
    },
    {
      id: 'ZOOM_MEETING',
      label: 'Zoom',
      logo: 'data:image/png;base64,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',
    },
  ];

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
    setFiles((prev) => [...prev, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'application/*': ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8" />;
    if (mimeType.startsWith('video/')) return <Video className="h-8 w-8" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress (real implementation would use actual upload progress)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Upload successful!');
        // Wait a moment to show 100% progress before closing
        setTimeout(() => {
          setFiles([]);
          setIsOpen(false);
          Router.refresh();
        }, 500);
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch (error) {
      clearInterval(interval);
      toast.error('Upload failed. Please try again.');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (status === 'loading') {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LazyLoader/>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Tabs defaultValue="task" className="">
      <Loading isLoading={isLoading} />
      <Modal>
        <ModalTrigger>
          {/* <Button className="dark:bg-white px-2 rounded-lg flex justify-center items-center ">
            <PlusCircle className="mr-0.5 h-10 w-10 " />
            <p>Add Task</p>
          </Button> */}
          {children}
        </ModalTrigger>
        <ModalBody className=" !max-w-[46%] !min-h-[65%] !h-[70%] !max-h-[90%] dark:bg-neutral-900 !w-[46%]">
          <TabsList className="h-auto gap-3 rounded-none bg-transparent p-0 pt-2 px-4">
            <TabsTrigger
              value="task"
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            >
              Task
            </TabsTrigger>
            <TabsTrigger
              value="drive"
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            >
              Drive
            </TabsTrigger>
            <TabsTrigger
              value="docs"
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            >
              Docs
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            >
              Notes
            </TabsTrigger>
            <TabsTrigger
              value="event"
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            >
              Events
            </TabsTrigger>
          </TabsList>
          <Separator />
          <TabsContent value="task" className=" flex flex-col ">
            <ModalContent className="!px-6 gap-y-4 pb-0">
              <div className="flex justify-start items-center gap-2">
                <DropDownCategory
                  categoryToSend={category}
                  setCategory={setCategory}
                />

                <Select>
                  <SelectTrigger className="w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs">
                    <Disc2 className="h-4 w-4 mr-1" />{' '}
                    <SelectValue placeholder="Task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="px-0 gap-y-2">
                <Input
                  placeholder="Task Name"
                  className="border-none font-semibold !text-xl hover:bg-muted"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                />
                <Textarea
                  placeholder="Add Description"
                  className="border-none text-xs hover:bg-muted h-fit"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                />
              </div>

              <div className="flex justify-start items-center gap-2 ">
                <Select defaultValue="3">
                  <SelectTrigger className="w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
                    <SelectItem value="1">
                      <span className="flex items-center gap-2">
                        <StatusDot className="text-emerald-600" />
                        <span className="truncate">Completed</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="2">
                      <span className="flex items-center gap-2">
                        <StatusDot className="text-blue-500" />
                        <span className="truncate">In Progress</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="3">
                      <span className="flex items-center gap-2">
                        <StatusDot className="text-amber-500" />
                        <span className="truncate">To Do</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-fit !px-1.5 dark:!text-white !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] !text-black overflow-hidden text-xs">
                    <SelectValue placeholder="Assignee" className='!text-white' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-xs py-1 font-normal text-muted-foreground ps-2">
                        Select a user
                      </SelectLabel>
                      <SelectItem value="1">
                        <span className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src="" alt="@reui" />
                            <AvatarFallback>AB</AvatarFallback>
                          </Avatar>
                          <span>Alan Bold</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="2">
                        <span className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src="" alt="@reui" />
                            <AvatarFallback>EJ</AvatarFallback>
                          </Avatar>
                          <span>Ethan James</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="3">
                        <span className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src="" alt="@reui" />
                            <AvatarFallback>NK</AvatarFallback>
                          </Avatar>
                          <span>Nina Clark</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="4">
                        <span className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src="" alt="@reui" />
                            <AvatarFallback>JA</AvatarFallback>
                          </Avatar>
                          <span>Sean Otto</span>
                        </span>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* <PopoverDatePicker date={createdAt} setDate={setCreatedAt} /> */}
                <PopoverDatePicker date={dueTime} setDate={setDueTime} />

                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 [&>span_svg]:text-muted-foreground/80 w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs">
                    <Flag className="h-4 w-4 mr-1" />{' '}
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>

                  <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
                    <SelectItem value="high">
                      <RiReactjsLine size={16} aria-hidden="true" />
                      <span className="truncate">High</span>
                    </SelectItem>

                    <SelectItem value="medium">
                      <RiNextjsLine size={16} aria-hidden="true" />
                      <span className="truncate">Medium</span>
                    </SelectItem>

                    <SelectItem value="low">
                      <RiGatsbyLine size={16} aria-hidden="true" />
                      <span className="truncate">Low</span>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs"
                      aria-label="Open edit menu"
                    >
                      <EllipsisIcon size={16} aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Option 1</DropdownMenuItem>
                    <DropdownMenuItem>Option 2</DropdownMenuItem>
                    <DropdownMenuItem>Option 3</DropdownMenuItem>
                    <DropdownMenuItem>Option 4</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </ModalContent>
            <ModalFooter className="dark:bg-neutral-950 mt-auto">
              <div className="">
                <Button
                  onClick={handleNewTask}
                  disabled={!isFormValid}
                  className={`font-semibold rounded-lg ${
                    isFormValid
                      ? 'text-white bg-[#6347EA] hover:text-white'
                      : 'text-white bg-[#6347EA] cursor-not-allowed'
                  }`}
                >
                  Create Task
                </Button>
              </div>
            </ModalFooter>
          </TabsContent>
          {/* drive */}
          <TabsContent value="drive" className="!h-full">
            {/* <div className="gap-y-4 !h-full min-h-full">
                    <Card
                      {...getRootProps()}
                      className={`border-2 border-dashed p-2 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      {isDragActive ? (
                        <p>Drop the files here...</p>
                      ) : (
                        <div>
                          <p className="text-lg font-medium">Drop files here or click to browse</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Supports images, videos, audio, and documents
                          </p>
                          <Button 
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              open();
                            }}
                          >
                            Select Files
                          </Button>
                        </div>
                      )}
                    </Card>
          
                    {files.length > 0 && (
                      <div className="gap-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Selected Files ({files.length})</h3>
                          <p className="text-sm text-muted-foreground">
                            Total: {formatBytes(totalSize)}
                          </p>
                        </div>
          
                        <div className="gap-y-2 max-h-60 overflow-y-auto">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                              {file.preview ? (
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  className="h-12 w-12 object-cover rounded"
                                />
                              ) : (
                                <div className="h-12 w-12 flex items-center justify-center bg-muted rounded">
                                  {getFileIcon(file.type)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatBytes(file.size)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                disabled={uploading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
          
                        {uploading && (
                          <div className="gap-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} />
                          </div>
                        )}
          
                        <div className="flex gap-2">
                          <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex-1"
                          >
                            {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setFiles([])}
                            disabled={uploading}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                    )}
                  </div> */}
            <div className="relative h-screen w-full overflow-hidden bg-[#020208]">
              <img
                src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon.png"
                alt=""
                className="absolute !-bottom-24 object-cover left-1/2 -translate-x-1/2 w-full h-full "
              />

              <div className="relative z-10 flex items-start justify-center h-full px-4">
                <FileUploadCard />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="event" className="h-full w-full">
            <ScrollArea className="min-h-screen !h-screen !overflow-y-auto w-full py-0">
              <form
                onSubmit={handleSubmit}
                className="!w-full !px-0 flex flex-col justify-between min-h-full !h-full"
              >
                <div className="space-y-6 !w-full py-6 !px-12 min-w-full">
                  <div className="group relative">
                    <label htmlFor="task-event-title" className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-disabled:opacity-50">
                      Event Title
                    </label>
                    <Input
                      id="task-event-title"
                      className="h-10"
                      placeholder="e.g., 30 Minute Meeting"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="group relative">
                    <Label htmlFor="task-event-description" className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-disabled:opacity-50">
                      Description
                    </Label>
                    <Textarea
                      id="task-event-description"
                      rows={1}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description of the meeting"
                    />
                  </div>

                   <div className="group relative">
                    <label htmlFor="task-event-duration" className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-disabled:opacity-50">
                      Duration (min) *
                    </label>
                    <Input
                      id="task-event-duration"
                      className="h-10"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <div className="block text-sm font-medium text-gray-700 mb-2">
                      Location Type *
                    </div>
                    <div className="flex justify-start items-center gap-4">
                      {locationOptions.map((opt) => (
                        <Card
                          key={opt.id}
                          onClick={() =>
                            setFormData({ ...formData, locationType: opt.id })
                          }
                          className={`cursor-pointer w-24 h-20 p-0 flex justify-center items-center  transition-all ${
                            formData.locationType === opt.id
                              ? 'border border-blue-600 shadow-lg'
                              : 'border'
                          }`}
                        >
                          <CardContent className="flex bg-transparent flex-col items-center justify-center gap-y-1 p-0">
                            <Image
                              src={opt.logo}
                              alt={opt.label}
                              width={28}
                              height={28}
                            />
                            <span className="text-sm font-medium">
                              {opt.label}
                            </span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Error if Google not verified */}
                  {error && (
                    <div className="text-red-600 text-sm mt-2">
                      {error}{' '}
                      <Link
                        href="/settings"
                        className="underline text-blue-600"
                      >
                        Go to settings
                      </Link>
                    </div>
                  )}
                </div>
                <div className="dark:bg-neutral-950 bg-gray-100 !mt-auto flex justify-end px-6 items-end h-full py-5">
                  <Button
                    type="submit"
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </TabsContent>
        </ModalBody>
      </Modal>
    </Tabs>
  );
}

function StatusDot({ className }: { className?: string }) {
  return (
    <svg
      width="8"
      height="8"
      fill="currentColor"
      viewBox="0 0 8 8"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
}
