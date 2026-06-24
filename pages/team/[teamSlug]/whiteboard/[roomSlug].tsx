// // pages/team/[teamSlug]/whiteboard/[roomSlug].tsx
// import React from "react";
// import type { GetServerSideProps, NextPage } from "next";
// import Head from "next/head";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import dynamic from "next/dynamic";
// import type { Room, Team, User } from "@prisma/client";
// import { useSocket } from "hooks/use-socket"; // Your existing hook

// const CanvasWhiteboard = dynamic( 
//   () => import("@/components/whiteboard/CanvasWhiteboard").then((m) => m.CanvasWhiteboard),
//   { ssr: false, loading: () => (
//     <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f]">
//       <div className="size-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
//       <p className="text-zinc-500 text-sm mt-3">Loading whiteboard…</p>
//     </div>
//   )}
// );

// type RoomWithTeam = Room & {
//   team: Pick<Team, "id" | "name" | "slug">;
//   createdBy: Pick<User, "id" | "name">;
// };

// interface PageProps {
//   room: RoomWithTeam;
//   userId: string;
//   userName: string;
//   userColor: string;
// }

// const RoomPage: NextPage<PageProps> = ({ room, userId, userName, userColor }) => {
//   const { socket } = useSocket(); // ← Fixed: destructure from object

//   React.useEffect(() => {
//     if (socket && room.id) {
//       socket.emit('join-whiteboard', room.id);
//       return () => {
//         socket.emit('leave-whiteboard', room.id);
//       };
//     }
//   }, [socket, room.id]);

//   return (
//     <>
//       <Head>
//         <title>{room.name} — Whiteboard · {room.team.name}</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
//       </Head>

//       <div className="fixed inset-0 bg-[#0f0f0f] overflow-hidden">
//         <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 pointer-events-none">
//           <span className="text-xs text-zinc-500 font-medium tracking-wide">{room.team.name}</span>
//           <span className="text-zinc-700 text-xs">/</span>
//           <span className="text-xs text-zinc-300 font-medium">{room.name}</span>
//         </div>

//         <CanvasWhiteboard
//           roomId={room.id}
//           userId={userId}
//           userName={userName}
//           userColor={userColor}
//           socket={socket}
//         />
//       </div>
//     </>
//   );
// };

// export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
//   const session = await getServerSession(ctx.req, ctx.res, authOptions);
//   if (!session?.user?.id) {
//     return { redirect: { destination: `/login?callbackUrl=${ctx.resolvedUrl}`, permanent: false } };
//   }

//   const { teamSlug, roomSlug } = ctx.params as { teamSlug: string; roomSlug: string };

//   const team = await prisma.team.findUnique({
//     where: { slug: teamSlug },
//     include: { members: { where: { userId: session.user.id }, select: { id: true, role: true } } },
//   });

//   if (!team || !team.members.length) return { notFound: true };

//   const room = await prisma.room.findFirst({
//     where: { teamId: team.id, slug: roomSlug, isArchived: false },
//     include: { team: { select: { id: true, name: true, slug: true } }, createdBy: { select: { id: true, name: true } } },
//   });

//   if (!room) return { notFound: true };

//   const colors = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899"];
//   let hash = 0;
//   for (const c of session.user.id) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
//   const userColor = colors[Math.abs(hash) % colors.length];

//   return { props: { room: JSON.parse(JSON.stringify(room)), userId: session.user.id, userName: session.user.name ?? "Anonymous", userColor } };
// };

// export default RoomPage; 


// pages/team/[teamSlug]/whiteboard/[roomSlug].tsx — FINAL FIXED VERSION
// import React from "react";
// import type { GetServerSideProps, NextPage } from "next";
// import Head from "next/head";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import dynamic from "next/dynamic";
// import type { Room, Team, User } from "@prisma/client";
// import { useSocket } from "hooks/use-socket";

// const CanvasWhiteboard = dynamic(
//   () => import("@/components/whiteboard/CanvasWhiteboard").then((m) => m.CanvasWhiteboard),
//   { ssr: false, loading: () => (
//     <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f]">
//       <div className="size-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
//       <p className="text-zinc-500 text-sm mt-3">Loading whiteboard…</p>
//     </div>
//   )}
// );

// type RoomWithTeam = Room & {
//   team: Pick<Team, "id" | "name" | "slug">;
//   createdBy: Pick<User, "id" | "name">;
// };

// interface PageProps {
//   room: RoomWithTeam | null;
//   userId: string;
//   userName: string;
//   userColor: string;
// }

// const RoomPage: NextPage<PageProps> = ({ room, userId, userName, userColor }) => {
//   const { socket } = useSocket();

//   React.useEffect(() => {
//     if (!socket || !room?.id) return;
    
//     socket.emit('join-whiteboard', room.id);
//     return () => {
//       socket.emit('leave-whiteboard', room.id);
//     };
//   }, [socket, room?.id]);

//   // Guard: room not found
//   if (!room) {
//     return (
//       <div className="fixed inset-0 bg-[#0f0f0f] flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-zinc-300 text-lg mb-2">Room not found</p>
//           <p className="text-zinc-500 text-sm">This whiteboard may have been deleted or archived.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Head>
//         <title>{room.name} — Whiteboard · {room.team.name}</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
//       </Head>

//       <div className="fixed inset-0 bg-[#0f0f0f] overflow-hidden">
//         <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 pointer-events-none">
//           <span className="text-xs text-zinc-500 font-medium tracking-wide">{room.team.name}</span>
//           <span className="text-zinc-700 text-xs">/</span>
//           <span className="text-xs text-zinc-300 font-medium">{room.name}</span>
//         </div>

//         <CanvasWhiteboard
//           roomId={room.id}
//           userId={userId}
//           userName={userName}
//           userColor={userColor}
//           socket={socket}
//         />
//       </div>
//     </>
//   );
// };  this is custom whiteboard code

import React from "react"
import type { GetServerSideProps, NextPage } from "next"
import Head from "next/head"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Room, Team, User } from "@prisma/client"
import BlockSuiteCanvas from "@/components/whiteboard/BlockSuiteCanvas"
import { Header } from "@/components/doc-components/Header"


type RoomWithTeam = Room & {
  team: Pick<Team, "id" | "name" | "slug">
  createdBy: Pick<User, "id" | "name">
}

interface PageProps {
  room: RoomWithTeam
  userId: string
  userName: string
  userColor: string
}
 
const RoomPage: NextPage<PageProps> = ({ room, userId, userName, userColor }) => {
  return (
    <>
      <Head>
        <title>{room.name} Whiteboard · {room.team.name}</title>
        <link rel="stylesheet" href="/whiteboard/whiteboard.module.css" />
      </Head>
<Header/>
      <div className="fixed inset-0 bg-[#0f0f0f] overflow-hidden">
        <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 pointer-events-none">
          <span className="text-xs text-zinc-500 font-medium tracking-wide">{room.team.name}</span>
          <span className="text-zinc-700 text-xs">/</span>
          <span className="text-xs text-zinc-300 font-medium">{room.name}</span>
        </div>

        <BlockSuiteCanvas roomId={room.id} />
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session?.user?.id) {
    return { redirect: { destination: `/login?callbackUrl=${ctx.resolvedUrl}`, permanent: false } };
  }

  const { teamSlug, roomSlug } = ctx.params as { teamSlug: string; roomSlug: string };
  
  console.log('[GSSP] teamSlug:', teamSlug, 'roomSlug:', roomSlug); // Debug

  const team = await prisma.team.findUnique({
    where: { slug: teamSlug },
    include: { members: { where: { userId: session.user.id }, select: { id: true, role: true } } },
  });

  if (!team || !team.members.length) {
    console.log('[GSSP] Team not found or no membership');
    return { notFound: true };
  }

  const room = await prisma.room.findFirst({
    where: { teamId: team.id, slug: roomSlug, isArchived: false },
    include: { team: { select: { id: true, name: true, slug: true } }, createdBy: { select: { id: true, name: true } } },
  });

  console.log('[GSSP] Found room:', room?.id, room?.name); // Debug

  if (!room) {
    return { 
      props: { 
        room: null, 
        userId: session.user.id, 
        userName: session.user.name ?? "Anonymous", 
        userColor: generateUserColor(session.user.id) 
      } 
    };
  }

  const colors = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899"];
  let hash = 0;
  for (const c of session.user.id) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
  const userColor = colors[Math.abs(hash) % colors.length];

  return { 
    props: { 
      room: JSON.parse(JSON.stringify(room)), 
      userId: session.user.id, 
      userName: session.user.name ?? "Anonymous", 
      userColor 
    } 
  };
};

function generateUserColor(userId: string): string {
  const colors = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899"];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

export default RoomPage;
//  this one above is custom made working but not advance 




// below this  is tldraw working advanced but not same features
// // pages/teams/[teamSlug]/whiteboard/[roomSlug].tsx
// import React, { useEffect, useState } from "react";
// import type { GetServerSideProps, NextPage } from "next";
// import Head from "next/head";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import dynamic from "next/dynamic";
// import type { Room, Team, User } from "@prisma/client";

// // Lazy-load heavy tldraw bundle — avoids SSR issues
// const WhiteboardCanvas = dynamic(
//   () =>
//     import("@/components/whiteboard/WhiteboardCanvas").then(
//       (m) => m.WhiteboardCanvas
//     ),
//   { ssr: false }
// );

// // ─── Types ────────────────────────────────────────────────────────────────────
// type RoomWithTeam = Room & {
//   team: Pick<Team, "id" | "name" | "slug">;
//   createdBy: Pick<User, "id" | "name">;
// };

// interface PageProps {
//   room: RoomWithTeam;
//   userId: string;
//   userName: string;
//   userColor: string;
// }

// // ─── Error boundary ───────────────────────────────────────────────────────────
// class WhiteboardErrorBoundary extends React.Component<
//   { children: React.ReactNode },
//   { error: Error | null; retrying: boolean }
// > {
//   state = { error: null, retrying: false };

//   static getDerivedStateFromError(error: Error) {
//     return { error };
//   }

//   handleRetry = () => {
//     this.setState({ error: null, retrying: true });
//     setTimeout(() => this.setState({ retrying: false }), 500);
//   };

//   render() {
//     if (this.state.error) {
//       return (
//         <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f] text-zinc-300 gap-4">
//           <svg className=" size-12  text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
//           </svg>
//           <p className="text-lg font-medium">Whiteboard failed to load</p>
//           <p className="text-sm text-zinc-500">There was a problem connecting to the sync server.</p>
//           <button
//             onClick={this.handleRetry}
//             className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
//           >
//             Retry Connection
//           </button>
//         </div>
//       );
//     }
//     if (this.state.retrying) return null;
//     return this.props.children;
//   }
// }

// // ─── Page component ───────────────────────────────────────────────────────────
// const RoomPage: NextPage<PageProps> = ({ room, userId, userName, userColor }) => {
//   const [syncToken, setSyncToken] = useState<string | null>(null);
//   const [tokenError, setTokenError] = useState(false);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchToken = async () => {
//       try {
//         const res = await fetch(`/api/rooms/${room.id}/token`);
//         if (!res.ok) throw new Error("Token fetch failed");
//         const { token } = await res.json();
//         if (!cancelled) setSyncToken(token);
//       } catch {
//         if (!cancelled) setTokenError(true);
//       }
//     };
 
//     fetchToken();

//     // Refresh token every 4 minutes (before 5-min expiry)
//     const interval = setInterval(fetchToken, 4 * 60 * 1000);

//     return () => {
//       cancelled = true;
//       clearInterval(interval);
//     };
//   }, [room.id]);

//   return (
//     <>
//       <Head>
//         <title>{room.name} — Whiteboard · {room.team.name}</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
//       </Head>

//       <div className="fixed inset-0 bg-[#0f0f0f] overflow-hidden">
//         {/* Loading state */}
//         {!syncToken && !tokenError && (
//           <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
//             <div className="size-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
//             <p className="text-zinc-500 text-sm">Connecting to whiteboard…</p>
//           </div>
//         )}

//         {/* Token error state */}
//         {tokenError && (
//           <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300 gap-3">
//             <p className="text-lg">Could not connect</p>
//             <p className="text-sm text-zinc-500">Failed to get room access token.</p>
//             <button
//               onClick={() => {
//                 setTokenError(false);
//                 setSyncToken(null);
//                 // re-trigger useEffect
//                 window.location.reload();
//               }}
//               className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg"
//             >
//               Retry
//             </button>
//           </div>
//         )}

//         {/* Room label */}
//         {syncToken && (
//           <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 pointer-events-none">
//             <span className="text-xs text-zinc-500 font-medium tracking-wide">
//               {room.team.name}
//             </span>
//             <span className="text-zinc-700 text-xs">/</span>
//             <span className="text-xs text-zinc-300 font-medium">{room.name}</span>
//           </div>
//         )}

//         {/* Canvas */}
//         {syncToken && (
//           <WhiteboardErrorBoundary>
//             <WhiteboardCanvas
//               roomId={room.id}
//               tldrawRoomId={room.tldrawRoomId}
//               syncToken={syncToken}
//               userName={userName}
//               userColor={userColor}
//             />
//           </WhiteboardErrorBoundary>
//         )}
//       </div>
//     </>
//   );
// };

// // ─── Server-side auth + room lookup ──────────────────────────────────────────
// export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
//   const session = await getServerSession(ctx.req, ctx.res, authOptions);

//   if (!session?.user?.id) {
//     return {
//       redirect: { destination: `/login?callbackUrl=${ctx.resolvedUrl}`, permanent: false },
//     };
//   }

//   const { teamSlug, roomSlug } = ctx.params as { teamSlug: string; roomSlug: string };

//   const team = await prisma.team.findUnique({
//     where: { slug: teamSlug },
//     include: {
//       members: {
//         where: { userId: session.user.id },
//         select: { id: true, role: true },
//       },
//     },
//   });

//   if (!team || !team.members.length) {
//     return { notFound: true };
//   }

//   const room = await prisma.room.findFirst({
//     where: { teamId: team.id, slug: roomSlug, isArchived: false },
//     include: {
//       team: { select: { id: true, name: true, slug: true } },
//       createdBy: { select: { id: true, name: true } },
//     },
//   });

//   if (!room) {
//     return { notFound: true };
//   }

//   // Deterministic color from user ID
//   const colors = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899"];
//   let hash = 0;
//   for (const c of session.user.id) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
//   const userColor = colors[Math.abs(hash) % colors.length];

//   return {
//     props: {
//       room: JSON.parse(JSON.stringify(room)),
//       userId: session.user.id,
//       userName: session.user.name ?? "Anonymous",
//       userColor,
//     },
//   };
// };

// export default RoomPage;

// // pages/teams/[teamSlug]/whiteboard/[roomSlug].tsx
// import React, { useEffect, useState } from "react";
// import type { GetServerSideProps, NextPage } from "next";
// import Head from "next/head";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import dynamic from "next/dynamic";
// import type { Room, Team, User } from "@prisma/client";
// import { useWhiteboard } from "hooks/useWhiteboard"; // ← import the hook

// // Lazy-load canvas to avoid SSR issues with canvas APIs
// const WhiteboardCanvas = dynamic(
//   () =>
//     import("@/components/whiteboard/WhiteboardCanvas").then(
//       (m) => m.WhiteboardCanvas
//     ),
//   { ssr: false }
// );

// // ─── Types ────────────────────────────────────────────────────────────────────
// type RoomWithTeam = Room & {
//   team: Pick<Team, "id" | "name" | "slug">;
//   createdBy: Pick<User, "id" | "name">;
// };

// interface PageProps {
//   room: RoomWithTeam;
//   userId: string;
//   userName: string;
//   userColor: string;
// }

// // ─── Error boundary ───────────────────────────────────────────────────────────
// class WhiteboardErrorBoundary extends React.Component<
//   { children: React.ReactNode },
//   { error: Error | null; retrying: boolean }
// > {
//   state = { error: null, retrying: false };

//   static getDerivedStateFromError(error: Error) {
//     return { error };
//   }

//   handleRetry = () => {
//     this.setState({ error: null, retrying: true });
//     setTimeout(() => this.setState({ retrying: false }), 500);
//   };

//   render() {
//     if (this.state.error) {
//       return (
//         <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f] text-zinc-300 gap-4">
//           <svg className=" size-12  text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
//           </svg>
//           <p className="text-lg font-medium">Whiteboard failed to load</p>
//           <p className="text-sm text-zinc-500">There was a problem connecting to the sync server.</p>
//           <button
//             onClick={this.handleRetry}
//             className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
//           >
//             Retry Connection
//           </button>
//         </div>
//       );
//     }
//     if (this.state.retrying) return null;
//     return this.props.children;
//   }
// }

// // ─── Page component ───────────────────────────────────────────────────────────
// const RoomPage: NextPage<PageProps> = ({ room, userId, userName, userColor }) => {
//   const [syncToken, setSyncToken] = useState<string | null>(null);
//   const [tokenError, setTokenError] = useState(false);

//   // ← Initialize the whiteboard state hook
//   const {
//     state,
//     onPointerDown,
//     onPointerMove,
//     onPointerUp,
//     onWheel,
//   } = useWhiteboard(room.id);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchToken = async () => {
//       try {
//         const res = await fetch(`/api/rooms/${room.id}/token`);
//         if (!res.ok) throw new Error("Token fetch failed");
//         const { token } = await res.json();
//         if (!cancelled) setSyncToken(token);
//       } catch {
//         if (!cancelled) setTokenError(true);
//       }
//     };
 
//     fetchToken();

//     const interval = setInterval(fetchToken, 4 * 60 * 1000);

//     return () => {
//       cancelled = true;
//       clearInterval(interval);
//     };
//   }, [room.id]);

//   return (
//     <>
//       <Head>
//         <title>{room.name} — Whiteboard · {room.team.name}</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
//       </Head>

//       <div className="fixed inset-0 bg-[#0f0f0f] overflow-hidden">
//         {/* Loading state */}
//         {!syncToken && !tokenError && (
//           <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
//             <div className="size-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
//             <p className="text-zinc-500 text-sm">Connecting to whiteboard…</p>
//           </div>
//         )}

//         {/* Token error state */}
//         {tokenError && (
//           <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300 gap-3">
//             <p className="text-lg">Could not connect</p>
//             <p className="text-sm text-zinc-500">Failed to get room access token.</p>
//             <button
//               onClick={() => {
//                 setTokenError(false);
//                 setSyncToken(null);
//                 window.location.reload();
//               }}
//               className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg"
//             >
//               Retry
//             </button>
//           </div>
//         )}

//         {/* Room label */}
//         {syncToken && (
//           <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 pointer-events-none">
//             <span className="text-xs text-zinc-500 font-medium tracking-wide">
//               {room.team.name}
//             </span>
//             <span className="text-zinc-700 text-xs">/</span>
//             <span className="text-xs text-zinc-300 font-medium">{room.name}</span>
//           </div>
//         )}

//         {/* Canvas */}
//         {syncToken && (
//           <WhiteboardErrorBoundary>
//             <WhiteboardCanvas
//               state={state}
//               onPointerDown={onPointerDown}
//               onPointerMove={onPointerMove}
//               onPointerUp={onPointerUp}
//               onWheel={onWheel}
//               onDoubleClick={() => {}} // not handled by hook yet
//             />
//           </WhiteboardErrorBoundary>
//         )}
//       </div>
//     </>
//   );
// };

// // ─── Server-side auth + room lookup ──────────────────────────────────────────
// export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
//   const session = await getServerSession(ctx.req, ctx.res, authOptions);

//   if (!session?.user?.id) {
//     return {
//       redirect: { destination: `/login?callbackUrl=${ctx.resolvedUrl}`, permanent: false },
//     };
//   }

//   const { teamSlug, roomSlug } = ctx.params as { teamSlug: string; roomSlug: string };

//   const team = await prisma.team.findUnique({
//     where: { slug: teamSlug },
//     include: {
//       members: {
//         where: { userId: session.user.id },
//         select: { id: true, role: true },
//       },
//     },
//   });

//   if (!team || !team.members.length) {
//     return { notFound: true };
//   }

//   const room = await prisma.room.findFirst({
//     where: { teamId: team.id, slug: roomSlug, isArchived: false },
//     include: {
//       team: { select: { id: true, name: true, slug: true } },
//       createdBy: { select: { id: true, name: true } },
//     },
//   });

//   if (!room) {
//     return { notFound: true };
//   }

//   const colors = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899"];
//   let hash = 0;
//   for (const c of session.user.id) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
//   const userColor = colors[Math.abs(hash) % colors.length];

//   return {
//     props: {
//       room: JSON.parse(JSON.stringify(room)),
//       userId: session.user.id,
//       userName: session.user.name ?? "Anonymous",
//       userColor,
//     },
//   };
// };

// export default RoomPage;

