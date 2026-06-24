import { prisma } from '../prisma';
import { contextManager } from '../context/manager';
import { aiRouter } from '../ai/router';

export interface CreateTaskInput {
  title: string;
  description?: string;
  boardName?: string;
  columnName?: string;
  assigneeName?: string;
  priority?: string;
  dueDate?: string;
  userId: string;
}

export class TaskTool {
  async createTask(input: CreateTaskInput) {
    const context = await contextManager.getContext(input.userId);
    
    // Find board
    let board = null;
    if (input.boardName) {
      board = await prisma.board.findFirst({
        where: {
          title: { contains: input.boardName, mode: 'insensitive' },
          ownerId: input.userId,
        },
      });
    }

    // Default to first board if none found
    if (!board) {
      board = await prisma.board.findFirst({
        where: { ownerId: input.userId },
        orderBy: { createdAt: 'asc' },
      });
    }

    if (!board) throw new Error('No board found');

    // Find or create column
    let column = await prisma.column.findFirst({
      where: {
        boardId: board.id,
        title: { contains: input.columnName || 'To Do', mode: 'insensitive' },
      },
    });

    if (!column) {
      column = await prisma.column.create({
        data: {
          title: input.columnName || 'To Do',
          boardId: board.id,
          order: 0,
        },
      });
    }

    // Resolve assignee
    let assigneeId: string | undefined;
    if (input.assigneeName) {
      const assignee = await prisma.user.findFirst({
        where: {
          OR: [
            { name: { contains: input.assigneeName, mode: 'insensitive' } },
            { email: { contains: input.assigneeName, mode: 'insensitive' } },
          ],
        },
      });
      if (assignee) assigneeId = assignee.id;
    }

    // Parse due date
    let dueDate: Date | undefined;
    if (input.dueDate) {
      dueDate = this.parseNaturalDate(input.dueDate);
    }

    const taskCount = await prisma.task.count({ where: { columnId: column.id } });
    
    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        priority: (input.priority?.toUpperCase() as any) || 'MEDIUM',
        dueDate,
        columnId: column.id,
        boardId: board.id,
        order: taskCount,
      },
      include: {
        column: true,
        assignees: { include: { user: true } },
      },
    });

    // Add assignee if found
    if (assigneeId) {
      await prisma.taskAssignee.create({
        data: { taskId: task.id, userId: assigneeId },
      });
    }

    return {
      success: true,
      task,
      message: `Created task "${task.title}" in ${board.title}`,
    };
  }

  private parseNaturalDate(dateStr: string): Date | undefined {
    const now = new Date();
    const lower = dateStr.toLowerCase();
    
    if (lower.includes('tomorrow')) {
      const date = new Date(now);
      date.setDate(date.getDate() + 1);
      return date;
    }
    if (lower.includes('next week')) {
      const date = new Date(now);
      date.setDate(date.getDate() + 7);
      return date;
    }
    if (lower.includes('today')) return now;
    
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  async updateTaskStatus(taskId: string, status: string, userId: string) {
    const column = await prisma.column.findFirst({
      where: { 
        title: { contains: status, mode: 'insensitive' },
        board: { ownerId: userId }
      },
    });
    
    if (!column) throw new Error(`Column "${status}" not found`);
    
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { columnId: column.id },
      include: { column: true },
    });
    
    return {
      success: true,
      task,
      message: `Moved task to ${task.column.title}`,
    };
  }
}

export const taskTool = new TaskTool();
