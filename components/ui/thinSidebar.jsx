'use client';
import React, { useState } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from './sidebarThin';
import Link from 'next/link';
// import { motion } from "framer-motion";
// import Image from "next/image";
import { cn } from '@/lib/utils';
import TeamDropdown from '../shared/TeamDropdown';
import Image from 'next/image';
import { Inbox , MessageCircleMore, UsersRound, LayoutDashboard, FileText, SquareKanban, HardDrive, CalendarCheck2, Video, Bot, ListTodo, Music, Disc, Calendar, Settings, Gauge} from 'lucide-react';
import useTeams from 'hooks/useTeams';


export default function Mainsidebar() {
    const { teams } = useTeams();

  const links = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    // {
    //   label: 'Inbox',
    //   href: '/mail/page',
    //   icon: (
    //     <Inbox className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
    //   ),
    // },
    {
      label: 'Meetings',
      href: '/meetings/page',
      icon: (
        <Video className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Chat',
      href: '/chat',
      icon: (
        <MessageCircleMore className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Members',
      href: (teams && teams[0]?.slug ? `/members/${teams[0].slug}` : '/members'),
      icon: (
        <UsersRound className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Whiteboard',
      href: (teams && teams[0]?.slug ? `/team/${teams[0].slug}/whiteboard` : '/'),
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    // {
    //   label: 'Conversations',
    //   href: (teams && teams[0]?.slug ? `/conversations/${teams[0].slug}` : '/conversations'),
    //   icon: (
    //     <MessageCircleMore className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
    //   ),
    // },
    {
      label: 'Srumboard',
      href: '/scrumboard',
      icon: (
        <SquareKanban className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Docs',
      href: '/docs',
      icon: (
        <FileText className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Workload',
      href: (teams && teams[0]?.slug ? `/teams/${teams[0].slug}/workload` : '/workload'),
      roles: ["ADMIN", "OWNER", "MANAGER"],
      icon: (
        <Settings className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },

    // {
    //   label: 'Calls',
    //   href: '/calls',
    //   icon: (
    //     <FileText className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
    //   ),
    // },
    {
      label: 'Timesheet',
      href: '/time-tracking',
      icon: (
        <FileText className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    
    {
      label: 'Drive',
      href: '/drive/page',
      icon: (
        <HardDrive className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Events',
      href: '/events/page',
      icon: (
        <CalendarCheck2 className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'AI',
      href: 'https://ai.collabium.in',
      icon: (
        <Bot className="text-neutral-700  dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },

    {
      label: 'Calendar',
      href: '/calendar/page',
      icon: (
        <Calendar className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },

    {
      label: 'Clips',
      href: '/clips',
      icon: (
        <Disc className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
   
    {
      label: 'Workflows',
      href: '/workflows',
      icon: (
        <Bot className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },

    {
      label: "Bookings",
      href: "/bookings/page",
      icon: (
        <ListTodo  className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },

    {
      label: 'Music',
      href: '/music/page',
      icon: (
        <Music className="text-neutral-700  dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    
    {
      label: 'Settings',
      href: '/settings/page',
      icon: (
        <Settings className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    
  ];

  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        'rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-950 overflow-hidden',
        'h-screen w-fit'
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden thin-scrollbar">
            {open ? <Logo /> : <></>}
            <div className="mt-6 flex flex-col gap-2 px-4">
              {links.map((link, idx) => (
                <SidebarLink key={`${idx}-${link.label}`} link={link} />
              ))}
            </div>
          </div>
          <div>
            <TeamDropdown />
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}
export const Logo = () => {
  return (
    <Link href="/" className="flex pl-3 items-center gap-x-2">
      <Image
        src="https://res.cloudinary.com/kanishkkcloud18/image/upload/v1718475378/CONFERIO/gbkp0siuxyro0cgjq9rq.png"
        alt="logo"
        className="text-black bg-black p-1 rounded-md h-8 w-8"
        height={1000}
        width={1000}
      />
      <span className="dark:text-white text-black font-normal text-lg">
        Conferio
      </span>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex gap-x-2 items-center text-sm text-black relative z-20"
    >
      <img
        src="https://res.cloudinary.com/kanishkkcloud18/image/upload/v1718475378/CONFERIO/gbkp0siuxyro0cgjq9rq.png"
        alt="logo"
        className="text-black p-1 bg-black rounded-md h-6 w-auto"
      />{' '}
    </Link>
  );
};
