

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";
import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { ServerHeader } from "@/components/chat-components/server/server-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerSearch } from "@/components/chat-components/server/server-search";
import { Separator } from "@/components/ui/separator";
import { ServerSection } from "@/components/chat-components/server/server-section";
import { ServerChannel } from "@/components/chat-components/server/server-channel";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ChatMember } from "./chat-member";
import MemberChatCards from "@/components/memberchatcards";

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />
};

interface ServerSidebarProps {
  serverId: string;
}

export function ConversationSidebar({ serverId }: ServerSidebarProps) {
  const { data: session } = useSession();
  const { data: serverData, isLoading: loading } = useQuery({
    queryKey: ['serverData', serverId, session?.user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/data`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  const server = serverData?.server ?? null;
  const role = serverData?.role as MemberRole | undefined;

  if (!session?.user) return null;
  if (loading) return <div>Loading&hellip;</div>;
  if (!server) return null;

  const textChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );
  // const audioChannels = server?.channels.filter(
  //   (channel) => channel.type === ChannelType.AUDIO
  // );
  // const videoChannels = server?.channels.filter(
  //   (channel) => channel.type === ChannelType.VIDEO
  // );

  const members = server?.members.filter(
    (member) => member.userId !== session.user.id
  );

  return (
    <div className="flex flex-col h-full text-primary w-full min-w-full ">
      <ServerHeader server={server} role={role} />
      <div className="h-32 w-full -mt-12">
      <Image height={1000} width={1000} src={server.imageUrl} alt="" className="h-full w-full object-cover"/>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type]
                }))
              },
              // {
              //   label: "Voice Channels",
              //   type: "channel",
              //   data: audioChannels?.map((channel) => ({
              //     id: channel.id,
              //     name: channel.name,
              //     icon: iconMap[channel.type]
              //   }))
              // },
              // {
              //   label: "Video Channels",
              //   type: "channel",
              //   data: videoChannels?.map((channel) => ({
              //     id: channel.id,
              //     name: channel.name,
              //     icon: iconMap[channel.type]
              //   }))
              // },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  id: member.id,
                  name: member.user.name,
                  icon: roleIconMap[member.role]
                }))
              }
            ]}
          />
        </div>

        <Separator className="bg-zinc-200 dark:bg-neutral-800 my-2" />
        <div className="gap-y-4 mt-4">
<Accordion type="single" collapsible defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger className="mb-1 px-2 py-0">
      <ServerSection
              sectionType="channels"
              channelType={ChannelType.TEXT}
              role={role}
              label="Channels"
            />
            </AccordionTrigger>
    <AccordionContent className="space-y-[2px] px-0">
      {textChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
    </AccordionContent>
  </AccordionItem>
</Accordion>

<Accordion type="single" collapsible defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger className="mb-1 px-2 flex justify-center items-center">
     
            <ServerSection
              sectionType="members"
              role={role}
              label="Direct Messages"
              server={server}
            />
            </AccordionTrigger>
    <AccordionContent className="space-y-[2px]">
       {members.map((member) => (
                <ChatMember  key={member.id} member={member} 
                     
                    // onMemberSelect={handleMemberSelect}
                    // selectedMemberId={selectedMember?.id}
                    // isCurrentUser={member.userId === session?.user?.id}
                    />
              ))}
               
    </AccordionContent>
  </AccordionItem>
</Accordion>
</div>
      </ScrollArea>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import React from "react";
// import { ChannelType, MemberRole, Member, User } from "@prisma/client";
// import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
// import { ServerHeader } from "@/components/chat-components/server/server-header";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { ServerSearch } from "@/components/chat-components/server/server-search";
// import { Separator } from "@/components/ui/separator";
// import { ServerSection } from "@/components/chat-components/server/server-section";
// import { ServerChannel } from "@/components/chat-components/server/server-channel";
// import Image from "next/image";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { ChatMember } from "./chat-member";

// const iconMap = {
//   [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
//   [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
//   [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />
// };

// const roleIconMap = {
//   [MemberRole.GUEST]: null,
//   [MemberRole.MODERATOR]: (
//     <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />
//   ),
//   [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />
// };

// interface ServerSidebarProps {
//   serverId: string;
//   onMemberSelect?: (member: Member & { user: User }) => void;
//   selectedMemberId?: string;
//   currentUserId?: string;
// }

// export function ConversationSidebar({ 
//   serverId, 
//   onMemberSelect,
//   selectedMemberId,
//   currentUserId
// }: ServerSidebarProps) {
//   const { data: session } = useSession();
//   const [server, setServer] = useState<any>(null);
//   const [role, setRole] = useState<MemberRole | undefined>();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchServerData = async () => {
//       if (!session?.user?.id) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch(`/api/servers/${serverId}/data`);
//         if (response.ok) {
//           const data = await response.json();
//           setServer(data.server);
//           setRole(data.role);
//         }
//       } catch (error) {
//         console.error("Failed to fetch server data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchServerData();
//   }, [serverId, session]);

//   if (!session?.user) return null;
//   if (loading) return <div>Loading&hellip;</div>;
//   if (!server) return null;

//   const textChannels = server?.channels.filter(
//     (channel: any) => channel.type === ChannelType.TEXT
//   );

//   const members = server?.members.filter(
//     (member: any) => member.userId !== session.user.id
//   );

//   return (
//     <div className="flex flex-col h-full text-primary w-full min-w-full dark:bg-[#0B0B0B] bg-[#F3F3F3]">
//       <ServerHeader server={server} role={role} />
//       <div className="h-32 w-full -mt-12">
//         <Image 
//           height={1000} 
//           width={1000} 
//           src={server.imageUrl} 
//           alt="" 
//           className="h-full w-full object-cover"
//         />
//       </div>
//       <ScrollArea className="flex-1 px-3">
//         <div className="mt-2">
//           <ServerSearch
//             data={[
//               {
//                 label: "Channels",
//                 type: "channel",
//                 data: textChannels?.map((channel: any) => ({
//                   id: channel.id,
//                   name: channel.name,
//                   icon: iconMap[channel.type]
//                 }))
//               },
//               {
//                 label: "Members",
//                 type: "member",
//                 data: members?.map((member: any) => ({
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
//           <Accordion type="single" collapsible defaultValue="item-1">
//             <AccordionItem value="item-1" className="border-none">
//               <AccordionTrigger className="mb-1   p-2    hover:no-underline">
//                 <ServerSection
//                   sectionType="channels"
//                   channelType={ChannelType.TEXT}
//                   role={role}
//                   label="Channels"
//                 />
//               </AccordionTrigger>
//               <AccordionContent className="space-y-[2px] px-0">
//                 {textChannels.map((channel: any) => (
//                   <ServerChannel
//                     key={channel.id}
//                     channel={channel}
//                     role={role}
//                     server={server}
//                   />
//                 ))}
//               </AccordionContent>
//             </AccordionItem>
//           </Accordion>

//           <Accordion type="single" collapsible defaultValue="item-2">
//             <AccordionItem value="item-2" className="border-none">
//               <AccordionTrigger className="mb-1   p-2    hover:no-underline">
//                 <ServerSection
//                   sectionType="members"
//                   role={role}
//                   label="Direct Messages"
//                   server={server}
//                 />
//               </AccordionTrigger>
//               <AccordionContent className="space-y-[2px]">
//                 {members.map((member: any) => (
//                   <ChatMember
//                     key={member.id}
//                     member={member}
//                     server={server}
//                     onMemberSelect={onMemberSelect}
//                     selectedMemberId={selectedMemberId}
//                     isCurrentUser={member.userId === currentUserId}
//                   />
//                 ))}
//               </AccordionContent>
//             </AccordionItem>
//           </Accordion>
//         </div>
//       </ScrollArea>
//     </div>
//   );
// }
