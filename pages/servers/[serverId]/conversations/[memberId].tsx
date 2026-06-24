// import React from "react";
// import { GetServerSideProps } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "utils/db";
// import { getOrCreateConversation } from "@/lib/conversation";
// import { NavigationSidebar } from "@/components/chat-components/navigation/navigation-sidebar";
// import { ServerSidebar } from "@/components/chat-components/server/server-sidebar";
// import { ChatHeader } from "@/components/chat-components/chat/chat-header";
// import { ChatMessages } from "@/components/chat-components/chat/chat-messages";
// import { ChatInput } from "@/components/chat-components/chat/chat-input";
// import { MediaRoom } from "@/components/chat-components/media-room";
// import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
// import ThinSidebar from '@/components/ui/thinSidebar';


// interface MemberIdPageProps {
//   serverId: string;
//   memberId: string;
//   conversation: any;
//   currentMember: any;
//   otherMember: any;
//   video?: boolean;
// }

// export default function MemberIdPage({
//   serverId,
//   memberId,
//   conversation,
//   currentMember,
//   otherMember,
//   video
// }: MemberIdPageProps) {
//   return (
//     <ResizablePanelGroup direction="horizontal" className="max-h-screen min-h-screen w-screen dark:bg-black">
//         <ThinSidebar />
//       <ResizablePanel defaultSize={5} minSize={4.5} maxSize={4.5} className="dark:bg-black">
//         <NavigationSidebar />
//       </ResizablePanel>
//       <ResizableHandle className="bg-transparent " />
//       <ResizablePanel defaultSize={22} minSize={18} maxSize={26} className="rounded-tl-2xl border dark:border-neutral-800 mt-6">
//         <div className="flex h-full items-center justify-center">
//           <ServerSidebar serverId={serverId} />
//         </div>
//       </ResizablePanel>

//       <ResizableHandle className="bg-transparent" />
//       <ResizablePanel defaultSize={75} className="border-t dark:border-neutral-800 mt-6">

//         <div className="bg-white dark:bg-[#070709] flex flex-col h-full ">
//           <ChatHeader
//             image={otherMember.user.image}
//             name={otherMember.user.name}
//             serverId={serverId}
//             type="conversation"
//           />
//           {video && <MediaRoom chatId={conversation.id} video audio />}
//           {!video && (
//             <>
//               <ChatMessages
//                 member={currentMember}
//                 name={otherMember.user.name}
//                 chatId={conversation.id}
//                 type="conversation"
//                 apiUrl="/api/direct-messages"
//                 paramKey="conversationId"
//                 paramValue={conversation.id}
//                 socketUrl="/api/socket/direct-messages"
//                 socketQuery={{
//                   conversationId: conversation.id
//                 }}
//               />
//               <ChatInput
//                 name={otherMember.user.name}
//                 type="conversation"
//                 apiUrl="/api/socket/direct-messages"
//                 query={{
//                   conversationId: conversation.id
//                 }}
//               />
//             </>
//           )}
//         </div>
//       </ResizablePanel>
//     </ResizablePanelGroup>
//   );
// }

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { serverId, memberId } = context.params!;
//   const { video } = context.query;
//   const session = await getServerSession(context.req, context.res, authOptions);

//   if (!session?.user?.id) {
//     return {
//       redirect: {
//         destination: "/sign-in",
//         permanent: false,
//       },
//     };
//   }

//   const user = await prisma.user.findUnique({
//     where: { id: session.user.id }
//   });

//   if (!user) {
//     return {
//       redirect: {
//         destination: "/sign-in",
//         permanent: false,
//       },
//     };
//   }

//   const currentMember = await prisma.member.findFirst({
//     where: {
//       serverId: serverId as string,
//       userId: user.id
//     },
//     include: {
//       user: true
//     }
//   });

//   if (!currentMember) {
//     return {
//       redirect: {
//         destination: "/",
//         permanent: false,
//       },
//     };
//   }

//   const conversation = await getOrCreateConversation(
//     currentMember.id,
//     memberId as string
//   );

//   if (!conversation) {
//     return {
//       redirect: {
//         destination: `/servers/${serverId}`,
//         permanent: false,
//       },
//     };
//   }

//   const { memberOne, memberTwo } = conversation;
//   const otherMember = memberOne.userId === user.id ? memberTwo : memberOne;

//   return {
//     props: {
//       serverId: serverId as string,
//       memberId: memberId as string,
//       conversation: JSON.parse(JSON.stringify(conversation)),
//       currentMember: JSON.parse(JSON.stringify(currentMember)),
//       otherMember: JSON.parse(JSON.stringify(otherMember)),
//       video: video === "true" || false,
//     },
//   };
// };

// // pages/servers/[serverId]/conversations/[memberId].tsx
// import React from "react";
// import { GetServerSideProps } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import { getOrCreateConversation } from "@/lib/conversation";
// import { NavigationSidebar } from "@/components/chat-components/navigation/navigation-sidebar";
// import { ServerSidebar } from "@/components/chat-components/server/server-sidebar";
// import { ChatHeader } from "@/components/chat-components/chat/chat-header";
// import { ChatMessages } from "@/components/chat-components/chat/chat-messages";
// import { ChatInput } from "@/components/chat-components/chat/chat-input";
// import { MediaRoom } from "@/components/chat-components/media-room";
// import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
// import ThinSidebar from '@/components/ui/thinSidebar';

// interface MemberIdPageProps {
//   serverId: string;
//   memberId: string;
//   conversationId: string;
//   conversation: any;
//   currentMember: any;
//   otherMember: any;
//   video?: boolean;
// }

// export default function MemberIdPage({
//   serverId,
//   memberId,
//   conversationId,
//   conversation,
//   currentMember,
//   otherMember,
//   video
// }: MemberIdPageProps) {
//   return (
//     <ResizablePanelGroup direction="horizontal" className="max-h-screen min-h-screen w-screen dark:bg-black">
//       <ThinSidebar />
//       <ResizablePanel defaultSize={5} minSize={4.5} maxSize={4.5} className="dark:bg-black">
//         <NavigationSidebar />
//       </ResizablePanel>
//       <ResizableHandle className="bg-transparent" />
      
//       <ResizablePanel defaultSize={22} minSize={18} maxSize={26} className="rounded-tl-2xl border dark:border-neutral-800 mt-6">
//         <div className="flex h-full items-center justify-center">
//           <ServerSidebar serverId={serverId} />
//         </div>
//       </ResizablePanel>

//       <ResizableHandle className="bg-transparent" />
//       <ResizablePanel defaultSize={75} className="border-t dark:border-neutral-800 mt-6">
//         <div className="bg-white dark:bg-[#070709] flex flex-col h-full">
//           <ChatHeader
//             image={otherMember.user.image}
//             name={otherMember.user.name}
//             serverId={serverId}
//             type="conversation"
//           />
//           {video && <MediaRoom chatId={conversationId} video audio />}
//           {!video && (
//             <>
//               <ChatMessages
//                 member={currentMember}
//                 name={otherMember.user.name}
//                 chatId={conversationId}
//                 type="conversation"
//                 apiUrl="/api/direct-messages"
//                 paramKey="conversationId"
//                 paramValue={conversationId}
//                 socketUrl="/api/socket/direct-messages"
//                 socketQuery={{
//                   conversationId: conversationId
//                 }}
//               />
//               <ChatInput
//                 name={otherMember.user.name}
//                 type="conversation"
//                 apiUrl="/api/socket/direct-messages"
//                 query={{
//                   conversationId: conversationId
//                 }}
//               />
//             </>
//           )}
//         </div>
//       </ResizablePanel>
//     </ResizablePanelGroup>
//   );
// }

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { serverId, memberId } = context.params!;
//   const { video, conversationId: queryConversationId } = context.query;
  
//   const session = await getServerSession(context.req, context.res, authOptions);

//   if (!session?.user?.id) {
//     return {
//       redirect: {
//         destination: "/sign-in",
//         permanent: false,
//       },
//     };
//   }

//   let conversation;
//   let currentMember;
//   let otherMember;

//   // If conversationId is passed in query, use it directly (from sidebar click)
//   if (queryConversationId && typeof queryConversationId === 'string') {
//     conversation = await prisma.conversation.findUnique({
//       where: { id: queryConversationId },
//       include: {
//         memberOne: { include: { user: true } },
//         memberTwo: { include: { user: true } }
//       }
//     });

//     if (conversation) {
//       const isMemberOne = conversation.memberOne.userId === session.user.id;
//       currentMember = isMemberOne ? conversation.memberOne : conversation.memberTwo;
//       otherMember = isMemberOne ? conversation.memberTwo : conversation.memberOne;
//     }
//   }

//   // Fallback to creating/getting conversation by member IDs
//   if (!conversation) {
//     const user = await prisma.user.findUnique({
//       where: { id: session.user.id }
//     });

//     if (!user) {
//       return {
//         redirect: {
//           destination: "/sign-in",
//           permanent: false,
//         },
//       };
//     }

//     currentMember = await prisma.member.findFirst({
//       where: {
//         serverId: serverId as string,
//         userId: user.id
//       },
//       include: { user: true }
//     });

//     if (!currentMember) {
//       return {
//         redirect: {
//           destination: "/",
//           permanent: false,
//         },
//       };
//     }

//     conversation = await getOrCreateConversation(
//       currentMember.id,
//       memberId as string
//     );

//     if (!conversation) {
//       return {
//         redirect: {
//           destination: `/servers/${serverId}`,
//           permanent: false,
//         },
//       };
//     }

//     const { memberOne, memberTwo } = conversation;
//     otherMember = memberOne.userId === user.id ? memberTwo : memberOne;
//   }

//   return {
//     props: {
//       serverId: serverId as string,
//       memberId: memberId as string,
//       conversationId: conversation.id,
//       conversation: JSON.parse(JSON.stringify(conversation)),
//       currentMember: JSON.parse(JSON.stringify(currentMember)),
//       otherMember: JSON.parse(JSON.stringify(otherMember)),
//       video: video === "true" || false,
//     },
//   };
// };
// // components/TeamMembersView.tsx
// import { useState, useEffect } from 'react';
// import { Team } from '@prisma/client';
// import { TeamMemberWithUser } from 'hooks/useTeamMembers';
// import { useSession } from 'next-auth/react';
// import useTeamMembers from 'hooks/useTeamMembers';
// import { Loading, Error } from '@/components/shared';
// import useTeams from 'hooks/useTeams';
// import MemberChatCards from '@/components/memberchatcards';
// import ChatConversationInterface from '@/components/chatconversationinterface';
// import { NavigationSidebar } from "@/components/chat-components/navigation/navigation-sidebar";
// import { ServerSidebar } from "@/components/chat-components/server/server-sidebar";
// import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
// import ThinSidebar from '@/components/ui/thinSidebar';
// import { ConversationSidebar } from '@/components/chat-components/server/conversation-sidebar';



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

//   const handleCloseSidebar = () => {
//     setIsSidebarOpen(false);
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
//             <div className="flex flex-col overflow-y-auto h-[70vh] items-center justify-center">
               
           
//               <ServerSidebar serverId={serverId}/>
               
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

// pages/servers/[serverId]/conversations/[memberId].tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MembersConversation from '@/components/members-conversation';
import { Team, Server } from '@prisma/client';

interface TeamWithSlug extends Team {
  slug: string;
}

interface PageProps {
  serverId: string;
  memberId: string;
  team: TeamWithSlug | null;
  server: Server | null;
}

export default function ConversationPage({ serverId, memberId, team, server }: PageProps) {
  // If no team found, render error or redirect logic could go here
  if (!team) {
    return (
      <div className="flex items-center justify-center h-screen dark:bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-500 mb-2">Team Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">
            No team associated with this server.
          </p>
        </div>
      </div>
    );
  }

  // Pass team directly to avoid fetching in component
  return <MembersConversation team={team} serverId={serverId} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { serverId, memberId } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return { 
      redirect: { 
        destination: '/sign-in', 
        permanent: false 
      } 
    };
  }

  try {
    // Verify user is member of this server
    const server = await prisma.server.findUnique({
      where: { id: serverId as string },
      include: {
        members: {
          where: { userId: session.user.id },
          select: { id: true, role: true }
        }
      }
    });

    if (!server) {
      return { 
        redirect: { 
          destination: '/404', 
          permanent: false 
        } 
      };
    }

    if (server.members.length === 0) {
      return { 
        redirect: { 
          destination: '/', 
          permanent: false 
        } 
      };
    }

    // STRATEGY 1: If Server model has a teamId field (most common)
    // Uncomment if your schema has this relation:
    /*
    const team = await prisma.team.findUnique({
      where: { 
        id: (server as any).teamId 
      }
    });
    

    // STRATEGY 2: If Team model has a serverId field
    // Uncomment if your schema has this relation:
    /*
    const team = await prisma.team.findFirst({
      where: { 
        serverId: serverId as string 
      }
    });
    */

    // STRATEGY 3: Find team through TeamMember where user is member
    // This works if user is in a team that's "linked" to this server context
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        team: {
          // Optional: Add server-related filter if you have a relation
          // serverId: serverId as string,
        }
      },
      include: {
        team: true
      },
      orderBy: {
        createdAt: 'desc' // Get most recent team membership
      }
    });

    let team = teamMember?.team || null;

    // STRATEGY 4: If no direct relation, get user's first team as fallback
    // Remove this if you want strict server-team matching
    if (!team) {
      const fallbackTeamMember = await prisma.teamMember.findFirst({
        where: { userId: session.user.id },
        include: { team: true },
        orderBy: { createdAt: 'desc' }
      });
      team = fallbackTeamMember?.team || null;
    }

    if (!team) {
      return { 
        redirect: { 
          destination: '/teams/create', 
          permanent: false 
        } 
      };
    }

    // Verify the other member exists in this context
    const otherMember = await prisma.member.findFirst({
      where: {
        id: memberId as string,
        serverId: serverId as string
      },
      include: {
        user: true
      }
    });

    return {
      props: {
        serverId: serverId as string,
        memberId: memberId as string,
        team: JSON.parse(JSON.stringify(team)),
        server: JSON.parse(JSON.stringify(server)),
        // You can pass otherMember here if needed by the component
      }
    };

  } catch (error) {
    console.error('Error in conversations page:', error);
    return { 
      redirect: { 
        destination: '/500', 
        permanent: false 
      } 
    };
  }
};