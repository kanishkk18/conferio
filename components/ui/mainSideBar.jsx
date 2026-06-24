'use client';
import React, { useState } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from './sidebarMain';
import Link from 'next/link';
// import { motion } from "framer-motion";
// import Image from "next/image";
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Inbox , MessageCircleMore, UsersRound, LayoutDashboard, FileText, SquareKanban, HardDrive, CalendarCheck2, Video, Bot, ListTodo, Music, Disc, BotIcon, Settings, Calendar, BarChart3} from 'lucide-react';
import useTeams from 'hooks/useTeams';
import { AlarmClock } from '../animate-ui/icons/alarm-clock';
import { Users } from '../animate-ui/icons/users';
import { Brush } from "@/components/animate-ui/icons/brush";
import PenIcon from "@/components/ui/pen-icon";
import { ChartSpline } from "@/components/animate-ui/icons/chart-spline";
import {
  ChevronUpDownIcon,
  FolderIcon,
  FolderPlusIcon,
  RectangleStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { maxLengthPolicies } from '@/lib/common';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

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
        <Users className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
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
        <AlarmClock className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
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
      label: 'Whiteboard',
      href: (teams && teams[0]?.slug ? `/team/${teams[0].slug}/whiteboard` : '/'),
      icon: (
        <ChartSpline className="text-neutral-700 rotate-90 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Scheduled",
      href: "/scheduled/page",
      icon: (
        <ListTodo  className="text-neutral-700 dark:text-white/70 h-5 w-5 flex-shrink-0" />
      ),
    },

    {
      label: 'Music',
      href: '/music',
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
        'rounded-none flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-950 !overflow-hidden',
        'h-screen w-fit'
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-y-4">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden thin-scrollbar">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-4 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={`${idx}-${link.label}`} link={link} />
              ))}
            </div>
          </div>
          <div>
          {open ? <TeamDropdown /> : <TeamDropdownSmall/> }
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}
export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-x-2">
      <Image
        src="/logo-transparent.png"
        alt="logo"
        className="text-black bg-black p-1 rounded-md h-[28px] w-auto"
        height={1000}
        width={1000}
      />
      <span className="dark:text-white text-black font-bold text-md">
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
        src="/logo-transparent.png"
        alt="logo"
        className="text-black p-1 bg-black rounded-md h-[28px] w-auto"
      />{' '}
    </Link>
  );
};

const TeamDropdown = () => {
  const router = useRouter();
  const { teams } = useTeams();
  const { data } = useSession();
  const { t } = useTranslation('common');

  const currentTeam = (teams || []).find(
    (team) => team.slug === router.query.slug
  );

  const menus = [
    {
      id: 2,
      name: t('teams'),
      items: (teams || []).map((team) => ({
        id: team.id,
        name: team.name,
        href: `/teams/${team.slug}/settings`,
        icon: FolderIcon,
      })),
    },
    {
      id: 1,
      name: t('profile'),
      items: [
        {
          id: data?.user.id,
          name: data?.user?.name,
          href: '/settings/account',
          icon: UserCircleIcon,
        },
      ],
    },
    {
      id: 3,
      name: '',
      items: [
        {
          id: 'all-teams',
          name: t('all-teams'),
          href: '/teams',
          icon: RectangleStackIcon,
        },
        {
          id: 'new-team',
          name: t('new-team'),
          href: '/teams?newTeam=true',
          icon: FolderPlusIcon,
        },
      ],
    },
  ];

  return (
  <DropdownMenu>
        <DropdownMenuTrigger >
           <button type="button" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border-none px-0 flex justify-center items-center gap-1.5"
            >
              <Avatar className="h-6 w-6 rounded-md">
                <AvatarImage src={data?.user?.image} alt={data?.user?.name} />
                <AvatarFallback className="rounded-md">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-3">
                <span className="truncate text-xs font-medium">{data?.user?.name}</span>
                <span className="truncate text-xs">{data?.user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </button> 
            </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <ul
        
        className="dropdown-content w-full rounded px-2"
      >
        {menus.map(({ id, name, items }) => {
          return (
            <React.Fragment key={id}>
              {name && (
                <li
                  className="text-xs text-gray-500 py-1 px-2"
                  key={`${id}-name`}
                >
                  {name}
                </li>
              )}
              {items.map((item) => (
                <li               
                  key={`${id}-${item.id}`}
                >
                  <button onClick={() => {
                    if (document.activeElement) {
                      (document.activeElement).blur();
                    }
                  }}
                   type="button">
                  <Link href={item.href}>
                    <div className="flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none p-2 rounded text-sm font-medium gap-2 items-center">
                      <item.icon className="size-5" /> {item.name}
                    </div>
                  </Link>
                  </button>
                </li>
              ))}
              {name && <li className="divider m-0" key={`${id}-divider`} />}
            </React.Fragment>
          );
        })}
      </ul>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
     </DropdownMenu>
  );
};



const TeamDropdownSmall = () => {
  const router = useRouter();
  const { teams } = useTeams();
  const { data } = useSession();
  const { t } = useTranslation('common');

  const currentTeam = (teams || []).find(
    (team) => team.slug === router.query.slug
  );

  const menus = [
    {
      id: 2,
      name: t('teams'),
      items: (teams || []).map((team) => ({
        id: team.id,
        name: team.name,
        href: `/teams/${team.slug}/settings`,
        icon: FolderIcon,
      })),
    },
    {
      id: 1,
      name: t('profile'),
      items: [
        {
          id: data?.user.id,
          name: data?.user?.name,
          href: '/settings/account',
          icon: UserCircleIcon,
        },
      ],
    },
    {
      id: 3,
      name: '',
      items: [
        {
          id: 'all-teams',
          name: t('all-teams'),
          href: '/teams',
          icon: RectangleStackIcon,
        },
        {
          id: 'new-team',
          name: t('new-team'),
          href: '/teams?newTeam=true',
          icon: FolderPlusIcon,
        },
      ],
    },
  ];

  return (
  <DropdownMenu>
        <DropdownMenuTrigger>
           <button type="button"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border-none px-0 flex justify-center items-center gap-1"
            >
              <Avatar className="h-6 w-6 rounded-md">
                <AvatarImage src={data?.user?.image} alt={data?.user?.name} />
                <AvatarFallback className="rounded-md">CN</AvatarFallback>
              </Avatar>
            </button> 
            </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <ul
        
        className="dropdown-content w-full rounded px-2"
      >
        {menus.map(({ id, name, items }) => {
          return (
            <React.Fragment key={id}>
              {name && (
                <li
                  className="text-xs text-gray-500 py-1 px-2"
                  key={`${id}-name`}
                >
                  {name}
                </li>
              )}
              {items.map((item) => (
                <li
                  key={`${id}-${item.id}`}
                  
                >
                  <button type="button" onClick={() => {
                    if (document.activeElement) {
                      (document.activeElement).blur();
                    }
                  }}>
                  <Link href={item.href}>
                    <div className="flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none p-2 rounded text-sm font-medium gap-2 items-center">
                      <item.icon className="size-5" /> {item.name}
                    </div>
                  </Link>
                  </button>
                </li>
              ))}
              {name && <li className="divider m-0" key={`${id}-divider`} />}
            </React.Fragment>
          )
        })}
      </ul>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
     

     </DropdownMenu>
  );
};


