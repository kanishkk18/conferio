

// import { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";

// const MESSAGES_BATCH = 50;

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "GET") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const session = await getServerSession(req, res, authOptions);
//     const { cursor, channelId } = req.query;

//     if (!session?.user?.id) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     if (!channelId) {
//       return res.status(400).json({ error: "Channel ID Missing" });
//     }

//     // Check if user is member of this channel's server
//     const channel = await prisma.channel.findUnique({
//       where: { id: channelId as string },
//       include: { server: true }
//     });

//     if (!channel) {
//       return res.status(404).json({ error: "Channel not found" });
//     }

//     const member = await prisma.member.findFirst({
//       where: {
//         serverId: channel.serverId,
//         userId: session.user.id
//       }
//     });

//     if (!member) {
//       return res.status(403).json({ error: "Not a member" });
//     }

//     // Fetch messages WITH all relations
//     const messages = await prisma.message.findMany({
//       take: MESSAGES_BATCH,
//       skip: cursor ? 1 : 0,
//       cursor: cursor ? { id: cursor as string } : undefined,
//       where: {
//         channelId: channelId as string,
//         deleted: false
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
//         reactions: {
//           include: {
//             member: {
//               include: {
//                 user: {
//                   select: {
//                     id: true,
//                     name: true,
//                     image: true
//                   }
//                 }
//               }
//             }
//           }
//         },
//         bookmarks: {
//           where: {
//             userId: session.user.id  // Only current user's bookmarks
//           }
//         },
//         threadParent: true  // Include thread info
//       },
//       orderBy: {
//         createdAt: 'asc'  // Oldest first for proper display
//       }
//     });

//     // Get next cursor for pagination
//     const nextCursor = messages.length === MESSAGES_BATCH 
//       ? messages[messages.length - 1].id 
//       : null;

//     return res.status(200).json({ 
//       items: messages,
//       nextCursor 
//     });

//   } catch (error) {
//     console.error("[MESSAGES_GET]", error);
//     return res.status(500).json({ error: "Internal Error" });
//   }
// }

// pages/api/messages/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MESSAGES_BATCH = 50;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ─── GET messages ──────────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const { cursor, channelId } = req.query;

      if (!channelId) {
        return res.status(400).json({ error: "Channel ID Missing" });
      }

      const channel = await prisma.channel.findUnique({
        where: { id: channelId as string },
        include: { server: true }
      });

      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }

      // ✅ FIX: Use server membership — not channel-level membership.
      // When admin adds a user to a channel via invite link or direct add,
      // the Member record ties to the SERVER, not individual channels.
      const member = await prisma.member.findFirst({
        where: {
          serverId: channel.serverId,
          userId: session.user.id
        }
      });

      if (!member) {
        return res.status(403).json({ error: "Not a member" });
      }

      const messages = await prisma.message.findMany({
        take: MESSAGES_BATCH,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor as string } : undefined,
        where: {
          channelId: channelId as string,
          deleted: false
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
          reactions: {
            include: {
              member: {
                include: {
                  user: {
                    select: { id: true, name: true, image: true }
                  }
                }
              }
            }
          },
          bookmarks: {
            where: { userId: session.user.id }
          },
          threadParent: true,
           parent: {
      include: {
        member: {
          include: {
            user: { select: { id: true, name: true, image: true } }
          }
        }
      }
    },
        },
        orderBy: { createdAt: "asc" }
      });

      const nextCursor =
        messages.length === MESSAGES_BATCH
          ? messages[messages.length - 1].id
          : null;

      return res.status(200).json({ items: messages, nextCursor });
    } catch (error) {
      console.error("[MESSAGES_GET]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  // ─── POST send message ─────────────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const { channelId, content, fileUrl } = req.body;

      if (!channelId) {
        return res.status(400).json({ error: "Channel ID required" });
      }
      if (!content?.trim() && !fileUrl) {
        return res.status(400).json({ error: "Content or file required" });
      }

      const channel = await prisma.channel.findUnique({
        where: { id: channelId as string }
      });

      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }

      // ✅ FIX: same server-level membership check as GET
      const member = await prisma.member.findFirst({
        where: {
          serverId: channel.serverId,
          userId: session.user.id
        }
      });

      if (!member) {
        return res.status(403).json({ error: "Not a member" });
      }

      const message = await prisma.message.create({
        data: {
          content: content?.trim() ?? "",
          fileUrl: fileUrl ?? null,
          channelId,
          memberId: member.id
        },
        include: {
          member: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true }
              }
            }
          },
          reactions: {
            include: {
              member: {
                include: {
                  user: {
                    select: { id: true, name: true, image: true }
                  }
                }
              }
            }
          },
          bookmarks: {
            where: { userId: session.user.id }
          },
          threadParent: true
        }
      });

      // ✅ Return the real persisted message so the frontend can replace
      // any optimistic entry with the canonical DB record (same shape).
      return res.status(201).json(message);
    } catch (error) {
      console.error("[MESSAGES_POST]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}