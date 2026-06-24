// // components/TeamMembersView.tsx
// import { useState, useEffect } from 'react';
// import { Team } from '@prisma/client';
// import { TeamMemberWithUser } from 'hooks/useTeamMembers';
// import { useSession } from 'next-auth/react';
// import useTeamMembers from 'hooks/useTeamMembers';
// import { Loading, Error } from '@/components/shared';
// import useTeams from 'hooks/useTeams';
// import MemberChatCards from './memberchatcards';
// import ChatConversationInterface from './chatconversationinterface';
// import { NavigationSidebar } from "@/components/chat-components/navigation/navigation-sidebar";
// import { ServerSidebar } from "@/components/chat-components/server/server-sidebar";
// import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
// import ThinSidebar from '@/components/ui/thinSidebar';
// import { ConversationSidebar } from './chat-components/server/conversation-sidebar';



// interface MembersConversationProps {
//   team: Team;
//   serverId: string;
// }

// const MembersConversation = ({serverId, team }: MembersConversationProps) => {
//   const { data: session } = useSession();
//   const [visible, setVisible] = useState(false);
//   const [selectedMember, setSelectedMember] = useState<TeamMemberWithUser | null>(null);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [currentMember, setCurrentMember] = useState<TeamMemberWithUser | null>(null);
//   const { teams } = useTeams();
//   const { isLoading, isError, members, mutateTeamMembers } = useTeamMembers(team.slug);
//   // Auto-select first member (other than current user) when members load

//   useEffect(() => {
//     const fetchCurrentMember = async () => {
//       try {
//         const response = await fetch(`/api/teams/${team.slug}/members/me`);
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
//   }, [team.slug, session?.user?.id]);


//  useEffect(() => {
//     if (members && members.length > 0 && !selectedMember && currentMember) {
//       const otherMembers = members.filter(
//         (member) => member.userId !== session?.user?.id
//       );
//       const firstMember = otherMembers.length > 0 ? otherMembers[0] : members[0];
//       setSelectedMember(firstMember);
//       setIsSidebarOpen(true);
//     }
//   }, [members, selectedMember, session?.user?.id, currentMember]);


//   const handleMemberSelect = (member: TeamMemberWithUser) => {
//     setSelectedMember(member);
//     setIsSidebarOpen(true);
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
//     <>
//      <ResizablePanelGroup direction="horizontal" className="max-h-screen min-h-screen w-screen dark:bg-black">
//       <ThinSidebar />
//       <ResizablePanel defaultSize={5} minSize={4.5} maxSize={4.5} className="dark:bg-black">
//         <NavigationSidebar />
//       </ResizablePanel>
//       <ResizableHandle className="bg-transparent" />


//           <ResizablePanel defaultSize={22} minSize={18} maxSize={26} className="rounded-tl-2xl border dark:border-neutral-800 mt-6">
//             <div className="flex flex-col overflow-y-auto items-center justify-center">


//               {/* <ConversationSidebar serverId={serverId} selectedMember={selectedMember} /> */}

//                 {members?.map((member) => (
//                   <MemberChatCards
//                     key={member.id}
//                     team={team}
//                     member={member}
//                     onMemberSelect={handleMemberSelect}
//                     selectedMemberId={selectedMember?.id}
//                     isCurrentUser={member.userId === session?.user?.id}
//                   />
//                 ))}

//             </div>
//           </ResizablePanel>
//           <ResizableHandle className="bg-transparent" />



//       <ResizablePanel defaultSize={75} className="border-t dark:border-neutral-800 mt-6">
//         <div className="bg-white dark:bg-[#070709] flex flex-col h-full">
//           {/* <ChatHeader
//             image={selectedMember?.user.image}
//             name={selectedMember?.user.name}
//             serverId={team.slug}
//             type="conversation"
//           /> */}



//           <ChatConversationInterface
//               team={team}
//               selectedMember={selectedMember}
//               currentMember={currentMember}
//             />
//         </div>
//       </ResizablePanel>
//     </ResizablePanelGroup>
//     </>
//   );
// };

// export default MembersConversation ;

// components/TeamMembersView.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Team } from '@prisma/client';
import { TeamMemberWithUser } from 'hooks/useTeamMembers';
import { useSession } from 'next-auth/react';
import useTeamMembers from 'hooks/useTeamMembers';
import { Loading, Error } from '@/components/shared';
import useTeams from 'hooks/useTeams';
import MemberChatCards from './memberchatcards';
import ChatConversationInterface from './chatconversationinterface';
import { NavigationSidebar } from "@/components/chat-components/navigation/navigation-sidebar";
import { ServerSidebar } from "@/components/chat-components/server/server-sidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ThinSidebar from '@/components/ui/thinSidebar';
import { ConversationSidebar } from './chat-components/server/conversation-sidebar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ServerSection } from './chat-components/server/server-section';


interface MembersConversationProps {
  team: Team;
  serverId: string;
}

const MembersConversation = ({ serverId, team }: MembersConversationProps) => {
  const { data: session } = useSession();
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      setIsSidebarOpen(true);
    }
  }, [members, selectedMember, session?.user?.id, currentMember]);


  const handleMemberSelect = (member: TeamMemberWithUser) => {
    setSelectedMember(member);
    setIsSidebarOpen(true);
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
    <>
      <ResizablePanelGroup direction="horizontal" className="max-h-screen min-h-screen w-screen dark:bg-black">
        <ThinSidebar />
        <ResizablePanel defaultSize={5} minSize={4.5} maxSize={4.5} className="dark:bg-black">
          <NavigationSidebar />
        </ResizablePanel>
        <ResizableHandle className="bg-transparent" />

        <ResizablePanel defaultSize={22} minSize={18} maxSize={26} className="rounded-tl-2xl border dark:border-neutral-800 mt-6">
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
        <ResizablePanel defaultSize={75} className="border-t dark:border-neutral-800 mt-6">
          <div className="bg-white dark:bg-[#070709] flex flex-col h-full">
            {/* <ChatHeader
            image={selectedMember?.user.image}
            name={selectedMember?.user.name}
            serverId={team.slug}
            type="conversation"
          /> */}

            <ChatConversationInterface
              team={team}
              selectedMember={selectedMember}
              currentMember={currentMember}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

export default MembersConversation;
