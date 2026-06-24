// // components/board/standalone-board-task-list.tsx
// 'use client';

// import { useState, useRef, useEffect, ReactNode, MouseEventHandler } from "react";
// import { Plus, Folder, LayoutGrid, ChevronDown, ChevronRight, Flag, User, Calendar, Circle, CircleDot, CheckCircle2, MoreHorizontal, Search, Filter, SlidersHorizontal } from 'lucide-react';
// import moment from 'moment';
// import { TaskModal } from '@/components/Board/task-modal';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useSession } from 'next-auth/react';
// import { TaskForm } from "./task-form";

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
//   columnId: string;
//   columnTitle: string;
//   columnColor: string | null;
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
//   };
// }

// interface Column {
//   id: string;
//   title: string;
//   color: string | null;
//   order: number;
//   tasks: Task[];
// }

// interface Board {
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
//   _count?: {
//     columns: number;
//   };
// }

// // Status icon (kept from original - the column changer button)
// const getStatusIcon = (columnTitle: string, columnColor: string | null, isLast: boolean) => {
//   const color = columnColor || '#6366f1';
//   if (isLast || columnTitle.includes('done') || columnTitle.toLowerCase().includes('complete')) {
//     return (
//       <div className="size-4rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
//         <CheckCircle2 className="size-3 text-white" />
//       </div>
//     ); 
//   }
//   if (columnTitle.toLowerCase().includes('progress') || columnTitle.toLowerCase().includes('doing') || columnTitle.toLowerCase().includes('work')) {
//     return (
//       <div className="size-4rounded-full flex items-center justify-center border-2" style={{ borderColor: color, background: `linear-gradient(90deg, ${color}60 50%, transparent 50%)` }}>
//         <CircleDot className="w-2.5 h-2.5" style={{ color }} />
//       </div>
//     );
//   }
//   return (
//     <div className="size-4rounded-full flex items-center justify-center border-2 border-dashed" style={{ borderColor: color }}>
//       <Circle className="size-2" style={{ color }} />
//     </div>
//   );
// };

// // Status group badge
// const getGroupBadge = (columnTitle: string, columnColor: string | null, isLast: boolean) => {
//   const color = columnColor || '#6366f1';
//   let icon;
//   if (isLast || columnTitle.toLowerCase().includes('done') || columnTitle.toLowerCase().includes('complete')) {
//     icon = <CheckCircle2 className="w-3.5 h-3.5" />;
//   } else if (columnTitle.toLowerCase().includes('progress') || columnTitle.toLowerCase().includes('doing')) {
//     icon = <CircleDot className="w-3.5 h-3.5" />;
//   } else {
//     icon = <Circle className="w-3.5 h-3.5" />;
//   }
//   return { icon, color };
// };

// const priorityConfig: Record<string, { label: string; color: string; bg: string; dotColor: string }> = {
//   URGENT: { label: 'Urgent', color: '#ef4444', bg: '#fef2f2', dotColor: '#ef4444' },
//   HIGH:   { label: 'High',   color: '#f97316', bg: '#fff7ed', dotColor: '#f97316' },
//   MEDIUM: { label: 'Medium', color: '#eab308', bg: '#fefce8', dotColor: '#eab308' },
//   LOW:    { label: 'Low',    color: '#22c55e', bg: '#f0fdf4', dotColor: '#22c55e' },
//   NONE:   { label: 'Normal', color: '#94a3b8', bg: '#f8fafc', dotColor: '#94a3b8' },
// };

// export function ScrumBoardTaskList() {
//   const { data: session } = useSession();
//   const queryClient = useQueryClient();

//   const [selectedBoardId, setSelectedBoardId] = useState<string>('');
//   const [showBoardSelector, setShowBoardSelector] = useState(false);
//   const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
//   const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
//   const [showColumnSelector, setShowColumnSelector] = useState<string | null>(null);
//   const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

//   const { data: boards, isLoading: boardsLoading } = useQuery({
//     queryKey: ['boards'],
//     queryFn: async () => {
//       const res = await fetch('/api/boards');
//       if (!res.ok) throw new Error('Failed to fetch boards');
//       return res.json() as Promise<Board[]>;
//     },
//     enabled: !!session,
//   });

//   useEffect(() => {
//     if (boards && boards.length > 0 && !selectedBoardId) {
//       setSelectedBoardId(boards[0].id);
//     }
//   }, [boards, selectedBoardId]);

//   const { data: board, isLoading: boardLoading } = useQuery({
//     queryKey: ['board', selectedBoardId],
//     queryFn: async () => {
//       const res = await fetch(`/api/boards/${selectedBoardId}`);
//       if (!res.ok) throw new Error('Failed to fetch board');
//       return res.json() as Promise<Board>;
//     },
//     enabled: !!selectedBoardId && !!session,
//   });

//   const updateTaskMutation = useMutation({
//     mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
//       const res = await fetch(`/api/tasks/${taskId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           title: updates.title,
//           description: updates.description,
//           columnId: updates.columnId,
//           priority: updates.priority,
//           dueDate: updates.dueDate,
//           coverImage: updates.coverImage,
//           isArchived: updates.isArchived,
//           order: updates.order,
//         }),
//       });
//       if (!res.ok) throw new Error('Failed to update task');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', selectedBoardId] });
//     },
//   });

//   const handleMoveToColumn = (task: Task, columnId: string) => {
//     updateTaskMutation.mutate({ taskId: task.id, updates: { columnId } });
//     setShowColumnSelector(null);
//   };

//   const handleTaskClick = (task: Task) => {
//     setSelectedTask(task);
//     setIsTaskModalOpen(true);
//   };

//   const toggleGroup = (columnId: string) => {
//     setCollapsedGroups(prev => {
//       const next = new Set(prev);
//       if (next.has(columnId)) next.delete(columnId);
//       else next.add(columnId);
//       return next;
//     });
//   };

//   const selectedBoard = boards?.find(b => b.id === selectedBoardId);
//   const sortedColumns = board?.columns?.sort((a, b) => a.order - b.order) || [];

//   if (boardsLoading) {
//     return (
//       <div className="h-full flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
//       </div>
//     );
//   }

//   if (!boards || boards.length === 0) {
//     return (
//       <div className="h-full flex flex-col items-center justify-center text-gray-500">
//         <Folder className="size-12 mb-3 opacity-40" />
//         <p className="font-medium">No boards found</p>
//         <p className="text-sm mt-1 text-gray-400">Create a board to get started</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full flex flex-col bg-[#1a1a2e] dark:bg-[#0f0f1a] text-white">

//       {/* Top Bar */}
//       <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
//         {/* Board Selector */}
//         <div className="relative">
//           <button type="button"
//             onClick={() => setShowBoardSelector(!showBoardSelector)}
//             className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-semibold"
//           >
//             <LayoutGrid className="size-4text-indigo-400" />
//             <span className="text-white">{selectedBoard?.title || 'Select Board'}</span>
//             <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showBoardSelector ? 'rotate-180' : ''}`} />
//           </button>

//           {showBoardSelector && (
//             <div className="absolute top-full left-0 mt-1 w-64 bg-[#1e1e32] rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden">
//               <div className="p-1.5">
//                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 py-1.5">Boards</p>
//                 {boards.map(b => (
//                   <button type="button"
//                     key={b.id}
//                     onClick={() => { setSelectedBoardId(b.id); setShowBoardSelector(false); }}
//                     className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors text-sm ${
//                       b.id === selectedBoardId
//                         ? 'bg-indigo-500/20 text-indigo-300'
//                         : 'hover:bg-white/5 text-gray-300'
//                     }`}
//                   >
//                     <div
//                       className="size-6 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
//                       style={{ backgroundColor: '#6366f1' }}
//                     >
//                       {b.title.slice(0, 2).toUpperCase()}
//                     </div>
//                     <span className="truncate">{b.title}</span>
//                     {b.id === selectedBoardId && <div className="ml-auto size-1.5  rounded-full bg-indigo-400" />}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Right actions */}
//         <div className="flex items-center gap-2">
//           <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
//             <Filter className="w-3.5 h-3.5" />
//             <span>Filter</span>
//           </button>
//           <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
//             <SlidersHorizontal className="w-3.5 h-3.5" />
//             <span>Group by</span>
//           </button>

//           <TaskForm>
//             <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
//               <Plus className="w-3.5 h-3.5" />
//               Task
//             </button>
//           </TaskForm>
//         </div>
//       </div>

//       {/* Column Headers */}
//       <div className="flex items-center px-4 py-2 border-b border-white/5 flex-shrink-0 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
//         <div className="flex-1 min-w-0 pl-8">Name</div>
//         <div className="w-32 text-center flex-shrink-0">Assignee</div>
//         <div className="w-28 text-center flex-shrink-0">Due date</div>
//         <div className="w-28 text-center flex-shrink-0">Priority</div>
//         <div className="w-32 text-center flex-shrink-0">Status</div>
//         <div className="w-8 flex-shrink-0" />
//       </div>

//       {/* Task List */}
//       <div className="flex-1 overflow-y-auto thin-scrollbar">
//         {boardLoading ? (
//           <div className="flex items-center justify-center h-40">
//             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
//           </div>
//         ) : sortedColumns.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-40 text-gray-500">
//             <p className="text-sm">No columns in this board</p>
//           </div>
//         ) : (
//           sortedColumns.map((column, colIndex) => {
//             const isLast = colIndex === sortedColumns.length - 1;
//             const isCollapsed = collapsedGroups.has(column.id);
//             const badge = getGroupBadge(column.title, column.color, isLast);
//             const tasks = column.tasks.sort((a, b) => a.order - b.order);

//             return (
//               <div key={column.id}>
//                 {/* Group Header */}
//                 <div
//                   className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 cursor-pointer group sticky top-0 bg-[#1a1a2e] dark:bg-[#0f0f1a] z-10 border-b border-white/5"
//                   onClick={() => toggleGroup(column.id)}
//                 >
//                   {/* Collapse toggle */}
//                   <div className="text-gray-500 group-hover:text-gray-300 transition-colors">
//                     {isCollapsed
//                       ? <ChevronRight className="w-3.5 h-3.5" />
//                       : <ChevronDown className="w-3.5 h-3.5" />
//                     }
//                   </div>

//                   {/* Status badge */}
//                   <div
//                     className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
//                     style={{
//                       backgroundColor: `${badge.color}25`,
//                       color: badge.color,
//                     }}
//                   >
//                     {badge.icon}
//                     {column.title.toUpperCase()}
//                   </div>

//                   {/* Task count */}
//                   <span className="text-xs text-gray-500">{tasks.length}</span>

//                   {/* Add task to this column */}
//                   <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
//                     <button type="button"
//                       className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
//                       onClick={(e) => { e.stopPropagation(); }}
//                     >
//                       <MoreHorizontal className="w-3.5 h-3.5" />
//                     </button>
//                     <button type="button"
//                       className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
//                       onClick={(e) => { e.stopPropagation(); }}
//                     >
//                       <Plus className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Tasks */}
//                 {!isCollapsed && (
//                   <>
//                     {tasks.map(task => {
//                       const priority = priorityConfig[task.priority] || priorityConfig.NONE;
//                       const isHovered = hoveredTaskId === task.id;

//                       return (
//                         <div
//                           key={task.id}
//                           className={`flex items-center px-4 py-0 border-b border-white/5 cursor-pointer transition-colors group/row ${
//                             isHovered ? 'bg-white/5' : 'hover:bg-white/5'
//                           }`}
//                           onMouseEnter={() => setHoveredTaskId(task.id)}
//                           onMouseLeave={() => setHoveredTaskId(null)}
//                           onClick={() => handleTaskClick(task)}
//                           style={{ minHeight: '36px' }}
//                         >
//                           {/* Status icon (the column-changer button - kept from original) */}
//                           <div
//                             className="flex-shrink-0 mr-2"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setShowColumnSelector(showColumnSelector === task.id ? null : task.id);
//                             }}
//                           >
//                             <div className="cursor-pointer hover:scale-110 transition-transform">
//                               {/* {getStatusIcon(task.columnTitle, task.columnColor, isLast)} */}
//                             </div>
//                           </div>

//                           {/* Task name */}
//                           <div className="flex-1 min-w-0 py-2">
//                             <span className="text-sm text-gray-200 group-hover/row:text-white truncate block transition-colors">
//                               {task.title}
//                             </span>
//                             {/* Labels */}
//                             {task.labels.length > 0 && (
//                               <div className="flex items-center gap-1 mt-0.5">
//                                 {task.labels.slice(0, 3).map(({ label }) => (
//                                   <span
//                                     key={label.id}
//                                     className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
//                                     style={{ backgroundColor: `${label.color}30`, color: label.color }}
//                                   >
//                                     {label.name}
//                                   </span>
//                                 ))}
//                               </div>
//                             )}
//                           </div>

//                           {/* Assignee */}
//                           <div className="w-32 flex-shrink-0 flex justify-center items-center">
//                             {task.assignees.length === 0 ? (
//                               <div className="size-6 rounded-full border border-dashed border-gray-600 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
//                                 <User className="size-3 text-gray-500" />
//                               </div>
//                             ) : (
//                               <div className="flex -gap-x-1.5">
//                                 {task.assignees.slice(0, 3).map(({ user }) => (
//                                   <div
//                                     key={user.id}
//                                     className="size-6 rounded-full border-2 border-[#1a1a2e] bg-indigo-900 overflow-hidden flex items-center justify-center"
//                                     title={user.name || ''}
//                                   >
//                                     {user.image ? (
//                                       <img src={user.image} alt="" className="w-full h-full object-cover" />
//                                     ) : (
//                                       <span className="text-[10px] font-bold text-indigo-300">
//                                         {user.name?.charAt(0).toUpperCase() || '?'}
//                                       </span>
//                                     )}
//                                   </div>
//                                 ))}
//                                 {task.assignees.length > 3 && (
//                                   <div className="size-6 rounded-full border-2 border-[#1a1a2e] bg-gray-700 flex items-center justify-center text-[9px] text-gray-300">
//                                     +{task.assignees.length - 3}
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//                           </div>

//                           {/* Due Date */}
//                           <div className="w-28 flex-shrink-0 flex justify-center">
//                             {task.dueDate && moment(task.dueDate).isValid() ? (
//                               <span className={`text-xs flex items-center gap-1 ${
//                                 moment(task.dueDate).isBefore(moment(), 'day')
//                                   ? 'text-red-400'
//                                   : 'text-gray-400'
//                               }`}>
//                                 <Calendar className="size-3" />
//                                 {moment(task.dueDate).format('M/D/YY')}
//                               </span>
//                             ) : (
//                               <span className="text-gray-600 opacity-0 group-hover/row:opacity-100 transition-opacity">
//                                 <Calendar className="w-3.5 h-3.5" />
//                               </span>
//                             )}
//                           </div>

//                           {/* Priority */}
//                           <div className="w-28 flex-shrink-0 flex justify-center">
//                             {task.priority && task.priority !== 'NONE' ? (
//                               <div className="flex items-center gap-1.5">
//                                 <Flag className="size-3" style={{ color: priority.color }} />
//                                 <span className="text-xs" style={{ color: priority.color }}>
//                                   {priority.label}
//                                 </span>
//                               </div>
//                             ) : (
//                               <Flag className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover/row:opacity-100 transition-opacity" />
//                             )}
//                           </div>

//                           {/* Status column badge */}
//                           <div className="w-32 flex-shrink-0 flex justify-center">
//                             <div
//                               className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
//                               style={{
//                                 backgroundColor: `${badge.color}20`,
//                                 color: badge.color,
//                               }}
//                             >
//                               {badge.icon}
//                               <span className="truncate max-w-[70px]">{column.title.toUpperCase()}</span>
//                             </div>
//                           </div>

//                           {/* Row actions */}
//                           <div className="w-8 flex-shrink-0 flex justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
//                             <button type="button"
//                               className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
//                               onClick={(e) => e.stopPropagation()}
//                             >
//                               <MoreHorizontal className="w-3.5 h-3.5" />
//                             </button>
//                           </div>
//                         </div>
//                       );
//                     })}

//                     {/* Add Task row */}
//                     <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 hover:bg-white/5 cursor-pointer group/add transition-colors">
//                       <Plus className="w-3.5 h-3.5 text-gray-600 group-hover/add:text-gray-400 transition-colors ml-0.5" />
//                       <span className="text-xs text-gray-600 group-hover/add:text-gray-400 transition-colors">
//                         Add Task
//                       </span>
//                     </div>
//                   </>
//                 )}
//               </div>
//             );
//           })
//         )}

//         {/* New Status button */}
//         {!boardLoading && sortedColumns.length > 0 && (
//           <div className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 cursor-pointer group/new transition-colors">
//             <Plus className="w-3.5 h-3.5 text-gray-600 group-hover/new:text-gray-400 transition-colors" />
//             <span className="text-xs text-gray-600 group-hover/new:text-gray-400 transition-colors">
//               New status
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Column Selector Popup (the original status-change button) */}
//       {showColumnSelector && board && (
//         <>
//           <div className="fixed inset-0 z-40" onClick={() => setShowColumnSelector(null)} />
//           <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
//             <div className="bg-[#1e1e32] border border-white/10 rounded-xl shadow-2xl p-2 pointer-events-auto min-w-[180px]">
//               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 py-1.5">
//                 Move to
//               </p>
//               <div className="space-y-0.5">
//                 {sortedColumns.map((col, idx) => {
//                   const isLast = idx === sortedColumns.length - 1;
//                   const badge = getGroupBadge(col.title, col.color, isLast);
//                   return (
//                     <button type="button"
//                       key={col.id}
//                       onClick={() => {
//                         const task = board.columns.flatMap(c => c.tasks).find(t => t.id === showColumnSelector);
//                         if (task) handleMoveToColumn(task, col.id);
//                       }}
//                       className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
//                     >
//                       <div style={{ color: badge.color }}>{badge.icon}</div>
//                       <span className="text-sm font-medium text-gray-200">{col.title}</span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Board selector backdrop */}
//       {showBoardSelector && (
//         <div className="fixed inset-0 z-40" onClick={() => setShowBoardSelector(false)} />
//       )}

//       {/* Task Modal */}
//       {isTaskModalOpen && selectedTask && board && (
//         <TaskModal
//           task={selectedTask}
//           boardId={board.id}
//           boardMembers={board.members}
//           labels={board.labels}
//           closeModal={() => {
//             setIsTaskModalOpen(false);
//             setSelectedTask(null);
//           }}
//         />
//       )}
//     </div>
//   );
// }

// components/board/standalone-board-task-list.tsx
'use client';

import { useState, useEffect } from "react";
import {
  Plus, Folder, LayoutGrid, ChevronDown, ChevronRight,
  Flag, User, Calendar, Circle, CircleDot, CheckCircle2,
  MoreHorizontal, Filter, SlidersHorizontal, Paperclip,
  MessageSquare, CheckSquare, ArrowUp, ArrowRight, ArrowDown,
  Zap, Clock
} from 'lucide-react';

import { TaskModal } from '@/components/Board/task-modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { TaskForm } from "./task-form";
import { format, isBefore, isSameDay, addDays, parseISO, isValid } from 'date-fns';

/* ─── Types ────────────────────────────────────────────────────────────────── */

interface Label { id: string; name: string; color: string; }

interface Task {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  order: number;
  columnId: string;
  columnTitle: string;
  columnColor: string | null;
  assignees: Array<{ id: string; user: { id: string; name: string | null; image: string | null } }>;
  labels: Array<{ id: string; label: Label }>;
  attachments: Array<{ id: string; filename: string }>;
  subtasks: Array<{ id: string; isCompleted: boolean }>;
  _count: { boardComments: number };
}

interface Column { id: string; title: string; color: string | null; order: number; tasks: Task[]; }

interface Board {
  id: string; title: string; description: string | null; coverImage: string | null;
  createdAt: string; updatedAt: string;
  owner: { id: string; name: string | null; image: string | null };
  members: Array<{ id: string; role: string; user: { id: string; name: string | null; image: string | null; email: string } }>;
  columns: Column[]; labels: Label[];
  _count?: { columns: number };
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

const safeTitle = (t: string | null | undefined) => (t ?? '').toLowerCase();

const getStatusIcon = (columnTitle: string | null | undefined, columnColor: string | null, isLast: boolean) => {
  const color = columnColor || '#6366f1';
  const t = safeTitle(columnTitle);
  if (isLast || t.includes('done') || t.includes('complete')) {
    return (
      <div
        className="size-5 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}70` }}
      >
        <CheckCircle2 className="size-3 text-white" />
      </div>
    );
  }
  if (t.includes('progress') || t.includes('doing') || t.includes('work')) {
    return (
      <div
        className="size-5 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110"
        style={{ borderColor: color, background: `conic-gradient(${color}90 180deg, transparent 180deg)` }}
      >
        <CircleDot className="w-2.5 h-2.5" style={{ color }} />
      </div>
    );
  }
  return (
    <div
      className="size-5 rounded-full flex items-center justify-center border-2 border-dashed transition-all hover:scale-110"
      style={{ borderColor: color }}
    >
      <Circle className="w-2.5 h-2.5" style={{ color }} />
    </div>
  );
};

const getGroupBadge = (columnTitle: string | null | undefined, columnColor: string | null, isLast: boolean) => {
  const color = columnColor || '#6366f1';
  const t = safeTitle(columnTitle);
  let icon;
  if (isLast || t.includes('done') || t.includes('complete')) {
    icon = <CheckCircle2 className="size-3" />;
  } else if (t.includes('progress') || t.includes('doing')) {
    icon = <CircleDot className="size-3" />;
  } else {
    icon = <Circle className="size-3" />;
  }
  return { icon, color };
};

const priorityConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  URGENT: { label: 'Urgent', color: '#ef4444', icon: <Zap className="size-3" /> },
  HIGH: { label: 'High', color: '#f97316', icon: <ArrowUp className="size-3" /> },
  MEDIUM: { label: 'Medium', color: '#eab308', icon: <ArrowRight className="size-3" /> },
  LOW: { label: 'Low', color: '#22c55e', icon: <ArrowDown className="size-3" /> },
  NONE: { label: 'Normal', color: '#64748b', icon: <Flag className="size-3" /> },
};

const getDueDateStyle = (dueDate: string | null) => {
  if (!dueDate) {
    return { text: '—', className: 'text-gray-700', urgent: false };
  }

  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;

  if (!isValid(date)) {
    return { text: '—', className: 'text-gray-700', urgent: false };
  }

  const today = new Date();
  const tomorrow = addDays(today, 1);

  const isOverdue = isBefore(date, today) && !isSameDay(date, today);
  const isToday = isSameDay(date, today);
  const isTomorrow = isSameDay(date, tomorrow);

  if (isOverdue) return { text: format(date, 'M/d/yy'), className: 'text-red-400 font-semibold', urgent: true };
  if (isToday) return { text: 'Today', className: 'text-amber-400 font-semibold', urgent: false };
  if (isTomorrow) return { text: 'Tomorrow', className: 'text-yellow-400', urgent: false };
  return { text: format(date, 'M/d/yy'), className: 'text-gray-400', urgent: false };
};

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function ScrumBoardTaskList() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [showBoardSelector, setShowBoardSelector] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState<string | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  /* Queries */
  const { data: boards, isLoading: boardsLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await fetch('/api/boards');
      if (!res.ok) throw new Error('Failed to fetch boards');
      return res.json() as Promise<Board[]>;
    },
    enabled: !!session,
  });

  useEffect(() => {
    if (boards?.length && !selectedBoardId) setSelectedBoardId(boards[0].id);
  }, [boards, selectedBoardId]);

  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ['board', selectedBoardId],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${selectedBoardId}`);
      if (!res.ok) throw new Error('Failed to fetch board');
      return res.json() as Promise<Board>;
    },
    enabled: !!selectedBoardId && !!session,
  });

  /* Mutations */
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updates.title, description: updates.description,
          columnId: updates.columnId, priority: updates.priority,
          dueDate: updates.dueDate, coverImage: updates.coverImage,
          isArchived: updates.isArchived, order: updates.order,
        }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', selectedBoardId] }),
  });

  /* Handlers */
  const handleMoveToColumn = (task: Task, columnId: string) => {
    updateTaskMutation.mutate({ taskId: task.id, updates: { columnId } });
    setShowColumnSelector(null);
  };

  const handleTaskClick = (task: Task) => { setSelectedTask(task); setIsTaskModalOpen(true); };

  const toggleGroup = (columnId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(columnId) ? next.delete(columnId) : next.add(columnId);
      return next;
    });
  };

  /* Derived */
  const selectedBoard = boards?.find(b => b.id === selectedBoardId);
  const sortedColumns = board?.columns?.slice().sort((a, b) => a.order - b.order) ?? [];
  const totalTasks = sortedColumns.reduce((s, c) => s + c.tasks.length, 0);

  /* Loading / empty */
  if (boardsLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#12121e]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading boards…</p>
        </div>
      </div>
    );
  }

  if (!boards?.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#12121e] text-gray-500">
        <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Folder className="size-8 opacity-40" />
        </div>
        <p className="font-semibold text-gray-300">No boards yet</p>
        <p className="text-sm mt-1 text-gray-600">Create a board to get started</p>
      </div>
    );
  }

  /* ─── Render ──────────────────────────────────────────────────────────────── */

  return (
    <div className="w-full min-h-full h-full flex flex-col bg-[#111] text-white overflow-hidden">

      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] flex-shrink-0">

        {/* Board Selector */}
        <div className="relative">
          <button type="button"
            onClick={() => setShowBoardSelector(!showBoardSelector)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <div className="size-5 rounded flex items-center justify-center bg-indigo-500/20 flex-shrink-0">
              <LayoutGrid className="size-3 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-white">{selectedBoard?.title ?? 'Select Board'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showBoardSelector ? 'rotate-180' : ''}`} />
          </button>

          {showBoardSelector && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#1c1c2e] rounded-xl shadow-2xl border border-white/[0.08] z-50 overflow-hidden">
              <div className="p-1.5">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2.5 py-1.5">Boards</p>
                {boards.map(b => (
                  <button type="button"
                    key={b.id}
                    onClick={() => { setSelectedBoardId(b.id); setShowBoardSelector(false); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors text-sm ${b.id === selectedBoardId ? 'bg-indigo-500/15 text-indigo-300' : 'hover:bg-white/5 text-gray-300'
                      }`}
                  >
                    <div
                      className="size-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white bg-cover bg-center"
                      style={b.coverImage ? { backgroundImage: `url(${b.coverImage})` } : { backgroundColor: '#4f46e5' }}
                    >
                      {!b.coverImage && b.title.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{b.title}</p>
                      <p className="text-[10px] text-gray-600">{b._count?.columns ?? b.columns?.length ?? 0} columns</p>
                    </div>
                    {b.id === selectedBoardId && <div className="size-1.5  rounded-full bg-indigo-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 mr-2 text-xs text-gray-600">
            <Clock className="size-3" />
            {/* <span>{moment().format('ddd, D MMM')}</span> */}
            <span>{format(new Date(), 'd MMM')}</span>
            <span className="mx-1 text-gray-700">·</span>
            <span className="text-gray-500">{totalTasks} tasks</span>
          </div>
          <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] rounded-lg transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] rounded-lg transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Group by
          </button>
          <div className="w-px h-5 bg-white/[0.08] mx-1" />
          <TaskForm>
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-900/40">
              <Plus className="w-3.5 h-3.5" />
              New Task
            </button>
          </TaskForm>
        </div>
      </div>

      {/* Column Headers */}
      <div className="flex items-center px-5 py-2 border-b border-white/[0.06] flex-shrink-0">
        {/* spacer for status icon + accent bar */}
        <div className="w-10 flex-shrink-0 mr-3" />
        <div className="flex-1 min-w-0 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Name</div>
        <div className="w-36 flex-shrink-0 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">Assignee</div>
        <div className="w-28 flex-shrink-0 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">Due date</div>
        <div className="w-28 flex-shrink-0 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">Priority</div>
        <div className="w-36 flex-shrink-0 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">Status</div>
        <div className="w-24 flex-shrink-0 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">Progress</div>
        <div className="w-7 flex-shrink-0" />
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a3e transparent' }}>
        {boardLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent" />
            <p className="text-xs text-gray-600">Loading tasks…</p>
          </div>
        ) : sortedColumns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-600">
            <p className="text-sm">No columns in this board</p>
          </div>
        ) : (
          sortedColumns.map((column, colIndex) => {
            const isLast = colIndex === sortedColumns.length - 1;
            const isCollapsed = collapsedGroups.has(column.id);
            const badge = getGroupBadge(column.title, column.color, isLast);
            const tasks = column.tasks.slice().sort((a, b) => a.order - b.order);

            return (
              <div key={column.id}>

                {/* Group Header */}
                <div
                  className="flex items-center gap-2 px-5 py-2.5 cursor-pointer group sticky top-0 z-10 border-b border-white/[0.05]"
                  style={{ backgroundColor: '#111' }}
                  onClick={() => toggleGroup(column.id)}
                >
                  <div className="w-0.5 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: badge.color }} />
                  <div className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0">
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide"
                    style={{ backgroundColor: `${badge.color}18`, color: badge.color }}
                  >
                    {badge.icon}
                    {(column.title ?? '').toUpperCase()}
                  </div>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${badge.color}18`, color: badge.color }}
                  >
                    {tasks.length}
                  </span>
                  <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-600 hover:text-gray-300 transition-colors" onClick={e => e.stopPropagation()}>
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-600 hover:text-gray-300 transition-colors" onClick={e => e.stopPropagation()}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tasks */}
                {!isCollapsed && (
                  <>
                    {tasks.map(task => {
                      const priority = priorityConfig[task.priority] ?? priorityConfig.NONE;
                      const due = getDueDateStyle(task.dueDate);
                      const subtaskTotal = task.subtasks.length;
                      const subtaskDone = task.subtasks.filter(s => s.isCompleted).length;
                      const subtaskPct = subtaskTotal > 0 ? Math.round((subtaskDone / subtaskTotal) * 100) : null;

                      return (
                        <div
                          key={task.id}
                          className="flex items-center px-5 border-b border-white/[0.04] cursor-pointer transition-colors duration-100 group/row hover:bg-white/[0.03]"
                          style={{ minHeight: '40px' }}
                          onMouseEnter={() => setHoveredTaskId(task.id)}
                          onMouseLeave={() => setHoveredTaskId(null)}
                          onClick={() => handleTaskClick(task)}
                        >
                          {/* Left accent on hover */}
                          <div
                            className="w-0.5 h-4 rounded-full flex-shrink-0 mr-2 opacity-0 group-hover/row:opacity-100 transition-opacity"
                            style={{ backgroundColor: badge.color }}
                          />

                          {/* Status icon — column changer (kept from original) */}
                          <div
                            className="flex-shrink-0 mr-3 cursor-pointer"
                            onClick={e => {
                              e.stopPropagation();
                              setShowColumnSelector(showColumnSelector === task.id ? null : task.id);
                            }}
                          >
                            {getStatusIcon(task.columnTitle, task.columnColor, isLast)}
                          </div>

                          {/* Name + meta */}
                          <div className="flex-1 min-w-0 py-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm text-gray-300 group-hover/row:text-white truncate transition-colors font-medium">
                                {task.title}
                              </span>
                              <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                {task._count.boardComments > 0 && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-gray-600">
                                    <MessageSquare className="size-3" />{task._count.boardComments}
                                  </span>
                                )}
                                {task.attachments.length > 0 && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-gray-600">
                                    <Paperclip className="size-3" />{task.attachments.length}
                                  </span>
                                )}
                              </div>
                            </div>
                            {task.labels.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                {task.labels.slice(0, 3).map(({ label }) => (
                                  <span
                                    key={label.id}
                                    className="text-[9px] px-1.5 py-0.5 rounded-sm font-semibold tracking-wide"
                                    style={{ backgroundColor: `${label.color}22`, color: label.color }}
                                  >
                                    {label.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Assignee */}
                          <div className="w-36 flex-shrink-0 flex justify-center items-center">
                            {task.assignees.length === 0 ? (
                              <button type="button"
                                className="size-6 rounded-full border border-dashed border-gray-700 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:border-gray-500"
                                onClick={e => e.stopPropagation()}
                              >
                                <User className="size-3 text-gray-600" />
                              </button>
                            ) : (
                              <div className="flex -gap-x-2">
                                {task.assignees.slice(0, 3).map(({ user }) => (
                                  <div
                                    key={user.id}
                                    className="size-6 rounded-full border-2 border-[#12121e] bg-indigo-900 overflow-hidden flex items-center justify-center flex-shrink-0"
                                    title={user.name ?? ''}
                                  >
                                    {user.image
                                      ? <img src={user.image} alt="" className="w-full h-full object-cover" />
                                      : <span className="text-[10px] font-bold text-indigo-300">{user.name?.charAt(0).toUpperCase() ?? '?'}</span>
                                    }
                                  </div>
                                ))}
                                {task.assignees.length > 3 && (
                                  <div className="size-6 rounded-full border-2 border-[#12121e] bg-[#1e1e30] flex items-center justify-center text-[9px] text-gray-400 font-bold">
                                    +{task.assignees.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Due Date */}
                          <div className="w-28 flex-shrink-0 flex justify-center">
                            {task.dueDate && parseISO(task.dueDate) ? (
                              <span className={`text-xs flex items-center gap-1 ${due.className}`}>
                                <Calendar className="size-3 flex-shrink-0" />
                                {format(parseISO(task.dueDate), 'd MMM')}
                              </span>
                            ) : (
                              <Calendar className="w-3.5 h-3.5 text-gray-700 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                            )}
                          </div>

                          {/* Priority */}
                          <div className="w-28 flex-shrink-0 flex justify-center">
                            {task.priority && task.priority !== 'NONE' ? (
                              <div className="flex items-center gap-1.5" style={{ color: priority.color }}>
                                {priority.icon}
                                <span className="text-xs font-medium">{priority.label}</span>
                              </div>
                            ) : (
                              <Flag className="w-3.5 h-3.5 text-gray-700 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                            )}
                          </div>

                          {/* Status */}
                          <div className="w-36 flex-shrink-0 flex justify-center">
                            <div
                              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide"
                              style={{ backgroundColor: `${badge.color}18`, color: badge.color }}
                            >
                              {badge.icon}
                              <span className="truncate max-w-[80px]">{(column.title ?? '').toUpperCase()}</span>
                            </div>
                          </div>

                          {/* Subtask progress */}
                          <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center gap-1">
                            {subtaskPct !== null ? (
                              <>
                                <div className="w-14 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${subtaskPct}%`,
                                      backgroundColor: subtaskPct === 100 ? '#22c55e' : badge.color,
                                    }}
                                  />
                                </div>
                                <span className="text-[9px] text-gray-600">{subtaskDone}/{subtaskTotal}</span>
                              </>
                            ) : (
                              <CheckSquare className="w-3.5 h-3.5 text-gray-700 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                            )}
                          </div>

                          {/* Row menu */}
                          <div className="w-7 flex-shrink-0 flex justify-center">
                            <button type="button"
                              className="p-1 rounded hover:bg-white/10 text-gray-700 hover:text-gray-300 transition-colors opacity-0 group-hover/row:opacity-100"
                              onClick={e => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Task row */}
                    <div className="flex items-center gap-2.5 px-5 py-2 border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer group/add transition-colors">
                      <div className="w-0.5 flex-shrink-0 mr-2" />
                      <div className="w-5 flex-shrink-0 mr-3" />
                      <Plus className="w-3.5 h-3.5 text-gray-700 group-hover/add:text-gray-500 transition-colors" />
                      <span className="text-xs text-gray-700 group-hover/add:text-gray-500 transition-colors">Add Task</span>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}

        {/* New Status */}
        {!boardLoading && sortedColumns.length > 0 && (
          <div className="flex items-center gap-2 px-5 py-3 hover:bg-white/[0.02] cursor-pointer group/new transition-colors border-b border-white/[0.04]">
            <Plus className="w-3.5 h-3.5 text-gray-700 group-hover/new:text-gray-500 transition-colors" />
            <span className="text-xs text-gray-700 group-hover/new:text-gray-500 transition-colors">New status</span>
          </div>
        )}
      </div>

      {/* ── Column Selector Popup (original status-change button popup — kept) ── */}
      {showColumnSelector && board && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowColumnSelector(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-[#1c1c2e] border border-white/[0.08] rounded-xl shadow-2xl p-2 pointer-events-auto min-w-[200px]">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2.5 py-1.5">
                Move to column
              </p>
              <div className="space-y-0.5">
                {sortedColumns.map((col, idx) => {
                  const colBadge = getGroupBadge(col.title, col.color, idx === sortedColumns.length - 1);
                  const isCurrent = board.columns.flatMap(c => c.tasks).find(t => t.id === showColumnSelector)?.columnId === col.id;
                  return (
                    <button type="button"
                      key={col.id}
                      onClick={() => {
                        const task = board.columns.flatMap(c => c.tasks).find(t => t.id === showColumnSelector);
                        if (task) handleMoveToColumn(task, col.id);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left ${isCurrent ? 'bg-white/5' : 'hover:bg-white/5'
                        }`}
                    >
                      <div style={{ color: colBadge.color }}>{colBadge.icon}</div>
                      <span className="text-sm font-medium text-gray-200 flex-1">{col.title}</span>
                      {isCurrent && (
                        <div className="size-1.5  rounded-full flex-shrink-0" style={{ backgroundColor: colBadge.color }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Board selector backdrop */}
      {showBoardSelector && (
        <div className="fixed inset-0 z-40" onClick={() => setShowBoardSelector(false)} />
      )}

      {/* Task Modal */}
      {isTaskModalOpen && selectedTask && board && (
        <TaskModal
          task={selectedTask}
          boardId={board.id}
          boardMembers={board.members}
          labels={board.labels}
          closeModal={() => { setIsTaskModalOpen(false); setSelectedTask(null); }}
        />
      )}
    </div>
  );
}
