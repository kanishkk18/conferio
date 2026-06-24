// 'use client';

// import * as React from 'react';
// import {
//   BookOpen,
//   Bot,
//   Command,
//   Frame,
//   LifeBuoy,
//   Map,
//   PieChart,
//   Send,
//   Settings2,
//   SquareTerminal,
// } from 'lucide-react';

// import { NavMain } from './nav-main';
// import { NavProjects } from './nav-projects';
// import { NavSecondary } from './nav-secondary';
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from './ui/sidebar';
// import { useQuery } from '@tanstack/react-query';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
// import { Badge } from '@/components/ui/badge';
// import { TeamSwitcher } from '@/components/team-switcher';
// import { Inbox , MessageCircleMore, UsersRound, LayoutDashboard, FileText, SquareKanban, HardDrive, CalendarCheck2, Video, ListTodo, Music, Disc} from 'lucide-react';
// import {
//   IconCalendar,
//   IconSettings,
// } from '@tabler/icons-react';


// const datas = {

//   navMain: [
//     {
//       title: 'Documents',
//       url: '#',
//       icon: SquareTerminal,
//       // isActive: true,
//       items: [
//         {
//           title: 'Image',
//           url: '#',
//         },
//         {
//           title: 'Video',
//           url: '#',
//         },
//         {
//           title: 'Audio',
//           url: '#',
//         },
//       ],
//     },
//     {
//       title: 'Archives',
//       url: '#',
//       icon: Bot,
//       items: [
//         {
//           title: 'Genesis',
//           url: '#',
//         },
//         {
//           title: 'Explorer',
//           url: '#',
//         },
//         {
//           title: 'Quantum',
//           url: '#',
//         },
//       ],
//     },
//   ],

//   projects: [
//     {
//       name: 'Dashboard',
//       url: '/maindashboard',
//       icon: LayoutDashboard,
//     },
//     {
//       name: 'Meetings',
//       url: '/meetings/page',
//       icon: Video,
//     },
//     {
//       name: 'Chat',
//       url: '/chat',
//       icon: MessageCircleMore,
//     },
//     {
//       name: 'Docs',
//       href: '/docs',
//       icon: FileText,
//     },
//     {
//       name: 'Srumboard',
//       url: '/board/index',
//       icon: SquareKanban,
//     },
//     {
//       name: 'Events',
//       url: '/events/page',
//       icon: CalendarCheck2,
//     },
//     {
//       name: 'Calendar',
//       url: '/calendar/page',
//       icon: IconCalendar,
//     },
//   ],
// };

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['analytics'],
//     queryFn: async () => {
//       const response = await fetch('/api/analytics/user');
//       if (!response.ok) throw new Error('Failed to fetch analytics');
//       return response.json();
//     },
//   });

//   const analytics = data || {};
//   const storage = analytics.storageUsageSummary || {};
//   const usagePercentage =
//     storage.quota > 0 ? (storage.totalUsage / storage.quota) * 100 : 0;

//   return (
//     <Sidebar variant="inset" className="bg-transparent h-full" {...props}>
//       <SidebarHeader className="px-0">
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton size="lg" asChild>
//               <TeamSwitcher/>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>
//       <SidebarContent className="px-0">
//         <NavProjects projects={datas.projects} />
//         <NavMain items={datas.navMain} />
//       </SidebarContent>

//       <SidebarFooter className="px-0 ">
//          <Badge className='w-fit dark:bg-[#191919] -mb-2 rounded-b-none p-0 px-4 dark:text-neutral-500 text-md text-black shadow hover:bg-[#ffffff] bg-[#ffffff] '>
//           {analytics.totaluploadFilesForPeriod || 0}
//         </Badge>
//          <Card className='dark:bg-[#393838] bg-[#E5E5E5] rounded-xl shadow-none border-none px-0 h-fit'>

//         <Card className=" border-none rounded-tl-none w-full z-50">
//           <CardContent className="w-full dark:bg-[#191919] gap-y-3 py-3 px-3 rounded-lg rounded-tl-none">
//             <div className="flex justify-between items-center">
//               <CardTitle className="text-sm font-medium">
//                 Storage Used
//               </CardTitle>
//               <p className="text-sm text-neutral-400 font-medium">
//                 {usagePercentage.toFixed(1)}% Used
//               </p>
//             </div>

//             <div className="">
//               <Progress value={usagePercentage} className="h-2 max-w-full dark:bg-[#383635]" />
//             </div>
//           </CardContent>
//         </Card>
//        <CardContent className='w-full p-1.5 px-3 flex text-[#737373]'>
//              <div className="text-sm font-semibold ">
//               {storage.formattedTotalUsage || '0B'}  of  {storage.formattedQuota || '4GB'}
//             </div>
//           </CardContent>
//         </Card>
//         <NavSecondary  className="px-0" />
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

// components/file-manager/components/app-sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Video,
  MessageCircleMore,
  FileText,
  SquareKanban,
  Calendar,
  HardDrive,
  Image,
  Film,
  Music,
  File,
  Shield,
  Users,
  Folder,
  CheckSquare,
  ChevronRight
} from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TeamSwitcher } from '@/components/team-switcher';
import { useRouter, usePathname } from 'next/navigation';
import { NavProjects } from './nav-projects';
import { NavSecondary } from './nav-secondary';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuAction,
} from "./ui/sidebar"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Label } from '@/components/ui/label';


interface Team {
  id: string;
  name: string;
  slug: string;
  role: string;
}

const data = {
  navMain: [
    {
      title: 'Drive views',
      url: '#',
      icon: HardDrive,
      items: [
        { title: 'All Files', url: '/drive/page', icon: Folder },
        { title: 'Images', url: '/drive/page?type=image', icon: Image },
        { title: 'Videos', url: '/drive/page?type=video', icon: Film },
        { title: 'Audio', url: '/drive/page?type=audio', icon: Music },
        { title: 'Documents', url: '/drive/page?type=document', icon: File },
      ],
    },
    {
      title: 'My Files',
      url: '#',
      icon: Shield,
      items: [
        { title: 'Personal', url: '/drive/page?visibility=personal', icon: Folder },
        { title: 'Assigned to Me', url: '/drive/page?visibility=assigned', icon: CheckSquare },
        { title: 'Password Protected', url: '/drive/page?visibility=protected', icon: Shield },
      ],
    },
    {
      title: 'Team',
      url: '#',
      icon: Users,
      items: [
        { title: 'Team Files', url: '/drive/page?visibility=team', icon: Folder },
        { title: 'Shared with Me', url: '/drive/page?shared=true', icon: Users },
      ],
    },
  ],
  projects: [
    { name: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { name: 'Meetings', url: '/meetings/page', icon: Video },
    { name: 'Chat', url: '/chat', icon: MessageCircleMore },
    { name: 'Docs', url: '/docs', icon: FileText },
    { name: 'Scrumboard', url: '/scrumboard', icon: SquareKanban },
    { name: 'Calendar', url: '/calendar/page', icon: Calendar },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { push } = useRouter()
  const pathname = usePathname();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/user');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });

  const { data: teamsData } = useQuery({
    queryKey: ['my-teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams/my-teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    },
  });

  const { data: teamStorageData } = useQuery({
    queryKey: ['team-storage', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return null
      const res = await fetch(`/api/teams/by-id/${selectedTeamId}/storage`)
      if (!res.ok) throw new Error('Failed to fetch storage')
      return res.json()
    },
    enabled: !!selectedTeamId,
  })

  useEffect(() => {
    if (teamsData?.teams?.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teamsData.teams[0].id);
    }
  }, [teamsData, selectedTeamId]);

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }


  const storagePercentage = teamStorageData?.usagePercentage || 0
  const usedStorage = formatBytes(Number(teamStorageData?.usedStorage || 0))
  const totalQuota = formatBytes(Number(teamStorageData?.quota || 10 * 1024 * 1024 * 1024))

  const teams = teamsData?.teams || [];
  return (

    <Sidebar variant="inset" className="bg-transparent h-full" {...props}>
      <SidebarHeader className="px-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <TeamSwitcher />
              {/* {teams.length > 0 && (
          <Card className="p-4">
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
              SELECT TEAM
            </Label>
            <Select value={selectedTeamId || ''} onValueChange={setSelectedTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team: Team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <Users className="size-4 />
                      <span>{team.name}</span>
                      <Badge variant="outline" className="text-xs ml-2">
                        {team.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        )} */}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-0 thin-scrollbar">
        <NavProjects projects={data.projects} />

        <SidebarGroup className='!py-0'>
          {/* <SidebarGroupLabel>Views</SidebarGroupLabel> */}
          <SidebarMenu >

            <Collapsible defaultOpen>
              <SidebarMenuItem>
                <SidebarMenuButton className='flex justify-startitems-center text-start' >

                  <p className="text-xs font-semibold text-muted-foreground px-2 mb-2">File Type</p>
                </SidebarMenuButton>

                <CollapsibleTrigger asChild>
                  <SidebarMenuAction className="">
                    <ChevronRight />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <CollapsibleContent>

                  {data.navMain[0].items.map((item) => (
                    <SidebarMenuButton
                      key={item.title}
                      onClick={() => push(item.url)}
                      isActive={pathname === item.url}
                      className="w-full justify-start"
                    >
                      <item.icon className="size-4mr-2" />
                      {item.title}
                    </SidebarMenuButton>
                  ))}

                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-0 ">
        <Badge className='w-fit dark:bg-[#191919] -mb-2 rounded-b-none p-0 px-4 dark:text-neutral-500 text-md text-black shadow hover:bg-[#ffffff] bg-[#ffffff] '>
          {analytics?.totaluploadFilesForPeriod || 0}
        </Badge>
        <Card className='dark:bg-[#333] bg-[#E5E5E5] rounded-xl shadow-none border-none px-0 h-fit'>

          <Card className=" border-none rounded-tl-none w-full z-50">
            <CardContent className="w-full dark:bg-[#191919] space-y-3 p-3 rounded-lg rounded-tl-none">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">
                  Storage Used
                </CardTitle>
                <p className="text-sm text-neutral-400 font-medium">
                  {storagePercentage.toFixed(1)}% Used
                </p>
              </div>

              <div className="h-1.5 bg-secondary dark:bg-[#222] rounded-full overflow-hidden">
                <div
                  className=" bg-primary transition-all h-1.5 max-w-full dark:bg-[#383635]"
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <CardContent className='w-full p-1.5 px-3 flex text-[#737373]'>
            <div className="text-sm font-semibold ">
              {usedStorage}  of  {totalQuota}
            </div>
          </CardContent>
        </Card>
        <NavSecondary className="px-0" />
      </SidebarFooter>
    </Sidebar>
  );
}
