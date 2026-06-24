import { prisma } from '@/lib/prisma';

export const getTeamBySlug = async (slug: string) => {
  try {
    const team = await prisma.team.findUnique({
      where: { slug },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    return team;
  } catch (error) {
    console.error('Error in getTeamBySlug:', error);
    throw error;
  }
};
