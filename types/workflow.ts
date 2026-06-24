// types/workflow.ts
// Complete workflow type definitions for a large-scale SaaS app

export type WorkflowTrigger =
  | "task.created"
  | "task.updated"
  | "task.status_changed"
  | "task.assigned"
  | "task.due_soon"
  | "task.completed"
  | "task.deleted"
  | "page.created"
  | "page.updated"
  | "page.comment_added"
  | "meeting.scheduled"
  | "meeting.started"
  | "meeting.ended"
  | "meeting.cancelled"
  | "file.uploaded"
  | "file.assigned"
  | "time_entry.submitted"
  | "time_entry.approved"
  | "time_entry.rejected"
  | "team.member_added"
  | "team.member_removed"
  | "call.started"
  | "call.missed"
  | "board.member_added"
  | "manual"
  | "schedule"
  | "webhook";

export type StepType =
  | "CREATE_TASK"
  | "UPDATE_TASK"
  | "ASSIGN_TASK"
  | "CREATE_PAGE"
  | "SEND_NOTIFICATION"
  | "SEND_EMAIL"
  | "SEND_WEBHOOK"
  | "UPDATE_FIELD"
  | "CONDITION"
  | "DELAY"
  | "AI_SUMMARIZE"
  | "CREATE_MEETING"
  | "ASSIGN_FILE"
  | "CREATE_BOARD_COMMENT"
  | "SCHEDULE_REMINDER"
  | "APPROVE_TIME_ENTRY";

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "is_empty"
  | "is_not_empty"
  | "in"
  | "not_in";

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value?: unknown;
  logicOperator?: "AND" | "OR";
}

export interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  config: Record<string, unknown>;
  onError?: "stop" | "continue" | "retry";
  retryCount?: number;
  delayMs?: number;
}

export interface WorkflowTriggerConfig {
  // For schedule triggers
  schedule?: string; // cron expression
  timezone?: string;
  // For webhook triggers
  webhookSecret?: string;
  // For task.due_soon
  beforeDueMinutes?: number;
}

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  teamId: string;
  trigger: WorkflowTrigger;
  triggerConfig?: WorkflowTriggerConfig;
  conditions?: WorkflowCondition[];
  steps: WorkflowStep[];
  isActive?: boolean;
}

export interface WorkflowRunStatus {
  id: string;
  workflowId: string;
  status: "pending" | "queued" | "running" | "completed" | "failed" | "cancelled";
  triggerData: Record<string, unknown>;
  steps: StepExecutionResult[];
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  retryCount: number;
}

export interface StepExecutionResult {
  stepId: string;
  stepType: StepType;
  status: "success" | "failed" | "skipped";
  output?: unknown;
  error?: string;
  durationMs: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface TriggerPayload {
  teamId: string;
  userId?: string;
  entityId?: string;
  entityType?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// Template definitions (ClickUp-style pre-built automations)
export interface WorkflowTemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: "productivity" | "communication" | "hr" | "engineering" | "sales";
  icon: string;
  trigger: WorkflowTrigger;
  triggerConfig?: WorkflowTriggerConfig;
  conditions?: WorkflowCondition[];
  steps: WorkflowStep[];
  popular?: boolean;
}