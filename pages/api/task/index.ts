// // pages/api/task/index.ts
// import { getToken } from "next-auth/jwt";
// import type { NextApiRequest, NextApiResponse } from "next";
// import { prisma } from "utils/db";

// const secret = process.env.NEXTAUTH_SECRET;

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   try {
//     // POST - Create new task
//     if (req.method === "POST") {
//       const data = req.body;

//       if (!data.title || !data.dueTime) {
//         return res.status(400).json({ error: "title and dueTime are required." });
//       }

//       const token = await getToken({ req, secret });

//       if (!token?.email) {
//         return res.status(401).json({ error: "Unauthorized." });
//       }

//       const userFound = await prisma.user.findUnique({
//         where: { email: token.email },
//       });

//       if (!userFound) {
//         return res.status(404).json({ error: "User not found." });
//       }

//       const newTask = await prisma.myTask.create({
//         data: {
//           title: data.title,
//           description: data.description,
//           dueTime: data.dueTime,
//           priority: data.priority,
//           itsDone: false,
//           userId: userFound.id,
//           categoryId: data.category ? data.category.id : null,
//           ...(data.createdAt && { createdAt: data.createdAt }),
//         },
//       });

//       return res.status(200).json(newTask);
//     }

//     // GET - Fetch tasks
//     if (req.method === "GET") {
//       const token = await getToken({ req, secret });

//       if (!token?.email) {
//         return res.status(401).json({ error: "Unauthorized." });
//       }

//       const userFound = await prisma.user.findUnique({
//         where: { email: token.email },
//       });

//       if (!userFound) {
//         return res.status(404).json({ error: "User not found." });
//       }

//       const { categoryId, date, itsDone } = req.query;

//       const filters: {
//         userId: string;
//         categoryId?: string | null;
//         dueTime?: { gte: Date; lt: Date };
//         itsDone?: boolean;
//       } = { userId: userFound.id };

//       if (categoryId) {
//         filters.categoryId = categoryId as string;
//       }

//       if (date) {
//         const selectedDate = new Date(date as string);
//         const startOfDay = new Date(
//           selectedDate.getFullYear(),
//           selectedDate.getMonth(),
//           selectedDate.getDate()
//         );
//         const endOfDay = new Date(
//           selectedDate.getFullYear(),
//           selectedDate.getMonth(),
//           selectedDate.getDate() + 1
//         );

//         filters.dueTime = {
//           gte: startOfDay,
//           lt: endOfDay,
//         };
//       }

//       if (itsDone !== null && itsDone !== undefined) {
//         filters.itsDone = itsDone === "true";
//       }

//       const tasks = await prisma.myTask.findMany({
//         where: filters,
//         select: {
//           id: true,
//           title: true,
//           description: true,
//           dueTime: true,
//           itsDone: true,
//           priority: true,
//           createdAt: true,
//           category: true,
//         },
//       });

//       return res.status(200).json(tasks);
//     }

//     // PUT - Update task status
//     if (req.method === "PUT") {
//       const data = req.body;

//       if (data.itsDone === undefined) {
//         return res.status(400).json({ error: "'itsDone' field is required." });
//       }

//       const token = await getToken({ req, secret });

//       if (!token?.email) {
//         return res.status(401).json({ error: "Unauthorized." });
//       }

//       const userFound = await prisma.user.findUnique({
//         where: { email: token.email },
//       });

//       if (!userFound) {
//         return res.status(404).json({ error: "User not found." });
//       }

//       const taskToUpdate = await prisma.myTask.findUnique({
//         where: { id: data.id },
//       });

//       if (!taskToUpdate || taskToUpdate.userId !== userFound.id) {
//         return res.status(404).json({ error: "Task not found or unauthorized." });
//       }

//       const updatedTask = await prisma.myTask.update({
//         where: { id: data.id },
//         data: {
//           itsDone: data.itsDone,
//         },
//       });

//       return res.status(200).json(updatedTask);
//     }

//     // Handle unsupported methods
//     res.setHeader("Allow", ["GET", "POST", "PUT"]);
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
//   } catch (error) {
//     console.error("Error in task API:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }  working with jwt strategy but not with database strategy 

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth'; // adjust path to your authOptions
import { prisma } from 'utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // POST - Create new task
    if (req.method === 'POST') {
      const data = req.body;

      if (!data.title || !data.dueTime) {
        return res.status(400).json({ error: 'title and dueTime are required.' });
      }

      const session = await getServerSession(req, res, authOptions);

      if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized.' });
      }

      const userFound = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!userFound) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const newTask = await prisma.myTask.create({
        data: {
          title: data.title,
          description: data.description,
          dueTime: data.dueTime,
          priority: data.priority,
          itsDone: false,
          userId: userFound.id,
          categoryId: data.category ? data.category.id : null,
          ...(data.createdAt && { createdAt: data.createdAt }),
        },
      });

      return res.status(200).json(newTask);
    }

    // GET - Fetch tasks
    if (req.method === 'GET') {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized.' });
      }

      const userFound = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!userFound) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const { categoryId, date, itsDone } = req.query;

      const filters: {
        userId: string;
        categoryId?: string | null;
        dueTime?: { gte: Date; lt: Date };
        itsDone?: boolean;
      } = { userId: userFound.id };

      if (categoryId) {
        filters.categoryId = categoryId as string;
      }

      if (date) {
        const selectedDate = new Date(date as string);
        const startOfDay = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
        const endOfDay = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate() + 1
        );

        filters.dueTime = { gte: startOfDay, lt: endOfDay };
      }

      if (itsDone !== null && itsDone !== undefined) {
        filters.itsDone = itsDone === 'true';
      }

      const tasks = await prisma.myTask.findMany({
        where: filters,
        select: {
          id: true,
          title: true,
          description: true,
          dueTime: true,
          itsDone: true,
          priority: true,
          createdAt: true,
          category: true,
        },
      });

      return res.status(200).json(tasks);
    }

    // PUT - Update task status
    if (req.method === 'PUT') {
      const data = req.body;

      if (data.itsDone === undefined) {
        return res.status(400).json({ error: "'itsDone' field is required." });
      }

      const session = await getServerSession(req, res, authOptions);

      if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized.' });
      }

      const userFound = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!userFound) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const taskToUpdate = await prisma.myTask.findUnique({
        where: { id: data.id },
      });

      if (!taskToUpdate || taskToUpdate.userId !== userFound.id) {
        return res.status(404).json({ error: 'Task not found or unauthorized.' });
      }

      const updatedTask = await prisma.myTask.update({
        where: { id: data.id },
        data: { itsDone: data.itsDone },
      });

      return res.status(200).json(updatedTask);
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Error in task API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}