import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";
import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, Search, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { ServerHeader } from "@/components/chat-components/server/server-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerSearch } from "@/components/chat-components/server/server-search";
import { Separator } from "@/components/ui/separator";
import { ServerSection } from "@/components/chat-components/server/server-section";
import { ServerChannel } from "@/components/chat-components/server/server-channel";
import { ServerMember } from "@/components/chat-components/server/server-member";
import Image from "next/image";

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/member-drawer"

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

export function MembersDrawer({ serverId }: ServerSidebarProps) {
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
    <Drawer direction="bottom">
      <DrawerTrigger className="border border-border dark:border-[#222] rounded-lg w-fit fixed top-24 right-3" asChild>
        <div className="flex flex-col items-center gap-2   p-1  ">

          {members.map((member) => (
            <ServerMember key={member.id} member={member} server={server} />
          ))}

          <Search className="h-4 w-4 " />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-[26vw] !left-auto mr-16 dark:bg-black border border-border dark:border-[#222] max-w-fit h-[96vh] mt-auto z-50 ">
        <DrawerHeader className="dark:bg-[#111]">
          <DrawerTitle>Move Goal</DrawerTitle>
          <DrawerDescription>Set your daily activity goal.</DrawerDescription>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4">

          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
          enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident,
          sunt in culpa qui officia deserunt mollit anim id est laborum.

        </div>
        <DrawerFooter>
          <Button type="submit">Add members</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
