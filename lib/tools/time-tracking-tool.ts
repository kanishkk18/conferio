import { prisma } from '../prisma';

export class TimeTrackingTool {
  async startTimer(userId: string, taskId?: string, description?: string) {
    // Check if there's already a running timer
    const runningEntry = await prisma.timeEntry.findFirst({
      where: { 
        userId, 
        isRunning: true 
      },
    });

    if (runningEntry) {
      throw new Error('Timer already running. Stop it first.');
    }

    const entry = await prisma.timeEntry.create({
      data: {
        userId,
        taskId: taskId || null,
        startTime: new Date(),
        description: description || 'Timer started via voice',
        isRunning: true,
        isBillable: true,
        entryType: 'TIMER',
        teamId: '', // Get from context
      },
    });

    return {
      success: true,
      entry,
      message: 'Timer started',
    };
  }

  async stopTimer(userId: string) {
    const runningEntry = await prisma.timeEntry.findFirst({
      where: { 
        userId, 
        isRunning: true 
      },
    });

    if (!runningEntry) {
      throw new Error('No running timer found');
    }

    const now = new Date();
    const duration = Math.floor((now.getTime() - runningEntry.startTime.getTime()) / 1000);

    const entry = await prisma.timeEntry.update({
      where: { id: runningEntry.id },
      data: {
        endTime: now,
        duration,
        isRunning: false,
      },
    });

    return {
      success: true,
      entry,
      message: `Timer stopped. Duration: ${Math.floor(duration / 60)} minutes`,
    };
  }

  async getStatus(userId: string) {
    const runningEntry = await prisma.timeEntry.findFirst({
      where: { 
        userId, 
        isRunning: true 
      },
      include: { task: true },
    });

    if (!runningEntry) {
      return { running: false, message: 'No timer running' };
    }

    const duration = Math.floor((Date.now() - runningEntry.startTime.getTime()) / 1000);
    
    return {
      running: true,
      entry: runningEntry,
      duration,
      message: `Timer running for ${Math.floor(duration / 60)} minutes${runningEntry.task ? ` on task: ${runningEntry.task.title}` : ''}`,
    };
  }
}

export const timeTrackingTool = new TimeTrackingTool();
