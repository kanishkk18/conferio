// pages/team/[teamSlug]/drive/index.tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import EnhancedFileManager from '@/components/file-manager/table-upload';

interface DrivePageProps {
  initialTeamId: string;
  teamSlug: string;
}

export default function DrivePage({ initialTeamId }: DrivePageProps) {
  return <EnhancedFileManager initialTeamId={initialTeamId} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { teamSlug } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return { redirect: { destination: '/sign-in', permanent: false } };
  }

  const team = await prisma.team.findUnique({ where: { slug: teamSlug as string } });
  if (!team) {
    return { redirect: { destination: '/chat', permanent: false } };
  }

  const member = await prisma.teamMember.findFirst({
    where: { teamId: team.id, userId: session.user.id },
  });
  if (!member) {
    return { redirect: { destination: '/chat', permanent: false } };
  }

  return {
    props: {
      initialTeamId: team.id,
      teamSlug: team.slug,
    },
  };
};