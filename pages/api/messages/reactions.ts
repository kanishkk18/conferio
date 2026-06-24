// // pages/api/messages/reactions.ts
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

//     const { messageId, emoji } = req.body;

//     if (req.method === "POST") {
//       // Check if reaction exists
//       const existing = await prisma.messageReaction.findFirst({
//         where: { messageId, memberId: session.user.id, emoji }
//       });

//       if (!existing) {
//         await prisma.messageReaction.create({
//           data: {
//             messageId,
//             memberId: session.user.id,
//             emoji
//           }
//         });
//       }
//     } else {
//       await prisma.messageReaction.deleteMany({
//         where: { messageId, memberId: session.user.id, emoji }
//       });
//     }

//     // Fetch updated message with reactions
//     const message = await prisma.message.findUnique({
//       where: { id: messageId },
//       include: {
//         reactions: true,
//         member: { include: { user: true } }
//       }
//     });

//     // Emit socket event
//     const io = (global as any).io;
//     if (io) {
//       io.to(`channel:${message?.channelId}`).emit('message_reaction', message);
//     }

//     return res.status(200).json(message);
//   } catch (error) {
//     console.error("[REACTIONS]", error);
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

//     const { messageId, emoji, serverId } = req.body;

//     // Get the Member record (not User ID) - THIS WAS THE BUG
//     const member = await prisma.member.findFirst({
//       where: {
//         userId: session.user.id,
//         serverId: serverId, // Need to pass serverId from frontend
//       }
//     });

//     if (!member) {
//       return res.status(403).json({ error: "Not a member of this server" });
//     }

//     if (req.method === "POST") {
//       // Check if reaction exists
//       const existing = await prisma.messageReaction.findFirst({
//         where: { 
//           messageId, 
//           memberId: member.id,  // Use member.id not session.user.id
//           emoji 
//         }
//       });

//       if (!existing) {
//         await prisma.messageReaction.create({
//           data: {
//             messageId,
//             memberId: member.id,  // Use member.id
//             emoji
//           }
//         });
//       }
//     } else {
//       await prisma.messageReaction.deleteMany({
//         where: { 
//           messageId, 
//           memberId: member.id,  // Use member.id
//           emoji 
//         }
//       });
//     }

//     // Fetch updated message with reactions
//     const message = await prisma.message.findUnique({
//       where: { id: messageId },
//       include: {
//         reactions: {
//           include: {
//             member: {
//               include: { user: true }
//             }
//           }
//         },
//         member: { include: { user: true } }
//       }
//     });

//     // Emit socket event
//     const io = (global as any).io;
//     if (io && message?.channelId) {
//       io.to(`channel:${message.channelId}`).emit('message_reaction', message);
//     }

//     return res.status(200).json(message);
//   } catch (error) {
//     console.error("[REACTIONS]", error);
//     return res.status(500).json({ error: "Internal Error" });
//   }
// }

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { messageId, emoji, serverId } = req.body;

    if (!messageId || !emoji || !serverId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get member
    const member = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        serverId: serverId,
      }
    });

    if (!member) {
      return res.status(403).json({ error: "Not a member of this server" });
    }

    // Get message to find channel
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (req.method === "POST") {
      // Toggle reaction - delete if exists, create if not
      const existing = await prisma.messageReaction.findFirst({
        where: { 
          messageId, 
          memberId: member.id,
          emoji 
        }
      });

      if (existing) {
        // Remove reaction (toggle off)
        await prisma.messageReaction.delete({
          where: { id: existing.id }
        });
      } else {
        // Add reaction
        await prisma.messageReaction.create({
          data: {
            messageId,
            memberId: member.id,
            emoji
          }
        });
      }
    } else {
      // DELETE method - remove specific reaction
      await prisma.messageReaction.deleteMany({
        where: { 
          messageId, 
          memberId: member.id,
          emoji 
        }
      });
    }

    // Fetch updated reactions with member info
    const updatedReactions = await prisma.messageReaction.findMany({
      where: { messageId },
      include: {
        member: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    // EMIT SOCKET EVENT
    const io = (global as any).io;
    if (io && message.channelId) {
      io.to(`channel:${message.channelId}`).emit('message_reaction', {
        messageId: messageId,
        reactions: updatedReactions
      });
      console.log('[SOCKET] Emitted reaction update to channel:', message.channelId);
    }

    return res.status(200).json({ 
      messageId,
      reactions: updatedReactions,
      userReacted: updatedReactions.some(r => r.memberId === member.id)
    });

  } catch (error) {
    console.error("[REACTIONS]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}