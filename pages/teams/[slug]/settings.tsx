// import { Error, Loading } from '@/components/shared';
// import { AccessControl } from '@/components/shared/AccessControl';
// import { RemoveTeam, TeamSettings, TeamTab } from '@/components/team';
// import Mainsidebar from '@/components/ui/mainSideBar';
// import env from '@/lib/env';
// import useTeam from 'hooks/useTeam';
// import type { GetServerSidePropsContext } from 'next';
// import { useTranslation } from 'next-i18next';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import type { TeamFeature } from 'types/index';

// const Settings = ({ teamFeatures }: { teamFeatures: TeamFeature }) => {
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
//     <div className="flex h-full w-full dark:bg-black">
//       <Mainsidebar/>
//       <div className="w-full p-6">
//       <TeamTab activeTab="settings" team={team} teamFeatures={teamFeatures} />
//       <div className="space-y-6">
//         <TeamSettings team={team} />
//         <AccessControl resource="team" actions={['delete']}>
//           <RemoveTeam team={team} allowDelete={teamFeatures.deleteTeam} />
//         </AccessControl>
//       </div>
//       </div>
//     </div>
//   );
// };

// export async function getServerSideProps({
//   locale,
// }: GetServerSidePropsContext) {
//   return {
//     props: {
//       ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
//       teamFeatures: env.teamFeatures,
//     },
//   };
// }

// export default Settings;


// pages/teams/[slug]/settings.tsx
import { Error, Loading } from '@/components/shared';
import { AccessControl } from '@/components/shared/AccessControl';
import { RemoveTeam, TeamSettings, TeamTab } from '@/components/team';
import Mainsidebar from '@/components/ui/mainSideBar';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { TeamFeature } from 'types/index';

const Settings = ({ teamFeatures }: { teamFeatures: TeamFeature }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!team) return <Error message={t('team-not-found')} />;

  return (
    // Clean wrapper: Dark background + Sidebar
    <div className="flex h-full w-full dark:bg-[#0f0f0f]">
      <Mainsidebar />
      <div className="flex-1 p-6 overflow-auto">
        {/* The new TeamTab handles the Workspace Header and Navigation styling */}
        <TeamTab activeTab="settings" team={team} teamFeatures={teamFeatures} />
        
        <div className="space-y-6 max-w-4xl">
          <TeamSettings team={team} />
          <AccessControl resource="team" actions={['delete']}>
            <RemoveTeam team={team} allowDelete={teamFeatures.deleteTeam} />
          </AccessControl>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default Settings;