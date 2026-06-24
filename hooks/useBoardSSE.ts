// 'use client';

// import { useEffect } from 'react';
// import { useQueryClient } from '@tanstack/react-query';
// import { useSSE } from './useSSE';

// interface Task {
//   id: string;
//   columnId?: string;
//   subtasks?: any[];
//   attachments?: any[];
//   assignees?: any[];
//   labels?: any[];
//   _count?: { boardComments: number; attachments?: number; subtasks?: number };
//   [key: string]: any;
// }

// interface BoardData {
//   columns: Array<{
//     id: string;
//     tasks: Task[];
//     [key: string]: any;
//   }>;
//   [key: string]: any;
// }

// function safeTask(task: Task): Task {
//   return {
//     ...task,
//     subtasks: task.subtasks ?? [],
//     attachments: task.attachments ?? [],
//     assignees: task.assignees ?? [],
//     labels: task.labels ?? [],
//     _count: task._count ?? { boardComments: 0, attachments: 0, subtasks: 0 },
//   };
// }

// export function useBoardSSE(boardId: string | string[] | undefined) {
//   const queryClient = useQueryClient();
//   const id = typeof boardId === 'string' ? boardId : undefined;

//   useSSE((data) => {
//     if (!id || data.boardId !== id) return;

//     switch (data.type) {
//       case 'task:created': {
//         queryClient.setQueryData(['board', id], (old: BoardData | undefined) => {
//           if (!old) return old;
//           const targetColumnId = data.columnId ?? data.task.columnId;
//           const alreadyExists = old.columns.some((col) =>
//             col.tasks.some((t) => t.id === data.task.id)
//           );
//           if (alreadyExists) return old;

//           return {
//             ...old,
//             columns: old.columns.map((col) => {
//               if (col.id === targetColumnId) {
//                 return { ...col, tasks: [...col.tasks, safeTask(data.task)] };
//               }
//               return col;
//             }),
//           };
//         });
//         break;
//       }

//       case 'task:updated': {
//         queryClient.setQueryData(['board', id], (old: BoardData | undefined) => {
//           if (!old) return old;
//           return {
//             ...old,
//             columns: old.columns.map((col) => ({
//               ...col,
//               tasks: col.tasks.map((t) => {
//                 if (t.id !== data.task.id) return t;
//                 return safeTask({
//                   ...t,
//                   ...data.task,
//                   subtasks: data.task.subtasks ?? t.subtasks,
//                   attachments: data.task.attachments ?? t.attachments,
//                   assignees: data.task.assignees ?? t.assignees,
//                   labels: data.task.labels ?? t.labels,
//                 });
//               }),
//             })),
//           };
//         });
//         break;
//       }

//       case 'task:moved': {
//         queryClient.setQueryData(['board', id], (old: BoardData | undefined) => {
//           if (!old) return old;
//           let movedTask: Task | undefined;
//           const withoutTask = old.columns.map((col) => {
//             if (col.id === data.fromColumnId) {
//               movedTask = col.tasks.find((t) => t.id === data.taskId);
//               return { ...col, tasks: col.tasks.filter((t) => t.id !== data.taskId) };
//             }
//             return col;
//           });
//           const taskToInsert = safeTask({ ...(movedTask ?? {}), ...data.task, columnId: data.toColumnId });
//           return {
//             ...old,
//             columns: withoutTask.map((col) => {
//               if (col.id === data.toColumnId) {
//                 const alreadyThere = col.tasks.some((t) => t.id === data.taskId);
//                 if (alreadyThere) return col;
//                 return { ...col, tasks: [...col.tasks, taskToInsert] };
//               }
//               return col;
//             }),
//           };
//         });
//         break;
//       }

//       case 'task:deleted': {
//         queryClient.setQueryData(['board', id], (old: BoardData | undefined) => {
//           if (!old) return old;
//           return {
//             ...old,
//             columns: old.columns.map((col) => ({
//               ...col,
//               tasks: col.tasks.filter((t) => t.id !== data.taskId),
//             })),
//           };
//         });
//         break;
//       }
//     }
//   });
// }

"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSSE } from "./useSSE";

interface Task {
  id: string;
  columnId?: string;
  subtasks?: any[];
  attachments?: any[];
  assignees?: any[];
  labels?: any[];
  _count?: { boardComments: number; attachments?: number; subtasks?: number };
  [key: string]: any;
}

interface BoardData {
  columns: Array<{
    id: string;
    tasks: Task[];
    [key: string]: any;
  }>;
  [key: string]: any;
}

function safeTask(task: Task): Task {
  return {
    ...task,
    subtasks: task.subtasks ?? [],
    attachments: task.attachments ?? [],
    assignees: task.assignees ?? [],
    labels: task.labels ?? [],
    _count: task._count ?? { boardComments: 0, attachments: 0, subtasks: 0 },
  };
}

export function useBoardSSE(boardId: string | string[] | undefined) {
  const queryClient = useQueryClient();
  const id = typeof boardId === "string" ? boardId : undefined;

  useSSE((data) => {
    if (!id || data.boardId !== id) return;

    console.log("[BoardSSE] Processing:", data.type);

    switch (data.type) {
      case "task:created": {
        queryClient.setQueryData(["board", id], (old: BoardData | undefined) => {
          if (!old) return old;
          const targetColumnId = data.columnId ?? data.task?.columnId;
          const alreadyExists = old.columns.some((col) =>
            col.tasks.some((t) => t.id === data.task.id)
          );
          if (alreadyExists) return old;

          return {
            ...old,
            columns: old.columns.map((col) => {
              if (col.id === targetColumnId) {
                return { ...col, tasks: [...col.tasks, safeTask(data.task)] };
              }
              return col;
            }),
          };
        });
        break;
      }

      case "task:updated": {
        queryClient.setQueryData(["board", id], (old: BoardData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            columns: old.columns.map((col) => ({
              ...col,
              tasks: col.tasks.map((t) => {
                if (t.id !== data.task.id) return t;
                return safeTask({
                  ...t,
                  ...data.task,
                  subtasks: data.task.subtasks ?? t.subtasks,
                  attachments: data.task.attachments ?? t.attachments,
                  assignees: data.task.assignees ?? t.assignees,
                  labels: data.task.labels ?? t.labels,
                });
              }),
            })),
          };
        });

        // Also update individual task cache if it exists
        queryClient.setQueryData(["task", data.task.id], (old: any) => {
          if (!old) return old;
          return safeTask({ ...old, ...data.task });
        });
        break;
      }

      case "task:moved": {
        queryClient.setQueryData(["board", id], (old: BoardData | undefined) => {
          if (!old) return old;
          let movedTask: Task | undefined;
          const withoutTask = old.columns.map((col) => {
            if (col.id === data.fromColumnId) {
              movedTask = col.tasks.find((t) => t.id === data.taskId);
              return { ...col, tasks: col.tasks.filter((t) => t.id !== data.taskId) };
            }
            return col;
          });
          const taskToInsert = safeTask({ ...(movedTask ?? {}), ...data.task, columnId: data.toColumnId });
          return {
            ...old,
            columns: withoutTask.map((col) => {
              if (col.id === data.toColumnId) {
                const alreadyThere = col.tasks.some((t) => t.id === data.taskId);
                if (alreadyThere) return col;
                return { ...col, tasks: [...col.tasks, taskToInsert] };
              }
              return col;
            }),
          };
        });
        break;
      }

      case "task:deleted": {
        queryClient.setQueryData(["board", id], (old: BoardData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            columns: old.columns.map((col) => ({
              ...col,
              tasks: col.tasks.filter((t) => t.id !== data.taskId),
            })),
          };
        });
        break;
      }
    }
  });
}