// // // pages/board/[id].tsx
// // import { useSession } from 'next-auth/react';
// // import { useRouter } from 'next/router';
// // import { FC, useEffect, useState, useMemo } from 'react';
// // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
// // import {
// //   Plus,
// //   MoreHorizontal,
// //   Calendar,
// //   Tag,
// //   Paperclip,
// //   MessageSquare,
// //   CheckSquare,
// //   Clock,
// //   User,
// //   X,
// //   Image as ImageIcon,
// //   Trash2,
// //   Edit2,
// //   Filter,
// //   Search,
// //   EditIcon,
// //   ChevronRight,
// //   ChevronLeft
// // } from 'lucide-react';
// // import { format, formatDistanceToNow } from 'date-fns';
// // import { TaskModal } from '@/components/Board/task-modal';
// // import { BoardHeader } from '@/components/Board/board-header';
// // import Layout from '@/components/Layout/Layout';
// // import { getSession, GetSessionParams } from 'next-auth/react';
// // import BoardInsideHeader from '@/components/Board/header';
// // import SideBar from '@/components/ui/mainSideBar';
// // import CircularText from '@/components/ui/CircularTextLoader';
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// // import TaskEmptyState from "@/components/tasks/task-empty-state";
// // import { UserTask } from "interfaces/task";
// // import { TaskList } from "@/components/tasks/task-list";
// // // import BoardsProvider from "store/BoardListContext";
// // import { ScrollArea } from '@/components/ui/scroll-area';
// // import { BoardCoverUpload } from '@/components/Board/board-cover-upload';
// // import { Header } from '@/components/doc-components/Header';
// // import { Card } from '@/components/ui/card';
// // import { useSocket } from 'hooks/useSocket';


// // interface Label {
// //   id: string;
// //   name: string;
// //   color: string;
// // }

// // interface Task {
// //   id: string;
// //   title: string;
// //   description: string | null;
// //   coverImage: string | null;
// //   status: string;
// //   priority: string;
// //   dueDate: string | null;
// //   order: number;
// //   assignees: Array<{
// //     id: string;
// //     user: {
// //       id: string;
// //       name: string | null;
// //       image: string | null;
// //     };
// //   }>;
// //   labels: Array<{
// //     id: string;
// //     label: Label;
// //   }>;
// //   attachments: Array<{
// //     id: string;
// //     filename: string;
// //   }>;
// //   subtasks: Array<{
// //     id: string;
// //     isCompleted: boolean;
// //   }>;
// //   _count: {
// //     boardComments: number;
// //   };
// // }

// // interface Column {
// //   id: string;
// //   title: string;
// //   color: string | null;
// //   order: number;
// //   tasks: Task[];
// // }

// // interface BoardData {
// //   id: string;
// //   title: string;
// //   description: string | null;
// //   coverImage: string | null;
// //   createdAt: string;
// //   updatedAt: string;
// //   owner: {
// //     id: string;
// //     name: string | null;
// //     image: string | null;
// //   };
// //   members: Array<{
// //     id: string;
// //     role: string;
// //     user: {
// //       id: string;
// //       name: string | null;
// //       image: string | null;
// //       email: string;
// //     };
// //   }>;
// //   columns: Column[];
// //   labels: Label[];
// // }


// // interface BoardPageProps { // FIXED: renamed from BoardHeaderProps to avoid conflict
// //   board: BoardData;
// // }

// // interface CircularProgressProps {
// //   percentage: number;
// //   size?: number;
// //   strokeWidth?: number;
// //   circleColor?: string;
// //   progressColor?: string;
// // }

// // const CircularProgress: FC<{
// //   percentage: number;
// //   size?: number;
// //   strokeWidth?: number;
// //   circleColor?: string;
// //   progressColor?: string;
// // }> = ({
// //   percentage,
// //   size = 120,
// //   strokeWidth = 10,
// //   circleColor = '#e5e7eb',
// //   progressColor = '#22c55e'
// // }) => {
// //     const radius = (size - strokeWidth) / 2;
// //     const circumference = radius * 2 * Math.PI;
// //     const strokeDashoffset = circumference - (percentage / 100) * circumference;

// //     // FIXED: This return is now INSIDE the component function
// //     return (
// //       <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
// //         <svg
// //           width={size}
// //           height={size}
// //           viewBox={`0 0 ${size} ${size}`}
// //           className="transform -rotate-90"
// //         >
// //           <circle
// //             cx={size / 2}
// //             cy={size / 2}
// //             r={radius}
// //             fill="transparent"
// //             stroke={circleColor}
// //             strokeWidth={strokeWidth}
// //           />
// //           <circle
// //             cx={size / 2}
// //             cy={size / 2}
// //             r={radius}
// //             fill="transparent"
// //             stroke={progressColor}
// //             strokeWidth={strokeWidth}
// //             strokeDasharray={circumference}
// //             strokeDashoffset={strokeDashoffset}
// //             strokeLinecap="round"
// //             className="transition-all duration-500 ease-out"
// //           />
// //         </svg>
// //         <div className="absolute inset-0 flex items-center justify-center">
// //           <span className="text-2xl font-bold text-gray-900 dark:text-white">
// //             {percentage}%
// //           </span>
// //         </div>
// //       </div>
// //     );
// //   };


// // export default function BoardPage() {
// //   const { data: session, status } = useSession();
// //   const router = useRouter();
// //   const { id } = router.query;
// //   const queryClient = useQueryClient();
// //   const socket = useSocket();
// //   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
// //   const [isCardModalOpen, setIsCardModalOpen] = useState(false);

// //   const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
// //   const [addingColumn, setAddingColumn] = useState(false);
// //   const [newColumnTitle, setNewColumnTitle] = useState('');
// //   const [addingTaskColumnId, setAddingTaskColumnId] = useState<string | null>(null);
// //   const [newTaskTitle, setNewTaskTitle] = useState('');
// //   const [showCoverUpload, setShowCoverUpload] = useState(false);

// //   //  useEffect(() => {
// //   //   if (!socket || !id || !session?.user?.id) return;

// //   //   // Join board room for real-time updates
// //   //   socket.emit('join_board', id);
// //   //   socket.emit('join_user', session.user.id);

// //   //   console.log('[SOCKET] Joined board room:', id);

// //   //   return () => {
// //   //     socket.emit('leave_board', id);
// //   //   };
// //   // }, [socket, id, session?.user?.id]);

// //   // // Listen for real-time updates
// //   // useEffect(() => {
// //   //   if (!socket || !id) return;

// //   //   // Task created - add to column immediately
// //   //   socket.on('task_created', (data) => {
// //   //     if (data.boardId !== id) return;

// //   //     queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //   //       if (!oldData) return oldData;

// //   //       const updatedColumns = oldData.columns.map(col => {
// //   //         if (col.id === data.task.columnId) {
// //   //           return { ...col, tasks: [...col.tasks, data.task] };
// //   //         }
// //   //         return col;
// //   //       });

// //   //       return { ...oldData, columns: updatedColumns };
// //   //     });
// //   //   });

// //    useEffect(() => {
// //     if (!socket || !id) return;

// //     // Join board room immediately
// //     socket.emit('join_board', id);
// //     console.log('[FRONTEND] Requested join board:', id);

// //     // Listen for confirmation
// //     socket.on('joined_board', (data) => {
// //       console.log('[FRONTEND] Successfully joined board room:', data);
// //     });

// //     return () => {
// //       socket.emit('leave_board', id);
// //     };
// //   }, [socket, id]);

// //   // Listen for real-time task updates
// //   useEffect(() => {
// //     if (!socket || !id) return;

// //     // Task created - works for ALL members in the room
// //     socket.on('task_created', (data) => {
// //       console.log('[FRONTEND] Received task_created:', data.task.id);
// //       if (data.boardId !== id) return;

// //       queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //         if (!oldData) return oldData;

// //         // Check if task already exists (avoid duplicates)
// //         const exists = oldData.columns.some(col => 
// //           col.tasks.some(t => t.id === data.task.id)
// //         );
// //         if (exists) return oldData;

// //         const updatedColumns = oldData.columns.map(col => {
// //           if (col.id === data.columnId || col.id === data.task.columnId) {
// //             return { ...col, tasks: [...col.tasks, data.task] };
// //           }
// //           return col;
// //         });

// //         return { ...oldData, columns: updatedColumns };
// //       });
// //     });

// //     // Task updated - replace in place
// //     // socket.on('task_updated', (data) => {
// //     //   if (data.boardId !== id) return;

// //     //   queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //     //     if (!oldData) return oldData;

// //     //     const updatedColumns = oldData.columns.map(col => ({
// //     //       ...col,
// //     //       tasks: col.tasks.map(t => t.id === data.task.id ? data.task : t)
// //     //     }));

// //     //     return { ...oldData, columns: updatedColumns };
// //     //   });
// //     // });

// //      socket.on('task_updated', (data) => {
// //       console.log('[FRONTEND] Received task_updated:', data.task.id);
// //       if (data.boardId !== id) return;

// //       queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //         if (!oldData) return oldData;

// //         const updatedColumns = oldData.columns.map(col => ({
// //           ...col,
// //           tasks: col.tasks.map(t => t.id === data.task.id ? data.task : t)
// //         }));

// //         return { ...oldData, columns: updatedColumns };
// //       });
// //     });

// //     // Task moved - remove from old, add to new (optimistic)
// //     // socket.on('task_moved', (data) => {
// //     //   if (data.boardId !== id) return;

// //     //   queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //     //     if (!oldData) return oldData;

// //     //     const updatedColumns = oldData.columns.map(col => {
// //     //       if (col.id === data.fromColumnId) {
// //     //         // Remove from old column
// //     //         return { ...col, tasks: col.tasks.filter(t => t.id !== data.taskId) };
// //     //       }
// //     //       if (col.id === data.toColumnId) {
// //     //         // Add to new column
// //     //         return { ...col, tasks: [...col.tasks, data.task] };
// //     //       }
// //     //       return col;
// //     //     });

// //     //     return { ...oldData, columns: updatedColumns };
// //     //   });
// //     // });

// //     socket.on('task_moved', (data) => {
// //       console.log('[FRONTEND] Received task_moved:', data.taskId, 'to column:', data.toColumnId);
// //       if (data.boardId !== id) return;

// //       queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //         if (!oldData) return oldData;

// //         const updatedColumns = oldData.columns.map(col => {
// //           if (col.id === data.fromColumnId) {
// //             return { ...col, tasks: col.tasks.filter(t => t.id !== data.taskId) };
// //           }
// //           if (col.id === data.toColumnId) {
// //             // Check if already exists
// //             const exists = col.tasks.some(t => t.id === data.taskId);
// //             if (exists) return col;
// //             return { ...col, tasks: [...col.tasks, data.task] };
// //           }
// //           return col;
// //         });

// //         return { ...oldData, columns: updatedColumns };
// //       });
// //     });

// //     // Task deleted - remove immediately
// //     // socket.on('task_deleted', (data) => {
// //     //   if (data.boardId !== id) return;

// //     //   queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //     //     if (!oldData) return oldData;

// //     //     const updatedColumns = oldData.columns.map(col => ({
// //     //       ...col,
// //     //       tasks: col.tasks.filter(t => t.id !== data.taskId)
// //     //     }));

// //     //     return { ...oldData, columns: updatedColumns };
// //     //   });
// //     // });

// //     socket.on('task_deleted', (data) => {
// //       console.log('[FRONTEND] Received task_deleted:', data.taskId);
// //       if (data.boardId !== id) return;

// //       queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //         if (!oldData) return oldData;

// //         const updatedColumns = oldData.columns.map(col => ({
// //           ...col,
// //           tasks: col.tasks.filter(t => t.id !== data.taskId)
// //         }));

// //         return { ...oldData, columns: updatedColumns };
// //       });
// //     });

// //     return () => {
// //       socket.off('task_created');
// //       socket.off('task_updated');
// //       socket.off('task_moved');
// //       socket.off('task_deleted');
// //       socket.off('joined_board');
// //     };
// //   }, [socket, id, queryClient]);

// //   useEffect(() => {
// //     if (status === 'unauthenticated') {
// //       router.push('/login');
// //     }
// //   }, [status, router]);

// //   const { data: board, isLoading } = useQuery({
// //     queryKey: ['board', id],
// //     queryFn: async () => {
// //       const res = await fetch(`/api/boards/${id}`);
// //       if (!res.ok) throw new Error('Failed to fetch board');
// //       return res.json() as Promise<BoardData>;
// //     },
// //     enabled: !!id && !!session,
// //   });

// //   const { percentage, completedTasks, totalTasks, lastColumnName } = useMemo(() => {
// //     if (!board?.columns || board.columns.length === 0) {
// //       return { percentage: 0, completedTasks: 0, totalTasks: 0, lastColumnName: '' };
// //     }

// //     // Sort columns by order to ensure we get the actual last column
// //     const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);
// //     const lastColumn = sortedColumns[sortedColumns.length - 1];

// //     const total = board.columns.reduce((acc, col) => acc + col.tasks.length, 0);
// //     const completed = lastColumn.tasks.length;
// //     const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

// //     return {
// //       percentage: percent,
// //       completedTasks: completed,
// //       totalTasks: total,
// //       lastColumnName: lastColumn.title
// //     };
// //   }, [board?.columns]);


// //   const updateTaskMutation = useMutation({
// //     mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
// //       const res = await fetch(`/api/tasks/${taskId}`, {
// //         method: 'PUT',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(updates),
// //       });
// //       if (!res.ok) throw new Error('Failed to update task');
// //       return res.json();
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ['board', id] });
// //     },
// //   });

// //   const createColumnMutation = useMutation({
// //     mutationFn: async (title: string) => {
// //       const res = await fetch('/api/columns', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ title, boardId: id }),
// //       });
// //       if (!res.ok) throw new Error('Failed to create column');
// //       return res.json();
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ['board', id] });
// //       setAddingColumn(false);
// //       setNewColumnTitle('');
// //     },
// //   });

// //   const createTaskMutation = useMutation({
// //     mutationFn: async ({ columnId, title }: { columnId: string; title: string }) => {
// //       const res = await fetch('/api/tasks', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           title,
// //           columnId,
// //           boardId: id,
// //           status: 'TODO',
// //         }),
// //       });
// //       if (!res.ok) throw new Error('Failed to create task');
// //       return res.json();
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ['board', id] });
// //       setAddingTaskColumnId(null);
// //       setNewTaskTitle('');
// //     },
// //   });

// //   // const onDragEnd = (result: DropResult) => {
// //   //   if (!result.destination) return;

// //   //   const { source, destination, draggableId, type } = result;

// //   //   if (type === 'column') {
// //   //     // Handle column reordering
// //   //     return;
// //   //   }

// //   //   if (source.droppableId !== destination.droppableId || source.index !== destination.index) {
// //   //     updateTaskMutation.mutate({
// //   //       taskId: draggableId,
// //   //       updates: {
// //   //         columnId: destination.droppableId,
// //   //         order: destination.index,
// //   //       },
// //   //     });
// //   //   }
// //   // };

// //   const onDragEnd = (result: DropResult) => {
// //     if (!result.destination) return;

// //     const { source, destination, draggableId } = result;

// //     if (source.droppableId === destination.droppableId && source.index === destination.index) {
// //       return;
// //     }

// //      const previousData = queryClient.getQueryData(['board', id]);

// //     queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //       if (!oldData) return oldData;

// //       // Find and move task
// //       const task = oldData.columns
// //         .find(c => c.id === source.droppableId)
// //         ?.tasks.find(t => t.id === draggableId);

// //       if (!task) return oldData;

// //       const updatedColumns = oldData.columns.map(col => {
// //         if (col.id === source.droppableId) {
// //           return {
// //             ...col,
// //             tasks: col.tasks.filter(t => t.id !== draggableId)
// //           };
// //         }
// //         if (col.id === destination.droppableId) {
// //           const newTasks = [...col.tasks];
// //           newTasks.splice(destination.index, 0, { ...task, columnId: destination.droppableId });
// //           return { ...col, tasks: newTasks };
// //         }
// //         return col;
// //       });

// //       return { ...oldData, columns: updatedColumns };
// //     });

// //      updateTaskMutation.mutate(
// //       { 
// //         taskId: draggableId, 
// //         updates: { columnId: destination.droppableId, order: destination.index } 
// //       },
// //       {
// //         onError: () => {
// //           // Rollback on error
// //           queryClient.setQueryData(['board', id], previousData);
// //         }
// //       }
// //     );
// //   };

// //   // const getPriorityColor = (priority: string) => {
// //   //   switch (priority) {
// //   //     case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
// //   //     case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
// //   //     case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
// //   //     case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
// //   //     default: return 'bg-gray-100 text-gray-700 border-gray-200';
// //   //   }
// //   // };

// //   if (isLoading || !board) {
// //     return (
// //       <Layout>
// //         <div className="h-screen flex items-center justify-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
// //         </div>
// //       </Layout>
// //     );
// //   }

// //   return (

// //     <div className="flex !overflow-hidden scrollbar-thin2">

// //       <SideBar />
// //       <Layout>
// //         <Tabs
// //           defaultValue="account"
// //           className="w-full !overflow-hidden scrollbar-thin2  h-fit !py-0"
// //         >
// //           <Header />
// //           <TabsContent value="account">
// //             <BoardHeader board={board} />

// //             <div className="flex scrollbar-thin2 justify-start px-4 py-1 mt-2 gap-4 items-start w-full min-h-[83vh] max-h-[86vh] h-[85vh] scrollbar-thin2 !overflow-y-hidden">

// //               <main style={{ backgroundImage: `url(${board.coverImage})` }} className=" bg-white/30 bg-cover bg-center dark:bg-black/30 min-w-[60%] w-full max-w-[100%] box-shadow dark:shadow-none rounded-2xl m-0 min-h-full h-full max-h-full py-2 border-b border-r dark:border-[#262626] relative ">
// //                 <div className="scrollbar-thin2">

// //                   <BoardInsideHeader board={board} />

// //                   <div className="  max-h-full h-[77vh] !overflow-y-hidden">
// //                     <DragDropContext onDragEnd={onDragEnd}>
// //                       <Droppable droppableId="board" type="column" direction="horizontal">
// //                         {(provided) => (
// //                           <div
// //                             {...provided.droppableProps}
// //                             ref={provided.innerRef}
// //                             className="flex-1 overflow-x-auto thin-scrollbar"
// //                           >
// //                             <div className="flex items-start gap-3 p-4 h-full min-w-max">
// //                               {board.columns.map((column, columnIndex) => (
// //                                 <Draggable key={column.id} draggableId={column.id} index={columnIndex}>
// //                                   {(provided, snapshot) => (
// //                                     <div
// //                                       ref={provided.innerRef}
// //                                       {...provided.draggableProps}
// //                                       className={`w-72 flex-shrink-0 ${snapshot.isDragging ? 'opacity-50' : ''}`}
// //                                     >
// //                                       <div
// //                                         {...provided.dragHandleProps}
// //                                         style={{
// //                                           backgroundColor: column.color
// //                                             ? `${column.color}`
// //                                             : '#3b82f6'
// //                                         }} className="dark:!bg-[#101204] !bg-[#F3F3F3] rounded-xl p-2 py-3 max-h-[95%] flex flex-col"
// //                                       >
// //                                         {/* Column Header */}
// //                                         <div className="flex items-center justify-between mb-3">
// //                                           <div className="flex justify-center items-center gap-2">
// //                                             <div style={{ backgroundColor: column.color || '#3b82f6' }} className="flex justify-center rounded-md p-1 items-center gap-1">
// //                                               <div
// //                                                 className=" size-3   rounded-full border-2 border-white"
// //                                                 style={{ backgroundColor: column.color || '#3b82f6' }}
// //                                               ></div>
// //                                               <h3 className="font-semibold uppercase text-xs text-white">{column.title}</h3>

// //                                             </div><span style={{ color: column.color || '#3b82f6' }} className={` font-semibold text-sm rounded-full `}>
// //                                               {column.tasks.length}
// //                                             </span>
// //                                           </div>
// //                                           <button type="button"  className="p-1 hover:bg-gray-200 rounded transition-colors">
// //                                             <MoreHorizontal className="size-4 text-gray-500" />
// //                                           </button>
// //                                         </div>

// //                                         {/* Tasks */}
// //                                         <Droppable droppableId={column.id} type="task">
// //                                           {(provided, snapshot) => (
// //                                             <div
// //                                               {...provided.droppableProps}
// //                                               ref={provided.innerRef}
// //                                               className={`flex-1 overflow-y-auto thin-scrollbar space-y-3 min-h-[50px] max-h-[calc(100vh-300px)] ${snapshot.isDraggingOver ? 'bg-gray-200/50' : ''
// //                                                 }`}
// //                                             >
// //                                               {column.tasks.map((task, taskIndex) => (
// //                                                 <Draggable
// //                                                   key={task.id}
// //                                                   draggableId={task.id}
// //                                                   index={taskIndex}
// //                                                 >
// //                                                   {(provided, snapshot) => (
// //                                                     <div
// //                                                       ref={provided.innerRef}
// //                                                       {...provided.draggableProps}
// //                                                       {...provided.dragHandleProps}
// //                                                       onClick={() => {
// //                                                         setSelectedTask(task);
// //                                                         setIsTaskModalOpen(true);
// //                                                       }}
// //                                                       className={`bg-white dark:bg-[#272727] p-4 rounded-lg shadow-sm  cursor-pointer hover:shadow-md transition-all group ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''
// //                                                         }`}
// //                                                     >
// //                                                       {/* Cover Image */}
// //                                                       {task.coverImage && (
// //                                                         <div className="mb-3 -mx-4 -mt-4 h-24 bg-cover bg-center rounded-t-lg"
// //                                                           style={{ backgroundImage: `url(${task.coverImage})` }}
// //                                                         ></div>
// //                                                       )}

// //                                                       {/* Labels */}
// //                                                       {task.labels.length > 0 && (
// //                                                         <div className="flex flex-wrap gap-1 mb-2">
// //                                                           {task.labels.map(({ label }) => (
// //                                                             <span
// //                                                               key={label.id}
// //                                                               className="text-xs px-2 py-0.5 rounded-full font-medium"
// //                                                               style={{
// //                                                                 backgroundColor: `${label.color}20`,
// //                                                                 color: label.color,
// //                                                                 border: `1px solid ${label.color}40`
// //                                                               }}
// //                                                             >
// //                                                               {label.name}
// //                                                             </span>
// //                                                           ))}
// //                                                         </div>
// //                                                       )}

// //                                                       <h4 className="font-medium text-gray-900 dark:text-[#EEE] mb-2 line-clamp-2">{task.title}</h4>

// //                                                       {/* Meta info */}
// //                                                       <div className="flex items-center justify-between text-gray-500 text-sm">
// //                                                         <div className="flex items-center gap-3">
// //                                                           {task.dueDate && (
// //                                                             <span className={`flex items-center gap-1 text-xs ${new Date(task.dueDate) < new Date() ? 'text-red-600' : ''
// //                                                               }`}>
// //                                                               <Clock className=" size-3  " />
// //                                                               {format(new Date(task.dueDate), 'MMM d')}
// //                                                             </span>
// //                                                           )}

// //                                                           {task.subtasks.length > 0 && (
// //                                                             <span className="flex items-center gap-1 text-xs">
// //                                                               <CheckSquare className=" size-3  " />
// //                                                               {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
// //                                                             </span>
// //                                                           )}

// //                                                           {task._count.boardComments > 0 && (
// //                                                             <span className="flex items-center gap-1 text-xs">
// //                                                               <MessageSquare className=" size-3  " />
// //                                                               {task._count.boardComments}
// //                                                             </span>
// //                                                           )}

// //                                                           {task.attachments.length > 0 && (
// //                                                             <span className="flex items-center gap-1 text-xs">
// //                                                               <Paperclip className=" size-3  " />
// //                                                               {task.attachments.length}
// //                                                             </span>
// //                                                           )}
// //                                                         </div>

// //                                                         {/* Assignees */}
// //                                                         <div className="flex -!gap-x-2">
// //                                                           {task.assignees.slice(0, 3).map(({ user }) => (
// //                                                             <div
// //                                                               key={user.id}
// //                                                               className="size-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600"
// //                                                               title={user.name || ''}
// //                                                             >
// //                                                               {user.name ? user.name.charAt(0).toUpperCase() : <User className=" size-3  " />}
// //                                                             </div>
// //                                                           ))}
// //                                                           {task.assignees.length > 3 && (
// //                                                             <div className="size-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600">
// //                                                               +{task.assignees.length - 3}
// //                                                             </div>
// //                                                           )}
// //                                                         </div>
// //                                                       </div>
// //                                                     </div>
// //                                                   )}
// //                                                 </Draggable>
// //                                               ))}
// //                                               {provided.placeholder}
// //                                             </div>
// //                                           )}
// //                                         </Droppable>

// //                                         {/* Add Task Button */}
// //                                         {addingTaskColumnId === column.id ? (
// //                                           <div className="mt-3">
// //                                             <input
// //                                               type="text"
// //                                               value={newTaskTitle}
// //                                               onChange={(e) => setNewTaskTitle(e.target.value)}
// //                                               onKeyDown={(e) => {
// //                                                 if (e.key === 'Enter' && newTaskTitle.trim()) {
// //                                                   createTaskMutation.mutate({ columnId: column.id, title: newTaskTitle });
// //                                                 } else if (e.key === 'Escape') {
// //                                                   setAddingTaskColumnId(null);
// //                                                   setNewTaskTitle('');
// //                                                 }
// //                                               }}
// //                                               placeholder="Enter task title..."
// //                                               className="w-full px-3 py-2 bg-transparent border border-[#262626] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-[#262626] mb-2"
// //                                               
// //                                             />
// //                                             <div className="flex gap-2">
// //                                               <button type="button" 
// //                                                 onClick={() => {
// //                                                   if (newTaskTitle.trim()) {
// //                                                     createTaskMutation.mutate({ columnId: column.id, title: newTaskTitle });
// //                                                   }
// //                                                 }}
// //                                                 disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
// //                                                 className="px-3 py-1.5  text-white text-sm dark:bg-[#242424] rounded-lg hover:dark:bg-[#333]  disabled:opacity-50"
// //                                               >
// //                                                 Add
// //                                               </button>
// //                                               <button type="button" 
// //                                                 onClick={() => {
// //                                                   setAddingTaskColumnId(null);
// //                                                   setNewTaskTitle('');
// //                                                 }}
// //                                                 className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500"
// //                                               >
// //                                                 <X className="size-4" />
// //                                               </button>
// //                                             </div>
// //                                           </div>
// //                                         ) : (
// //                                           <button type="button" 
// //                                             style={{ color: column.color || '#3b82f6' }}
// //                                             onClick={() => setAddingTaskColumnId(column.id)}
// //                                             className="mt-3 flex items-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 hover:dark:bg-[#262626] w-full py-2 px-3 rounded-lg transition-colors text-sm font-medium"
// //                                           >
// //                                             <Plus className="size-4" />
// //                                             Add task
// //                                           </button>
// //                                         )}
// //                                       </div>
// //                                     </div>
// //                                   )}
// //                                 </Draggable>
// //                               ))}
// //                               {provided.placeholder}

// //                               {/* Add Column */}
// //                               {addingColumn ? (
// //                                 <div className="w-72 flex-shrink-0 bg-gray-100 rounded-lg p-2">
// //                                   <input
// //                                     type="text"
// //                                     value={newColumnTitle}
// //                                     onChange={(e) => setNewColumnTitle(e.target.value)}
// //                                     onKeyDown={(e) => {
// //                                       if (e.key === 'Enter' && newColumnTitle.trim()) {
// //                                         createColumnMutation.mutate(newColumnTitle);
// //                                       } else if (e.key === 'Escape') {
// //                                         setAddingColumn(false);
// //                                         setNewColumnTitle('');
// //                                       }
// //                                     }}
// //                                     placeholder="Enter column title..."
// //                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3"
// //                                     
// //                                   />
// //                                   <div className="flex gap-2">
// //                                     <button type="button" 
// //                                       onClick={() => {
// //                                         if (newColumnTitle.trim()) {
// //                                           createColumnMutation.mutate(newColumnTitle);
// //                                         }
// //                                       }}
// //                                       disabled={!newColumnTitle.trim() || createColumnMutation.isPending}
// //                                       className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
// //                                     >
// //                                       Add Column
// //                                     </button>
// //                                     <button type="button" 
// //                                       onClick={() => {
// //                                         setAddingColumn(false);
// //                                         setNewColumnTitle('');
// //                                       }}
// //                                       className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"
// //                                     >
// //                                       <X className="size-5" />
// //                                     </button>
// //                                   </div>
// //                                 </div>
// //                               ) : (
// //                                 <button type="button" 
// //                                   onClick={() => setAddingColumn(true)}
// //                                   className="w-72 flex-shrink-0 bg-white/80 hover:bg-gray-100 dark:bg-[#242424] rounded-lg p-2 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors h-fit"
// //                                 >
// //                                   <Plus className="size-5" />
// //                                   <span className="font-medium">Add another column</span>
// //                                 </button>
// //                               )}
// //                             </div>
// //                           </div>
// //                         )}
// //                       </Droppable>
// //                     </DragDropContext>
// //                   </div>

// //                 </div>

// //                 {isTaskModalOpen && selectedTask && (
// //                   <TaskModal
// //                     task={selectedTask}
// //                     boardId={board.id}
// //                     boardMembers={board.members}
// //                     labels={board.labels}
// //                     closeModal={() => {
// //                       setIsTaskModalOpen(false);
// //                       setSelectedTask(null);
// //                     }}
// //                   />
// //                 )}

// //                 {showCoverUpload && (
// //                   <BoardCoverUpload
// //                     boardId={board.id}
// //                     currentCover={board.coverImage}
// //                     onClose={() => setShowCoverUpload(false)}
// //                   />
// //                 )}

// //                  <div
// //                     className='absolute inset-0 !bottom-[4rem] top-auto -mr-2 left-auto bg-white dark:bg-black rounded-full p-0.5 dark:text-white h-6 w-6 cursor-pointer flex items-center justify-center'
// //                     onClick={() => setIsCardModalOpen(!isCardModalOpen)}
// //                   >
// //                     {isCardModalOpen ? (
// //                       <ChevronRight className="h-6 w-6" />
// //                     ) : (
// //                       <ChevronLeft className="h-6 w-6" />
// //                     )}
// //                   </div>
// //               </main>

// //               {board && isCardModalOpen && (
// //                 <div className="space-y-3 h-full">
// //                   <Card className=" w-72 p-4 py-2.5 max-h-[74%] min-h-[74%] h-[74%] overflow-hidden dark:bg-black/50 dark:border-t border rounded-2xl box-shadow dark:shadow-none">
// //                    <div className="h-full max-h-full">
// //                     <div className="mb-4">
// //                       <div className="flex justify-between items-center mb-2 bg-muted/90 p-4 rounded-2xl">
// //                         <h3 className="font-semibold capitalize ">
// //                           {board?.title}
// //                         </h3>
// //                         <span className="text-xs font-medium bg-orange-100 text-orange-600 px-2 py-1 rounded">
// //                           SELECTED
// //                         </span>
// //                       </div>
// //                     </div>
// //                     <div className="flex flex-col items-center py-0">
// //                       <CircularProgress percentage={percentage} size={140} strokeWidth={9} />
// //                     </div>

// //                     <div className="py-2">
// //                       <h1 className="font-semibold text-[18px] capitalize">
// //                         {board?.title}
// //                       </h1>
// //                     </div>
// //                     <div className="grid grid-cols-2 gap-4">
// //                       <div className="bg-blue-50 p-3 rounded-xl">
// //                         <div className="text-sm text-gray-600">Total</div>
// //                         <div className="text-xl dark:text-black font-semibold">
// //                           {board?.columns?.length || 0}
// //                         </div>
// //                       </div>
// //                       <div className="bg-green-50 p-3 rounded-xl">
// //                         <div className="text-sm text-gray-600">
// //                           {board?.columns &&
// //                             board.columns.length > 0
// //                             ? board.columns[0].title
// //                             : 'No columns'}
// //                         </div>
// //                         <div className="text-xl dark:text-black font-semibold">
// //                           {board?.columns &&
// //                             board.columns.length > 0
// //                             ? (board.columns[0]?.tasks?.length ?? 0)
// //                             : 0}
// //                         </div>
// //                       </div>
// //                       <div className="bg-purple-50 p-3 rounded-xl">
// //                         <div className="text-sm text-gray-600">
// //                           {' '}
// //                           {board?.columns &&
// //                             board.columns.length > 1
// //                             ? board.columns[1].title
// //                             : 'No columns'}
// //                         </div>
// //                         <div className="text-xl dark:text-black font-semibold">
// //                           {board?.columns?.[1]?.tasks?.length || 0}
// //                         </div>
// //                       </div>
// //                       <div className="bg-orange-50 p-3 rounded-xl">
// //                         <div className="text-sm text-gray-600">
// //                           {' '}
// //                           {board?.columns &&
// //                             board.columns.length > 2
// //                             ? board.columns[2].title
// //                             : 'No columns'}
// //                         </div>
// //                         <div className="text-xl dark:text-black font-semibold">
// //                           {board?.columns?.[2]?.tasks?.length || 0}
// //                         </div>
// //                       </div>
// //                     </div>
// //                     </div>
// //                   </Card>
// //                   <Card className="p-4 py-2 max-h-[24%] h-[24%] overflow-y-auto space-y-4 border-none rounded-2xl box-shadow dark:shadow-none">
// //                     <div className="flex gap-3 justify-start items-center">
// //                       <Clock className="text-white p-2 h-9 w-9 bg-purple-400 rounded-sm" />
// //                       <div className="mr-10">
// //                         <p className="text-sm font-semibold text-neutral-500">
// //                           {board?.createdAt
// //                             ? new Date(board.createdAt)
// //                               .toLocaleDateString('en-US', {
// //                                 weekday: 'short',
// //                                 day: '2-digit',
// //                                 month: 'long',
// //                               })
// //                               .toLowerCase()
// //                             : ''}

// //                         </p>
// //                         <p className="text-md font-semibold">
// //                           {board?.createdAt
// //                             ? new Date(
// //                               board.createdAt
// //                             ).toLocaleTimeString('en-US', {
// //                               hour: '2-digit',
// //                               minute: '2-digit',
// //                               hour12: true,
// //                             })
// //                             : ''}
// //                         </p>
// //                       </div>
// //                       <EditIcon className="h-5 w-5" />
// //                     </div>
// //                     <hr />
// //                     <div className="flex gap-3 justify-start items-center">
// //                       {/* <MdEmail className="text-white p-2 h-9 w-9 bg-blue-500 rounded-sm" /> */}
// //                       <div className="mr-10">
// //                         <p className="text-sm font-semibold text-neutral-500">
// //                           {board?.updatedAt
// //                             ? new Date(board.updatedAt)
// //                               .toLocaleDateString('en-US', {
// //                                 weekday: 'short',
// //                                 day: '2-digit',
// //                                 month: 'long',
// //                               })
// //                               .toLowerCase()
// //                             : ''}
// //                         </p>
// //                         <p className="text-md font-semibold">
// //                           {board?.updatedAt
// //                             ? new Date(
// //                               board.updatedAt
// //                             ).toLocaleTimeString('en-US', {
// //                               hour: '2-digit',
// //                               minute: '2-digit',
// //                               hour12: true,
// //                             })
// //                             : ''}
// //                         </p>
// //                       </div>
// //                       <EditIcon className="h-5 w-5" />
// //                     </div>
// //                   </Card>
// //                 </div>
// //               )}
// //             </div>
// //           </TabsContent>
// //           <TabsContent value="password" className='  p-0 !overflow-y-hidden'>
// //             <ScrollArea className="h-full !overflow-y-scroll">
// //               {/* <BoardListView/> */}
// //               hello
// //             </ScrollArea>
// //           </TabsContent>
// //         </Tabs>
// //       </Layout>
// //     </div>

// //   );
// // }

// // function BoardListView() {
// //   const [task, setTask] = useState<UserTask[]>([]);
// //   const [isLoading, setIsLoading] = useState(true);

// //   useEffect(() => {
// //     const fetchTasks = async () => {
// //       setIsLoading(true);
// //       try {
// //         const response = await fetch("/api/tasks", {
// //           method: "GET",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //         });

// //         if (!response.ok) {
// //           throw new Error("Failed to fetch tasks");
// //         }

// //         const data = await response.json();

// //         // Transform the API response to match UserTask type
// //         const transformedTasks = data.map((task: any) => ({
// //           id: task.uuid || task.id,
// //           title: task.name,
// //           description: task.description,
// //           priority: task.priority || 'medium',
// //           dueTime: task.due_date || task.createdAt,
// //           createdAt: task.created_at || task.createdAt,
// //           itsDone: task.completed || task.itsDone || false,
// //           category: task.category || {
// //             name: task.column?.name || 'No Category',
// //             color: task.column?.color,
// //             icon: task.column?.icon
// //           }
// //         }));

// //         setTask(transformedTasks);
// //       } catch (error) {
// //         console.error("Error fetching tasks:", error);
// //       }
// //       setIsLoading(false);
// //     };

// //     const verifyUser = async () => {
// //       try {
// //         const response = await fetch("/api/auth/services-signin", {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //         });

// //         if (!response.ok) {
// //           console.error("Failed to verify user");
// //         }
// //       } catch (error) {
// //         console.error("Error verifying user:", error);
// //       }
// //     };

// //     fetchTasks();
// //     verifyUser();
// //   }, []);

// //   const handleTaskUpdate = (updatedTask: UserTask) => {
// //     setTask(prevTasks =>
// //       prevTasks.map(task =>
// //         task.id === updatedTask.id ? updatedTask : task
// //       )
// //     );
// //   };

// //   const handleTaskDelete = (taskId: string) => {
// //     setTask(prevTasks =>
// //       prevTasks.filter(task => task.id !== taskId)
// //     );
// //   };

// //   return (
// //     <BoardsProvider>
// //       <div>
// //         {isLoading ? (
// //           <div className="h-screen flex items-center justify-center">
// //             <CircularText
// //               text="CONFERIO*CALLS*"
// //               onHover="speedUp"
// //               spinDuration={5}
// //               className="custom-class"
// //             />
// //           </div>
// //         ) : task.length > 0 ? (
// //           <TaskList
// //             task={task as any}
// //             setTask={setTask as any}
// //             onTaskUpdate={handleTaskUpdate}
// //             onTaskDelete={handleTaskDelete}
// //           />
// //         ) : (
// //           <TaskEmptyState />
// //         )}
// //       </div>
// //     </BoardsProvider>
// //   );
// // }

// // export async function getServerSideProps(context: GetSessionParams) {
// //   const session = await getSession(context);

// //   if (!session) {
// //     return {
// //       redirect: {
// //         destination: '/login',
// //         permanent: false,
// //       },
// //     };
// //   }

// //   return {
// //     props: { session },
// //   };
// // }


// // // pages/board/[id].tsx
// // import { useSession } from 'next-auth/react';
// // import { useRouter } from 'next/router';
// // import { FC, useEffect, useState, useMemo } from 'react';
// // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
// // import {
// //   Plus,
// //   MoreHorizontal,
// //   Calendar,
// //   Tag,
// //   Paperclip,
// //   MessageSquare,
// //   CheckSquare,
// //   Clock,
// //   User,
// //   X,
// //   Image as ImageIcon,
// //   Trash2,
// //   Edit2,
// //   Filter,
// //   Search,
// //   EditIcon,
// //   ChevronRight,
// //   ChevronLeft
// // } from 'lucide-react';
// // import { format, formatDistanceToNow } from 'date-fns';
// // import { TaskModal } from '@/components/Board/task-modal';
// // import { BoardHeader } from '@/components/Board/board-header';
// // import Layout from '@/components/Layout/Layout';
// // import { getSession, GetSessionParams } from 'next-auth/react';
// // import BoardInsideHeader from '@/components/Board/header';
// // import SideBar from '@/components/ui/mainSideBar';
// // import CircularText from '@/components/ui/CircularTextLoader';
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// // import TaskEmptyState from "@/components/tasks/task-empty-state";
// // import { UserTask } from "interfaces/task";
// // import { TaskList } from "@/components/tasks/task-list";
// // import { ScrollArea } from '@/components/ui/scroll-area';
// // import { BoardCoverUpload } from '@/components/Board/board-cover-upload';
// // import { Header } from '@/components/doc-components/Header';
// // import { Card } from '@/components/ui/card';
// // import { useSocket } from 'hooks/useTaskSocket';
// // import { useBoardRealtime } from 'hooks/useBoardRealtime';

// // interface Label {
// //   id: string;
// //   name: string;
// //   color: string;
// // }

// // interface Task {
// //   id: string;
// //   title: string;
// //   description: string | null;
// //   coverImage: string | null;
// //   status: string;
// //   priority: string;
// //   dueDate: string | null;
// //   order: number;
// //   columnId?: string;
// //   assignees: Array<{
// //     id: string;
// //     user: {
// //       id: string;
// //       name: string | null;
// //       image: string | null;
// //     };
// //   }>;
// //   labels: Array<{
// //     id: string;
// //     label: Label;
// //   }>;
// //   attachments: Array<{
// //     id: string;
// //     filename: string;
// //   }>;
// //   subtasks: Array<{
// //     id: string;
// //     isCompleted: boolean;
// //   }>;
// //   _count: {
// //     boardComments: number;
// //     attachments?: number;
// //     subtasks?: number;
// //   };
// // }

// // interface Column {
// //   id: string;
// //   title: string;
// //   color: string | null;
// //   order: number;
// //   tasks: Task[];
// // }

// // interface BoardData {
// //   id: string;
// //   title: string;
// //   description: string | null;
// //   coverImage: string | null;
// //   createdAt: string;
// //   updatedAt: string;
// //   owner: {
// //     id: string;
// //     name: string | null;
// //     image: string | null;
// //   };
// //   members: Array<{
// //     id: string;
// //     role: string;
// //     user: {
// //       id: string;
// //       name: string | null;
// //       image: string | null;
// //       email: string;
// //     };
// //   }>;
// //   columns: Column[];
// //   labels: Label[];
// // }

// // interface BoardPageProps {
// //   board: BoardData;
// // }

// // const CircularProgress: FC<{
// //   percentage: number;
// //   size?: number;
// //   strokeWidth?: number;
// //   circleColor?: string;
// //   progressColor?: string;
// // }> = ({
// //   percentage,
// //   size = 120,
// //   strokeWidth = 10,
// //   circleColor = '#e5e7eb',
// //   progressColor = '#22c55e'
// // }) => {
// //     const radius = (size - strokeWidth) / 2;
// //     const circumference = radius * 2 * Math.PI;
// //     const strokeDashoffset = circumference - (percentage / 100) * circumference;

// //     return (
// //       <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
// //         <svg
// //           width={size}
// //           height={size}
// //           viewBox={`0 0 ${size} ${size}`}
// //           className="transform -rotate-90"
// //         >
// //           <circle
// //             cx={size / 2}
// //             cy={size / 2}
// //             r={radius}
// //             fill="transparent"
// //             stroke={circleColor}
// //             strokeWidth={strokeWidth}
// //           />
// //           <circle
// //             cx={size / 2}
// //             cy={size / 2}
// //             r={radius}
// //             fill="transparent"
// //             stroke={progressColor}
// //             strokeWidth={strokeWidth}
// //             strokeDasharray={circumference}
// //             strokeDashoffset={strokeDashoffset}
// //             strokeLinecap="round"
// //             className="transition-all duration-500 ease-out"
// //           />
// //         </svg>
// //         <div className="absolute inset-0 flex items-center justify-center">
// //           <span className="text-2xl font-bold text-gray-900 dark:text-white">
// //             {percentage}%
// //           </span>
// //         </div>
// //       </div>
// //     );
// //   };

// // export default function BoardPage() {
// //   const { data: session, status } = useSession();
// //   const router = useRouter();
// //   const { id } = router.query;
// //   const queryClient = useQueryClient();
// //   const socket = useSocket();

// //   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
// //   const [isCardModalOpen, setIsCardModalOpen] = useState(false);
// //   const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
// //   const [addingColumn, setAddingColumn] = useState(false);
// //   const [newColumnTitle, setNewColumnTitle] = useState('');
// //   const [addingTaskColumnId, setAddingTaskColumnId] = useState<string | null>(null);
// //   const [newTaskTitle, setNewTaskTitle] = useState('');
// //   const [showCoverUpload, setShowCoverUpload] = useState(false);

// //   // Join board room for real-time updates
// //   // useEffect(() => {
// //   //   if (!socket || !id) return;

// //   //   socket.emit('join_board', id);
// //   //   console.log('[FRONTEND] Joined board room:', id);

// //   //   return () => {
// //   //     socket.emit('leave_board', id);
// //   //   };
// //   // }, [socket, id]);

// //   // // Listen for real-time updates
// //   // useEffect(() => {
// //   //   if (!socket || !id) return;

// //   //   // Task created
// //   //   socket.on('task_created', (data) => {
// //   //     console.log('[FRONTEND] Task created:', data.task.id);
// //   //     if (data.boardId !== id) return;

// //   //     queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //   //       if (!oldData) return oldData;

// //   //       // Check if already exists
// //   //       const exists = oldData.columns.some(col =>
// //   //         col.tasks.some(t => t.id === data.task.id)
// //   //       );
// //   //       if (exists) return oldData;

// //   //       // Ensure task has all required fields with defaults
// //   //       const newTask = {
// //   //         ...data.task,
// //   //         subtasks: data.task.subtasks || [],
// //   //         attachments: data.task.attachments || [],
// //   //         assignees: data.task.assignees || [],
// //   //         labels: data.task.labels || [],
// //   //         _count: data.task._count || { boardComments: 0, attachments: 0, subtasks: 0 }
// //   //       };

// //   //       const updatedColumns = oldData.columns.map(col => {
// //   //         if (col.id === data.columnId) {
// //   //           return { ...col, tasks: [...col.tasks, newTask] };
// //   //         }
// //   //         return col;
// //   //       });

// //   //       return { ...oldData, columns: updatedColumns };
// //   //     });
// //   //   });

// //   //   // Task updated (general updates)
// //   //   socket.on('task_updated', (data) => {
// //   //     console.log('[FRONTEND] Task updated:', data.task.id);
// //   //     if (data.boardId !== id) return;

// //   //     queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //   //       if (!oldData) return oldData;

// //   //       const updatedColumns = oldData.columns.map(col => ({
// //   //         ...col,
// //   //         tasks: col.tasks.map(t => {
// //   //           if (t.id === data.task.id) {
// //   //             return {
// //   //               ...data.task,
// //   //               subtasks: data.task.subtasks || t.subtasks || [],
// //   //               attachments: data.task.attachments || t.attachments || [],
// //   //               assignees: data.task.assignees || t.assignees || [],
// //   //               labels: data.task.labels || t.labels || [],
// //   //               _count: data.task._count || t._count || { boardComments: 0 }
// //   //             };
// //   //           }
// //   //           return t;
// //   //         })
// //   //       }));

// //   //       return { ...oldData, columns: updatedColumns };
// //   //     });
// //   //   });

// //   //   // Task moved between columns
// //   //   socket.on('task_moved', (data) => {
// //   //     console.log('[FRONTEND] Task moved:', data.taskId);
// //   //     if (data.boardId !== id) return;

// //   //     queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //   //       if (!oldData) return oldData;

// //   //       // Find the task in old column
// //   //       let movedTask: Task | undefined;

// //   //       const updatedColumns = oldData.columns.map(col => {
// //   //         if (col.id === data.fromColumnId) {
// //   //           movedTask = col.tasks.find(t => t.id === data.taskId);
// //   //           return { ...col, tasks: col.tasks.filter(t => t.id !== data.taskId) };
// //   //         }
// //   //         return col;
// //   //       });

// //   //       if (movedTask) {
// //   //         // Update task with new column info
// //   //         const updatedTask = { ...movedTask, columnId: data.toColumnId };

// //   //         return {
// //   //           ...oldData,
// //   //           columns: updatedColumns.map(col => {
// //   //             if (col.id === data.toColumnId) {
// //   //               return { ...col, tasks: [...col.tasks, updatedTask] };
// //   //             }
// //   //             return col;
// //   //           })
// //   //         };
// //   //       }

// //   //       return oldData;
// //   //     });
// //   //   });

// //   //   // Task deleted
// //   //   socket.on('task_deleted', (data) => {
// //   //     console.log('[FRONTEND] Task deleted:', data.taskId);
// //   //     if (data.boardId !== id) return;

// //   //     queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //   //       if (!oldData) return oldData;

// //   //       const updatedColumns = oldData.columns.map(col => ({
// //   //         ...col,
// //   //         tasks: col.tasks.filter(t => t.id !== data.taskId)
// //   //       }));

// //   //       return { ...oldData, columns: updatedColumns };
// //   //     });
// //   //   });

// //   //   return () => {
// //   //     socket.off('task_created');
// //   //     socket.off('task_updated');
// //   //     socket.off('task_moved');
// //   //     socket.off('task_deleted');
// //   //   };
// //   // }, [socket, id, queryClient]);

// //     useBoardRealtime(id);


// // // const onDragEnd = (result: DropResult) => {
// // //     if (!result.destination) return;
// // //     const { source, destination, draggableId } = result;

// // //     if (
// // //       source.droppableId === destination.droppableId &&
// // //       source.index === destination.index
// // //     ) {
// // //       return;
// // //     }

// // //     // Save snapshot for rollback
// // //     const snapshot = queryClient.getQueryData(['board', id]);

// // //     // ✅ Update cache optimistically — card moves instantly
// // //     queryClient.setQueryData(['board', id], (old: any) => {
// // //       if (!old) return old;

// // //       let movedTask: any = null;

// // //       const columnsWithoutTask = old.columns.map((col: any) => {
// // //         if (col.id === source.droppableId) {
// // //           movedTask = col.tasks[source.index];
// // //           return { ...col, tasks: col.tasks.filter((_: any, i: number) => i !== source.index) };
// // //         }
// // //         return col;
// // //       });

// // //       if (!movedTask) return old;
// // //       movedTask = { ...movedTask, columnId: destination.droppableId };

// // //       const finalColumns = columnsWithoutTask.map((col: any) => {
// // //         if (col.id === destination.droppableId) {
// // //           const newTasks = [...col.tasks];
// // //           newTasks.splice(destination.index, 0, movedTask);
// // //           return { ...col, tasks: newTasks };
// // //         }
// // //         return col;
// // //       });

// // //       return { ...old, columns: finalColumns };
// // //     });

// // //     // Send to API — socket will propagate to other members
// // //     fetch(`/api/tasks/${draggableId}`, {
// // //       method: 'PUT',
// // //       headers: { 'Content-Type': 'application/json' },
// // //       body: JSON.stringify({
// // //         columnId: destination.droppableId,
// // //         order: destination.index,
// // //       }),
// // //     }).catch(() => {
// // //       // Rollback on error
// // //       queryClient.setQueryData(['board', id], snapshot);
// // //     });
// // //   };

// //   useEffect(() => {
// //     if (status === 'unauthenticated') {
// //       router.push('/login');
// //     }
// //   }, [status, router]);

// //   const { data: board, isLoading } = useQuery({
// //     queryKey: ['board', id],
// //     queryFn: async () => {
// //       const res = await fetch(`/api/boards/${id}`);
// //       if (!res.ok) throw new Error('Failed to fetch board');
// //       const data = await res.json();

// //       // Ensure all tasks have subtasks array
// //       data.columns = data.columns.map((col: Column) => ({
// //         ...col,
// //         tasks: col.tasks.map((task: Task) => ({
// //           ...task,
// //           subtasks: task.subtasks || [],
// //           attachments: task.attachments || [],
// //           assignees: task.assignees || [],
// //           labels: task.labels || [],
// //           _count: task._count || { boardComments: 0, attachments: 0, subtasks: 0 }
// //         }))
// //       }));

// //       return data as BoardData;
// //     },
// //     enabled: !!id && !!session,
// //   });

// //   const { percentage, completedTasks, totalTasks, lastColumnName } = useMemo(() => {
// //     if (!board?.columns || board.columns.length === 0) {
// //       return { percentage: 0, completedTasks: 0, totalTasks: 0, lastColumnName: '' };
// //     }

// //     const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);
// //     const lastColumn = sortedColumns[sortedColumns.length - 1];

// //     const total = board.columns.reduce((acc, col) => acc + col.tasks.length, 0);
// //     const completed = lastColumn.tasks.length;
// //     const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

// //     return {
// //       percentage: percent,
// //       completedTasks: completed,
// //       totalTasks: total,
// //       lastColumnName: lastColumn.title
// //     };
// //   }, [board?.columns]);

// //   // const updateTaskMutation = useMutation({
// //   //   mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
// //   //     const res = await fetch(`/api/tasks/${taskId}`, {
// //   //       method: 'PUT',
// //   //       headers: { 'Content-Type': 'application/json' },
// //   //       body: JSON.stringify(updates),
// //   //     });
// //   //     if (!res.ok) throw new Error('Failed to update task');
// //   //     return res.json();
// //   //   },
// //   //   onSuccess: () => {
// //   //     queryClient.invalidateQueries({ queryKey: ['board', id] });
// //   //   },
// //   // });

// //   const updateTaskMutation = useMutation({
// //   mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
// //     const res = await fetch(`/api/tasks/${taskId}`, {
// //       method: 'PUT',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify(updates),
// //     });
// //     if (!res.ok) throw new Error('Failed to update task');
// //     return res.json();
// //   },
// //   // ✅ NO onSuccess invalidateQueries here — socket handles all members
// //   // If you need to update the task detail modal, do it here:
// //   onSuccess: (updatedTask) => {
// //     // Only update the specific task in cache, don't invalidate the whole board
// //     queryClient.setQueryData(['board', id], (old: any) => {
// //       if (!old) return old;
// //       return {
// //         ...old,
// //         columns: old.columns.map((col: any) => ({
// //           ...col,
// //           tasks: col.tasks.map((t: any) =>
// //             t.id === updatedTask.id ? { ...t, ...updatedTask } : t
// //           ),
// //         })),
// //       };
// //     });
// //   },
// // });

// //   const createColumnMutation = useMutation({
// //     mutationFn: async (title: string) => {
// //       const res = await fetch('/api/columns', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ title, boardId: id }),
// //       });
// //       if (!res.ok) throw new Error('Failed to create column');
// //       return res.json();
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ['board', id] });
// //       setAddingColumn(false);
// //       setNewColumnTitle('');
// //     },
// //   });

// //   // const createTaskMutation = useMutation({
// //   //   mutationFn: async ({ columnId, title }: { columnId: string; title: string }) => {
// //   //     const res = await fetch('/api/tasks', {
// //   //       method: 'POST',
// //   //       headers: { 'Content-Type': 'application/json' },
// //   //       body: JSON.stringify({
// //   //         title,
// //   //         columnId,
// //   //         boardId: id,
// //   //         status: 'TODO',
// //   //       }),
// //   //     });
// //   //     if (!res.ok) throw new Error('Failed to create task');
// //   //     return res.json();
// //   //   },
// //   //   onSuccess: () => {
// //   //     setAddingTaskColumnId(null);
// //   //     setNewTaskTitle('');
// //   //     // Don't invalidate - socket will handle the update
// //   //   },
// //   // });

// //   const createTaskMutation = useMutation({
// //   mutationFn: async ({ columnId, title }: { columnId: string; title: string }) => {
// //     const res = await fetch('/api/tasks', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({
// //         title,
// //         columnId,
// //         boardId: id,
// //         status: 'TODO',
// //       }),
// //     });
// //     if (!res.ok) throw new Error('Failed to create task');
// //     return res.json();
// //   },
// //   onSuccess: () => {
// //     setAddingTaskColumnId(null);
// //     setNewTaskTitle('');
// //     // ✅ NO invalidateQueries — socket event handles the board update for all members
// //   },
// // });

// //   // const onDragEnd = (result: DropResult) => {
// //   //   if (!result.destination) return;

// //   //   const { source, destination, draggableId } = result;

// //   //   if (source.droppableId === destination.droppableId && source.index === destination.index) {
// //   //     return;
// //   //   }

// //   //   const previousData = queryClient.getQueryData(['board', id]);

// //   //   // Optimistic update
// //   //   queryClient.setQueryData(['board', id], (oldData: BoardData | undefined) => {
// //   //     if (!oldData) return oldData;

// //   //     const task = oldData.columns
// //   //       .find(c => c.id === source.droppableId)
// //   //       ?.tasks.find(t => t.id === draggableId);

// //   //     if (!task) return oldData;

// //   //     const updatedColumns = oldData.columns.map(col => {
// //   //       if (col.id === source.droppableId) {
// //   //         return {
// //   //           ...col,
// //   //           tasks: col.tasks.filter(t => t.id !== draggableId)
// //   //         };
// //   //       }
// //   //       if (col.id === destination.droppableId) {
// //   //         const newTasks = [...col.tasks];
// //   //         newTasks.splice(destination.index, 0, { ...task, columnId: destination.droppableId });
// //   //         return { ...col, tasks: newTasks };
// //   //       }
// //   //       return col;
// //   //     });

// //   //     return { ...oldData, columns: updatedColumns };
// //   //   });

// //   //   updateTaskMutation.mutate(
// //   //     {
// //   //       taskId: draggableId,
// //   //       updates: { columnId: destination.droppableId, order: destination.index }
// //   //     },
// //   //     {
// //   //       onError: () => {
// //   //         queryClient.setQueryData(['board', id], previousData);
// //   //       }
// //   //     }
// //   //   );
// //   // };

// //   const onDragEnd = (result: DropResult) => {
// //     if (!result.destination) return;
// //     const { source, destination, draggableId } = result;

// //     if (
// //       source.droppableId === destination.droppableId &&
// //       source.index === destination.index
// //     ) {
// //       return;
// //     }

// //     // Save snapshot for rollback
// //     const snapshot = queryClient.getQueryData(['board', id]);

// //     // ✅ Update cache optimistically — card moves instantly
// //     queryClient.setQueryData(['board', id], (old: any) => {
// //       if (!old) return old;

// //       let movedTask: any = null;

// //       const columnsWithoutTask = old.columns.map((col: any) => {
// //         if (col.id === source.droppableId) {
// //           movedTask = col.tasks[source.index];
// //           return { ...col, tasks: col.tasks.filter((_: any, i: number) => i !== source.index) };
// //         }
// //         return col;
// //       });

// //       if (!movedTask) return old;
// //       movedTask = { ...movedTask, columnId: destination.droppableId };

// //       const finalColumns = columnsWithoutTask.map((col: any) => {
// //         if (col.id === destination.droppableId) {
// //           const newTasks = [...col.tasks];
// //           newTasks.splice(destination.index, 0, movedTask);
// //           return { ...col, tasks: newTasks };
// //         }
// //         return col;
// //       });

// //       return { ...old, columns: finalColumns };
// //     });

// //     // Send to API — socket will propagate to other members
// //     // fetch(`/api/tasks/${draggableId}`, {
// //     //   method: 'PUT',
// //     //   headers: { 'Content-Type': 'application/json' },
// //     //   body: JSON.stringify({
// //     //     columnId: destination.droppableId,
// //     //     order: destination.index,
// //     //   }),
// //     // }).catch(() => {
// //     //   // Rollback on error
// //     //   queryClient.setQueryData(['board', id], snapshot);
// //     // });
// //   };

// //   if (isLoading || !board) {
// //     return (
// //       <Layout>
// //         <div className="h-screen flex items-center justify-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
// //         </div>
// //       </Layout>
// //     );
// //   }

// //   return (
// //     <div className="flex !overflow-hidden scrollbar-thin2">
// //       <SideBar />
// //       <Layout>
// //         <Tabs defaultValue="account" className="w-full !overflow-hidden scrollbar-thin2 h-fit !py-0">
// //           <Header />
// //           <TabsContent value="account">
// //             <BoardHeader board={board} />
// //             <div className="flex scrollbar-thin2 justify-start px-4 py-1 mt-2 gap-4 items-start w-full min-h-[83vh] max-h-[86vh] h-[85vh] scrollbar-thin2 !overflow-y-hidden">
// //               <main style={{ backgroundImage: `url(${board.coverImage})` }} className="bg-white/30 bg-cover bg-center dark:bg-black/30 min-w-[60%] w-full max-w-[100%] box-shadow dark:shadow-none rounded-2xl m-0 min-h-full h-full max-h-full py-2 border-b border-r dark:border-[#262626] relative">
// //                 <div className="scrollbar-thin2">
// //                   <BoardInsideHeader board={board} />
// //                   <div className="max-h-full h-[77vh] !overflow-y-hidden">
// //                     <DragDropContext onDragEnd={onDragEnd}>
// //                       <Droppable droppableId="board" type="column" direction="horizontal">
// //                         {(provided) => (
// //                           <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-x-auto thin-scrollbar">
// //                             <div className="flex items-start gap-3 p-4 h-full min-w-max">
// //                               {board.columns.map((column, columnIndex) => (
// //                                 <Draggable key={column.id} draggableId={column.id} index={columnIndex}>
// //                                   {(provided, snapshot) => (
// //                                     <div ref={provided.innerRef} {...provided.draggableProps} className={`w-72 flex-shrink-0 ${snapshot.isDragging ? 'opacity-50' : ''}`}>
// //                                       <div {...provided.dragHandleProps} style={{ backgroundColor: column.color ? `${column.color}` : '#3b82f6' }} className="dark:!bg-[#101204] !bg-[#F3F3F3] rounded-xl p-2 py-3 max-h-[95%] flex flex-col">
// //                                         <div className="flex items-center justify-between mb-3">
// //                                           <div className="flex justify-center items-center gap-2">
// //                                             <div style={{ backgroundColor: column.color || '#3b82f6' }} className="flex justify-center rounded-md p-1 items-center gap-1">
// //                                               <div className=" size-3   rounded-full border-2 border-white" style={{ backgroundColor: column.color || '#3b82f6' }}></div>
// //                                               <h3 className="font-semibold uppercase text-xs text-white">{column.title}</h3>
// //                                             </div>
// //                                             <span style={{ color: column.color || '#3b82f6' }} className="font-semibold text-sm rounded-full">
// //                                               {column.tasks.length}
// //                                             </span>
// //                                           </div>
// //                                           <button type="button"  className="p-1 hover:bg-gray-200 rounded transition-colors">
// //                                             <MoreHorizontal className="size-4 text-gray-500" />
// //                                           </button>
// //                                         </div>

// //                                         <Droppable droppableId={column.id} type="task">
// //                                           {(provided, snapshot) => (
// //                                             <div {...provided.droppableProps} ref={provided.innerRef} className={`flex-1 overflow-y-auto thin-scrollbar space-y-3 min-h-[50px] max-h-[calc(100vh-300px)] ${snapshot.isDraggingOver ? 'bg-gray-200/50' : ''}`}>
// //                                               {column.tasks.map((task, taskIndex) => (
// //                                                 <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
// //                                                   {(provided, snapshot) => (
// //                                                     <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => { setSelectedTask(task); setIsTaskModalOpen(true); }} className={`bg-white dark:bg-[#272727] p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all group ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}>
// //                                                       {task.coverImage && (
// //                                                         <div className="mb-3 -mx-4 -mt-4 h-24 bg-cover bg-center rounded-t-lg" style={{ backgroundImage: `url(${task.coverImage})` }}></div>
// //                                                       )}

// //                                                       {task.labels?.length > 0 && (
// //                                                         <div className="flex flex-wrap gap-1 mb-2">
// //                                                           {task.labels.map(({ label }) => (
// //                                                             <span key={label.id} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}40` }}>
// //                                                               {label.name}
// //                                                             </span>
// //                                                           ))}
// //                                                         </div>
// //                                                       )}

// //                                                       <h4 className="font-medium text-gray-900 dark:text-[#EEE] mb-2 line-clamp-2">{task.title}</h4>

// //                                                       <div className="flex items-center justify-between text-gray-500 text-sm">
// //                                                         <div className="flex items-center gap-3">
// //                                                           {task.dueDate && (
// //                                                             <span className={`flex items-center gap-1 text-xs ${new Date(task.dueDate) < new Date() ? 'text-red-600' : ''}`}>
// //                                                               <Clock className=" size-3  " />
// //                                                               {format(new Date(task.dueDate), 'MMM d')}
// //                                                             </span>
// //                                                           )}

// //                                                           {/* FIX: Optional chaining for subtasks */}
// //                                                           {task.subtasks && task.subtasks.length > 0 && (
// //                                                             <span className="flex items-center gap-1 text-xs">
// //                                                               <CheckSquare className=" size-3  " />
// //                                                               {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
// //                                                             </span>
// //                                                           )}

// //                                                           {task._count?.boardComments > 0 && (
// //                                                             <span className="flex items-center gap-1 text-xs">
// //                                                               <MessageSquare className=" size-3  " />
// //                                                               {task._count.boardComments}
// //                                                             </span>
// //                                                           )}

// //                                                           {task.attachments && task.attachments.length > 0 && (
// //                                                             <span className="flex items-center gap-1 text-xs">
// //                                                               <Paperclip className=" size-3  " />
// //                                                               {task.attachments.length}
// //                                                             </span>
// //                                                           )}
// //                                                         </div>

// //                                                         <div className="flex -!gap-x-2">
// //                                                           {task.assignees?.slice(0, 3).map(({ user }) => (
// //                                                             <div key={user.id} className="size-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600" title={user.name || ''}>
// //                                                               {user.name ? user.name.charAt(0).toUpperCase() : <User className=" size-3  " />}
// //                                                             </div>
// //                                                           ))}
// //                                                           {task.assignees?.length > 3 && (
// //                                                             <div className="size-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600">
// //                                                               +{task.assignees.length - 3}
// //                                                             </div>
// //                                                           )}
// //                                                         </div>
// //                                                       </div>
// //                                                     </div>
// //                                                   )}
// //                                                 </Draggable>
// //                                               ))}
// //                                               {provided.placeholder}
// //                                             </div>
// //                                           )}
// //                                         </Droppable>

// //                                         {addingTaskColumnId === column.id ? (
// //                                           <div className="mt-3">
// //                                             <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newTaskTitle.trim()) { createTaskMutation.mutate({ columnId: column.id, title: newTaskTitle }); } else if (e.key === 'Escape') { setAddingTaskColumnId(null); setNewTaskTitle(''); } }} placeholder="Enter task title..." className="w-full px-3 py-2 bg-transparent border border-[#262626] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-[#262626] mb-2"  />
// //                                             <div className="flex gap-2">
// //                                               <button type="button"  onClick={() => { if (newTaskTitle.trim()) { createTaskMutation.mutate({ columnId: column.id, title: newTaskTitle }); } }} disabled={!newTaskTitle.trim() || createTaskMutation.isPending} className="px-3 py-1.5 text-white text-sm dark:bg-[#242424] rounded-lg hover:dark:bg-[#333] disabled:opacity-50">Add</button>
// //                                               <button type="button"  onClick={() => { setAddingTaskColumnId(null); setNewTaskTitle(''); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500"><X className="size-4" /></button>
// //                                             </div>
// //                                           </div>
// //                                         ) : (
// //                                           <button type="button"  style={{ color: column.color || '#3b82f6' }} onClick={() => setAddingTaskColumnId(column.id)} className="mt-3 flex items-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 hover:dark:bg-[#262626] w-full py-2 px-3 rounded-lg transition-colors text-sm font-medium">
// //                                             <Plus className="size-4" />
// //                                             Add task
// //                                           </button>
// //                                         )}
// //                                       </div>
// //                                     </div>
// //                                   )}
// //                                 </Draggable>
// //                               ))}
// //                               {provided.placeholder}

// //                               {addingColumn ? (
// //                                 <div className="w-72 flex-shrink-0 bg-gray-100 rounded-lg p-2">
// //                                   <input type="text" value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newColumnTitle.trim()) { createColumnMutation.mutate(newColumnTitle); } else if (e.key === 'Escape') { setAddingColumn(false); setNewColumnTitle(''); } }} placeholder="Enter column title..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3"  />
// //                                   <div className="flex gap-2">
// //                                     <button type="button"  onClick={() => { if (newColumnTitle.trim()) { createColumnMutation.mutate(newColumnTitle); } }} disabled={!newColumnTitle.trim() || createColumnMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">Add Column</button>
// //                                     <button type="button"  onClick={() => { setAddingColumn(false); setNewColumnTitle(''); }} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"><X className="size-5" /></button>
// //                                   </div>
// //                                 </div>
// //                               ) : (
// //                                 <button type="button"  onClick={() => setAddingColumn(true)} className="w-72 flex-shrink-0 bg-white/80 hover:bg-gray-100 dark:bg-[#242424] rounded-lg p-2 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors h-fit">
// //                                   <Plus className="size-5" />
// //                                   <span className="font-medium">Add another column</span>
// //                                 </button>
// //                               )}
// //                             </div>
// //                           </div>
// //                         )}
// //                       </Droppable>
// //                     </DragDropContext>
// //                   </div>
// //                 </div>

// //                 {isTaskModalOpen && selectedTask && (
// //                   <TaskModal task={selectedTask} boardId={board.id} boardMembers={board.members} labels={board.labels} closeModal={() => { setIsTaskModalOpen(false); setSelectedTask(null); }} />
// //                 )}

// //                 {showCoverUpload && (
// //                   <BoardCoverUpload boardId={board.id} currentCover={board.coverImage} onClose={() => setShowCoverUpload(false)} />
// //                 )}

// //                 <div className='absolute inset-0 !bottom-[4rem] top-auto -mr-2 left-auto bg-white dark:bg-black rounded-full p-0.5 dark:text-white h-6 w-6 cursor-pointer flex items-center justify-center' onClick={() => setIsCardModalOpen(!isCardModalOpen)}>
// //                   {isCardModalOpen ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
// //                 </div>
// //               </main>

// //               {board && isCardModalOpen && (
// //                 <div className="space-y-3 h-full">
// //                   <Card className="w-72 p-4 py-2.5 max-h-[74%] min-h-[74%] h-[74%] overflow-hidden dark:bg-black/50 dark:border-t border rounded-2xl box-shadow dark:shadow-none">
// //                     <div className="h-full max-h-full">
// //                       <div className="mb-4">
// //                         <div className="flex justify-between items-center mb-2 bg-muted/90 p-4 rounded-2xl">
// //                           <h3 className="font-semibold capitalize">{board?.title}</h3>
// //                           <span className="text-xs font-medium bg-orange-100 text-orange-600 px-2 py-1 rounded">SELECTED</span>
// //                         </div>
// //                       </div>
// //                       <div className="flex flex-col items-center py-0">
// //                         <CircularProgress percentage={percentage} size={140} strokeWidth={9} />
// //                       </div>
// //                       <div className="py-2">
// //                         <h1 className="font-semibold text-[18px] capitalize">{board?.title}</h1>
// //                       </div>
// //                       <div className="grid grid-cols-2 gap-4">
// //                         <div className="bg-blue-50 p-3 rounded-xl">
// //                           <div className="text-sm text-gray-600">Total</div>
// //                           <div className="text-xl dark:text-black font-semibold">{board?.columns?.length || 0}</div>
// //                         </div>
// //                         <div className="bg-green-50 p-3 rounded-xl">
// //                           <div className="text-sm text-gray-600">{board?.columns && board.columns.length > 0 ? board.columns[0].title : 'No columns'}</div>
// //                           <div className="text-xl dark:text-black font-semibold">{board?.columns && board.columns.length > 0 ? (board.columns[0]?.tasks?.length ?? 0) : 0}</div>
// //                         </div>
// //                         <div className="bg-purple-50 p-3 rounded-xl">
// //                           <div className="text-sm text-gray-600">{board?.columns && board.columns.length > 1 ? board.columns[1].title : 'No columns'}</div>
// //                           <div className="text-xl dark:text-black font-semibold">{board?.columns?.[1]?.tasks?.length || 0}</div>
// //                         </div>
// //                         <div className="bg-orange-50 p-3 rounded-xl">
// //                           <div className="text-sm text-gray-600">{board?.columns && board.columns.length > 2 ? board.columns[2].title : 'No columns'}</div>
// //                           <div className="text-xl dark:text-black font-semibold">{board?.columns?.[2]?.tasks?.length || 0}</div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </Card>
// //                   <Card className="p-4 py-2 max-h-[24%] h-[24%] overflow-y-auto space-y-4 border-none rounded-2xl box-shadow dark:shadow-none">
// //                     <div className="flex gap-3 justify-start items-center">
// //                       <Clock className="text-white p-2 h-9 w-9 bg-purple-400 rounded-sm" />
// //                       <div className="mr-10">
// //                         <p className="text-sm font-semibold text-neutral-500">{board?.createdAt ? new Date(board.createdAt).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'long' }).toLowerCase() : ''}</p>
// //                         <p className="text-md font-semibold">{board?.createdAt ? new Date(board.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}</p>
// //                       </div>
// //                       <EditIcon className="h-5 w-5" />
// //                     </div>
// //                     <hr />
// //                     <div className="flex gap-3 justify-start items-center">
// //                       <div className="mr-10">
// //                         <p className="text-sm font-semibold text-neutral-500">{board?.updatedAt ? new Date(board.updatedAt).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'long' }).toLowerCase() : ''}</p>
// //                         {/* <p className="text-md font-semibold">{board?.updatedAt ? new Date(board.updatedUrl: 'en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}</p> */}
// //                       </div>
// //                       <EditIcon className="h-5 w-5" />
// //                     </div>
// //                   </Card>
// //                 </div>
// //               )}
// //             </div>
// //           </TabsContent>
// //           <TabsContent value="password" className='  p-0 !overflow-y-hidden'>
// //             <ScrollArea className="h-full !overflow-y-scroll">hello</ScrollArea>
// //           </TabsContent>
// //         </Tabs>
// //       </Layout>
// //     </div>
// //   );
// // }

// // the above code is working fine

// // pages/board/[id].tsx
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';
// import { FC, useEffect, useState, useMemo } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
// import {
//   Plus,
//   MoreHorizontal,
//   Calendar,
//   Tag,
//   Paperclip,
//   MessageSquare,
//   CheckSquare,
//   Clock,
//   User,
//   X,
//   Image as ImageIcon,
//   Trash2,
//   Edit2,
//   Filter,
//   Search,
//   EditIcon,
//   ChevronRight,
//   ChevronLeft
// } from 'lucide-react';
// import { format, formatDistanceToNow } from 'date-fns';
// import { TaskModal } from '@/components/Board/task-modal';
// import { BoardHeader } from '@/components/Board/board-header';
// import Layout from '@/components/Layout/Layout';
// import { getSession, GetSessionParams } from 'next-auth/react';
// import BoardInsideHeader from '@/components/Board/header';
// import SideBar from '@/components/ui/mainSideBar';
// import CircularText from '@/components/ui/CircularTextLoader';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { BoardCoverUpload } from '@/components/Board/board-cover-upload';
// import { Header } from '@/components/doc-components/Header';
// import { Card } from '@/components/ui/card';
// // import { useSocket } from 'hooks/useTaskSocket';
// import { useBoardRealtime } from 'hooks/useBoardRealtime';
// import {
//   AvatarGroup,
//   AvatarGroupTooltip,
// } from '@/components/animate-ui/components/animate/avatar-group';
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
// } from '@/components/ui/avatar';
// import { BoardActivityLog, MiniActivityLog } from '@/components/Board/BoardActivityLog';
// import { ScrumBoardTaskList } from '@/components/tasks/scrumboard-tasklist';
// import { redirect } from 'next/navigation';

// interface Label {
//   id: string;
//   name: string;
//   color: string;
// }

// interface Task {
//   id: string;
//   title: string;
//   description: string | null;
//   coverImage: string | null;
//   status: string;
//   priority: string;
//   dueDate: string | null;
//   order: number;
//   columnId?: string;
//   assignees: Array<{
//     id: string;
//     user: {
//       id: string;
//       name: string | null;
//       image: string | null;
//     };
//   }>;
//   labels: Array<{
//     id: string;
//     label: Label;
//   }>;
//   attachments: Array<{
//     id: string;
//     filename: string;
//   }>;
//   subtasks: Array<{
//     id: string;
//     isCompleted: boolean;
//   }>;
//   _count: {
//     boardComments: number;
//     attachments?: number;
//     subtasks?: number;
//   };
// }

// interface Column {
//   id: string;
//   title: string;
//   color: string | null;
//   order: number;
//   tasks: Task[];
// }

// interface BoardData {
//   id: string;
//   title: string;
//   description: string | null;
//   coverImage: string | null;
//   createdAt: string;
//   updatedAt: string;
//   owner: {
//     id: string;
//     name: string | null;
//     image: string | null;
//   };
//   members: Array<{
//     id: string;
//     role: string;
//     user: {
//       id: string;
//       name: string | null;
//       image: string | null;
//       email: string;
//     };
//   }>;
//   columns: Column[];
//   labels: Label[];
// }


// const CircularProgress: FC<{
//   percentage: number;
//   size?: number;
//   strokeWidth?: number;
//   circleColor?: string;
//   progressColor?: string;
// }> = ({
//   percentage,
//   size = 120,
//   strokeWidth = 10,
//   circleColor = '#e5e7eb',
//   progressColor = '#22c55e'
// }) => {
//     const radius = (size - strokeWidth) / 2;
//     const circumference = radius * 2 * Math.PI;
//     const strokeDashoffset = circumference - (percentage / 100) * circumference;

//     return (
//       <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
//         <svg
//           width={size}
//           height={size}
//           viewBox={`0 0 ${size} ${size}`}
//           className="transform -rotate-90"
//         >
//           <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={circleColor} strokeWidth={strokeWidth} />
//           <circle
//             cx={size / 2} cy={size / 2} r={radius}
//             fill="transparent" stroke={progressColor} strokeWidth={strokeWidth}
//             strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
//             strokeLinecap="round" className="transition-all duration-500 ease-out"
//           />
//         </svg>
//         <div className="absolute inset-0 flex items-center justify-center">
//           <span className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
//         </div>
//       </div>
//     );
//   };

// export default function BoardPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const { id } = router.query;
//   const queryClient = useQueryClient();
//   // const socket = useSocket();

//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
//   const [isCardModalOpen, setIsCardModalOpen] = useState(false);
//   const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
//   const [addingColumn, setAddingColumn] = useState(false);
//   const [newColumnTitle, setNewColumnTitle] = useState('');
//   const [addingTaskColumnId, setAddingTaskColumnId] = useState<string | null>(null);
//   const [newTaskTitle, setNewTaskTitle] = useState('');
//   const [showCoverUpload, setShowCoverUpload] = useState(false);

//   // ✅ All real-time socket logic lives here — handles join_board + all task events
//   useBoardRealtime(id);

//  if (status === 'unauthenticated') {
//     redirect('/auth/login');
//   }

//   const { data: board, isLoading } = useQuery({
//     queryKey: ['board', id],
//     queryFn: async () => {
//       const res = await fetch(`/api/boards/${id}`);
//       if (!res.ok) throw new Error('Failed to fetch board');
//       const data = await res.json();

//       // Normalize — ensure all tasks have arrays (guards against undefined crashes)
//       data.columns = data.columns.map((col: Column) => ({
//         ...col,
//         tasks: col.tasks.map((task: Task) => ({
//           ...task,
//           subtasks: task.subtasks ?? [],
//           attachments: task.attachments ?? [],
//           assignees: task.assignees ?? [],
//           labels: task.labels ?? [],
//           _count: task._count ?? { boardComments: 0, attachments: 0, subtasks: 0 }
//         }))
//       }));

//       return data as BoardData;
//     },
//     enabled: !!id && !!session,
//     // Don't auto-refetch — socket handles live updates
//     staleTime: Infinity,
//     refetchOnWindowFocus: false,
//   });

//   const { percentage, completedTasks, totalTasks, lastColumnName } = useMemo(() => {
//     if (!board?.columns || board.columns.length === 0) {
//       return { percentage: 0, completedTasks: 0, totalTasks: 0, lastColumnName: '' };
//     }
//     // const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);
//     const sortedColumns = board.columns.toSorted((a, b) => a.order - b.order);
//     const lastColumn = sortedColumns[sortedColumns.length - 1];
//     const total = board.columns.reduce((acc, col) => acc + col.tasks.length, 0);
//     const completed = lastColumn.tasks.length;
//     const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
//     return { percentage: percent, completedTasks: completed, totalTasks: total, lastColumnName: lastColumn.title };
//   }, [board?.columns]);

//   // ✅ updateTaskMutation — no invalidateQueries, socket handles all members
//   const updateTaskMutation = useMutation({
//     mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
//       const res = await fetch(`/api/tasks/${taskId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updates),
//       });
//       if (!res.ok) throw new Error('Failed to update task');
//       return res.json();
//     },
//     onSuccess: (updatedTask) => {
//       // Only patch the specific task — never refetch the whole board
//       queryClient.setQueryData(['board', id], (old: any) => {
//         if (!old) return old;
//         return {
//           ...old,
//           columns: old.columns.map((col: any) => ({
//             ...col,
//             tasks: col.tasks.map((t: any) =>
//               t.id === updatedTask.id ? { ...t, ...updatedTask } : t
//             ),
//           })),
//         };
//       });
//     },
//   });

//   const createColumnMutation = useMutation({
//     mutationFn: async (title: string) => {
//       const res = await fetch('/api/columns', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title, boardId: id }),
//       });
//       if (!res.ok) throw new Error('Failed to create column');
//       return res.json();
//     },
//     onSuccess: () => {
//       // Columns aren't socket-managed yet, so refetch is correct here
//       queryClient.invalidateQueries({ queryKey: ['board', id] });
//       setAddingColumn(false);
//       setNewColumnTitle('');
//     },
//   });

//   // ✅ createTaskMutation — no invalidateQueries, socket handles showing the new task
//   const createTaskMutation = useMutation({
//     mutationFn: async ({ columnId, title }: { columnId: string; title: string }) => {
//       const res = await fetch('/api/tasks', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           title,
//           columnId,
//           boardId: id,
//           status: 'TODO',
//         }),
//       });
//       if (!res.ok) throw new Error('Failed to create task');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', id] });
//       setAddingTaskColumnId(null);
//       setNewTaskTitle('');
//       // ✅ Socket event (task_created) will add the task to the board for all members
//     },
//   });

//   // ✅ onDragEnd — optimistic update + API call (fetch not commented out!)
//   const onDragEnd = (result: DropResult) => {
//     if (!result.destination) return;
//     const { source, destination, draggableId } = result;

//     if (
//       source.droppableId === destination.droppableId &&
//       source.index === destination.index
//     ) {
//       return;
//     }

//     // Save snapshot for rollback
//     const snapshot = queryClient.getQueryData(['board', id]);

//     // Optimistic update — moves card instantly for the person dragging
//     queryClient.setQueryData(['board', id], (old: any) => {
//       if (!old) return old;

//       let movedTask: any = null;

//       const columnsWithoutTask = old.columns.map((col: any) => {
//         if (col.id === source.droppableId) {
//           movedTask = col.tasks[source.index];
//           return { ...col, tasks: col.tasks.filter((_: any, i: number) => i !== source.index) };
//         }
//         return col;
//       });

//       if (!movedTask) return old;
//       movedTask = { ...movedTask, columnId: destination.droppableId };

//       const finalColumns = columnsWithoutTask.map((col: any) => {
//         if (col.id === destination.droppableId) {
//           const newTasks = [...col.tasks];
//           newTasks.splice(destination.index, 0, movedTask);
//           return { ...col, tasks: newTasks };
//         }
//         return col;
//       });

//       return { ...old, columns: finalColumns };
//     });

//     // ✅ API call — socket will broadcast task_moved to all other members
//     fetch(`/api/tasks/${draggableId}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         columnId: destination.droppableId,
//         order: destination.index,
//       }),
//     }).catch(() => {
//       // Rollback on error
//       queryClient.setQueryData(['board', id], snapshot);
//     });
//   };

//   if (isLoading || !board) {
//     return (
//       <Layout>
//         <div className="h-screen flex items-center justify-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <div className="flex !overflow-hidden scrollbar-thin2">
//       <SideBar />
//       <Layout>
//         <Tabs defaultValue="account" className="w-full !overflow-hidden scrollbar-thin2 h-fit !py-0">
//           <Header />
//           <TabsContent value="account">
//             <BoardHeader board={board} />
//             <div className="flex scrollbar-thin2 justify-start px-4 py-1 mt-2 gap-4 items-start w-full min-h-[83vh] max-h-[86vh] h-[85vh] scrollbar-thin2 !overflow-y-hidden">
//               <main
//                 style={{ backgroundImage: `url(${board.coverImage})` }}
//                 className="bg-white/30 bg-cover bg-center dark:bg-black/30 min-w-[60%] w-full max-w-[100%] box-shadow dark:shadow-none rounded-2xl m-0 min-h-full h-full max-h-full py-2 border-b border-r dark:border-[#262626] relative"
//               >
//                 <div className="scrollbar-thin2">
//                   <BoardInsideHeader board={board} />
//                   <div className="max-h-full h-[77vh] !overflow-y-hidden">
//                     <DragDropContext onDragEnd={onDragEnd}>
//                       <Droppable droppableId="board" type="column" direction="horizontal">
//                         {(provided) => (
//                           <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-x-auto thin-scrollbar">
//                             <div className="flex items-start gap-3 p-4 h-full min-w-max">
//                               {board.columns.map((column, columnIndex) => (
//                                 <Draggable key={column.id} draggableId={column.id} index={columnIndex}>
//                                   {(provided, snapshot) => (
//                                     <div
//                                       ref={provided.innerRef}
//                                       {...provided.draggableProps}
//                                       className={`w-72 flex-shrink-0 ${snapshot.isDragging ? 'opacity-50' : ''}`}
//                                     >
//                                       <div
//                                         {...provided.dragHandleProps}
//                                         style={{ backgroundColor: column.color ? `${column.color}` : '#3b82f6' }}
//                                         className="dark:!bg-[#101204] !bg-[#F3F3F3] rounded-xl p-2 py-3 max-h-[95%] flex flex-col"
//                                       >
//                                         <div className="flex items-center justify-between mb-3">
//                                           <div className="flex justify-center items-center gap-2">
//                                             <div
//                                               style={{ backgroundColor: column.color || '#3b82f6' }}
//                                               className="flex justify-center rounded-md p-1 items-center gap-1"
//                                             >
//                                               <div className=" size-3   rounded-full border-2 border-white" style={{ backgroundColor: column.color || '#3b82f6' }}></div>
//                                               <h3 className="font-semibold uppercase text-xs text-white">{column.title}</h3>
//                                             </div>
//                                             <span style={{ color: column.color || '#3b82f6' }} className="font-semibold text-sm rounded-full">
//                                               {column.tasks.length}
//                                             </span>
//                                           </div>
//                                           <button type="button" className="p-1 hover:bg-gray-200 rounded transition-colors">
//                                             <MoreHorizontal className="size-4 text-gray-500" />
//                                           </button>
//                                         </div>

//                                         <Droppable droppableId={column.id} type="task">
//                                           {(provided, snapshot) => (
//                                             <div
//                                               {...provided.droppableProps}
//                                               ref={provided.innerRef}
//                                               className={`flex-1 overflow-y-auto thin-scrollbar space-y-3 min-h-[50px] max-h-[calc(100vh-300px)] ${snapshot.isDraggingOver ? 'bg-gray-200/50' : ''}`}
//                                             >
//                                               {column.tasks.map((task, taskIndex) => (
//                                                 <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
//                                                   {(provided, snapshot) => (
//                                                     <div
//                                                       ref={provided.innerRef}
//                                                       {...provided.draggableProps}
//                                                       {...provided.dragHandleProps}
//                                                       onClick={() => { setSelectedTask(task); setIsTaskModalOpen(true); }}
//                                                       className={`bg-white dark:bg-[#272727] p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all group ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
//                                                     >
//                                                       {task.coverImage && (
//                                                         <div
//                                                           className="mb-3 -mx-4 -mt-4 h-24 bg-cover bg-center rounded-t-lg"
//                                                           style={{ backgroundImage: `url(${task.coverImage})` }}
//                                                         ></div>
//                                                       )}

//                                                       {task.labels?.length > 0 && (
//                                                         <div className="flex flex-wrap gap-1 mb-2">
//                                                           {task.labels.map(({ label }) => (
//                                                             <span
//                                                               key={label.id}
//                                                               className="text-xs px-2 py-0.5 rounded-full font-medium"
//                                                               style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}40` }}
//                                                             >
//                                                               {label.name}
//                                                             </span>
//                                                           ))}
//                                                         </div>
//                                                       )}

//                                                       <h4 className="font-medium text-gray-900 dark:text-[#EEE] mb-2 line-clamp-2">{task.title}</h4>

//                                                       <div className="flex items-center justify-between text-gray-500 text-sm">
//                                                         <div className="flex items-center gap-3">
//                                                           {task.dueDate && (
//                                                             <span className={`flex items-center gap-1 text-xs ${new Date(task.dueDate) < new Date() ? 'text-red-600' : ''}`}>
//                                                               <Clock className=" size-3  " />
//                                                               {format(new Date(task.dueDate), 'MMM d')}
//                                                             </span>
//                                                           )}

//                                                           {/* ✅ Safe access — subtasks may be undefined on socket-created tasks */}
//                                                           {(task.subtasks ?? []).length > 0 && (
//                                                             <span className="flex items-center gap-1 text-xs">
//                                                               <CheckSquare className=" size-3  " />
//                                                               {(task.subtasks ?? []).filter(s => s.isCompleted).length}/{(task.subtasks ?? []).length}
//                                                             </span>
//                                                           )}

//                                                           {(task._count?.boardComments ?? 0) > 0 && (
//                                                             <span className="flex items-center gap-1 text-xs">
//                                                               <MessageSquare className=" size-3  " />
//                                                               {task._count.boardComments}
//                                                             </span>
//                                                           )}

//                                                           {(task.attachments ?? []).length > 0 && (
//                                                             <span className="flex items-center gap-1 text-xs">
//                                                               <Paperclip className=" size-3  " />
//                                                               {(task.attachments ?? []).length}
//                                                             </span>
//                                                           )}
//                                                         </div>

//                                                         <div className="flex justify-center items-center -!gap-x-2 ">  <AvatarGroup>
//                                                           {(task.assignees ?? []).slice(0, 3).map(({ user }) => (
//                                                             <Avatar key={user.id} className="size-6 border-1 border-background py-0">
//                                                               <AvatarImage src={user.image as any} />
//                                                               <AvatarFallback>{user.name}</AvatarFallback>
//                                                               <AvatarGroupTooltip>{user.name}</AvatarGroupTooltip>
//                                                             </Avatar>
//                                                           ))}

//                                                         </AvatarGroup><div className="">

//                                                             {(task.assignees ?? []).length > 3 && (
//                                                               <div className="size-6 rounded-full border-1 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600">
//                                                                 +{task.assignees.length - 3}
//                                                               </div>
//                                                             )}
//                                                           </div>
//                                                         </div>

//                                                       </div>
//                                                     </div>
//                                                   )}
//                                                 </Draggable>
//                                               ))}
//                                               {provided.placeholder}
//                                             </div>
//                                           )}
//                                         </Droppable>

//                                         {addingTaskColumnId === column.id ? (
//                                           <div className="mt-3">
//                                             <input
//                                               type="text"
//                                               value={newTaskTitle}
//                                               onChange={(e) => setNewTaskTitle(e.target.value)}
//                                               onKeyDown={(e) => {
//                                                 if (e.key === 'Enter' && newTaskTitle.trim()) {
//                                                   createTaskMutation.mutate({ columnId: column.id, title: newTaskTitle });
//                                                 } else if (e.key === 'Escape') {
//                                                   setAddingTaskColumnId(null);
//                                                   setNewTaskTitle('');
//                                                 }
//                                               }}
//                                               placeholder="Enter task title..."
//                                               className="w-full px-3 py-2 bg-transparent border border-[#262626] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-[#262626] mb-2"

//                                             />
//                                             <div className="flex gap-2">
//                                               <button type="button"
//                                                 onClick={() => {
//                                                   if (newTaskTitle.trim()) {
//                                                     createTaskMutation.mutate({ columnId: column.id, title: newTaskTitle });
//                                                   }
//                                                 }}
//                                                 disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
//                                                 className="px-3 py-1.5 text-white text-sm dark:bg-[#242424] rounded-lg hover:dark:bg-[#333] disabled:opacity-50"
//                                               >
//                                                 {createTaskMutation.isPending ? 'Adding...' : 'Add'}
//                                               </button>
//                                               <button type="button"
//                                                 onClick={() => { setAddingTaskColumnId(null); setNewTaskTitle(''); }}
//                                                 className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500"
//                                               >
//                                                 <X className="size-4" />
//                                               </button>
//                                             </div>
//                                           </div>
//                                         ) : (
//                                           <button type="button"
//                                             style={{ color: column.color || '#3b82f6' }}
//                                             onClick={() => setAddingTaskColumnId(column.id)}
//                                             className="mt-3 flex items-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 hover:dark:bg-[#262626] w-full py-2 px-3 rounded-lg transition-colors text-sm font-medium"
//                                           >
//                                             <Plus className="size-4" />
//                                             Add task
//                                           </button>
//                                         )}
//                                       </div>
//                                     </div>
//                                   )}
//                                 </Draggable>
//                               ))}
//                               {provided.placeholder}

//                               {addingColumn ? (
//                                 <div className="w-72 flex-shrink-0 bg-gray-100 rounded-lg p-2">
//                                   <input
//                                     type="text"
//                                     value={newColumnTitle}
//                                     onChange={(e) => setNewColumnTitle(e.target.value)}
//                                     onKeyDown={(e) => {
//                                       if (e.key === 'Enter' && newColumnTitle.trim()) {
//                                         createColumnMutation.mutate(newColumnTitle);
//                                       } else if (e.key === 'Escape') {
//                                         setAddingColumn(false);
//                                         setNewColumnTitle('');
//                                       }
//                                     }}
//                                     placeholder="Enter column title..."
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3"

//                                   />
//                                   <div className="flex gap-2">
//                                     <button type="button"
//                                       onClick={() => { if (newColumnTitle.trim()) { createColumnMutation.mutate(newColumnTitle); } }}
//                                       disabled={!newColumnTitle.trim() || createColumnMutation.isPending}
//                                       className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
//                                     >
//                                       Add Column
//                                     </button>
//                                     <button type="button"
//                                       onClick={() => { setAddingColumn(false); setNewColumnTitle(''); }}
//                                       className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"
//                                     >
//                                       <X className="size-5" />
//                                     </button>
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <button type="button"
//                                   onClick={() => setAddingColumn(true)}
//                                   className="w-72 flex-shrink-0 bg-white/80 hover:bg-gray-100 dark:bg-[#111] rounded-lg p-2 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors h-fit"
//                                 >
//                                   <Plus className="size-5" />
//                                   <span className="font-medium">Add another column</span>
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </Droppable>
//                     </DragDropContext>
//                   </div>
//                 </div>

//                 {isTaskModalOpen && selectedTask && (
//                   <TaskModal
//                     task={selectedTask}
//                     boardId={board.id}
//                     boardMembers={board.members}
//                     labels={board.labels}
//                     closeModal={() => { setIsTaskModalOpen(false); setSelectedTask(null); }}
//                   />
//                 )}

//                 {showCoverUpload && (
//                   <BoardCoverUpload
//                     boardId={board.id}
//                     currentCover={board.coverImage}
//                     onClose={() => setShowCoverUpload(false)}
//                     open={showCoverUpload}

//                   />
//                 )}

//                 <div
//                   className='absolute inset-0 !bottom-[4rem] top-auto -mr-2 left-auto bg-white dark:bg-black rounded-full p-0.5 dark:text-white h-6 w-6 cursor-pointer flex items-center justify-center'
//                   onClick={() => setIsCardModalOpen(!isCardModalOpen)}
//                 >
//                   {isCardModalOpen ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
//                 </div>
//               </main>

//               {board && isCardModalOpen && (
//                 <div className="space-y-3 h-full max-w-full">

//                   <Card className="w-72 p-4 py-2.5 max-h-[74%] min-h-[74%] h-[74%] overflow-hidden dark:bg-black/60 dark:border-t border rounded-2xl box-shadow dark:shadow-none">
//                     <div className="h-full max-h-full">
//                       <div className="mb-4">
//                         <div className="flex justify-between items-center bg-[#EEE] dark:bg-[#222] p-3 rounded-xl">
//                           <h3 className="font-semibold capitalize">{board?.title}</h3>
//                           <span className="text-xs font-medium bg-orange-100 text-orange-600 px-2 py-1 rounded">SELECTED</span>
//                         </div>
//                       </div>
//                       <div className="flex flex-col items-center pt-1.5">
//                         <CircularProgress percentage={percentage} size={140} strokeWidth={7} />
//                       </div>
//                       <div className="py-2">
//                         <h1 className="font-semibold text-[18px] capitalize">{board?.title}</h1>
//                       </div>
//                       <div className="grid grid-cols-2 gap-3">
//                         {/* Total — Clean neutral for both themes */}
//                         <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
//                           <div className="text-sm text-gray-500 dark:text-slate-400">Total</div>
//                           <div className="text-xl text-gray-900 dark:text-white font-semibold">{board?.columns?.length || 0}</div>
//                         </div>

//                         {/* To Do — Soft blue, matches "TO DO" badge */}
//                         <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50">
//                           <div className="text-sm text-blue-600 dark:text-blue-400">To Do</div>
//                           <div className="text-xl text-gray-900 dark:text-white font-semibold">{board?.columns?.[0]?.tasks?.length ?? 0}</div>
//                         </div>

//                         {/* In Progress — Soft amber, matches "IN PROGRESS" badge */}
//                         <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl border border-amber-100 dark:border-amber-800/50">
//                           <div className="text-sm text-amber-600 dark:text-amber-400">In Progress</div>
//                           <div className="text-xl text-gray-900 dark:text-white font-semibold">{board?.columns?.[1]?.tasks?.length ?? 0}</div>
//                         </div>

//                         {/* Done — Soft emerald, matches "DONE" badge */}
//                         <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
//                           <div className="text-sm text-emerald-600 dark:text-emerald-400">Done</div>
//                           <div className="text-xl text-gray-900 dark:text-white font-semibold">{board?.columns?.[2]?.tasks?.length ?? 0}</div>
//                         </div>
//                       </div>
//                     </div>
//                   </Card>
//                   <Card className="  p-1   max-w-full max-h-[24%] h-[24%] w-[18rem] overflow-y-auto space-y-4 border-none rounded-2xl box-shadow dark:shadow-none">
//                     <MiniActivityLog boardId={board.id} />
//                   </Card>
//                 </div>
//               )}
//             </div>
//           </TabsContent>
//           <TabsContent value="password" className='  p-0 h-screen !overflow-y-hidden'>
//             <BoardHeader board={board} />
//             <div className="flex scrollbar-thin2 justify-start px-4 py-0 mt-2 gap-4 items-start w-full min-h-[83vh] max-h-[86vh] h-[85vh] scrollbar-thin2 !overflow-y-hidden">
//               <main
//                 style={{ backgroundImage: `url(${board.coverImage})` }}
//                 className="bg-white/30 overflow-hidden bg-cover bg-center dark:bg-black/30 min-w-[60%] w-full max-w-[100%] box-shadow dark:shadow-none rounded-2xl m-0 min-h-full h-full max-h-full py-0 border-b border-r dark:border-[#262626] relative" >
//                 <ScrollArea className="h-full !overflow-y-scroll">
//                   <ScrumBoardTaskList />
//                 </ScrollArea>
//               </main>
//             </div>
//           </TabsContent>

//           <TabsContent value="activity" className="">
//             <BoardHeader board={board} />
//             <div className="flex scrollbar-thin2 justify-start px-4 py-1 mt-2 gap-4 items-start w-full min-h-[83vh] max-h-[86vh] h-[85vh] scrollbar-thin2 !overflow-y-hidden">
//               <main
//                 style={{ backgroundImage: `url(${board.coverImage})` }}
//                 className="bg-white/30 bg-cover bg-center dark:bg-black/30 min-w-[60%] w-full max-w-[100%] box-shadow dark:shadow-none rounded-2xl m-0 min-h-full h-full max-h-full py-2 border-b border-r dark:border-[#262626] relative"
//               >
//                 <BoardActivityLog boardId={board.id} />
//               </main>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </Layout>
//     </div>
//   );
// }

// pages/board/[id].tsx
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FC, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Plus,
  MoreHorizontal,
  Paperclip,
  MessageSquare,
  CheckSquare,
  Clock,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { TaskModal } from '@/components/Board/task-modal';
import { BoardHeader } from '@/components/Board/board-header';
import Layout from '@/components/Layout/Layout';
import BoardInsideHeader from '@/components/Board/header';
import SideBar from '@/components/ui/mainSideBar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BoardCoverUpload } from '@/components/Board/board-cover-upload';
import { Header } from '@/components/doc-components/Header';
import { Card } from '@/components/ui/card';
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from '@/components/animate-ui/components/animate/avatar-group';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { BoardActivityLog, MiniActivityLog } from '@/components/Board/BoardActivityLog';
import { ScrumBoardTaskList } from '@/components/tasks/scrumboard-tasklist';
import { redirect } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  order: number;
  columnId?: string;
  assignees: Array<{
    id: string;
    user: { id: string; name: string | null; image: string | null };
  }>;
  labels: Array<{ id: string; label: Label }>;
  attachments: Array<{ id: string; filename: string }>;
  subtasks: Array<{ id: string; isCompleted: boolean }>;
  _count: { boardComments: number; attachments?: number; subtasks?: number };
}

interface Column {
  id: string;
  title: string;
  color: string | null;
  order: number;
  tasks: Task[];
}

interface BoardData {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; name: string | null; image: string | null };
  members: Array<{
    id: string;
    role: string;
    user: { id: string; name: string | null; image: string | null; email: string };
  }>;
  columns: Column[];
  labels: Label[];
}

// ─── CircularProgress ─────────────────────────────────────────────────────────

const CircularProgress: FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
  circleColor?: string;
  progressColor?: string;
}> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  circleColor = '#e5e7eb',
  progressColor = '#22c55e',
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={circleColor} strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="transparent" stroke={progressColor} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
        </div>
      </div>
    );
  };

// ─── TaskCard ─────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onClick: (task: Task) => void;
}

const TaskCard: FC<TaskCardProps> = ({ task, isDragging, onClick }) => (
  <div
    onClick={() => onClick(task)}
    className={`bg-white dark:bg-[#272727] p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all group ${isDragging ? 'shadow-lg rotate-2' : ''
      }`}
  >
    {task.coverImage && (
      <div
        className="mb-3 -mx-4 -mt-4 h-24 bg-cover bg-center rounded-t-lg"
        style={{ backgroundImage: `url(${task.coverImage})` }}
      />
    )}

    {(task.labels ?? []).length > 0 && (
      <div className="flex flex-wrap gap-1 mb-2">
        {task.labels.map(({ label }) => (
          <span
            key={label.id}
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${label.color}20`,
              color: label.color,
              border: `1px solid ${label.color}40`,
            }}
          >
            {label.name}
          </span>
        ))}
      </div>
    )}

    <h4 className="font-medium text-gray-900 dark:text-[#EEE] mb-2 line-clamp-2">{task.title}</h4>

    <div className="flex items-center justify-between text-gray-500 text-sm">
      <div className="flex items-center gap-3">
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-xs ${new Date(task.dueDate) < new Date() ? 'text-red-600' : ''}`}>
            <Clock className="size-3" />
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
        {(task.subtasks ?? []).length > 0 && (
          <span className="flex items-center gap-1 text-xs">
            <CheckSquare className="size-3" />
            {(task.subtasks ?? []).filter(s => s.isCompleted).length}/{(task.subtasks ?? []).length}
          </span>
        )}
        {(task._count?.boardComments ?? 0) > 0 && (
          <span className="flex items-center gap-1 text-xs">
            <MessageSquare className="size-3" />
            {task._count.boardComments}
          </span>
        )}
        {(task.attachments ?? []).length > 0 && (
          <span className="flex items-center gap-1 text-xs">
            <Paperclip className="size-3" />
            {(task.attachments ?? []).length}
          </span>
        )}
      </div>

      <div className="flex justify-center items-center -!gap-x-2">
        <AvatarGroup>
          {(task.assignees ?? []).slice(0, 3).map(({ user }) => (
            <Avatar key={user.id} className="size-6 border-1 border-background py-0">
              <AvatarImage src={user.image as any} />
              <AvatarFallback>{user.name}</AvatarFallback>
              <AvatarGroupTooltip>{user.name}</AvatarGroupTooltip>
            </Avatar>
          ))}
        </AvatarGroup>
        {(task.assignees ?? []).length > 3 && (
          <div className="size-6 rounded-full border-1 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600">
            +{task.assignees.length - 3}
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── AddTaskForm ──────────────────────────────────────────────────────────────

interface AddTaskFormProps {
  columnId: string;
  color: string | null;
  newTaskTitle: string;
  isPending: boolean;
  onChange: (val: string) => void;
  onSubmit: (columnId: string, title: string) => void;
  onCancel: () => void;
}

const AddTaskForm: FC<AddTaskFormProps> = ({
  columnId, color, newTaskTitle, isPending, onChange, onSubmit, onCancel,
}) => (
  <div className="mt-3">
    <input
      aria-label='new-task-title'
      type="text"
      value={newTaskTitle}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter' && newTaskTitle.trim()) onSubmit(columnId, newTaskTitle);
        else if (e.key === 'Escape') onCancel();
      }}
      placeholder="Enter task title..."
      className="w-full px-3 py-2 bg-transparent border border-[#262626] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-[#262626] mb-2"
    />
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => { if (newTaskTitle.trim()) onSubmit(columnId, newTaskTitle); }}
        disabled={!newTaskTitle.trim() || isPending}
        className="px-3 py-1.5 text-white text-sm dark:bg-[#242424] rounded-lg hover:dark:bg-[#333] disabled:opacity-50"
      >
        {isPending ? 'Adding...' : 'Add'}
      </button>
      <button type="button" onClick={onCancel} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500">
        <X className="size-4" />
      </button>
    </div>
  </div>
);

// ─── BoardColumn ──────────────────────────────────────────────────────────────

interface BoardColumnProps {
  column: Column;
  columnIndex: number;
  addingTaskColumnId: string | null;
  newTaskTitle: string;
  isCreatePending: boolean;
  onTaskClick: (task: Task) => void;
  onAddTaskClick: (columnId: string) => void;
  onNewTaskTitleChange: (val: string) => void;
  onCreateTask: (columnId: string, title: string) => void;
  onCancelAddTask: () => void;
}

const BoardColumn: FC<BoardColumnProps> = ({
  column,
  columnIndex,
  addingTaskColumnId,
  newTaskTitle,
  isCreatePending,
  onTaskClick,
  onAddTaskClick,
  onNewTaskTitleChange,
  onCreateTask,
  onCancelAddTask,
}) => (
  <Draggable key={column.id} draggableId={column.id} index={columnIndex}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={`w-72 flex-shrink-0 ${snapshot.isDragging ? 'opacity-50' : ''}`}
      >
        <div
          {...provided.dragHandleProps}
          style={{ backgroundColor: column.color ?? '#3b82f6' }}
          className="dark:!bg-[#101204] !bg-[#F3F3F3] rounded-xl p-2 py-3 max-h-[95%] flex flex-col"
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex justify-center items-center gap-2">
              <div
                style={{ backgroundColor: column.color ?? '#3b82f6' }}
                className="flex justify-center rounded-md p-1 items-center gap-1"
              >
                <div
                  className="size-3 rounded-full border-2 border-white"
                  style={{ backgroundColor: column.color ?? '#3b82f6' }}
                />
                <h3 className="font-semibold uppercase text-xs text-white">{column.title}</h3>
              </div>
              <span style={{ color: column.color ?? '#3b82f6' }} className="font-semibold text-sm rounded-full">
                {column.tasks.length}
              </span>
            </div>
            <button type="button" className="p-1 hover:bg-gray-200 rounded transition-colors">
              <MoreHorizontal className="size-4 text-gray-500" />
            </button>
          </div>

          {/* Task Droppable */}
          <Droppable droppableId={column.id} type="task">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`flex-1 overflow-y-auto thin-scrollbar space-y-3 min-h-[50px] max-h-[calc(100vh-300px)] ${snapshot.isDraggingOver ? 'bg-gray-200/50' : ''
                  }`}
              >
                {column.tasks.map((task, taskIndex) => (
                  <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard task={task} isDragging={snapshot.isDragging} onClick={onTaskClick} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Task */}
          {addingTaskColumnId === column.id ? (
            <AddTaskForm
              columnId={column.id}
              color={column.color}
              newTaskTitle={newTaskTitle}
              isPending={isCreatePending}
              onChange={onNewTaskTitleChange}
              onSubmit={onCreateTask}
              onCancel={onCancelAddTask}
            />
          ) : (
            <button
              type="button"
              style={{ color: column.color ?? '#3b82f6' }}
              onClick={() => onAddTaskClick(column.id)}
              className="mt-3 flex items-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 hover:dark:bg-[#262626] w-full py-2 px-3 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="size-4" />
              Add task
            </button>
          )}
        </div>
      </div>
    )}
  </Draggable>
);

// ─── AddColumnForm ────────────────────────────────────────────────────────────

interface AddColumnFormProps {
  newColumnTitle: string;
  isPending: boolean;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const AddColumnForm: FC<AddColumnFormProps> = ({ newColumnTitle, isPending, onChange, onSubmit, onCancel }) => (
  <div className="w-72 flex-shrink-0 bg-gray-100 rounded-lg p-2">
    <input
      aria-label='new-column-title'
      type="text"
      value={newColumnTitle}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter' && newColumnTitle.trim()) onSubmit();
        else if (e.key === 'Escape') onCancel();
      }}
      placeholder="Enter column title..."
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3"
    />
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onSubmit}
        disabled={!newColumnTitle.trim() || isPending}
        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
      >
        Add Column
      </button>
      <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">
        <X className="size-5" />
      </button>
    </div>
  </div>
);

// ─── BoardStatsPanel ──────────────────────────────────────────────────────────

interface BoardStatsPanelProps {
  board: BoardData;
  percentage: number;
}

const BoardStatsPanel: FC<BoardStatsPanelProps> = ({ board, percentage }) => (
  <div className="space-y-3 h-full max-w-full">
    <Card className="w-72 p-4 py-2.5 max-h-[74%] min-h-[74%] h-[74%] overflow-hidden dark:bg-black/60 dark:border-t border rounded-2xl box-shadow dark:shadow-none">
      <div className="h-full max-h-full">
        <div className="mb-4">
          <div className="flex justify-between items-center bg-[#EEE] dark:bg-[#222] p-3 rounded-xl">
            <h3 className="font-semibold capitalize">{board.title}</h3>
            <span className="text-xs font-medium bg-orange-100 text-orange-600 px-2 py-1 rounded">SELECTED</span>
          </div>
        </div>
        <div className="flex flex-col items-center pt-1.5">
          <CircularProgress percentage={percentage} size={140} strokeWidth={7} />
        </div>
        <div className="py-2">
          <h1 className="font-semibold text-[18px] capitalize">{board.title}</h1>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-slate-400">Total</div>
            <div className="text-xl text-gray-900 dark:text-white font-semibold">{board.columns?.length || 0}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50">
            <div className="text-sm text-blue-600 dark:text-blue-400">To Do</div>
            <div className="text-xl text-gray-900 dark:text-white font-semibold">{board.columns?.[0]?.tasks?.length ?? 0}</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl border border-amber-100 dark:border-amber-800/50">
            <div className="text-sm text-amber-600 dark:text-amber-400">In Progress</div>
            <div className="text-xl text-gray-900 dark:text-white font-semibold">{board.columns?.[1]?.tasks?.length ?? 0}</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <div className="text-sm text-emerald-600 dark:text-emerald-400">Done</div>
            <div className="text-xl text-gray-900 dark:text-white font-semibold">{board.columns?.[2]?.tasks?.length ?? 0}</div>
          </div>
        </div>
      </div>
    </Card>
    <Card className="p-1 max-w-full max-h-[24%] h-[24%] w-[18rem] overflow-y-auto space-y-4 border-none rounded-2xl box-shadow dark:shadow-none">
      <MiniActivityLog boardId={board.id} />
    </Card>
  </div>
);

// ─── BoardPage (main page) ────────────────────────────────────────────────────

export default function BoardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [addingTaskColumnId, setAddingTaskColumnId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCoverUpload, setShowCoverUpload] = useState(false);

  // ✅ All real-time socket logic lives here — handles join_board + all task events

  if (status === 'unauthenticated') {
    redirect('/auth/login');
  }

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', id],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${id}`);
      if (!res.ok) throw new Error('Failed to fetch board');
      const data = await res.json();

      // Normalize — ensure all tasks have arrays (guards against undefined crashes)
      data.columns = data.columns.map((col: Column) => ({
        ...col,
        tasks: col.tasks.map((task: Task) => ({
          ...task,
          subtasks: task.subtasks ?? [],
          attachments: task.attachments ?? [],
          assignees: task.assignees ?? [],
          labels: task.labels ?? [],
          _count: task._count ?? { boardComments: 0, attachments: 0, subtasks: 0 },
        })),
      }));

      return data as BoardData;
    },
    enabled: !!id && !!session,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const { percentage } = useMemo(() => {
    if (!board?.columns || board.columns.length === 0) {
      return { percentage: 0, completedTasks: 0, totalTasks: 0, lastColumnName: '' };
    }
    const sortedColumns = board.columns.toSorted((a, b) => a.order - b.order);
    const lastColumn = sortedColumns[sortedColumns.length - 1];
    const total = board.columns.reduce((acc, col) => acc + col.tasks.length, 0);
    const completed = lastColumn.tasks.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { percentage: percent, completedTasks: completed, totalTasks: total, lastColumnName: lastColumn.title };
  }, [board?.columns]);

  // ✅ updateTaskMutation — no invalidateQueries, socket handles all members
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(['board', id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          columns: old.columns.map((col: any) => ({
            ...col,
            tasks: col.tasks.map((t: any) =>
              t.id === updatedTask.id ? { ...t, ...updatedTask } : t
            ),
          })),
        };
      });
    },
  });

  const createColumnMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, boardId: id }),
      });
      if (!res.ok) throw new Error('Failed to create column');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] });
      setAddingColumn(false);
      setNewColumnTitle('');
    },
  });

  // ✅ createTaskMutation — no invalidateQueries, socket handles showing the new task
  const createTaskMutation = useMutation({
    mutationFn: async ({ columnId, title }: { columnId: string; title: string }) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, columnId, boardId: id, status: 'TODO' }),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] });
      setAddingTaskColumnId(null);
      setNewTaskTitle('');
    },
  });

  // ✅ onDragEnd — optimistic update + API call
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const snapshot = queryClient.getQueryData(['board', id]);

    queryClient.setQueryData(['board', id], (old: any) => {
      if (!old) return old;

      let movedTask: any = null;

      const columnsWithoutTask = old.columns.map((col: any) => {
        if (col.id === source.droppableId) {
          movedTask = col.tasks[source.index];
          return { ...col, tasks: col.tasks.filter((_: any, i: number) => i !== source.index) };
        }
        return col;
      });

      if (!movedTask) return old;
      movedTask = { ...movedTask, columnId: destination.droppableId };

      const finalColumns = columnsWithoutTask.map((col: any) => {
        if (col.id === destination.droppableId) {
          const newTasks = [...col.tasks];
          newTasks.splice(destination.index, 0, movedTask);
          return { ...col, tasks: newTasks };
        }
        return col;
      });

      return { ...old, columns: finalColumns };
    });

    fetch(`/api/tasks/${draggableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId: destination.droppableId, order: destination.index }),
    }).catch(() => {
      queryClient.setQueryData(['board', id], snapshot);
    });
  };

  // ─── Handlers (stable references passed to sub-components) ────────────────

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = (columnId: string, title: string) => {
    createTaskMutation.mutate({ columnId, title });
  };

  const handleCancelAddTask = () => {
    setAddingTaskColumnId(null);
    setNewTaskTitle('');
  };

  const handleCreateColumn = () => {
    if (newColumnTitle.trim()) createColumnMutation.mutate(newColumnTitle);
  };

  const handleCancelAddColumn = () => {
    setAddingColumn(false);
    setNewColumnTitle('');
  };

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (isLoading || !board) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex !overflow-hidden scrollbar-thin2">
      <SideBar />
      <Layout>
        <Tabs defaultValue="account" className="w-full !overflow-hidden scrollbar-thin2 h-fit !py-0">
          <Header />

          {/* ── Kanban tab ── */}
          <TabsContent value="account">
            <BoardHeader board={board} />
            <div className="flex scrollbar-thin2 justify-start px-4 py-1 mt-2 gap-4 items-start w-full min-h-[83vh] max-h-[86vh] h-[85vh] !overflow-y-hidden">
              <main
                style={{ backgroundImage: `url(${board.coverImage})` }}
                className="bg-white/30 bg-cover bg-center dark:bg-black/30 min-w-[60%] w-full max-w-[100%] box-shadow dark:shadow-none rounded-2xl m-0 min-h-full h-full max-h-full py-2 border-b border-r dark:border-[#262626] relative"
              >
                <div className="scrollbar-thin2">
                  <BoardInsideHeader board={board} />
                  <div className="max-h-full h-[77vh] !overflow-y-hidden">
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="board" type="column" direction="horizontal">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="flex-1 overflow-x-auto thin-scrollbar"
                          >
                            <div className="flex items-start gap-3 p-4 h-full min-w-max">
                              {board.columns.map((column, columnIndex) => (
                                <BoardColumn
                                  key={column.id}
                                  column={column}
                                  columnIndex={columnIndex}
                                  addingTaskColumnId={addingTaskColumnId}
                                  newTaskTitle={newTaskTitle}
                                  isCreatePending={createTaskMutation.isPending}
                                  onTaskClick={handleTaskClick}
                                  onAddTaskClick={setAddingTaskColumnId}
                                  onNewTaskTitleChange={setNewTaskTitle}
                                  onCreateTask={handleCreateTask}
                                  onCancelAddTask={handleCancelAddTask}
                                />
                              ))}
                              {provided.placeholder}

                              {addingColumn ? (
                                <AddColumnForm
                                  newColumnTitle={newColumnTitle}
                                  isPending={createColumnMutation.isPending}
                                  onChange={setNewColumnTitle}
                                  onSubmit={handleCreateColumn}
                                  onCancel={handleCancelAddColumn}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setAddingColumn(true)}
                                  className="w-72 flex-shrink-0 bg-white/80 hover:bg-gray-100 dark:bg-[#111] rounded-lg p-2 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors h-fit"
                                >
                                  <Plus className="size-5" />
                                  <span className="font-medium">Add another column</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>

                {isTaskModalOpen && selectedTask && (
                  <TaskModal
                    task={selectedTask}
                    boardId={board.id}
                    boardMembers={board.members}
                    labels={board.labels}
                    closeModal={() => { setIsTaskModalOpen(false); setSelectedTask(null); }}
                  />
                )}

                {showCoverUpload && (
                  <BoardCoverUpload
                    boardId={board.id}
                    currentCover={board.coverImage}
                    onClose={() => setShowCoverUpload(false)}
                    open={showCoverUpload}
                  />
                )}

                <div
                  className="absolute inset-0 !bottom-[4rem] top-auto -mr-2 left-auto bg-white dark:bg-black rounded-full p-0.5 dark:text-white h-6 w-6 cursor-pointer flex items-center justify-center"
                  onClick={() => setIsCardModalOpen(!isCardModalOpen)}
                >
                  {isCardModalOpen
                    ? <ChevronRight className="h-6 w-6" />
                    : <ChevronLeft className="h-6 w-6" />}
                </div>
              </main>

              {board && isCardModalOpen && (
                <BoardStatsPanel board={board} percentage={percentage} />
              )}
            </div>
          </TabsContent>

          {/* ── Scrum list tab ── */}
          <TabsContent value="password" className="p-0 h-screen !overflow-y-hidden">
            <BoardHeader board={board} />
            <div className="flex scrollbar-thin2 justify-start px-4 py-0 mt-2 gap-4 items-start w-full min-h-[83vh] max-h-[86vh] h-[85vh] !overflow-y-hidden">
              <main
                style={{ backgroundImage: `url(${board.coverImage})` }}
                className="bg-white/30 overflow-hidden bg-cover bg-center dark:bg-black/30 min-w-[60%] w-full max-w-[100%] box-shadow dark:shadow-none rounded-2xl m-0 min-h-full h-full max-h-full py-0 border-b border-r dark:border-[#262626] relative"
              >
                <ScrollArea className="h-full !overflow-y-scroll">
                  <ScrumBoardTaskList />
                </ScrollArea>
              </main>
            </div>
          </TabsContent>

          {/* ── Activity tab ── */}
          <TabsContent value="activity">
            <BoardHeader board={board} />
            <div className="flex scrollbar-thin2 justify-start px-4 py-1 mt-2 gap-4 items-start w-full min-h-[83vh] max-h-[86vh] h-[85vh] !overflow-y-hidden">
              <main
                style={{ backgroundImage: `url(${board.coverImage})` }}
                className="bg-white/30 bg-cover bg-center dark:bg-black/30 min-w-[60%] w-full max-w-[100%] box-shadow dark:shadow-none rounded-2xl m-0 min-h-full h-full max-h-full py-2 border-b border-r dark:border-[#262626] relative"
              >
                <BoardActivityLog boardId={board.id} />
              </main>
            </div>
          </TabsContent>
        </Tabs>
      </Layout>
    </div>
  );
}