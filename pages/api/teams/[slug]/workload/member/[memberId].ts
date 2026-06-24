// pages/api/teams/[slug]/workload/member/[memberId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from "models/team";
import { throwIfNotAllowed } from "models/user";
import { prisma } from "@/lib/prisma";

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

  const { memberId } = req.query as { memberId: string };
  const teamId = user.team.id;

  // Verify member belongs to team
  const teamMember = await prisma.teamMember.findFirst({
    where: { teamId, userId: memberId },
    include: { user: { select: { id: true, name: true, email: true, image: true, imageUrl: true } } },
  });

  if (!teamMember) {
    return res.status(404).json({ error: { message: "Member not found in team" } });
  }

  const [tasks, pages, files, timeEntries, reminders] = await Promise.all([
    prisma.taskAssignee.findMany({
      where: { userId: memberId },
      include: {
        task: {
          include: {
            column: { include: { board: { select: { id: true, title: true } } } },
            subtasks: { select: { id: true, isCompleted: true } },
            labels: { include: { label: true } },
          },
        },
      },
      orderBy: { task: { updatedAt: "desc" } },
      take: 50,
    }),

    prisma.page.findMany({
      where: { teamId, assignedToId: teamMember.id },
      select: {
        id: true, title: true, emoji: true,
        visibility: true, createdAt: true, updatedAt: true,
        author: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),

    prisma.fileAssignment.findMany({
      where: { userId: memberId, file: { teamId } },
      include: {
        file: { select: { id: true, originalName: true, size: true, mimeType: true, createdAt: true } },
      },
      take: 20,
    }),

    prisma.timeEntry.findMany({
      where: {
        userId: memberId, teamId,
        startTime: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { duration: true, startTime: true, isBillable: true, description: true },
      orderBy: { startTime: "desc" },
    }),

    prisma.reminder.findMany({
      where: { userId: memberId, status: "PENDING" },
      select: { id: true, title: true, dueDate: true, taskId: true },
      take: 10,
    }),
  ]);

  res.status(200).json({
    data: {
      member: {
        id: teamMember.user.id,
        name: teamMember.user.name,
        email: teamMember.user.email,
        image: teamMember.user.imageUrl || teamMember.user.image,
        role: teamMember.role,
      },
      tasks: tasks.map((ta) => ({
        id: ta.task.id,
        title: ta.task.title,
        status: ta.task.status,
        priority: ta.task.priority,
        dueDate: ta.task.dueDate,
        board: ta.task.column.board,
        subtasksTotal: ta.task.subtasks.length,
        subtasksDone: ta.task.subtasks.filter((s) => s.isCompleted).length,
        labels: ta.task.labels.map((l) => ({ name: l.label.name, color: l.label.color })),
        isOverdue: ta.task.dueDate ? new Date(ta.task.dueDate) < new Date() && ta.task.status !== "DONE" : false,
      })),
      pages,
      files: files.map((fa) => fa.file),
      timeEntries: timeEntries.slice(0, 30),
      reminders,
    },
  });
};