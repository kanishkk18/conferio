// "use client";

// import { useQuery } from "@tanstack/react-query";
// import { useRouter } from "next/router";
// import { Hash, Mic, Video, Lock } from "lucide-react";
// import Image from "next/image";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { TeamChannelSection } from "@/components/chat-components/channel/team-channel-section";
// import { ChannelType } from "@prisma/client";

// interface ChannelEntry {
//   id: string;
//   name: string;
//   type: ChannelType;
//   coverImage?: string | null;
//   visibility: "TEAM" | "RESTRICTED";
//   _count?: { messages: number; members: number };
// }

// interface TeamMemberEntry {
//   id: string;
//   role: string;
//   userId: string;
//   user: { id: string; name: string; email: string; image?: string | null };
// }

// const iconMap: Record<ChannelType, React.ReactNode> = {
//   TEXT: <Hash className="mr-2 size-4" />,
//   AUDIO: <Mic className="mr-2 size-4" />,
//   VIDEO: <Video className="mr-2 size-4" />,
// };

// export function ChannelSidebar({
//   teamSlug,
//   activeChannelId,
// }: {
//   teamSlug: string;
//   activeChannelId?: string;
// }) {
//   const router = useRouter();

//   const { data: channels = [], isLoading: channelsLoading } = useQuery<ChannelEntry[]>({
//     queryKey: ["teamChannels", teamSlug],
//     queryFn: async () => {
//       const res = await fetch(`/api/team/${teamSlug}/channels`);
//       if (!res.ok) return [];
//       return res.json();
//     },
//     enabled: !!teamSlug,
//   });

//   const { data: currentMember } = useQuery({
//     queryKey: ["currentMember", teamSlug],
//     queryFn: async () => {
//       const res = await fetch(`/api/teams/${teamSlug}/members/me`);
//       if (!res.ok) return null;
//       return res.json();
//     },
//     enabled: !!teamSlug,
//   });

//   const { data: members = [] } = useQuery<TeamMemberEntry[]>({
//     queryKey: ["teamMembers", teamSlug],
//     queryFn: async () => {
//       const res = await fetch(`/api/teams/${teamSlug}/members`);
//       if (!res.ok) return [];
//       const d = await res.json();
//       return d.data || d || [];
//     },
//     enabled: !!teamSlug,
//   });

//   if (channelsLoading) {
//     return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading…</div>;
//   }

//   return (
//     <div className="flex flex-col h-full text-primary w-full min-w-full">
      
//       {channels.map((channel) => (
//         <>
//         <>
//           {channel.coverImage ? (
//             <div className="h-32 w-full -mt-12">
//               <Image height={1000} width={1000} src={channel.coverImage} alt="" className="h-full w-full object-cover" />
//             </div>
//           ) : (
//             iconMap[channel.type]
//           )}
//         </>
//       <ScrollArea className="flex-1 px-3">
//         <div className="mt-4">
//           <TeamChannelSection
//             sectionType="channels"
//             channelType={ChannelType.TEXT}
//             role={currentMember?.role}
//             label="Channels"
//             teamId={currentMember?.teamId}
//             members={members.filter((m) => m.userId !== currentMember?.userId)}
//           />
//           <div className="space-y-[2px] mt-2">
           
//               <button
//                 key={channel.id}
//                 type="button"
//                 onClick={() => router.push(`/team/${teamSlug}/channels/${channel.id}`)}
//                 className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
//                   activeChannelId === channel.id
//                     ? "bg-zinc-200 dark:bg-[#222222] text-zinc-900 dark:text-white"
//                     : "text-zinc-500 hover:bg-zinc-100 hover:dark:bg-[#1a1a1a] hover:text-zinc-800 dark:hover:text-zinc-200"
//                 }`}
//               >
//                 {channel.coverImage ? (
//                   <Image
//                     src={channel.coverImage}
//                     alt=""
//                     width={20}
//                     height={20}
//                     className="rounded size-5 object-cover flex-shrink-0"
//                   />
//                 ) : (
//                   iconMap[channel.type]
//                 )}
//                 <span className="truncate flex-1 text-left">{channel.name}</span>
//                 {channel.visibility === "RESTRICTED" && (
//                   <Lock className="size-3 text-zinc-500 flex-shrink-0" />
//                 )}
//               </button>
            
//             {channels.length === 0 && (
//               <p className="text-xs text-zinc-500 px-2 py-4 text-center">No channels yet</p>
//             )}
//           </div>
//         </div>
        
//       </ScrollArea>
//       </>
//       ))}
//     </div>
//   );
// }

"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Hash, Mic, Video, Lock } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TeamChannelSection } from "@/components/chat-components/channel/team-channel-section";
import { ChannelType } from "@prisma/client";

interface ChannelEntry {
  id: string;
  name: string;
  type: ChannelType;
  coverImage?: string | null;
  visibility: "TEAM" | "RESTRICTED";
  _count?: { messages: number; members: number };
}

interface TeamMemberEntry {
  id: string;
  role: string;
  userId: string;
  user: { id: string; name: string; email: string; image?: string | null };
}

const iconMap: Record<ChannelType, React.ReactNode> = {
  TEXT: <Hash className="mr-2 size-4" />,
  AUDIO: <Mic className="mr-2 size-4" />,
  VIDEO: <Video className="mr-2 size-4" />,
};

export function ChannelSidebar({
  teamSlug,
  activeChannelId,
}: {
  teamSlug: string;
  activeChannelId?: string;
}) {
  const router = useRouter();

  const { data: channels = [], isLoading: channelsLoading } = useQuery<ChannelEntry[]>({
    queryKey: ["teamChannels", teamSlug],
    queryFn: async () => {
      const res = await fetch(`/api/team/${teamSlug}/channels`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!teamSlug,
  });

  const { data: currentMember } = useQuery({
    queryKey: ["currentMember", teamSlug],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamSlug}/members/me`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!teamSlug,
  });

  const { data: members = [] } = useQuery<TeamMemberEntry[]>({
    queryKey: ["teamMembers", teamSlug],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamSlug}/members`);
      if (!res.ok) return [];
      const d = await res.json();
      return d.data || d || [];
    },
    enabled: !!teamSlug,
  });

  if (channelsLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  // Only this one channel's cover renders as the big banner
  const activeChannel = channels.find((c) => c.id === activeChannelId);

  return (
    <div className="flex flex-col h-full text-primary w-full min-w-full">
      {/* ── Big cover — only for the selected channel ───────────────────── */}
      {activeChannel?.coverImage && (
        <div className="h-40 w-full">
          <Image
            height={1000}
            width={1000}
            src={activeChannel.coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <ScrollArea className="flex-1 px-3">
        <div className="mt-4">
          <TeamChannelSection
            sectionType="channels"
            channelType={ChannelType.TEXT}
            role={currentMember?.role}
            label="Channels"
            teamId={currentMember?.teamId}
            members={members.filter((m) => m.userId !== currentMember?.userId)}
          />

          <div className="space-y-[2px] mt-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => router.push(`/team/${teamSlug}/channels/${channel.id}`)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                  activeChannelId === channel.id
                    ? "bg-zinc-200 dark:bg-[#222222] text-zinc-900 dark:text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:dark:bg-[#1a1a1a] hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {/* Small icon/thumbnail per row in the list — not the big banner */}
                {channel.coverImage ? (
                  <Image
                    src={channel.coverImage}
                    alt=""
                    width={20}
                    height={20}
                    className="rounded size-5 object-cover flex-shrink-0"
                  />
                ) : (
                  iconMap[channel.type]
                )}
                <span className="truncate flex-1 text-left">{channel.name}</span>
                {channel.visibility === "RESTRICTED" && (
                  <Lock className="size-3 text-zinc-500 flex-shrink-0" />
                )}
              </button>
            ))}

            {channels.length === 0 && (
              <p className="text-xs text-zinc-500 px-2 py-4 text-center">No channels yet</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}