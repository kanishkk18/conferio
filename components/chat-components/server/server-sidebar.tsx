

// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useSession } from "next-auth/react";
// import React from "react";
// import { ChannelType, MemberRole } from "@prisma/client";
// import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
// import { ServerHeader } from "@/components/chat-components/server/server-header";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { ServerSearch } from "@/components/chat-components/server/server-search";
// import { Separator } from "@/components/ui/separator";
// import { ServerSection } from "@/components/chat-components/server/server-section";
// import { ServerChannel } from "@/components/chat-components/server/server-channel";
// import { ServerMember } from "@/components/chat-components/server/server-member";
// import Image from "next/image";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion"

// const iconMap = {
//   [ChannelType.TEXT]: <Hash className="mr-2 size-4" />,
//   [ChannelType.AUDIO]: <Mic className="mr-2 size-4" />,
//   [ChannelType.VIDEO]: <Video className="mr-2 size-4" />
// };

// const roleIconMap = {

//   [MemberRole.MODERATOR]: (
//     <ShieldCheck className="size-4 mr-2 text-indigo-500" />
//   ),
//   [MemberRole.ADMIN]: <ShieldAlert className="size-4 mr-2 text-rose-500" />
// };

// interface ServerSidebarProps {
//   serverId: string;
// }

// export function ServerSidebar({ serverId }: ServerSidebarProps) {
//   const { data: session } = useSession();

//   const { data: serverData, isLoading: loading } = useQuery({
//     queryKey: ['serverData', serverId, session?.user?.id],
//     queryFn: async () => {
//       const response = await fetch(`/api/servers/${serverId}/data`);
//       if (!response.ok) return null;
//       return response.json();
//     },
//     enabled: !!session?.user?.id,
//   });

//   const server = serverData?.server ?? null;
//   const role = serverData?.role as MemberRole | undefined;

//   if (!session?.user) return null;
//   if (loading) return <div className="flex items-center justify-center h-full text-muted-foreground">Loading&hellip;</div>;
//   if (!server) return null;

//   const textChannels = server?.channels.filter(
//     (channel) => channel.type === ChannelType.TEXT
//   );
//   // const audioChannels = server?.channels.filter(
//   //   (channel) => channel.type === ChannelType.AUDIO
//   // );
//   // const videoChannels = server?.channels.filter(
//   //   (channel) => channel.type === ChannelType.VIDEO
//   // );

//   const members = server?.members.filter(
//     (member) => member.userId !== session.user.id
//   );

//   return (
//     <div className="flex flex-col h-full text-primary w-full min-w-full ">
//       <ServerHeader server={server} role={role} />
//       <div className="h-32 w-full -mt-12">
//       <Image height={1000} width={1000} src={server.imageUrl} alt="" className="h-full w-full object-cover"/>
//       </div>
//       <ScrollArea className="flex-1 px-3">
//         <div className="mt-2">
//           <ServerSearch
//             data={[
//               {
//                 label: "Channels",
//                 type: "channel",
//                 data: textChannels?.map((channel) => ({
//                   id: channel.id,
//                   name: channel.name,
//                   icon: iconMap[channel.type]
//                 }))
//               },
//               // {
//               //   label: "Voice Channels",
//               //   type: "channel",
//               //   data: audioChannels?.map((channel) => ({
//               //     id: channel.id,
//               //     name: channel.name,
//               //     icon: iconMap[channel.type]
//               //   }))
//               // },
//               // {
//               //   label: "Video Channels",
//               //   type: "channel",
//               //   data: videoChannels?.map((channel) => ({
//               //     id: channel.id,
//               //     name: channel.name,
//               //     icon: iconMap[channel.type]
//               //   }))
//               // },
//               {
//                 label: "Members",
//                 type: "member",
//                 data: members?.map((member) => ({
//                   id: member.id,
//                   name: member.user.name,
//                   icon: roleIconMap[member.role]
//                 }))
//               }
//             ]}
//           />
//         </div>

//         <Separator className="bg-zinc-200 dark:bg-neutral-800 my-2" />
//         <div className="gap-y-4 mt-4">
// <Accordion type="single" collapsible defaultValue="item-1">
//   <AccordionItem value="item-1">
//     <AccordionTrigger className="mb-1 px-2 py-0">
//       <ServerSection
//               sectionType="channels"
//               channelType={ChannelType.TEXT}
//               role={role}
//               label="Channels"
//             />
//             </AccordionTrigger>
//     <AccordionContent className="space-y-[2px] px-0">
//       {textChannels.map((channel) => (
//                 <ServerChannel
//                   key={channel.id}
//                   channel={channel}
//                   role={role}
//                   server={server}
//                 />
//               ))}
//     </AccordionContent>
//   </AccordionItem>
// </Accordion>

// {/* <Accordion type="single" collapsible defaultValue="item-1">
//   <AccordionItem value="item-1">
//     <AccordionTrigger className="mb-1 px-2 flex justify-center items-center">

//             <ServerSection
//               sectionType="members"
//               role={role}
//               label="Direct Messages"
//               server={server}
//             />
//             </AccordionTrigger>
//     <AccordionContent className="space-y-[2px]">
//        {members.map((member) => (
//                 <ServerMember key={member.id} member={member} server={server} />
//               ))}
//     </AccordionContent>
//   </AccordionItem>
// </Accordion> */}
// </div>
//       </ScrollArea>
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
      const res = await fetch(`/api/teams/${teamSlug}/channels`);
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
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading…</div>;
  }

  return (
    <div className="flex flex-col h-full text-primary w-full min-w-full">

      {channels.map((channel) => (
        <>
          {channel.coverImage ? (
            <div className="h-32 w-full -mt-12">
              <Image height={1000} width={1000} src={channel.coverImage} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            iconMap[channel.type]
          )}
        </>
      ))}

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
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${activeChannelId === channel.id
                    ? "bg-zinc-200 dark:bg-[#222222] text-zinc-900 dark:text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:dark:bg-[#1a1a1a] hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
              >
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