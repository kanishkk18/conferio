// components/team/TeamLayout.tsx
import { Error, Loading } from '@/components/shared';
import Mainsidebar from '@/components/ui/mainSideBar';
import TeamDashboard from './teamDashboard';
import useTeam from 'hooks/useTeam';
import { useTranslation } from 'next-i18next';
import type { TeamFeature } from 'types/index';

const TeamLayout = ({ teamFeatures }: { teamFeatures: TeamFeature }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  return (
    <div className="flex h-full w-full dark:bg-[#0f0f0f]">
      <Mainsidebar />
      <div className="flex-1 overflow-hidden">
        <TeamDashboard team={team} teamFeatures={teamFeatures} />
      </div>
    </div>
  );
};

export default TeamLayout;