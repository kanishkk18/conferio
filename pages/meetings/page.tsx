'use client';

import StatsCard from '@/components/ui/StatsCard';
import { Calendar } from '@/components/ui/OverviewCalendar';
import ChartCard from '@/components/ui/ChartCard';
import Mainsidebar from '@/components/ui/mainSideBar';
import Link from 'next/link';
import Image from 'next/image';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { parseISO } from 'date-fns';
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { Button } from '@/components/ui/button';
import CircularText from '@/components/ui/CircularTextLoader';
import { ClipsMeetingCard } from 'pages/clips';
import { Clip } from '@prisma/client';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { ArrowRight } from '@/components/animate-ui/icons/arrow-right';
import { ScrollArea } from '@/components/ui/scroll-area';
import TeamMeetingCard from "@/components/TeamMeetingCard";
import DashboardHeader from '@/components/ui/overviewHeader';
import MeetingStatsCard from '@/components/calendar/MeetingStatsCard';
import NewMeetingModal from './new';
import BrandAiStudioIcon from '@/components/animate-ui/icons/brand-aistudio-icon';
import { QuickSchedule } from '@/components/quick-meeting';
import { Header } from '@/components/doc-components/Header';


const Meetings = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter] = useState('UPCOMING');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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

 
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    }
 

  // UPDATED: Use the new my-meetings API that includes team meetings
  const { data: meetingsData, isLoading } = useQuery({
    queryKey: ['my-meetings', filter],
    queryFn: async () => {
      const response = await fetch(`/api/meetings/my-meetings?filter=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch meetings');
      return response.json();
    },
    enabled: !!session,
  });

  // Extract meetings array from response
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
      queryClient.invalidateQueries({ queryKey: ['AI Notes'] });
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

  // const testCron = async () => {
  //   const res = await fetch('/api/cron/ai-notetaker', {
  //     headers: { Authorization: 'Bearer +7qjS/wHtQKd9qYsrXLt0ZymgihjvUb3izLa4ePUzCg=' }
  //   });
  //   const data = await res.json();
  //   console.log('Cron result:', data);
  //   alert(`Processed: ${data.processed} meetings`);
  // };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularText
          text="CONFERIO*CALLS*"
          onHover="speedUp"
          spinDuration={5}
          className="custom-class"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full h-full !max-h-screen !overflow-y-hidden">
      <Mainsidebar />
      <ScrollArea className="h-full !max-h-full w-full flex flex-col dark:bg-black">
        <Header />
        <ResizablePanelGroup direction="horizontal" className="max-w-full w-full max-h-screen">
          <ResizablePanel defaultSize={50} minSize={50} className="pt-8 px-4 dark:bg-[#060606]">
            <div className="flex items-center justify-between mb-[1.8rem]">
              <DashboardHeader name="" />
              <NewMeetingModal>
                <div className="flex justify-center items-center gap-2 font-sans font-semibold font-xs">
                  <BrandAiStudioIcon className="h-4 w-4 rotate-90" /> <p>AI Notes</p>
                </div>
              </NewMeetingModal>
              {/* <button onClick={testCron} className=" dark:bg-[#3149d1] bg-[#ffffff] hover:bg-[#5C48BC] rounded-sm  ">
                🧪 Test Cron
              </button> */}
            </div>
            <div className="flex w-full gap-4">
              <div className="max-h-full h-full">
                <div className="w-fit flex gap-4">
                  <div className="col-span-2">
                    <MeetingStatsCard userId={session?.user?.id as string} />
                  </div>
                  <div className="col-span-2">
                    <StatsCard
                      title="Currently Booked"
                      value={meetings.length || 0}
                      color="default"
                    />
                  </div>
                </div>
                <div className="gap-4 mt-3 min-h-full">
                  <div className="col-span-4">
                    <div className="green-card p-5 h-[158px] relative overflow-hidden">
                      <div className="absolute inset-0">
                        <svg width="100%" height="100%" className="opacity-10">
                          <pattern
                            id="pattern-zigzag"
                            width="30"
                            height="30"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M0 15 L15 0 L30 15 L15 30 Z"
                              fill="none"
                              stroke="white"
                              strokeWidth="1"
                            />
                          </pattern>
                          <rect width="100%" height="100%" fill="url(#pattern-zigzag)" />
                        </svg>
                      </div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <h3 className="text-3xl font-semibold text-white -mt-2 mb-2 z-50 [text-shadow:_2px_2px_4px_rgba(0,0,0,0.6)]">
                            Schedule <br /> a meeting
                          </h3>
                          <Image
                            className="rounded-t-[2.9rem] absolute -right-24"
                            src="https://res.cloudinary.com/kanishkkcloud18/image/upload/v1747576462/CONFERIO/evmztakxitrunclugusx.png"
                            alt=""
                            height={1000}
                            width={1000}
                          />
                        </div>

                        <QuickSchedule
                          onScheduled={() => console.log('Meeting scheduled!')}
                        >
                          <Button
                            variant="secondary"
                            className="text-sm px-2 py-1 mt-1.5"
                          >
                            Do it now
                          </Button>
                        </QuickSchedule>

                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <ChartCard />

              <div className="flex w-[22%] flex-col gap-3">
                <ClipsMeetingCard />

                <div className="h-full">
                  {meetings.length > 0 ? (
                    <div className="px-4 py-2 gap-4 flex bg-gradient-to-br from-[#3793FF] to-[#0017E4] rounded-xl h-full flex-col">
                      {meetings.slice(0, 1).map((meeting: any) => (
                        <div className="space-y-4" key={meeting.id}>
                          <div className="flex flex-col justify-start items-start">
                            <h1 className="text-lg text-white font-semibold [text-shadow:_1px_1px_4px_rgba(0,0,0,0.6)]">
                              {meeting.event?.title?.slice(0, 12) || 'Meeting'}
                            </h1>
                            <p className="text-sm font-semibold text-white">
                              {(() => {
                                const now = new Date();
                                const diffMs = parseISO(meeting.startTime).getTime() - now.getTime();
                                if (diffMs > 0) {
                                  const diffSec = Math.ceil(diffMs / 1000);
                                  const diffMin = Math.ceil(diffSec / 60);
                                  const diffHour = Math.ceil(diffMin / 60);
                                  const diffDay = Math.ceil(diffHour / 24);
                                  if (diffDay > 1) return `${diffDay} Days left`;
                                  if (diffHour > 1) return `${diffHour} Hours left`;
                                  if (diffMin > 1) return `${diffMin} Min left`;
                                  return `${diffSec} Sec left`;
                                } else if (diffMs > -60000) return 'Now';
                                return 'Started';
                              })()}
                            </p>
                          </div>
                          <Separator className="bg-white w-[4vw] h-[0.5px] dark:bg-white" />
                          <div className="flex text-center justify-between w-full items-end">
                            <div className="group relative">
                              <AnimatePresence mode="popLayout">
                                {hoveredIndex === meeting.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.6 }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                      scale: 1,
                                      transition: { type: 'spring', stiffness: 260, damping: 10 },
                                    }}
                                    exit={{ opacity: 0, y: 20, scale: 0.6 }}
                                    style={{ translateX, rotate, whiteSpace: 'nowrap' }}
                                    className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl"
                                  >
                                    <div className="relative z-30 text-base font-bold text-white">
                                      {meeting.isHost ? 'You (Host)' : meeting.guestName}
                                    </div>
                                    <div className="text-xs text-white">
                                      {meeting.meetingAttendees?.length > 0
                                        ? `${meeting.meetingAttendees.length} attendees`
                                        : meeting.guestEmail}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              <Image
                                onMouseMove={handleMouseMove}
                                height={40}
                                width={40}
                                src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=3534&q=80"
                                alt={meeting.guestName}
                                className="relative !m-0 h-10 w-10 rounded-full border-2 border-white object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105"
                              />
                            </div>

                            <div
                              onClick={() => {
                                trackJoinMutation.mutate(meeting.id);
                                window.open(meeting.meetLink, '_blank');
                              }}
                              className="text-sm text-white bg-black/70 rounded-full cursor-pointer"
                            >
                              <AnimateIcon animateOnHover>
                                <ArrowRight className="h-7 w-7 p-1 -rotate-45" />
                              </AnimateIcon>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 pt-2 h-full gap-4 flex bg-gradient-to-br from-[#3793FF] to-[#0017E4] rounded-xl min-h-full flex-col">
                      <div className="flex flex-col justify-start items-start">
                        <h1 className="text-md text-white font-semibold [text-shadow:_1px_1px_4px_rgba(0,0,0,0.6)]">
                          No {filter.toLowerCase()} meetings
                        </h1>
                        <p className="text-sm text-white text-start">
                          {filter === 'UPCOMING'
                            ? "You don't have any meeting scheduled."
                            : `No ${filter.toLowerCase()} meetings found.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* <div className="w-screen absolute top-[438px] bg-red-400 h-[0.1]"></div> */}

            <div className="min-w-full w-full gap-6 mt-2">
              <div className="flex justify-between items-center py-4 px-2">
                <h3 className="text-2xl font-semibold">Upcoming Meetings</h3>
                <Link href="/scheduled/page" className="flex justify-center items-center gap-2">
                  <Button variant="link" className="text-sm text-blue-500 hover:underline p-0">
                    View All
                  </Button>
                  <AnimateIcon animateOnHover>
                    <ArrowRight className="h-4 w-4" />
                  </AnimateIcon>
                </Link>
              </div>

              {meetings.length > 0 ? (
                <div className="flex gap-4 h-full w-full">
                  {meetings.slice(0, 2).map((meeting: any) => (
                    <TeamMeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onCancel={(id) => cancelMeetingMutation.mutate(id)}
                      filter={filter}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 h-full w-full">
                  <div className="flex !gap-x-2 w-full h-full justify-center">
                    <div className="p-4 flex-grow bg-[#F4F4F5] dark:bg-[#101012] rounded-xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="dark:text-white font-semibold text-md mb-2">
                            No {filter.toLowerCase()} meetings
                          </h4>
                          <p className="dark:text-gray-400 text-xs">
                            {filter === 'UPCOMING'
                              ? "You don't have any upcoming meetings scheduled."
                              : `No ${filter.toLowerCase()} meetings found.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle className="dark:bg-neutral-900 !h-screen !max-h-screen w-[0.5px]" />
          <ResizablePanel defaultSize={25} maxSize={40} className="mx-auto !max-h-full h-full ">
            <Calendar />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ScrollArea>
    </div>
  );
};

export default Meetings;

