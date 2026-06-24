"use client";

import React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/chat-components/action-tooltip";

interface NavigationItemProps {
  id: string;
  imageUrl: string;
  name: string;
}

export function NavigationItem({ id, imageUrl, name }: NavigationItemProps) {
  const params = useParams();
const { push } = useRouter()
  const onClick = () => {
    push(`/servers/${id}`);
  };

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button type="button" onClick={onClick} className="group relative flex items-center">
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-full transition-all w-[4px]",
            params?.serverId !== id && "group-hover:h-[20px]",
            params?.serverId === id ? "h-[36px]" : "h-[10px]"
          )}
        />
        <div
          className={cn(
            "relative group flex mx-3 h-[42px] w-[42px] border dark:border-[#191919] rounded-xl group-hover:rounded-2xl transition-all overflow-hidden",
            params?.serverId === id &&
              "bg-primary/10 text-primary rounded-[16px]"
          )}
        >
          <Image src={imageUrl}  width={400}
           height={400} alt="Channel" />
        </div>
      </button>
    </ActionTooltip>
  );
}
