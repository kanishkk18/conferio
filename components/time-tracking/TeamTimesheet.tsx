// // components/time-tracking/TeamTimesheet.tsx
// import { Clock, Globe } from 'lucide-react';
// import {
//   HoverCard,
//   HoverCardContent,
//   HoverCardTrigger,
// } from "@/components/animate-ui/components/radix/hover-card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// interface TeamMember {
//   id: string;
//   userId: string;
//   role: string;
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     image: string | null;
//   };
//   totalHours: number;
//   billableHours: number;
//   pendingApprovals: number;
// }

// interface TimeEntry {
//   date: string;
//   totalMinutes: number;
//   billableMinutes: number;
//   nonBillableMinutes?: number;
// }

// export function TeamTimesheetNew() {
//   const [members, setMembers] = useState<TeamMember[]>([]);
//   const [entriesMap, setEntriesMap] = useState<Record<string, TimeEntry[]>>({});
//   const [loading, setLoading] = useState(true);
//   const [currentWeek, setCurrentWeek] = useState(new Date());

//   const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
//   const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });

//   useEffect(() => {
//     fetchTeamData();
//   }, [currentWeek]);

//   const fetchTeamData = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/time-tracking/team?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`);
//       const data = await res.json();
//       setMembers(data.members || []);
      
//       // Fetch entries for each member
//       const entriesPromises = data.members.map(async (member: TeamMember) => {
//         const end = new Date(weekStart);
//         end.setDate(end.getDate() + 6);
        
//         const entriesRes = await fetch(`/api/time-tracking/timesheet?userId=${member.userId}&startDate=${weekStart.toISOString()}&endDate=${end.toISOString()}`);
//         const entriesData = await entriesRes.json();
//         return { userId: member.userId, entries: entriesData.entries || [] };
//       });
      
//       const allEntries = await Promise.all(entriesPromises);
//       const entriesRecord: Record<string, TimeEntry[]> = {};
//       allEntries.forEach(({ userId, entries }) => {
//         entriesRecord[userId] = entries;
//       });
//       setEntriesMap(entriesRecord);
      
//     } catch (error) {
//       console.error('Failed to fetch team data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
//   const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));

//   const formatHours = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     return `${hours}h`;
//   };

//   const formatDuration = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
//   };

//   const calculatePercentage = (part: number, total: number): string => {
//     if (total === 0) return '0%';
//     return `${Math.round((part / total) * 100)}%`;
//   };

//   const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

//   // Get entry for specific day
//   const getDayEntry = (userId: string, dayIndex: number): TimeEntry | undefined => {
//     const userEntries = entriesMap[userId] || [];
//     const targetDate = format(weekDays[dayIndex], 'yyyy-MM-dd');
//     return userEntries.find(entry => entry.date === targetDate || entry.date.startsWith(targetDate));
//   };

//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-6">
//       {/* Header Navigation */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1 border border-gray-800">
//             <button type="button" 
//               onClick={prevWeek}
//               className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
//             >
//               <ChevronLeft className="size-4 text-gray-400" />
//             </button>
//             <span className="text-sm font-medium px-2">
//               {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
//             </span>
//             <button type="button" 
//               onClick={nextWeek}
//               className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
//             >
//               <ChevronRight className="size-4 text-gray-400" />
//             </button>
//           </div>
          
//           <button type="button" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200">
//             <ChevronDown className="size-4" />
//           </button>
//         </div>

//         <button type="button" className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2 text-sm hover:bg-gray-800 transition-colors">
//           All members
//           <ChevronDown className="size-4" />
//         </button>
//       </div>

//       {/* Filter Pills */}
//       <div className="flex items-center gap-2 mb-6">
//         <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors">
//           <span className="text-gray-500">$</span>
//           Billable status
//         </button>
//         <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors">
//           <span className="size-2 rounded-full bg-gray-500" />
//           Tag
//         </button>
//         <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors">
//           <Clock className="w-3.5 h-3.5" />
//           Tracked time
//         </button>
//       </div>

//       {/* Timesheet Grid */}
//       <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-hidden">
//         {/* Table Header */}
//         <div className="grid grid-cols-[280px_90px_repeat(7,1fr)_70px] border-b border-gray-800 bg-[#0f0f0f]">
//           <div className="px-4 py-3 text-sm text-gray-500 font-medium border-r border-gray-800">
//             People ({members.length})
//           </div>
//           <div className="px-4 py-3 text-sm text-gray-500 font-medium border-r border-gray-800"></div>
//           {weekDays.map((day) => (
//             <div key={day.toISOString()} className="px-2 py-3 text-center text-xs text-gray-500 font-medium border-r border-gray-800 last:border-r-0">
//               <div>{format(day, 'EEE')}, {format(day, 'MMM d')}</div>
//             </div>
//           ))}
//           <div className="px-2 py-3 text-center text-xs text-gray-500 font-medium">
//             Total
//           </div>
//         </div>

//         {/* Table Body */}
//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <div className="size-8 border-4 border-gray-700 border-t-blue-600 rounded-full animate-spin" />
//           </div>
//         ) : members.length === 0 ? (
//           <div className="py-12 text-center text-gray-500 text-sm">
//             No team members found
//           </div>
//         ) : (
//           members.map((member, index) => (
//             <div 
//               key={member.userId} 
//               className={`grid grid-cols-[280px_90px_repeat(7,1fr)_70px] hover:bg-[#1a1a1a] transition-colors ${index !== members.length - 1 ? 'border-b border-gray-800' : ''}`}
//             >
//               {/* User Info */}
//               <div className="px-4 py-3 flex items-center gap-3 border-r border-gray-800">
//                 {member.user.image ? (
//                   <img 
//                     src={member.user.image} 
//                     alt={member.user.name}
//                     className="size-8 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="size-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-medium">
//                     {member.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
//                   </div>
//                 )}
//                 <div>
//                   <p className="text-sm font-medium text-gray-200">{member.user.name}</p>
//                   <p className="text-xs text-gray-500">{formatHours(member.totalHours)}</p>
//                 </div>
//               </div>

//               {/* Open Button */}
//               <div className="px-4 py-3 flex items-center border-r border-gray-800">
//                 <button type="button" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 transition-colors">
//                   Open
//                   <ChevronRight className="size-3" />
//                 </button>
//               </div>

//               {/* Daily Hours with Hover Card */}
//               {weekDays.map((day) => {
//                 const entry = getDayEntry(member.userId, day.toISOString());
//                 const totalMinutes = entry?.totalMinutes || 0;
//                 const billableMinutes = entry?.billableMinutes || 0;
//                 const nonBillableMinutes = entry?.nonBillableMinutes || (totalMinutes - billableMinutes) || 0;
//                 const capacityMinutes = 480; // 8 hours
//                 const hasData = totalMinutes > 0;
                
//                 return (
//                   <div 
//                     key={day.toISOString()} 
//                     className="border-r border-gray-800 last:border-r-0"
//                   >
//                     <HoverCard openDelay={0} closeDelay={100}>
//                       <HoverCardTrigger asChild>
//                         <div className="px-2 py-3 flex items-center justify-center cursor-pointer hover:bg-[#222] transition-colors h-full">
//                           <div className={`text-sm ${hasData ? 'text-gray-200' : 'text-gray-600'}`}>
//                             {Math.floor(totalMinutes / 60)}h
//                           </div>
//                         </div>
//                       </HoverCardTrigger>
//                       <HoverCardContent 
//                         className="w-72 bg-[#1a1a1a] border border-gray-700 p-0 shadow-xl rounded-lg overflow-hidden"
//                         side="bottom" 
//                         align="center"
//                         sideOffset={5}
//                       >
//                         {/* Header */}
//                         <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
//                           <div>
//                             <p className="text-sm font-medium text-gray-200">
//                               {format(day, 'EEE, MMM d')}
//                             </p>
//                             <p className="text-xs text-gray-500 mt-0.5">Total capacity</p>
//                           </div>
//                           <div className="bg-[#2a2a2a] px-2 py-1 rounded text-xs font-medium text-gray-300">
//                             {formatDuration(capacityMinutes)}
//                           </div>
//                         </div>

//                         {/* Stats */}
//                         <div className="p-4 space-y-3">
//                           {/* Tracked Time */}
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <div className="w-1 h-4 bg-blue-500 rounded-full" />
//                               <span className="text-sm text-gray-300">Tracked time</span>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <span className="text-xs text-gray-500 w-8 text-right">
//                                 {calculatePercentage(totalMinutes, capacityMinutes)}
//                               </span>
//                               <span className="text-sm text-gray-200 w-16 text-right">
//                                 {formatDuration(totalMinutes)}
//                               </span>
//                             </div>
//                           </div>

//                           {/* Billable */}
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <div className="w-1 h-4 bg-green-500 rounded-full" />
//                               <span className="text-sm text-gray-300">Billable</span>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <span className="text-xs text-gray-500 w-8 text-right">
//                                 {calculatePercentage(billableMinutes, capacityMinutes)}
//                               </span>
//                               <span className="text-sm text-gray-200 w-16 text-right">
//                                 {formatDuration(billableMinutes)}
//                               </span>
//                             </div>
//                           </div>

//                           {/* Non-billable */}
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <div className="w-1 h-4 bg-gray-500 rounded-full" />
//                               <span className="text-sm text-gray-300">Non-billable</span>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <span className="text-xs text-gray-500 w-8 text-right">
//                                 {calculatePercentage(nonBillableMinutes, capacityMinutes)}
//                               </span>
//                               <span className="text-sm text-gray-200 w-16 text-right">
//                                 {formatDuration(nonBillableMinutes)}
//                               </span>
//                             </div>
//                           </div>

//                           {/* Divider */}
//                           <div className="border-t border-gray-800 pt-3 mt-3">
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center gap-2">
//                                 <div className="w-1 h-4 bg-gray-400 rounded-full" />
//                                 <span className="text-sm text-gray-300">Remaining capacity</span>
//                               </div>
//                               <div className="flex items-center gap-3">
//                                 <span className="text-xs text-gray-500 w-8 text-right">
//                                   {calculatePercentage(Math.max(0, capacityMinutes - totalMinutes), capacityMinutes)}
//                                 </span>
//                                 <span className="text-sm text-gray-200 w-16 text-right">
//                                   {formatDuration(Math.max(0, capacityMinutes - totalMinutes))}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Footer */}
//                         <div className="px-4 py-2.5 bg-[#141414] border-t border-gray-800 flex items-center gap-2 text-xs text-gray-500">
//                           <Globe className="w-3.5 h-3.5" />
//                           <span>Logged in timezone: IST (UTC+5:30)</span>
//                         </div>
//                       </HoverCardContent>
//                     </HoverCard>
//                   </div>
//                 );
//               })}

//               {/* Total */}
//               <div className="px-2 py-3 flex items-center justify-center">
//                 <div className="text-sm text-gray-400">
//                   {formatHours(member.totalHours)}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Pending Approval Legend */}
//       <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
//         <span className="size-2 rounded-full bg-yellow-500" />
//         <span>Pending Approval</span>
//       </div>
//     </div>
//   );
// }


// // components/time-tracking/TeamTimesheet.tsx
// import React, { useState, useEffect } from 'react';
// import { Users, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
// import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
// import { ArrowRight } from '../animate-ui/icons/arrow-right';

// interface TeamMember {
//   id: string;
//   userId: string;
//   role: string;
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     image: string | null;
//   };
//   totalHours: number; // in minutes
//   billableHours: number; // in minutes
//   dailyHours: number[]; // array of 7 days in minutes
// }

// export function TeamTimesheet() {
//   const [members, setMembers] = useState<TeamMember[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentWeek, setCurrentWeek] = useState(new Date());

//   const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
//   const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
//   const [entriesMap, setEntriesMap] = useState<Record<string, TimeEntry[]>>({});


//   // const fetchTeamData = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const res = await fetch(`/api/time-tracking/team?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`);
//   //     const data = await res.json();
//   //     setMembers(data.members || []);
//   //   } catch (error) {
//   //     console.error('Failed to fetch team data:', error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   useEffect(() => {
//     fetchTeamData();
//   }, [currentWeek]);

//   const fetchTeamData = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/time-tracking/team?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`);
//       const data = await res.json();
//       setMembers(data.members || []);
      
//       // Fetch entries for each member
//       const entriesPromises = data.members.map(async (member: TeamMember) => {
//         const end = new Date(weekStart);
//         end.setDate(end.getDate() + 6);
        
//         const entriesRes = await fetch(`/api/time-tracking/timesheet?userId=${member.userId}&startDate=${weekStart.toISOString()}&endDate=${end.toISOString()}`);
//         const entriesData = await entriesRes.json();
//         return { userId: member.userId, entries: entriesData.entries || [] };
//       });
      
//       const allEntries = await Promise.all(entriesPromises);
//       const entriesRecord: Record<string, TimeEntry[]> = {};
//       allEntries.forEach(({ userId, entries }) => {
//         entriesRecord[userId] = entries;
//       });
//       setEntriesMap(entriesRecord);
      
//     } catch (error) {
//       console.error('Failed to fetch team data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
//   const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));

//   const formatHours = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     return `${hours}h`;
//   };

//   const formatDuration = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
//   };

//   const calculatePercentage = (part: number, total: number): string => {
//     if (total === 0) return '0%';
//     return `${Math.round((part / total) * 100)}%`;
//   };

//   const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

//   // Get entry for specific day
//   const getDayEntry = (userId: string, dayIndex: number): TimeEntry | undefined => {
//     const userEntries = entriesMap[userId] || [];
//     const targetDate = format(weekDays[dayIndex], 'yyyy-MM-dd');
//     return userEntries.find(entry => entry.date === targetDate || entry.date.startsWith(targetDate));
//   };

//   return (
//     <div className="min-h-screen dark:bg-[#0a0a0a] text-gray-200 py-4">
//       {/* Header Navigation */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1 border dark:border-[#181818]">
//             <button type="button" 
//               onClick={prevWeek}
//               className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
//             >
//               <ChevronLeft className="size-4 text-gray-400" />
//             </button>
//             <span className="text-sm font-medium px-2">
//               {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
//             </span>
//             <button type="button" 
//               onClick={nextWeek}
//               className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
//             >
//               <ChevronRight className="size-4 text-gray-400" />
//             </button>
//           </div>
          
//           <button type="button" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200">
//             <ChevronDown className="size-4" />
//           </button>
//         </div>

//         <button type="button" className="flex items-center gap-2 bg-[#1a1a1a] border dark:border-[#181818] rounded-lg px-4 py-2 text-sm hover:bg-gray-800 transition-colors">
//           All members
//           <ChevronDown className="size-4" />
//         </button>
//       </div>

//       {/* Filter Pills */}
//       <div className="flex items-center gap-2 mb-6">
//         <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border dark:border-[#181818] rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors">
//           <span className="text-gray-500">$</span>
//           Billable status
//         </button>
//         <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border dark:border-[#181818] rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors">
//           <span className="size-2 rounded-full bg-gray-500" />
//           Tag
//         </button>
//         <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border dark:border-[#181818] rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors">
//           <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <circle cx="12" cy="12" r="10" />
//             <polyline points="12,6 12,12 16,14" />
//           </svg>
//           Tracked time
//         </button>
//       </div>

//       {/* Timesheet Grid */}
//       <div className="dark:bg-[#111111] border dark:border-[#222222] rounded-xl overflow-hidden">
//         {/* Table Header */}
//         <div className="grid grid-cols-[500px_100px_repeat(7,1fr)_80px] border-b dark:border-[#222222] bg-[#0f0f0f]">
//           <div className="px-4 py-3 text-sm text-gray-500 font-medium ">
//             People ({members.length})
//           </div>
//           <div className="px-4 py-3 text-sm text-gray-500 dark:text-[#B4B4B4] font-medium border-r dark:border-[#222222]"></div>
//           {weekDays.map((day) => (
//             <div key={day.toISOString()} className=" flex justify-center items-center text-center text-xs text-gray-500 font-medium border-r dark:border-[#222222] last:border-r-0">
//               <div className="text-gray-600 dark:text-[#B4B4B4]">{format(day, 'EEE')}</div> {','}
//               <div className="text-gray-600 dark:text-[#B4B4B4]">{format(day, 'MMM d')}</div>
//             </div>
//           ))}
//           <div className="px-2 py-3 text-center text-xs text-gray-500 font-medium">
//             Total
//           </div>
//         </div>

//         {/* Table Body */}
//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <div className="size-8 border-4 border-gray-700 border-t-blue-600 rounded-full animate-spin" />
//           </div>
//         ) : members.length === 0 ? (
//           <div className="py-12 text-center text-gray-500 text-sm">
//             No team members found
//           </div>
//         ) : (
//           members.map((member, index) => (
//             <div 
//               key={member.userId} 
//               className={`grid grid-cols-[500px_100px_repeat(7,1fr)_80px] hover:bg-[#1a1a1a] transition-colors ${index !== members.length - 1 ? 'border-b dark:border-[#222222]' : ''}`}
//             >
//               {/* User Info */}
//               <div className="px-4 py-1 flex items-center gap-3 ">
//                 {member.user.image ? (
//                   <img 
//                     src={member.user.image} 
//                     alt={member.user.name}
//                     className="size-8 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-medium">
//                     {member.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
//                   </div>
//                 )}
//                 <div>
//                   <p className="text-sm font-medium text-gray-200">{member.user.name}</p>
//                   <p className="text-xs text-gray-500">{formatHours(member.totalHours)}</p>
//                 </div>
//               </div>

//               {/* Open Button */}
//               <div className="px-4 py-1 flex items-center border-r dark:border-[#222222]">
//                 <button type="button" className="flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-[#B4B4B4] hover:text-gray-200 bg-[#222] rounded-md px-2 py-1 transition-colors">
//                   Open
//                   <ArrowRight className="size-3" />
//                 </button>
//               </div>

//               {weekDays.map((day, idx) => {
//                 const entry = getDayEntry(member.userId, idx);
//                 const totalMinutes = entry?.totalMinutes || 0;
//                 const billableMinutes = entry?.billableMinutes || 0;
//                 const nonBillableMinutes = entry?.nonBillableMinutes || (totalMinutes - billableMinutes) || 0;
//                 const capacityMinutes = 480; // 8 hours
//                 const hasData = totalMinutes > 0;
                
//                 return (
//                   <div 
//                     key={day.toISOString()} 
//                     className="dark:bg-[#090909] p-1.5 border-r border-gray-700 last:border-r-0 dark:border-[#222222]"
//                   >
//                     <HoverCard openDelay={0} closeDelay={100}>
//                       <HoverCardTrigger asChild>
//                         <div className="px-2 py-3 h-full rounded-sm flex  items-center justify-center dark:bg-[#111111]  dark:border-[#222222] last:border-r-0">
//                           <div className={`text-sm ${hasData ? 'text-gray-200' : 'text-gray-600 dark:text-[#EEE]'}`}>
//                             {Math.floor(totalMinutes / 60)}h
//                           </div>
//                         </div>
//                       </HoverCardTrigger>
//                       <HoverCardContent 
//                         className="w-72 bg-[#1a1a1a] border border-gray-700 dark:border-[#222222] p-0 shadow-xl rounded-lg overflow-hidden"
//                         side="bottom" 
//                         align="center"
//                         sideOffset={5}
//                       >
//                         {/* Header */}
//                         <div className="px-4 py-3 border-b border-gray-800 dark:border-[#222222] flex items-center justify-between">
//                           <div>
//                             <p className="text-sm font-medium text-gray-200">
//                               {format(day, 'EEE, MMM d')}
//                             </p>
//                             <p className="text-xs text-gray-500 mt-0.5">Total capacity</p>
//                           </div>
//                           <div className="bg-[#2a2a2a] px-2 py-1 rounded text-xs font-medium text-gray-300">
//                             {formatDuration(capacityMinutes)}
//                           </div>
//                         </div>

//                         {/* Stats */}
//                         <div className="p-4 space-y-3">
//                           {/* Tracked Time */}
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <div className="w-1 h-4 bg-blue-500 rounded-full" />
//                               <span className="text-sm text-gray-300">Tracked time</span>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <span className="text-xs text-gray-500 w-8 text-right">
//                                 {calculatePercentage(totalMinutes, capacityMinutes)}
//                               </span>
//                               <span className="text-sm text-gray-200 w-16 text-right">
//                                 {formatDuration(totalMinutes)}
//                               </span>
//                             </div>
//                           </div>

//                           {/* Billable */}
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <div className="w-1 h-4 bg-green-500 rounded-full" />
//                               <span className="text-sm text-gray-300">Billable</span>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <span className="text-xs text-gray-500 w-8 text-right">
//                                 {calculatePercentage(billableMinutes, capacityMinutes)}
//                               </span>
//                               <span className="text-sm text-gray-200 w-16 text-right">
//                                 {formatDuration(billableMinutes)}
//                               </span>
//                             </div>
//                           </div>

//                           {/* Non-billable */}
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <div className="w-1 h-4 bg-gray-500 rounded-full" />
//                               <span className="text-sm text-gray-300">Non-billable</span>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <span className="text-xs text-gray-500 w-8 text-right">
//                                 {calculatePercentage(nonBillableMinutes, capacityMinutes)}
//                               </span>
//                               <span className="text-sm text-gray-200 w-16 text-right">
//                                 {formatDuration(nonBillableMinutes)}
//                               </span>
//                             </div>
//                           </div>

//                           {/* Divider */}
//                           <div className="border-t border-gray-800 dark:border-[#222222] pt-3 mt-3">
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center gap-2">
//                                 <div className="w-1 h-4 bg-gray-400 rounded-full" />
//                                 <span className="text-sm text-gray-300">Remaining capacity</span>
//                               </div>
//                               <div className="flex items-center gap-3">
//                                 <span className="text-xs text-gray-500 w-8 text-right">
//                                   {calculatePercentage(Math.max(0, capacityMinutes - totalMinutes), capacityMinutes)}
//                                 </span>
//                                 <span className="text-sm text-gray-200 w-16 text-right">
//                                   {formatDuration(Math.max(0, capacityMinutes - totalMinutes))}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Footer */}
//                         <div className="px-4 py-2.5 bg-[#141414] border-t border-gray-800 dark:border-[#222222] flex items-center gap-2 text-xs text-gray-500">
//                           <Globe className="w-3.5 h-3.5" />
//                           <span>Logged in timezone: IST (UTC+5:30)</span>
//                         </div>
//                       </HoverCardContent>
//                     </HoverCard>
//                   </div>
//                 );
//               })}

//               {/* Total */}
//               <div className="px-2 py-3 flex items-center justify-center">
//                 <div className="text-sm text-gray-400">
//                   {formatHours(member.totalHours)}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }


// components/time-tracking/TeamTimesheet.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Users, ChevronLeft, ChevronRight, ChevronDown, Clock, DollarSign, X, CheckCircle, XCircle, Play, Tag } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  isToday,
} from 'date-fns';
import { ArrowRight } from '../animate-ui/icons/arrow-right';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/animate-ui/components/radix/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '../ui/button';

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  totalHours: number;
  billableHours: number;
  pendingApprovals: number;
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
  nonBillableMinutes?: number;
}

interface MemberTimesheetData {
  entries: DayData[];
  weekTotal?: {
    total: number;
    billable: number;
  };
  user?: {
    name: string;
    email: string;
    image: string | null;
  };
}

export function TeamTimesheet() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [entriesMap, setEntriesMap] = useState<Record<string, TimeEntry[]>>({});

  // Member filter dropdown state
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Open modal state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [modalMember, setModalMember] = useState<TeamMember | null>(null);
  const [modalTimesheet, setModalTimesheet] = useState<MemberTimesheetData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalViewMode, setModalViewMode] = useState<'grid' | 'list'>('grid');

  // Approval state inside modal
  const [approvalModal, setApprovalModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });

  useEffect(() => {
    fetchTeamData();
  }, [currentWeek]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMemberDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/time-tracking/team?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`
      );
      const data = await res.json();
      setMembers(data.members || []);

      // Fetch entries for each member
      const entriesPromises = data.members.map(async (member: TeamMember) => {
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 6);

        const entriesRes = await fetch(
          `/api/time-tracking/timesheet?userId=${member.userId}&startDate=${weekStart.toISOString()}&endDate=${end.toISOString()}`
        );
        const entriesData = await entriesRes.json();
        return { userId: member.userId, entries: entriesData.entries || [] };
      });

      const allEntries = await Promise.all(entriesPromises);
      const entriesRecord: Record<string, TimeEntry[]> = {};
      allEntries.forEach(({ userId, entries }) => {
        entriesRecord[userId] = entries;
      });
      setEntriesMap(entriesRecord);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));

  const formatHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const calculatePercentage = (part: number, total: number): string => {
    if (total === 0) return '0%';
    return `${Math.round((part / total) * 100)}%`;
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getDayEntry = (userId: string, dayIndex: number): TimeEntry | undefined => {
    const userEntries = entriesMap[userId] || [];
    const targetDate = format(weekDays[dayIndex], 'yyyy-MM-dd');
    return userEntries.find(
      (entry) => entry.date === targetDate || entry.date.startsWith(targetDate)
    );
  };

  // Filtered members based on dropdown selection
  const filteredMembers = selectedMemberFilter
    ? members.filter((m) => m.userId === selectedMemberFilter)
    : members;

  // ---- Open Modal Logic ----
  const openMemberTimesheet = async (member: TeamMember) => {
    setModalMember(member);
    setShowMemberModal(true);
    setModalLoading(true);
    setModalViewMode('grid');

    try {
      const end = new Date(weekStart);
      end.setDate(end.getDate() + 6);

      const res = await fetch(
        `/api/time-tracking/timesheet?userId=${member.userId}&startDate=${weekStart.toISOString()}&endDate=${end.toISOString()}&view=week`
      );
      const data = await res.json();
      setModalTimesheet(data);
    } catch (error) {
      console.error('Failed to fetch member timesheet:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const closeMemberModal = () => {
    setShowMemberModal(false);
    setModalMember(null);
    setModalTimesheet(null);
    setSelectedEntry(null);
    setApprovalModal(false);
  };

  // ---- Approval Logic ----
  const handleApprove = async (entryId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/time-tracking/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, status }),
      });

      if (res.ok) {
        // Refresh modal data
        if (modalMember) {
          await openMemberTimesheet(modalMember);
        }
        // Also refresh the main table
        fetchTeamData();
        setApprovalModal(false);
        setSelectedEntry(null);
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  // ---- Modal: Task Rows for Grid ----
  const getModalTaskRows = () => {
    if (!modalTimesheet?.entries) return [];

    const taskMap = new Map();
    modalTimesheet.entries.forEach((day) => {
      day.entries.forEach((entry) => {
        const taskId = entry.task?.id || 'no-task';
        if (!taskMap.has(taskId)) {
          taskMap.set(taskId, {
            task: entry.task,
            entries: {},
            totalMinutes: 0,
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

  const modalDays = modalTimesheet?.entries?.map((d) => new Date(d.date)) || [];
  const modalTaskRows = getModalTaskRows();

  // Count pending entries in modal
  const pendingEntriesCount = modalTimesheet?.entries?.reduce(
    (acc, day) => acc + day.entries.filter((e) => e.billableStatus === 'PENDING' && e.entryType === 'MANUAL').length,
    0
  ) || 0;

  return (
    <div className="min-h-screen dark:bg-[#0a0a0a] text-gray-200 py-4">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1 border dark:border-[#181818]">
            <button
              type="button"
              onClick={prevWeek}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronLeft className="size-4 text-gray-400" />
            </button>
            <span className="text-sm font-medium px-2">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
            </span>
            <button
              type="button"
              onClick={nextWeek}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronRight className="size-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Member Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowMemberDropdown(!showMemberDropdown)}
            className="flex items-center gap-2 bg-[#1a1a1a] border dark:border-[#181818] rounded-lg px-4 py-2 text-sm hover:bg-gray-800 transition-colors min-w-[180px] justify-between"
          >
            <span className="flex items-center gap-2">
              {selectedMemberFilter ? (
                <>
                  {(() => {
                    const m = members.find((mem) => mem.userId === selectedMemberFilter);
                    return m ? (
                      <>
                        {m.user.image ? (
                          <img
                            src={m.user.image}
                            alt={m.user.name}
                            className="size-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="size-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-medium">
                            {m.user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </div>
                        )}
                        <span className="dark:text-[#EAEAEA] text-[#474747]">{m.user.name}</span>
                      </>
                    ) : (
                      'All members'
                    );
                  })()}
                </>
              ) : (
                <span className="dark:text-[#B4B4B4] text-[#474747]">All members</span>
              )}
            </span>
            <ChevronDown
              className={`size-4 text-gray-400 transition-transform ${showMemberDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {showMemberDropdown && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-[#1a1a1a] border dark:border-[#2A2A2A] border-[#E8E8E8] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-1.5">
                {/* All Members Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMemberFilter(null);
                    setShowMemberDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    !selectedMemberFilter
                      ? 'dark:bg-[#2A2A2A] bg-[#F3F3F3] dark:text-white text-[#202020]'
                      : 'dark:text-gray-300 text-[#474747] hover:dark:bg-[#222] hover:bg-[#F3F3F3]'
                  }`}
                >
                  <div className="size-7 rounded-full dark:bg-[#222] bg-[#EAEAEA] flex items-center justify-center">
                    <Users className="size-3.5 text-gray-400" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">All members</div>
                    <div className="text-xs text-gray-500">{members.length} people</div>
                  </div>
                  {!selectedMemberFilter && (
                    <CheckCircle className="size-4 text-blue-500" />
                  )}
                </button>

                <div className="my-1.5 border-t dark:border-[#2A2A2A] border-[#E8E8E8]" />

                {/* Individual Members */}
                <div className="max-h-64 overflow-y-auto thin-scrollbar">
                  {members.map((member) => (
                    <button
                      key={member.userId}
                      type="button"
                      onClick={() => {
                        setSelectedMemberFilter(member.userId);
                        setShowMemberDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        selectedMemberFilter === member.userId
                          ? 'dark:bg-[#2A2A2A] bg-[#F3F3F3] dark:text-white text-[#202020]'
                          : 'dark:text-gray-300 text-[#474747] hover:dark:bg-[#222] hover:bg-[#F3F3F3]'
                      }`}
                    >
                      {member.user.image ? (
                        <img
                          src={member.user.image}
                          alt={member.user.name}
                          className="size-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-medium">
                          {member.user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-medium truncate">{member.user.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatDuration(member.totalHours)} this week
                        </div>
                      </div>
                      {member.pendingApprovals > 0 && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-medium rounded-full whitespace-nowrap">
                          <span className="size-1 rounded-full bg-yellow-500" />
                          {member.pendingApprovals}
                        </span>
                      )}
                      {selectedMemberFilter === member.userId && (
                        <CheckCircle className="size-4 text-blue-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border dark:border-[#181818] rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors"
        >
          <span className="text-gray-500">$</span>
          Billable status
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border dark:border-[#181818] rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors"
        >
          <span className="size-2 rounded-full bg-gray-500" />
          Tag
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border dark:border-[#181818] rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          Tracked time
        </button>
      </div>

      {/* Timesheet Grid */}
      <div className="dark:bg-[#111111] border dark:border-[#222222] rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[500px_100px_repeat(7,1fr)_80px] border-b dark:border-[#222222] bg-[#0f0f0f]">
          <div className="px-4 py-3 text-sm text-gray-500 font-medium">
            People ({filteredMembers.length})
          </div>
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-[#B4B4B4] font-medium border-r dark:border-[#222222]" />
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="flex justify-center items-center text-center text-xs text-gray-500 font-medium border-r dark:border-[#222222] last:border-r-0"
            >
              <div className="text-gray-600 dark:text-[#B4B4B4]">{format(day, 'EEE')}</div>
              {','}
              <div className="text-gray-600 dark:text-[#B4B4B4]">{format(day, 'MMM d')}</div>
            </div>
          ))}
          <div className="px-2 py-3 text-center text-xs text-gray-500 font-medium">Total</div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-8 border-4 border-gray-700 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No team members found</div>
        ) : (
          filteredMembers.map((member, index) => (
            <div
              key={member.userId}
              className={`grid grid-cols-[500px_100px_repeat(7,1fr)_80px] hover:bg-[#1a1a1a] transition-colors ${
                index !== filteredMembers.length - 1 ? 'border-b dark:border-[#222222]' : ''
              }`}
            >
              {/* User Info */}
              <div className="px-4 py-1 flex items-center gap-3">
                {member.user.image ? (
                  <img
                    src={member.user.image}
                    alt={member.user.name}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-medium">
                    {member.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-200">{member.user.name}</p>
                  <p className="text-xs text-gray-500">{formatDuration(member.totalHours)}</p>
                </div>
                {member.pendingApprovals > 0 && (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[11px] font-medium rounded-full">
                    <span className="size-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    {member.pendingApprovals} pending
                  </span>
                )}
              </div>

              {/* Open Button */}
              <div className="px-4 py-1 flex items-center border-r dark:border-[#222222]">
                <button
                  type="button"
                  onClick={() => openMemberTimesheet(member)}
                  className="flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-[#B4B4B4] hover:text-gray-200 bg-[#222] hover:bg-[#333] rounded-md px-2 py-1 transition-colors"
                >
                  Open
                  <ArrowRight className="size-3" />
                </button>
              </div>

              {/* Daily Hours */}
              {weekDays.map((day, idx) => {
                const entry = getDayEntry(member.userId, idx);
                const totalMinutes = entry?.totalMinutes || 0;
                const billableMinutes = entry?.billableMinutes || 0;
                const nonBillableMinutes =
                  entry?.nonBillableMinutes || totalMinutes - billableMinutes || 0;
                const capacityMinutes = 480;
                const hasData = totalMinutes > 0;

                return (
                  <div
                    key={day.toISOString()}
                    className="dark:bg-[#090909] p-1.5 border-r border-gray-700 last:border-r-0 dark:border-[#222222]"
                  >
                    <HoverCard openDelay={0} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <div className="px-2 py-3 h-full rounded-sm flex items-center justify-center dark:bg-[#111111] dark:border-[#222222] last:border-r-0 cursor-pointer">
                          <div
                            className={`text-sm ${hasData ? 'text-gray-200' : 'text-gray-600 dark:text-[#EEE]'}`}
                          >
                            {Math.floor(totalMinutes / 60)}h
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="w-72 bg-[#1a1a1a] border border-gray-700 dark:border-[#222222] p-0 shadow-xl rounded-lg overflow-hidden"
                        side="bottom"
                        align="center"
                        sideOffset={5}
                      >
                        <div className="px-4 py-3 border-b border-gray-800 dark:border-[#222222] flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-200">
                              {format(day, 'EEE, MMM d')}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">Total capacity</p>
                          </div>
                          <div className="bg-[#2a2a2a] px-2 py-1 rounded text-xs font-medium text-gray-300">
                            {formatDuration(capacityMinutes)}
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-4 bg-blue-500 rounded-full" />
                              <span className="text-sm text-gray-300">Tracked time</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 w-8 text-right">
                                {calculatePercentage(totalMinutes, capacityMinutes)}
                              </span>
                              <span className="text-sm text-gray-200 w-16 text-right">
                                {formatDuration(totalMinutes)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-4 bg-green-500 rounded-full" />
                              <span className="text-sm text-gray-300">Billable</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 w-8 text-right">
                                {calculatePercentage(billableMinutes, capacityMinutes)}
                              </span>
                              <span className="text-sm text-gray-200 w-16 text-right">
                                {formatDuration(billableMinutes)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-4 bg-gray-500 rounded-full" />
                              <span className="text-sm text-gray-300">Non-billable</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 w-8 text-right">
                                {calculatePercentage(nonBillableMinutes, capacityMinutes)}
                              </span>
                              <span className="text-sm text-gray-200 w-16 text-right">
                                {formatDuration(nonBillableMinutes)}
                              </span>
                            </div>
                          </div>
                          <div className="border-t border-gray-800 dark:border-[#222222] pt-3 mt-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-gray-400 rounded-full" />
                                <span className="text-sm text-gray-300">Remaining capacity</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-8 text-right">
                                  {calculatePercentage(
                                    Math.max(0, capacityMinutes - totalMinutes),
                                    capacityMinutes
                                  )}
                                </span>
                                <span className="text-sm text-gray-200 w-16 text-right">
                                  {formatDuration(Math.max(0, capacityMinutes - totalMinutes))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-2.5 bg-[#141414] border-t border-gray-800 dark:border-[#222222] flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Logged in timezone: IST (UTC+5:30)</span>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                );
              })}

              {/* Total */}
              <div className="px-2 py-3 flex items-center justify-center">
                <div className="text-sm text-gray-400">{formatHours(member.totalHours)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ==================== MEMBER TIMESHEET MODAL ==================== */}
      {showMemberModal && modalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111111] border dark:border-[#2A2A2A] border-[#E8E8E8] rounded-2xl shadow-2xl w-[95vw] max-w-[1200px] max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-[#2A2A2A] border-[#F3F3F3] dark:bg-[#0f0f0f] bg-[#f4f2f2] flex-shrink-0">
              <div className="flex items-center gap-4">
                {modalMember.user.image ? (
                  <img
                    src={modalMember.user.image}
                    alt={modalMember.user.name}
                    className="size-9 rounded-full object-cover ring-2 ring-[#2A2A2A]"
                  />
                ) : (
                  <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-medium ring-2 ring-[#2A2A2A]">
                    {modalMember.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold dark:text-white text-[#202020]">
                    {modalMember.user.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Pending Approvals Badge */}
                {pendingEntriesCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      // Find first pending entry
                      const firstPending = modalTimesheet?.entries
                        ?.flatMap((d) => d.entries)
                        .find((e) => e.billableStatus === 'PENDING' && e.entryType === 'MANUAL');
                      if (firstPending) {
                        setSelectedEntry(firstPending);
                        setApprovalModal(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-sm font-medium rounded-lg hover:bg-yellow-500/25 transition-colors"
                  >
                    <span className="size-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    {pendingEntriesCount} pending approval
                  </button>
                )}

                {/* Grid / List Toggle */}
                <div className="flex items-center dark:bg-[#1A1A1A] bg-[#EAEAEA] border dark:border-[#222] border-[#E8E8E8] rounded-lg p-[1px]">
                  <button
                    type="button"
                    onClick={() => setModalViewMode('grid')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      modalViewMode === 'grid'
                        ? 'dark:bg-[#111] bg-[#fff] dark:text-[#EAEAEA] text-[#474747] border dark:border-[#2A2A2A] border-[#dcdcdc]'
                        : 'text-[#B4B4B4] hover:text-white'
                    }`}
                  >
                    Timesheet
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalViewMode('list')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      modalViewMode === 'list'
                        ? 'dark:bg-[#111] bg-[#fff] dark:text-[#EAEAEA] text-[#474747] border dark:border-[#2A2A2A] border-[#dcdcdc]'
                        : 'text-[#B4B4B4] hover:text-white'
                    }`}
                  >
                    Time entries
                  </button>
                </div>

                {/* Summary */}
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-4 text-gray-500" />
                    <span className="text-gray-400">Total:</span>
                    <span className="font-semibold text-white">
                      {formatDuration(modalTimesheet?.weekTotal?.total || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="size-4 text-green-500" />
                    <span className="text-gray-400">Billable:</span>
                    <span className="font-semibold text-green-400">
                      {formatDuration(modalTimesheet?.weekTotal?.billable || 0)}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={closeMemberModal}
                  className="p-2 hover:dark:bg-[#2A2A2A] hover:bg-[#E8E8E8] rounded-lg transition-colors"
                >
                  <X className="size-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto thin-scrollbar p-6">
              {modalLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="size-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : modalViewMode === 'grid' ? (
                /* ===== GRID VIEW IN MODAL ===== */
                <div className="dark:bg-[#111111] bg-[#fff] rounded-xl border dark:border-[#2A2A2A] border-[#E8E8E8] overflow-hidden overflow-x-auto thin-scrollbar">
                  {/* Grid Header */}
                  <div
                    className="grid border-b dark:border-[#2A2A2A] border-[#F3F3F3]"
                    style={{
                      gridTemplateColumns: `minmax(300px, 1fr) repeat(${modalDays.length}, minmax(90px, 1fr)) 130px`,
                    }}
                  >
                    <div className="px-4 py-2 text-sm font-medium text-gray-400 border-r dark:border-[#2A2A2A] border-[#F3F3F3]">
                      Task / Location
                    </div>
                    {modalDays.map((day, idx) => (
                      <div
                        key={day.toISOString()}
                        className={`px-2 rounded-t-sm py-1.5 text-start text-sm border-r border-[#F3F3F3] dark:border-[#2A2A2A] ${
                          isToday(day) ? 'border-t-[3px] border-t-blue-500' : ''
                        }`}
                      >
                        <div className="flex gap-1">
                          <div className="text-xs text-[#7B7B7B]">{format(day, 'EE')},</div>
                          <div className="text-xs text-[#7B7B7B]">{format(day, 'MMM d')}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDuration(modalTimesheet?.entries[idx]?.totalMinutes || 0)}
                        </div>
                      </div>
                    ))}
                    <div className="px-4 py-3 dark:bg-[#222222] text-sm font-medium text-gray-400 text-center">
                      Total
                    </div>
                  </div>

                  {/* Grid Body */}
                  <div className="divide-y dark:divide-[#2A2A2A] divide-[#F3F3F3]">
                    {modalTaskRows.length === 0 ? (
                      <div className="px-4 py-12 text-center text-gray-500">
                        No time entries for this period
                      </div>
                    ) : (
                      modalTaskRows.map((row, rowIdx) => (
                        <div
                          key={row.task?.id || `no-task-${rowIdx}`}
                          className="grid transition-colors"
                          style={{
                            gridTemplateColumns: `minmax(300px, 1fr) repeat(${modalDays.length}, minmax(90px, 1fr)) 130px`,
                          }}
                        >
                          {/* Task Info */}
                          <div className="px-4 py-2 border-r border-[#F3F3F3] dark:border-[#2A2A2A]">
                            <div className="flex items-center gap-3">
                              <div className="size-6 flex items-center justify-center rounded-full dark:bg-[#2A2A2A] bg-[#F3F3F3]">
                                <Play className="size-3 text-gray-400 ml-0.5" />
                              </div>
                              <div>
                                <div className="font-medium text-[#202020] dark:text-gray-200 text-sm">
                                  {row.task?.title || 'No task selected'}
                                </div>
                                {row.task && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <span className="size-1.5 rounded-full bg-blue-500" />
                                    {row.task.column.board.title}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Day Cells */}
                          {modalDays.map((day) => {
                            const dayStr = day.toISOString().split('T')[0];
                            const dayEntries = row.entries[dayStr] || [];
                            const dayTotal = dayEntries.reduce((sum, e) => sum + e.duration, 0);
                            const hasPending = dayEntries.some(
                              (e) => e.billableStatus === 'PENDING' && e.entryType === 'MANUAL'
                            );

                            return (
                              <div
                                key={day.toISOString()}
                                className={`px-2 py-3 border-r border-[#F3F3F3] dark:bg-[#090909] bg-[#F9F9F9] hover:dark:bg-[#2A2A2A]/50 text-center cursor-pointer relative ${
                                  hasPending ? 'ring-1 ring-inset ring-yellow-500/40' : ''
                                }`}
                              >
                                {dayTotal > 0 ? (
                                  <div
                                    className="text-sm text-gray-300"
                                    onClick={() => {
                                      if (hasPending) {
                                        const pendingEntry = dayEntries.find(
                                          (e) =>
                                            e.billableStatus === 'PENDING' && e.entryType === 'MANUAL'
                                        );
                                        if (pendingEntry) {
                                          setSelectedEntry(pendingEntry);
                                          setApprovalModal(true);
                                        }
                                      }
                                    }}
                                  >
                                    {formatDuration(dayTotal)}
                                    {hasPending && (
                                      <div className="mt-1">
                                        <span className="size-1.5 inline-block rounded-full bg-yellow-500 animate-pulse" />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-600">_</span>
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
                </div>
              ) : (
                /* ===== LIST VIEW IN MODAL ===== */
                <div className="space-y-4">
                  {modalTimesheet?.entries?.map((day) => {
                    const date = new Date(day.date);

                    return (
                      <div
                        key={day.date}
                        className="dark:bg-[#111111] bg-[#fff] rounded-xl border dark:border-[#2A2A2A] border-[#F3F3F3] overflow-hidden"
                      >
                        {/* Day Header */}
                        <div className="px-4 py-3 dark:bg-[#191919] bg-[#f4f2f2] border-b dark:border-[#2A2A2A] border-[#F3F3F3] flex items-center justify-between">
                          <div className="flex items-center gap-3">
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
                            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-[#F3F3F3] dark:border-[#2A2A2A]">
                              <div className="col-span-2">Task</div>
                              <div className="col-span-3">Description</div>
                              <div className="col-span-1 text-center">Billable</div>
                              <div className="col-span-2">Tags</div>
                              <div className="col-span-1">Start</div>
                              <div className="col-span-1">End</div>
                              <div className="col-span-1 text-right">Tracked</div>
                              <div className="col-span-1" />
                            </div>

                            <div className="divide-y dark:divide-[#2A2A2A] divide-[#F3F3F3]">
                              {day.entries.map((entry) => {
                                const isPending =
                                  entry.billableStatus === 'PENDING' && entry.entryType === 'MANUAL';
                                return (
                                  <div
                                    key={entry.id}
                                    className={`grid grid-cols-12 gap-4 px-4 py-3 items-center hover:dark:bg-[#2A2A2A]/30 hover:bg-[#F3F3F3]/30 transition-colors group ${
                                      isPending ? 'bg-yellow-500/5' : ''
                                    }`}
                                  >
                                    <div className="col-span-2 flex items-center gap-2">
                                      <div className="text-sm font-medium text-gray-200">
                                        {entry.task?.title || 'No task selected'}
                                      </div>
                                    </div>
                                    <div className="col-span-3 text-sm text-gray-400 truncate">
                                      {entry.description || '—'}
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                      {entry.isBillable ? (
                                        <div className="size-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                          <DollarSign className="w-3.5 h-3.5 text-green-500" />
                                        </div>
                                      ) : (
                                        <div className="size-6 rounded-full dark:bg-[#2A2A2A] bg-[#F3F3F3] flex items-center justify-center">
                                          <DollarSign className="w-3.5 h-3.5 text-gray-600" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="col-span-2 flex flex-wrap gap-1">
                                      {entry.tags?.map((tag) => (
                                        <span
                                          key={tag}
                                          className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      {!entry.tags?.length && <span className="text-gray-600">—</span>}
                                    </div>
                                    <div className="col-span-1 text-sm text-gray-400">
                                      {format(new Date(entry.startTime), 'h:mm a')}
                                    </div>
                                    <div className="col-span-1 text-sm text-gray-400">
                                      {entry.endTime ? format(new Date(entry.endTime), 'h:mm a') : '—'}
                                    </div>
                                    <div className="col-span-1 text-right text-sm font-medium text-gray-300">
                                      {formatDuration(entry.duration)}
                                    </div>
                                    <div className="col-span-1 flex items-center justify-end gap-1">
                                      {/* Status Badge */}
                                      {entry.billableStatus === 'APPROVED' && (
                                        <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded-full">
                                          <CheckCircle className="size-3" />
                                        </span>
                                      )}
                                      {entry.billableStatus === 'REJECTED' && (
                                        <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded-full">
                                          <XCircle className="size-3" />
                                        </span>
                                      )}
                                      {isPending && (
                                        <>
                                          <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-500/15 px-1.5 py-0.5 rounded-full">
                                            <span className="size-1.5 rounded-full bg-yellow-500" />
                                            Pending
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedEntry(entry);
                                              setApprovalModal(true);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:dark:bg-[#2A2A2A] hover:bg-[#E8E8E8] rounded-lg transition-all"
                                            title="Review entry"
                                          >
                                            <svg
                                              className="size-4 text-gray-400"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                            >
                                              <circle cx="12" cy="12" r="1" />
                                              <circle cx="12" cy="5" r="1" />
                                              <circle cx="12" cy="19" r="1" />
                                            </svg>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            No entries for this day
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ===== APPROVAL MODAL (nested inside member modal) ===== */}
          {approvalModal && selectedEntry && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Review Time Entry</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalModal(false);
                      setSelectedEntry(null);
                    }}
                    className="p-1.5 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                  >
                    <X className="size-4 text-gray-400" />
                  </button>
                </div>

                <div className="bg-[#111] rounded-lg p-4 mb-4 border border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-2">
                    {modalMember?.user.image ? (
                      <img
                        src={modalMember.user.image}
                        alt={modalMember.user.name}
                        className="size-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-medium">
                        {modalMember?.user.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                    )}
                    <p className="text-sm text-gray-400">{modalMember?.user.name}</p>
                  </div>
                  <p className="font-medium text-gray-200">
                    {selectedEntry.task?.title || selectedEntry.description || 'Untitled entry'}
                  </p>
                  {selectedEntry.description && selectedEntry.task?.title && (
                    <p className="text-sm text-gray-500 mt-1">{selectedEntry.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{formatDuration(selectedEntry.duration)}</span>
                    <span>•</span>
                    <span>{format(new Date(selectedEntry.startTime), 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span>
                      {format(new Date(selectedEntry.startTime), 'h:mm a')}
                      {selectedEntry.endTime && ` - ${format(new Date(selectedEntry.endTime), 'h:mm a')}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {selectedEntry.isBillable && (
                      <span className="px-2 py-0.5 text-[11px] bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                        <DollarSign className="size-3" /> Billable
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-[11px] bg-blue-500/20 text-blue-400 rounded-full">
                      {selectedEntry.entryType}
                    </span>
                    {selectedEntry.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[11px] bg-purple-500/20 text-purple-400 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedEntry.id, 'REJECTED')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/25 transition-colors"
                  >
                    <XCircle className="size-4" />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedEntry.id, 'APPROVED')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="size-4" />
                    Approve
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setApprovalModal(false);
                    setSelectedEntry(null);
                  }}
                  className="w-full mt-2 px-4 py-2 text-gray-400 hover:bg-[#2A2A2A] rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}