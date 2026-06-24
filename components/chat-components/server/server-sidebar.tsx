

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
import { ServerMember } from "@/components/chat-components/server/server-member";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 size-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 size-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 size-4" />
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="size-4 mr-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="size-4 mr-2 text-rose-500" />
};

interface ServerSidebarProps {
  serverId: string;
}

export function ServerSidebar({ serverId }: ServerSidebarProps) {
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
  if (loading) return <div className="flex items-center justify-center h-full text-muted-foreground">Loading&hellip;</div>;
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

{/* <Accordion type="single" collapsible defaultValue="item-1">
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
                <ServerMember key={member.id} member={member} server={server} />
              ))}
    </AccordionContent>
  </AccordionItem>
</Accordion> */}
</div>
      </ScrollArea>
    </div>
  );
}

