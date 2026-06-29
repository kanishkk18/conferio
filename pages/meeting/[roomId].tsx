// // pages/meeting/[roomId].tsx
// import { GetServerSideProps } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';
// import MeetingLobby from '@/components/video-meeting/MeetingLobby';
// import MeetingRoom from '@/components/video-meeting/MeetingRoom';
// import { useState } from 'react';

// interface MeetingPageProps {
//   roomId: string;
//   meeting: {
//     id: string;
//     title: string;
//     requireApproval: boolean;
//     hasPassword: boolean;
//     status: string;
//     hostId: string;
//     isHost: boolean;
//   };
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     image?: string;
//   } | null;
// }

// export default function MeetingPage({ roomId, meeting, user }: MeetingPageProps) {
//   const [joined, setJoined] = useState(false);
//   const [lobbyData, setLobbyData] = useState<{
//     displayName: string;
//     audioOn: boolean;
//     videoOn: boolean;
//     background: string;
//     token: string;
//   } | null>(null);
  

//   if (joined && lobbyData) {
//     return (
//       <MeetingRoom
//         roomId={roomId}
//         meeting={meeting}
//         user={user}
//         lobbyData={lobbyData}
//       />
//     );
//   }

//   return (
//     <MeetingLobby
//       roomId={roomId}
//       meeting={meeting}
//       user={user}
//       onJoin={(data) => {
//         setLobbyData(data);
//         setJoined(true);
//       }}
//     />
//   );
// }

// export const getServerSideProps: GetServerSideProps = async (ctx) => {
//   const { roomId } = ctx.params as { roomId: string };
//   const session = await getServerSession(ctx.req, ctx.res, authOptions);

//   // Find or create meeting
//   let meeting = await prisma.videoConference.findUnique({
//     where: { roomId },
//   });

//   if (!meeting && session?.user?.id) {
//     // Auto-create if host is creating for first time
//     meeting = await prisma.videoConference.create({
//       data: {
//         roomId,
//         title: 'My Meeting',
//         hostId: session.user.id,
//         status: 'WAITING',
//       },
//     });
//   }

//   if (!meeting) {
//     return { notFound: true };
//   }

//   const user = session?.user
//     ? {
//         id: session.user.id,
//         name: session.user.name || 'Guest',
//         email: session.user.email || '',
//         image: session.user.image || null,
//       }
//     : null;

//   return {
//     props: {
//       roomId,
//       meeting: {
//         id: meeting.id,
//         title: meeting.title,
//         requireApproval: meeting.requireApproval,
//         hasPassword: !!meeting.password,
//         status: meeting.status,
//         hostId: meeting.hostId,
//         isHost: session?.user?.id === meeting.hostId,
//       },
//       user,
//     },
//   };
// };

// pages/meeting/[roomId].tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';
import MeetingLobby from '@/components/video-meeting/MeetingLobby';
import MeetingRoom from '@/components/video-meeting/MeetingRoom';
import { useState, useEffect } from 'react';


interface MeetingPageProps {
  roomId: string;
  meeting: {
    id: string;
    title: string;
    requireApproval: boolean;
    hasPassword: boolean;
    status: string;
    hostId: string;
    isHost: boolean;
  };
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  } | null;
}

// Reusable Wall Loading Component
function WallLoader({ text = 'Taking you to the Universe' }: { text?: string }) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      

      <div className="scene">
        <div className="wrap">
          <div className="wall wall-right"></div>
          <div className="wall wall-right-right"></div>
          <div className="wall wall-left"></div>
          <div className="wall wall-left-left"></div>
          <div className="wall wall-top"></div>
          <div className="wall wall-top-top"></div>
          <div className="wall wall-bottom"></div>
          <div className="wall wall-bottom-bottom"></div>
          <div className="wall wall-back"></div>
        </div>
        <div className="wrap">
          <div className="wall wall-right"></div>
          <div className="wall wall-right-right"></div>
          <div className="wall wall-left"></div>
          <div className="wall wall-top"></div>
          <div className="wall wall-bottom"></div>
          <div className="wall wall-back"></div>
        </div>
      </div>

      <style jsx global>{`
        .wall {
          background: url(https://i.pinimg.com/736x/82/fe/3e/82fe3ef47c4eace70c45aa1639de4fd8.jpg);
          background-size: cover;
          background-position: center;
        }

        .scene {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          perspective: 5px;
          perspective-origin: 50% 50%;
          overflow: hidden;
        }

        .wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2000px;
          height: 2000px;
          margin-top: -1000px;
          margin-left: -1000px;
          transform-style: preserve-3d;
          animation: move 12s infinite linear;
          animation-fill-mode: forwards;
        }

        .wrap:nth-child(2) {
          animation: move 12s infinite linear;
          animation-delay: 6s;
        }

        .wall {
          position: absolute;
          top: 0;
          left: 0;
          width: 2000px;
          height: 2000px;
          opacity: 0;
          animation: fade 12s infinite linear;
        }

        .wrap:nth-child(2) .wall {
          animation-delay: 6s;
        }

        .wall-right {
          transform: rotateY(90deg) translateZ(1000px);
        }
        .wall-right-right {
          transform: rotateY(90deg) translateZ(1020px);
        }
        .wall-left {
          transform: rotateY(-90deg) translateZ(1000px);
        }
        .wall-left-left {
          transform: rotateY(-90deg) translateZ(1020px);
        }
        .wall-top {
          transform: rotateX(90deg) translateZ(1000px);
        }
        .wall-bottom {
          transform: rotateX(-90deg) translateZ(1000px);
        }
        .wall-back {
          transform: rotateX(180deg) translateZ(1000px);
        }
        .wall-top-top {
          transform: rotateX(90deg) translateZ(1020px);
        }
        .wall-bottom-bottom {
          transform: rotateX(-90deg) translateZ(1020px);
        }

        @keyframes move {
          0% {
            transform: translateZ(-500px) rotate(0deg);
          }
          100% {
            transform: translateZ(500px) rotate(0deg);
          }
        }

        @keyframes fade {
          0% {
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>

      <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10">
        <span className="text-4xl md:text-4xl lg:text-5xl font-semibold max-w-7xl mx-auto text-center text-neutral-800 dark:text-white">
          {text}
        </span>
      </div>
    </div>
  );
}

export default function MeetingPage({ roomId, meeting, user }: MeetingPageProps) {
  const [joined, setJoined] = useState(false);
  const [lobbyData, setLobbyData] = useState<{
    displayName: string;
    audioOn: boolean;
    videoOn: boolean;
    background: string;
    token: string;
  } | null>(null);
  
  // Track if page has hydrated (data loaded from server)
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Small delay to ensure we see the wall even on fast loads
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Show wall loader while page is hydrating (server data loading)
  if (!isHydrated) {
    return <WallLoader text="Entering the Meeting space" />;
  }

  if (joined && lobbyData) {
    return (
      <MeetingRoom
        roomId={roomId}
        meeting={meeting}
        user={user}
        lobbyData={lobbyData}
      />
    );
  }

  return (
    <MeetingLobby
      roomId={roomId}
      meeting={meeting}
      user={user}
      onJoin={(data) => {
        setLobbyData(data);
        setJoined(true);
      }}
    />
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { roomId } = ctx.params as { roomId: string };
  const [session, meetingResult] = await Promise.all([
    getServerSession(ctx.req, ctx.res, authOptions),
    prisma.videoConference.findUnique({ where: { roomId } })
  ]);
  let meeting = meetingResult;

  if (!meeting && session?.user?.id) {
    meeting = await prisma.videoConference.create({
      data: {
        roomId,
        title: 'My Meeting',
        hostId: session.user.id,
        status: 'WAITING',
      },
    });
  }

  if (!meeting) {
    return { notFound: true };
  }

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || 'Guest',
        email: session.user.email || '',
        image: session.user.image || null,
      }
    : null;

  return {
    props: {
      roomId,
      meeting: {
        id: meeting.id,
        title: meeting.title,
        requireApproval: meeting.requireApproval,
        hasPassword: !!meeting.password,
        status: meeting.status,
        hostId: meeting.hostId,
        isHost: session?.user?.id === meeting.hostId,
      },
      user,
    },
  };
};

