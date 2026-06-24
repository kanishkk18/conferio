// import { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import { Server as ServerIO } from "socket.io";
// import { Server as NetServer } from "http";

// // Extend NextApiResponse to include socket server
// interface NextApiResponseWithSocket extends NextApiResponse {
//   socket: {
//     server: NetServer & {
//       io?: ServerIO;
//     };
//   };
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponseWithSocket
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const session = await getServerSession(req, res, authOptions);
//     const { slug } = req.query;
//     const { content, fileUrl, conversationId } = req.body;

//     if (!session?.user?.id) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     if (!content || !conversationId) {
//       return res.status(400).json({ error: "Content and conversation ID required" });
//     }

//     // Get current user's team member record
//     const currentTeamMember = await prisma.teamMember.findFirst({
//       where: {
//         team: { slug: slug as string },
//         userId: session.user.id
//       }
//     });

//     if (!currentTeamMember) {
//       return res.status(403).json({ error: "Not a team member" });
//     }

//     // Verify user is part of this conversation
//     const conversation = await prisma.teamConversation.findFirst({
//       where: {
//         id: conversationId,
//         OR: [
//           { participantOneId: currentTeamMember.id },
//           { participantTwoId: currentTeamMember.id }
//         ]
//       }
//     });

//     if (!conversation) {
//       return res.status(404).json({ error: "Conversation not found" });
//     }

//     // Create message
//     const message = await prisma.teamDirectMessage.create({
//       data: {
//         content,
//         fileUrl: fileUrl || null,
//         conversationId,
//         senderId: currentTeamMember.id
//       },
//       include: {
//         sender: {
//           include: { user: true }
//         }
//       }
//     });

//     // Emit socket event for real-time updates
//     const io = res.socket.server.io;
//     if (io) {
//       io.to(`conversation:${conversationId}`).emit('new_message', message);
//       console.log(`[SOCKET] Emitted new_message to conversation:${conversationId}`);
//     } else {
//       console.log('[SOCKET] Socket.io not initialized');
//     }

//     return res.status(200).json(message);
//   } catch (error) {
//     console.error("[TEAM_MESSAGE_CREATE]", error);
//     return res.status(500).json({ error: "Internal Error" });
//   }
// }

// import { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import { Server as ServerIO } from "socket.io";
// import { Server as NetServer } from "http";

// interface NextApiResponseWithSocket extends NextApiResponse {
//   socket: {
//     server: NetServer & {
//       io?: ServerIO;
//     };
//   };
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponseWithSocket
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const session = await getServerSession(req, res, authOptions);
//     const { slug } = req.query;
//     const { content, fileUrl, conversationId } = req.body;

//     if (!session?.user?.id) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     if (!content || !conversationId) {
//       return res.status(400).json({ error: "Content and conversation ID required" });
//     }

//     const currentTeamMember = await prisma.teamMember.findFirst({
//       where: {
//         team: { slug: slug as string },
//         userId: session.user.id
//       }
//     });

//     if (!currentTeamMember) {
//       return res.status(403).json({ error: "Not a team member" });
//     }

//     const conversation = await prisma.teamConversation.findFirst({
//       where: {
//         id: conversationId,
//         OR: [
//           { participantOneId: currentTeamMember.id },
//           { participantTwoId: currentTeamMember.id }
//         ]
//       }
//     });

//     if (!conversation) {
//       return res.status(404).json({ error: "Conversation not found" });
//     }

//     const message = await prisma.teamDirectMessage.create({
//       data: {
//         content,
//         fileUrl: fileUrl || null,
//         conversationId,
//         senderId: currentTeamMember.id
//       },
//       include: {
//         sender: {
//           include: { user: true }
//         }
//       }
//     });

//     // Emit to ALL sockets in the room including sender
//     const io = res.socket.server.io;
//     if (io) {
//       io.in(`conversation:${conversationId}`).emit('new_message', message);
//       console.log(`[SOCKET] Emitted new_message to conversation:${conversationId}`);
//     }

//     return res.status(200).json(message);
//   } catch (error) {
//     console.error("[TEAM_MESSAGE_CREATE]", error);
//     return res.status(500).json({ error: "Internal Error" });
//   }
// }



// pages/api/teams/[slug]/messages/create.ts
// FIX: allow content-only OR fileUrl-only messages; accept parentId for replies

// import { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import { Server as ServerIO } from "socket.io";
// import { Server as NetServer } from "http";

// interface NextApiResponseWithSocket extends NextApiResponse {
//   socket: {
//     server: NetServer & { io?: ServerIO };
//   };
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponseWithSocket
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const session = await getServerSession(req, res, authOptions);
//     const { slug } = req.query as { slug: string };
//     const { content, fileUrl, conversationId, parentId } = req.body;

//     if (!session?.user?.id) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     // FIX: allow message with EITHER content or fileUrl (or both)
//     if ((!content?.trim() && !fileUrl) || !conversationId) {
//       return res.status(400).json({ error: "Content or file required, and conversationId is required" });
//     }

//     const currentTeamMember = await prisma.teamMember.findFirst({
//       where: { team: { slug }, userId: session.user.id }
//     });

//     if (!currentTeamMember) {
//       return res.status(403).json({ error: "Not a team member" });
//     }

//     const conversation = await prisma.teamConversation.findFirst({
//       where: {
//         id: conversationId,
//         OR: [
//           { participantOneId: currentTeamMember.id },
//           { participantTwoId: currentTeamMember.id }
//         ]
//       }
//     });

//     if (!conversation) {
//       return res.status(404).json({ error: "Conversation not found" });
//     }

//     // Validate parentId belongs to this conversation
//     if (parentId) {
//       const parentMsg = await prisma.teamDirectMessage.findFirst({
//         where: { id: parentId, conversationId }
//       });
//       if (!parentMsg) {
//         return res.status(400).json({ error: "Parent message not found in this conversation" });
//       }
//     }

//     const message = await prisma.teamDirectMessage.create({
//       data: {
//         content: content?.trim() || '',
//         fileUrl: fileUrl || null,
//         conversationId,
//         senderId: currentTeamMember.id,
//         ...(parentId ? { parentId } : {}),
//       },
//       include: {
//         sender: { include: { user: true } },
//         reactions: true,
//         bookmarks: true,
//         // Include parent message so the UI can render reply context immediately
//         parent: {
//           include: {
//             sender: { include: { user: true } }
//           }
//         }
//       }
//     });

//     const io = res.socket.server.io;
//     if (io) {
//       io.in(`conversation:${conversationId}`).emit('new_message', message);
//     }

//     return res.status(200).json(message);
//   } catch (error) {
//     console.error("[TEAM_MESSAGE_CREATE]", error);
//     return res.status(500).json({ error: "Internal Error" });
//   }
// }

// pages/api/teams/[slug]/messages/create.ts
// Returns parent relation so reply context renders immediately without a refetch

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: { server: NetServer & { io?: ServerIO } };
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb', // handles base64 overhead for 10MB files
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const { slug } = req.query as { slug: string };
    const { content, fileUrl, conversationId, parentId } = req.body;

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Allow message with text OR file (or both)
    if ((!content?.trim() && !fileUrl) || !conversationId) {
      return res.status(400).json({
        error: "Content or file required, and conversationId is required"
      });
    }

    const currentTeamMember = await prisma.teamMember.findFirst({
      where: { team: { slug }, userId: session.user.id }
    });

    if (!currentTeamMember) {
      return res.status(403).json({ error: "Not a team member" });
    }

    const conversation = await prisma.teamConversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participantOneId: currentTeamMember.id },
          { participantTwoId: currentTeamMember.id }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Validate parentId belongs to same conversation
    if (parentId) {
      const parentMsg = await prisma.teamDirectMessage.findFirst({
        where: { id: parentId, conversationId }
      });
      if (!parentMsg) {
        return res.status(400).json({ error: "Parent message not in this conversation" });
      }
    }

    const message = await prisma.teamDirectMessage.create({
      data: {
        content: content?.trim() || '',
        fileUrl: fileUrl || null,
        conversationId,
        senderId: currentTeamMember.id,
        ...(parentId ? { parentId } : {}),
      },
      include: {
        sender: { include: { user: true } },
        // ── Return same shape as GET so optimistic → real replace works ──
        reactions: {
          include: {
            user: { select: { id: true, name: true, image: true } }
          }
        },
        bookmarks: {
          where: { userId: session.user.id }
        },
        parent: {
          include: {
            sender: { include: { user: true } }
          }
        }
      }
    });

    const io = res.socket.server.io;
    if (io) {
      io.in(`conversation:${conversationId}`).emit('new_message', message);
    }

    return res.status(200).json(message);
  } catch (error) {
    console.error("[TEAM_MESSAGE_CREATE]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}