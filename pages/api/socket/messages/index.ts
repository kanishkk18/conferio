// import { NextApiRequest } from "next";

// import { NextApiResponseServerIo } from "types";
// import { currentProfilePages } from "@/lib/current-profile-pages";
// import { prisma } from "@/lib/prisma";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponseServerIo
// ) {
//   if (req.method !== "POST")
//     return res.status(405).json({ error: "Method not allowed" });

//   try {
//     const user = await currentProfilePages(req, res);
//     const { content, fileUrl } = req.body;
//     const { serverId, channelId } = req.query;

//     if (!user) return res.status(401).json({ error: "Unauthorized" });

//     if (!serverId)
//       return res.status(400).json({ error: "Server ID Missing" });

//     if (!channelId)
//       return res.status(400).json({ error: "Channel ID Missing" });

//     if (!content)
//       return res.status(400).json({ error: "Content Missing" });

//     const server = await prisma.server.findFirst({
//       where: {
//         id: serverId as string,
//         members: {
//           some: {
//             userId: user.id
//           }
//         }
//       },
//       include: {
//         members: true
//       }
//     });

//     if (!server)
//       return res.status(404).json({ message: "Server not found" });

//     const channel = await prisma.channel.findFirst({
//       where: {
//         id: channelId as string,
//         serverId: serverId as string
//       }
//     });

//     if (!channel)
//       return res.status(404).json({ message: "Channel not found" });

//     const member = server.members.find(
//       (member) => member.userId === user.id
//     );

//     if (!member)
//       return res.status(404).json({ message: "Member not found" });

//     const message = await prisma.message.create({
//       data: {
//         content,
//         fileUrl,
//         channelId: channelId as string,
//         memberId: member.id
//       },
//       include: {
//         member: {
//           include: {
//             user: true
//           }
//         }
//       }
//     });

//     const channelKey = `chat:${channelId}:messages`;

//     res?.socket?.server?.io?.emit(channelKey, message);

//     return res.status(200).json(message);
//   } catch (error) {
//     console.error("[MESSAGES_POST]", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const session = await getServerSession(req, res, authOptions);
    
//     if (!session?.user?.id) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const { content, channelId, serverId, parentId } = req.body;

//     if (!content || !channelId || !serverId) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Find the Member record
//     const member = await prisma.member.findFirst({
//       where: {
//         userId: session.user.id,
//         serverId: serverId,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true
//           }
//         }
//       }
//     });

//     if (!member) {
//       return res.status(403).json({ error: 'Not a member of this server' });
//     }

//     // Create message
//     const message = await prisma.message.create({
//       data: {
//         content,
//         channelId,
//         memberId: member.id,
//       },
//       include: {
//         member: {
//           include: {
//             user: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 image: true
//               }
//             }
//           }
//         },
//         reactions: true,
//         bookmarks: true,
//         threadParent: true
//       }
//     });

//     // Handle thread/reply logic
//     if (parentId) {
//       const existingThread = await prisma.messageThread.findUnique({
//         where: { messageId: parentId }
//       });

//       if (existingThread) {
//         await prisma.messageThread.update({
//           where: { id: existingThread.id },
//           data: {
//             replyCount: { increment: 1 },
//             lastReplyAt: new Date()
//           }
//         });
//       } else {
//         await prisma.messageThread.create({
//           data: {
//             messageId: parentId,
//             replyCount: 1,
//             lastReplyAt: new Date()
//           }
//         });
//       }
//     }

//     // EMIT SOCKET EVENT - THIS IS CRITICAL
//     const io = (global as any).io;
//     if (io) {
//       // Emit to all clients in this channel
//       io.to(`channel:${channelId}`).emit('new_message', message);
      
//       // Also emit to thread if it's a reply
//       if (parentId) {
//         io.to(`thread:${parentId}`).emit('thread_reply', {
//           reply: message,
//           parentId: parentId
//         });
//       }
      
//       console.log('[SOCKET] Emitted new_message to channel:', channelId);
//     } else {
//       console.error('[SOCKET] IO not available');
//     }

//     return res.status(200).json(message);
//   } catch (error) {
//     console.error('[SOCKET_MESSAGES_POST]', error);
//     return res.status(500).json({ error: 'Internal error' });
//   }
// }

// import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';
// import { getIO } from '@/lib/socket-store';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const session = await getServerSession(req, res, authOptions);
    
//     if (!session?.user?.id) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const { content, channelId, serverId, parentId } = req.body;

//     if (!content || !channelId || !serverId) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const member = await prisma.member.findFirst({
//       where: {
//         userId: session.user.id,
//         serverId: serverId,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true
//           }
//         }
//       }
//     });

//     if (!member) {
//       return res.status(403).json({ error: 'Not a member of this server' });
//     }

//     const message = await prisma.message.create({
//   data: {
//     content,
//     channelId,
//     memberId: member.id,
//     // REMOVE: parentId - not in schema
//   },
//   include: {
//     member: {
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true
//           }
//         }
//       }
//     },
//     reactions: true,
//     bookmarks: true
//   }
// });

// if (parentId) {
//   // Find or create thread
//   const thread = await prisma.messageThread.upsert({
//     where: { messageId: parentId },
//     create: {
//       messageId: parentId,
//       replyCount: 1,
//       lastReplyAt: new Date()
//     },
//     update: {
//       replyCount: { increment: 1 },
//       lastReplyAt: new Date()
//     }
//   });

//   // Create the reply in ThreadReply table
//   await prisma.threadReply.create({
//     data: {
//       threadId: thread.id,
//       content,
//       memberId: member.id,
//     }
//   });

//     // EMIT TO ALL CLIENTS IN CHANNEL
//     const io = getIO();
//     if (io) {
//       io.to(`channel:${channelId}`).emit('new_message', message);
//       console.log('[SOCKET] Emitted to channel:', channelId);
//     } else {
//       console.error('[SOCKET] IO not available - message saved but not broadcast');
//     }
//   }
//     return res.status(200).json(message);
//   } catch (error) {
//     console.error('[SOCKET_MESSAGES_POST]', error);
//     return res.status(500).json({ error: 'Internal error' });
//   }
// }

// /pages/api/socket/messages/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getIO } from '@/lib/socket-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { content, channelId, serverId, parentId, fileUrl, tempId } = req.body;

    if ((!content && !fileUrl) || !channelId || !serverId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const member = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        serverId: serverId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        channelId,
        fileUrl: fileUrl ?? null,
        memberId: member.id,
        parentId: parentId || null, // Will work after migration
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        reactions: true,
        bookmarks: true,
        parent: {
      include: {
        member: {
          include: {
            user: { select: { id: true, name: true, image: true } }
          }
        }
      }
    },
      }
    });

    // Emit socket event
    const messageWithOptimisticId = {
  ...message,
  optimisticId: tempId ?? null,  // ← THIS is the dedup key
};

const io = getIO();
if (io) {
  io.to(`channel:${channelId}`).emit('new_message', messageWithOptimisticId);
  if (parentId) {
        io.to(`thread:${parentId}`).emit('thread_reply', message);
      }
}
 
return res.status(200).json(messageWithOptimisticId);
  } catch (error) {
    console.error('[SOCKET_MESSAGES_POST]', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}

