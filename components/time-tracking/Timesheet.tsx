// // components/time-tracking/Timesheet.tsx
// import React, { useState, useEffect } from 'react';
// import { ChevronLeft, ChevronRight, Calendar, Clock, DollarSign, Filter, MoreHorizontal, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
// import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
// import { useSession } from 'next-auth/react';

// interface TimesheetProps {
//   userId?: string; // If provided, view this user's timesheet (admin only)
//   isAdmin?: boolean;
// }

// export function Timesheet({ userId, isAdmin }: TimesheetProps) {
//   const { data: session } = useSession();
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
//   const [timesheetData, setTimesheetData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedEntry, setSelectedEntry] = useState<any>(null);
//   const [showApprovalModal, setShowApprovalModal] = useState(false);

//   const targetUserId = userId || session?.user?.id;

//   useEffect(() => {
//     fetchTimesheet();
//   }, [currentDate, viewMode, targetUserId]);

//   const fetchTimesheet = async () => {
//     setLoading(true);
//     try {
//       let start, end;

//       if (viewMode === 'week') {
//         start = startOfWeek(currentDate, { weekStartsOn: 0 });
//         end = endOfWeek(currentDate, { weekStartsOn: 0 });
//       } else {
//         start = startOfMonth(currentDate);
//         end = endOfMonth(currentDate);
//       }

//       const params = new URLSearchParams({
//         userId: targetUserId!,
//         startDate: start.toISOString(),
//         endDate: end.toISOString(),
//         view: viewMode,
//       });

//       const res = await fetch(`/api/time-tracking/timesheet?${params}`);
//       const data = await res.json();
//       setTimesheetData(data);
//     } catch (error) {
//       console.error('Failed to fetch timesheet:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const navigatePrevious = () => {
//     if (viewMode === 'week') {
//       setCurrentDate(subWeeks(currentDate, 1));
//     } else {
//       setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
//     }
//   };

//   const navigateNext = () => {
//     if (viewMode === 'week') {
//       setCurrentDate(addWeeks(currentDate, 1));
//     } else {
//       setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
//     }
//   };

//   const navigateToday = () => {
//     setCurrentDate(new Date());
//   };

//   const formatDuration = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   const getStatusIcon = (entry: any) => {
//     if (entry.entryType === 'TIMER') {
//       return <CheckCircle className="size-4 text-green-500" />;
//     }
//     if (entry.billableStatus === 'APPROVED') {
//       return <CheckCircle className="size-4 text-blue-500" />;
//     }
//     if (entry.billableStatus === 'PENDING') {
//       return <AlertCircle className="size-4 text-yellow-500" />;
//     }
//     return <XCircle className="size-4 text-red-500" />;
//   };

//   const getStatusText = (entry: any) => {
//     if (entry.entryType === 'TIMER') return 'Auto-approved';
//     if (entry.billableStatus === 'APPROVED') return 'Approved';
//     if (entry.billableStatus === 'PENDING') return 'Pending approval';
//     return 'Rejected';
//   };

//   const handleApprove = async (entryId: string, status: 'APPROVED' | 'REJECTED') => {
//     try {
//       const res = await fetch('/api/time-tracking/approve', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ entryId, status }),
//       });

//       if (res.ok) {
//         fetchTimesheet();
//         setShowApprovalModal(false);
//       }
//     } catch (error) {
//       console.error('Failed to approve:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="size-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
//       </div>
//     );
//   }

//   const dateRange = viewMode === 'week' 
//     ? `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`
//     : format(currentDate, 'MMMM yyyy');

//   return (
//     <div className="">
//       {/* Header */}

//       <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <button type="button"
//               onClick={navigatePrevious}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <ChevronLeft className="size-5 text-gray-600" />
//             </button>
//             <span className="text-sm font-medium text-gray-900 min-w-[140px] text-center">
//               {dateRange}
//             </span>
//             <button type="button"
//               onClick={navigateNext}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <ChevronRight className="size-5 text-gray-600" />
//             </button>
//             <button type="button"
//               onClick={navigateToday}
//               className="ml-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//             >
//               Today
//             </button>
//           </div>

//           {/* Summary */}
//           <div className="flex items-center gap-4 text-sm">
//             <div className="flex items-center gap-1.5">
//               <Clock className="size-4 text-gray-400" />
//               <span className="text-gray-600">Total:</span>
//               <span className="font-semibold text-gray-900">
//                 {formatDuration(timesheetData?.weekTotal?.total || 0)}
//               </span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <DollarSign className="size-4 text-green-500" />
//               <span className="text-gray-600">Billable:</span>
//               <span className="font-semibold text-green-600">
//                 {formatDuration(timesheetData?.weekTotal?.billable || 0)}
//               </span>
//             </div>
//           </div>
//         </div>
//       <div className="px-6 py-4">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-4">
//             <h2 className="text-lg font-semibold text-gray-900">
//               {timesheetData?.user?.name || 'My Timesheet'}
//             </h2>
//             {isAdmin && userId && (
//               <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
//                 Admin View
//               </span>
//             )} 
//           </div>

//           <div className="flex items-center gap-2">
//             <button type="button"
//               onClick={() => setViewMode('week')}
//               className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
//                 viewMode === 'week' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               Week
//             </button>
//             <button type="button"
//               onClick={() => setViewMode('month')}
//               className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
//                 viewMode === 'month' ? 'bg-gray-900 text-white' : 'bg-red-500 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               Month
//             </button>
//           </div>
//         </div>

//       </div>

//       {/* Timesheet Grid */}
//       <div className="divide-x divide-[#2A2A2A] flex bg-white dark:bg-[#111111] overflow-hidden rounded-xl shadow-sm border dark:border-[#2A2A2A]">
//         {timesheetData?.entries?.map((day: any) => {
//           const date = new Date(day.date);
//           const isToday = isSameDay(date, new Date());

//           return (
//             <>
//             <div className="divide-y divide-x divide-[#2A2A2A] bg-[#090909]">
//                 {day.entries.length === 0 ? (
//                   <div className="px-6 py-4 text-sm text-end text-gray-400 italic">
//                   please
//                   </div>
//                 ) : (
//                   day.entries.map((entry: any) => (
//                     <div 
//                       key={entry.id} 
//                       className="px-6 py-4 border-t hover:bg-[#111111] transition-colors group"
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-start gap-3 flex-1">
//                           {/* Time Range */}
//                           <div className="w-24 text-sm text-gray-600 font-mono pt-0.5">
//                             {format(new Date(entry.startTime), 'HH:mm')} - 
//                             {entry.endTime 
//                               ? format(new Date(entry.endTime), 'HH:mm')
//                               : 'Running'
//                             }
//                           </div>

//                           {/* Entry Details */}
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 mb-1">
//                               {entry.task ? (
//                                 <>
//                                   <div className="size-2 rounded-full bg-[#090909]" />
//                                   <span className="font-medium text-gray-900 truncate">
//                                     {entry.task.title}
//                                   </span>
//                                   <span className="text-xs text-gray-500">
//                                     {entry.task.column.board.title}
//                                   </span>
//                                 </>
//                               ) : (
//                                 <>
//                                   <div className="size-2 rounded-full bg-gray-400" />
//                                   <span className="text-gray-500 italic">No task</span>
//                                 </>
//                               )}
//                             </div>

//                             {entry.description && (
//                               <p className="text-sm text-gray-600 line-clamp-2">
//                                 {entry.description}
//                               </p>
//                             )}

//                             <div className="flex items-center gap-2 mt-2">
//                               <span className={`text-xs px-2 py-0.5 rounded-full ${
//                                 entry.isBillable 
//                                   ? 'bg-green-100 text-green-700' 
//                                   : 'bg-gray-100 text-gray-600'
//                               }`}>
//                                 {entry.isBillable ? 'Billable' : 'Non-billable'}
//                               </span>
//                               <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
//                                 entry.entryType === 'TIMER'
//                                   ? 'bg-blue-100 text-blue-700'
//                                   : entry.billableStatus === 'APPROVED'
//                                   ? 'bg-green-100 text-green-700'
//                                   : entry.billableStatus === 'PENDING'
//                                   ? 'bg-yellow-100 text-yellow-700'
//                                   : 'bg-red-100 text-red-700'
//                               }`}>
//                                 {getStatusIcon(entry)}
//                                 {getStatusText(entry)}
//                               </span>
//                               {entry.entryType === 'MANUAL' && (
//                                 <span className="text-xs text-gray-500">
//                                   Manual entry
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Duration & Actions */}
//                         <div className="flex items-center gap-4">


//                           {isAdmin && entry.billableStatus === 'PENDING' && entry.entryType === 'MANUAL' && (
//                             <button type="button"
//                               onClick={() => {
//                                 setSelectedEntry(entry);
//                                 setShowApprovalModal(true);
//                               }}
//                               className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 rounded-lg transition-all"
//                             >
//                               <MoreHorizontal className="size-4 text-gray-600" />
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             <div key={day.date} className={`${isToday ? '' : ''}`}>
//               {/* Day Header */}
//               <div className="px-6 py-1 flex items-center justify-between">
//                 <div className="flex flex-col items-start">
//                   <div className="">
//                   <span className={`text-sm ${isToday ? 'text-gray-500' : 'text-gray-700'}`}>
//                     {format(date, 'EE')}
//                   </span>
//                   <span className="text-sm text-gray-500">
//                     {format(date, 'MMM d')}
//                   </span>
//                   </div>
//                   {day.entries.length === 0 ? (
//                     <div className="text-sm  text-gray-900 dark:text-white">
//                       0h
//                     </div>
//                   ) : (day.entries.map((entry: any) => (
//                   <span key={entry.id}  className="text-sm  text-gray-900 dark:text-white">
//                             {formatDuration(entry.duration) || "0h"}
//                   </span>
//                   ))
//                 )}

//                 </div>
//                 {/* <div className="flex items-center gap-3 text-sm">
//                   {day.totalMinutes > 0 && (
//                     <>
//                       <span className="text-gray-600">
//                         {formatDuration(day.totalMinutes)}
//                       </span>
//                       {day.billableMinutes > 0 && (
//                         <span className="text-green-600 font-medium">
//                           ${formatDuration(day.billableMinutes)}
//                         </span>
//                       )}
//                     </>
//                   )}
//                 </div> */}
//               </div>

//               {/* Day Entries */}
//               <div className="divide-y divide-x divide-[#2A2A2A] bg-[#090909]">
//                 {day.entries.length === 0 ? (
//                   <div className="px-6 py-4 text-sm text-end text-gray-400 italic">
//                     __
//                   </div>
//                 ) : (
//                   day.entries.map((entry: any) => (
//                     <div 
//                       key={entry.id} 
//                       className="px-6 py-4 border-t hover:bg-[#111111] transition-colors group"
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-start gap-3 flex-1">
//                           {/* Time Range */}
//                           <div className="w-24 text-sm text-gray-600 font-mono pt-0.5">
//                             {format(new Date(entry.startTime), 'HH:mm')} - 
//                             {entry.endTime 
//                               ? format(new Date(entry.endTime), 'HH:mm')
//                               : 'Running'
//                             }
//                           </div>

//                           {/* Entry Details */}
//                           {/* <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 mb-1">
//                               {entry.task ? (
//                                 <>
//                                   <div className="size-2 rounded-full bg-[#090909]" />
//                                   <span className="font-medium text-gray-900 truncate">
//                                     {entry.task.title}
//                                   </span>
//                                   <span className="text-xs text-gray-500">
//                                     {entry.task.column.board.title}
//                                   </span>
//                                 </>
//                               ) : (
//                                 <>
//                                   <div className="size-2 rounded-full bg-gray-400" />
//                                   <span className="text-gray-500 italic">No task</span>
//                                 </>
//                               )}
//                             </div>

//                             {entry.description && (
//                               <p className="text-sm text-gray-600 line-clamp-2">
//                                 {entry.description}
//                               </p>
//                             )}

//                             <div className="flex items-center gap-2 mt-2">
//                               <span className={`text-xs px-2 py-0.5 rounded-full ${
//                                 entry.isBillable 
//                                   ? 'bg-green-100 text-green-700' 
//                                   : 'bg-gray-100 text-gray-600'
//                               }`}>
//                                 {entry.isBillable ? 'Billable' : 'Non-billable'}
//                               </span>
//                               <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
//                                 entry.entryType === 'TIMER'
//                                   ? 'bg-blue-100 text-blue-700'
//                                   : entry.billableStatus === 'APPROVED'
//                                   ? 'bg-green-100 text-green-700'
//                                   : entry.billableStatus === 'PENDING'
//                                   ? 'bg-yellow-100 text-yellow-700'
//                                   : 'bg-red-100 text-red-700'
//                               }`}>
//                                 {getStatusIcon(entry)}
//                                 {getStatusText(entry)}
//                               </span>
//                               {entry.entryType === 'MANUAL' && (
//                                 <span className="text-xs text-gray-500">
//                                   Manual entry
//                                 </span>
//                               )}
//                             </div>
//                           </div> */}
//                         </div>

//                         {/* Duration & Actions */}
//                         <div className="flex items-center gap-4">


//                           {isAdmin && entry.billableStatus === 'PENDING' && entry.entryType === 'MANUAL' && (
//                             <button type="button"
//                               onClick={() => {
//                                 setSelectedEntry(entry);
//                                 setShowApprovalModal(true);
//                               }}
//                               className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 rounded-lg transition-all"
//                             >
//                               <MoreHorizontal className="size-4 text-gray-600" />
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </>  );
//       })}
//       </div>


//       {/* Approval Modal */}
//       {showApprovalModal && selectedEntry && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">
//               Review Time Entry
//             </h3>
//             <div className="bg-gray-50 rounded-lg p-4 mb-4">
//               <p className="text-sm text-gray-600 mb-1">{selectedEntry.user.name}</p>
//               <p className="font-medium text-gray-900">{selectedEntry.description}</p>
//               <p className="text-sm text-gray-500 mt-1">
//                 {formatDuration(selectedEntry.duration)} • {format(new Date(selectedEntry.startTime), 'MMM d, yyyy')}
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button type="button"
//                 onClick={() => handleApprove(selectedEntry.id, 'REJECTED')}
//                 className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
//               >
//                 Reject
//               </button>
//               <button type="button"
//                 onClick={() => handleApprove(selectedEntry.id, 'APPROVED')}
//                 className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
//               >
//                 Approve
//               </button>
//             </div>
//             <button type="button"
//               onClick={() => setShowApprovalModal(false)}
//               className="w-full mt-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// components/time-tracking/Timesheet.tsx
import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  DollarSign,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  LayoutGrid,
  List,
  Play,
  Tag,
  Settings2
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addDays,
  isToday
} from 'date-fns';
import { useSession } from 'next-auth/react';
import { Button } from '../ui/button';

interface TimesheetProps {
  userId?: string;
  isAdmin?: boolean;
}

interface TimeEntry {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  description?: string;
  isBillable: boolean;
  entryType: 'TIMER' | 'MANUAL';
  billableStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  task?: {
    id: string;
    title: string;
    column: {
      board: {
        title: string;
      };
    };
  };
  tags?: string[];
}

interface DayData {
  date: string;
  entries: TimeEntry[];
  totalMinutes: number;
  billableMinutes: number;
}

export function Timesheet({ userId, isAdmin }: TimesheetProps) {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [timesheetData, setTimesheetData] = useState<{ entries: DayData[]; weekTotal?: any; user?: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const targetUserId = userId || session?.user?.id;

  useEffect(() => {
    fetchTimesheet();
  }, [currentDate, viewMode, targetUserId]);

  const fetchTimesheet = async () => {
    setLoading(true);
    try {
      let start, end;

      if (viewMode === 'week') {
        start = startOfWeek(currentDate, { weekStartsOn: 0 });
        end = endOfWeek(currentDate, { weekStartsOn: 0 });
      } else {
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
      }

      const params = new URLSearchParams({
        userId: targetUserId!,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        view: viewMode,
      });

      const res = await fetch(`/api/time-tracking/timesheet?${params}`);
      const data = await res.json();
      setTimesheetData(data);
    } catch (error) {
      console.error('Failed to fetch timesheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigatePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Group entries by task for grid view
  const getTaskRows = () => {
    if (!timesheetData?.entries) return [];

    const taskMap = new Map();

    timesheetData.entries.forEach((day) => {
      day.entries.forEach((entry) => {
        const taskId = entry.task?.id || 'no-task';
        if (!taskMap.has(taskId)) {
          taskMap.set(taskId, {
            task: entry.task,
            entries: {},
            totalMinutes: 0
          });
        }
        const taskRow = taskMap.get(taskId);
        const dayStr = day.date.split('T')[0];
        if (!taskRow.entries[dayStr]) {
          taskRow.entries[dayStr] = [];
        }
        taskRow.entries[dayStr].push(entry);
        taskRow.totalMinutes += entry.duration;
      });
    });

    return Array.from(taskMap.values());
  };

  const getDays = () => {
    if (!timesheetData?.entries) return [];
    return timesheetData.entries.map(d => new Date(d.date));
  };

  const handleApprove = async (entryId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/time-tracking/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, status }),
      });

      if (res.ok) {
        fetchTimesheet();
        setShowApprovalModal(false);
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const dateRange = viewMode === 'week'
    ? `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`
    : format(currentDate, 'MMMM yyyy');

  const days = getDays();
  const taskRows = getTaskRows();

  return (
    <div className="min-h-screen dark:bg-[#0a0a0a] bg-[#F9F9F9] text-gray-100">
      {/* Header */}
      <div className="">
        <div className="px-3 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Navigation */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button type="button" onClick={navigatePrevious} className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors">
                  <ChevronLeft className="size-5 text-gray-400" />
                </button>
                <span className="text-lg font-medium dark:text-white text-black min-w-[180px] text-center]">
                  {dateRange}
                </span>
                <button type="button" onClick={navigateNext} className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors">
                  <ChevronRight className="size-5 text-gray-400" />
                </button>
                <button type="button" onClick={navigateToday} className="ml-2 px-3 py-1.5 text-sm font-medium dark:bg-[#2A2A2A] dark:text-[#EAEAEA] text-[#474747] bg-[#fff] border-[#E8E8E8] dark:border-[#222] border rounded-lg hover:dark:bg-[#EAEAEA] hover:bg-[#EAEAEA]">
                  Today
                </button>
              </div>

              <div className="flex items-center gap-2 dark:bg-[#111] bg-[#EAEAEA] border-[#E8E8E8] dark:border-[#222] border rounded-lg p-0.5">
                <button type="button"
                  onClick={() => setViewMode('week')}
                  className={`px-2 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'week' ? 'dark:bg-[#2A2A2A] bg-[#fff] dark:text-[#EAEAEA] text-[#474747] border dark:border-[#2A2A2A] border-[#dcdcdc]' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Week
                </button>
                <button type="button"
                  onClick={() => setViewMode('month')}
                  className={`px-2 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'month' ? 'dark:bg-[#2A2A2A] bg-[#fff] dark:text-[#EAEAEA] border dark:border-[#2A2A2A] border-[#dcdcdc] text-[#474747]' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Month
                </button>
              </div>
            </div>

            {/* Right: Summary & Display Toggle */}
            <div className="flex items-center gap-4">

              {/* Grid/List Toggle */}
              <div className="flex items-center dark:bg-[#1A1A1A] bg-[#EAEAEA] border-[#E8E8E8] dark:border-[#222] border rounded-lg p-[1px]">
                <Button type="button"
                variant="ghost"
                size="sm"
                  onClick={() => setDisplayMode('grid')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${displayMode === 'grid'
                    ? 'dark:bg-[#111111] bg-[#fff] dark:text-[#EAEAEA] text-[#474747] border dark:border-[#2A2A2A] border-[#dcdcdc]'
                    : 'text-[#B4B4B4] hover:text-white'
                    }`}
                >
                  <LayoutGrid className="size-4" />
                  <span className="hidden sm:inline">Timesheet</span>
                </Button>
                <Button type="button"
                variant="ghost"
                size="sm"
                  onClick={() => setDisplayMode('list')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${displayMode === 'list'
                    ? 'dark:bg-[#111111] bg-[#fff] dark:text-[#EAEAEA] text-[#474747] border dark:border-[#2A2A2A] border-[#dcdcdc]'
                    : 'text-[#B4B4B4] hover:text-white'
                    }`}
                >
                  <List className="size-4" />
                  <span className="hidden sm:inline">Time entries</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-2 mb-3 flex justify-between items-center gap-4">

          {/* <button type="button" className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-900 border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A]">
            <DollarSign className="w-3.5 h-3.5" />
            Billable status
          </button>
          <button type="button" className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-900 border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A]">
            <Tag className="w-3.5 h-3.5" />
            Tag
          </button>
          <button type="button" className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-900 border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A]">
            <Clock className="w-3.5 h-3.5" />
            Tracked time
          </button> */}

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-gray-500" />
              <span className="text-gray-400">Total:</span>
              <span className="font-semibold text-white">
                {formatDuration(timesheetData?.weekTotal?.total || 0)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="size-4 text-green-500" />
              <span className="text-gray-400">Billable:</span>
              <span className="font-semibold text-green-400">
                {formatDuration(timesheetData?.weekTotal?.billable || 0)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Content */}
      <div className="p-3">
        {displayMode === 'grid' ? (
          /* GRID VIEW */
          <div className="dark:bg-[#111111] bg-[#fff] rounded-xl border dark:border-[#2A2A2A] border-[#E8E8E8] overflow-hidden  overflow-x-auto thin-scrollbar">
            {/* Grid Header */}
            <div
              className="grid border-b dark:border-[#2A2A2A] border-[#F3F3F3]"
              style={{ gridTemplateColumns: `minmax(380px, 1fr) repeat(${days.length}, minmax(100px, 1fr)) 150px` }}
            >
              <div className="px-4 py-1 text-sm my-auto font-medium text-gray-400 border-r border-[#2A2A2A]">
                Task / Location
              </div>
              {days.map((day, idx) => (
                <div
                  key={day.toISOString()}
                  className={`px-2 rounded-t-sm py-1.5 text-start text-sm border-r border-[#F3F3F3] dark:border-[#2A2A2A] ${isToday(day) ? ' border-t-[3px] border-t-blue-500' : ''
                    }`}
                >
                  <div className="flex gap-1">
                    <div className={`text-xs ${isToday(day) ? 'text-[#7B7B7B]' : 'text-[#7B7B7B]'}`}>
                      {format(day, 'EE')},
                    </div>
                    <div className={`text-xs ${isToday(day) ? 'text-[#7B7B7B]' : 'text-[#7B7B7B]'}`}>
                      {format(day, 'MMM d')}
                    </div></div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDuration(timesheetData?.entries[idx]?.totalMinutes || 0)}
                  </div>
                </div>
              ))}
              <div className="px-4 py-3 dark:bg-[#222222] text-sm font-medium text-gray-400 text-center">
                Total
              </div>
            </div>

            {/* Grid Body */}
            <div className="divide-y dark:divide-[#2A2A2A] divide-[#F3F3F3] ">
              {taskRows.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-500">
                  No time entries for this period
                </div>
              ) : (
                taskRows.map((row, rowIdx) => (
                  <div
                    key={row.task?.id || `no-task-${rowIdx}`}
                    className="grid transition-colors "
                    style={{ gridTemplateColumns: `minmax(380px, 1fr) repeat(${days.length}, minmax(100px, 1fr)) 150px` }}
                  >
                    {/* Task Info */}
                    <div className="px-4 py-2 border-r border-[#F3F3F3]  dark:border-[#2A2A2A]">
                      <div className="flex items-center gap-3">
                        <button type="button" className="size-6 flex items-center justify-center rounded-full dark:bg-[#2A2A2A] bg-[#F3F3F3] hover:bg-gray-700 transition-colors">
                          <Play className="size-3 text-gray-400 ml-0.5" />
                        </button>
                        <div>
                          <div className="font-medium text-[#202020] dark:text-gray-200">
                            {row.task?.title || 'No task selected'}
                          </div>
                          {row.task && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <span className="size-1.5  rounded-full bg-blue-500"></span>
                              Progress • {row.task.column.board.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Day Cells */}
                    {days.map((day) => {
                      const dayStr = day.toISOString().split('T')[0];
                      const dayEntries = row.entries[dayStr] || [];
                      const dayTotal = dayEntries.reduce((sum, e) => sum + e.duration, 0);

                      return (
                        <div
                          key={day.toISOString()}
                          className="px-2 py-3 border-r border-[#F3F3F3] dark:bg-[#090909] bg-[#F9F9F9] hover:border hover:border-[#d6d6d6] dark:border-[#2A2A2A] text-center group relative cursor-pointer hover:dark:bg-[#2A2A2A]/50"
                        >
                          {dayTotal > 0 ? (
                            <div className="text-sm text-gray-300">
                              {formatDuration(dayTotal)}
                            </div>
                          ) : (
                            <span className="text-gray-600"> {`_`} </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Row Total */}
                    <div className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-gray-300">
                        {formatDuration(row.totalMinutes)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Task Button */}
            <div className="px-4 py-3 border-t border-[#F3F3F3] dark:border-[#2A2A2A]">
              <button type="button" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                <span className="text-lg leading-none">+</span>
                Add task
              </button>
            </div>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-4">
            {timesheetData?.entries?.map((day) => {
              const date = new Date(day.date);

              return (
                <div key={day.date} className="dark:bg-[#111111] bg-[#fff] rounded-xl border dark:border-[#2A2A2A] border-[#F3F3F3] overflow-hidden">
                  {/* Day Header */}
                  <div className="px-4 py-3 dark:bg-[#191919] bg-[#f4f2f2] border-b dark:border-[#2A2A2A] border-[#F3F3F3] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button type="button" className="dark:text-gray-500 hover:text-gray-300 text-gray-600">
                        <ChevronRight className="size-4" />
                      </button>
                      <span className="font-medium dark:text-gray-200 text-gray-600">
                        {format(date, 'EEE, MMM d')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{formatDuration(day.totalMinutes)}</span>
                        <span className="text-gray-600">/ 8h</span>
                      </div>
                      <div className="w-24 h-1.5 dark:bg-[#2A2A2A] bg-[#F3F3F3] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min((day.totalMinutes / 480) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Entries Table */}
                  {day.entries.length > 0 ? (
                    <div>
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-[#F3F3F3] dark:border-[#2A2A2A]">
                        <div className="col-span-2">Task</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-1 text-center">Billable</div>
                        <div className="col-span-2">Tags</div>
                        <div className="col-span-1">Start</div>
                        <div className="col-span-1">End</div>
                        <div className="col-span-1 text-right">Tracked</div>
                        <div className="col-span-1"></div>
                      </div>

                      {/* Entries */}
                      <div className="divide-y dark:divide-[#2A2A2A] divide-[#F3F3F3]">
                        {day.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:dark:bg-[#2A2A2A]/30 hover:bg-[#F3F3F3]/30 transition-colors group"
                          >
                            {/* Task */}
                            <div className="col-span-2 flex items-center gap-2">
                              <button type="button" className="opacity-0 group-hover:opacity-100 size-6 flex items-center justify-center rounded-full dark:bg-[#2A2A2A] bg-[#F3F3F3] hover:bg-gray-700 transition-all">
                                <Play className="size-3 text-gray-400 ml-0.5" />
                              </button>
                              <div>
                                <div className="text-sm font-medium text-gray-200">
                                  {entry.task?.title || 'No task selected'}
                                </div>
                                {entry.task && (
                                  <div className="text-xs text-gray-500">
                                    {entry.task.column.board.title}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Description */}
                            <div className="col-span-3 text-sm text-gray-400 truncate">
                              {entry.description || '—'}
                            </div>

                            {/* Billable */}
                            <div className="col-span-1 flex justify-center">
                              {entry.isBillable ? (
                                <div className="size-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <DollarSign className="w-3.5 h-3.5 text-green-500" />
                                </div>
                              ) : (
                                <div className="size-6 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                                  <DollarSign className="w-3.5 h-3.5 text-gray-600" />
                                </div>
                              )}
                            </div>

                            {/* Tags */}
                            <div className="col-span-2 flex flex-wrap gap-1">
                              {entry.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {!entry.tags?.length && (
                                <button type="button" className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300">
                                  <Tag className="size-4" />
                                </button>
                              )}
                            </div>

                            {/* Start Time */}
                            <div className="col-span-1 text-sm text-gray-400">
                              {format(new Date(entry.startTime), 'h:mm a')}
                            </div>

                            {/* End Time */}
                            <div className="col-span-1 text-sm text-gray-400">
                              {entry.endTime ? format(new Date(entry.endTime), 'h:mm a') : '—'}
                            </div>

                            {/* Tracked Time */}
                            <div className="col-span-1 text-right text-sm font-medium text-gray-300">
                              {formatDuration(entry.duration)}
                            </div>

                            {/* Actions */}
                            {isAdmin && entry.billableStatus === 'PENDING' && entry.entryType === 'MANUAL' && (
                              <button type="button"
                                onClick={() => {
                                  setSelectedEntry(entry);
                                  setShowApprovalModal(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-2 w-fit self-end hover:bg-[#222] rounded-lg transition-all"
                              >
                                <MoreHorizontal className="size-4 text-gray-600" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No entries for this day
                    </div>
                  )}

                  {/* Add Entry */}
                  <div className="px-4 py-2 border-t dark:border-[#2A2A2A] border-[#F3F3F3]">
                    <button type="button" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
                      <span className="text-lg leading-none">+</span>
                      Add entry
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Review Time Entry</h3>
            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-[#2A2A2A]">
              <p className="text-sm text-gray-400 mb-1">{timesheetData?.user?.name}</p>
              <p className="font-medium text-gray-200">{selectedEntry.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDuration(selectedEntry.duration)} • {format(new Date(selectedEntry.startTime), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button"
                onClick={() => handleApprove(selectedEntry.id, 'REJECTED')}
                className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/30"
              >
                Reject
              </button>
              <button type="button"
                onClick={() => handleApprove(selectedEntry.id, 'APPROVED')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Approve
              </button>
            </div>
            <button type="button"
              onClick={() => setShowApprovalModal(false)}
              className="w-full mt-2 px-4 py-2 text-gray-400 hover:bg-[#2A2A2A] rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
