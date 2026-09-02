
// // pages/team/[serverId]/conversations/[memberId].tsx
// import { GetServerSideProps } from 'next';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';
// import MembersConversation from '@/components/members-conversation';
// import { Team, Server } from '@prisma/client';

// interface TeamWithSlug extends Team {
//   slug: string;
// }

// interface PageProps {
//   serverId: string;
//   memberId: string;
//   team: TeamWithSlug | null;
//   server: Server | null;
// }

// export default function ConversationPage({ memberId, team, server }: PageProps) {
//   // If no team found, render error or redirect logic could go here
//   if (!team) {
//     return (
//       <div className="flex items-center justify-center h-screen dark:bg-black">
//         <div className="text-center">
//           <h1 className="text-2xl font-semibold text-red-500 mb-2">Team Not Found</h1>
//           <p className="text-gray-600 dark:text-gray-400">
//             No team associated with this server.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Pass team directly to avoid fetching in component
//   return <MembersConversation team={team} />;
// }

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { serverId, memberId } = context.params!;
//   const session = await getServerSession(context.req, context.res, authOptions);

//   if (!session?.user?.id) {
//     return { 
//       redirect: { 
//         destination: '/sign-in', 
//         permanent: false 
//       } 
//     };
//   }

//   try {
//     // Verify user is member of this server
//     // const server = await prisma.team.findUnique({
//     //   where: { id: serverId as string },
//     //   include: {
//     //     members: {
//     //       where: { userId: session.user.id },
//     //       select: { id: true, role: true }
//     //     }
//     //   }
//     // });

//     // if (!server) {
//     //   return { 
//     //     redirect: { 
//     //       destination: '/404', 
//     //       permanent: false 
//     //     } 
//     //   };
//     // }

//     // if (server.members.length === 0) {
//     //   return { 
//     //     redirect: { 
//     //       destination: '/', 
//     //       permanent: false 
//     //     } 
//     //   };
//     // }

//     // STRATEGY 1: If Server model has a teamId field (most common)
//     // Uncomment if your schema has this relation:
  
//     const team = await prisma.team.findUnique({
//       where: { 
//         id: (team as any).teamId 
//       }
//     });
    

    
//     // const team = await prisma.team.findFirst({
//     //   where: { 
//     //     serverId: serverId as string 
//     //   }
//     // });
  

//     // STRATEGY 3: Find team through TeamMember where user is member
//     // This works if user is in a team that's "linked" to this server context
//     const teamMember = await prisma.teamMember.findFirst({
//       where: {
//         userId: session.user.id,
//         team: {
//           // Optional: Add server-related filter if you have a relation
//           // serverId: serverId as string,
//         }
//       },
//       include: {
//         team: true
//       },
//       orderBy: {
//         createdAt: 'desc' // Get most recent team membership
//       }
//     });

//     let team = teamMember?.team || null;

//     // STRATEGY 4: If no direct relation, get user's first team as fallback
//     // Remove this if you want strict server-team matching
//     if (!team) {
//       const fallbackTeamMember = await prisma.teamMember.findFirst({
//         where: { userId: session.user.id },
//         include: { team: true },
//         orderBy: { createdAt: 'desc' }
//       });
//       team = fallbackTeamMember?.team || null;
//     }

//     if (!team) {
//       return { 
//         redirect: { 
//           destination: '/teams/create', 
//           permanent: false 
//         } 
//       };
//     }

//     // Verify the other member exists in this context
//     const otherMember = await prisma.member.findFirst({
//       where: {
//         id: memberId as string,
//         serverId: serverId as string
//       },
//       include: {
//         user: true
//       }
//     });

//     return {
//       props: {
//         serverId: serverId as string,
//         memberId: memberId as string,
//         team: JSON.parse(JSON.stringify(team)),
//         server: JSON.parse(JSON.stringify(server)),
//         // You can pass otherMember here if needed by the component
//       }
//     };

//   } catch (error) {
//     console.error('Error in conversations page:', error);
//     return { 
//       redirect: { 
//         destination: '/500', 
//         permanent: false 
//       } 
//     };
//   }
// };

// pages/team/[teamSlug]/conversations/[memberId].tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MembersConversation from '@/components/members-conversation';
import { Team } from '@prisma/client';

interface PageProps {
  team: Team;
  memberId: string;
}

export default function ConversationPage({ team }: PageProps) {
  return <MembersConversation team={team} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { teamSlug, memberId } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return { redirect: { destination: '/sign-in', permanent: false } };
  }

  const team = await prisma.team.findUnique({ where: { slug: teamSlug as string } });
  if (!team) {
    return { redirect: { destination: '/chat', permanent: false } };
  }

  const requester = await prisma.teamMember.findFirst({
    where: { teamId: team.id, userId: session.user.id },
  });
  if (!requester) {
    return { redirect: { destination: '/chat', permanent: false } };
  }

  // Confirm the target member exists on this team; not fatal if not found,
  // MembersConversation can handle an unknown selectedMemberId gracefully.
  const otherMember = await prisma.teamMember.findFirst({
    where: { id: memberId as string, teamId: team.id },
  });

  if (!otherMember) {
    return { redirect: { destination: `/team/${team.slug}/chat`, permanent: false } };
  }

  return {
    props: {
      team: JSON.parse(JSON.stringify(team)),
      memberId: memberId as string,
    },
  };
};