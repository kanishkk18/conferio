// lib/workflows/templates.ts
// Pre-built workflow templates covering all ClickUp-style automations

import type { WorkflowTemplateDefinition } from "../../types/workflow";

export const WORKFLOW_TEMPLATES: WorkflowTemplateDefinition[] = [
  // ── Task Automation ───────────────────────────────────────────────────────
  {
    id: "tpl_task_assign_notify",
    name: "Notify when task is assigned",
    description: "Send an in-app notification when a task is assigned to someone",
    category: "productivity",
    icon: "📋",
    popular: true,
    trigger: "task.assigned",
    steps: [
      {
        id: "step_notify",
        type: "SEND_NOTIFICATION",
        name: "Notify assignee",
        config: {
          userId: "{{data.assigneeId}}",
          notificationType: "TASK_ASSIGNED",
          title: "New task assigned",
          body: 'You have been assigned: {{data.taskTitle}}',
          channels: ["in_app", "email"],
        },
      },
    ],
  },
  {
    id: "tpl_task_due_reminder",
    name: "Reminder 24h before task due date",
    description: "Automatically remind assignees 24 hours before a task is due",
    category: "productivity",
    icon: "⏰",
    popular: true,
    trigger: "task.due_soon",
    triggerConfig: { beforeDueMinutes: 1440 },
    steps: [
      {
        id: "step_remind",
        type: "SEND_NOTIFICATION",
        name: "Send due reminder",
        config: {
          userId: "{{data.assigneeId}}",
          notificationType: "TASK_DUE_SOON",
          title: "Task due tomorrow",
          body: '"{{data.taskTitle}}" is due in 24 hours',
          channels: ["in_app", "email"],
        },
      },
    ],
  },
  {
    id: "tpl_task_status_update",
    name: "Notify team when task is completed",
    description: "Notify board members when a task status changes to DONE",
    category: "productivity",
    icon: "✅",
    trigger: "task.status_changed",
    conditions: [
      { id: "c1", field: "data.newStatus", operator: "equals", value: "DONE" },
    ],
    steps: [
      {
        id: "step_notify_team",
        type: "SEND_NOTIFICATION",
        name: "Notify board members",
        config: {
          userIds: "{{data.boardMemberIds}}",
          notificationType: "TASK_STATUS_CHANGED",
          title: "Task completed",
          body: '"{{data.taskTitle}}" was marked as done',
          channels: ["in_app"],
        },
      },
    ],
  },
  {
    id: "tpl_urgent_task_escalate",
    name: "Auto-create subtask for urgent tasks",
    description: "When a task is created with URGENT priority, create a review subtask",
    category: "productivity",
    icon: "🔥",
    trigger: "task.created",
    conditions: [
      { id: "c1", field: "data.priority", operator: "equals", value: "URGENT" },
    ],
    steps: [
      {
        id: "step_notify_manager",
        type: "SEND_NOTIFICATION",
        name: "Alert manager",
        config: {
          userId: "{{data.teamManagerId}}",
          notificationType: "TASK_ASSIGNED",
          title: "🚨 Urgent task created",
          body: 'Urgent: "{{data.taskTitle}}" needs immediate attention',
          channels: ["in_app", "email"],
        },
        onError: "continue",
      },
    ],
  },
  // ── Meeting Automation ────────────────────────────────────────────────────
  {
    id: "tpl_meeting_reminder",
    name: "Meeting reminder 30 min before",
    description: "Send a reminder to all attendees 30 minutes before a meeting starts",
    category: "communication",
    icon: "📅",
    popular: true,
    trigger: "meeting.scheduled",
    steps: [
      {
        id: "step_reminder",
        type: "SCHEDULE_REMINDER",
        name: "Schedule reminder",
        config: {
          title: "Meeting starting soon: {{data.meetingTitle}}",
          description: "Your meeting starts in 30 minutes",
          dueDate: "{{data.startTimeMinus30}}",
          userId: "{{data.userId}}",
        },
      },
    ],
  },
  {
    id: "tpl_meeting_ended_task",
    name: "Create follow-up task after meeting",
    description: "Automatically create a follow-up task when a meeting ends",
    category: "productivity",
    icon: "🗒️",
    trigger: "meeting.ended",
    steps: [
      {
        id: "step_ai_summarize",
        type: "AI_SUMMARIZE",
        name: "Summarize meeting",
        config: {
          text: "{{data.transcript}}",
          options: { format: "action_items" },
        },
        onError: "continue",
      },
      {
        id: "step_create_task",
        type: "CREATE_TASK",
        name: "Create follow-up task",
        config: {
          title: "Follow-up: {{data.meetingTitle}}",
          description: "Meeting summary:\n{{step_0_output.summary}}",
          columnId: "{{data.defaultColumnId}}",
          boardId: "{{data.defaultBoardId}}",
          priority: "MEDIUM",
        },
      },
    ],
  },
  // ── File Automation ───────────────────────────────────────────────────────
  {
    id: "tpl_file_uploaded_notify",
    name: "Notify team when file is uploaded",
    description: "Notify all team members when a new file is shared with the team",
    category: "communication",
    icon: "📁",
    trigger: "file.uploaded",
    conditions: [
      { id: "c1", field: "data.visibility", operator: "equals", value: "TEAM" },
    ],
    steps: [
      {
        id: "step_notify",
        type: "SEND_NOTIFICATION",
        name: "Notify team",
        config: {
          userIds: "{{data.teamMemberIds}}",
          notificationType: "FILE_UPLOADED_TEAM",
          title: "New file shared",
          body: '{{data.uploaderName}} shared "{{data.fileName}}" with the team',
          channels: ["in_app"],
        },
      },
    ],
  },
  // ── Time Tracking Automation ──────────────────────────────────────────────
  {
    id: "tpl_timesheet_submitted",
    name: "Notify manager when timesheet submitted",
    description: "Send a notification to the team manager when a member submits their timesheet",
    category: "hr",
    icon: "⏱️",
    trigger: "time_entry.submitted",
    steps: [
      {
        id: "step_notify_manager",
        type: "SEND_NOTIFICATION",
        name: "Notify manager",
        config: {
          userId: "{{data.managerId}}",
          notificationType: "TIMER_APPROVAL_PENDING",
          title: "Timesheet awaiting approval",
          body: "{{data.memberName}}'s timesheet is ready for review",
          channels: ["in_app", "email"],
          actions: [
            {
              label: "Approve",
              action: "navigate",
              endpoint: "/time-tracking?tab=approvals",
              variant: "primary",
            },
          ],
        },
      },
    ],
  },
  {
    id: "tpl_timesheet_approved_notify",
    name: "Notify member when timesheet approved",
    description: "Send confirmation to team member when their timesheet is approved",
    category: "hr",
    icon: "✅",
    trigger: "time_entry.approved",
    steps: [
      {
        id: "step_notify_member",
        type: "SEND_NOTIFICATION",
        name: "Notify member",
        config: {
          userId: "{{data.userId}}",
          notificationType: "TIMESHEET_APPROVED",
          title: "Timesheet approved",
          body: "Your timesheet for {{data.period}} has been approved",
          channels: ["in_app"],
        },
      },
    ],
  },
  // ── Team Automation ───────────────────────────────────────────────────────
  {
    id: "tpl_member_onboard",
    name: "Welcome new team member",
    description: "Send a welcome notification and create onboarding tasks when a member joins",
    category: "hr",
    icon: "👋",
    popular: true,
    trigger: "team.member_added",
    steps: [
      {
        id: "step_welcome",
        type: "SEND_NOTIFICATION",
        name: "Send welcome",
        config: {
          userId: "{{data.newMemberId}}",
          notificationType: "TEAM_MEMBER_ADDED",
          title: "Welcome to {{data.teamName}}! 🎉",
          body: "You've joined the team. Let's get started!",
          channels: ["in_app", "email"],
        },
      },
    ],
  },
  // ── Scheduled Automation ──────────────────────────────────────────────────
  {
    id: "tpl_daily_standup_reminder",
    name: "Daily standup reminder",
    description: "Send a daily standup reminder to all team members at 9 AM",
    category: "communication",
    icon: "☕",
    trigger: "schedule",
    triggerConfig: { schedule: "0 9 * * 1-5", timezone: "UTC" },
    steps: [
      {
        id: "step_remind",
        type: "SEND_NOTIFICATION",
        name: "Send standup reminder",
        config: {
          userIds: "{{data.teamMemberIds}}",
          notificationType: "MEETING_REMINDER",
          title: "Daily standup time! ☕",
          body: "Time for your daily standup. Share what you're working on.",
          channels: ["in_app"],
        },
      },
    ],
  },
  {
    id: "tpl_weekly_summary",
    name: "Weekly progress summary",
    description: "Send a weekly summary of completed tasks every Friday at 5 PM",
    category: "productivity",
    icon: "📊",
    trigger: "schedule",
    triggerConfig: { schedule: "0 17 * * 5", timezone: "UTC" },
    steps: [
      {
        id: "step_webhook",
        type: "SEND_WEBHOOK",
        name: "Fetch weekly stats",
        config: {
          url: "{{config.statsEndpoint}}",
          method: "GET",
        },
        onError: "continue",
      },
      {
        id: "step_notify",
        type: "SEND_NOTIFICATION",
        name: "Send summary",
        config: {
          userIds: "{{data.teamMemberIds}}",
          notificationType: "WORKFLOW_EXECUTED",
          title: "📊 Weekly summary ready",
          body: "Your team's weekly progress report is ready",
          channels: ["in_app", "email"],
        },
      },
    ],
  },
  // ── Page/Docs Automation ──────────────────────────────────────────────────
  {
    id: "tpl_page_comment_notify",
    name: "Notify author when page receives comment",
    description: "Alert the page author when someone adds a comment",
    category: "communication",
    icon: "💬",
    trigger: "page.comment_added",
    steps: [
      {
        id: "step_notify_author",
        type: "SEND_NOTIFICATION",
        name: "Notify author",
        config: {
          userId: "{{data.pageAuthorId}}",
          notificationType: "PAGE_COMMENT_ADDED",
          title: "New comment on your page",
          body: '{{data.commenterName}} commented: "{{data.commentPreview}}"',
          channels: ["in_app"],
          actions: [
            {
              label: "View",
              action: "navigate",
              endpoint: "/docs/{{data.pageId}}",
              variant: "primary",
            },
          ],
        },
      },
    ],
  },
  // ── Webhook Integration ───────────────────────────────────────────────────
  {
    id: "tpl_slack_notify",
    name: "Send Slack notification on task complete",
    description: "Send a Slack message when a task is marked as done",
    category: "communication",
    icon: "💬",
    trigger: "task.status_changed",
    conditions: [
      { id: "c1", field: "data.newStatus", operator: "equals", value: "DONE" },
    ],
    steps: [
      {
        id: "step_slack",
        type: "SEND_WEBHOOK",
        name: "Post to Slack",
        config: {
          url: "{{config.slackWebhookUrl}}",
          method: "POST",
          body: {
            text: ":white_check_mark: Task completed: *{{data.taskTitle}}*",
          },
        },
        onError: "continue",
      },
    ],
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All", icon: "⚡" },
  { id: "productivity", label: "Productivity", icon: "📋" },
  { id: "communication", label: "Communication", icon: "💬" },
  { id: "hr", label: "HR", icon: "👥" },
  { id: "engineering", label: "Engineering", icon: "⚙️" },
  { id: "sales", label: "Sales", icon: "💰" },
];
