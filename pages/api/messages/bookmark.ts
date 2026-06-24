// // pages/api/messages/bookmark.ts
// import { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

//   try {
//     const session = await getServerSession(req, res, authOptions);
//     if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

//     const { messageId, note } = req.body;

//     const bookmark = await prisma.messageBookmark.create({
//       data: {
//         messageId,
//         userId: session.user.id,
//         note
//       }
//     });

//     return res.status(200).json(bookmark);
//   } catch (error) {
//     return res.status(500).json({ error: "Internal Error" });
//   }
// }

// import { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST" && req.method !== "DELETE") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const session = await getServerSession(req, res, authOptions);
//     if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

//     const { messageId, note } = req.body;

//     if (!messageId) {
//       return res.status(400).json({ error: "Missing messageId" });
//     }

//     if (req.method === "POST") {
//       // Check if already bookmarked
//       const existing = await prisma.messageBookmark.findUnique({
//         where: {
//           messageId_userId: {
//             messageId,
//             userId: session.user.id
//           }
//         }
//       });

//       if (existing) {
//         // Update note if provided
//         if (note !== undefined) {
//           const updated = await prisma.messageBookmark.update({
//             where: { id: existing.id },
//             data: { note }
//           });
//           return res.status(200).json({ bookmarked: true, bookmark: updated });
//         }
//         return res.status(200).json({ bookmarked: true, bookmark: existing });
//       }

//       // Create new bookmark
//       const bookmark = await prisma.messageBookmark.create({
//         data: {
//           messageId,
//           userId: session.user.id,
//           note
//         }
//       });

//       return res.status(200).json({ bookmarked: true, bookmark });
//     } 
//     else {
//       // DELETE - Remove bookmark
//       await prisma.messageBookmark.deleteMany({
//         where: {
//           messageId,
//           userId: session.user.id
//         }
//       });

//       return res.status(200).json({ bookmarked: false });
//     }
//   } catch (error) {
//     console.error("[BOOKMARK]", error);
//     return res.status(500).json({ error: "Internal Error" });
//   }
// }

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "DELETE" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

    // GET - check if message is bookmarked
    if (req.method === "GET") {
      const { messageId } = req.query;
      
      const bookmark = await prisma.messageBookmark.findUnique({
        where: {
          messageId_userId: {
            messageId: messageId as string,
            userId: session.user.id
          }
        }
      });

      return res.status(200).json({ bookmarked: !!bookmark });
    }

    // POST/DELETE - toggle bookmark
    const { messageId, note } = req.body;

    if (!messageId) {
      return res.status(400).json({ error: "Missing messageId" });
    }

    // Check if already bookmarked
    const existing = await prisma.messageBookmark.findUnique({
      where: {
        messageId_userId: {
          messageId: messageId,
          userId: session.user.id
        }
      }
    });

    let result;
    let isBookmarked;

    if (req.method === "POST") {
      if (existing) {
        // Update note if provided
        if (note !== undefined) {
          result = await prisma.messageBookmark.update({
            where: { id: existing.id },
            data: { note }
          });
        } else {
          result = existing;
        }
        isBookmarked = true;
      } else {
        // Create new bookmark
        result = await prisma.messageBookmark.create({
          data: {
            messageId,
            userId: session.user.id,
            note: note || null
          }
        });
        isBookmarked = true;
      }
    } else {
      // DELETE
      if (existing) {
        await prisma.messageBookmark.delete({
          where: { id: existing.id }
        });
      }
      isBookmarked = false;
    }

    // Get message for channel info
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { channelId: true }
    });

    // EMIT SOCKET EVENT for real-time bookmark updates
    const io = (global as any).io;
    if (io && message?.channelId) {
      io.to(`channel:${message.channelId}`).emit('message_bookmark', {
        messageId,
        userId: session.user.id,
        bookmarked: isBookmarked
      });
    }

    return res.status(200).json({ 
      bookmarked: isBookmarked,
      bookmark: result 
    });

  } catch (error) {
    console.error("[BOOKMARK]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}