import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "utils/db";
import { ChannelType, Team } from "@prisma/client";
import { NavigationSidebar } from "@/components/chat-components/navigation/navigation-sidebar";
import { ServerSidebar } from "@/components/chat-components/server/server-sidebar";
import { ChatHeader } from "@/components/chat-components/chat/chat-header";
// import { ChatInput } from "@/components/chat-components/chat/chat-input";
import { ChatMessages } from "@/components/chat-components/chat/chat-messages";
// import { MediaRoom } from "@/components/chat-components/media-room";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ThinSidebar from '@/components/ui/thinSidebar';
import { ClickUpChatInterface } from "@/components/chat-components/clickup-chat/ChatInterface";
import { MembersDrawer } from "@/components/chat-components/chat/members-drawer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ServerSection } from "@/components/chat-components/server/server-section";
import MemberChatCards from "@/components/memberchatcards";
import useTeams from "hooks/useTeams";
import useTeamMembers, { TeamMemberWithUser } from "hooks/useTeamMembers";
import { useSession } from "next-auth/react";
import { Error, Loading } from "@/components/shared";
import { Header } from "@/components/doc-components/Header";
import { useRouter } from "next/navigation";

interface ChannelPageProps {
  serverId: string;
  channelId: string;
  channel: any;
  currentMember: any;
  member: any;
  team: Team;
}

interface MembersConversationProps {
  serverId: string;
}

export default function ChannelPage({ serverId, channelId, channel, team }: ChannelPageProps) {
  if (!team) {
    return null; // team not yet available (should never happen after getServerSideProps fix)
  }
  const { data: session } = useSession();
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { push } = useRouter()
  // const [currentMember, setCurrentMember] = useState<TeamMemberWithUser | null>(null);
  const { teams } = useTeams();
  const { isLoading, isError, members, mutateTeamMembers } = useTeamMembers(team.slug);
  const [server, setServer] = useState<any>(null);
  const [role, setRole] = useState<any>();

  const { data: currentMember = null } = useQuery({
    queryKey: ['currentMember', team.slug, session?.user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${team.slug}/members/me`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (members && members.length > 0 && !selectedMember && currentMember) {
      const otherMembers = members.filter(
        (member) => member.userId !== session?.user?.id
      );
      const firstMember = otherMembers.length > 0 ? otherMembers[0] : members[0];
      setSelectedMember(firstMember);
    }
  }, [members, selectedMember, session?.user?.id, currentMember]);


  const handleMemberSelect = (member: TeamMemberWithUser) => {
    setSelectedMember(member);
    push(`/servers/${serverId}/conversations/${member.id}`);
  };


  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!members) {
    return null;
  }

  return (
    <div className="!h-[100vh] min-h-[100vh] w-screen !max-h-[100vh] dark:bg-black !overflow-hidden">
      <Header />
      <ResizablePanelGroup direction="horizontal" className=" overflow-hidden w-screen">
        <ThinSidebar />
        <ResizablePanel defaultSize={5} minSize={4.5} maxSize={4.5}>
          <NavigationSidebar />
        </ResizablePanel>
        <ResizableHandle className="bg-transparent " />
        <ResizablePanel defaultSize={22} minSize={0} maxSize={23} className="rounded-tl-2xl h-full max-h-full border-l-[0.5px] bg-[#111] dark:border-neutral-800">
          <div className="flex flex-col overflow-y-auto gap-y-4 items-center justify-center">
            <ServerSidebar serverId={serverId} />
            <Accordion type="single" collapsible defaultValue="item-1" className='w-full px-3'>
              <AccordionItem value="item-1">
                <AccordionTrigger className="mb-1 px-2 flex justify-center items-center min-w-full">

                  <ServerSection
                    sectionType="members"
                    role={role}
                    label="Direct Messages"
                    server={server}
                  />
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

        <ResizablePanel defaultSize={75} className="border-t-0 dark:border-neutral-800 ">

          <div className="bg-white dark:bg-[#111] flex flex-col h-full ">
            <ChatHeader
              channelId={channelId}
              name={channel.name}
              serverId={channel.serverId}
              type="channel"
            />

            <ClickUpChatInterface
              channelId={channelId}
              serverId={serverId}
              type="channel"
              currentMember={currentMember}
            />

            <MembersDrawer serverId={serverId} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { serverId, channelId } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return { redirect: { destination: "/sign-in", permanent: false } };
  }

  const [channel, member] = await Promise.all([
    prisma.channel.findUnique({ where: { id: channelId as string } }),
    prisma.member.findFirst({
      where: { serverId: serverId as string, userId: session.user.id },
      include: { user: true }
    })
  ]);

  if (!channel || !member) {
    return { redirect: { destination: "/", permanent: false } };
  }

  // Fetch the team the current user belongs to (same strategy as conversations page)
  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    include: { team: true },
    orderBy: { createdAt: "desc" },
  });

  const team = teamMember?.team ?? null;

  if (!team) {
    return { redirect: { destination: "/teams/create", permanent: false } };
  }

  return {
    props: {
      serverId: serverId as string,
      channelId: channelId as string,
      channel: JSON.parse(JSON.stringify(channel)),
      currentMember: JSON.parse(JSON.stringify(member)),
      team: JSON.parse(JSON.stringify(team)),
    }
  };
};

// import React, { useEffect, useState } from "react";
// import { GetServerSideProps } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "utils/db";
// import { ChannelType, Team } from "@prisma/client";
// import { NavigationSidebar } from "@/components/chat-components/navigation/navigation-sidebar";
// import { ServerSidebar } from "@/components/chat-components/server/server-sidebar";
// import { ChatHeader } from "@/components/chat-components/chat/chat-header";
// import { ChatInput } from "@/components/chat-components/chat/chat-input";
// import { ChatMessages } from "@/components/chat-components/chat/chat-messages";
// // import { MediaRoom } from "@/components/chat-components/media-room";
// import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
// import ThinSidebar from '@/components/ui/thinSidebar';
// import { ClickUpChatInterface } from "@/components/chat-components/clickup-chat/ChatInterface";
// import { MembersDrawer } from "@/components/chat-components/chat/members-drawer";
// import { Button } from "@/components/ui/button";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion"
// import { ServerSection } from "@/components/chat-components/server/server-section";
// import MemberChatCards from "@/components/memberchatcards";
// import useTeams from "hooks/useTeams";
// import useTeamMembers, { TeamMemberWithUser } from "hooks/useTeamMembers";
// import { useSession } from "next-auth/react";
// import { Error, Loading } from "@/components/shared";
// import { Header } from "@/components/doc-components/Header";
// import { useRouter } from "next/navigation";

// interface ChannelPageProps {
//   serverId: string;
//   channelId: string;
//   channel: any;
//   currentMember: any;
//   member: any;
//   team: Team;
// }

// interface MembersConversationProps {

//   serverId: string;
// }

// export default function ChannelPage({ serverId, channelId, channel, team }: ChannelPageProps) {
//   const { data: session } = useSession();
//   const [selectedMember, setSelectedMember] = useState<TeamMemberWithUser | null>(null);
//   const [currentMember, setCurrentMember] = useState<TeamMemberWithUser | null>(null);
//   const { push } = useRouter()
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   // const [currentMember, setCurrentMember] = useState<TeamMemberWithUser | null>(null);
//   const { teams } = useTeams();
//   const { isLoading, isError, members, mutateTeamMembers } = useTeamMembers("k9codrr");
//   const [server, setServer] = useState<any>(null);
//   const [role, setRole] = useState<any>();

//   useEffect(() => {
//     const fetchCurrentMember = async () => {
//       try {
//         const response = await fetch(`/api/teams/k9codrr/members/me`);
//         if (response.ok) {
//           const data = await response.json();
//           setCurrentMember(data);
//         }
//       } catch (error) {
//         console.error('Error fetching current member:', error);
//       }
//     };

//     if (session?.user?.id) {
//       fetchCurrentMember();
//     }
//   }, ["k9codrr", session?.user?.id]);


//   useEffect(() => {
//     if (members && members.length > 0 && !selectedMember && currentMember) {
//       const otherMembers = members.filter(
//         (member) => member.userId !== session?.user?.id
//       );
//       const firstMember = otherMembers.length > 0 ? otherMembers[0] : members[0];
//       setSelectedMember(firstMember);
//     }
//   }, [members, selectedMember, session?.user?.id, currentMember]);


//   const handleMemberSelect = (member: TeamMemberWithUser) => {
//     setSelectedMember(member);
//     push(`/servers/${serverId}/conversations/${member.id}`);
//   };


//   if (isLoading) {
//     return <Loading />;
//   }

//   if (isError) {
//     return <Error message={isError.message} />;
//   }

//   if (!members) {
//     return null;
//   }

//   return (
//     <div className="!h-[100vh] min-h-[100vh] w-screen !max-h-[100vh] dark:bg-black !overflow-hidden">
//       <Header />
//       <ResizablePanelGroup direction="horizontal" className=" overflow-hidden w-screen">
//         <ThinSidebar />
//         <ResizablePanel defaultSize={5} minSize={4.5} maxSize={4.5}>
//           <NavigationSidebar />
//         </ResizablePanel>
//         <ResizableHandle className="bg-transparent " />
//         <ResizablePanel defaultSize={22} minSize={0} maxSize={23} className="rounded-tl-2xl h-full max-h-full border-l-[0.5px] bg-[#111] dark:border-neutral-800">
//           <div className="flex flex-col overflow-y-auto space-y-4 items-center justify-center">
//             <ServerSidebar serverId={serverId} />
//             <Accordion type="single" collapsible defaultValue="item-1" className='w-full px-3'>
//               <AccordionItem value="item-1">
//                 <AccordionTrigger className="mb-1 px-2 flex justify-center items-center min-w-full">

//                   <ServerSection
//                     sectionType="members"
//                     role={role}
//                     label="Direct Messages"
//                     server={server}
//                   />
//                 </AccordionTrigger>
//                 <AccordionContent className="space-y-[2px] mt-2">
//                   {members?.map((member) => (
//                     <MemberChatCards
//                       key={member.id}
//                       team={team}
//                       member={member}
//                       onMemberSelect={handleMemberSelect}
//                       selectedMemberId={selectedMember?.id}
//                       isCurrentUser={member.userId === session?.user?.id}
//                     />
//                   ))}
//                 </AccordionContent>
//               </AccordionItem>
//             </Accordion>
//           </div>
//         </ResizablePanel>

//         <ResizableHandle className="bg-transparent" />

//         <ResizablePanel defaultSize={75} className="border-t-0 dark:border-neutral-800 ">

//           <div className="bg-white dark:bg-[#111] flex flex-col h-full ">
//             <ChatHeader
//               channelId={channelId}
//               name={channel.name}
//               serverId={channel.serverId}
//               type="channel"
//             />

//             <ClickUpChatInterface
//               channelId={channelId}
//               serverId={serverId}
//               type="channel"
//               currentMember={currentMember}
//             />

//             <MembersDrawer serverId={serverId} />
//           </div>
//         </ResizablePanel>
//       </ResizablePanelGroup>
//     </div>
//   );
// }

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { serverId, channelId } = context.params!;
//   const session = await getServerSession(context.req, context.res, authOptions);

//   if (!session?.user?.id) {
//     return { redirect: { destination: "/sign-in", permanent: false } };
//   }

//   const [channel, member] = await Promise.all([
//     prisma.channel.findUnique({ where: { id: channelId as string } }),
//     prisma.member.findFirst({
//       where: { serverId: serverId as string, userId: session.user.id },
//       include: { user: true }
//     })
//   ]);

//   if (!channel || !member) {
//     return { redirect: { destination: "/", permanent: false } };
//   }

//   return {
//     props: {
//       serverId: serverId as string,
//       channelId: channelId as string,
//       channel: JSON.parse(JSON.stringify(channel)),
//       currentMember: JSON.parse(JSON.stringify(member))
//     }
//   };
// };