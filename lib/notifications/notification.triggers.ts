// lib/notifications/notification.triggers.ts
/**
 * This file contains all domain-specific notification trigger functions.
 * Call these from your API routes / server-side logic whenever the event occurs.
 *
 * Each function accepts typed arguments and calls createNotification / createNotificationForMany.
 */

import {
  createNotification,
  createNotificationForMany,
} from "./notification.service";

// ─────────────────────────────────────────────────────────────
// TASK NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Notify a user they have been assigned to a task.
 * Call after TaskAssignee is created.
 */
export async function notifyTaskAssigned({
  assigneeUserId,
  assignedByName,
  taskId,
  taskTitle,
  boardId,
  boardTitle,
  columnTitle,
}: {
  assigneeUserId: string;
  assignedByName: string;
  taskId: string;
  taskTitle: string;
  boardId: string;
  boardTitle: string;
  columnTitle: string;
}) {
  await createNotification({
    userId: assigneeUserId,
    type: "TASK_ASSIGNED",
    title: "You've been assigned a task",
    body: `${assignedByName} assigned you to "${taskTitle}" in ${boardTitle} › ${columnTitle}`,
    taskId,
    data: { boardId, boardTitle, columnTitle, taskTitle, assignedByName },
    channels: ["in_app", "email"],
    actions: [
      {
        label: "View Task",
        action: "navigate",
        endpoint: `/boards/${boardId}?task=${taskId}`,
        variant: "primary",
      },
    ],
  });
}

/**
 * Notify a user they have been unassigned from a task.
 */
export async function notifyTaskUnassigned({
  removedUserId,
  removedByName,
  taskId,
  taskTitle,
  boardId,
  boardTitle,
}: {
  removedUserId: string;
  removedByName: string;
  taskId: string;
  taskTitle: string;
  boardId: string;
  boardTitle: string;
}) {
  await createNotification({
    userId: removedUserId,
    type: "TASK_UNASSIGNED",
    title: "Task assignment removed",
    body: `${removedByName} removed you from "${taskTitle}" in ${boardTitle}`,
    taskId,
    data: { boardId, boardTitle, taskTitle, removedByName },
    channels: ["in_app"],
  });
}

/**
 * Notify all assignees of a task that its status changed.
 */
export async function notifyTaskStatusChanged({
  assigneeUserIds,
  changedByName,
  taskId,
  taskTitle,
  boardId,
  boardTitle,
  oldStatus,
  newStatus,
}: {
  assigneeUserIds: string[];
  changedByName: string;
  taskId: string;
  taskTitle: string;
  boardId: string;
  boardTitle: string;
  oldStatus: string;
  newStatus: string;
}) {
  await createNotificationForMany(assigneeUserIds, {
    type: "TASK_STATUS_CHANGED",
    title: "Task status updated",
    body: `"${taskTitle}" moved from ${oldStatus} → ${newStatus} by ${changedByName}`,
    taskId,
    data: { boardId, boardTitle, taskTitle, oldStatus, newStatus, changedByName },
    channels: ["in_app"],
    actions: [
      {
        label: "View Task",
        action: "navigate",
        endpoint: `/boards/${boardId}?task=${taskId}`,
        variant: "primary",
      },
    ],
  });
}

// ─────────────────────────────────────────────────────────────
// BOARD NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Notify a user they have been added to a board.
 */
export async function notifyBoardMemberAdded({
  newMemberUserId,
  addedByName,
  boardId,
  boardTitle,
  role,
}: {
  newMemberUserId: string;
  addedByName: string;
  boardId: string;
  boardTitle: string;
  role: string;
}) {
  await createNotification({
    userId: newMemberUserId,
    type: "BOARD_MEMBER_ADDED",
    title: "Added to a board",
    body: `${addedByName} added you to the board "${boardTitle}" as ${role}`,
    data: { boardId, boardTitle, role, addedByName },
    channels: ["in_app", "email"],
    actions: [
      {
        label: "Open Board",
        action: "navigate",
        endpoint: `/boards/${boardId}`,
        variant: "primary",
      },
    ],
  });
}

// ─────────────────────────────────────────────────────────────
// PAGE / DOCS NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Notify a user a page/doc has been assigned to them.
 */
export async function notifyPageAssigned({
  assigneeUserId,
  assignedByName,
  pageId,
  pageTitle,
  workspaceId,
}: {
  assigneeUserId: string;
  assignedByName: string;
  pageId: string;
  pageTitle: string;
  workspaceId: string;
}) {
  await createNotification({
    userId: assigneeUserId,
    type: "PAGE_ASSIGNED",
    title: "A document was assigned to you",
    body: `${assignedByName} assigned you to the document "${pageTitle}"`,
    pageId,
    data: { pageTitle, workspaceId, assignedByName },
    channels: ["in_app", "email"],
    actions: [
      {
        label: "Open Document",
        action: "navigate",
        endpoint: `/workspace/${workspaceId}`,
        variant: "primary",
      },
    ],
  });
}

/**
 * Notify page author / assignee about a new comment.
 */
export async function notifyPageCommentAdded({
  recipientUserIds,
  commenterName,
  pageId,
  pageTitle,
  workspaceId,
  commentPreview,
}: {
  recipientUserIds: string[];
  commenterName: string;
  pageId: string;
  pageTitle: string;
  workspaceId: string;
  commentPreview: string;
}) {
  await createNotificationForMany(recipientUserIds, {
    type: "PAGE_COMMENT_ADDED",
    title: "New comment on a document",
    body: `${commenterName} commented on "${pageTitle}": ${commentPreview.slice(0, 80)}`,
    pageId,
    data: { pageTitle, workspaceId, commenterName, commentPreview },
    channels: ["in_app"],
    actions: [
      {
        label: "View Comment",
        action: "navigate",
        endpoint: `/workspace/${workspaceId}`,
        variant: "primary",
      },
    ],
  });
}

// ─────────────────────────────────────────────────────────────
// REMINDER NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Notify user that a reminder is due.
 */
export async function notifyReminderDue({
  userId,
  reminderId,
  title,
  description,
  taskId,
  meetingId,
}: {
  userId: string;
  reminderId: string;
  title: string;
  description?: string;
  taskId?: string;
  meetingId?: string;
}) {
  await createNotification({
    userId,
    type: "REMINDER_DUE",
    title: `Reminder: ${title}`,
    body: description ?? "Your reminder is due now.",
    taskId,
    meetingId,
    data: { reminderId, title, description },
    channels: ["in_app", "email"],
    actions: taskId
      ? [{ label: "View Task", action: "navigate", endpoint: `/tasks/${taskId}`, variant: "primary" }]
      : meetingId
      ? [{ label: "View Meeting", action: "navigate", endpoint: `/meetings/${meetingId}`, variant: "primary" }]
      : [],
  });
}

// ─────────────────────────────────────────────────────────────
// TEAM NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Notify all existing team members that a new member joined.
 */
export async function notifyTeamMemberAdded({
  existingMemberIds,
  newMemberName,
  newMemberEmail,
  teamId,
  teamName,
  role,
}: {
  existingMemberIds: string[];
  newMemberName: string;
  newMemberEmail: string;
  teamId: string;
  teamName: string;
  role: string;
}) {
  await createNotificationForMany(existingMemberIds, {
    type: "TEAM_MEMBER_ADDED",
    title: "New team member joined",
    body: `${newMemberName} (${newMemberEmail}) joined ${teamName} as ${role}`,
    data: { teamId, teamName, newMemberName, newMemberEmail, role },
    channels: ["in_app"],
    actions: [
      {
        label: "View Team",
        action: "navigate",
        endpoint: `/teams/${teamId}/members`,
        variant: "primary",
      },
    ],
  });
}

// ─────────────────────────────────────────────────────────────
// MEETING NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Notify a user a meeting has been scheduled that includes them.
 */
export async function notifyMeetingScheduled({
  attendeeUserIds,
  organizerName,
  meetingId,
  meetingTitle,
  startTime,
  endTime,
  meetLink,
}: {
  attendeeUserIds: string[];
  organizerName: string;
  meetingId: string;
  meetingTitle: string;
  startTime: Date;
  endTime: Date;
  meetLink: string;
}) {
  const formattedStart = startTime.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  await createNotificationForMany(attendeeUserIds, {
    type: "MEETING_SCHEDULED",
    title: "Meeting scheduled",
    body: `${organizerName} scheduled "${meetingTitle}" on ${formattedStart}`,
    meetingId,
    data: {
      organizerName,
      meetingTitle,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      meetLink,
    },
    channels: ["in_app", "email"],
    actions: [
      { label: "Join Meeting", action: "open_url", endpoint: meetLink, variant: "primary" },
      { label: "View Details", action: "navigate", endpoint: `/scheduled/page?tab=upcoming`, variant: "secondary" },
    ],
  });
}

/**
 * Notify attendees that a meeting was cancelled.
 */
export async function notifyMeetingCancelled({
  attendeeUserIds,
  organizerName,
  meetingId,
  meetingTitle,
}: {
  attendeeUserIds: string[];
  organizerName: string;
  meetingId: string;
  meetingTitle: string;
}) {
  await createNotificationForMany(attendeeUserIds, {
    type: "MEETING_CANCELLED",
    title: "Meeting cancelled",
    body: `${organizerName} cancelled the meeting "${meetingTitle}"`,
    meetingId,
    data: { organizerName, meetingTitle },
    channels: ["in_app", "email"],
  });
}

// ─────────────────────────────────────────────────────────────
// CALL NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Notify the callee that they have an incoming call.
 */
export async function notifyIncomingCall({
  calleeUserId,
  callerName,
  callerAvatarUrl,
  callId,
  callType,
  conversationId,
}: {
  calleeUserId: string;
  callerName: string;
  callerAvatarUrl?: string;
  callId: string;
  callType: "AUDIO" | "VIDEO";
  conversationId?: string;
}) {
  await createNotification({
    userId: calleeUserId,
    type: "CALL_INCOMING",
    title: `Incoming ${callType === "VIDEO" ? "Video" : "Audio"} Call`,
    body: `${callerName} is calling you…`,
    callId,
    data: { callerName, callerAvatarUrl, callType, conversationId },
    channels: ["in_app", "push"],
    actions: [
      { label: "Accept", action: "accept_call", endpoint: `/api/calls/${callId}/accept`, variant: "primary" },
      { label: "Decline", action: "decline_call", endpoint: `/api/calls/${callId}/decline`, variant: "danger" },
    ],
  });
}

/**
 * Notify caller that the callee missed the call.
 */
export async function notifyCallMissed({
  missedUserId,
  callerName,
  callId,
  callType,
}: {
  missedUserId: string;
  callerName: string;
  callId: string;
  callType: "AUDIO" | "VIDEO";
}) {
  await createNotification({
    userId: missedUserId,
    type: "CALL_MISSED",
    title: "Missed call",
    body: `You missed a ${callType.toLowerCase()} call from ${callerName}`,
    callId,
    data: { callerName, callType },
    channels: ["in_app", "email"],
    actions: [
      { label: "Call Back", action: "initiate_call", endpoint: `/api/calls/initiate`, variant: "primary" },
    ],
  });
}

// ─────────────────────────────────────────────────────────────
// FILE NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Notify team members that a new file was uploaded.
 */
export async function notifyFileUploadedToTeam({
  teamMemberIds,
  uploaderName,
  fileId,
  fileName,
  teamId,
  teamName,
  folderId,
  folderName,
}: {
  teamMemberIds: string[];
  uploaderName: string;
  fileId: string;
  fileName: string;
  teamId: string;
  teamName: string;
  folderId?: string;
  folderName?: string;
}) {
  const location = folderName ? `in folder "${folderName}"` : `in ${teamName}`;
  await createNotificationForMany(teamMemberIds, {
    type: "FILE_UPLOADED_TEAM",
    title: "New file uploaded",
    body: `${uploaderName} uploaded "${fileName}" ${location}`,
    fileId,
    data: { uploaderName, fileName, teamId, teamName, folderId, folderName },
    channels: ["in_app"],
    actions: [
      {
        label: "View File",
        action: "navigate",
        endpoint: `/files/${fileId}`,
        variant: "primary",
      },
    ],
  });
}

/**
 * Notify a user a file was assigned to them (with optional password).
 */
export async function notifyFileAssigned({
  assigneeUserId,
  assignedByName,
  fileId,
  fileName,
  isPasswordProtected,
  filePassword,
}: {
  assigneeUserId: string;
  assignedByName: string;
  fileId: string;
  fileName: string;
  isPasswordProtected: boolean;
  filePassword?: string;
}) {
  const body = isPasswordProtected
    ? `${assignedByName} assigned you the file "${fileName}". Password: ${filePassword}`
    : `${assignedByName} assigned you the file "${fileName}"`;

  await createNotification({
    userId: assigneeUserId,
    type: isPasswordProtected ? "FILE_ASSIGNED_WITH_PASSWORD" : "FILE_ASSIGNED",
    title: "File assigned to you",
    body,
    fileId,
    data: {
      assignedByName,
      fileName,
      isPasswordProtected,
      ...(isPasswordProtected && { filePassword }),
    },
    channels: ["in_app", "email"],
    actions: [
      {
        label: "Open File",
        action: "navigate",
        endpoint: `/files/${fileId}`,
        variant: "primary",
      },
    ],
  });
}

// ─────────────────────────────────────────────────────────────
// TIME TRACKING NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Notify team owner/admin that a timesheet approval is pending.
 */
export async function notifyTimesheetApprovalPending({
  approverUserIds,
  submitterName,
  timeEntryId,
  teamId,
  duration,
  taskTitle,
}: {
  approverUserIds: string[];
  submitterName: string;
  timeEntryId: string;
  teamId: string;
  duration: number; // seconds
  taskTitle?: string;
}) {
  const hours = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);
  const durationStr = `${hours}h ${mins}m`;

  await createNotificationForMany(approverUserIds, {
    type: "TIMER_APPROVAL_PENDING",
    title: "Timesheet approval needed",
    body: `${submitterName} submitted ${durationStr}${taskTitle ? ` on "${taskTitle}"` : ""} for approval`,
    data: { timeEntryId, submitterName, duration, taskTitle, teamId },
    channels: ["in_app", "email"],
    actions: [
      { label: "Approve", action: "approve_time", endpoint: `/api/time-entries/${timeEntryId}/approve`, variant: "primary" },
      { label: "Reject", action: "reject_time", endpoint: `/api/time-entries/${timeEntryId}/reject`, variant: "danger" },
    ],
  });
}

/**
 * Notify submitter that their timesheet was approved.
 */
export async function notifyTimesheetApproved({
  submitterUserId,
  approverName,
  timeEntryId,
  duration,
  taskTitle,
}: {
  submitterUserId: string;
  approverName: string;
  timeEntryId: string;
  duration: number;
  taskTitle?: string;
}) {
  const hours = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);

  await createNotification({
    userId: submitterUserId,
    type: "TIMESHEET_APPROVED",
    title: "Timesheet approved ✓",
    body: `${approverName} approved your ${hours}h ${mins}m entry${taskTitle ? ` on "${taskTitle}"` : ""}`,
    data: { timeEntryId, approverName, duration, taskTitle },
    channels: ["in_app", "email"],
  });
}

/**
 * Notify submitter that their timesheet was rejected.
 */
export async function notifyTimesheetRejected({
  submitterUserId,
  approverName,
  timeEntryId,
  duration,
  taskTitle,
  reason,
}: {
  submitterUserId: string;
  approverName: string;
  timeEntryId: string;
  duration: number;
  taskTitle?: string;
  reason?: string;
}) {
  const hours = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);

  await createNotification({
    userId: submitterUserId,
    type: "TIMESHEET_REJECTED",
    title: "Timesheet rejected",
    body: `${approverName} rejected your ${hours}h ${mins}m entry${taskTitle ? ` on "${taskTitle}"` : ""}${reason ? `. Reason: ${reason}` : ""}`,
    data: { timeEntryId, approverName, duration, taskTitle, reason },
    channels: ["in_app", "email"],
  });
}

/**
 * Notify team owner/admin when a timer starts.
 */
export async function notifyTimerStarted({
  ownerUserIds,
  memberName,
  timeEntryId,
  taskTitle,
  teamId,
}: {
  ownerUserIds: string[];
  memberName: string;
  timeEntryId: string;
  taskTitle?: string;
  teamId: string;
}) {
  await createNotificationForMany(ownerUserIds, {
    type: "TIMER_STARTED",
    title: "Timer started",
    body: `${memberName} started a timer${taskTitle ? ` on "${taskTitle}"` : ""}`,
    data: { timeEntryId, memberName, taskTitle, teamId },
    channels: ["in_app"],
  });
}

/**
 * Notify team owner/admin when a timer pauses.
 */
export async function notifyTimerPaused({
  ownerUserIds,
  memberName,
  timeEntryId,
  taskTitle,
  teamId,
  elapsed,
}: {
  ownerUserIds: string[];
  memberName: string;
  timeEntryId: string;
  taskTitle?: string;
  teamId: string;
  elapsed: number;
}) {
  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);

  await createNotificationForMany(ownerUserIds, {
    type: "TIMER_PAUSED",
    title: "Timer paused",
    body: `${memberName} paused timer (${hours}h ${mins}m elapsed)${taskTitle ? ` on "${taskTitle}"` : ""}`,
    data: { timeEntryId, memberName, taskTitle, teamId, elapsed },
    channels: ["in_app"],
  });
}

/**
 * Notify team owner/admin when a timer stops.
 */
export async function notifyTimerStopped({
  ownerUserIds,
  memberName,
  timeEntryId,
  taskTitle,
  teamId,
  total,
}: {
  ownerUserIds: string[];
  memberName: string;
  timeEntryId: string;
  taskTitle?: string;
  teamId: string;
  total: number;
}) {
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);

  await createNotificationForMany(ownerUserIds, {
    type: "TIMER_STOPPED",
    title: "Timer stopped",
    body: `${memberName} stopped timer — ${hours}h ${mins}m${taskTitle ? ` on "${taskTitle}"` : ""}`,
    data: { timeEntryId, memberName, taskTitle, teamId, total },
    channels: ["in_app"],
  });
}

// ─────────────────────────────────────────────────────────────
// WORKFLOW NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Notify workflow creator that a workflow executed successfully.
 */
export async function notifyWorkflowExecuted({
  creatorUserId,
  workflowId,
  workflowName,
  runId,
  triggerDescription,
  stepsCompleted,
}: {
  creatorUserId: string;
  workflowId: string;
  workflowName: string;
  runId: string;
  triggerDescription: string;
  stepsCompleted: number;
}) {
  await createNotification({
    userId: creatorUserId,
    type: "WORKFLOW_EXECUTED",
    title: "Workflow executed ✓",
    body: `"${workflowName}" ran successfully — ${stepsCompleted} step(s) completed. Trigger: ${triggerDescription}`,
    workflowId,
    data: { runId, workflowName, triggerDescription, stepsCompleted },
    channels: ["in_app"],
    actions: [
      {
        label: "View Run",
        action: "navigate",
        endpoint: `/workflows/${workflowId}/runs/${runId}`,
        variant: "primary",
      },
    ],
  });
}

/**
 * Notify workflow creator that a workflow failed.
 */
export async function notifyWorkflowFailed({
  creatorUserId,
  workflowId,
  workflowName,
  runId,
  errorMessage,
}: {
  creatorUserId: string;
  workflowId: string;
  workflowName: string;
  runId: string;
  errorMessage: string;
}) {
  await createNotification({
    userId: creatorUserId,
    type: "WORKFLOW_FAILED",
    title: "Workflow failed",
    body: `"${workflowName}" encountered an error: ${errorMessage.slice(0, 120)}`,
    workflowId,
    data: { runId, workflowName, errorMessage },
    channels: ["in_app", "email"],
    actions: [
      {
        label: "View Run Details",
        action: "navigate",
        endpoint: `/workflows/${workflowId}/runs/${runId}`,
        variant: "danger",
      },
    ],
  });
}
