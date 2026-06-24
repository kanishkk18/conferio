// types/notifications.ts

export type NotificationType =
  // Task related
  | "TASK_ASSIGNED"
  | "TASK_UNASSIGNED"
  | "TASK_STATUS_CHANGED"
  | "TASK_DUE_SOON"
  // Board related
  | "BOARD_MEMBER_ADDED"
  | "BOARD_MEMBER_REMOVED"
  // Page / Docs related
  | "PAGE_ASSIGNED"
  | "PAGE_COMMENT_ADDED"
  // Reminder
  | "REMINDER_DUE"
  // Team
  | "TEAM_MEMBER_ADDED"
  | "TEAM_MEMBER_REMOVED"
  // Meeting
  | "MEETING_SCHEDULED"
  | "MEETING_CANCELLED"
  | "MEETING_REMINDER"
  // Calls
  | "CALL_INCOMING"
  | "CALL_MISSED"
  | "CALL_ENDED"
  // Files
  | "FILE_UPLOADED_TEAM"
  | "FILE_ASSIGNED"
  | "FILE_ASSIGNED_WITH_PASSWORD"
  // Time tracking
  | "TIMESHEET_SUBMITTED"
  | "TIMESHEET_APPROVED"
  | "TIMESHEET_REJECTED"
  | "TIMER_STARTED"
  | "TIMER_PAUSED"
  | "TIMER_STOPPED"
  | "TIMER_APPROVAL_PENDING"
  // Workflow
  | "WORKFLOW_EXECUTED"
  | "WORKFLOW_FAILED"
  | "WORKFLOW_STEP_COMPLETED";

export interface NotificationAction {
  label: string;
  action: string;
  endpoint?: string;
  variant?: "primary" | "secondary" | "danger";
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  // Related entities
  taskId?: string;
  pageId?: string;
  meetingId?: string;
  fileId?: string;
  callId?: string;
  workflowId?: string;
  // UI
  channels: string[];
  read: boolean;
  readAt?: string;
  clicked: boolean;
  clickedAt?: string;
  actions?: NotificationAction[];
  createdAt: string;
  expiresAt?: string;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  taskId?: string;
  pageId?: string;
  meetingId?: string;
  fileId?: string;
  callId?: string;
  workflowId?: string;
  channels?: string[];
  actions?: NotificationAction[];
  expiresAt?: Date;
}

export interface ToastNotification extends AppNotification {
  autoDismissMs?: number; // 6000–8000
}