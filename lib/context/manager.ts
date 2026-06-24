import { prisma } from '../prisma';

export interface UserContext {
  userId: string;
  currentTeamId?: string;
  activeBoardId?: string;
  activeMeetingId?: string;
  activeTaskId?: string;
  recentCommands: string[];
  preferences: {
    defaultBoard?: string;
    defaultMeetingPlatform?: string;
    musicService?: string;
    voiceFeedback?: boolean;
  };
}

export class ContextManager {
  async getContext(userId: string): Promise<UserContext> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teamMembers: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { team: true }
        }
      }
    });

    return {
      userId,
      currentTeamId: user?.teamMembers[0]?.teamId,
      preferences: {},
      recentCommands: [],
    };
  }

  async getRecentContext(userId: string, limit: number = 5): Promise<string> {
    const context = await this.getContext(userId);
    return `Current team: ${context.currentTeamId || 'None'}
Active board: ${context.activeBoardId || 'None'}
Active meeting: ${context.activeMeetingId || 'None'}`;
  }
}

export const contextManager = new ContextManager();
