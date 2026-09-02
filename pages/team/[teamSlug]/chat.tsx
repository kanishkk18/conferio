import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { useRouter } from "next/router";
import { Team } from "@prisma/client";
import { Header } from "@/components/doc-components/Header";
import ThinSidebar from "@/components/ui/thinSidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ChannelSidebar } from "@/components/chat-components/channel/channel-sidebar";

interface ChatHomeProps {
  team: Team;
  firstChannelId: string | null;
}

export default function ChatHome({ team, firstChannelId }: ChatHomeProps) {
  const router = useRouter();

  useEffect(() => {
    if (firstChannelId) {
      router.replace(`/team/${team.slug}/channels/${firstChannelId}`);
    }
  }, [firstChannelId, team.slug, router]);

  return (
    <div className="!h-[100vh] min-h-[100vh] w-screen !max-h-[100vh] dark:bg-black !overflow-hidden">
      <Header />
      <ResizablePanelGroup direction="horizontal" className="overflow-hidden w-screen">
        <ThinSidebar />
        <ResizablePanel defaultSize={22} minSize={0} maxSize={23} className="rounded-tl-2xl h-full max-h-full border-l-[0.5px] bg-[#111] dark:border-neutral-800">
          <ChannelSidebar teamSlug={team.slug} />
        </ResizablePanel>
        <ResizableHandle className="bg-transparent" />
        <ResizablePanel defaultSize={78}>
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            {firstChannelId ? "Loading channel…" : "No channels yet — create one to get started."}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { teamSlug } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  const team = await prisma.team.findUnique({ where: { slug: teamSlug as string } });
  if (!team) return { redirect: { destination: "/chat", permanent: false } };

  const member = await prisma.teamMember.findFirst({
    where: { teamId: team.id, userId: session.user.id },
  });
  if (!member) return { redirect: { destination: "/chat", permanent: false } };

  const firstChannel = await prisma.channel.findFirst({
    where: {
      teamId: team.id,
      OR: [
        { visibility: "TEAM" },
        { members: { some: { teamMemberId: member.id } } },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    props: {
      team: JSON.parse(JSON.stringify(team)),
      firstChannelId: firstChannel?.id ?? null,
    },
  };
};