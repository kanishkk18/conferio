// types/timeTracking.ts
import { TimeEntryStatus, TimeEntryType, TaskStatus, Priority } from '@prisma/client';

export interface TimeEntryWithRelations {
  id: string;
  userId: string;
  teamId: string;
  taskId: string | null;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  isBillable: boolean;
  billableStatus: TimeEntryStatus;
  entryType: TimeEntryType;
  approvedBy: string | null;
  approvedAt: Date | null;
  description: string | null;
  notes: string | null;
  isRunning: boolean;
  isPaused: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  task: {
    id: string;
    title: string;
    status: TaskStatus;
    priority: Priority;
    column: {
      title: string;
      board: {
        title: string;
      };
    };
  } | null;
  approvedByUser: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface TimesheetData {
  userId: string;
  userName: string;
  userImage: string | null;
  entries: {
    date: string;
    totalMinutes: number;
    billableMinutes: number;
    nonBillableMinutes: number;
    entries: TimeEntryWithRelations[];
  }[];
  weekTotal: {
    total: number;
    billable: number;
    nonBillable: number;
  };
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  taskId: string | null;
  entryId: string | null;
  isBillable: boolean;
  description: string;
}

export interface ManualTimeLimit {
  used: number;
  limit: number;
  remaining: number;
  requiresApproval: boolean;
}