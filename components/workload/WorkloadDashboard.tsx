"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar, Legend,
} from "recharts";
import {
  ChevronLeft, ChevronRight, RefreshCw, Users, BarChart2,
  CalendarDays, Layers, AlertTriangle, Clock, FileText,
  CheckCircle2, Zap, TrendingUp, TrendingDown, Minus,
  MoreHorizontal, Scale, Bell, FolderOpen, Video,
  Filter, Search, Download, Plus, ChevronDown, BarChart3,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import MemberDetailModal from "./MemberDetailModal";
import RebalanceModal from "./RebalanceModal";
import { Header } from "../doc-components/Header";
import LazyLoader from "../loader/lazyloader";
import { TeamScreenTimeDashboard } from "../screen-time/TeamScreenTimeDashboard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MemberWorkload {
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberImage: string | null;
  role: string;
  workloadScore: number;
  tasks: {
    total: number; active: number; completed: number;
    overdue: number; urgent: number; high: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
  pages: { total: number };
  files: { total: number };
  reminders: { pending: number };
  meetings: { scheduled: number; percentage: number };
  time: { totalHoursMonth: number; weeklyHours: number };
  trend: number;
}

interface WorkloadData {
  team: {
    id: string; name: string; memberCount: number;
    totalActiveTasks: number; totalCompletedTasks: number;
    totalOverdue: number; totalPages: number; totalFiles: number;
    totalHoursMonth: number; avgWorkloadScore: number;
    completionRate: number; totalMeetings: number;
  };
  members: MemberWorkload[];
  balanceSuggestions: Array<{
    from: string; fromName: string;
    to: string; toName: string;
    reason: string; potentialItems: number;
  }>;
  weeklyTrend: Array<{
    week: string; tasksCreated: number; tasksCompleted: number; hours: number;
  }>;
}

// Schedule types
interface ScheduleShift {
  memberId: string;
  date: string;
  type: "shift" | "ooo" | "holiday" | "meeting";
  label: string;
  time?: string;
  status?: "on-time" | "early" | "late";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MEMBER_COLORS = [
  "#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626",
  "#0891B2", "#7C2D12", "#4F46E5", "#BE185D", "#065F46",
];

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "#EF4444", HIGH: "#F97316", MEDIUM: "#EAB308", LOW: "#22C55E",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  TODO: { label: "To Do", color: "#6366F1", bg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
  IN_PROGRESS: { label: "In Progress", color: "#3B82F6", bg: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  REVIEW: { label: "Review", color: "#A855F7", bg: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  DONE: { label: "Done", color: "#22C55E", bg: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function getAvatarColor(name: string) {
  return MEMBER_COLORS[name.charCodeAt(0) % MEMBER_COLORS.length];
}

function getWeekDays(startDate: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 text-xs">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={`${i}-${p}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <span className="size-2 rounded-full inline-block" style={{ background: p.color || p.fill }} />
          <span>{p.name}:</span>
          <span className="font-medium text-gray-900 dark:text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props { teamSlug: string; teamName: string; }

export default function WorkloadDashboard({ teamSlug, teamName }: Props) {
  const [data, setData] = useState<WorkloadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"workload" | "schedule">("workload");
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "analytics" | "balance">("overview");
  const [scheduleView, setScheduleView] = useState<"members" | "week" | "day">("members");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showRebalance, setShowRebalance] = useState(false);
  const [sortBy, setSortBy] = useState<"score" | "tasks" | "name">("score");
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnscheduled, setShowUnscheduled] = useState(true);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d;
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`/api/teams/${teamSlug}/workload`);
      if (!res.ok) throw new Error("Failed to load workload data");
      const json = await res.json();
      setData(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [teamSlug]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 120_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredMembers = useMemo(() => {
    if (!data) return [];
    let members = [...data.members];
    if (filterRole !== "all") members = members.filter(m => m.role === filterRole);
    if (searchQuery) members = members.filter(m =>
      m.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.memberEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
    members.sort((a, b) => {
      if (sortBy === "score") return b.workloadScore - a.workloadScore;
      if (sortBy === "tasks") return b.tasks.active - a.tasks.active;
      return a.memberName.localeCompare(b.memberName);
    });
    return members;
  }, [data, filterRole, searchQuery, sortBy]);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const maxScore = useMemo(() => Math.max(...(data?.members.map(m => m.workloadScore) || [1])), [data]);

  const navigateWeek = (dir: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dir * 7);
    setWeekStart(d);
  };

  const today = new Date();
  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  // Generate mock schedule data based on members
  const getShiftForMemberDay = (memberId: string, date: Date): ScheduleShift | null => {
    const member = data?.members.find(m => m.memberId === memberId);
    if (!member) return null;
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return null;
    const hash = (memberId.charCodeAt(0) + date.getDate()) % 10;
    if (hash === 3) return { memberId, date: date.toISOString(), type: "ooo", label: `${member.memberName.split(" ")[0]} OOO`, time: "All day" };
    if (isToday(date) && member.tasks.overdue > 0) return { memberId, date: date.toISOString(), type: "shift", label: "Shift", time: "9 am – 5 pm", status: "late" };
    if (member.meetings?.scheduled > 3 && date.getDate() % 2 === 0) return { memberId, date: date.toISOString(), type: "meeting", label: "Meeting Block", time: "10 am – 12 pm" };
    return { memberId, date: date.toISOString(), type: "shift", label: "Shift", time: "9 am – 5 pm", status: hash < 7 ? "on-time" : "early" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-black">
        <LazyLoader/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertTriangle className="size-8 text-amber-500 mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          <Button size="sm" onClick={() => fetchData()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { team, weeklyTrend, balanceSuggestions } = data;

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full min-h-screen w-full bg-gray-50 dark:bg-black font-sans">
        <Header />


        {/* ─── KPI STRIP ───────────────────────────────────────────── */}


        {/* ─── SCHEDULE VIEW ───────────────────────────────────────── */}
        {view === "schedule" && (
          // <ScheduleView
          //   members={filteredMembers}
          //   weekDays={weekDays}
          //   scheduleView={scheduleView}
          //   setScheduleView={setScheduleView}
          //   showUnscheduled={showUnscheduled}
          //   setShowUnscheduled={setShowUnscheduled}
          //   weekStart={weekStart}
          //   navigateWeek={navigateWeek}
          //   getShiftForMemberDay={getShiftForMemberDay}
          //   isToday={isToday}
          //   onMemberClick={setSelectedMember}
          // />
          <TeamScreenTimeDashboard teamId={ teamSlug as string} />
        )}

        {/* ─── WORKLOAD VIEW ───────────────────────────────────────── */}
        {view === "workload" && (
          <>
            {/* Tab Nav */}
            <div className="bg-white dark:bg-[#090909] border-b border-gray-200 dark:border-[#222] px-6 flex items-center gap-1 shrink-0">
              {(["overview", "members", "analytics", "balance"] as const).map((tab) => (
                <button type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5",
                    activeTab === tab
                      ? "border-black dark:border-white text-black dark:text-white"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "balance" && balanceSuggestions.length > 0 && (
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {balanceSuggestions.length}
                    </span>
                  )}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button type="button"
                      onClick={() => setView("workload")}
                      className={cn(
                        "px-4 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors",
                        view === "workload"
                          ? "bg-violet-600 text-white"
                          : "bg-white dark:bg-[#111] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <BarChart2 className="w-3.5 h-3.5" />

                    </button>
                    <button type="button"
                      onClick={() => setView("schedule")}
                      className={cn(
                        "px-4 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors border-l border-gray-200 dark:border-gray-700",
                        view === "schedule"
                          ? "bg-violet-600 text-white"
                          : "bg-white dark:bg-[#111] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />

                    </button>
                  </div>

                  {/* <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-8 w-8 p-0", refreshing && "animate-spin")}
                    onClick={() => fetchData(true)}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button> */}

                  {/* {balanceSuggestions.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRebalance(true)}
                      className="h-8 gap-1.5 text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      {balanceSuggestions.length} suggestion{balanceSuggestions.length > 1 ? "s" : ""}
                    </Button> 
                  )}*/}
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    className="h-7 pl-7 text-xs w-44 bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-gray-700"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="h-7 text-xs w-28 bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="INTERN">Intern</SelectItem>
                  </SelectContent>
                </Select>
                {/* <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="h-7 text-xs w-28 bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">By Workload</SelectItem>
                    <SelectItem value="tasks">By Tasks</SelectItem>
                    <SelectItem value="name">By Name</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] border-b border-gray-200 dark:border-[#222] grid grid-cols-7 divide-x divide-gray-200 dark:divide-[#222] shrink-0">
              {[
                { label: "Active Tasks", value: team.totalActiveTasks, icon: Zap, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
                { label: "Overdue", value: team.totalOverdue, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950", alert: team.totalOverdue > 0 },
                { label: "Completion", value: `${team.completionRate}%`, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
                { label: "Meetings (30d)", value: team.totalMeetings ?? 0, icon: Video, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
                { label: "Pages", value: team.totalPages, icon: FileText, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950" },
                { label: "Files", value: team.totalFiles, icon: FolderOpen, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
                { label: "Hours (30d)", value: `${team.totalHoursMonth}h`, icon: Clock, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950" },
              ].map(({ label, value, icon: Icon, color, bg, alert }) => (
                <div key={label} className={cn("flex items-center gap-3 px-4 py-3 min-w-0", alert && "bg-red-50/50 dark:bg-red-950/30")}>
                  <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", bg)}>
                    <Icon className={cn("size-4", color)} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-lg font-bold leading-tight", alert ? "text-red-600" : "text-gray-900 dark:text-white")}>
                      {value}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-6 max-w-[1600px] mx-auto">

                {/* ── OVERVIEW ─────────────────────────────────────── */}
                {activeTab === "overview" && (
                  <OverviewTab
                    data={data}
                    filteredMembers={filteredMembers}
                    maxScore={maxScore}
                    weeklyTrend={weeklyTrend}
                  />
                )}

                {/* ── MEMBERS ─────────────────────────────────────── */}
                {activeTab === "members" && (
                  <MembersTab
                    members={filteredMembers}
                    maxScore={maxScore}
                    avgScore={team.avgWorkloadScore}
                    onViewDetail={setSelectedMember}
                  />
                )}

                {/* ── ANALYTICS ───────────────────────────────────── */}
                {activeTab === "analytics" && (
                  <AnalyticsTab data={data} filteredMembers={filteredMembers} />
                )}

                {/* ── BALANCE ─────────────────────────────────────── */}
                {activeTab === "balance" && (
                  <BalanceTab
                    members={filteredMembers}
                    suggestions={balanceSuggestions}
                    maxScore={maxScore}
                    avgScore={team.avgWorkloadScore}
                    onOpenRebalance={() => setShowRebalance(true)}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* ─── MODALS ──────────────────────────────────────────────── */}
        {selectedMember && (
          <MemberDetailModal
            teamSlug={teamSlug}
            memberId={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
        {showRebalance && data && (
          <RebalanceModal
            teamSlug={teamSlug}
            members={data.members}
            suggestions={balanceSuggestions}
            onClose={() => setShowRebalance(false)}
            onSuccess={() => { setShowRebalance(false); fetchData(true); }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}



// ─── Schedule View ────────────────────────────────────────────────────────────

// function ScheduleView({
//   members, weekDays, scheduleView, setScheduleView,
//   showUnscheduled, setShowUnscheduled, weekStart, navigateWeek,
//   getShiftForMemberDay, isToday, onMemberClick,
// }: any) {
//   const weekLabel = `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTH_NAMES[weekDays[6].getMonth()]} ${weekDays[6].getDate()}, ${weekDays[6].getFullYear()}`;

//   const getShiftStyle = (shift: ScheduleShift | null) => {
//     if (!shift) return null;
//     if (shift.type === "ooo") return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
//     if (shift.type === "holiday") return "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border border-green-200 dark:border-green-800";
//     if (shift.type === "meeting") return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
//     if (shift.status === "late") return "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800";
//     if (shift.status === "early") return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800";
//     return "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800";
//   };

//   const getStatusDot = (status?: string) => {
//     if (status === "late") return "bg-red-500";
//     if (status === "early") return "bg-blue-500";
//     return "bg-green-500";
//   };

//   return (
//     <div className="flex flex-col flex-1 bg-white dark:bg-[#111]">
//       {/* Schedule Header Controls */}
//       <div className="border-b border-gray-200 dark:border-[#222] px-6 py-3 flex items-center justify-between shrink-0">
//         <div className="flex items-center gap-3">
//           {/* View toggle: Members / Week / Day */}
//           <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
//             {(["members", "week", "day"] as const).map((v) => (
//               <button type="button"
//                 key={v}
//                 onClick={() => setScheduleView(v)}
//                 className={cn(
//                   "px-3 py-1.5 text-xs font-medium transition-colors",
//                   v !== "members" && "border-l border-gray-200 dark:border-gray-700",
//                   scheduleView === v
//                     ? "bg-[#111] dark:bg-white text-white dark:text-gray-900"
//                     : "bg-white dark:bg-[#111] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
//                 )}
//               >
//                 {v.charAt(0).toUpperCase() + v.slice(1)}
//               </button>
//             ))}
//           </div>

//           {/* Week navigator */}
//           <div className="flex items-center gap-1">
//             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateWeek(-1)}>
//               <ChevronLeft className="w-3.5 h-3.5" />
//             </Button>
//             <div className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[160px] justify-center">
//               <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
//               {weekLabel}
//             </div>
//             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateWeek(1)}>
//               <ChevronRight className="w-3.5 h-3.5" />
//             </Button>
//           </div>

//           <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
//             const d = new Date();
//             d.setDate(d.getDate() - d.getDay() + 1);
//             // setWeekStart(d); — would need callback
//           }}>
//             Today
//           </Button>
//         </div>

//         <div className="flex items-center gap-3">
//           {/* Member filter */}
//           <Select defaultValue="all">
//             <SelectTrigger className="h-8 text-xs w-36 border-gray-200 dark:border-gray-700">
//               <Users className="size-3 mr-1.5 text-gray-400" />
//               <SelectValue placeholder="All members" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All members</SelectItem>
//               {members.map((m: MemberWorkload) => (
//                 <SelectItem key={m.memberId} value={m.memberId}>{m.memberName}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {/* Show unscheduled toggle */}
//           <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
//             <span>Show unscheduled</span>
//             <Switch
//               checked={showUnscheduled}
//               onCheckedChange={setShowUnscheduled}
//               className="scale-75"
//             />
//           </div>

//           <Button size="sm" className="h-8 gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs">
//             <Plus className="w-3.5 h-3.5" />
//             Add a schedule
//           </Button>
//         </div>
//       </div>

//       {/* Schedule Grid */}
//       <div className="flex-1 overflow-auto">
//         <table className="w-full border-collapse">
//           <thead>
//             <tr>
//               {/* Member column header */}
//               <th className="sticky left-0 z-20 bg-white dark:bg-[#111] border-b border-r border-gray-200 dark:border-[#222] px-4 py-3 text-left w-56">
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Members</span>
//                   {showUnscheduled && (
//                     <div className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer ml-1">
//                       <Switch checked={showUnscheduled} onCheckedChange={setShowUnscheduled} className="scale-[0.6]" />
//                       Unscheduled
//                     </div>
//                   )}
//                 </div>
//               </th>
//               {/* Day columns */}
//               {weekDays.map((day: Date, i: number) => (
//                 <th
//                   key={`${i}-${day.getDate()}`}
//                   className={cn(
//                     "border-b border-r border-gray-200 dark:border-[#222] px-3 py-2 text-center min-w-[130px]",
//                     isToday(day) && "bg-violet-50 dark:bg-violet-950/30"
//                   )}
//                 >
//                   <div className="flex flex-col items-center gap-0.5">
//                     <span className={cn(
//                       "text-2xl font-bold leading-tight",
//                       isToday(day) ? "text-violet-600 dark:text-violet-400" : "text-gray-900 dark:text-white"
//                     )}>
//                       {day.getDate()}
//                     </span>
//                     <span className={cn(
//                       "text-[10px] font-semibold uppercase tracking-wide",
//                       isToday(day) ? "text-violet-500" : "text-gray-400"
//                     )}>
//                       {DAY_NAMES[day.getDay()]} · {MONTH_NAMES[day.getMonth()]}
//                     </span>
//                   </div>
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {members.map((member: MemberWorkload) => (
//               <tr key={member.memberId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
//                 {/* Member cell */}
//                 <td
//                   className="sticky left-0 z-10 bg-white dark:bg-[#111] border-b border-r border-gray-200 dark:border-[#222] px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-56"
//                   onClick={() => onMemberClick(member.memberId)}
//                 >
//                   <div className="flex items-center gap-2.5">
//                     <Avatar className="size-8 shrink-0">
//                       {member.memberImage && <AvatarImage src={member.memberImage} />}
//                       <AvatarFallback
//                         className="text-[10px] font-bold text-white"
//                         style={{ background: getAvatarColor(member.memberName) }}
//                       >
//                         {getInitials(member.memberName)}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="min-w-0">
//                       <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{member.memberName}</p>
//                       <p className="text-[10px] text-gray-400 truncate">{member.tasks.active} active tasks</p>
//                     </div>
//                   </div>
//                 </td>
//                 {/* Day cells */}
//                 {weekDays.map((day: Date, i: number) => {
//                   const shift = getShiftForMemberDay(member.memberId, day);
//                   return (
//                     <td
//                       key={`${day}-${i}`}
//                       className={cn(
//                         "border-b border-r border-gray-200 dark:border-[#222]   p-2    align-top min-w-[130px]",
//                         isToday(day) && "bg-violet-50/30 dark:bg-violet-950/10"
//                       )}
//                     >
//                       {shift ? (
//                         <div className={cn("rounded-lg px-2 py-1.5 text-[10px] leading-tight font-medium cursor-pointer hover:opacity-90 transition-opacity", getShiftStyle(shift))}>
//                           {shift.type === "shift" && shift.status && (
//                             <div className="flex items-center gap-1 mb-0.5">
//                               <span className={cn("size-1.5  rounded-full inline-block", getStatusDot(shift.status))} />
//                               <span className="capitalize">{shift.status === "on-time" ? "On time" : shift.status}</span>
//                             </div>
//                           )}
//                           <div className="font-semibold">{shift.label}</div>
//                           {shift.time && <div className="opacity-80 mt-0.5">{shift.time}</div>}
//                         </div>
//                       ) : (
//                         <div className="w-full h-10 rounded-lg border border-dashed border-gray-200 dark:border-[#222] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer group">
//                           <Plus className="size-3 text-gray-400 group-hover:text-violet-500" />
//                         </div>
//                       )}
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ data, filteredMembers, maxScore, weeklyTrend }: any) {
  const taskDistData = filteredMembers.map((m: MemberWorkload, i: number) => ({
    name: m.memberName.split(" ")[0],
    active: m.tasks.active,
    completed: m.tasks.completed,
    overdue: m.tasks.overdue,
    meetings: m.meetings?.scheduled || 0,
    fill: MEMBER_COLORS[i % MEMBER_COLORS.length],
  }));

  const pieData = filteredMembers
    .filter((m: MemberWorkload) => m.tasks.active > 0)
    .map((m: MemberWorkload, i: number) => ({
      name: m.memberName.split(" ")[0],
      value: m.tasks.active,
      fill: MEMBER_COLORS[i % MEMBER_COLORS.length],
    }));

  const priorityData = filteredMembers.map((m: MemberWorkload) => ({
    name: m.memberName.split(" ")[0],
    Urgent: m.tasks.byPriority?.URGENT || 0,
    High: m.tasks.byPriority?.HIGH || 0,
    Medium: m.tasks.byPriority?.MEDIUM || 0,
    Low: m.tasks.byPriority?.LOW || 0,
  }));

  return (
    <div className="space-y-4">

      <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-[#222] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Workload Overview</h2>
          <span className="text-xs text-gray-400">Score vs capacity</span>
        </div>
        <div className="p-5 space-y-3">
          {filteredMembers.map((m: MemberWorkload, i: number) => {
            const pct = maxScore > 0 ? (m.workloadScore / maxScore) * 100 : 0;
            const isOver = m.workloadScore > data.team.avgWorkloadScore * 1.4;
            const isUnder = m.workloadScore < data.team.avgWorkloadScore * 0.6;
            const color = MEMBER_COLORS[i % MEMBER_COLORS.length];
            return (
              <div key={m.memberId} className="flex items-center gap-3 group">
                <Avatar className="size-7 shrink-0">
                  {m.memberImage && <AvatarImage src={m.memberImage} />}
                  <AvatarFallback className="text-[10px] font-bold text-white" style={{ background: color }}>
                    {getInitials(m.memberName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-28 shrink-0 truncate">
                  {m.memberName}
                </span>
                {/* Workload bar */}
                <div className="flex-1 relative h-6 bg-gray-100 dark:bg-[#111] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max(pct, 2)}%`,
                      background: isOver
                        ? "linear-gradient(90deg, #EF4444, #F97316)"
                        : isUnder
                          ? "linear-gradient(90deg, #22C55E, #16A34A)"
                          : color,
                    }}
                  >
                    {pct > 20 && (
                      <span className="text-[9px] font-bold text-white/90">{m.workloadScore}</span>
                    )}
                  </div>
                  {/* Capacity segments */}
                  {[25, 50, 75].map(p => (
                    <div key={p} className="absolute top-0 bottom-0 w-px bg-white/40 dark:bg-[#111]/40" style={{ left: `${p}%` }} />
                  ))}
                </div>
                {/* Stats pills */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <UITooltip>
                    <TooltipTrigger>
                      <span className="text-[11px] bg-gray-100 dark:bg-[#111] text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">
                        {m.tasks.active}T
                      </span>
                    </TooltipTrigger>
                    <TooltipContent><p>{m.tasks.active} active tasks</p></TooltipContent>
                  </UITooltip>
                  {m.meetings?.scheduled > 0 && (
                    <UITooltip>
                      <TooltipTrigger>
                        <span className="text-[11px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                          {m.meetings.scheduled}M
                        </span>
                      </TooltipTrigger>
                      <TooltipContent><p>{m.meetings.scheduled} meetings scheduled</p></TooltipContent>
                    </UITooltip>
                  )}
                  {m.tasks.overdue > 0 && (
                    <span className="text-[11px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                      {m.tasks.overdue}!
                    </span>
                  )}
                  {isOver && <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">Over</Badge>}
                  {isUnder && <Badge className="text-[9px] px-1.5 py-0 h-4 bg-green-600 hover:bg-green-700">Free</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Charts 2-col */}
      <div className="grid grid-cols-2 gap-4">
        {/* Weekly Trend */}
        <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Activity Trend</h3>
            <span className="text-xs text-gray-400">Last 4 weeks</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="tasksCreated" name="Created" stroke="#7C3AED" fill="url(#gCreated)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="tasksCompleted" name="Completed" stroke="#22C55E" fill="url(#gCompleted)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task Distribution Pie */}
        <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Task Distribution</h3>
            <span className="text-xs text-gray-400">Active tasks</span>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((_: any, i: number) => <Cell key={`${i}-pie`} fill={pieData[i].fill} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {pieData.slice(0, 6).map((d: any) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ background: d.fill }} />
                    <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Priority + Hours */}
      <div className="grid grid-cols-2 gap-4">
        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={priorityData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="Urgent" stackId="p" fill="#EF4444" />
              <Bar dataKey="High" stackId="p" fill="#F97316" />
              <Bar dataKey="Medium" stackId="p" fill="#EAB308" />
              <Bar dataKey="Low" stackId="p" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Meetings per member */}
        <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Meeting Load</h3>
            <span className="text-xs text-gray-400">Count + % of capacity</span>
          </div>
          <div className="space-y-3">
            {filteredMembers.slice(0, 6).map((m: MemberWorkload, i: number) => {
              const meetings = m.meetings?.scheduled || Math.floor(m.tasks.active * 0.4);
              const pct = Math.min(Math.round((meetings / (m.tasks.active + meetings + 1)) * 100), 100);
              return (
                <div key={m.memberId} className="flex items-center gap-2">
                  <Avatar className="size-6 shrink-0">
                    <AvatarFallback className="text-[9px] font-bold text-white" style={{ background: MEMBER_COLORS[i % MEMBER_COLORS.length] }}>
                      {getInitials(m.memberName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-20 shrink-0 truncate">{m.memberName.split(" ")[0]}</span>
                  <div className="flex-1 h-4 bg-gray-100 dark:bg-[#111] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: MEMBER_COLORS[i % MEMBER_COLORS.length] }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white w-8 text-right">{meetings}</span>
                  <span className="text-[10px] text-gray-400 w-8">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Members Tab ──────────────────────────────────────────────────────────────

function MembersTab({ members, maxScore, avgScore, onViewDetail }: any) {
  return (
    <div className="space-y-3">
      {members.map((m: MemberWorkload, i: number) => (
        <MemberRow
          key={m.memberId}
          member={m}
          color={MEMBER_COLORS[i % MEMBER_COLORS.length]}
          maxScore={maxScore}
          avgScore={avgScore}
          onViewDetail={() => onViewDetail(m.memberId)}
        />
      ))}
    </div>
  );
}

function MemberRow({ member: m, color, maxScore, avgScore, onViewDetail }: any) {
  const pct = maxScore > 0 ? (m.workloadScore / maxScore) * 100 : 0;
  const isOver = m.workloadScore > avgScore * 1.4;
  const isUnder = m.workloadScore < avgScore * 0.6;
  const meetings = m.meetings?.scheduled || Math.floor(m.tasks.active * 0.4);
  const meetingPct = Math.min(Math.round((meetings / (m.tasks.active + meetings + 1)) * 100), 100);

  const statusItems = [
    { key: "TODO", val: m.tasks.byStatus?.TODO || 0, color: "#6366F1" },
    { key: "IN_PROGRESS", val: m.tasks.byStatus?.IN_PROGRESS || 0, color: "#3B82F6" },
    { key: "REVIEW", val: m.tasks.byStatus?.REVIEW || 0, color: "#A855F7" },
    { key: "DONE", val: m.tasks.byStatus?.DONE || 0, color: "#22C55E" },
  ];
  const totalTasks = statusItems.reduce((s, x) => s + x.val, 0);

  return (
    <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] p-4 hover:border-violet-300 dark:hover:border-violet-700 transition-colors group">
      <div className="flex items-start gap-4">
        {/* Avatar + identity */}
        <Avatar className="size-10 shrink-0">
          {m.memberImage && <AvatarImage src={m.memberImage} />}
          <AvatarFallback className="font-bold text-white text-sm" style={{ background: color }}>
            {getInitials(m.memberName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{m.memberName}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">{m.role}</span>
            {isOver && <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">Overloaded</Badge>}
            {isUnder && <Badge className="text-[9px] px-1.5 py-0 h-4 bg-emerald-600 hover:bg-emerald-700">Available</Badge>}
          </div>
          <p className="text-xs text-gray-400 mb-3">{m.memberEmail}</p>

          {/* Workload bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-gray-400 w-16 shrink-0">Workload</span>
            <div className="flex-1 h-2 bg-gray-100 dark:bg-[#111] rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max(pct, 1)}%`,
                  background: isOver
                    ? "linear-gradient(90deg, #EF4444, #F97316)"
                    : isUnder ? "#22C55E"
                      : color,
                }}
              />
              <div className="absolute top-0 bottom-0 w-px bg-gray-400/30" style={{ left: `${(avgScore / maxScore) * 100}%` }} />
            </div>
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 w-6 text-right">{m.workloadScore}</span>
          </div>

          {/* Status mini bar */}
          {totalTasks > 0 && (
            <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5 mb-3">
              {statusItems.map(s => s.val > 0 && (
                <UITooltip key={s.key}>
                  <TooltipTrigger asChild>
                    <div
                      className="h-full rounded-sm cursor-pointer hover:opacity-80"
                      style={{ width: `${(s.val / totalTasks) * 100}%`, background: s.color }}
                    />
                  </TooltipTrigger>
                  <TooltipContent><p>{STATUS_CONFIG[s.key]?.label}: {s.val}</p></TooltipContent>
                </UITooltip>
              ))}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-7 gap-2">
            {[
              { label: "Active", value: m.tasks.active, icon: Zap, color: "text-violet-600" },
              { label: "Overdue", value: m.tasks.overdue, icon: AlertTriangle, color: m.tasks.overdue > 0 ? "text-red-500" : "text-gray-400" },
              { label: "Done", value: m.tasks.completed, icon: CheckCircle2, color: "text-green-600" },
              { label: "Meetings", value: meetings, icon: Video, color: "text-blue-600" },
              { label: "Pages", value: m.pages.total, icon: FileText, color: "text-cyan-600" },
              { label: "Files", value: m.files.total, icon: FolderOpen, color: "text-amber-600" },
              { label: "Hrs/wk", value: `${m.time.weeklyHours}h`, icon: Clock, color: "text-pink-600" },
            ].map(({ label, value, icon: Icon, color: c }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-0.5">
                  <Icon className={cn("size-3", c)} />
                </div>
                <p className="text-[13px] font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-[9px] text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: trend + action */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-right">
            <p className="text-xl font-black text-gray-900 dark:text-white">{m.workloadScore}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide">score</p>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-[11px] font-medium",
            m.trend > 0 ? "text-red-500" : m.trend < 0 ? "text-green-600" : "text-gray-400"
          )}>
            {m.trend > 0 ? <TrendingUp className="size-3" /> : m.trend < 0 ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
            {Math.abs(m.trend)}% vs last wk
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onViewDetail}
            className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Details →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ data, filteredMembers }: any) {
  const radialData = filteredMembers.map((m: MemberWorkload, i: number) => ({
    name: m.memberName.split(" ")[0],
    value: Math.round((m.workloadScore / Math.max(...filteredMembers.map((x: any) => x.workloadScore), 1)) * 100),
    fill: MEMBER_COLORS[i % MEMBER_COLORS.length],
  }));

  const statusData = filteredMembers.map((m: MemberWorkload) => ({
    name: m.memberName.split(" ")[0],
    Todo: m.tasks.byStatus?.TODO || 0,
    "In Progress": m.tasks.byStatus?.IN_PROGRESS || 0,
    Review: m.tasks.byStatus?.REVIEW || 0,
    Done: m.tasks.byStatus?.DONE || 0,
  }));

  const hoursData = filteredMembers.map((m: MemberWorkload, i: number) => ({
    name: m.memberName.split(" ")[0],
    monthly: m.time.totalHoursMonth,
    weekly: m.time.weeklyHours,
    fill: MEMBER_COLORS[i % MEMBER_COLORS.length],
  }));

  const meetingData = filteredMembers.map((m: MemberWorkload, i: number) => {
    const meetings = m.meetings?.scheduled || Math.floor(m.tasks.active * 0.4);
    const pct = Math.min(Math.round((meetings / (m.tasks.active + meetings + 1)) * 100), 100);
    return { name: m.memberName.split(" ")[0], meetings, pct, fill: MEMBER_COLORS[i % MEMBER_COLORS.length] };
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Radial Workload */}
      <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Workload Radial</h3>
        <p className="text-xs text-gray-400 mb-3">Relative capacity usage</p>
        <ResponsiveContainer width="100%" height={220}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={radialData}>
            <RadialBar dataKey="value" cornerRadius={4} label={false} />
            <Legend formatter={(v) => <span className="text-xs text-gray-500">{v}</span>} />
            <Tooltip content={<ChartTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Status by Member */}
      <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Task Status by Member</h3>
        <p className="text-xs text-gray-400 mb-3">Breakdown across pipeline stages</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={statusData} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend formatter={(v) => <span className="text-xs text-gray-500">{v}</span>} />
            <Bar dataKey="Todo" stackId="s" fill="#6366F1" />
            <Bar dataKey="In Progress" stackId="s" fill="#3B82F6" />
            <Bar dataKey="Review" stackId="s" fill="#A855F7" />
            <Bar dataKey="Done" stackId="s" fill="#22C55E" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hours */}
      <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Time Logged</h3>
        <p className="text-xs text-gray-400 mb-3">Monthly hours per member</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hoursData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="monthly" name="Monthly hrs" radius={[4, 4, 0, 0]}>
              {hoursData.map((_: any, i: number) => <Cell key={`${i}-hrs`} fill={MEMBER_COLORS[i % MEMBER_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Meetings per member */}
      <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Meeting Load</h3>
        <p className="text-xs text-gray-400 mb-4">Count + % of total work items</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={meetingData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="meetings" name="Meetings" radius={[4, 4, 0, 0]}>
              {meetingData.map((_: any, i: number) => <Cell key={`${i}-meetings`} fill={MEMBER_COLORS[i % MEMBER_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Balance Tab ──────────────────────────────────────────────────────────────

function BalanceTab({ members, suggestions, maxScore, avgScore, onOpenRebalance }: any) {
  return (
    <div className="space-y-4">
      {/* Intro card */}
      <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl p-4 flex items-start gap-3">
        <div className="size-9 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center shrink-0">
          <Scale className="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-100">Smart Load Balancing</h3>
          <p className="text-xs text-violet-700 dark:text-violet-300 mt-0.5 leading-relaxed">
            Conferio weights tasks by priority, overdue penalty, pages, files and reminders. Members 40%+ above average are flagged as overloaded.
          </p>
        </div>
      </div>

      {/* Score comparison */}
      <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Workload Scores</h3>
          <span className="text-xs text-gray-400">Avg: {avgScore}</span>
        </div>
        <div className="space-y-3">
          {members.map((m: MemberWorkload, i: number) => {
            const pct = maxScore > 0 ? (m.workloadScore / maxScore) * 100 : 0;
            const isOver = m.workloadScore > avgScore * 1.4;
            const isUnder = m.workloadScore < avgScore * 0.6;
            return (
              <div key={m.memberId} className="flex items-center gap-3">
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="text-[10px] font-bold text-white" style={{ background: MEMBER_COLORS[i % MEMBER_COLORS.length] }}>
                    {getInitials(m.memberName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-28 truncate shrink-0">{m.memberName}</span>
                <div className="flex-1 relative h-5 bg-gray-100 dark:bg-[#111] rounded-full overflow-visible">
                  <div
                    className="h-full rounded-full transition-all duration-700 absolute top-0 left-0"
                    style={{
                      width: `${pct}%`,
                      background: isOver ? "linear-gradient(90deg,#EF4444,#F97316)"
                        : isUnder ? "#22C55E"
                          : MEMBER_COLORS[i % MEMBER_COLORS.length],
                    }}
                  />
                  {/* Avg marker */}
                  <div
                    className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-gray-400/60 dark:bg-gray-500 rounded-full"
                    style={{ left: `${(avgScore / maxScore) * 100}%` }}
                    title={`Avg: ${avgScore}`}
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isOver && <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">Over</Badge>}
                  {isUnder && <Badge className="text-[9px] px-1.5 py-0 h-4 bg-emerald-600 hover:bg-emerald-700">Free</Badge>}
                  <span className="text-xs font-bold text-gray-900 dark:text-white w-7 text-right">{m.workloadScore}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-base">💡</span> Rebalancing Suggestions
          </h3>
          {suggestions.map((s: any, i: number) => (
            <div key={`${s}-${i}`} className="bg-white dark:bg-[#111] border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="size-9">
                  <AvatarFallback className="text-xs font-bold text-white" style={{ background: "#EF4444" }}>
                    {getInitials(s.fromName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.fromName}</p>
                  <p className="text-[11px] text-red-500">Overloaded</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-violet-500">
                <ChevronRight className="size-5" />
                <span className="text-[10px] text-gray-400">~{s.potentialItems} items</span>
              </div>
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="size-9">
                  <AvatarFallback className="text-xs font-bold text-white" style={{ background: "#22C55E" }}>
                    {getInitials(s.toName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.toName}</p>
                  <p className="text-[11px] text-emerald-600">Available</p>
                </div>
              </div>
              <Button size="sm" onClick={onOpenRebalance} className="bg-violet-600 hover:bg-violet-700 text-white shrink-0">
                Rebalance →
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-8 text-center">
          <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Team is well-balanced</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">No significant workload imbalances detected.</p>
        </div>
      )}

      {/* Weight table */}
      <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Score Weights</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Urgent Task", weight: 10, color: "#EF4444" },
            { label: "Overdue", weight: 8, color: "#DC2626" },
            { label: "High Task", weight: 7, color: "#F97316" },
            { label: "Medium Task", weight: 5, color: "#EAB308" },
            { label: "Page Assigned", weight: 4, color: "#3B82F6" },
            { label: "Reminder", weight: 3, color: "#14B8A6" },
            { label: "Low Task", weight: 3, color: "#22C55E" },
            { label: "File Assigned", weight: 2, color: "#A855F7" },
          ].map(w => (
            <div key={w.label} className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-[#111] rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: w.color }} />
              <span className="text-[11px] text-gray-600 dark:text-gray-400 flex-1 truncate">{w.label}</span>
              <span className="text-[11px] font-bold text-gray-900 dark:text-white">+{w.weight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

