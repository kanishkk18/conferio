// components/time-tracking/TeamTimesheet.tsx
import { Clock, Globe } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/animate-ui/components/radix/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  date: string;
  totalMinutes: number;
  billableMinutes: number;
  nonBillableMinutes?: number;
}

export function TeamTimesheetNew() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [entriesMap, setEntriesMap] = useState<Record<string, TimeEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });

  useEffect(() => {
    fetchTeamData();
  }, [currentWeek]);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/time-tracking/team?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`);
      const data = await res.json();
      setMembers(data.members || []);
      
      // Fetch entries for each member
      const entriesPromises = data.members.map(async (member: TeamMember) => {
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 6);
        
        const entriesRes = await fetch(`/api/time-tracking/timesheet?userId=${member.userId}&startDate=${weekStart.toISOString()}&endDate=${end.toISOString()}`);
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
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
  };

  const calculatePercentage = (part: number, total: number): string => {
    if (total === 0) return '0%';
    return `${Math.round((part / total) * 100)}%`;
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Get entry for specific day
  const getDayEntry = (userId: string, dayIndex: number): TimeEntry | undefined => {
    const userEntries = entriesMap[userId] || [];
    const targetDate = format(weekDays[dayIndex], 'yyyy-MM-dd');
    return userEntries.find(entry => entry.date === targetDate || entry.date.startsWith(targetDate));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1 border border-gray-800">
            <button type="button" 
              onClick={prevWeek}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronLeft className="size-4 text-gray-400" />
            </button>
            <span className="text-sm font-medium px-2">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
            </span>
            <button type="button" 
              onClick={nextWeek}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronRight className="size-4 text-gray-400" />
            </button>
          </div>
          
          <button type="button" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200">
            <ChevronDown className="size-4" />
          </button>
        </div>

        <button type="button" className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2 text-sm hover:bg-gray-800 transition-colors">
          All members
          <ChevronDown className="size-4" />
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-6">
        <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors">
          <span className="text-gray-500">$</span>
          Billable status
        </button>
        <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors">
          <span className="size-2 rounded-full bg-gray-500" />
          Tag
        </button>
        <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors">
          <Clock className="w-3.5 h-3.5" />
          Tracked time
        </button>
      </div>

      {/* Timesheet Grid */}
      <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[280px_90px_repeat(7,1fr)_70px] border-b border-gray-800 bg-[#0f0f0f]">
          <div className="px-4 py-3 text-sm text-gray-500 font-medium border-r border-gray-800">
            People ({members.length})
          </div>
          <div className="px-4 py-3 text-sm text-gray-500 font-medium border-r border-gray-800"></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="px-2 py-3 text-center text-xs text-gray-500 font-medium border-r border-gray-800 last:border-r-0">
              <div>{format(day, 'EEE')}, {format(day, 'MMM d')}</div>
            </div>
          ))}
          <div className="px-2 py-3 text-center text-xs text-gray-500 font-medium">
            Total
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-8 border-4 border-gray-700 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No team members found
          </div>
        ) : (
          members.map((member, index) => (
            <div 
              key={member.userId} 
              className={`grid grid-cols-[280px_90px_repeat(7,1fr)_70px] hover:bg-[#1a1a1a] transition-colors ${index !== members.length - 1 ? 'border-b border-gray-800' : ''}`}
            >
              {/* User Info */}
              <div className="px-4 py-3 flex items-center gap-3 border-r border-gray-800">
                {member.user.image ? (
                  <img 
                    src={member.user.image} 
                    alt={member.user.name}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-medium">
                    {member.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-200">{member.user.name}</p>
                  <p className="text-xs text-gray-500">{formatHours(member.totalHours)}</p>
                </div>
              </div>

              {/* Open Button */}
              <div className="px-4 py-3 flex items-center border-r border-gray-800">
                <button type="button" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 transition-colors">
                  Open
                  <ChevronRight className="size-3" />
                </button>
              </div>

              {/* Daily Hours with Hover Card */}
              {weekDays.map((day) => {
                const entry = getDayEntry(member.userId, day.toISOString());
                const totalMinutes = entry?.totalMinutes || 0;
                const billableMinutes = entry?.billableMinutes || 0;
                const nonBillableMinutes = entry?.nonBillableMinutes || (totalMinutes - billableMinutes) || 0;
                const capacityMinutes = 480; // 8 hours
                const hasData = totalMinutes > 0;
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className="border-r border-gray-800 last:border-r-0"
                  >
                    <HoverCard openDelay={0} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <div className="px-2 py-3 flex items-center justify-center cursor-pointer hover:bg-[#222] transition-colors h-full">
                          <div className={`text-sm ${hasData ? 'text-gray-200' : 'text-gray-600'}`}>
                            {Math.floor(totalMinutes / 60)}h
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent 
                        className="w-72 bg-[#1a1a1a] border border-gray-700 p-0 shadow-xl rounded-lg overflow-hidden"
                        side="bottom" 
                        align="center"
                        sideOffset={5}
                      >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
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

                        {/* Stats */}
                        <div className="p-4 space-y-3">
                          {/* Tracked Time */}
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

                          {/* Billable */}
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

                          {/* Non-billable */}
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

                          {/* Divider */}
                          <div className="border-t border-gray-800 pt-3 mt-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-gray-400 rounded-full" />
                                <span className="text-sm text-gray-300">Remaining capacity</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-8 text-right">
                                  {calculatePercentage(Math.max(0, capacityMinutes - totalMinutes), capacityMinutes)}
                                </span>
                                <span className="text-sm text-gray-200 w-16 text-right">
                                  {formatDuration(Math.max(0, capacityMinutes - totalMinutes))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2.5 bg-[#141414] border-t border-gray-800 flex items-center gap-2 text-xs text-gray-500">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Logged in timezone: IST (UTC+5:30)</span>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                );
              })}

              {/* Total */}
              <div className="px-2 py-3 flex items-center justify-center">
                <div className="text-sm text-gray-400">
                  {formatHours(member.totalHours)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pending Approval Legend */}
      <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
        <span className="size-2 rounded-full bg-yellow-500" />
        <span>Pending Approval</span>
      </div>
    </div>
  );
}


// components/time-tracking/TeamTimesheet.tsx
import React, { useState, useEffect } from 'react';
import { Users, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { ArrowRight } from '../animate-ui/icons/arrow-right';

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
  totalHours: number; // in minutes
  billableHours: number; // in minutes
  dailyHours: number[]; // array of 7 days in minutes
}

export function TeamTimesheet() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const [entriesMap, setEntriesMap] = useState<Record<string, TimeEntry[]>>({});


  // const fetchTeamData = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`/api/time-tracking/team?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`);
  //     const data = await res.json();
  //     setMembers(data.members || []);
  //   } catch (error) {
  //     console.error('Failed to fetch team data:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchTeamData();
  }, [currentWeek]);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/time-tracking/team?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`);
      const data = await res.json();
      setMembers(data.members || []);
      
      // Fetch entries for each member
      const entriesPromises = data.members.map(async (member: TeamMember) => {
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 6);
        
        const entriesRes = await fetch(`/api/time-tracking/timesheet?userId=${member.userId}&startDate=${weekStart.toISOString()}&endDate=${end.toISOString()}`);
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
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
  };

  const calculatePercentage = (part: number, total: number): string => {
    if (total === 0) return '0%';
    return `${Math.round((part / total) * 100)}%`;
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Get entry for specific day
  const getDayEntry = (userId: string, dayIndex: number): TimeEntry | undefined => {
    const userEntries = entriesMap[userId] || [];
    const targetDate = format(weekDays[dayIndex], 'yyyy-MM-dd');
    return userEntries.find(entry => entry.date === targetDate || entry.date.startsWith(targetDate));
  };

  return (
    <div className="min-h-screen dark:bg-[#0a0a0a] text-gray-200 py-4">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1 border dark:border-[#181818]">
            <button type="button" 
              onClick={prevWeek}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronLeft className="size-4 text-gray-400" />
            </button>
            <span className="text-sm font-medium px-2">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
            </span>
            <button type="button" 
              onClick={nextWeek}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronRight className="size-4 text-gray-400" />
            </button>
          </div>
          
          <button type="button" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200">
            <ChevronDown className="size-4" />
          </button>
        </div>

        <button type="button" className="flex items-center gap-2 bg-[#1a1a1a] border dark:border-[#181818] rounded-lg px-4 py-2 text-sm hover:bg-gray-800 transition-colors">
          All members
          <ChevronDown className="size-4" />
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-6">
        <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border dark:border-[#181818] rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors">
          <span className="text-gray-500">$</span>
          Billable status
        </button>
        <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border dark:border-[#181818] rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors">
          <span className="size-2 rounded-full bg-gray-500" />
          Tag
        </button>
        <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border dark:border-[#181818] rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors">
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
          <div className="px-4 py-3 text-sm text-gray-500 font-medium ">
            People ({members.length})
          </div>
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-[#B4B4B4] font-medium border-r dark:border-[#222222]"></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className=" flex justify-center items-center text-center text-xs text-gray-500 font-medium border-r dark:border-[#222222] last:border-r-0">
              <div className="text-gray-600 dark:text-[#B4B4B4]">{format(day, 'EEE')}</div> {','}
              <div className="text-gray-600 dark:text-[#B4B4B4]">{format(day, 'MMM d')}</div>
            </div>
          ))}
          <div className="px-2 py-3 text-center text-xs text-gray-500 font-medium">
            Total
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-8 border-4 border-gray-700 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No team members found
          </div>
        ) : (
          members.map((member, index) => (
            <div 
              key={member.userId} 
              className={`grid grid-cols-[500px_100px_repeat(7,1fr)_80px] hover:bg-[#1a1a1a] transition-colors ${index !== members.length - 1 ? 'border-b dark:border-[#222222]' : ''}`}
            >
              {/* User Info */}
              <div className="px-4 py-1 flex items-center gap-3 ">
                {member.user.image ? (
                  <img 
                    src={member.user.image} 
                    alt={member.user.name}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-medium">
                    {member.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-200">{member.user.name}</p>
                  <p className="text-xs text-gray-500">{formatHours(member.totalHours)}</p>
                </div>
              </div>

              {/* Open Button */}
              <div className="px-4 py-1 flex items-center border-r dark:border-[#222222]">
                <button type="button" className="flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-[#B4B4B4] hover:text-gray-200 bg-[#222] rounded-md px-2 py-1 transition-colors">
                  Open
                  <ArrowRight className="size-3" />
                </button>
              </div>

              {/* Daily Hours */}
              {/* {member.dailyHours?.map((minutes, idx) => (
                <div 
                  key={idx} 
                  className="px-2 py-3 flex items-center justify-center border-r dark:border-[#181818] last:border-r-0"
                >
                  <div className={`text-sm ${minutes > 0 ? 'text-gray-200' : 'text-gray-600'}`}>
                    {Math.floor(minutes / 60)}h
                  </div>
                  
                </div>
              )) || weekDays.map((_, idx) => (
                <div className=" dark:bg-[#090909] p-1.5 divide-x-2 divide-gray-700 border-r border-gray-700 last:border-r-0 dark:border-[#181818]">
                <div key={idx} className="px-2 py-3 h-full divide-x-2 divide-gray-700 rounded-sm flex border-r border-gray-700 items-center justify-center dark:bg-[#111111]  dark:border-[#181818] last:border-r-0">
                  <div className="text-sm text-gray-600 dark:text-[#B4B4B4]">0h</div>
                </div>
                </div>
              ))} */}

              {weekDays.map((day, idx) => {
                const entry = getDayEntry(member.userId, idx);
                const totalMinutes = entry?.totalMinutes || 0;
                const billableMinutes = entry?.billableMinutes || 0;
                const nonBillableMinutes = entry?.nonBillableMinutes || (totalMinutes - billableMinutes) || 0;
                const capacityMinutes = 480; // 8 hours
                const hasData = totalMinutes > 0;
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className="dark:bg-[#090909] p-1.5 border-r border-gray-700 last:border-r-0 dark:border-[#222222]"
                  >
                    <HoverCard openDelay={0} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <div className="px-2 py-3 h-full rounded-sm flex  items-center justify-center dark:bg-[#111111]  dark:border-[#222222] last:border-r-0">
                          <div className={`text-sm ${hasData ? 'text-gray-200' : 'text-gray-600 dark:text-[#EEE]'}`}>
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
                        {/* Header */}
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

                        {/* Stats */}
                        <div className="p-4 space-y-3">
                          {/* Tracked Time */}
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

                          {/* Billable */}
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

                          {/* Non-billable */}
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

                          {/* Divider */}
                          <div className="border-t border-gray-800 dark:border-[#222222] pt-3 mt-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-gray-400 rounded-full" />
                                <span className="text-sm text-gray-300">Remaining capacity</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-8 text-right">
                                  {calculatePercentage(Math.max(0, capacityMinutes - totalMinutes), capacityMinutes)}
                                </span>
                                <span className="text-sm text-gray-200 w-16 text-right">
                                  {formatDuration(Math.max(0, capacityMinutes - totalMinutes))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2.5 bg-[#141414] border-t border-gray-800 dark:border-[#222222] flex items-center gap-2 text-xs text-gray-500">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Logged in timezone: IST (UTC+5:30)</span>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                );
              })}

              {/* Total */}
              <div className="px-2 py-3 flex items-center justify-center">
                <div className="text-sm text-gray-400">
                  {formatHours(member.totalHours)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pending Approval Legend */}
      {/* <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
        <span className="size-2 rounded-full bg-yellow-500" />
        <span>Pending Approval</span>
      </div> */}
    </div>
  );
}



// // components/time-tracking/TeamTimesheet.tsx
// import React, { useState, useEffect } from 'react';
// import { Users, ChevronDown, ChevronRight, Clock, DollarSign } from 'lucide-react';
// import { format, startOfWeek, endOfWeek } from 'date-fns';

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

// export function TeamTimesheet() {
//   const [members, setMembers] = useState<TeamMember[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedMember, setExpandedMember] = useState<string | null>(null);
//   const [currentWeek, setCurrentWeek] = useState(new Date());

//   useEffect(() => {
//     fetchTeamData();
//   }, [currentWeek]);

//   const fetchTeamData = async () => {
//     setLoading(true);
//     try {
//       const start = startOfWeek(currentWeek, { weekStartsOn: 0 });
//       const end = endOfWeek(currentWeek, { weekStartsOn: 0 });

//       const res = await fetch(`/api/time-tracking/team?startDate=${start.toISOString()}&endDate=${end.toISOString()}`);
//       const data = await res.json();
//       setMembers(data.members);
//     } catch (error) {
//       console.error('Failed to fetch team data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatHours = (minutes: number): string => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };
//   const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//   return (
//     <div className="bg-white dark:bg-[#090909] rounded-xl shadow-sm border border-gray-200 dark:border-[#181818]">
//       <div className="px-6 py-4 border-b border-gray-200 dark:border-[#181818]">
//         <div className="flex items-center justify-between">
//           {/* <div className="flex items-center gap-3">
//             <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center">
//               <Users className="size-5 text-blue-600" />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900">Team Timesheets</h2>
//               <p className="text-sm text-gray-500">
//                 {format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'MMM d')} - {format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'MMM d, yyyy')}
//               </p>
//             </div>
//           </div> */}
             
//           <div className="flex items-center gap-4 text-sm">
//             <div className="flex items-center gap-2">
//               <span className="size-3 rounded-full bg-yellow-500" />
//               <span className="text-gray-600">Pending Approval</span>
//             </div>
//           </div>
//           <div className="flex items-center gap-4 text-sm">
//             <p className="text-xs text-gray-500 mb-1">{days}</p>
//           </div>
//         </div>
//       </div>

//       <div className="divide-y divide-x divide-gray-200 dark:divide-[#181818] ">
//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <div className="size-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
//           </div>
//         ) : members.length === 0 ? (
//           <div className="py-12 text-center text-gray-500">
//             No team members found
//           </div>
//         ) : (
//           members.map((member) => (
//             <div key={member.userId} className="group flex w-full hover:bg-gray-50 dark:hover:bg-[#1A1A1A]">
//               <button type="button"
//                 onClick={() => setExpandedMember(expandedMember === member.userId ? null : member.userId)}
//                 className=" px-3 py-0 w-[70%] flex items-center justify-between  transition-colors"
//               >
//                 <div className="flex items-center gap-4">
//                   <div className="size-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
//                     {/* {member.user.image} */}
//                     <img className='w-full h-full rounded-full' src={member.user.image} alt="" />
//                   </div>
//                   <div className="text-left">
//                     <p className="font-medium text-gray-900 dark:text-[#B4B4B4]">{member.user.name}</p>
//                     {/* <p className="text-sm text-gray-500">{member.user.email}</p> */}
//                   </div>
//                   {member.pendingApprovals > 0 && (
//                     <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
//                       {member.pendingApprovals} pending
//                     </span>
//                   )}
//                 </div>

                
//               </button>

//               {member.userId && (
//                 <div className="  w-full">

//                   <div className=" !divide-x divide-gray-200 dark:divide-[#7d1a1a]">
//                     {/* Embedded timesheet for this member */}
//                     <div className="bg-white dark:bg-[#090909]">
//                       <div className="p-1 text-sm text-gray-600">
//                         <TimesheetMini userId={member.userId} weekStart={startOfWeek(currentWeek, { weekStartsOn: 0 })} />
//                       </div>
                      
//                     </div>
                    
//                   </div>
                  
//                 </div>
//               )}
//              <div className="text-center p-2 py-0 h-full rounded-lg bg-gray-50 dark:bg-[#111111]">
//                   <div className="text-right">
//                     <p className="text-xs font-medium text-gray-900">{formatHours(member.totalHours)}</p>
//                   </div>
//                   {/* <div className="text-right">
//                     <p className="text-sm font-medium text-green-600">{formatHours(member.billableHours)}</p>
//                     <p className="text-xs text-gray-500">Billable</p>
//                   </div> */}
                  
//                 </div> 
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// // Mini timesheet for expanded view
// function TimesheetMini({ userId, weekStart }: { userId: string; weekStart: Date }) {
//   const [entries, setEntries] = useState<any[]>([]);

//   useEffect(() => {
//     fetchEntries();
//   }, [userId, weekStart]);

//   const fetchEntries = async () => {
//     try {
//       const end = new Date(weekStart);
//       end.setDate(end.getDate() + 6);
      
//       const res = await fetch(`/api/time-tracking/timesheet?userId=${userId}&startDate=${weekStart.toISOString()}&endDate=${end.toISOString()}`);
//       const data = await res.json();
//       setEntries(data.entries || []);
//     } catch (error) {
//       console.error('Failed to fetch mini timesheet:', error);
//     }
//   };

//   const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//   return (
//     <div className="grid grid-cols-7 gap-2 h-full">
 

//       {entries.map((day, idx) => (
//         <>
//         <div key={day.date} className="text-center p-2 py-3 h-full rounded-lg bg-gray-50 dark:bg-[#111111]">
//           <p className={`text-sm font-medium ${day.totalMinutes > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
//             {Math.floor(day.totalMinutes / 60)}h
//           </p>
//           {day.billableMinutes > 0 && (
//             <p className="text-xs text-green-600">
//               ${Math.floor(day.billableMinutes / 60)}h
//             </p>
//           )}
//         </div>
//         </>
//       ))}
//     </div>
//   );
// }
