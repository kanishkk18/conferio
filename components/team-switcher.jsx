'use client';

import * as React from 'react';
import { ChevronsUpDown, Plus } from 'lucide-react';
import {
  ChevronUpDownIcon,
  FolderIcon,
  FolderPlusIcon,
  RectangleStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import useTeams from 'hooks/useTeams';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { maxLengthPolicies } from '@/lib/common';
import Image from 'next/image';
import { Button } from './ui/button';

export function TeamSwitcher() {
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
          <DropdownMenuTrigger asChild>
            <Button
             variant="ghost"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground px-0 min-w-full w-full"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg dark:bg-[#333] bg-sidebar-primary text-sidebar-primary-foreground">
                <Image
                  src="/logo-transparent.png"
                  alt="logo"
                  className="p-1 rounded-md h-8 w-8"
                  height={1000}
                  width={1000}
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentTeam?.name ||
                    data?.user?.name?.substring(
                      0,
                      maxLengthPolicies.nameShortDisplay
                    )}{' '}
                </span>
                {/* <span className="truncate text-xs">plan</span> */}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 ml-60 -mt-10 rounded-lg"
            align="start"
            sideOffset={4}
          >
            <ul
              
              className="dropdown-content dark:border-gray-600 shadow-md bg-base-100 w-full rounded"
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
                            document.activeElement.blur();
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
                    {name && (
                      <li className="divider m-0" key={`${id}-divider`} />
                    )}
                  </React.Fragment>
                );
              })}
            </ul>
          </DropdownMenuContent>
        </DropdownMenu>
  );
}
