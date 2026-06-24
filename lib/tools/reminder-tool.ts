import { prisma } from '../prisma';
import { addMinutes, addHours, addDays } from 'date-fns';

export interface CreateReminderInput {
  title: string;
  time: string;
  description?: string;
  taskId?: string;
  meetingId?: string;
  priority?: string;
  userId: string;
}

export class ReminderTool {
  async createReminder(input: CreateReminderInput) {
    const dueDate = this.parseTime(input.time);
    
    const reminder = await prisma.reminder.create({
      data: {
        title: input.title,
        description: input.description,
        dueDate,
        userId: input.userId,
        taskId: input.taskId,
        meetingId: input.meetingId,
        priority: (input.priority?.toUpperCase() as any) || 'MEDIUM',
      },
    });

    return {
      success: true,
      reminder,
      message: `Reminder set for "${reminder.title}" at ${dueDate.toLocaleString()}`,
    };
  }

  private parseTime(timeStr: string): Date {
    const now = new Date();
    const lower = timeStr.toLowerCase();
    
    if (lower.includes('in 5 minutes')) return addMinutes(now, 5);
    if (lower.includes('in 10 minutes')) return addMinutes(now, 10);
    if (lower.includes('in 15 minutes')) return addMinutes(now, 15);
    if (lower.includes('in 30 minutes')) return addMinutes(now, 30);
    if (lower.includes('in 1 hour') || lower.includes('in an hour')) return addHours(now, 1);
    if (lower.includes('tomorrow')) {
      const date = addDays(now, 1);
      const timeMatch = lower.match(/(\d+):?(\d*)\s*(am|pm)/);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2] || '0');
        if (timeMatch[3] === 'pm' && hours !== 12) hours += 12;
        date.setHours(hours, minutes, 0, 0);
      } else {
        date.setHours(9, 0, 0, 0);
      }
      return date;
    }
    
    const iso = new Date(timeStr);
    return isNaN(iso.getTime()) ? addHours(now, 1) : iso;
  }

  async getUpcoming(userId: string, hours: number = 24) {
    const cutoff = addHours(new Date(), hours);
    
    return prisma.reminder.findMany({
      where: {
        userId,
        dueDate: { lte: cutoff },
        status: 'PENDING',
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });
  }
}

export const reminderTool = new ReminderTool();
