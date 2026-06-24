import { TaskStatus, Priority, TaskType, Role, TeamRole } from '@prisma/client';

export * from './base';
export * from './next';

// src/types/index.ts

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  memberCount?: number;
}

export interface TeamMember {
  id: string;
  role: TeamRole;
  user: User;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string;
  taskCount?: number;
  progress?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours: number | null;
  actualHours: number;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  workloadWeight: number;
  assignee: User | null;
  creator: User;
  team: Team;
  project: Project | null;
  subtasks: Task[];
  tags: Tag[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TaskComment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface WorkloadMetrics {
  userId: string;
  userName: string;
  userImage: string | null;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalHours: number;
  workloadScore: number;
  capacityPercentage: number;
}

export interface TeamAnalytics {
  teamId: string;
  teamName: string;
  totalTasks: number;
  completedTasks: number;
  averageCompletionTime: number;
  memberWorkloads: WorkloadMetrics[];
  statusDistribution: { name: string; value: number; color: string }[];
  priorityDistribution: { name: string; value: number; color: string }[];
  weeklyTrend: { date: string; completed: number; created: number }[];
}

export interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}