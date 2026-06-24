// // import { Teams } from '@/components/team';

// // const MembersPage = () => {

// //     return (
// //         <div>
// //             {/* <h1>Members</h1>

// //             <div className="space-y-6 p-4">
// //                    <Teams/>
// //                     <img src="https://conferiotestbkt.s3.ap-south-1.amazonaws.com/users/34bca582-6118-4237-ba40-61d5a686d09b/305442df-454a-4208-8680-56f9f30a9194-25dd8fa37f25bcb2918b399625022d01.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA5TGDZJ7LRSYMDH7E%2F20250827%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250827T211654Z&X-Amz-Expires=3600&X-Amz-Signature=d6f9cfe50b835f55ec95ea0d5720dab7551fb7c6d9f456e094bdffad92c8c54a&X-Amz-SignedHeaders=host&response-content-disposition=inline&response-content-type=image%2Fjpeg&x-amz-checksum-mode=ENABLED&x-id=GetObject" alt="" />
// //                   </div> */}
// //         </div>
// //     );
// // };

// // export default MembersPage;

// import { ArrowLeft, MessageSquare, MoreHorizontal } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import Header from '@/components/MemberHeader';
// import MetricsCard from '@/components/MetricsCard';
// import LeadCard from '@/components/LeadCard';
// import ChatInterface from '@/components/ChatInterface';
// import ProfileSidebar from '@/components/ProfileSidebar';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import Mainsidebar from '@/components/ui/mainSideBar';
// import useTeam from 'hooks/useTeam';
// import { GetServerSidePropsContext } from 'next';
// import { useTranslation } from 'next-i18next';
// import { Error, Loading } from '@/components/shared';

// const Index = () => {
//   const { t } = useTranslation('common');
//   const { isLoading, isError, team } = useTeam();

//   if (isLoading) {
//     return <Loading />;
//   }

//   if (isError) {
//     return <Error message={isError.message} />;
//   }

//   if (!team) {
//     return <Error message={t('team-not-found')} />;
//   }

//   return (
//     <div className="min-h-screen flex bg-[#4242a8f4] h-screen ">
//       {/* <Header /> */}

//       <div className="z-50">
//         <Mainsidebar />
//       </div>
//       <ScrollArea className="pt-3 pb-0 px-3">
//         <div className="grid grid-cols-12 gap-2">
//           {/* Left Section - Leads */}
//           <div className="col-span-4 w-full overflow-hidden max-h-screen">
//             <ScrollArea className="h-full w-full overflow-y-auto">
//               <div className="grid grid-cols-2 w-full !gap-x-2 space-y-2">
//                 <LeadCard team={team} />
//               </div>
//             </ScrollArea>
//           </div>

//           {/* Chat Section */}
//           {/* <div className="col-span-5 h-full max-h-screen rounded-full">
//             <ChatInterface/>
//           </div> */}

//           {/* Right Section - Profile */}
//           <div className="col-span-3  max-h-screen">
//             <ProfileSidebar team={team}/>
//           </div>
//         </div>
//       </ScrollArea>
//     </div>
//   );
// };

// export default Index;

// pages/members/[slug].tsx
import TeamMembersView from '@/components/TeamMembersView';
import { GetServerSideProps } from 'next';
import { getTeamBySlug } from 'lib/teams';
import { Team } from '@prisma/client';

interface TeamPageProps {
  team: Team;
}

export default function TeamPage({ team }: TeamPageProps) {
  return (
    <div className="">
      <TeamMembersView team={team} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params;

  if (!slug) {
    return {
      notFound: true,
    };
  }

  try {
    // Use the server-side function directly, no hooks
    const team = await getTeamBySlug(slug as string);

    return {
      props: {
        team: JSON.parse(JSON.stringify(team)),
      },
    };
  } catch (error) {
    console.error('Error fetching team:', error);
    return {
      notFound: true,
    };
  }
};