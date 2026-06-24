import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { NavigationAction } from "@/components/chat-components/navigation/navigation-action";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "@/components/chat-components/navigation/navigation-item";
import Image from "next/image";
import Link from "next/link";


interface Server {
  id: string;
  name: string;
  imageUrl: string;
}

export function NavigationSidebar() {
  const { data: session } = useSession();

  const { data: servers = [], isLoading: loading } = useQuery({
    queryKey: ['servers', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/servers');
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  if (!session?.user) return null;
  if (loading) return <div className="h-full w-full bg-gray-100 dark:bg-gray-950">

  </div>;

  return (
    <div className="gap-y-4 flex flex-col h-full pt-3 items-center text-primary w-full">
      <Link href="/dashboard" className=" p-2 h-11 w-11 bg-neutral-800 rounded-xl hover:bg-blue-700">
      <Image src="/logo-transparent.png" alt="Server Image" width={1000} height={1000} className="rounded-full h-full w-full object-contain" />
      </Link>
      <Separator className="h-[2px] mb-4 bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server.id} className="mb-4">
            <NavigationItem
              id={server.id}
              imageUrl={server.imageUrl}
              name={server.name}
            />
          </div>
        ))}
              {/* <Separator className="h-[2px] mb-4 bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" /> */}

        <NavigationAction  />
      </ScrollArea>
      
     
    </div>
  );
}
