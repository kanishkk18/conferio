// // pages/api/teams/[slug]/workload/index.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { throwIfNoTeamAccess, getCurrentUserWithTeam } from "models/team";
// import { throwIfNotAllowed } from "models/user";
// import { prisma } from "@/lib/prisma";
// import { recordMetric } from "@/lib/metrics";
// import { getRedisClient } from "@/lib/redis";

// const CACHE_TTL = 60; // 60 seconds

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     await throwIfNoTeamAccess(req, res);

//     switch (req.method) {
//       case "GET":
//         await handleGET(req, res);
//         break;
//       default:
//         res.setHeader("Allow", "GET");
//         res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
//     }
//   } catch (error: any) {
//     res.status(error.status || 500).json({ error: { message: error.message || "Something went wrong" } });
//   }
// }

// const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
//   const user = await getCurrentUserWithTeam(req, res);
//   throwIfNotAllowed(user, "team", "read");

//   const teamId = user.team.id;
//   const cacheKey = `workload:${teamId}`;

//   // Try Redis cache first
//   try {
//     const redis = getRedisClient();
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       return res.status(200).json({ data: JSON.parse(cached as string), cached: true });
//     }
//   } catch (_) {
//     // Redis unavailable, continue
//   }

//   const now = new Date();
//   const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//   const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

//   // Fetch all team members with their workload data in parallel
//   const [teamMembers, tasks, pages, files, timeEntries] = await Promise.all([
//     prisma.teamMember.findMany({
//       where: { teamId },
//       include: {
//         user: {
//           select: { id: true, name: true, email: true, image: true, imageUrl: true },
//         },
//       },
//     }),

//     // Tasks assigned to members in this team
//     prisma.taskAssignee.findMany({
//       where: {
//         task: {
//           column: { board: { members: { some: { userId: { in: [] } } } } },
//           isArchived: false,
//         },
//       },
//       include: {
//         task: {
//           select: {
//             id: true,
//             title: true,
//             status: true,
//             priority: true,
//             dueDate: true,
//             createdAt: true,
//             updatedAt: true,
//             columnId: true,
//           },
//         },
//       },
//     }),

//     // Pages assigned to team members
//     prisma.page.findMany({
//       where: { teamId, isTemplate: false },
//       select: {
//         id: true,
//         title: true,
//         assignedToId: true,
//         assignedById: true,
//         visibility: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     }),

//     // Files assigned to users in the team
//     prisma.fileAssignment.findMany({
//       where: {
//         user: { teamMembers: { some: { teamId } } },
//         file: { teamId },
//       },
//       include: {
//         file: { select: { id: true, originalName: true, size: true, createdAt: true } },
//       },
//     }),

//     // Time entries for this team
//     prisma.timeEntry.findMany({
//       where: { teamId, startTime: { gte: thirtyDaysAgo } },
//       select: {
//         userId: true,
//         duration: true,
//         startTime: true,
//         isBillable: true,
//         billableStatus: true,
//       },
//     }),
//   ]);

//   const memberIds = teamMembers.map((m) => m.userId);

//   // Fetch tasks assigned to team members via boards they belong to
//   const memberTasks = await prisma.taskAssignee.findMany({
//     where: { userId: { in: memberIds } },
//     include: {
//       task: {
//         select: {
//           id: true,
//           title: true,
//           status: true,
//           priority: true,
//           dueDate: true,
//           createdAt: true,
//           updatedAt: true,
//           boardId: true,
//         },
//       },
//     },
//   });

//   // Fetch reminders for team members
//   const reminders = await prisma.reminder.findMany({
//     where: { userId: { in: memberIds }, status: "PENDING" },
//     select: { userId: true, dueDate: true, status: true },
//   });

//   // Compute per-member workload
//   const memberWorkloads = teamMembers.map((member) => {
//     const uid = member.userId;

//     const myTasks = memberTasks
//       .filter((t) => t.userId === uid)
//       .map((t) => t.task);

//     const activeTasks = myTasks.filter((t) => t.status !== "DONE");
//     const completedTasks = myTasks.filter((t) => t.status === "DONE");
//     const overdueTasks = activeTasks.filter(
//       (t) => t.dueDate && new Date(t.dueDate) < now
//     );
//     const urgentTasks = activeTasks.filter((t) => t.priority === "URGENT");
//     const highTasks = activeTasks.filter((t) => t.priority === "HIGH");

//     const myPages = pages.filter((p) => {
//       const tm = teamMembers.find((m) => m.userId === uid);
//       return p.assignedToId === tm?.id;
//     });

//     const myFiles = files.filter((f) => f.userId === uid);

//     const myTimeEntries = timeEntries.filter((t) => t.userId === uid);
//     const totalHours = myTimeEntries.reduce((sum, t) => sum + (t.duration || 0), 0) / 3600;
//     const recentTimeEntries = timeEntries.filter(
//       (t) => t.userId === uid && new Date(t.startTime) >= sevenDaysAgo
//     );
//     const weeklyHours = recentTimeEntries.reduce((sum, t) => sum + (t.duration || 0), 0) / 3600;

//     const myReminders = reminders.filter((r) => r.userId === uid);

//     // Workload score: weighted sum of all work items
//     // Weights: urgent task=10, high=7, medium=5, low=3, page=4, file=2, reminder=3
//     const workloadScore =
//       urgentTasks.length * 10 +
//       highTasks.length * 7 +
//       activeTasks.filter((t) => t.priority === "MEDIUM").length * 5 +
//       activeTasks.filter((t) => t.priority === "LOW").length * 3 +
//       myPages.length * 4 +
//       myFiles.length * 2 +
//       myReminders.length * 3 +
//       overdueTasks.length * 8; // overdue adds extra weight

//     // Trend: tasks created in last 7 days vs 7-14 days
//     const recentTasks = myTasks.filter((t) => new Date(t.createdAt) >= sevenDaysAgo).length;
//     const prevWeekTasks = myTasks.filter((t) => {
//       const d = new Date(t.createdAt);
//       return d >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) && d < sevenDaysAgo;
//     }).length;
//     const trend = prevWeekTasks === 0 ? 0 : ((recentTasks - prevWeekTasks) / prevWeekTasks) * 100;

//     return {
//       memberId: uid,
//       memberName: member.user.name,
//       memberEmail: member.user.email,
//       memberImage: member.user.imageUrl || member.user.image,
//       role: member.role,
//       workloadScore,
//       tasks: {
//         total: myTasks.length,
//         active: activeTasks.length,
//         completed: completedTasks.length,
//         overdue: overdueTasks.length,
//         urgent: urgentTasks.length,
//         high: highTasks.length,
//         byStatus: {
//           TODO: myTasks.filter((t) => t.status === "TODO").length,
//           IN_PROGRESS: myTasks.filter((t) => t.status === "IN_PROGRESS").length,
//           REVIEW: myTasks.filter((t) => t.status === "REVIEW").length,
//           DONE: completedTasks.length,
//         },
//         byPriority: {
//           URGENT: urgentTasks.length,
//           HIGH: highTasks.length,
//           MEDIUM: activeTasks.filter((t) => t.priority === "MEDIUM").length,
//           LOW: activeTasks.filter((t) => t.priority === "LOW").length,
//         },
//       },
//       pages: { total: myPages.length },
//       files: { total: myFiles.length },
//       reminders: { pending: myReminders.length },
//       time: {
//         totalHoursMonth: Math.round(totalHours * 10) / 10,
//         weeklyHours: Math.round(weeklyHours * 10) / 10,
//       },
//       trend: Math.round(trend),
//     };
//   });

//   // --- Load Balancing Suggestions ---
//   const avgScore =
//     memberWorkloads.reduce((sum, m) => sum + m.workloadScore, 0) /
//     (memberWorkloads.length || 1);

//   const overloaded = memberWorkloads.filter((m) => m.workloadScore > avgScore * 1.4);
//   const underloaded = memberWorkloads.filter((m) => m.workloadScore < avgScore * 0.6);

//   const balanceSuggestions: Array<{
//     from: string;
//     fromName: string;
//     to: string;
//     toName: string;
//     reason: string;
//     potentialItems: number;
//   }> = [];

//   for (const over of overloaded) {
//     for (const under of underloaded) {
//       const delta = over.workloadScore - under.workloadScore;
//       const itemsToMove = Math.ceil(delta / 5); // rough estimate
//       balanceSuggestions.push({
//         from: over.memberId,
//         fromName: over.memberName,
//         to: under.memberId,
//         toName: under.memberName,
//         reason: `${over.memberName} is overloaded (score: ${over.workloadScore}) vs ${under.memberName} (score: ${under.workloadScore})`,
//         potentialItems: itemsToMove,
//       });
//     }
//   }

//   // --- Team-level Aggregates ---
//   const totalActiveTasks = memberWorkloads.reduce((s, m) => s + m.tasks.active, 0);
//   const totalCompletedTasks = memberWorkloads.reduce((s, m) => s + m.tasks.completed, 0);
//   const totalOverdue = memberWorkloads.reduce((s, m) => s + m.tasks.overdue, 0);
//   const totalPages = memberWorkloads.reduce((s, m) => s + m.pages.total, 0);
//   const totalFiles = memberWorkloads.reduce((s, m) => s + m.files.total, 0);
//   const totalHoursMonth = memberWorkloads.reduce((s, m) => s + m.time.totalHoursMonth, 0);

//   // --- Weekly trend data (last 4 weeks) ---
//   const weeklyTrend = Array.from({ length: 4 }, (_, i) => {
//     const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
//     const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
//     const label = `Week ${4 - i}`;
//     const tasksCreated = memberTasks.filter((t) => {
//       const d = new Date(t.task.createdAt);
//       return d >= weekStart && d < weekEnd;
//     }).length;
//     const tasksCompleted = memberTasks.filter((t) => {
//       const d = new Date(t.task.updatedAt);
//       return t.task.status === "DONE" && d >= weekStart && d < weekEnd;
//     }).length;
//     const hours = timeEntries
//       .filter((t) => {
//         const d = new Date(t.startTime);
//         return d >= weekStart && d < weekEnd;
//       })
//       .reduce((sum, t) => sum + (t.duration || 0), 0) / 3600;

//     return { week: label, tasksCreated, tasksCompleted, hours: Math.round(hours * 10) / 10 };
//   }).reverse();

//   const result = {
//     team: {
//       id: teamId,
//       name: user.team.name,
//       memberCount: teamMembers.length,
//       totalActiveTasks,
//       totalCompletedTasks,
//       totalOverdue,
//       totalPages,
//       totalFiles,
//       totalHoursMonth: Math.round(totalHoursMonth * 10) / 10,
//       avgWorkloadScore: Math.round(avgScore),
//       completionRate:
//         totalActiveTasks + totalCompletedTasks > 0
//           ? Math.round((totalCompletedTasks / (totalActiveTasks + totalCompletedTasks)) * 100)
//           : 0,
//     },
//     members: memberWorkloads,
//     balanceSuggestions,
//     weeklyTrend,
//     generatedAt: new Date().toISOString(),
//   };

//   // Cache in Redis
//   try {
//     const redis = getRedisClient();
//     await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
//   } catch (_) {}

//   recordMetric("workload.fetched");
//   res.status(200).json({ data: result });
// };

// pages/api/teams/[slug]/workload/index.ts
// Updated: adds meetings count + percentage to each member
import type { NextApiRequest, NextApiResponse } from "next";
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from "models/team";
import { throwIfNotAllowed } from "models/user";
import { prisma } from "@/lib/prisma";
import { recordMetric } from "@/lib/metrics";
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis";

const CACHE_TTL = 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await throwIfNoTeamAccess(req, res);
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: { message: "Method Not Allowed" } });
    }
    await handleGET(req, res);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || "Something went wrong" } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, "team", "read");

  const teamId = user.team.id;
  const cacheKey = `workload:v2:${teamId}`;

  // Try cache
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return res.status(200).json({ data: cached, cached: true });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const teamMembers = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: { select: { id: true, name: true, email: true, image: true, imageUrl: true } } },
  });

  const memberIds = teamMembers.map(m => m.userId);

  const [memberTasks, pages, fileAssignments, timeEntries, reminders, meetings] = await Promise.all([
    prisma.taskAssignee.findMany({
      where: { userId: { in: memberIds } },
      include: {
        task: {
          select: {
            id: true, title: true, status: true, priority: true,
            dueDate: true, createdAt: true, updatedAt: true, boardId: true,
          },
        },
      },
    }),
    prisma.page.findMany({
      where: { teamId, isTemplate: false },
      select: { id: true, assignedToId: true, createdAt: true },
    }),
    prisma.fileAssignment.findMany({
      where: { user: { teamMembers: { some: { teamId } } }, file: { teamId } },
      select: { userId: true, fileId: true },
    }),
    prisma.timeEntry.findMany({
      where: { teamId, startTime: { gte: thirtyDaysAgo } },
      select: { userId: true, duration: true, startTime: true },
    }),
    prisma.reminder.findMany({
      where: { userId: { in: memberIds }, status: "PENDING" },
      select: { userId: true, dueDate: true },
    }),
    // Count meetings per user in last 30 days
    prisma.meeting.findMany({
      where: {
        userId: { in: memberIds },
        startTime: { gte: thirtyDaysAgo },
        status: "SCHEDULED",
      },
      select: { userId: true, startTime: true },
    }),
  ]);

  const memberWorkloads = teamMembers.map(member => {
    const uid = member.userId;
    const myTasks = memberTasks.filter(t => t.userId === uid).map(t => t.task);
    const activeTasks = myTasks.filter(t => t.status !== "DONE");
    const completedTasks = myTasks.filter(t => t.status === "DONE");
    const overdueTasks = activeTasks.filter(t => t.dueDate && new Date(t.dueDate) < now);
    const urgentTasks = activeTasks.filter(t => t.priority === "URGENT");
    const highTasks = activeTasks.filter(t => t.priority === "HIGH");

    const tm = teamMembers.find(m => m.userId === uid);
    const myPages = pages.filter(p => p.assignedToId === tm?.id);
    const myFiles = fileAssignments.filter(f => f.userId === uid);
    const myTimeEntries = timeEntries.filter(t => t.userId === uid);
    const myReminders = reminders.filter(r => r.userId === uid);
    const myMeetings = meetings.filter(m => m.userId === uid);

    const totalHours = myTimeEntries.reduce((s, t) => s + (t.duration || 0), 0) / 3600;
    const weeklyHours = myTimeEntries
      .filter(t => new Date(t.startTime) >= sevenDaysAgo)
      .reduce((s, t) => s + (t.duration || 0), 0) / 3600;

    const workloadScore =
      urgentTasks.length * 10 +
      overdueTasks.length * 8 +
      highTasks.length * 7 +
      activeTasks.filter(t => t.priority === "MEDIUM").length * 5 +
      myReminders.length * 3 +
      activeTasks.filter(t => t.priority === "LOW").length * 3 +
      myPages.length * 4 +
      myFiles.length * 2;

    const recentTasks = myTasks.filter(t => new Date(t.createdAt) >= sevenDaysAgo).length;
    const prevWeekTasks = myTasks.filter(t => {
      const d = new Date(t.createdAt);
      return d >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) && d < sevenDaysAgo;
    }).length;
    const trend = prevWeekTasks === 0 ? 0 : Math.round(((recentTasks - prevWeekTasks) / prevWeekTasks) * 100);

    // Meeting % = meetings / (tasks + meetings) * 100
    const totalWorkItems = activeTasks.length + myMeetings.length;
    const meetingPct = totalWorkItems > 0
      ? Math.round((myMeetings.length / totalWorkItems) * 100)
      : 0;

    return {
      memberId: uid,
      memberName: member.user.name,
      memberEmail: member.user.email,
      memberImage: member.user.imageUrl || member.user.image,
      role: member.role,
      workloadScore,
      tasks: {
        total: myTasks.length,
        active: activeTasks.length,
        completed: completedTasks.length,
        overdue: overdueTasks.length,
        urgent: urgentTasks.length,
        high: highTasks.length,
        byStatus: {
          TODO: myTasks.filter(t => t.status === "TODO").length,
          IN_PROGRESS: myTasks.filter(t => t.status === "IN_PROGRESS").length,
          REVIEW: myTasks.filter(t => t.status === "REVIEW").length,
          DONE: completedTasks.length,
        },
        byPriority: {
          URGENT: urgentTasks.length,
          HIGH: highTasks.length,
          MEDIUM: activeTasks.filter(t => t.priority === "MEDIUM").length,
          LOW: activeTasks.filter(t => t.priority === "LOW").length,
        },
      },
      pages: { total: myPages.length },
      files: { total: myFiles.length },
      reminders: { pending: myReminders.length },
      meetings: {
        scheduled: myMeetings.length,
        percentage: meetingPct,
      },
      time: {
        totalHoursMonth: Math.round(totalHours * 10) / 10,
        weeklyHours: Math.round(weeklyHours * 10) / 10,
      },
      trend,
    };
  });

  const avgScore = memberWorkloads.reduce((s, m) => s + m.workloadScore, 0) / (memberWorkloads.length || 1);
  const overloaded = memberWorkloads.filter(m => m.workloadScore > avgScore * 1.4);
  const underloaded = memberWorkloads.filter(m => m.workloadScore < avgScore * 0.6);

  const balanceSuggestions = overloaded.flatMap(over =>
    underloaded.map(under => ({
      from: over.memberId, fromName: over.memberName,
      to: under.memberId, toName: under.memberName,
      reason: `${over.memberName} is overloaded (score: ${over.workloadScore}) vs ${under.memberName} (score: ${under.workloadScore})`,
      potentialItems: Math.ceil((over.workloadScore - under.workloadScore) / 5),
    }))
  );

  const totalActiveTasks = memberWorkloads.reduce((s, m) => s + m.tasks.active, 0);
  const totalCompletedTasks = memberWorkloads.reduce((s, m) => s + m.tasks.completed, 0);

  // Weekly trend (last 4 weeks)
  const weeklyTrend = Array.from({ length: 4 }, (_, i) => {
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tasksCreated = memberTasks.filter(t => {
      const d = new Date(t.task.createdAt); return d >= weekStart && d < weekEnd;
    }).length;
    const tasksCompleted = memberTasks.filter(t => {
      const d = new Date(t.task.updatedAt);
      return t.task.status === "DONE" && d >= weekStart && d < weekEnd;
    }).length;
    const hours = timeEntries
      .filter(t => { const d = new Date(t.startTime); return d >= weekStart && d < weekEnd; })
      .reduce((s, t) => s + (t.duration || 0), 0) / 3600;
    return { week: `Week ${4 - i}`, tasksCreated, tasksCompleted, hours: Math.round(hours * 10) / 10 };
  }).reverse();

  const result = {
    team: {
      id: teamId, name: user.team.name, memberCount: teamMembers.length,
      totalActiveTasks, totalCompletedTasks,
      totalOverdue: memberWorkloads.reduce((s, m) => s + m.tasks.overdue, 0),
      totalPages: memberWorkloads.reduce((s, m) => s + m.pages.total, 0),
      totalFiles: memberWorkloads.reduce((s, m) => s + m.files.total, 0),
      totalHoursMonth: Math.round(memberWorkloads.reduce((s, m) => s + m.time.totalHoursMonth, 0) * 10) / 10,
      totalMeetings: meetings.length,
      avgWorkloadScore: Math.round(avgScore),
      completionRate: totalActiveTasks + totalCompletedTasks > 0
        ? Math.round((totalCompletedTasks / (totalActiveTasks + totalCompletedTasks)) * 100)
        : 0,
    },
    members: memberWorkloads,
    balanceSuggestions,
    weeklyTrend,
    generatedAt: new Date().toISOString(),
  };

  await cacheSet(cacheKey, result, CACHE_TTL);
  recordMetric("workload.fetched");
  res.status(200).json({ data: result });
};