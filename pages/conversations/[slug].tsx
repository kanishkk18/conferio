
import TeamMembersView from '@/components/members-conversation';
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