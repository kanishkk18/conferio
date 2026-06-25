// "use client"

// import { useEffect, useState } from 'react';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import {
//   X,
//   Tag,
//   Paperclip,
//   MessageSquare,
//   CheckSquare,
//   User,
//   Plus,
//   Trash2,
//   Edit2,
//   Clock,
//   MoreHorizontal,
//   Link as LinkIcon,
//   File,
//   MessageSquareIcon,
//   Ellipsis,
//   MoveUpRight,
//   EditIcon,
//   EllipsisIcon,
//   Check,
//   MusicIcon,
//   Disc,
//   Users,
//   ExternalLink,
//   Calendar1,
//   Flag,
//   TagIcon,
//   Hourglass
// } from 'lucide-react';
// import { format } from 'date-fns';
// import { useSession } from 'next-auth/react';
// import { FileUpload } from './file-upload';
// import { CommentWithAttachments } from './comment-with-attachments';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from '@/components/ui/resizable';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Send,
//   Play,
//   Square,
//   Image as ImageIcon,
//   FileText
// } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';
// import { cn } from '@/lib/utils';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// // import { Calendar as CalendarComponent } from '@/components/ui/calendar';
// // import TaskForm from './TaskForm';
// import Image from 'next/image';
// import { Separator } from '../ui/separator';
// // import { DriveButton } from '../integrations/google/DriveButton';
// // import { JiraPanel } from '@/components/integrations/jira/JiraPanel'
// import { useId } from "react"
// import { subDays, subMonths, subYears } from "date-fns"
// import { Calendar } from "@/components/ui/calendar"
// import { CalendarIcon } from 'lucide-react'
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/board-accordation';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"

// interface TaskModalProps {
//   task: any;
//   boardId: string;
//   boardMembers: any[];
//   labels: any[];
//   closeModal: () => void;
// }


// export function TaskModal({ task, boardId, boardMembers, labels, closeModal }: TaskModalProps) {
//   // const { data: session } = useSession();
//   const queryClient = useQueryClient();
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedTask, setEditedTask] = useState(task);
//   const [newComment, setNewComment] = useState('');
//   const [newSubtask, setNewSubtask] = useState('');
//   const id = useId()
//   const today = new Date()
//   const yesterday = subDays(today, 1)
//   const lastWeek = subDays(today, 7)
//   const lastMonth = subMonths(today, 1)
//   const lastYear = subYears(today, 1)

//   // Keep local Date state in sync with the external string value
//   const [date, setDate] = useState<Date | undefined>(
//     editedTask.dueDate ? new Date(editedTask.dueDate) : undefined
//   )
//   const [month, setMonth] = useState<Date>(date ?? today)
//   const [open, setOpen] = useState(false)


//   const updateTaskMutation = useMutation({
//     mutationFn: async (updates: any) => {
//       const res = await fetch(`/api/tasks/${task.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updates),
//       });
//       if (!res.ok) throw new Error('Failed to update task');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//       setIsEditing(true);
//     },
//   });

//   const createCommentMutation = useMutation({
//     mutationFn: async (content: string) => {
//       const res = await fetch(`/api/tasks/${task.id}/comments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ content }),
//       });
//       if (!res.ok) throw new Error('Failed to add comment');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//       setNewComment('');
//     },
//   });

//   // Add this mutation with your other mutations
//   const setCoverImageMutation = useMutation({
//     mutationFn: async (coverImage: string | null) => {
//       const res = await fetch(`/api/tasks/${task.id}/cover`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ coverImage }),
//       });
//       if (!res.ok) throw new Error('Failed to set cover image');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//     },
//   });

//   const deleteAttachmentMutation = useMutation({
//     mutationFn: async (attachmentId: string) => {
//       const res = await fetch(`/api/attachments/${attachmentId}`, {
//         method: 'DELETE',
//       });
//       if (!res.ok) throw new Error('Failed to delete attachment');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//     },
//   });

//   const updatePriorityMutation = useMutation({
//     mutationFn: async (priority: string) => {
//       const res = await fetch(`/api/tasks/${task.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ priority }),
//       });
//       if (!res.ok) throw new Error('Failed to update priority');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//     },
//   });

//   const createSubtaskMutation = useMutation({
//     mutationFn: async (title: string) => {
//       const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title }),
//       });
//       if (!res.ok) throw new Error('Failed to add subtask');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//       setNewSubtask('');
//     },
//   });

//   const toggleSubtaskMutation = useMutation({
//     mutationFn: async ({ subtaskId, isCompleted }: { subtaskId: string; isCompleted: boolean }) => {
//       const res = await fetch(`/api/subtasks/${subtaskId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ isCompleted }),
//       });
//       if (!res.ok) throw new Error('Failed to update subtask');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//     },
//   });

//   const assignUserMutation = useMutation({
//     mutationFn: async (userId: string) => {
//       const isAssigned = task.assignees.some((a: any) => a.user.id === userId);
//       const res = await fetch(`/api/tasks/${task.id}/assignees${isAssigned ? `?userId=${userId}` : ''}`, {
//         method: isAssigned ? 'DELETE' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         ...(isAssigned ? {} : { body: JSON.stringify({ userId }) }),
//       });
//       if (!res.ok) throw new Error('Failed to update assignees');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//     },
//   });

//   const addLabelMutation = useMutation({
//     mutationFn: async (labelId: string) => {
//       const hasLabel = task.labels.some((l: any) => l.label.id === labelId);
//       const res = await fetch(`/api/tasks/${task.id}/labels${hasLabel ? `?labelId=${labelId}` : ''}`, {
//         method: hasLabel ? 'DELETE' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         ...(hasLabel ? {} : { body: JSON.stringify({ labelId }) }),
//       });
//       if (!res.ok) throw new Error('Failed to update labels');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//     },
//   });

//   useEffect(() => {
//     if (editedTask.dueDate) {
//       const parsed = new Date(editedTask.dueDate)
//       setDate(parsed)
//       setMonth(parsed)
//     } else {
//       setDate(undefined)
//       setMonth(today)
//     }
//   }, [editedTask.dueDate])

//   const handleSelect = (newDate: Date | undefined) => {
//     if (!newDate) return
//     setDate(newDate)
//     setEditedTask((prev) => ({
//       ...prev,
//       dueDate: format(newDate, "yyyy-MM-dd"),
//     }))
//     setOpen(false) // remove this if you want the popover to stay open
//   }

//   const handlePreset = (presetDate: Date) => {
//     setDate(presetDate)
//     setMonth(presetDate)
//     setEditedTask((prev) => ({
//       ...prev,
//       dueDate: format(presetDate, "yyyy-MM-dd"),
//     }))
//     setOpen(false) // remove this if you want the popover to stay open
//   }

//   const completedSubtasks = task.subtasks.filter((s: any) => s.isCompleted).length;
//   const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;


//   return (

//     <Dialog open={true} onOpenChange={() => closeModal()}>
//       <DialogContent className="max-h-[96%] border lg:h-[96%] h-[98%] md:min-w-[92rem] lg:min-w-[92.5rem] rounded-lg max-w-[92.5rem] overflow-hidden !p-0 dark:border-[#333333] bg-white dark:bg-[#111111] shadow-none">
//         <div className="px-2 items-center border-b h-10 flex justify-between border-[#eee] dark:border-[#222]">
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button

//                 variant="outline"
//                 size='icon'
//                 className=""
//               >
//                 <EllipsisIcon className="pointer-events-none" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-[250px] !p-0">
//               <div className=""> hello</div>
//             </PopoverContent>
//           </Popover>

//           <div className="">
//             <p className="text-xs dark:text-white text-gray-700"> created {task.assignees.length > 0 ? task.assignees[0].user.name : 'Unassigned'} - {new Date(task.createdAt).toDateString()}</p>
//           </div>
//         </div>
//         <ResizablePanelGroup
//           direction="horizontal"
//           className="h-full w-full border-none !pt-0 relative"
//         >
//           <ResizablePanel>
//             <ResizablePanelGroup direction="vertical">
//               <ScrollArea className="h-full overflow-auto">
//                 <ResizablePanel
//                   defaultSize={50}
//                   maxSize={65}
//                   minSize={35}
//                   className="flex min-h-48 h-48 items-start"
//                 >
//                   <div className="h-full w-full flex-grow">

//                     <Image
//                       className="h-full w-full object-cover "
//                       src={task.coverImage || "https://i.pinimg.com/736x/f5/25/d8/f525d8e2a12f9071be8bd1ad8b0082c5.jpg"}
//                       alt=""
//                       height={1000}
//                       width={1000}
//                     />
//                   </div>
//                 </ResizablePanel>
//                 <ResizableHandle className="bg-transparent border-none" />

//                 <ResizablePanel>
//                   <ResizablePanelGroup direction="horizontal" className='!min-w-full flex justify-center '>
//                     <ResizablePanel
//                       defaultSize={60}
//                       className="max-w-[65%] min-w-[65%] px-6 pt-5 gap-y-4"
//                     >
//                       <>
//                         {!isEditing ? (
//                           <button type="button"
//                             onClick={() => setIsEditing(true)}
//                             className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
//                           >
//                             <Edit2 className="size-3" />
//                           </button>
//                         ) : (
//                           <button type="button"
//                             onClick={() => updateTaskMutation.mutate(editedTask)}
//                             className="  p-1   bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
//                           >
//                             <Check className="size-3" />
//                           </button>
//                         )}

//                         <Input
//                           type="text"
//                           value={editedTask.title}
//                           onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
//                           className="!text-3xl border-none px-[1px] font-semibold dark:text-white/70 dark:hover:bg-[#222222]"
//                         />

//                         <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#7B7B7B]">
//                           <div className="flex gap-4 justify-between items-center w-full ">
//                             <div className="flex items-center gap-2">
//                               <Disc className='size-4' />
//                               <p className='text-sm capitalize'>
//                                 Status
//                               </p>
//                             </div>
//                             <div className=" w-[60%] py-1.5 px-2 rounded-sm hover:bg-[#222222]">
//                               <p>empty</p>
//                             </div>
//                           </div>
//                           <div className="flex gap-4 justify-between items-center w-full ">
//                             <div className="flex items-center gap-2">
//                               <Users className='size-4' />
//                               <p className='text-sm capitalize'>
//                                 Assignees
//                               </p>
//                             </div>
//                             <div className=" w-[60%] py-1.5 px-2 rounded-sm hover:bg-[#222222]">




//                               <div className="relative flex group">
//                                 {task.assignees.length > 0 ? (
//                                   task.assignees.map((assignee: any) => (
//                                     <div key={assignee.id} className="flex items-center gap-2 relative">
//                                       <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
//                                         {assignee.user.name
//                                           ? assignee.user.name.charAt(0).toUpperCase()
//                                           : <User className="size-3" />}
//                                       </div>

//                                     </div>
//                                   ))
//                                 ) : (
//                                   <p>Unassigned</p>
//                                 )}
//                                 <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 hidden group-hover:block z-10">
//                                   {boardMembers.reduce((acc: any[], member: any) => {
//                                     if (!task.assignees.some((a: any) => a.user.id === member.user.id)) {
//                                       acc.push(
//                                         <button type="button"
//                                           key={member.user.id}
//                                           onClick={() => assignUserMutation.mutate(member.user.id)}
//                                           className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-left text-sm"
//                                         >
//                                           <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
//                                             {member.user.name ? member.user.name.charAt(0).toUpperCase() : <User className="size-3" />}
//                                           </div>
//                                           {member.user.name}
//                                         </button>
//                                       );
//                                     }
//                                     return acc;
//                                   }, [])}
//                                 </div>
//                                 {/* <button type="button" 
//         onClick={() => assignUserMutation.mutate(assignee.user.id)}
//         className="text-red-600 -mt-2 -ml-2 absolute inset-0 "
//       >
//         <X className="size-3" />
//       </button> */}
//                               </div>
//                             </div>

//                           </div>
//                           <div className="flex gap-4 justify-between items-center w-full ">
//                             <div className="flex items-center gap-2">
//                               <Flag className='size-4' />
//                               <p className='text-sm  capitalize'>
//                                 Priority
//                               </p>
//                             </div>
//                             <div className="w-[60%] py-1.5 px-2 rounded-md hover:bg-[#222222]">
//                               {/* <p className={`${task.priority === 'URGENT' ? ' text-red-700' : task.priority === 'HIGH' ? ' text-orange-700' : task.priority === 'MEDIUM' ? ' text-yellow-700' : ' text-green-700'} text-sm capitalize`}>{task.priority}</p> */}
//                               <div>
//                                 <div className="relative">
//                                   <select
//                                     value={task.priority}
//                                     onChange={(e) => updatePriorityMutation.mutate(e.target.value)}
//                                     disabled={updatePriorityMutation.isPending}
//                                     className={`w-full  bg-transparent text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 ${task.priority === 'URGENT' ? ' text-red-700' :
//                                       task.priority === 'HIGH' ? ' text-orange-700' :
//                                         task.priority === 'MEDIUM' ? ' text-yellow-700' :
//                                           ' text-green-700'
//                                       }`}
//                                   >
//                                     <option value="LOW">🟢 Low</option>
//                                     <option value="MEDIUM">🟡 Medium</option>
//                                     <option value="HIGH">🟠 High</option>
//                                     <option value="URGENT">🔴 Urgent</option>
//                                   </select>
//                                 </div>
//                               </div></div>
//                           </div>

//                           <div className="flex gap-4 justify-between items-center w-full ">
//                             <div className="flex items-center gap-2">
//                               <CalendarIcon className='size-4' />
//                               <p className='text-sm capitalize'>
//                                 Dates
//                               </p>
//                             </div>
//                             <div className=" w-[60%] rounded-sm hover:bg-[#222222]">

//                               {/* <input
//                                 type="date"
//                                 value={editedTask.dueDate ? format(new Date(editedTask.dueDate), "yyyy-MM-dd") : ''}
//                                 onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                               /> */}
//                               <Popover open={open} onOpenChange={setOpen}>
//                                 <PopoverTrigger asChild className='!py-0  flex w-fit'>
//                                   <Button
//                                     id={id}
//                                     variant="outline"
//                                     className="group/pick-date w-36 py-0 flex !gap-0 border-none !bg-transparent justify-between "
//                                   >
//                                     <CalendarIcon
//                                       aria-hidden="true"
//                                       className="dark:text-[#B4B4B4] group-hover:text-foreground shrink-0 transition-colors"
//                                     /> <span className={cn("truncate dark:text-[#B4B4B4] font-normal", !date && "text-muted-foreground")}>
//                                       {date ? format(date, "LLL dd, y") : "Pick a date"}
//                                     </span>

//                                   </Button>
//                                 </PopoverTrigger>

//                                 <PopoverContent align="start" className="w-auto p-0">
//                                   <Card className="p-0">
//                                     <CardContent className="p-0">
//                                       <div className="flex max-sm:flex-col">
//                                         {/* Presets sidebar */}
//                                         <div className="relative py-4 max-sm:order-1 max-sm:border-t sm:w-32">
//                                           <div className="h-full sm:border-e">
//                                             <div className="flex flex-col px-2 gap-1">
//                                               <Button
//                                                 size="sm"
//                                                 variant="ghost"
//                                                 className="w-full justify-start"
//                                                 onClick={() => handlePreset(today)}
//                                               >
//                                                 Today
//                                               </Button>
//                                               <Button
//                                                 size="sm"
//                                                 variant="ghost"
//                                                 className="w-full justify-start"
//                                                 onClick={() => handlePreset(yesterday)}
//                                               >
//                                                 Yesterday
//                                               </Button>
//                                               <Button
//                                                 size="sm"
//                                                 variant="ghost"
//                                                 className="w-full justify-start"
//                                                 onClick={() => handlePreset(lastWeek)}
//                                               >
//                                                 Last week
//                                               </Button>
//                                               <Button
//                                                 size="sm"
//                                                 variant="ghost"
//                                                 className="w-full justify-start"
//                                                 onClick={() => handlePreset(lastMonth)}
//                                               >
//                                                 Last month
//                                               </Button>
//                                               <Button
//                                                 size="sm"
//                                                 variant="ghost"
//                                                 className="w-full justify-start"
//                                                 onClick={() => handlePreset(lastYear)}
//                                               >
//                                                 Last year
//                                               </Button>
//                                             </div>
//                                           </div>
//                                         </div>

//                                         {/* Calendar */}
//                                         <Calendar
//                                           mode="single"
//                                           selected={date}
//                                           onSelect={handleSelect}
//                                           month={month}
//                                           onMonthChange={setMonth}

//                                           initialFocus
//                                         />
//                                       </div>
//                                     </CardContent>
//                                   </Card>
//                                 </PopoverContent>
//                               </Popover>
//                             </div>
//                           </div>
//                           <div className="flex gap-4 justify-between items-center w-full ">
//                             <div className="flex items-center gap-2">
//                               <Hourglass className='size-4' />
//                               <p className='text-sm capitalize'>
//                                 Time estimate
//                               </p>
//                             </div>
//                             <div className=" w-[60%] py-1.5 px-2 rounded-sm hover:bg-[#222222]">
//                               <p className='dark:text-[#B4B4B4]'>2 h</p>
//                             </div>
//                           </div>
//                           <div className="flex gap-4 justify-between items-center w-full ">
//                             <div className="flex items-center gap-2">
//                               <TagIcon className='size-4' />
//                               <p className='text-sm capitalize'>
//                                 Tags
//                               </p>
//                             </div>
//                             <div className=" w-[60%] py-1.5 px-2 rounded-sm hover:bg-[#222222]">
//                               <div className="flex flex-wrap gap-2">
//                                 {task.labels.map(({ label }: any) => (
//                                   <span
//                                     key={label.id}
//                                     className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
//                                     style={{
//                                       backgroundColor: `${label.color}20`,
//                                       color: label.color,
//                                     }}
//                                   >
//                                     {label.name}
//                                     <button type="button"
//                                       onClick={() => addLabelMutation.mutate(label.id)}
//                                       className="hover:bg-black/10 rounded-full p-0.5"
//                                     >
//                                       <X className="size-3" />
//                                     </button>
//                                   </span>
//                                 ))}

//                                 <div className="relative group">
//                                   <button type="button" className="inline-flex items-center gap-1 px-2 py-1 border rounded-full hover:border-indigo-500 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors text-xs">
//                                     <Plus className="size-3" />
//                                     Add label
//                                   </button>
//                                   <div className="absolute top-full left-0 mt-1 rounded-lg shadow-lg p-2 hidden group-hover:block z-10 min-w-[150px]">
//                                     {labels.reduce((acc: any[], label: any) => {
//                                       if (!task.labels.some((tl: any) => tl.label.id === label.id)) {
//                                         acc.push(
//                                           <button type="button"
//                                             key={label.id}
//                                             onClick={() => addLabelMutation.mutate(label.id)}
//                                             className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-left text-sm"
//                                           >
//                                             <span
//                                               className="size-3 rounded-full"
//                                               style={{ backgroundColor: label.color }}
//                                             />
//                                             {label.name}
//                                           </button>
//                                         );
//                                       }
//                                       return acc;
//                                     }, [])}
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>


//                         <div className="flex gap-2">

//                           {/* <div>
//                             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Due Date</h4>
//                             {isEditing ? (
//                               <input
//                                 type="datetime-local"
//                                 value={editedTask.dueDate ? format(new Date(editedTask.dueDate), "yyyy-MM-dd'T'HH:mm") : ''}
//                                 onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                               />
//                             ) : (
//                               <div className="flex items-center gap-2 text-sm text-gray-700">
//                                 <Clock className="size-4" />
//                                 {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy HH:mm') : 'No due date'}
//                               </div>
//                             )}
//                           </div> */}

//                         </div>

//                         <div className=" mt-2">
//                           <Separator className='h-[0.8px]' />
//                           <Textarea
//                             value={editedTask.description || ''}
//                             onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
//                             className="w-full placeholder:text-[#434343] dark:placeholder:text-[#777777] p-3 border-none dark:hover:bg-[#191919] outline-none rounded-lg  min-h-[100px]"
//                             placeholder="Write, press 'Space' for AI, '/' for commands"
//                           />
//                         </div>
//                         {/* <div>

//                           <div className="grid grid-cols-2 gap-3 mt-4">
//                             {task.attachments.map((attachment: any) => (
//                               <div key={attachment.id} className="relative group">



//                                 {attachment.mimeType?.startsWith('image/') && (
//                                   <button
//                                     onClick={() => {
//                                       const isCurrentCover = task.coverImage === attachment.url;
//                                       setCoverImageMutation.mutate(isCurrentCover ? null : attachment.url);
//                                     }}
//                                     className={`absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${task.coverImage === attachment.url
//                                       ? 'bg-yellow-100 text-yellow-700'
//                                       : 'bg-white text-gray-600 hover:text-yellow-600'
//                                       }`}
//                                     title={task.coverImage === attachment.url ? 'Remove cover' : 'Set as cover'}
//                                   >
//                                     {task.coverImage === attachment.url ? (
//                                       <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
//                                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                                       </svg>
//                                     ) : (
//                                       <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
//                                       </svg>
//                                     )}
//                                   </button>
//                                 )}

//                                 <button
//                                   onClick={(e) => {
//                                     e.preventDefault();
//                                     if (confirm('Delete this attachment?')) {
//                                       deleteAttachmentMutation.mutate(attachment.id);
//                                     }
//                                   }}
//                                   className="absolute bottom-2 right-2 p-1.5 bg-white text-red-600 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-opacity"
//                                 >
//                                   <Trash2 className="size-4" />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>

//                           {task.coverImage && (
//                             <div className="mt-4">
//                               <p className="text-xs text-gray-500 mb-2">Current Cover:</p>
//                               <div className="relative w-full h-32 rounded-lg overflow-hidden">
//                                 <img src={task.coverImage} alt="Cover" className="w-full h-full object-cover" />
//                                 <button
//                                   onClick={() => setCoverImageMutation.mutate(null)}
//                                   className="absolute top-2 right-2 p-1.5 bg-white/80 text-red-600 rounded-lg hover:bg-white"
//                                 >
//                                   <X className="size-4" />
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                         </div> */}

//                         <Accordion type="single" collapsible className="w-full">
//                           <AccordionItem value="attachment">
//                             <AccordionTrigger className='flex justify-start items-center dark:hover:bg-[#222] py-2 rounded-md hover:bg-[#f5f5f5]' >
//                               <div className="flex justify-start items-center gap-2 w-full">
//                                 <h3 className="text-sm font-semibold flex items-center gap-2 dark:text-white/70">
//                                   Subtasks
//                                 </h3>
//                                 <span
//                                   data-testid="subtasks-header"
//                                   className="text-xs font-normal text-mid-grey dark:text-[#555]"
//                                 >
//                                   {`(${completedSubtasks} of ${task.subtasks.length})`}
//                                 </span>

//                                 <div className="w-[12%] dark:bg-gray-200 bg-[#333] rounded-full h-1 ">
//                                   <div
//                                     className="bg-indigo-600 h-1 rounded-full transition-all"
//                                     style={{ width: `${progress}%` }}
//                                   >
//                                   </div>
//                                 </div>
//                               </div>
//                             </AccordionTrigger>
//                             <AccordionContent className='border dark:border-[#333] rounded-lg p-3 mt-3'>
//                               <div className="gap-y-2">
//                                 {task.subtasks.map((subtask: any) => (
//                                   <div
//                                     key={subtask.id}
//                                     className="flex justify-center items-center gap-3 p-2 hover:bg-[#333] rounded-lg group"
//                                   >
//                                     <input
//                                       type="checkbox"
//                                       aria-label={subtask.title}
//                                       checked={subtask.isCompleted}
//                                       onChange={(e) => toggleSubtaskMutation.mutate({
//                                         subtaskId: subtask.id,
//                                         isCompleted: e.target.checked
//                                       })}
//                                       className="size-4 text-indigo-600  bg-transparent !rounded-full border-gray-300 focus:ring-indigo-500"
//                                     />
//                                     <span className={`text-sm flex-1 ${subtask.isCompleted ? 'line-through text-gray-400' : 'text-gray-700 dark:text-white/70'}`}>
//                                       {subtask.title}
//                                     </span>
//                                     <button type="button"
//                                       // onClick={(e) => {
//                                       //   e.preventDefault();
//                                       //   if (confirm('Delete this subtask?')) {
//                                       //     deleteSubtaskMutation.mutate(subtask.id);
//                                       //   }
//                                       // }}
//                                       className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-600 rounded">
//                                       <Trash2 className="size-3" />
//                                     </button>
//                                   </div>
//                                 ))}

//                                 <div className="flex gap-2 mt-3">
//                                   <input
//                                     type="text"
//                                     value={newSubtask}
//                                     onChange={(e) => setNewSubtask(e.target.value)}
//                                     onKeyDown={(e) => {
//                                       if (e.key === 'Enter' && newSubtask.trim()) {
//                                         createSubtaskMutation.mutate(newSubtask);
//                                       }
//                                     }}
//                                     placeholder="Add a subtask..."
//                                     className="flex-1 px-3 py-1 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-transparent hover:dark:bg-[#222]"
//                                   />
//                                   <button type="button"
//                                     onClick={() => newSubtask.trim() && createSubtaskMutation.mutate(newSubtask)}
//                                     className="  p-1   bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
//                                   >
//                                     <Plus className="size-4" />
//                                   </button>
//                                 </div>
//                               </div>
//                             </AccordionContent>
//                           </AccordionItem>
//                         </Accordion>

//                         <Accordion type="single" collapsible className="w-full">
//                           <AccordionItem value="attachment">
//                             <AccordionTrigger >
//                               <div className="flex justify-between items--center w-full">
//                                 <div className="flex items-center gap-2">

//                                   <p className="font-bold dark:text-white/70">
//                                     Attachments
//                                   </p>
//                                   {task.attachments.length > 0 && (
//                                     <span className=" text-xs">
//                                       {task.attachments.length}
//                                     </span>
//                                   )}
//                                 </div>
//                                 <FileUpload
//                                   taskId={task.id}
//                                   type="task"
//                                   onUploadComplete={() => {
//                                     queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//                                   }}
//                                 />
//                               </div>
//                             </AccordionTrigger>
//                             <AccordionContent>
//                               <div className=" grid grid-cols-4 gap-3 mt-4">

//                                 {task.attachments.map((attachment: any) => (

//                                   <Card key={attachment.id} className="relative mx-auto w-full pt-0 group border dark:border-[#333] bg-transparent rounded-md overflow-hidden">

//                                     <div className="absolute  flex items-center gap-0 border dark:border-white/20 bg-black rounded-md mr-1 w-fit h-fit top-1 left-auto inset-0 z-50 ">
//                                       <Button
//                                         onClick={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')}
//                                         variant="secondary"
//                                         size="icon"
//                                         className="  p-1 h-6 w-6 bg-transparent text-white/70"
//                                       >
//                                         <ExternalLink className="h-2 w-2 text-white/70 cursor-pointer" />
//                                       </Button>
//                                       <Button
//                                         variant="secondary"
//                                         size="icon"
//                                         className="  p-1   h-6 w-6 bg-transparent text-white/70"
//                                       >
//                                         <Ellipsis />
//                                       </Button>
//                                     </div>

//                                     {attachment.mimeType?.startsWith('image/') ? (
//                                       <Image
//                                         onClick={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')}
//                                         src={attachment.url}
//                                         alt=""
//                                         className="relative z-20 aspect-video w-full object-cover"
//                                         height={1000}
//                                         width={1000}
//                                       />
//                                     ) : (
//                                       <File className="size-5 text-indigo-600" />
//                                     )}

//                                     <CardHeader className='!px-2 !py-2'>

//                                       <CardTitle className=" font-normal">{attachment.filename.slice(0, 18)}</CardTitle>
//                                       <CardDescription>
//                                         <p className="flex items-center gap-2 text-xs text-gray-500"> {new Date(attachment.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} at {new Date(attachment.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
//                                         {/* <p>{attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'} </p> */}
//                                       </CardDescription>
//                                     </CardHeader>

//                                     {/* {attachment.mimeType?.startsWith('image/') && (
//                                 <button
//                                   onClick={() => {
//                                     const isCurrentCover = task.coverImage === attachment.url;
//                                     setCoverImageMutation.mutate(isCurrentCover ? null : attachment.url);
//                                   }}
//                                   className={` p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${task.coverImage === attachment.url
//                                     ? 'bg-yellow-100 text-yellow-700'
//                                     : 'bg-white text-gray-600 hover:text-yellow-600'
//                                     }`}
//                                   title={task.coverImage === attachment.url ? 'Remove cover' : 'Set as cover'}
//                                 >
//                                   {task.coverImage === attachment.url ? (
//                                     <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
//                                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                                     </svg>
//                                   ) : (
//                                     <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
//                                     </svg>
//                                   )}
//                                 </button>
//                               )}

//                               <button
//                                 onClick={(e) => {
//                                   e.preventDefault();
//                                   if (confirm('Delete this attachment?')) {
//                                     deleteAttachmentMutation.mutate(attachment.id);
//                                   }
//                                 }}
//                                 className="absolute bottom-2 right-2 p-1.5 bg-white text-red-600 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-opacity"
//                               >
//                                 <Trash2 className="size-4" />
//                               </button> */}
//                                   </Card>
//                                 ))}
//                               </div>
//                             </AccordionContent>
//                           </AccordionItem>
//                         </Accordion>
//                         {/* {task.coverImage && (
//                           <div className="mt-4">
//                             <p className="text-xs text-gray-500 mb-2">Current Cover:</p>
//                             <div className="relative w-full h-32 rounded-lg overflow-hidden">
//                               <img src={task.coverImage} alt="Cover" className="w-full h-full object-cover" />
//                               <button
//                                 onClick={() => setCoverImageMutation.mutate(null)}
//                                 className="absolute top-2 right-2 p-1.5 bg-white/80 text-red-600 rounded-lg hover:bg-white"
//                               >
//                                 <X className="size-4" />
//                               </button>
//                             </div>
//                           </div>
//                         )} */}

//                       </>
//                     </ResizablePanel>
//                   </ResizablePanelGroup>
//                 </ResizablePanel>
//               </ScrollArea>
//             </ResizablePanelGroup>
//           </ResizablePanel>
//           <ResizableHandle className="dark:bg-neutral-900" />
//           <ResizablePanel
//             defaultSize={30}
//             maxSize={30}
//             className="dark:bg-neutral-950"
//           >
//             <ScrollArea className="h-full overflow-auto px-4 py-6 ">
//               <div className="flex justify-between items-start w-full">
//                 <span className="flex items-center gap-2">
//                   {' '}
//                   <MessageSquareIcon className="text-white/70" />{' '}
//                   <p className=" text-white/70 font-medium">
//                     Comments and activity
//                   </p>
//                 </span>
//                 <Button
//                   variant="default"
//                   className=" text-white bg-neutral-900"
//                 >
//                   Show details
//                 </Button>
//               </div>


//               <div className="gap-y-4">
//                 {task.activities?.map((activity: any) => (
//                   <div key={activity.id} className="flex gap-3">
//                     <div className="size-8 rounded-full flex items-center justify-center flex-shrink-0">
//                       {activity.user.image ? (
//                         <img src={activity.user.image} alt="" className="size-8 rounded-full" />
//                       ) : (
//                         <User className="size-4 text-gray-600" />
//                       )}
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm text-gray-700">
//                         <span className="font-medium text-gray-900">{activity.user.name}</span>
//                         {' '}{activity.description}
//                       </p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {format(new Date(activity.createdAt), 'MMM d, yyyy HH:mm')}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="space-y-6">
//                 Description
//                 <div>
//                   <CommentWithAttachments
//                     taskId={task.id}
//                     comments={task.boardComments || []}
//                     onAddComment={(content, attachments) => {
//                       // Create comment with attachments
//                       fetch(`/api/tasks/${task.id}/comments`, {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify({ content, attachments }),
//                       }).then(() => {
//                         queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//                       });
//                     }}
//                     onDeleteComment={(commentId) => {
//                       if (confirm('Delete this comment?')) {
//                         fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
//                           .then(() => queryClient.invalidateQueries({ queryKey: ['board', boardId] }));
//                       }
//                     }}
//                   />
//                 </div>
//               </div>
//             </ScrollArea>
//           </ResizablePanel>
//         </ResizablePanelGroup>
//       </DialogContent>
//     </Dialog>
//   );
// }


// "use client"

// import { useEffect, useState } from 'react';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import {
//   X,
//   Paperclip,
//   MessageSquare,
//   User,
//   Plus,
//   Trash2,
//   Edit2,
//   Check,
//   Users,
//   ExternalLink,
//   Flag,
//   TagIcon,
//   Hourglass,
//   Ellipsis,
//   File,
//   MessageSquareIcon,
//   MessageCircleDashed,
// } from 'lucide-react';
// import { format } from 'date-fns';
// import { FileUpload } from './file-upload';
// import { CommentWithAttachments } from './comment-with-attachments';
// import {
//   Dialog,
//   DialogContent,
// } from '@/components/ui/dialog';
// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from '@/components/ui/resizable';
// import { useSSE } from 'hooks/useSSE';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { cn } from '@/lib/utils';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from '@/components/animate-ui/components/radix/dropdown-menu';
// import Image from 'next/image';
// import { Separator } from '../ui/separator';
// import { useId } from "react"
// import { subDays, subMonths, subYears } from "date-fns"
// import { Calendar } from "@/components/ui/calendar"
// import { CalendarIcon, Disc } from 'lucide-react'
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/board-accordation';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible"
// import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface TaskModalProps {
//   task: any;
//   boardId: string;
//   boardMembers: any[];
//   labels: any[];
//   closeModal: () => void;
// }

// // ─── MetaRow ──────────────────────────────────────────────────────────────────
// // Generic two-column label + value row used in the metadata grid

// interface MetaRowProps {
//   icon: React.ReactNode;
//   label: string;
//   children: React.ReactNode;
// }

// function MetaRow({ icon, label, children }: MetaRowProps) {
//   return (
//     <div className="flex gap-4 justify-between items-center w-full">
//       <div className="flex items-center gap-2">
//         {icon}
//         <p className="text-sm capitalize">{label}</p>
//       </div>
//       <div className="w-[60%] py-1.5 px-2 rounded-sm hover:bg-[#222222]">
//         {children}
//       </div>
//     </div>
//   );
// }

// // ─── AssigneesField ───────────────────────────────────────────────────────────

// interface AssigneesFieldProps {
//   task: any;
//   boardMembers: any[];
//   onAssign: (userId: string) => void;
// }

// function AssigneesField({ task, boardMembers, onAssign }: AssigneesFieldProps) {
//   return (
//     <MetaRow icon={<Users className="size-4" />} label="Assignees">
//       <div className="relative flex group">
//         {task.assignees.length > 0 ? (
//           task.assignees.map((assignee: any) => (
//             <div key={assignee.id} className="flex items-center gap-2 relative">
//               <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
//                 {assignee.user.name
//                   ? assignee.user.name.charAt(0).toUpperCase()
//                   : <User className="size-3" />}
//               </div>
//             </div>
//           ))
//         ) : (
//           <p>Unassigned</p>
//         )}
//         <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 hidden group-hover:block z-10">
//           {boardMembers.reduce((acc: any[], member: any) => {
//             if (!task.assignees.some((a: any) => a.user.id === member.user.id)) {
//               acc.push(
//                 <button
//                   type="button"
//                   key={member.user.id}
//                   onClick={() => onAssign(member.user.id)}
//                   className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-left text-sm"
//                 >
//                   <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
//                     {member.user.name ? member.user.name.charAt(0).toUpperCase() : <User className="size-3" />}
//                   </div>
//                   {member.user.name}
//                 </button>
//               );
//             }
//             return acc;
//           }, [])}
//         </div>
//       </div>
//     </MetaRow>
//   );
// }

// // ─── PriorityField ────────────────────────────────────────────────────────────

// interface PriorityFieldProps {
//   task: any;
//   isPending: boolean;
//   onUpdate: (priority: string) => void;
// }

// function PriorityField({ task, isPending, onUpdate }: PriorityFieldProps) {
//   const colorClass =
//     task.priority === 'URGENT' ? 'text-red-700' :
//       task.priority === 'HIGH' ? 'text-orange-700' :
//         task.priority === 'MEDIUM' ? 'text-yellow-700' :
//           'text-green-700';

//   return (
//     <MetaRow icon={<Flag className="size-4" />} label="Priority">
//       <select
//         value={task.priority}
//         onChange={e => onUpdate(e.target.value)}
//         disabled={isPending}
//         className={`w-full bg-transparent text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 ${colorClass}`}
//       >
//         <option value="LOW">🟢 Low</option>
//         <option value="MEDIUM">🟡 Medium</option>
//         <option value="HIGH">🟠 High</option>
//         <option value="URGENT">🔴 Urgent</option>
//       </select>
//     </MetaRow>
//   );
// }

// // ─── DateField ────────────────────────────────────────────────────────────────

// interface DateFieldProps {
//   id: string;
//   date: Date | undefined;
//   open: boolean;
//   month: Date;
//   today: Date;
//   yesterday: Date;
//   lastWeek: Date;
//   lastMonth: Date;
//   lastYear: Date;
//   onOpenChange: (v: boolean) => void;
//   onSelect: (d: Date | undefined) => void;
//   onPreset: (d: Date) => void;
//   onMonthChange: (d: Date) => void;
// }

// function DateField({
//   id, date, open, month, today, yesterday, lastWeek, lastMonth, lastYear,
//   onOpenChange, onSelect, onPreset, onMonthChange,
// }: DateFieldProps) {
//   return (
//     <MetaRow icon={<CalendarIcon className="size-4" />} label="Dates">
//       <Popover open={open} onOpenChange={onOpenChange}>
//         <PopoverTrigger asChild className="!py-0 flex w-fit">
//           <Button
//             id={id}
//             variant="outline"
//             className="group/pick-date w-36 py-0 flex !gap-0 border-none !bg-transparent justify-between"
//           >
//             <CalendarIcon
//               aria-hidden="true"
//               className="dark:text-[#B4B4B4] group-hover:text-foreground shrink-0 transition-colors"
//             />
//             <span className={cn("truncate dark:text-[#B4B4B4] font-normal", !date && "text-muted-foreground")}>
//               {date ? format(date, "LLL dd, y") : "Pick a date"}
//             </span>
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent align="start" className="w-auto p-0">
//           <Card className="p-0">
//             <CardContent className="p-0">
//               <div className="flex max-sm:flex-col">
//                 <div className="relative py-4 max-sm:order-1 max-sm:border-t sm:w-32">
//                   <div className="h-full sm:border-e">
//                     <div className="flex flex-col px-2 gap-1">
//                       {[
//                         { label: 'Today', date: today },
//                         { label: 'Yesterday', date: yesterday },
//                         { label: 'Last week', date: lastWeek },
//                         { label: 'Last month', date: lastMonth },
//                         { label: 'Last year', date: lastYear },
//                       ].map(({ label, date: presetDate }) => (
//                         <Button
//                           key={label}
//                           size="sm"
//                           variant="ghost"
//                           className="w-full justify-start"
//                           onClick={() => onPreset(presetDate)}
//                         >
//                           {label}
//                         </Button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//                 <Calendar
//                   mode="single"
//                   selected={date}
//                   onSelect={onSelect}
//                   month={month}
//                   onMonthChange={onMonthChange}
//                   initialFocus
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         </PopoverContent>
//       </Popover>
//     </MetaRow>
//   );
// }

// // ─── LabelsField ──────────────────────────────────────────────────────────────

// interface LabelsFieldProps {
//   task: any;
//   labels: any[];
//   onToggle: (labelId: string) => void;
// }

// function LabelsField({ task, labels, onToggle }: LabelsFieldProps) {
//   return (
//     <MetaRow icon={<TagIcon className="size-4" />} label="Tags">
//       <div className="flex flex-wrap gap-2">
//         {task.labels.map(({ label }: any) => (
//           <span
//             key={label.id}
//             className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
//             style={{ backgroundColor: `${label.color}20`, color: label.color }}
//           >
//             {label.name}
//             <button
//               type="button"
//               onClick={() => onToggle(label.id)}
//               className="hover:bg-black/10 rounded-full p-0.5"
//             >
//               <X className="size-3" />
//             </button>
//           </span>
//         ))}

//         <div className="relative group">
//           <button
//             type="button"
//             className="inline-flex items-center gap-1 px-2 py-1 border rounded-full hover:border-indigo-500 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors text-xs"
//           >
//             <Plus className="size-3" />
//             Add label
//           </button>
//           <div className="absolute top-full left-0 mt-1 rounded-lg shadow-lg p-2 hidden group-hover:block z-10 min-w-[150px]">
//             {labels.reduce((acc: any[], label: any) => {
//               if (!task.labels.some((tl: any) => tl.label.id === label.id)) {
//                 acc.push(
//                   <button
//                     type="button"
//                     key={label.id}
//                     onClick={() => onToggle(label.id)}
//                     className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-left text-sm"
//                   >
//                     <span className="size-3 rounded-full" style={{ backgroundColor: label.color }} />
//                     {label.name}
//                   </button>
//                 );
//               }
//               return acc;
//             }, [])}
//           </div>
//         </div>
//       </div>
//     </MetaRow>
//   );
// }

// // ─── SubtasksAccordion ────────────────────────────────────────────────────────

// interface SubtasksAccordionProps {
//   task: any;
//   newSubtask: string;
//   completedSubtasks: number;
//   progress: number;
//   isCreatePending: boolean;
//   onNewSubtaskChange: (v: string) => void;
//   onCreateSubtask: (title: string) => void;
//   onToggleSubtask: (subtaskId: string, isCompleted: boolean) => void;
// }

// function SubtasksAccordion({
//   task, newSubtask, completedSubtasks, progress,
//   onNewSubtaskChange, onCreateSubtask, onToggleSubtask,
// }: SubtasksAccordionProps) {
//   return (
//     <Accordion type="single" collapsible className="w-full">
//       <AccordionItem value="subtasks">
//         <AccordionTrigger className="flex justify-start items-center dark:hover:bg-[#222] py-2 rounded-md hover:bg-[#f5f5f5]">
//           <div className="flex justify-start items-center gap-2 w-full">
//             <h3 className="text-sm font-semibold flex items-center gap-2 dark:text-white/70">
//               Subtasks
//             </h3>
//             <span className="text-xs font-normal text-mid-grey dark:text-[#555]">
//               {`(${completedSubtasks} of ${task.subtasks.length})`}
//             </span>
//             <div className="w-[12%] dark:bg-gray-200 bg-[#333] rounded-full h-1">
//               <div
//                 className="bg-indigo-600 h-1 rounded-full transition-all"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         </AccordionTrigger>
//         <AccordionContent className="border dark:border-[#333] rounded-lg p-3 mt-3">
//           <div className="gap-y-2">
//             {task.subtasks.map((subtask: any) => (
//               <div
//                 key={subtask.id}
//                 className="flex justify-center items-center gap-3 p-2 hover:bg-[#333] rounded-lg group"
//               >
//                 <input
//                   type="checkbox"
//                   aria-label={subtask.title}
//                   checked={subtask.isCompleted}
//                   onChange={e => onToggleSubtask(subtask.id, e.target.checked)}
//                   className="size-4 text-indigo-600 bg-transparent !rounded-full border-gray-300 focus:ring-indigo-500"
//                 />
//                 <span className={`text-sm flex-1 ${subtask.isCompleted ? 'line-through text-gray-400' : 'text-gray-700 dark:text-white/70'}`}>
//                   {subtask.title}
//                 </span>
//                 <button
//                   type="button"
//                   className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-600 rounded"
//                 >
//                   <Trash2 className="size-3" />
//                 </button>
//               </div>
//             ))}

//             <div className="flex gap-2 mt-3">
//               <input
//                 aria-label="Add a subtask"
//                 type="text"
//                 value={newSubtask}
//                 onChange={e => onNewSubtaskChange(e.target.value)}
//                 onKeyDown={e => {
//                   if (e.key === 'Enter' && newSubtask.trim()) onCreateSubtask(newSubtask);
//                 }}
//                 placeholder="Add a subtask..."
//                 className="flex-1 px-3 py-1 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-transparent hover:dark:bg-[#222]"
//               />
//               <button
//                 type="button"
//                 onClick={() => newSubtask.trim() && onCreateSubtask(newSubtask)}
//                 className="p-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
//               >
//                 <Plus className="size-4" />
//               </button>
//             </div>
//           </div>
//         </AccordionContent>
//       </AccordionItem>
//     </Accordion>
//   );
// }

// // ─── AttachmentsAccordion ─────────────────────────────────────────────────────

// interface AttachmentsAccordionProps {
//   task: any;
//   boardId: string;
//   onUploadComplete: () => void;
//   onSetCover: (url: string | null) => void;
//   onDeleteAttachment: (id: string) => void;
// }

// function AttachmentsAccordion({ task, boardId, onUploadComplete, onSetCover, onDeleteAttachment }: AttachmentsAccordionProps) {
//   return (
//     <Collapsible defaultOpen className="w-full">
//       <CollapsibleTrigger asChild>
//         <div className="!flex !justify-between items-center !min-w-full !w-full cursor-pointer">
//           <div className="flex items-center gap-2">
//             <p className="font-bold dark:text-white/70">Attachments</p>
//             {task.attachments.length > 0 && (
//               <span className="text-xs">{task.attachments.length}</span>
//             )}
//           </div>
//           <FileUpload taskId={task.id} type="task" onUploadComplete={onUploadComplete} />
//         </div>
//       </CollapsibleTrigger>
//       <CollapsibleContent>
//         <div className="grid grid-cols-4 gap-3 mt-4">
//           {task.attachments.map((attachment: any) => (
//             <AttachmentCard
//               key={attachment.id}
//               attachment={attachment}
//               task={task}
//               onSetCover={onSetCover}
//               onDeleteAttachment={onDeleteAttachment}
//             />
//           ))}
//         </div>
//       </CollapsibleContent>
//     </Collapsible>
//   );
// }

// // ─── AttachmentCard ───────────────────────────────────────────────────────────

// interface AttachmentCardProps {
//   attachment: any;
//   task: any;
//   onSetCover: (url: string | null) => void;
//   onDeleteAttachment: (id: string) => void;
// }

// function AttachmentCard({ attachment, task, onSetCover, onDeleteAttachment }: AttachmentCardProps) {
//   return (
//     <Card className="relative mx-auto w-full pt-0 group border dark:border-[#333] bg-transparent rounded-md overflow-hidden">
//       <div className="absolute opacity-0 group-hover:opacity-100 flex items-center gap-0 border dark:border-white/20 bg-black rounded-md mr-1 w-fit h-fit top-1 left-auto inset-0 z-50">
//         <Button
//           onClick={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')}
//           variant="secondary"
//           size="icon"
//           className="p-1 h-6 w-6 bg-transparent text-white/70"
//         >
//           <ExternalLink className="h-2 w-2 text-white/70 cursor-pointer" />
//         </Button>
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button
//               variant="secondary"
//               size="icon"
//               className="p-1 h-6 w-6 bg-transparent text-white/70 hover:bg-white/20 hover:text-white"
//             >
//               <Ellipsis className="size-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end" className="w-40 dark:bg-black dark:border-white/20">
//             {attachment.mimeType?.startsWith('image/') && (
//               <DropdownMenuItem
//                 onClick={() => {
//                   const isCurrentCover = task.coverImage === attachment.url;
//                   onSetCover(isCurrentCover ? null : attachment.url);
//                 }}
//                 className="cursor-pointer flex items-center gap-2 dark:hover:bg-neutral-800"
//               >
//                 {task.coverImage === attachment.url ? (
//                   <>
//                     <svg className="size-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
//                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                     </svg>
//                     <span>Remove cover</span>
//                   </>
//                 ) : (
//                   <>
//                     <svg className="size-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
//                     </svg>
//                     <span>Set as cover</span>
//                   </>
//                 )}
//               </DropdownMenuItem>
//             )}
//             <DropdownMenuItem
//               onClick={() => {
//                 if (confirm('Delete this attachment?')) {
//                   onDeleteAttachment(attachment.id);
//                 }
//               }}
//               className="cursor-pointer flex items-center gap-2 text-red-600 dark:hover:bg-red-950/30 hover:bg-red-50"
//             >
//               <Trash2 className="size-4 text-red-600" />
//               <span>Delete</span>
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>

//       {attachment.mimeType?.startsWith('image/') ? (
//         <Image
//           onClick={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')}
//           src={attachment.url}
//           alt=""
//           className="relative z-20 aspect-video w-full object-cover"
//           height={1000}
//           width={1000}
//         />
//       ) : (
//         <File className="size-5 text-indigo-600" />
//       )}

//       <CardHeader className="!px-2 !py-2">
//         <CardTitle className="font-normal">{attachment.filename.slice(0, 18)}</CardTitle>
//         <CardDescription>
//           <p className="flex items-center gap-2 text-xs text-gray-500">
//             {new Date(attachment.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
//             {' '}at{' '}
//             {new Date(attachment.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
//           </p>
//         </CardDescription>
//       </CardHeader>
//     </Card>
//   );
// }

// // ─── ActivityFeed ─────────────────────────────────────────────────────────────

// function ActivityFeed({ task }: { task: any }) {
//   return (
//     <div className="space-y-4">
//       {task.activities?.map((activity: any) => (
//         <div key={activity.id} className="flex gap-3">
//           <div className="size-8 rounded-full flex items-center justify-center flex-shrink-0">
//             {activity.user.image ? (
//               <img src={activity.user.image} alt="" className="size-8 rounded-full" />
//             ) : (
//               <User className="size-4 text-gray-600" />
//             )}
//           </div>
//           <div className="flex-1">
//             <p className="text-sm text-gray-700">
//               <span className="font-medium text-gray-900">{activity.user.name}</span>
//               {' '}{activity.description.slice(0, 50)}
//             </p>
//             <p className="text-xs text-gray-500 mt-1">
//               {format(new Date(activity.createdAt), 'MMM d, yyyy HH:mm')}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── TaskModal ────────────────────────────────────────────────────────────────

// export function TaskModal({ task, boardId, boardMembers, labels, closeModal }: TaskModalProps) {
//   const queryClient = useQueryClient();
//   useSSE((data) => {
//     if (data.boardId !== boardId) return;

//     // Only update if this event affects the currently open task
//     const affectedTaskId = data.task?.id || data.taskId;
//     if (affectedTaskId !== task.id) return;

//     console.log('[TaskModal SSE] Received update for current task:', data.type);

//     if (data.type === 'task:updated' || data.type === 'task:moved') {
//       // Refresh task data from server to get latest state
//       queryClient.invalidateQueries({ queryKey: ['task', task.id] });

//       // Also update the local editedTask state with new data
//       if (data.task) {
//         setEditedTask((prev: any) => ({
//           ...prev,
//           ...data.task,
//           subtasks: data.task.subtasks ?? prev.subtasks,
//           attachments: data.task.attachments ?? prev.attachments,
//           assignees: data.task.assignees ?? prev.assignees,
//           labels: data.task.labels ?? prev.labels,
//         }));
//       }
//     }
//   });
//   const { data: freshTask } = useQuery({
//     queryKey: ['task', task.id],
//     queryFn: async () => {
//       const res = await fetch(`/api/tasks/${task.id}`);
//       if (!res.ok) throw new Error('Failed to fetch task');
//       return res.json();
//     },
//     enabled: !!task.id,
//     staleTime: 0, // Always fetch fresh data
//     refetchInterval: false, // Don't poll — SSE handles real-time
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedTask, setEditedTask] = useState(task);
//   const [newSubtask, setNewSubtask] = useState('');
//   const id = useId();
//   const [iscollapsibleOpen, setIscollapsibleOpen] = useState(false)
//   const today = new Date();
//   const yesterday = subDays(today, 1);
//   const lastWeek = subDays(today, 7);
//   const lastMonth = subMonths(today, 1);
//   const lastYear = subYears(today, 1);

//   const [date, setDate] = useState<Date | undefined>(editedTask.dueDate ? new Date(editedTask.dueDate) : undefined);
//   const [month, setMonth] = useState<Date>(date ?? today);
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     if (freshTask) {
//       setEditedTask(freshTask);
//     }
//   }, [freshTask]);

//   useEffect(() => {
//     if (editedTask.dueDate) {
//       const parsed = new Date(editedTask.dueDate);
//       setDate(parsed);
//       setMonth(parsed);
//     } else {
//       setDate(undefined);
//       setMonth(today);
//     }
//   }, [editedTask.dueDate]);

//   const handleSelect = (newDate: Date | undefined) => {
//     if (!newDate) return;
//     setDate(newDate);
//     setEditedTask((prev: any) => ({ ...prev, dueDate: format(newDate, "yyyy-MM-dd") }));
//     setOpen(false);
//   };

//   const handlePreset = (presetDate: Date) => {
//     setDate(presetDate);
//     setMonth(presetDate);
//     setEditedTask((prev: any) => ({ ...prev, dueDate: format(presetDate, "yyyy-MM-dd") }));
//     setOpen(false);
//   };

//   // ── Mutations ──────────────────────────────────────────────────────────────

//   const updateTaskMutation = useMutation({
//     mutationFn: async (updates: any) => {
//       const res = await fetch(`/api/tasks/${task.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updates),
//       });
//       if (!res.ok) throw new Error('Failed to update task');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//       setIsEditing(true);
//     },
//   });

//   const setCoverImageMutation = useMutation({
//     mutationFn: async (coverImage: string | null) => {
//       const res = await fetch(`/api/tasks/${task.id}/cover`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ coverImage }),
//       });
//       if (!res.ok) throw new Error('Failed to set cover image');
//       return res.json();
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
//   });

//   const deleteAttachmentMutation = useMutation({
//     mutationFn: async (attachmentId: string) => {
//       const res = await fetch(`/api/attachments/${attachmentId}`, { method: 'DELETE' });
//       if (!res.ok) throw new Error('Failed to delete attachment');
//       return res.json();
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
//   });

//   const updatePriorityMutation = useMutation({
//     mutationFn: async (priority: string) => {
//       const res = await fetch(`/api/tasks/${task.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ priority }),
//       });
//       if (!res.ok) throw new Error('Failed to update priority');
//       return res.json();
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
//   });

//   const createSubtaskMutation = useMutation({
//     mutationFn: async (title: string) => {
//       const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title }),
//       });
//       if (!res.ok) throw new Error('Failed to add subtask');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//       setNewSubtask('');
//     },
//   });

//   const toggleSubtaskMutation = useMutation({
//     mutationFn: async ({ subtaskId, isCompleted }: { subtaskId: string; isCompleted: boolean }) => {
//       const res = await fetch(`/api/subtasks/${subtaskId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ isCompleted }),
//       });
//       if (!res.ok) throw new Error('Failed to update subtask');
//       return res.json();
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
//   });

//   const assignUserMutation = useMutation({
//     mutationFn: async (userId: string) => {
//       const isAssigned = task.assignees.some((a: any) => a.user.id === userId);
//       const res = await fetch(
//         `/api/tasks/${task.id}/assignees${isAssigned ? `?userId=${userId}` : ''}`,
//         {
//           method: isAssigned ? 'DELETE' : 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           ...(isAssigned ? {} : { body: JSON.stringify({ userId }) }),
//         }
//       );
//       if (!res.ok) throw new Error('Failed to update assignees');
//       return res.json();
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
//   });

//   const addLabelMutation = useMutation({
//     mutationFn: async (labelId: string) => {
//       const hasLabel = task.labels.some((l: any) => l.label.id === labelId);
//       const res = await fetch(
//         `/api/tasks/${task.id}/labels${hasLabel ? `?labelId=${labelId}` : ''}`,
//         {
//           method: hasLabel ? 'DELETE' : 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           ...(hasLabel ? {} : { body: JSON.stringify({ labelId }) }),
//         }
//       );
//       if (!res.ok) throw new Error('Failed to update labels');
//       return res.json();
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
//   });


//   const OpenCollapsible = () => {
//     if (iscollapsibleOpen) {
//       setIscollapsibleOpen(false)
//     } else {
//       setIscollapsibleOpen(true)
//     }
//   }
//   // ── Derived values ─────────────────────────────────────────────────────────

//   const completedSubtasks = task.subtasks.filter((s: any) => s.isCompleted).length;
//   const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;

//   // ── Render ─────────────────────────────────────────────────────────────────

//   return (
//     <Dialog open={true} onOpenChange={() => closeModal()}>
//       <DialogContent className="max-h-[96%] border lg:h-[96%] h-[98%] md:min-w-[92rem] lg:min-w-[92.5rem] rounded-lg max-w-[92.5rem]  !py-0 !p-0 dark:border-[#333333] bg-white dark:bg-[#111111] shadow-none">

//         <div className="">
//           <div className="px-2 pr-10 items-center border-b h-10 max-h-10 flex justify-between border-[#eee] dark:border-[#222]">
//             <div>hello</div>
//             <div>
//               <p className="text-xs dark:text-white text-gray-700">
//                 created {task.assignees.length > 0 ? task.assignees[0].user.name : 'Unassigned'} - {new Date(task.createdAt).toDateString()}
//               </p>
//             </div>
//           </div>

//           {/* ── Resizable body ── */}
//           <ResizablePanelGroup direction="horizontal" className="h-full w-full border-none !pt-0 relative">

//             <ResizablePanel>
//               <ResizablePanelGroup direction="vertical">
//                 <ScrollArea className="h-[90vh] overflow-y-auto">

//                   {task.coverImage &&
//                     <ResizablePanel defaultSize={50} maxSize={65} minSize={35} className="flex h-48 max-h-52 items-start">
//                       <div className="h-full w-full flex-grow">
//                         <Image
//                           className="h-full w-full object-cover"
//                           src={task.coverImage}
//                           alt=""
//                           height={1000}
//                           width={1000}
//                         />
//                       </div>
//                     </ResizablePanel>
//                   }

//                   <ResizableHandle className="bg-transparent border-none" />

//                   {/* Main content panel */}
//                   <ResizablePanel className="pb-4">
//                     <ResizablePanelGroup direction="horizontal" className="!min-w-full flex justify-center">
//                       <ResizablePanel defaultSize={60} className={cn("md:max-w-[75%] md:min-w-[75%] pt-5 space-y-4", !iscollapsibleOpen && "md:max-w-[65%] md:min-w-[65%] px-6")}>
//                         <div className="absolute inset-0 left-auto right-2 flex flex-col gap-y-2.5 dark:border-[#222] dark:bg-[#111111] bg-white py-2 h-fit w-fit px-2 top-2 border rounded-md">
//                           <Button variant="ghost" size="icon" className='text-[#A6A6A6] p-1.5 size-0' onClick={OpenCollapsible}>
//                             {iscollapsibleOpen ? <DoubleArrowRightIcon className='size-4'/>: <DoubleArrowLeftIcon className='size-4'/> }
//                           </Button>
//                           <Button variant="ghost" size="icon" className='text-[#A6A6A6] p-1.5 size-0' onClick={OpenCollapsible}>
//                            <MessageSquareIcon/>
//                           </Button>
//                         </div>
                       
//                         {!isEditing ? (
//                           <button
//                             type="button"
//                             onClick={() => setIsEditing(true)}
//                             className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
//                           >
//                             <Edit2 className="size-3" />
//                           </button>
//                         ) : (
//                           <button
//                             type="button"
//                             onClick={() => updateTaskMutation.mutate(editedTask)}
//                             className="p-1 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
//                           >
//                             <Check className="size-3" />
//                           </button>
//                         )}

//                         {/* Title */}
//                         <Input
//                           type="text"
//                           value={editedTask.title}
//                           onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
//                           className="!text-3xl border-none px-[1px] font-semibold dark:text-white/70 dark:hover:bg-[#222222]"
//                         />

//                         {/* Metadata grid */}
//                         <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#7B7B7B]">
//                           <MetaRow icon={<Disc className="size-4" />} label="Status">
//                             <p>empty</p>
//                           </MetaRow>

//                           <AssigneesField
//                             task={task}
//                             boardMembers={boardMembers}
//                             onAssign={userId => assignUserMutation.mutate(userId)}
//                           />

//                           <PriorityField
//                             task={task}
//                             isPending={updatePriorityMutation.isPending}
//                             onUpdate={priority => updatePriorityMutation.mutate(priority)}
//                           />

//                           <DateField
//                             id={id}
//                             date={date}
//                             open={open}
//                             month={month}
//                             today={today}
//                             yesterday={yesterday}
//                             lastWeek={lastWeek}
//                             lastMonth={lastMonth}
//                             lastYear={lastYear}
//                             onOpenChange={setOpen}
//                             onSelect={handleSelect}
//                             onPreset={handlePreset}
//                             onMonthChange={setMonth}
//                           />

//                           <MetaRow icon={<Hourglass className="size-4" />} label="Time estimate">
//                             <p className="dark:text-[#B4B4B4]">2 h</p>
//                           </MetaRow>

//                           <LabelsField
//                             task={task}
//                             labels={labels}
//                             onToggle={labelId => addLabelMutation.mutate(labelId)}
//                           />
//                         </div>

//                         {/* Description */}
//                         <div className="mt-2">
//                           <Separator className="h-[0.8px]" />
//                           <Textarea
//                             value={editedTask.description || ''}
//                             onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
//                             className="w-full placeholder:text-[#434343] dark:placeholder:text-[#777777] p-3 border-none dark:hover:bg-[#191919] outline-none rounded-lg min-h-[100px]"
//                             placeholder="Write, press 'Space' for AI, '/' for commands"
//                           />
//                         </div>

//                         {/* Subtasks */}
//                         <SubtasksAccordion
//                           task={task}
//                           newSubtask={newSubtask}
//                           completedSubtasks={completedSubtasks}
//                           progress={progress}
//                           isCreatePending={createSubtaskMutation.isPending}
//                           onNewSubtaskChange={setNewSubtask}
//                           onCreateSubtask={title => createSubtaskMutation.mutate(title)}
//                           onToggleSubtask={(subtaskId, isCompleted) =>
//                             toggleSubtaskMutation.mutate({ subtaskId, isCompleted })
//                           }
//                         />

//                         {/* Attachments */}
//                         <AttachmentsAccordion
//                           task={task}
//                           boardId={boardId}
//                           onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ['board', boardId] })}
//                           onSetCover={(url) => setCoverImageMutation.mutate(url)}
//                           onDeleteAttachment={(id) => deleteAttachmentMutation.mutate(id)}
//                         />

//                       </ResizablePanel>
//                     </ResizablePanelGroup>
//                   </ResizablePanel>
//                 </ScrollArea>
//               </ResizablePanelGroup>
//             </ResizablePanel>

//             <ResizableHandle className="dark:bg-neutral-900" />


//             <Collapsible open={iscollapsibleOpen} onOpenChange={setIscollapsibleOpen}>
//               <ResizablePanel defaultSize={30} minSize={40} maxSize={40} className="dark:bg-neutral-950 h-full ">
//                 <CollapsibleContent className='h-full'>
//                   <ScrollArea className="h-full overflow-auto px-4 py-6">


//                     <ActivityFeed task={task} />

//                     <div className="space-y-6">

//                       <div>
//                         <CommentWithAttachments
//                           taskId={task.id}
//                           comments={task.boardComments || []}
//                           onAddComment={(content, attachments) => {
//                             fetch(`/api/tasks/${task.id}/comments`, {
//                               method: 'POST',
//                               headers: { 'Content-Type': 'application/json' },
//                               body: JSON.stringify({ content, attachments }),
//                             }).then(() => queryClient.invalidateQueries({ queryKey: ['board', boardId] }));
//                           }}
//                           onDeleteComment={commentId => {
//                             if (confirm('Delete this comment?')) {
//                               fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
//                                 .then(() => queryClient.invalidateQueries({ queryKey: ['board', boardId] }));
//                             }
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </ScrollArea>
//                 </CollapsibleContent>
//               </ResizablePanel>
//             </Collapsible>
//           </ResizablePanelGroup>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client"

import { useEffect, useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Paperclip,
  MessageSquare,
  User,
  Plus,
  Trash2,
  Edit2,
  Check,
  Users,
  ExternalLink,
  Flag,
  TagIcon,
  Hourglass,
  Ellipsis,
  File,
  MessageSquareIcon,
  Download,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react';
import { format, isToday, startOfDay } from 'date-fns';
import { FileUpload } from './file-upload';
import { CommentWithAttachments } from './comment-with-attachments';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useSSE } from 'hooks/useSSE';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { useId } from "react"
import { subDays, subMonths, subYears } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Disc } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/board-accordation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskModalProps {
  task: any;
  boardId: string;
  boardMembers: any[];
  labels: any[];
  closeModal: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do', color: 'bg-gray-400' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'IN_REVIEW', label: 'In Review', color: 'bg-yellow-500' },
  { value: 'DONE', label: 'Done', color: 'bg-green-500' },
  { value: 'BLOCKED', label: 'Blocked', color: 'bg-red-500' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', icon: '🟢', color: 'text-green-600 dark:text-green-400' },
  { value: 'MEDIUM', label: 'Medium', icon: '🟡', color: 'text-yellow-600 dark:text-yellow-400' },
  { value: 'HIGH', label: 'High', icon: '🟠', color: 'text-orange-600 dark:text-orange-400' },
  { value: 'URGENT', label: 'Urgent', icon: '🔴', color: 'text-red-600 dark:text-red-400' },
];

// ─── MetaRow ──────────────────────────────────────────────────────────────────

interface MetaRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function MetaRow({ icon, label, children }: MetaRowProps) {
  return (
    <div className="flex gap-4 justify-between items-center w-full">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{label}</p>
      </div>
      <div className="w-[60%] py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
        {children}
      </div>
    </div>
  );
}

// ─── StatusField (shadcn Select) ─────────────────────────────────────────────

interface StatusFieldProps {
  task: any;
  isPending: boolean;
  onUpdate: (status: string) => void;
}

function StatusField({ task, isPending, onUpdate }: StatusFieldProps) {
  const currentStatus = STATUS_OPTIONS.find(s => s.value === task.status) || STATUS_OPTIONS[0];

  return (
    <MetaRow icon={<Disc className="size-4" />} label="Status">
      <Select
        value={task.status || 'TODO'}
        onValueChange={onUpdate}
        disabled={isPending}
      >
        <SelectTrigger className="w-full border-none bg-transparent h-auto p-0 focus:ring-0 text-sm shadow-none gap-2 hover:bg-transparent">
          {/* <span className={cn("size-2 rounded-full flex-shrink-0", currentStatus.color)} /> */}
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent className="w-40">
          {STATUS_OPTIONS.map(status => (
            <SelectItem key={status.value} value={status.value}>
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", status.color)} />
                {status.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </MetaRow>
  );
}

// ─── AssigneesField (shadcn Popover) ─────────────────────────────────────────

interface AssigneesFieldProps {
  task: any;
  boardMembers: any[];
  onAssign: (userId: string) => void;
}

function AssigneesField({ task, boardMembers, onAssign }: AssigneesFieldProps) {
  return (
    <MetaRow icon={<Users className="size-4" />} label="Assignees">
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="flex items-center gap-1.5 w-full text-left group/trigger">
            {task.assignees.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {task.assignees.slice(0, 4).map((assignee: any) => (
                    <div
                      key={assignee.id}
                      className="size-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 ring-2 ring-white dark:ring-neutral-950"
                      title={assignee.user.name}
                    >
                      {assignee.user.name ? assignee.user.name.charAt(0).toUpperCase() : <User className="size-3" />}
                    </div>
                  ))}
                </div>
                {task.assignees.length > 4 && (
                  <span className="text-[11px] text-gray-400">+{task.assignees.length - 4}</span>
                )}
                <Plus className="size-3 text-gray-300 dark:text-gray-600 group-hover/trigger:text-indigo-500 transition-colors" />
              </div>
            ) : (
              <span className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                Unassigned
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-52 p-1.5 dark:bg-[#1a1a1a] dark:border-white/10" sideOffset={4}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1.5">
            Assign to
          </p>
          <div className="max-h-48 overflow-y-auto">
            {boardMembers.map((member: any) => {
              const isAssigned = task.assignees.some((a: any) => a.user.id === member.user.id);
              return (
                <button
                  type="button"
                  key={member.user.id}
                  onClick={() => onAssign(member.user.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left text-sm transition-colors",
                    isAssigned
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  <div className="size-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    {member.user.name ? member.user.name.charAt(0).toUpperCase() : <User className="size-3" />}
                  </div>
                  <span className="flex-1 truncate text-[13px]">{member.user.name}</span>
                  {isAssigned && <Check className="size-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </MetaRow>
  );
}

// ─── PriorityField (shadcn DropdownMenu) ──────────────────────────────────────

interface PriorityFieldProps {
  task: any;
  isPending: boolean;
  onUpdate: (priority: string) => void;
}

function PriorityField({ task, isPending, onUpdate }: PriorityFieldProps) {
  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === task.priority) || PRIORITY_OPTIONS[0];

  return (
    <MetaRow icon={<Flag className="size-4" />} label="Priority">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isPending}>
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 text-sm w-full text-left transition-colors",
              currentPriority.color
            )}
          >
            <span>{currentPriority.icon}</span>
            <span>{currentPriority.label}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36 dark:bg-[#1a1a1a] dark:border-white/10" sideOffset={4}>
          {PRIORITY_OPTIONS.map(priority => (
            <DropdownMenuItem
              key={priority.value}
              onClick={() => onUpdate(priority.value)}
              className={cn(
                "flex items-center gap-2 cursor-pointer text-sm dark:hover:bg-white/5",
                priority.value === task.priority && "bg-gray-50 dark:bg-white/5"
              )}
            >
              <span>{priority.icon}</span>
              <span className={cn(priority.color, "flex-1")}>{priority.label}</span>
              {priority.value === task.priority && <Check className="size-3.5 text-gray-400" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </MetaRow>
  );
}

// ─── DateField ────────────────────────────────────────────────────────────────

interface DateFieldProps {
  id: string;
  date: Date | undefined;
  open: boolean;
  month: Date;
  today: Date;
  yesterday: Date;
  lastWeek: Date;
  lastMonth: Date;
  lastYear: Date;
  onOpenChange: (v: boolean) => void;
  onSelect: (d: Date | undefined) => void;
  onPreset: (d: Date) => void;
  onMonthChange: (d: Date) => void;
}

function DateField({
  id, date, open, month, today, yesterday, lastWeek, lastMonth, lastYear,
  onOpenChange, onSelect, onPreset, onMonthChange,
}: DateFieldProps) {
  return (
    <MetaRow icon={<CalendarIcon className="size-4" />} label="Dates">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild className="!py-0 h-7 flex w-fit">
          <Button
            id={id}
            variant="outline"
            className="group/pick-date w-28 !py-0 px-0 !h-fit flex !gap-0 border-none justify-between hover:!bg-transparent"
          >
            <CalendarIcon
              aria-hidden="true"
              className="dark:text-gray-500 group-hover/pick-date:text-foreground shrink-0 transition-colors size-4"
            />
            <span className={cn("truncate dark:text-gray-400 font-normal text-sm", !date && "text-muted-foreground")}>
              {date ? format(date, "LLL dd, y") : "Pick a date"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Card className="p-0">
            <CardContent className="p-0">
              <div className="flex max-sm:flex-col">
                <div className="relative py-4 max-sm:order-1 max-sm:border-t sm:w-32">
                  <div className="h-full sm:border-e">
                    <div className="flex flex-col px-2 gap-1">
                      {[
                        { label: 'Today', date: today },
                        { label: 'Yesterday', date: yesterday },
                        { label: 'Last week', date: lastWeek },
                        { label: 'Last month', date: lastMonth },
                        { label: 'Last year', date: lastYear },
                      ].map(({ label, date: presetDate }) => (
                        <Button
                          key={label}
                          size="sm"
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onClick={() => onPreset(presetDate)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={onSelect}
                  month={month}
                  onMonthChange={onMonthChange}
                  initialFocus
                />
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </MetaRow>
  );
}

// ─── LabelsField (shadcn Popover) ─────────────────────────────────────────────

interface LabelsFieldProps {
  task: any;
  labels: any[];
  onToggle: (labelId: string) => void;
}

function LabelsField({ task, labels, onToggle }: LabelsFieldProps) {
  return (
    <MetaRow icon={<TagIcon className="size-4" />} label="Tags">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex flex-wrap items-center gap-1.5 cursor-pointer group/trigger">
            {task.labels.length > 0 ? (
              <>
                {task.labels.map(({ label }: any) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{ backgroundColor: `${label.color}20`, color: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
                <span className="size-4 rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover/trigger:border-indigo-400 group-hover/trigger:text-indigo-500 transition-colors">
                  <Plus className="size-2.5" />
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                None
              </span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-48 p-1.5 dark:bg-[#1a1a1a] dark:border-white/10" sideOffset={4}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1.5">
            Tags
          </p>
          <div className="max-h-48 overflow-y-auto">
            {labels.map((label: any) => {
              const isActive = task.labels.some((tl: any) => tl.label.id === label.id);
              return (
                <button
                  type="button"
                  key={label.id}
                  onClick={() => onToggle(label.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left text-sm transition-colors",
                    isActive
                      ? "bg-gray-50 dark:bg-white/5"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  <span className="size-3 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                  <span className="flex-1 truncate text-[13px]">{label.name}</span>
                  {isActive && <Check className="size-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </MetaRow>
  );
}

// ─── SubtasksAccordion ────────────────────────────────────────────────────────

interface SubtasksAccordionProps {
  task: any;
  newSubtask: string;
  completedSubtasks: number;
  progress: number;
  isCreatePending: boolean;
  onNewSubtaskChange: (v: string) => void;
  onCreateSubtask: (title: string) => void;
  onToggleSubtask: (subtaskId: string, isCompleted: boolean) => void;
}

function SubtasksAccordion({
  task, newSubtask, completedSubtasks, progress,
  onNewSubtaskChange, onCreateSubtask, onToggleSubtask,
}: SubtasksAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="subtasks">
        <AccordionTrigger className="flex justify-start items-center dark:hover:bg-[#222] py-2 rounded-md hover:bg-[#f5f5f5]">
          <div className="flex justify-start items-center gap-2 w-full">
            <h3 className="text-sm font-semibold flex items-center gap-2 dark:text-white/70">
              Subtasks
            </h3>
            <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
              {`(${completedSubtasks} of ${task.subtasks.length})`}
            </span>
            <div className="w-[12%] dark:bg-gray-700 bg-gray-200 rounded-full h-1">
              <div
                className="bg-indigo-600 h-1 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="border dark:border-white/10 rounded-lg p-3 mt-3">
          <div className="gap-y-2">
            {task.subtasks.map((subtask: any) => (
              <div
                key={subtask.id}
                className="flex justify-center items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-white/[0.04] rounded-lg group"
              >
                <input
                  type="checkbox"
                  aria-label={subtask.title}
                  checked={subtask.isCompleted}
                  onChange={e => onToggleSubtask(subtask.id, e.target.checked)}
                  className="size-4 text-indigo-600 bg-transparent !rounded-full border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                />
                <span className={`text-sm flex-1 ${subtask.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                  {subtask.title}
                </span>
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 rounded transition-all"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}

            <div className="flex gap-2 mt-3">
              <input
                aria-label="Add a subtask"
                type="text"
                value={newSubtask}
                onChange={e => onNewSubtaskChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newSubtask.trim()) onCreateSubtask(newSubtask);
                }}
                placeholder="Add a subtask..."
                className="flex-1 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-transparent hover:dark:bg-white/[0.04] border border-transparent focus:border-indigo-500/30 dark:text-gray-200 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => newSubtask.trim() && onCreateSubtask(newSubtask)}
                className="p-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// ─── AttachmentListItem ───────────────────────────────────────────────────────

interface AttachmentCardProps {
  attachment: any;
  task: any;
  onSetCover: (url: string | null) => void;
  onDeleteAttachment: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function AttachmentListItem({ attachment, task, onSetCover, onDeleteAttachment }: AttachmentCardProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.04] group transition-colors">
      <div className="size-8 rounded-md bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0">
        {attachment.mimeType?.startsWith('image/') ? (
          <ImageIcon className="size-4 text-indigo-500" />
        ) : (
          <File className="size-4 text-indigo-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">{attachment.filename}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          {formatFileSize(attachment.size || 0)} · {format(new Date(attachment.createdAt), 'MMM d, yyyy')} at {format(new Date(attachment.createdAt), 'h:mm a')}
        </p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')}
        >
          <Download className="size-3.5" />
        </Button>
        {attachment.mimeType?.startsWith('image/') && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => {
              const isCurrentCover = task.coverImage === attachment.url;
              onSetCover(isCurrentCover ? null : attachment.url);
            }}
            title={task.coverImage === attachment.url ? 'Remove cover' : 'Set as cover'}
          >
            <ImageIcon className="size-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          onClick={() => {
            if (confirm('Delete this attachment?')) {
              onDeleteAttachment(attachment.id);
            }
          }}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── AttachmentCard (Grid) ────────────────────────────────────────────────────

function AttachmentCard({ attachment, task, onSetCover, onDeleteAttachment }: AttachmentCardProps) {
  return (
    <Card className="relative mx-auto w-full pt-0 group border dark:border-white/[0.06] bg-transparent rounded-md overflow-hidden">
      <div className="absolute opacity-0 group-hover:opacity-100 flex items-center gap-0 bg-black/70 rounded-md w-fit h-fit top-1 right-1 z-50 transition-opacity">
        <Button
          onClick={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')}
          variant="secondary"
          size="icon"
          className="p-1 h-6 w-6 bg-transparent text-white/70 hover:text-white hover:bg-white/10"
        >
          <ExternalLink className="h-2.5 w-2.5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="p-1 h-6 w-6 bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Ellipsis className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 dark:bg-[#1a1a1a] dark:border-white/10">
            {attachment.mimeType?.startsWith('image/') && (
              <DropdownMenuItem
                onClick={() => {
                  const isCurrentCover = task.coverImage === attachment.url;
                  onSetCover(isCurrentCover ? null : attachment.url);
                }}
                className="cursor-pointer flex items-center gap-2 dark:hover:bg-white/5"
              >
                <ImageIcon className="size-4" />
                <span>{task.coverImage === attachment.url ? 'Remove cover' : 'Set as cover'}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                if (confirm('Delete this attachment?')) {
                  onDeleteAttachment(attachment.id);
                }
              }}
              className="cursor-pointer flex items-center gap-2 text-red-600 dark:hover:bg-red-900/20 hover:bg-red-50"
            >
              <Trash2 className="size-4 text-red-600" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {attachment.mimeType?.startsWith('image/') ? (
        <Image
          onClick={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')}
          src={attachment.url}
          alt=""
          className="relative z-20 aspect-video w-full object-cover cursor-pointer"
          height={1000}
          width={1000}
        />
      ) : (
        <div className="aspect-video flex items-center justify-center bg-gray-50 dark:bg-white/[0.03]">
          <File className="size-8 text-indigo-400" />
        </div>
      )}

      <CardHeader className="!px-2.5 !py-2">
        <CardTitle className="font-normal text-[13px] dark:text-gray-200 truncate">{attachment.filename}</CardTitle>
        <CardDescription>
          <p className="text-[11px] text-gray-400">
            {formatFileSize(attachment.size || 0)} · {format(new Date(attachment.createdAt), 'MMM d')}
          </p>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

// ─── AttachmentsAccordion ─────────────────────────────────────────────────────

interface AttachmentsAccordionProps {
  task: any;
  boardId: string;
  onUploadComplete: () => void;
  onSetCover: (url: string | null) => void;
  onDeleteAttachment: (id: string) => void;
}

function AttachmentsAccordion({ task, boardId, onUploadComplete, onSetCover, onDeleteAttachment }: AttachmentsAccordionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleDownloadAll = () => {
    task.attachments.forEach((attachment: any) => {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <Collapsible defaultOpen className="w-full">
      <CollapsibleTrigger asChild>
        <div className="!flex !justify-between items-center !min-w-full !w-full cursor-pointer">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm dark:text-white/70">Attachments</p>
            {task.attachments.length > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">{task.attachments.length}</span>
            )}
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {task.attachments.length > 0 && (
              <>
                {/* View toggle */}
                <div className="flex items-center border dark:border-white/10 rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-1.5 transition-colors",
                      viewMode === 'grid'
                        ? "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                    title="Grid view"
                  >
                    <LayoutGrid className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-1.5 transition-colors",
                      viewMode === 'list'
                        ? "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                    title="List view"
                  >
                    <List className="size-3.5" />
                  </button>
                  <button
                  
                  aria-label="download all attachments"
                  
                  onClick={handleDownloadAll}
                  className="h-7 p-1.5 rounded-none text-[12px] text-gray-500 hover:text-gray-700  dark:text-gray-400 dark:hover:text-gray-200 gap-1.5"
                >
                  <Download className="size-3.5" />
                </button>
                <FileUpload taskId={task.id} type="task" onUploadComplete={onUploadComplete} />
                </div>
                {/* Download All */}
                
              </>
            )}
            
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {task.attachments.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 py-4 text-center border border-dashed dark:border-white/10 rounded-lg">
            No attachments yet
          </p>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-3 mt-4">
            {task.attachments.map((attachment: any) => (
              <AttachmentCard
                key={attachment.id}
                attachment={attachment}
                task={task}
                onSetCover={onSetCover}
                onDeleteAttachment={onDeleteAttachment}
              />
            ))}
          </div>
        ) : (
          <div className="mt-3 border dark:border-white/10 rounded-lg overflow-hidden divide-y dark:divide-white/[0.06]">
            {task.attachments.map((attachment: any) => (
              <AttachmentListItem
                key={attachment.id}
                attachment={attachment}
                task={task}
                onSetCover={onSetCover}
                onDeleteAttachment={onDeleteAttachment}
              />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── ActivityFeed (ClickUp-style: Today / Earlier) ───────────────────────────

function ActivityItem({ activity }: { activity: any }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
      <div className="size-5 rounded-full bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
        {activity.user?.image ? (
          <img src={activity.user.image} alt="" className="size-5 rounded-full object-cover" />
        ) : (
          <User className="size-2.5 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed">
          <span className="font-medium text-gray-800 dark:text-gray-100">{activity.user?.name || 'Someone'}</span>
          {' '}{activity.description}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
          {isToday(new Date(activity.createdAt))
            ? format(new Date(activity.createdAt), 'h:mm a')
            : format(new Date(activity.createdAt), 'MMM d, h:mm a')}
        </p>
      </div>
    </div>
  );
}

function ActivityFeed({ task }: { task: any }) {
  const [showEarlier, setShowEarlier] = useState(false);

  const { todayActivities, earlierActivities } = useMemo(() => {
    const todayActs = (task.activities || []).filter((a: any) => isToday(new Date(a.createdAt)));
    const earlierActs = (task.activities || []).filter((a: any) => !isToday(new Date(a.createdAt)));
    return { todayActivities: todayActs, earlierActivities: earlierActs };
  }, [task.activities]);

  const totalActivities = task.activities?.length || 0;

  return (
    <div className="space-y-1">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
        Activity
      </h3>

      {totalActivities === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 py-2 px-2">No activity yet</p>
      )}

      {todayActivities.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-0.5 px-2">Today</p>
          <div className="space-y-0">
            {todayActivities.map((activity: any) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {earlierActivities.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowEarlier(!showEarlier)}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-2 px-2 transition-colors"
          >
            {showEarlier ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            {showEarlier ? 'Hide' : 'Show'} earlier activity ({earlierActivities.length})
          </button>
          {showEarlier && (
            <div className="space-y-0 mt-0.5">
              {earlierActivities.map((activity: any) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TaskModal ────────────────────────────────────────────────────────────────

export function TaskModal({ task, boardId, boardMembers, labels, closeModal }: TaskModalProps) {
  const queryClient = useQueryClient();
  useSSE((data) => {
    if (data.boardId !== boardId) return;
    const affectedTaskId = data.task?.id || data.taskId;
    if (affectedTaskId !== task.id) return;

    if (data.type === 'task:updated' || data.type === 'task:moved') {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      if (data.task) {
        setEditedTask((prev: any) => ({
          ...prev,
          ...data.task,
          subtasks: data.task.subtasks ?? prev.subtasks,
          attachments: data.task.attachments ?? prev.attachments,
          assignees: data.task.assignees ?? prev.assignees,
          labels: data.task.labels ?? prev.labels,
        }));
      }
    }
  });

  const { data: freshTask } = useQuery({
    queryKey: ['task', task.id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${task.id}`);
      if (!res.ok) throw new Error('Failed to fetch task');
      return res.json();
    },
    enabled: !!task.id,
    staleTime: 0,
    refetchInterval: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [newSubtask, setNewSubtask] = useState('');
  const id = useId();
  const [iscollapsibleOpen, setIscollapsibleOpen] = useState(false);
  const today = new Date();
  const yesterday = subDays(today, 1);
  const lastWeek = subDays(today, 7);
  const lastMonth = subMonths(today, 1);
  const lastYear = subYears(today, 1);

  const [date, setDate] = useState<Date | undefined>(editedTask.dueDate ? new Date(editedTask.dueDate) : undefined);
  const [month, setMonth] = useState<Date>(date ?? today);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (freshTask) {
      setEditedTask(freshTask);
    }
  }, [freshTask]);

  useEffect(() => {
    if (editedTask.dueDate) {
      const parsed = new Date(editedTask.dueDate);
      setDate(parsed);
      setMonth(parsed);
    } else {
      setDate(undefined);
      setMonth(today);
    }
  }, [editedTask.dueDate]);

  const handleSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    setDate(newDate);
    setEditedTask((prev: any) => ({ ...prev, dueDate: format(newDate, "yyyy-MM-dd") }));
    setOpen(false);
  };

  const handlePreset = (presetDate: Date) => {
    setDate(presetDate);
    setMonth(presetDate);
    setEditedTask((prev: any) => ({ ...prev, dueDate: format(presetDate, "yyyy-MM-dd") }));
    setOpen(false);
  };

  // ── Mutations ──────────────────────────────────────────────────────────────

  const updateTaskMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setIsEditing(true);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });

  const setCoverImageMutation = useMutation({
    mutationFn: async (coverImage: string | null) => {
      const res = await fetch(`/api/tasks/${task.id}/cover`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage }),
      });
      if (!res.ok) throw new Error('Failed to set cover image');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const res = await fetch(`/api/attachments/${attachmentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete attachment');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });

  const updatePriorityMutation = useMutation({
    mutationFn: async (priority: string) => {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });
      if (!res.ok) throw new Error('Failed to update priority');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });

  const createSubtaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to add subtask');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setNewSubtask('');
    },
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, isCompleted }: { subtaskId: string; isCompleted: boolean }) => {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted }),
      });
      if (!res.ok) throw new Error('Failed to update subtask');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });

  const assignUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const isAssigned = task.assignees.some((a: any) => a.user.id === userId);
      const res = await fetch(
        `/api/tasks/${task.id}/assignees${isAssigned ? `?userId=${userId}` : ''}`,
        {
          method: isAssigned ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          ...(isAssigned ? {} : { body: JSON.stringify({ userId }) }),
        }
      );
      if (!res.ok) throw new Error('Failed to update assignees');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });

  const addLabelMutation = useMutation({
    mutationFn: async (labelId: string) => {
      const hasLabel = task.labels.some((l: any) => l.label.id === labelId);
      const res = await fetch(
        `/api/tasks/${task.id}/labels${hasLabel ? `?labelId=${labelId}` : ''}`,
        {
          method: hasLabel ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          ...(hasLabel ? {} : { body: JSON.stringify({ labelId }) }),
        }
      );
      if (!res.ok) throw new Error('Failed to update labels');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });

  const OpenCollapsible = () => {
    setIscollapsibleOpen(prev => !prev);
  };

  // ── Derived values ─────────────────────────────────────────────────────────

  const completedSubtasks = task.subtasks.filter((s: any) => s.isCompleted).length;
  const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent className="max-h-[96%] border lg:h-[96%] h-[98%] md:min-w-[92rem] lg:min-w-[92.5rem] rounded-lg max-w-[92.5rem] !py-0 !p-0 dark:border-[#333333] bg-white dark:bg-[#111111] shadow-none ">
        <div className="h-full flex flex-col">
          {/* Top bar */}
          <div className="px-4 pr-10 items-center border-b h-10 max-h-10 flex justify-between border-gray-100 dark:border-white/[0.06] flex-shrink-0">
            <div className="text-xs text-gray-400 dark:text-gray-500">
              in list
            </div>
            <div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Created by {task.assignees.length > 0 ? task.assignees[0].user.name : 'Unknown'} · {format(new Date(task.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* ── Resizable body ── */}
          <ResizablePanelGroup direction="horizontal" className="flex-1 border-none">

            {/* Left panel */}
            <ResizablePanel>
              <ResizablePanelGroup direction="vertical">
                <ScrollArea className="h-[90vh] overflow-y-auto">

                  {task.coverImage && (
                    <ResizablePanel defaultSize={50} maxSize={65} minSize={35} className="flex h-48 max-h-52 items-start">
                      <div className="h-full w-full flex-grow">
                        <Image
                          className="h-full w-full object-cover"
                          src={task.coverImage}
                          alt=""
                          height={1000}
                          width={1000}
                        />
                      </div>
                    </ResizablePanel>
                  )}

                  <ResizableHandle className="bg-transparent border-none" />

                  <ResizablePanel className="pb-8">
                    <ResizablePanelGroup direction="horizontal" className="flex h-full justify-center">
                      <ResizablePanel defaultSize={60} className={cn("md:max-w-[75%] md:min-w-[75%] pt-5 space-y-4", !iscollapsibleOpen && "md:max-w-[65%] md:min-w-[65%] px-6")}>
                        {/* Side toggle buttons */}
                        <div className="absolute inset-0 left-auto right-2 flex flex-col gap-y-2.5 dark:bg-[#111111] bg-white py-2 h-fit w-fit px-2 top-2 border border-gray-100 dark:border-white/[0.06] rounded-md z-10">
                          <Button variant="ghost" size="icon" className='text-gray-400 dark:text-gray-500 p-1.5 size-0 hover:text-gray-600 dark:hover:text-gray-300' onClick={OpenCollapsible}>
                            {iscollapsibleOpen ? <DoubleArrowRightIcon className='size-4' /> : <DoubleArrowLeftIcon className='size-4' />}
                          </Button>
                          <Button variant="ghost" size="icon" className='text-gray-400 dark:text-gray-500 p-1.5 size-0 hover:text-gray-600 dark:hover:text-gray-300' onClick={OpenCollapsible}>
                            <MessageSquareIcon className="size-4" />
                          </Button>
                        </div>

                        {/* Edit / Save toggle */}
                        {!isEditing ? (
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-lg text-gray-400 dark:text-gray-500 transition-colors"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateTaskMutation.mutate(editedTask)}
                            className="p-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                          >
                            <Check className="size-3.5" />
                          </button>
                        )}

                        {/* Title */}
                        <Input
                          type="text"
                          value={editedTask.title}
                          onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
                          className="!text-3xl border-none px-[1px] font-semibold dark:text-white/80 dark:hover:bg-white/[0.04] placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />

                        {/* Metadata grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <StatusField
                            task={task}
                            isPending={updateStatusMutation.isPending}
                            onUpdate={status => updateStatusMutation.mutate(status)}
                          />

                          <AssigneesField
                            task={task}
                            boardMembers={boardMembers}
                            onAssign={userId => assignUserMutation.mutate(userId)}
                          />

                          <PriorityField
                            task={task}
                            isPending={updatePriorityMutation.isPending}
                            onUpdate={priority => updatePriorityMutation.mutate(priority)}
                          />

                          <DateField
                            id={id}
                            date={date}
                            open={open}
                            month={month}
                            today={today}
                            yesterday={yesterday}
                            lastWeek={lastWeek}
                            lastMonth={lastMonth}
                            lastYear={lastYear}
                            onOpenChange={setOpen}
                            onSelect={handleSelect}
                            onPreset={handlePreset}
                            onMonthChange={setMonth}
                          />

                          <MetaRow icon={<Hourglass className="size-4" />} label="Time estimate">
                            <p className="text-sm text-gray-400 dark:text-gray-400">2 h</p>
                          </MetaRow>

                          <LabelsField
                            task={task}
                            labels={labels}
                            onToggle={labelId => addLabelMutation.mutate(labelId)}
                          />
                        </div>

                        {/* Description */}
                        <div className="mt-2">
                          <Separator className="h-[0.5px] dark:bg-white/[0.06]" />
                          <Textarea
                            value={editedTask.description || ''}
                            onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
                            className="w-full placeholder:text-gray-400 dark:placeholder:text-gray-600 p-3 border-none dark:hover:bg-white/[0.04] outline-none rounded-lg min-h-[100px] text-sm dark:text-gray-200"
                            placeholder="Write, press 'Space' for AI, '/' for commands"
                          />
                        </div>

                        {/* Subtasks */}
                        <SubtasksAccordion
                          task={task}
                          newSubtask={newSubtask}
                          completedSubtasks={completedSubtasks}
                          progress={progress}
                          isCreatePending={createSubtaskMutation.isPending}
                          onNewSubtaskChange={setNewSubtask}
                          onCreateSubtask={title => createSubtaskMutation.mutate(title)}
                          onToggleSubtask={(subtaskId, isCompleted) =>
                            toggleSubtaskMutation.mutate({ subtaskId, isCompleted })
                          }
                        />

                        {/* Attachments */}
                        <AttachmentsAccordion
                          task={task}
                          boardId={boardId}
                          onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ['board', boardId] })}
                          onSetCover={(url) => setCoverImageMutation.mutate(url)}
                          onDeleteAttachment={(id) => deleteAttachmentMutation.mutate(id)}
                        />

                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </ResizablePanel>
                </ScrollArea>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle className="dark:bg-neutral-900 bg-gray-100 w-px" />

            {/* Right panel */}
            <Collapsible open={iscollapsibleOpen} onOpenChange={setIscollapsibleOpen}>
              <ResizablePanel defaultSize={30} minSize={40} maxSize={40} className="dark:bg-neutral-950 bg-gray-50/50 h-full">
                <CollapsibleContent className='h-full'>
                  <ScrollArea className="h-full overflow-auto px-4 py-5">
                    <div className="space-y-5">
                      <ActivityFeed task={task} />

                      <CommentWithAttachments
                        taskId={task.id}
                        comments={task.boardComments || []}
                        onAddComment={(content, attachments) => {
                          fetch(`/api/tasks/${task.id}/comments`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content, attachments }),
                          }).then(() => queryClient.invalidateQueries({ queryKey: ['board', boardId] }));
                        }}
                        onDeleteComment={commentId => {
                          if (confirm('Delete this comment?')) {
                            fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
                              .then(() => queryClient.invalidateQueries({ queryKey: ['board', boardId] }));
                          }
                        }}
                      />
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </ResizablePanel>
            </Collapsible>
          </ResizablePanelGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}