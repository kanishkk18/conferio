import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "utils/db";
import { Team } from "@prisma/client";
import { ChatHeader } from "@/components/chat-components/chat/chat-header";
import { ClickUpChatInterface } from "@/components/chat-components/clickup-chat/ChatInterface";
// import { MembersDrawer } from "@/components/chat-components/chat/members-drawer";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import MemberChatCards from "@/components/memberchatcards";
import useTeamMembers, { TeamMemberWithUser } from "hooks/useTeamMembers";
import { useSession } from "next-auth/react";
import { Error, Loading } from "@/components/shared";
import { Header } from "@/components/doc-components/Header";
import { useRouter } from "next/navigation";
// NavigationSidebar / ServerSidebar / ServerSection were server-scoped —
// replace with your team-scoped channel-list sidebar component here.
import { ChannelSidebar } from "@/components/chat-components/channel/channel-sidebar";
import Mainsidebar from "@/components/ui/mainSideBar";
import { MembersDrawer } from "@/components/chat-components/channel/channel-members-drawer";

interface ChannelPageProps {
  channelId: string;
  channel: any;
  team: Team;
}

export default function ChannelPage({ channelId, channel, team }: ChannelPageProps) {
  if (!team) return null;

  const { data: session } = useSession();
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithUser | null>(null);
  const { push } = useRouter();
  const { isLoading, isError, members } = useTeamMembers(team.slug);

  const { data: currentMember = null } = useQuery({
    queryKey: ['currentMember', team.slug, session?.user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/team/${team.slug}/members/me`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (members && members.length > 0 && !selectedMember && currentMember) {
      const otherMembers = members.filter((m) => m.userId !== session?.user?.id);
      setSelectedMember(otherMembers.length > 0 ? otherMembers[0] : members[0]);
    }
  }, [members, selectedMember, session?.user?.id, currentMember]);

  const handleMemberSelect = (member: TeamMemberWithUser) => {
    setSelectedMember(member);
    push(`/team/${team.slug}/conversations/${member.id}`);
  };

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!members) return null;

  return (
    <div className="w-screen !h-screen dark:bg-black !overflow-hidden">
     
        <Header />

      <ResizablePanelGroup direction="horizontal" className="overflow-hidden w-screen">
         <div className="pr-1.5 !rounded-lg !overflow-hidden">
        <Mainsidebar/>
        </div>
        <ResizablePanel defaultSize={22} minSize={0} maxSize={23} className="rounded-tl-xl h-full max-h-full border-x-[0.5px] bg-[#111] dark:border-neutral-800">
          <div className="flex flex-col overflow-y-auto gap-y-4 items-center justify-center">
            {/* Channel list is now purely team-scoped, no server layer */}
            <ChannelSidebar teamSlug={team.slug} activeChannelId={channelId} />
            <Accordion type="single" collapsible defaultValue="item-1" className='w-full px-3'>
              <AccordionItem value="item-1">
                <AccordionTrigger className="mb-1 px-2 flex justify-between items-center min-w-full">
                <p className="mt-1 !text-xs text-start font-normal text-neutral-400">Direct Messages</p>
                </AccordionTrigger>
                <AccordionContent className="space-y-[2px] mt-2">
                  {members?.map((member) => (
                    <MemberChatCards
                      key={member.id}
                      team={team}
                      member={member}
                      onMemberSelect={handleMemberSelect}
                      selectedMemberId={selectedMember?.id}
                      isCurrentUser={member.userId === session?.user?.id}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ResizablePanel>

        <ResizableHandle className="bg-transparent" />

        <ResizablePanel defaultSize={78} className="border-t-0 dark:border-neutral-800">
          <div className="bg-white dark:bg-[#111] flex flex-col h-full">
            <ChatHeader
              channelId={channelId}
              name={channel.name}
              teamId={team.id}
              type="channel"
            />
            <ClickUpChatInterface
              channelId={channelId}
              teamId={team.id}
              type="channel"
              currentMember={currentMember}
            />
            <MembersDrawer teamSlug={team.slug} channelId={channelId} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { teamSlug, channelId } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return { redirect: { destination: "/sign-in", permanent: false } };
  }

  const team = await prisma.team.findUnique({ where: { slug: teamSlug as string } });
  if (!team) {
    return { redirect: { destination: "/", permanent: false } };
  }

  const member = await prisma.teamMember.findFirst({
    where: { teamId: team.id, userId: session.user.id },
  });
  if (!member) {
    return { redirect: { destination: "/", permanent: false } };
  }

  const channel = await prisma.channel.findFirst({
    where: { id: channelId as string, teamId: team.id },
  });
  if (!channel) {
    return { redirect: { destination: `/team/${team.slug}`, permanent: false } };
  }

  if (channel.visibility === "RESTRICTED") {
    const hasAccess = await prisma.channelMember.findFirst({
      where: { channelId: channel.id, teamMemberId: member.id },
    });
    if (!hasAccess) {
      return { redirect: { destination: `/team/${team.slug}`, permanent: false } };
    }
  }

  return {
    props: {
      channelId: channelId as string,
      channel: JSON.parse(JSON.stringify(channel)),
      team: JSON.parse(JSON.stringify(team)),
    },
  };
};