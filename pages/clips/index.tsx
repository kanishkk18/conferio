'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSession, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { GetServerSideProps } from 'next';
import ClipGrid from '@/components/clips/ClipGrid';
import ClipList from '@/components/clips/ClipList';
import { Clip } from '@prisma/client';
import Mainsidebar from '@/components/ui/mainSideBar';
import ClipButton from '@/components/clips/clipButton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar1, Loader2, Video } from 'lucide-react';
import { Search } from 'lucide-react';
import { useSSE } from 'hooks/useSSE';
// import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { ArrowRight } from '@/components/animate-ui/icons/arrow-right';
import { Clapperboard } from '@/components/animate-ui/icons/clapperboard';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
// import { PhoneCallIcon } from '@/components/animate-ui/icons/phone-call';
import { ClipboardList } from '@/components/animate-ui/icons/clipboard-list';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard';
import { ListIcon } from '@/components/animate-ui/icons/list';
import { Plus } from "@/components/animate-ui/icons/plus";
import MeetingCard from '@/components/notetaker/MeetingCard';
import { MeetingExpandableCard } from "@/components/notetaker/MeetingExpandableCard"
import { Header } from '@/components/doc-components/Header';
import LazyLoader from '@/components/loader/lazyloader';
import Image from 'next/image';
import NewMeetingModal from 'pages/meetings/new';

interface DashboardProps {
  initialClips: Clip[];
}

interface Meeting {
  id: string;
  meetingName: string | null;
  meetingUrl: string;
  platform: string | null;
  status: string;
  duration: number | null;
  createdAt: string;
  speakers: string[];
  summary: string | null;
}

const EMPTY_CLIPS: Clip[] = []

export default function Clips({ initialClips }: DashboardProps) {
  const { data: session } = useSession();
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

   useSSE((data) => {
    if (data.type === 'new-clip') {
      setClips((prev) => {
        if (prev.find((c) => c.id === data.clip.id)) return prev;
        return [data.clip, ...prev];
      });
    }
  });

  const refreshClips = async () => {
    const response = await fetch('/api/clips');
    const data = await response.json();
    setClips(Array.isArray(data) ? data : data.data || []);
  };

  const videoClips = clips.filter((c) => c.type === 'video' || c.type === 'both');
  const audioClips = clips.filter((c) => c.type === 'audio');

  if (!session) {
    return <div>Please sign in to access the Clips</div>;
  }

  return (
    <div className=" flex max-h-screen w-full dark:bg-[#000000] !overflow-hidden">
      <Mainsidebar />
      <ScrollArea className="flex-1 flex flex-col overflow-x-auto pb-0">
        <div className="flex-1 flex flex-col">
          <Header />
          <Tabs defaultValue="all">
            <div className="flex !justify-between items-center pb-0 pt-5 px-4">
              <TabsList className="mb-1 h-auto gap-2 rounded-none !bg-transparent px-0 py-1 text-foreground">
                <TabsTrigger
                  value="all"
                  className="relative dark:text-[#7B7B7B] after:absolute bg-transparent border-none after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:after:bg-white data-[state=active]:hover:bg-accent"
                >
                  All
                </TabsTrigger>
                <AnimateIcon animateOnHover>
                  <TabsTrigger
                    value="video"
                    className="relative dark:text-[#7B7B7B] after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                  >
                    <Clapperboard
                      className="-ms-0.5 dark:text-[#7B7B7B] "
                      aria-hidden="true"
                    />
                    Video Clips
                    <Badge
                      className="w-fit bg-primary/15 px-1"
                      variant="secondary"
                    >
                      {videoClips.length}
                    </Badge>
                  </TabsTrigger>
                </AnimateIcon>

                {/*
                <AnimateIcon animateOnHover> <TabsTrigger
                  value="tab-5"
                  className="relative after:absolute dark:text-[#7B7B7B] after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                >
                  <PhoneCallIcon
                    className="-ms-0.5  dark:text-[#7B7B7B]"
                    size={16}
                    aria-hidden="true"
                  />
                  SyncUps
                </TabsTrigger>
                </AnimateIcon> */}
        <AnimateIcon animateOnHover> 
          <TabsTrigger
            value="audio"
            className="relative dark:text-[#7B7B7B] after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
          >
            <AudioLines
              className="-ms-0.5 dark:text-[#7B7B7B]"
              size={16}
              aria-hidden="true"
            />
            Voice Clips
            <Badge
              className="w-fit bg-primary/15 px-1"
              variant="secondary"
            >
              {audioClips.length}
            </Badge>
          </TabsTrigger>
        </AnimateIcon>
                <AnimateIcon animateOnHover>
                  <TabsTrigger
                    value="notetaker"
                    className="relative after:absolute dark:text-[#7B7B7B] after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                  >
                    <ClipboardList
                      className="-ms-0.5  dark:text-[#7B7B7B]"
                      size={18}
                      aria-hidden="true"
                    />
                    AI Notetaker
                  </TabsTrigger>
                </AnimateIcon>
              </TabsList>

              <div className=" flex items-center justify-between">


                <div className="flex items-center gap-2">
                  {/* <button type="button" className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <Search className="size-4 text-muted-foreground" />
                  </button> */}

                  <AnimateIcon animateOnHover className="flex flex-col items-center ">
                    <TabsList className='dark:bg-[rgb(29,29,29)] border !border-[rgb(51,51,51)] !py-0.5 h-8 rounded-lg'>
                      <div className="data-[state=active]:bg-[#813b3b] dark:data-[state=active]:text-[#D4D4D4] dark:hover:bg-[#0F0F0F] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:bg-[#ad3434] text-foreground dark:text-[#D4D4D4]] inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                        onClick={() => setViewMode('grid')}>
                        <LayoutDashboard />
                      </div>
                      <div className="data-[state=active]:bg-[#312222] dark:data-[state=active]:text-[#D4D4D4] dark:hover:bg-[#0F0F0F] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:bg-[#0F0F0F] text-foreground dark:text-[#D4D4D4]] inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                        onClick={() => setViewMode('list')}>
                        <ListIcon />
                      </div>
                    </TabsList>
                  </AnimateIcon>
                  <ClipButton initialClips={clips} />
                </div>
              </div>
            </div>
            <Separator />
            <TabsContent
              value="all"
              className=""
            >
              {viewMode === 'grid' ? (
                <div className="grid lg:grid-cols-5 md:grid-cols-4 gap-4 px-4 pt-2">
                  <ClipGrid clips={clips} onClipUpdate={refreshClips} />
                </div>
              ) : (
                <ClipList clips={clips} onClipUpdate={refreshClips} />
              )}
            </TabsContent>

            <TabsContent value="video" className="px-4 pt-2 ">
              {viewMode === 'grid' ? (
                <div className="grid lg:grid-cols-5 md:grid-cols-4 gap-4">
                  <ClipGrid clips={videoClips} onClipUpdate={refreshClips} />
                </div>
              ) : (
                <ClipList clips={videoClips} onClipUpdate={refreshClips} />
              )}
            </TabsContent>
            <TabsContent value="audio" className="px-4 pt-2 ">
        {viewMode === 'grid' ? (
          <div className="grid lg:grid-cols-5 md:grid-cols-4 gap-4">
            <ClipGrid clips={audioClips} onClipUpdate={refreshClips} />
          </div>
        ) : (
          <ClipList clips={audioClips} onClipUpdate={refreshClips} />
        )}
      </TabsContent>

            <TabsContent value="notetaker" className='w-full px-4 pt-2'>
              {viewMode === 'grid' ? (
                <div className="w-full">
                  <Notetaker />
                </div>
              ) : (
                <ListNotetaker />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}

// Remove this problematic line and fix the component
// export const ClipsMeetingcard = ({ initialClips = [] }: DashboardProps) => {
//   const { data: session } = useSession();
//   const [clips, setClips] = useState<Clip[]>(initialClips);

//   const refreshClips = async () => {
//     const response = await fetch('/api/clips');
//     const data = await response.json();
//     setClips(data);
//   };

//   if (!session) {
//     return <div>Please sign in to access the Clips</div>;
//   }

//   return (
//     <div className="dark:bg-[#161616] bg-[#F4F4F5] max-h-full h-full p-1 rounded-xl" 
//     >
//       <div className="flex py-1.5 px-2 justify-start items-center gap-2">
//         <div className="bg-gradient-to-r from-[#D02020] to-[#D02020] rounded-sm p-1">
//           <Video className="text-white h-5 w-5" />
//         </div>
//         <div className="overflow-hidden">
//           <p className="text-[13px] font-bold">Your Clips</p>
//           <p className="text-[10px] -mt-0.5 text-gray-500 line-clamp-1 ">
//             Here is a count of your clips
//           </p>
//         </div>
//       </div>
//       <Card className="relative h-fit py-1 rounded-xl border-0 overflow-hidden bg-gradient-to-br from-[#111] via-[#101010] to-[#000]">

//         {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#2b6eff_0%,_transparent_40%),radial-gradient(circle_at_bottom_right,_#ff003c_0%,_transparent_50%)] opacity-70" /> */}
//         <img className="absolute inset-0 opacity-70 h-full w-full object-cover" src="https://i.pinimg.com/736x/d0/7f/ce/d07fce3952137aaaa71817e4ece3450a.jpg" alt="" />
//         <CardContent className="relative text-white flex flex-col pr-1 pl-2.5 py-0 h-full">
//           <Link
//             href="/clips"
//             className="text-sm self-end text-white rounded-full border-red-500/30 border-[1px] w-fit p-1"
//           >
//             <AnimateIcon animateOnHover>
//               <ArrowRight className="h-4 w-4 -rotate-45" />
//             </AnimateIcon>
//           </Link>

//           <div className="flex w-full items-end justify-between">
//             <div>
//               <p className="text-[10px] text-gray-400">Total Clips</p>
//               <h1 className="text-5xl font-semibold">{clips.length}</h1>
//             </div>
//             <div className=" flex flex-col justify-end items-end">
//               <div className="bg-gradient-to-r from-[#FF0000] to-[#470000] text-white text-xs px-2 w-fit py-0.5 rounded-full shadow-lg">
//                 +7 clips
//               </div>
//               <p className="text-[8px] text-gray-400 text-right">
//                 Compare to Last week
//               </p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

interface ClipsMeetingCardProps {
  initialClips?: Clip[];
}

export const ClipsMeetingCard = ({ initialClips = EMPTY_CLIPS }: ClipsMeetingCardProps) => {
  const { data: session } = useSession();
  const [weeklyCount, setWeeklyCount] = useState(0);

  const { data: clips = initialClips, isLoading } = useQuery({
    queryKey: ['clipsData', session?.user?.email],
    queryFn: async () => {
      const response = await fetch('/api/clips');
      if (response.ok) {
        const data = await response.json();
        const clipsArray = Array.isArray(data) ? data : data.data || [];

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentClips = clipsArray.filter((clip: Clip) => {
          const createdAt = new Date(clip.createdAt);
          return createdAt >= oneWeekAgo;
        });
        setWeeklyCount(recentClips.length);

        return clipsArray;
      }
      return initialClips;
    },
    enabled: !!session,
    initialData: initialClips
  });

  if (!session) {
    return <div>Please sign in to access the Clips</div>;
  }

  const totalClips = clips.length;

  return (
    <div className="dark:bg-[#161616] bg-[#F4F4F5] max-h-full h-full p-1 rounded-xl">
      <div className="flex py-1.5 px-2 justify-start items-center gap-2">
        <div className="bg-transparent border dark:border-[#333] rounded-sm p-1">
          <Video className="text-white h-5 w-5" />
        </div>
        <div className="overflow-hidden">
          <p className="text-[13px] font-bold">Your Clips</p>
          <p className="text-[10px] -mt-0.5 text-gray-500 line-clamp-1">
            Here is a count of your clips
          </p>
        </div>
      </div>
      <Card className="relative h-fit py-1 rounded-xl border-0 overflow-hidden bg-gradient-to-br from-[#111] via-[#101010] to-[#000]">
        <Image
          className="absolute inset-0 opacity-70 h-full w-full object-cover"
          src="https://i.pinimg.com/736x/d0/7f/ce/d07fce3952137aaaa71817e4ece3450a.jpg"
          alt=""
          width={1000}
          height={1000}
        />
        <CardContent className="relative text-white flex flex-col pr-1 pl-2.5 py-0 h-full">
          <Link
            href="/clips"
            className="text-sm self-end text-white rounded-full border-red-500/30 border-[1px] w-fit p-1"
          >
            <AnimateIcon animateOnHover>
              <ArrowRight className="h-4 w-4 -rotate-45" />
            </AnimateIcon>
          </Link>

          <div className="flex w-full items-end justify-between">
            <div>
              <p className="text-[10px] text-gray-400">Total Clips</p>
              <h1 className="text-5xl font-semibold">
                {isLoading ? '...' : totalClips}
              </h1>
            </div>
            <div className="flex flex-col justify-end items-end">
              <div className="bg-gradient-to-r from-[#4a4848] to-[#343333] text-white text-xs px-2 w-fit py-0.5 rounded-full shadow-lg">
                {isLoading ? '...' : `+${weeklyCount} clips`} 
              </div>
              <p className="text-[8px] text-gray-400 text-right">
                Compare to Last week
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  // Fetch clips from API
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/clips`, {
    headers: {
      Cookie: context.req.headers.cookie || '',
    },
  });

  const clips = response.ok ? await response.json() : [];

  return {
    props: {
      initialClips: clips,
    },
  };
};

export function ListNotetaker() {
  // const { data: session, status } = useSession();
  const { status } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    recording: 0,
    totalDuration: 0,
  });

  if (status === 'unauthenticated') {
    redirect('/auth/login');
  }


  useEffect(() => {
    if (status === 'authenticated') {
      fetchMeetings();
    }
  }, [status]);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/aimeetings');
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);

        const completed = data.filter((m: Meeting) => m.status === 'completed').length;
        const recording = data.filter((m: Meeting) => m.status === 'recording').length;
        const totalDuration = data.reduce((acc: number, m: Meeting) => acc + (m.duration || 0), 0);

        setStats({
          total: data.length,
          completed,
          recording,
          totalDuration,
        });
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // const formatDuration = (seconds: number) => {
  //   const hours = Math.floor(seconds / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   if (hours > 0) {
  //     return `${hours}h ${minutes}m`;
  //   }
  //   return `${minutes}m`;
  // };

  if (status === 'loading' || isLoading) {
    return (

      <div className="flex items-center justify-center h-64">
        <LazyLoader />
      </div>
    );
  }

  return (
    <>
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Meetings"
          value={stats.total}
          icon={<Calendar1 className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<Clock className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Recording Now"
          value={stats.recording}
          icon={<Clock className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="Total Duration"
          value={formatDuration(stats.totalDuration)}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
        />
      </div> */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Your Meetings</h1>
          <p className="text-gray-600 mt-1">
            {meetings.length === 0
              ? 'No meetings yet. Start by joining one!'
              : `You have ${meetings.length} meeting${meetings.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <NewMeetingModal>
          <Plus className="h-4 w-4" />
          <span>Join Meeting</span>
        </NewMeetingModal>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="bg-blue-50  size-16  rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar1 className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings yet</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Start by having the AI notetaker join your next meeting
          </p>
          <NewMeetingModal>
            <Plus className="h-4 w-4" />
            <span>Join Your First Meeting</span>
          </NewMeetingModal>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </>
  );
}

// function StatCard({
//   title,
//   value,
//   icon,
//   color,
// }: {
//   title: string;
//   value: string | number;
//   icon: React.ReactNode;
//   color: 'blue' | 'green' | 'red' | 'purple';
// }) {
//   const colorClasses = {
//     blue: 'bg-blue-50 text-blue-600',
//     green: 'bg-green-50 text-green-600',
//     red: 'bg-red-50 text-red-600',
//     purple: 'bg-purple-50 text-purple-600',
//   };

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 p-4">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm text-gray-600">{title}</p>
//           <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
//         </div>
//         <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
//       </div>
//     </div>
//   );
// }


export function Notetaker() {
  const { status } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    recording: 0,
    totalDuration: 0,
  });

 
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    }

 useEffect(() =>
   {
    if (status === 'authenticated') {
      fetchMeetings();
    }
  }, [status]);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/aimeetings');
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);

        const completed = data.filter((m: Meeting) => m.status === 'completed').length;
        const recording = data.filter((m: Meeting) => m.status === 'recording').length;
        const totalDuration = data.reduce((acc: number, m: Meeting) => acc + (m.duration || 0), 0);

        setStats({
          total: data.length,
          completed,
          recording,
          totalDuration,
        });
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // const formatDuration = (seconds: number) => {
  //   const hours = Math.floor(seconds / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   if (hours > 0) {
  //     return `${hours}h ${minutes}m`;
  //   }
  //   return `${minutes}m`;
  // };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LazyLoader />
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-blue-50  size-16  rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar1 className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#B4B4B4] mb-2">No meetings yet</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Start by having the AI notetaker join your next meeting
        </p>

      </div>
    );
  }

  return (
    <>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {meetings.map((meeting) => (
          <MeetingExpandableCard
            key={meeting.id}
            meeting={meeting}
            classNameExpanded="[&_h4]:text-black dark:[&_h4]:text-white [&_h4]:font-medium"
          >

            {meeting.summary && (
              <div className="w-full">
                <h4 className="text-lg font-semibold mb-2">Summary</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{meeting.summary}</p>
              </div>
            )}

          </MeetingExpandableCard>
        ))}
      </div>
    </>
  );
}
