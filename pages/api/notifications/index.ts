// // pages/api/notifications/index.ts
// /**
//  * GET  /api/notifications         → list paginated notifications
//  * POST /api/notifications         → create notification (internal / service use)
//  */
// import type { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "lib/auth";
// import { getNotifications } from "lib/notifications/notification.service";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const userId = session.user.id;

//   if (req.method === "GET") {
//     const page = parseInt((req.query.page as string) ?? "1", 10);
//     const pageSize = parseInt((req.query.pageSize as string) ?? "20", 10);

//     try {
//       const result = await getNotifications(userId, page, pageSize);
//       return res.status(200).json(result);
//     } catch (err) {
//       console.error("[Notifications GET]", err);
//       return res.status(500).json({ error: "Failed to fetch notifications" });
//     }
//   }

//   return res.status(405).json({ error: "Method not allowed" });
// }  works perfect 


// pages/api/notifications/index.ts
// GET /api/notifications - paginated list
// POST /api/notifications - create (internal use)

// import type { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth";
// import { PrismaClient } from "@prisma/client";
// import { authOptions } from "@/lib/auth";
// import { broadcastToUser } from "./stream";
// import type { CreateNotificationInput } from "../../../types/notifications";

// const prisma = new PrismaClient();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user) return res.status(401).json({ error: "Unauthorized" });
//   const userId = (session.user as { id: string }).id;

//   if (req.method === "GET") {
//     const page = parseInt((req.query.page as string) || "1");
//     const pageSize = Math.min(parseInt((req.query.pageSize as string) || "20"), 50);
//     const unreadOnly = req.query.unreadOnly === "true";

//     const where = {
//       userId,
//       ...(unreadOnly ? { read: false } : {}),
//       OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
//     };

//     const [notifications, total, unreadCount] = await Promise.all([
//       prisma.notification.findMany({
//         where,
//         orderBy: { createdAt: "desc" },
//         skip: (page - 1) * pageSize,
//         take: pageSize,
//       }),
//       prisma.notification.count({ where }),
//       prisma.notification.count({ where: { userId, read: false } }),
//     ]);

//     return res.status(200).json({ notifications, total, unreadCount, page });
//   }

//   // Internal: create notification
//   if (req.method === "POST") {
//     const secret = req.headers["x-workflow-secret"];
//     if (secret !== process.env.WORKFLOW_INTERNAL_SECRET) {
//       return res.status(403).json({ error: "Forbidden" });
//     }

//     const input = req.body as CreateNotificationInput;
//     const notification = await prisma.notification.create({
//       data: {
//         userId: input.userId,
//         type: input.type,
//         title: input.title,
//         body: input.body,
//         data: (input.data as object) || {},
//         taskId: input.taskId || null,
//         pageId: input.pageId || null,
//         meetingId: input.meetingId || null,
//         fileId: input.fileId || null,
//         callId: input.callId || null,
//         workflowId: input.workflowId || null,
//         channels: input.channels || ["in_app"],
//         actions: (input.actions as object[]) || [],
//         expiresAt: input.expiresAt || null,
//       },
//     });

//     // Push to SSE if user is connected
//     broadcastToUser(input.userId, notification as unknown as Record<string, unknown>);

//     return res.status(201).json({ notification });
//   }

//   return res.status(405).end();
// }

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { broadcastToUser } from "./stream";
import type { CreateNotificationInput } from "../../../types/notifications";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Unauthorized" });
  const userId = (session.user as { id: string }).id;

  if (req.method === "GET") {
    const page = parseInt((req.query.page as string) || "1");
    const pageSize = Math.min(parseInt((req.query.pageSize as string) || "20"), 50);
    const unreadOnly = req.query.unreadOnly === "true";

    // Base where clause with expiration check
    const where = {
      userId,
      ...(unreadOnly ? { read: false } : {}),
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };

    // FIX: unreadCount should also respect expiration to avoid full table scans
    const unreadWhere = {
      userId,
      read: false,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };

    // FIX: Use $transaction for better performance and select only needed fields
    const [notifications, total, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          read: true,
          data: true,
          taskId: true,
          pageId: true,
          meetingId: true,
          fileId: true,
          callId: true,
          // workflowId: true,
          channels: true,
          actions: true,
          expiresAt: true,
          createdAt: true,
          // Exclude unnecessary fields if your schema has large JSON/text fields
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: unreadWhere }), // Fixed: added expiration filter
    ]);

    return res.status(200).json({ notifications, total, unreadCount, page });
  }

  if (req.method === "POST") {
    const secret = req.headers["x-workflow-secret"];
    if (secret !== process.env.WORKFLOW_INTERNAL_SECRET) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const input = req.body as CreateNotificationInput;
    
    // FIX: Better type handling without forced assertions
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data ?? {},
        taskId: input.taskId ?? null,
        pageId: input.pageId ?? null,
        meetingId: input.meetingId ?? null,
        fileId: input.fileId ?? null,
        callId: input.callId ?? null,
        // workflowId: input.workflowId ?? null,
        channels: input.channels ?? ["in_app"],
        actions: input.actions ?? [],
        expiresAt: input.expiresAt ?? null,
      },
    });

    broadcastToUser(input.userId, notification as unknown as Record<string, unknown>);
    return res.status(201).json({ notification });
  }

  return res.status(405).end();
}