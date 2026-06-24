// pages/teams/[slug]/index.tsx
import TeamLayout from '@/components/team/teamLayout';
import env from '@/lib/env';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const TeamIndex = ({ teamFeatures }: { teamFeatures: any }) => {
  return <TeamLayout teamFeatures={teamFeatures} />;
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default TeamIndex;