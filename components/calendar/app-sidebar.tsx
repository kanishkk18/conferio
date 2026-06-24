'use client';

import * as React from 'react';
import Link from 'next/link';
import { RiCheckLine } from '@remixicon/react';
import { useCalendarContext } from '@/components/calendar/event-calendar/calendar-context';
import { etiquettes } from '@/components/calendar/big-calendar';

import { NavUser } from '@/components/calendar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from './ui/sidebar';
import SidebarCalendar from '@/components/calendar/sidebar-calendar';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatBytes } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '../ui/button';
import {
  Video,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { parseISO } from 'date-fns';
import {
  FileArchiveIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  Trash2,
  TriangleAlert,
  VideoIcon,
} from 'lucide-react';
import {
  type FileMetadata,
  type FileWithPreview,
} from 'hooks/use-file-upload';
import { TeamSwitcher } from '../team-switcher';
import { AnimateIcon } from '../animate-ui/icons/icon';
import { Sparkles } from '../animate-ui/icons/sparkles';
import { Plus } from '../animate-ui/icons/plus';
import { SettingsIcon } from '../animate-ui/icons/settings';
import { SendIcon } from '../animate-ui/icons/send';
import { UsersIcon } from '../animate-ui/icons/users';

// const data = {
//   user: {
//     name: 'Sofia Safier',
//     email: 'sofia@safier.com',
//     avatar:
//       'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp6/user-01_l4if9t.png',
//   },
// };

interface ServerFile {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  ext: string;
  url: string;
  formattedSize: string;
  createdAt: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isColorVisible, toggleColorVisibility } = useCalendarContext();
  const { data, isLoading } = useQuery({
    queryKey: ['recent-files'],
    queryFn: async () => {
      const response = await fetch('/api/files/all?pageSize=5&pageNumber=1');
      if (!response.ok) throw new Error('Failed to fetch recent files');
      return response.json();
    },
  });
  const { data: session, status } = useSession();
  const { push } = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('UPCOMING');

    if (status === 'unauthenticated') {
      redirect('/auth/login');
    }

  const { data: meetings } = useQuery({
    queryKey: ['meetings', filter],
    queryFn: async () => {
      const response = await fetch(`/api/meeting/user/all?filter=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch meetings');
      return response.json();
    },
    enabled: !!session,
  });

  const cancelMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const response = await fetch(`/api/meeting/cancel/${meetingId}`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to cancel meeting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Your latest uploaded files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="gap-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-x-4">
                <div className="h-12 w-12 bg-muted animate-pulse rounded" />
                <div className="gap-y-2 flex-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const files = data?.files || [];

  const getFileIcon = (file: File | FileMetadata | ServerFile) => {
    const type =
      file instanceof File
        ? file.type
        : 'type' in file
          ? file.type
          : file.mimeType;
    if (type.startsWith('image/'))
      return <ImageIcon className="size-4 text-green-400" />;
    if (type.startsWith('video/'))
      return <VideoIcon className="size-4 text-red-500" />;
    if (type.startsWith('audio/'))
      return <HeadphonesIcon className="size-4 text-pink-500" />;
    if (type.includes('pdf'))
      return <FileTextIcon className="size-4 text-purple-500" />;
    if (type.includes('word') || type.includes('doc'))
      return <FileTextIcon className="size-4 text-blue-600" />;
    if (type.includes('excel') || type.includes('sheet'))
      return <FileSpreadsheetIcon className="size-4 text-yellow-500" />;
    if (type.includes('zip') || type.includes('rar'))
      return <FileArchiveIcon className="size-4 text-orange-500" />;
    return <FileTextIcon className="size-4" />;
  };

  return (
    <Sidebar
      variant="inset"
      {...props}
      className="dark h-screen scheme-only-dark max-lg:p-3 lg:pe-2 bg-[#080808]"
    >
      <SidebarHeader className="px-0 py-1">
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent className="gap-0 mt-1 pt-0 border-t dark:border-neutral-800 overflow-hidden">
        <SidebarGroup className="w-full min-w-full border-b py-2 px-0 dark:border-neutral-800">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1" className=''>
              <AccordionTrigger className="border-none px-0">
                Quick Actions
              </AccordionTrigger>
              <AnimateIcon animateOnHover>
                <AccordionContent className="border-none gap-y-0.5 flex flex-col px-0 py-[0.6rem]">
                  <div className="flex justify-center items-center !gap-x-0.5">
                    <Button
                      onClick={() => push('/meetings/page')}
                      variant="outline"
                      className="flex flex-grow px-2 py-0 bg-transparent/15 rounded-lg border-neutral-700"
                    >
                      <Plus className="opacity-60 " aria-hidden="true" />
                      <span className="text-xs">Meeting </span>
                      {/* <kbd className="bg-neutral-600 text-gray-200 ms-1 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                      ⌘m
                    </kbd> */}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() =>
                        push('https://ai.conferio.in')
                      }
                      className="flex flex-grow px-2 py-0 text-xs bg-transparent/15 rounded-lg border-neutral-700"
                    >
                      <Sparkles className=" opacity-60" aria-hidden="true" />
                      Ask AI
                      {/* <kbd className="bg-neutral-600 text-gray-200 ms-1 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                      ⌘m
                    </kbd> */}
                    </Button>
                  </div>
                  <div className="flex !gap-x-0.5">
                    <Button
                      variant="outline"
                      className="text-xs bg-transparent/15 rounded-lg border-neutral-700 flex px-2 py-0"
                    >
                      <UsersIcon className="-ms-1 opacity-60" /> Teams
                    </Button>

                    <Button
                      onClick={() => push('/settings/page')}
                      variant="outline"
                      className="text-xs flex px-2 py-0 bg-transparent/15 rounded-lg border-neutral-700"
                    >
                      <SettingsIcon className=" max-h-4 max-w-4 opacity-60" />{' '}
                      Settings
                    </Button>
                    <Button
                      onClick={() =>
                        push('https://conferio-mail.vercel.app')
                      }
                      className="text-xs flex px-2 py-0 bg-transparent/15 rounded-lg border-neutral-700"
                      variant="outline"
                    >
                      <SendIcon
                        className="-ms-1 opacity-60"
                        size={16}
                        aria-hidden="true"
                      />
                      Mail
                    </Button>
                  </div>
                </AccordionContent>
              </AnimateIcon>
            </AccordionItem>
          </Accordion>
        </SidebarGroup>

        <SidebarGroup className="w-full min-w-full p-0">
          <SidebarCalendar />
        </SidebarGroup>

        <SidebarGroup className="w-full min-w-full px-0">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="border-none px-0">
                Upcoming Meetings
              </AccordionTrigger>
              <AccordionContent className="border-none px-0 pt-2 pb-0">
                {meetings?.meetings?.length > 0 ? (
                  <div className="relative flex flex-col w-full items-start gap-2 border-none shadow-xs outline-none">
                    {meetings.meetings.slice(0, 2).map((meeting: any) => (
                      <div key={meeting.id} className="flex border-neutral-600 rounded-lg w-full flex-col grow items-start gap-0 p-2 bg-neutral-800 overflow-hidden">
                        <div className="flex w-full justify-between">
                          <Label className="text-xs font-medium">
                            {meeting.event.title.slice(0, 14)}
                          </Label>
                          <p className="text-gray-400 text-xs">
                            {(() => {
                              const now = new Date();
                              const diffMs =
                                parseISO(meeting.startTime).getTime() -
                                now.getTime();
                              if (diffMs > 0) {
                                const diffSec = Math.ceil(diffMs / 1000);
                                const diffMin = Math.ceil(diffSec / 60);
                                const diffHour = Math.ceil(diffMin / 60);
                                const diffDay = Math.ceil(diffHour / 24);
                                if (diffDay > 1) {
                                  return `${diffDay} Days left`;
                                } else if (diffHour > 1) {
                                  return `${diffHour} Hours left`;
                                } else if (diffMin > 1) {
                                  return `${diffMin} Min left`;
                                } else {
                                  return `${diffSec} Sec left`;
                                }
                              } else if (diffMs > -60000) {
                                return 'Now';
                              } else {
                                return 'Started';
                              }
                            })()}
                          </p>
                        </div>
                        <p className=" text-xs">
                          {meeting.additionalInfo.slice(0, 28) ||
                            'No additional information'}
                        </p>
                        <div
                          onClick={() =>
                            window.open(meeting.meetLink, '_blank')
                          }
                          className="flex cursor-pointer p-0 text-xs pt-1.5 justify-center items-center"
                        >
                          <Video className="text-red-500 size-4 font-normal mr-1" />{' '}
                          <p className="text-red-500">Join Meeting</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative flex flex-col w-full items-start gap-2 border-none shadow-xs outline-none">

                    <div className="flex border-neutral-600 rounded-lg w-full flex-col grow items-start gap-0 p-2 bg-neutral-800 overflow-hidden">
                      <div className="flex w-full justify-between">
                        <Label className="text-xs font-medium">
                          No Upcoming Meeting
                        </Label>
                      </div>
                      <div

                        className="flex cursor-pointer p-0 text-xs pt-1.5 justify-center items-center"
                      >
                        <Video className="text-red-500 size-4 font-normal mr-1" />{' '}
                        <p className="text-red-500">No Meeting To Join</p>
                      </div>
                    </div>

                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SidebarGroup>

        <SidebarGroup className="px-0 mt-2 py-1 border-t dark:border-neutral-800">
          <SidebarGroupLabel className="text-xs text-neutral-600 !px-1 !py-0">
            Recent Attachments
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Card className="w-full bg-transparent border-none">
              <CardContent className="p-0 w-full border-none bg-transparent">
                {files.length === 0 ? (
                  <div className="!space-y-1">

                    <div

                      className="flex items-center gap-x-3 p-2 rounded-lg border dark:border-neutral-800"
                    >
                      <div className="size-8 bg-neutral-800 rounded flex items-center justify-center">
                        {file.mimeType.startsWith('image/') ? (
                          <Image
                            src={file.url}
                            alt={file.originalName}
                            className="h-6 w-6 object-cover rounded"
                            height={100}
                            width={100}
                          />
                        ) : (
                          <div className="text-xs font-medium">
                            {file.ext.toUpperCase()}
                          </div>
                        )}

                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <p className="text-xs font-medium dark:text-white/80 truncate">
                          No File Uploaded
                        </p>
                        <p className="text-xs font-normal dark:text-neutral-600">
                          Please upload to see here
                        </p>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="space-y-1">
                    {files.slice(0, 4).map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-x-3 p-2 rounded-lg border dark:border-neutral-800"
                      >
                        <div className="h-8 w-8 bg-neutral-800 rounded flex items-center justify-center">
                          {/* {file.mimeType.startsWith('image/') ? (
                            <img
                              src={file.url}
                              alt={file.originalName}
                              className="h-6 w-6 object-cover rounded"
                            />
                          ) : (
                            <div className="text-xs font-medium">
                              {file.ext.toUpperCase()}
                            </div>
                          )} */}
                          {getFileIcon(file)}
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <p className="text-xs font-medium dark:text-white/80 truncate">
                            {file.originalName.slice(0, 16)}
                          </p>
                          <p className="text-xs font-normal dark:text-neutral-600">
                            {formatBytes(file.size)} •{' '}
                            {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  );
}
