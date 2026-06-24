// import { prisma } from '@/lib/prisma';

// export type ActivityAction =
//   | 'CREATED'
//   | 'UPDATED'
//   | 'DELETED'
//   | 'MOVED'
//   | 'ASSIGNED'
//   | 'UNASSIGNED'
//   | 'ARCHIVED'
//   | 'RESTORED'
//   | 'COMMENTED'
//   | 'ATTACHED'
//   | 'LABELED'
//   | 'INVITED'
//   | 'JOINED'
//   | 'REMOVED'
//   | 'RENAMED'
//   | 'COVER_CHANGED'
//   | 'DUE_DATE_SET'
//   | 'PRIORITY_CHANGED'
//   | 'STATUS_CHANGED';

// export type ActivityEntity =
//   | 'BOARD'
//   | 'COLUMN'
//   | 'TASK'
//   | 'COMMENT'
//   | 'MEMBER'
//   | 'LABEL'
//   | 'ATTACHMENT';

// interface LogActivityParams {
//   action: ActivityAction;
//   entityType: ActivityEntity;
//   entityId: string;
//   description: string;
//   boardId: string;
//   taskId?: string;
//   userId: string;
//   metadata?: Record<string, any>;
// }

// export async function logActivity(params: LogActivityParams) {
//   try {
//     await prisma.activityLog.create({
//       data: {
//         action: params.action,
//         entityType: params.entityType,
//         entityId: params.entityId,
//         description: params.description,
//         boardId: params.boardId,
//         taskId: params.taskId,
//         userId: params.userId,
//         metadata: params.metadata ?? {},
//       },
//     });
//   } catch (err) {
//     // Never let logging crash the main operation
//     console.error('[ActivityLog] Failed to log:', err);
//   }
// }
