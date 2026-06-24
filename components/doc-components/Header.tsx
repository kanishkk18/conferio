// import { Search, Sparkles, ArrowUpCircle, Plus, Settings, FolderOpen, Bell, LayoutGrid, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import DynamicIslandDemo from "../ui/DynamicIslandDemo";
// import { Separator } from "../ui/separator";
// import { TaskForm } from "../tasks/task-form";
// import UserComponent from "../ui/comp-377";
// import { PlusIcon } from "../animate-ui/icons/plus";
// import { AnimateIcon } from "../animate-ui/icons/icon";
// import { SearchTrigger } from '@/components/search/SearchTrigger'


// export function Header() {
//   return (
//     <div className="h-11 w-full dark:bg-[#111] bg-[#FCFCFC] border-b border-[#E8E8E8] dark:border-[#222] flex items-center justify-between px-4">
//       <div className="flex items-center gap-2 flex-1">
//         <div className="flex items-center gap-1.5 text-sm">
//           <FileText className="size-5 text-muted-foreground" />
//           <span className="text-foreground font-medium">Docs</span>
//         </div>
//       </div>

//       <div className=" flex-1 flex justify-center items-center">
//         <div className="lg:-ml-16 -ml-10">
//         <SearchTrigger />
//         </div>
//       </div>


//       <div className="flex items-center justify-end flex-1">
//         <DynamicIslandDemo />
//         <Separator orientation="vertical" className="h-6 mr-2" />
//         <UserComponent />
//       </div>
//     </div>
//   );
// }

// function FileText({ className }: { className?: string }) {
//   return (
//     <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//       <polyline points="14,2 14,8 20,8" />
//       <line x1="16" y1="13" x2="8" y2="13" />
//       <line x1="16" y1="17" x2="8" y2="17" />
//       <polyline points="10,9 9,9 8,9" />
//     </svg>
//   );
// }

"use client"

import {
  Layout,
  Video,
  Music,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  Folder,
  Settings2,
  BarChart3,
  Headphones,
  Clapperboard,
  ClipboardList,
  Home,
  BriefcaseBusiness
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DynamicIslandDemo from "../ui/DynamicIslandDemo";
import { Separator } from "../ui/separator";
// import { TaskForm } from "../tasks/task-form";
import UserComponent from "../ui/comp-377";
import { PlusIcon } from "../animate-ui/icons/plus";
import { AnimateIcon } from "../animate-ui/icons/icon";
import { SearchTrigger } from '@/components/search/SearchTrigger'
import { usePathname } from 'next/navigation'
import { ReactNode, useMemo } from "react"
import type { IslandOption } from "@/components/ui/DynamicIsland"
import { cn } from "@/lib/utils";
import { Inbox, MessageCircleMore, UsersRound, LayoutDashboard, SquareKanban, HardDrive, CalendarCheck2, Bot, ListTodo, Disc, BotIcon, Settings } from 'lucide-react';
import { AlarmClock } from "../animate-ui/icons/alarm-clock";
import { ChartSpline } from "../animate-ui/icons/chart-spline";


// ═══════════════════════════════════════════════════════════════
// PAGE CONFIGURATION MAP
// Add or modify pages here. Each page can specify:
// - icon: Lucide icon component
// - label: Text shown in header
// - islandOptions: Which DynamicIsland dock items to show
// ═══════════════════════════════════════════════════════════════
interface PageConfig {
  icon: ReactNode
  label: string
  /** Which DynamicIsland options to show. Omit or use null to show ALL. */
  islandOptions?: IslandOption[] | null
}

const PAGE_CONFIG: Record<string, PageConfig> = {
  "/dashboard": {
    icon: <LayoutDashboard className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Dashboard",
    islandOptions: [ "plus", "record", "timer","ring",  "ask", "notification-bell", ],
  },
  "/meetings/page": {
    icon: <Video className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Meetings",
    islandOptions: ["plus", "record","ring", "timer", "chat", "ask", "notification-bell", "music"],
  },
  "/docs": {
    icon: <FileText className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Docs",
    islandOptions: ["record", "timer", "chat", "ask", "notification-bell", "music"],
  },
  "/members": {
    icon: <Users className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Members",
    islandOptions: ["record", "ring", "timer" ,"ask", "notification-bell", "music"],
  },
  "/calendar/page": {
    icon: <Calendar className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Calendar",
    islandOptions: ["timer", "notification-bell", "music"],
  },
  "/servers": {
    icon: <MessageCircleMore className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Chat",
    islandOptions: ["record", "timer", "ask", "ring", "notification-bell", "music", ],
  },
  "/events/page": {
    icon: <CalendarCheck2 className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Events",
    islandOptions: ["record" , "ring" ,"timer", "ask", "chat", "notification-bell", "music"],
  },
  "/time-tracking": {
    icon: <AlarmClock className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Timesheet",
    islandOptions: ["record" , "ring" ,"timer", "ask", "chat", "notification-bell", "music"],
  },
  "/scrumboard": {
    icon: <SquareKanban className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Scrumboard",
    islandOptions: ["record" , "ring" ,"timer", "ask", "chat", "notification-bell", "music"],
  },
  "/music": {
    icon: <Music className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Music",
    islandOptions: [ "timer", "chat", "notification-bell"],
  },
  "/calls": {
    icon: <Headphones className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Calls",
    islandOptions: ["ring", "chat", "notification-bell"],
  },
  "/clips": {
    icon: <Disc className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Clips",
    islandOptions: ["ring" ,"timer", "ask", "chat", "notification-bell", "music"],
  },
  "/board": {
    icon: <SquareKanban className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Scrumboard",
    islandOptions: ["record" , "ring" ,"timer", "ask", "chat", "notification-bell", "music"],
  },
  "/teams": {
    icon: <BriefcaseBusiness className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Workload",
    islandOptions: ["record" , "ring" ,"timer", "ask", "chat", "notification-bell", "music"],
  },
  "/scheduled/page": {
    icon: <ListTodo className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Scheduled Meetings",
    islandOptions: ["record" , "ring" ,"timer", "ask", "chat", "notification-bell", "music"],
  },
  "/team": {
    icon: <ChartSpline className="size-4 rotate-90 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Whiteboard",
    islandOptions: ["record" , "ring" ,"timer", "ask", "chat", "notification-bell", "music"],
  },

  "__default": {
    icon: <FileText className="size-4 text-[#555] dark:text-[#B3B3B3]" />,
    label: "Docs",
    islandOptions: null,
  },
}

function getPageConfig(pathname: string | null): PageConfig {
  if (!pathname) return PAGE_CONFIG["__default"]

  // Exact match
  if (PAGE_CONFIG[pathname]) {
    return PAGE_CONFIG[pathname]
  }

  // Match by starting path (e.g., /meetings/123 -> /meetings)
  for (const [path, config] of Object.entries(PAGE_CONFIG)) {
    if (path !== "__default" && pathname.startsWith(path + "/")) {
      return config
    }
  }

  return PAGE_CONFIG["__default"]
}

export function Header({ className }: { className?: string }) {
  const pathname = usePathname()
  const pageConfig = useMemo(() => getPageConfig(pathname), [pathname])

  return (
    <div className={cn(`h-10 py-1 w-full dark:bg-[#111] bg-[#FCFCFC] border-b border-[#E8E8E8] dark:border-[#222] flex items-center justify-between px-4`, className)}>
      <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-1.5 text-sm">
          {pageConfig.icon}
          <span className="text-foreground font-medium">{pageConfig.label}</span>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <div className="lg:-ml-16 -ml-10">
          <SearchTrigger />
        </div>
      </div>

      <div className="flex items-center justify-end flex-1">
        <DynamicIslandDemo
          key={pathname ?? "fallback"}
          options={pageConfig.islandOptions ?? undefined}
        />
        <Separator orientation="vertical" className="h-6 mr-2" />
        <UserComponent />
      </div>
    </div>
  );
}
