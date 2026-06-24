// import React from "react";
// import { Hash } from "lucide-react";

// import { MobileToggle } from "@/components/chat-components/mobile-toggle";
// import { UserAvatar } from "@/components/chat-components//user-avatar";
// import { SocketIndicatior } from "@/components/chat-components/socket-indicatior";
// import { ChatVideoButton } from "./chat-video-button";

import React from 'react';
import { Hash } from 'lucide-react';

import { MobileToggle } from '@/components/chat-components/mobile-toggle';
import { UserAvatar } from '@/components/chat-components/user-avatar';
import { SocketIndicatior } from '@/components/chat-components/socket-indicatior';
import { ChatVideoButton } from './chat-video-button';
import DynamicIslandDemo from '@/components/ui/DynamicIslandDemo';
import { Separator } from '@/components/ui/separator';
import UserComponent from '@/components/ui/comp-377';
import { TaskForm } from '@/components/tasks/task-form';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Button } from '../ui/button';
import { CirclePlus } from '@/components/animate-ui/icons/circle-plus';
import { ChannelMemberManager } from '../clickup-chat/ChannelMemberManager';
import CallButtons from '@/components/calls/CallButtons';
import { SearchTrigger } from '@/components/search/SearchTrigger';

interface ChatHeaderProps {
  channelId
  serverId: string;
  name: string;
  type: 'channel' | 'conversation';
  image?: string;
}

export function ChatHeader({ name, serverId, type, image, channelId }: ChatHeaderProps) {
  return (
    <div className="text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b">
      <MobileToggle serverId={serverId} />
      {type === 'channel' && (
        <Hash className="size-5 text-zinc-500 dark:text-zinc-400 mr-2" />
      )}

      {type === 'conversation' && (
        <UserAvatar src={image} className="h-8 w-8 md:h-8 md:w-8 mr-2" />
      )}<SocketIndicatior />

      <p className="font-semibold text-md text-black dark:text-white">{name}</p>
      <ChannelMemberManager channelId={channelId} serverId={serverId} />

      
    </div>
  );
}
