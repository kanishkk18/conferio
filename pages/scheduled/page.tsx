'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Clock, EllipsisIcon, User, Video, X, Loader2, CalendarClock } from 'lucide-react';
import { format, isPast, isToday, differenceInMinutes } from 'date-fns';
import { ArrowRight, Search } from 'lucide-react';
import Mainsidebar from '@/components/ui/mainSideBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Fragment } from 'react';
import { Trash2Icon } from 'lucide-react';
import { Loader } from '@/components/loader';
import { MapPin, MessageSquare, Users } from 'lucide-react';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard';
import { ListIcon } from '@/components/animate-ui/icons/list';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Expandable,
  ExpandableCard,
  ExpandableCardContent,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableContent,
  ExpandableTrigger,
} from '@/components/ui/expandable';

import {
  BoltIcon,
  ChevronDownIcon,
  CopyPlusIcon,
  FilesIcon,
  Layers2Icon,
  TrashIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import Image from 'next/image';
import CircularText from '@/components/ui/CircularTextLoader';
import { Header } from '@/components/doc-components/Header';
import { GooeyInput } from '@/components/ui/gooey-input';
import { SearchInput } from '@/components/ui/searchInput';
import { PlusIcon } from '@/components/animate-ui/icons/plus';
import { ClipboardList } from '@/components/animate-ui/icons/clipboard-list';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import { Clapperboard } from '@/components/animate-ui/icons/clapperboard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LazyLoader from '@/components/loader/lazyloader';
import { CircleX } from '@/components/animate-ui/icons/circle-x';
import HistoryCircleIcon from '@/components/ui/history-circle-icon';
import NewMeetingModal from 'pages/meetings/new';
import BrandAiStudioIcon from '@/components/animate-ui/icons/brand-aistudio-icon';

// Types
interface MeetingAttendee {
  id: string;
  email: string;
  name?: string;
  image?: string;
  isExternal: boolean;
  status: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface Meeting {
  id: string;
  title?: string;
  guestName: string;
  guestEmail: string;
  description?: string;
  startTime: string;
  endTime: string;
  meetLink: string;
  status: string;
  isHost: boolean;
  myRsvpStatus: string | null;
  attendeeCount: number;
  isTeamMeeting: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  meetingAttendees?: MeetingAttendee[];
  teamMeetingLink?: {
    shareToken: string;
    team?: {
      name: string;
    };
  };
  event?: {
    title: string;
    duration: number;
    locationType: string;
  };
  additionalInfo?: string;
}

export default function Meetings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );

  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );
  const handleMouseMove = (event: any) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED'>('ALL');

  const filterLabel = {
    ALL: 'All',
    UPCOMING: 'Upcoming',
    PAST: 'Past',
    CANCELLED: 'Cancelled',
  };

  if (status === 'unauthenticated') {
    redirect('/auth/login');
  }

  const { data: meetingsData, isLoading } = useQuery({
    queryKey: ['my-meetings', filter],
    queryFn: async () => {
      const response = await fetch(`/api/meetings/my-meetings?filter=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch meetings');
      return response.json();
    },
    enabled: !!session,
  });

  const meetings = meetingsData?.meetings || [];

  const cancelMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const response = await fetch(`/api/meeting/cancel/${meetingId}`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to cancel meeting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-meetings'] });
    },
  });

  const trackJoinMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      await fetch('/api/meetings/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-meetings'] });
    }
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-black">
        <LazyLoader/>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/auth/login');
  }

  const getAttendees = (meeting: Meeting) => {
    return meeting.meetingAttendees || [{
      id: 'guest',
      email: meeting.guestEmail,
      name: meeting.guestName,
      isExternal: !meeting.isTeamMeeting,
      status: 'pending'
    }];
  };

  const isMeetingUpcoming = (meeting: Meeting) => {
    const startTime = new Date(meeting.startTime);
    return !isPast(startTime) && meeting.status === 'SCHEDULED';
  };

  const isMeetingNow = (meeting: Meeting) => {
    const startTime = new Date(meeting.startTime);
    return isToday(startTime) && differenceInMinutes(startTime, new Date()) < 15 && differenceInMinutes(startTime, new Date()) > -15;
  };

  const filterTabClass = (isActive: boolean) =>
    `relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground ${isActive ? 'dark:after:bg-white after:bg-primary text-foreground' : 'dark:text-[#7B7B7B] text-muted-foreground'}`;

  return (
    <div className="flex w-full max-h-screen h-screen dark:bg-black !overflow-y-hidden">
      <Mainsidebar />
      {meetings.length > 0 ? (
        <div className="flex flex-col w-full h-full overflow-y-scroll scrollbar-thin2">
          <Header />
          <Tabs defaultValue="modern" className="w-full">
            <div className="flex !justify-between items-center pb-1 pt-3 px-4 dark:bg-[#060606] border-b dark:border-[#181818]">
              <div className="mb-1 h-auto gap-2 rounded-none bg-transparent px-0 py-0.5 text-foreground flex">
                <button
                  onClick={() => setFilter('ALL')}
                  className={filterTabClass(filter === 'ALL')}
                >
                  All
                </button>
                <AnimateIcon animateOnHover>
                  <button
                    onClick={() => setFilter('UPCOMING')}
                    className={filterTabClass(filter === 'UPCOMING')}
                  >
                    <CalendarClock
                      className="-ms-0.5 dark:text-[#7B7B7B] mr-1"
                      size={16}
                      aria-hidden="true"
                    />
                    Upcoming
                  </button>
                </AnimateIcon>

                <AnimateIcon animateOnHover>
                  <button
                    onClick={() => setFilter('PAST')}
                    className={filterTabClass(filter === 'PAST')}
                  >
                    <HistoryCircleIcon
                      className="-ms-0.5 dark:text-[#7B7B7B] mr-1"
                      size={16}
                      aria-hidden="true"
                    />
                    Past
                  </button>
                </AnimateIcon>
                <AnimateIcon animateOnHover>
                  <button
                    onClick={() => setFilter('CANCELLED')}
                    className={filterTabClass(filter === 'CANCELLED')}
                  >
                    <CircleX
                      className="-ms-0.5 dark:text-[#7B7B7B] mr-1"
                      size={18}
                      aria-hidden="true"
                    />
                    Cancelled
                  </button>
                </AnimateIcon>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <NewMeetingModal className='!rounded-xl !h-8 dark:bg-[#111111] !px-2'>  
                <div className="flex justify-center items-center gap-2 font-sans font-semibold font-xs">
                  <BrandAiStudioIcon className="h-4 w-4 rotate-90" /> <p>AI Notes</p>
                </div>
              </NewMeetingModal>
              <SearchInput placeholder="Search..." className='!h-8 !py-0' />
                  <AnimateIcon animateOnHover className='!px-0 !py-0'>
                    <TabsList className="!px-0 !py-0 h-8 border border-[#262626]">
                      <TabsTrigger value="modern" className='rounded-r-none'><LayoutDashboard /></TabsTrigger>
                      <TabsTrigger value="table" className='rounded-l-none'><ListIcon /></TabsTrigger>
                    </TabsList>
                  </AnimateIcon>
                </div>
              </div>
            </div>

            <TabsContent
              value="modern"
              className="w-full py-4 !pl-6 pr-4 flex flex-wrap gap-3.5 justify-start items-start"
            >
              {meetings.map((meeting: Meeting) => {
                const attendees = getAttendees(meeting);
                const isUpcoming = isMeetingUpcoming(meeting);
                const isNow = isMeetingNow(meeting);
                const displayTitle = meeting.event?.title || meeting.title || 'Meeting';

                return (
                  <Expandable
                    expandDirection="both"
                    className='w-fit'
                    expandBehavior="push"
                    initialDelay={0.2}
                    onExpandStart={() => console.log('Expanding meeting card...')}
                    onExpandEnd={() => console.log('Meeting card expanded!')}
                    key={meeting.id}
                  >
                    {({ isExpanded }) => (
                      <ExpandableTrigger>
                        <ExpandableCard
                          className="w-full"
                          collapsedSize={{ width: 274, height: 205 }}
                          expandedSize={{ width: 420, height: 390 }}
                          hoverToExpand={false}
                          expandDelay={100}
                          collapseDelay={500}
                        >
                          <ExpandableCardHeader>
                            <div className="flex justify-between items-start w-full ">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    variant="secondary"
                                    className="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-100"
                                  >
                                    {meeting.event?.duration || 30} min{' '}
                                  </Badge>
                                  {meeting.isHost ? (
                                    <Badge variant="outline" className="text-xs">Host</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">Guest</Badge>
                                  )}
                                  {meeting.isTeamMeeting && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Users className="size-3 mr-1" />
                                      Team
                                    </Badge>
                                  )}
                                  {isNow && (
                                    <Badge className="bg-green-500 text-white text-xs animate-pulse">
                                      LIVE NOW
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-xl text-gray-800 dark:text-white">
                                  {displayTitle.slice(0, 12)}
                                </h3>
                              </div>
                             
                            </div>
                          </ExpandableCardHeader>

                          <ExpandableCardContent>
                            <div className="flex flex-col items-start justify-between mb-2">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <Clock className="h-4 w-4 mr-1" />
                                {format(new Date(meeting.startTime), 'h:mm a')} -{' '}
                                {format(new Date(meeting.endTime), 'h:mm a')}
                              </div>

                              <ExpandableContent preset="blur-md">
                                <div className="flex items-center pt-1 text-sm text-gray-600 dark:text-gray-300">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span className="flex">
                                    <>
                                      <span className=" font-normal text-xs">
                                        {meeting.event?.locationType || 'Online'}
                                      </span>
                                    </>
                                  </span>
                                </div>
                              </ExpandableContent>
                            </div>
                            <ExpandableContent
                              preset="blur-md"
                              stagger
                              staggerChildren={0.2}
                            >
                              <p className="text-sm text-gray-700 dark:text-gray-200 mb-4 ">
                                {meeting.additionalInfo ? (
                                  meeting.additionalInfo
                                ) : (
                                  <Fragment>
                                    <span className="block font-light text-sm mb-1 dark:text-white text-[rgba(26,26,26,0.61)]">
                                      Nothing to share about the meeting.
                                    </span>
                                  </Fragment>
                                )}
                              </p>
                              <div className="mb-4">
                                <h4 className="font-medium text-sm text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                                  <Users className="h-4 w-4 mr-2" />
                                  Attendees ({attendees.length}):
                                </h4>
                                <div className="flex -space-x-1.5 flex-wrap">
                                  {attendees.map((attendee: MeetingAttendee, idx: number) => (
                                    <div
                                      className="group relative -mr-4 !z-[999]"
                                      key={attendee.id || idx}
                                      onMouseEnter={() => setHoveredIndex(attendee.id)}
                                      onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                      <AnimatePresence mode="popLayout">
                                        {hoveredIndex === attendee.id && (
                                          <motion.div
                                            initial={{
                                              opacity: 0,
                                              y: 20,
                                              scale: 0.6,
                                            }}
                                            animate={{
                                              opacity: 1,
                                              y: 0,
                                              scale: 1,
                                              transition: {
                                                type: 'spring',
                                                stiffness: 260,
                                                damping: 10,
                                              },
                                            }}
                                            exit={{ opacity: 0, y: 20, scale: 0.6 }}
                                            style={{
                                              translateX: translateX,
                                              rotate: rotate,
                                              whiteSpace: 'nowrap',
                                            }}
                                            className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2  text-xs shadow-xl"
                                          >
                                            <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                                            <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                                            <div className="relative z-50 text-base font-bold text-white">
                                              {attendee.name || attendee.email}
                                            </div>
                                            <div className="text-xs text-white">
                                              {attendee.isExternal ? 'External Guest' : 'Team Member'}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                              {attendee.email}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                      <Image
                                        onMouseMove={handleMouseMove}
                                        height={100}
                                        width={100}
                                        src={attendee.user?.image || attendee.image || "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=3534&q=80"}
                                        alt={attendee.name || attendee.email}
                                        className="relative !m-0 h-10 w-10 rounded-full border-2 border-white object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                {meeting.meetLink && isUpcoming && (
                                  <Button
                                    className="w-full bg-white hover:bg-red-700 text-black dark:text-black dark:bg-white"
                                    onClick={() => {
                                      trackJoinMutation.mutate(meeting.id);
                                      window.open(meeting.meetLink, '_blank');
                                    }}
                                  >
                                    <Video className="h-4 w-4 mr-0" />
                                    Join Meeting
                                  </Button>
                                )}

                                <div className="flex items-center justify-center gap-2 w-full">
                                  {isExpanded && (
                                    <Link href="/chat" className="w-full">
                                      <Button
                                        variant="outline"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:text-white"
                                      >
                                        <MessageSquare className="h-4 w-4 mr-1" />
                                        Open Chat
                                      </Button>
                                    </Link>
                                  )}

                                  {isUpcoming && meeting.isHost && (
                                    <Button
                                      variant="outline"
                                      type="button"
                                      className="w-full dark:text-white dark:bg-red-500"
                                      onClick={() =>
                                        cancelMeetingMutation.mutate(meeting.id)
                                      }
                                      disabled={cancelMeetingMutation.isPending}
                                    >
                                      {cancelMeetingMutation.isPending ? (
                                        <Loader color="white" />
                                      ) : (
                                        <Fragment>
                                          <Trash2Icon className='text-white'/>
                                          <span>Cancel</span>
                                        </Fragment>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </ExpandableContent>
                          </ExpandableCardContent>
                          <ExpandableCardFooter>
                            <div className="flex items-center gap-6 justify-between w-full text-sm text-gray-600 dark:text-gray-300">
                              <span
                                className={` px-2 py-1 rounded-full text-xs ${meeting.status === 'SCHEDULED'
                                  ? 'bg-green-100 text-green-800'
                                  : meeting.status === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                  }`}
                              >
                                {meeting.status}
                              </span>
                              <span className='text-sm w-fit line-clamp-1'>
                                {isUpcoming ? 'Next : ' : ''}
                                {format(new Date(meeting.startTime), 'EE, d MMM - yyyy')}
                              </span>
                            </div>
                          </ExpandableCardFooter>
                        </ExpandableCard>
                      </ExpandableTrigger>
                    )}
                  </Expandable>
                );
              })}
            </TabsContent>

            <TabsContent value="table">
              <div className="w-full py-2 px-6">
                {meetings.length > 0 ? (
                  <div className="flex flex-col divide-y divide-border dark:hover:bg-black/40 rounded-lg border dark:border-neutral-800 w-full shadow-sm">
                    <div className="p-3 rounded-t-lg bg-gray-200 dark:bg-neutral-900 px-5 uppercase font-semibold text-sm">
                      {filter === 'ALL' ? 'All Meetings' : filterLabel[filter]}
                    </div>
                    {meetings.map((meeting: Meeting) => {
                      const isUpcoming = isMeetingUpcoming(meeting);
                      const attendees = getAttendees(meeting);

                      return (
                        <Card
                          key={meeting.id}
                          className="rounded-lg flex w-full justify-between items-center bg-transparent border-none shadow-none dark:hover:bg-black/40 transition"
                        >
                          <div className="flex justify-start gap-20 items-center flex-grow">
                            <CardHeader className="space-y-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                {format(
                                  new Date(meeting.startTime),
                                  'EEE, dd MMM '
                                )}
                              </CardTitle>
                              <CardDescription className=" flex flex-col sm:flex-row sm:items-center gap-3">
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                  {format(new Date(meeting.startTime), 'h:mm a')} -{' '}
                                  {format(new Date(meeting.endTime), 'h:mm a')}
                                </span>
                              </CardDescription>
                              <div className="flex items-center gap-2">
                                {meeting.isHost ? (
                                  <Badge variant="outline" className="text-xs">Host</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">Guest</Badge>
                                )}
                                {meeting.isTeamMeeting && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Users className="size-3 mr-1" />
                                    Team
                                  </Badge>
                                )}
                              </div>
                              {isUpcoming && meeting.meetLink && (
                                <Button
                                  className="bg-transparent"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    trackJoinMutation.mutate(meeting.id);
                                    window.open(meeting.meetLink, '_blank');
                                  }}
                                >
                                  <Video className=" size-4  mr-1" />
                                  Join Meeting
                                </Button>
                              )}
                            </CardHeader>

                            <CardContent className="px-4 ">
                              <div className="space-y-2">
                                <h1 className="text-md font-semibold dark:text-white">
                                  {meeting.event?.title || meeting.title || 'Meeting'} between{' '}
                                  {session?.user?.name} and {meeting.guestName}
                                </h1>

                                {meeting.additionalInfo && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {meeting.additionalInfo}
                                  </p>
                                )}

                                <div className="flex items-center gap-2 mt-2">
                                  <Users className="size-4 text-muted-foreground" />
                                  <div className="flex -space-x-2">
                                    {attendees.slice(0, 5).map((attendee: MeetingAttendee, idx: number) => (
                                      <Avatar key={attendee.id || idx} className="size-6 border-2 border-background">
                                        <AvatarImage src={attendee.user?.image || attendee.image || "https://i.pinimg.com/736x/46/67/f6/4667f65735ae83f8d12d74ef7e0ba982.jpg"} />
                                        <AvatarFallback className="text-[10px]">
                                          {(attendee.name || attendee.email).charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {attendees.length > 5 && (
                                      <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                                        +{attendees.length - 5}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {attendees.length} attendee{attendees.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                          <CardFooter className="flex flex-grow justify-end items-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="bg-transparent hover:bg-muted/30 p-1 px-2.5 dark:border-neutral-600 rounded-lg"
                                >
                                  <EllipsisIcon
                                    className=" opacity-60"
                                    size={16}
                                    aria-hidden="true"
                                  />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="mr-6">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                  <DropdownMenuItem>
                                    <CopyPlusIcon
                                      size={16}
                                      className="opacity-60"
                                      aria-hidden="true"
                                    />
                                    Copy
                                  </DropdownMenuItem>
                                  {meeting.isHost && isUpcoming && (
                                    <DropdownMenuItem>
                                      <BoltIcon
                                        size={16}
                                        className="opacity-60"
                                        aria-hidden="true"
                                      />
                                      Edit
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Manage</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                  <DropdownMenuItem>
                                    <Layers2Icon
                                      size={16}
                                      className="opacity-60"
                                      aria-hidden="true"
                                    />
                                    Group
                                  </DropdownMenuItem>

                                  {meeting.isHost && isUpcoming && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        cancelMeetingMutation.mutate(meeting.id)
                                      }
                                      disabled={cancelMeetingMutation.isPending}
                                    >
                                      <TrashIcon size={16} aria-hidden="true" />
                                      Cancel
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      No {filter.toLowerCase()} meetings
                    </h2>
                    <p className="text-muted-foreground">
                      {filter === 'ALL'
                        ? "You don't have any meetings scheduled."
                        : filter === 'UPCOMING'
                          ? "You don't have any upcoming meetings scheduled."
                          : `No ${filter.toLowerCase()} meetings found.`}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen max-h-[100%] w-full  relative">
          <div
            className="flex flex-col items-center justify-center
               h-full w-full text-center z-50"
          >
            <Image
              src="https://i.pinimg.com/736x/65/8a/ba/658abaa1446021453f36394a838372bd.jpg"
              alt={'Create events'}
              className="w-auto rounded-md h-[150px] mb-3"
              height={1000}
              width={1000}
            />

            <p className="text-zinc-400 font-medium mb-1">No scheduled meetings yet</p>

            <p className="text-zinc-600 text-sm">Schedule your meetings now</p>
            <div className="mt-2">

              <AnimateIcon animateOnHover>
                <Button
                  variant="outline"
                  size="sm"
                  className="aspect-square flex justify-center text-center items-center max-sm:p-0 text-sm bg-yellow-500 dark:bg-blue-700 text-white"
                >
                  <PlusIcon className="opacity-1"
                    size={16}
                    aria-hidden="true" />
                  <span className="max-sm:sr-only">Schedule now</span>
                </Button>

              </AnimateIcon>

            </div>
          </div>
          <div className="absolute inset-0 z-10 h-full w-full items-center [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

        </div>
      )}
    </div>
  );
}