// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { prisma } from '@/lib/prisma'
// import { authOptions } from 'lib/auth'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
  
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   const { pageId } = req.query

//   if (req.method === 'POST') {
//     const { teamMemberId, teamId } = req.body

//     try {
//       // Verify the user has access to this page
//       const page = await prisma.page.findFirst({
//         where: {
//           id: pageId as string,
//           OR: [
//             { authorId: session.user.id },
//             {
//               workspace: {
//                 memberships: {
//                   some: {
//                     userId: session.user.id,
//                    docRole: { in: ['ADMIN', 'EDITOR', 'OWNER'] },

//                   },
//                 },
//               },
//             },
//           ],
//         },
//       })

//       if (!page) {
//         return res.status(404).json({ error: 'Page not found or access denied' })
//       }

//       // If teamId is provided but not teamMemberId, assign to team
//       // If teamMemberId is provided, assign to specific member
//       const updatedPage = await prisma.page.update({
//         where: { id: pageId as string },
//         data: {
//           assignedToId: teamMemberId || null,
//           teamId: teamId || null,
//           assignedById: session.user.id,
//         },
//         include: {
//           assignedTo: {
//             include: {
//               user: {
//                 select: {
//                   name: true,
//                   image: true,
//                 },
//               },
//             },
//           },
//         },
//       })

//       res.json(updatedPage)
//     } catch (error) {
//       console.error('Error assigning page:', error)
//       res.status(500).json({ error: 'Failed to assign page' })
//     }
//   }

//   else if (req.method === 'DELETE') {
//     try {
//       const updatedPage = await prisma.page.update({
//         where: { id: pageId as string },
//         data: {
//           assignedToId: null,
//           teamId: null,
//         },
//       })

//       res.json(updatedPage)
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to unassign page' })
//     }
//   }

//   else {
//     res.status(405).json({ error: 'Method not allowed' })
//   }
// }

// // pages/api/pages/[pageId]/assign.ts  working fine without notification 
// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { prisma } from '@/lib/prisma'
// import { authOptions } from 'lib/auth'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
  
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   const { pageId } = req.query
//   const { assignType, teamId, teamMemberId } = req.body

//   if (req.method === 'POST') {
//     try {
//       const page = await prisma.page.findFirst({
//         where: {
//           id: pageId as string,
//           OR: [
//             { authorId: session.user.id },
//             { 
//               workspace: {
//                 memberships: {
//                   some: {
//                     userId: session.user.id,
//                     DocRole: { in: ['ADMIN', 'EDITOR', 'OWNER'] }
//                   }
//                 }
//               }
//             }
//           ]
//         },
//         include: {
//           workspace: {
//             include: {
//               memberships: {
//                 where: { userId: session.user.id },
//                 select: { DocRole: true }
//               }
//             }
//           }
//         }
//       })

//       if (!page) {
//         return res.status(404).json({ error: 'Page not found or access denied' })
//       }

//       let updatedPage

//       if (assignType === 'member') {
//         if (!teamMemberId) {
//           return res.status(400).json({ error: 'teamMemberId is required' })
//         }

//         const teamMember = await prisma.teamMember.findFirst({
//           where: {
//             id: teamMemberId,
//             teamId: teamId
//           },
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
//         })

//         if (!teamMember) {
//           return res.status(404).json({ error: 'Team member not found' })
//         }

//         updatedPage = await prisma.page.update({
//           where: { id: pageId as string },
//           data: {
//             assignedToId: teamMemberId,
//             assignedById: session.user.id,
//             teamId: teamId
//           },
//           include: {
//             assignedTo: {
//               include: {
//                 user: {
//                   select: {
//                     id: true,
//                     name: true,
//                     email: true,
//                     image: true
//                   }
//                 }
//               }
//             },
//             team: {
//               select: {
//                 id: true,
//                 name: true,
//                 slug: true
//               }
//             }
//           }
//         })

//         return res.json({
//           success: true,
//           assignment: {
//             type: 'member',
//             assignedTo: updatedPage.assignedTo,
//             team: updatedPage.team
//           }
//         })

//       } else if (assignType === 'team') {
//         if (!teamId) {
//           return res.status(400).json({ error: 'teamId is required' })
//         }

//         const team = await prisma.team.findUnique({
//           where: { id: teamId }
//         })

//         if (!team) {
//           return res.status(404).json({ error: 'Team not found' })
//         }

//         updatedPage = await prisma.page.update({
//           where: { id: pageId as string },
//           data: {
//             teamId: teamId,
//             assignedToId: null,
//             assignedById: session.user.id
//           },
//           include: {
//             team: {
//               select: {
//                 id: true,
//                 name: true,
//                 slug: true
//               }
//             }
//           }
//         })

//         return res.json({
//           success: true,
//           assignment: {
//             type: 'team',
//             team: updatedPage.team
//           }
//         })
//       } else {
//         return res.status(400).json({ error: 'Invalid assignType' })
//       }

//     } catch (error) {
//       console.error('Error assigning page:', error)
//       res.status(500).json({ 
//         error: 'Failed to assign page',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       })
//     }
//   } else if (req.method === 'DELETE') {
//     try {
//       const page = await prisma.page.findFirst({
//         where: {
//           id: pageId as string,
//           OR: [
//             { authorId: session.user.id },
//             { 
//               workspace: {
//                 memberships: {
//                   some: {
//                     userId: session.user.id,
//                     // FIXED: Use 'DocRole' here too
//                     DocRole: { in: ['ADMIN', 'EDITOR', 'OWNER'] }
//                   }
//                 }
//               }
//             }
//           ]
//         }
//       })

//       if (!page) {
//         return res.status(404).json({ error: 'Page not found' })
//       }

//       await prisma.page.update({
//         where: { id: pageId as string },
//         data: {
//           assignedToId: null,
//           teamId: null,
//           assignedById: null
//         }
//       })

//       res.json({ success: true, message: 'Assignment removed' })
//     } catch (error) {
//       console.error('Error unassigning page:', error)
//       res.status(500).json({ error: 'Failed to remove assignment' })
//     }
//   } else {
//     res.status(405).json({ error: 'Method not allowed' })
//   }
// }

// pages/api/pages/[pageId]/assign.ts
/**
 * POST /api/pages/:pageId/assign
 * Assigns a page to a team member and fires PAGE_ASSIGNED notification.
 *
 * Also handles new page comments → PAGE_COMMENT_ADDED notification.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "lib/auth";
import { PrismaClient } from "@prisma/client";
import {
  notifyPageAssigned,
  notifyPageCommentAdded,
} from "../../../../lib/notifications/notification.triggers";
import { broadcastToUser } from "../../notifications/stream";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { pageId } = req.query as { pageId: string };

  // ── POST: assign page ──────────────────────────────────────────────────
  if (req.method === "POST") {
    const { teamMemberId } = req.body as { teamMemberId: string };

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { workspace: true },
    });
    if (!page) return res.status(404).json({ error: "Page not found" });

    // Lookup the TeamMember → get their userId
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: teamMemberId },
      include: { user: true },
    });
    if (!teamMember) return res.status(404).json({ error: "Team member not found" });

    // Update page assignment
    await prisma.page.update({
      where: { id: pageId },
      data: {
        assignedToId: teamMemberId,
        assignedById: session.user.id,
      },
    });

    const assigner = await prisma.user.findUnique({ where: { id: session.user.id } });

    await notifyPageAssigned({
      assigneeUserId: teamMember.userId,
      assignedByName: assigner?.name ?? "Someone",
      pageId,
      pageTitle: page.title,
      workspaceId: page.workspaceId,
    });

    const notification = await prisma.notification.findFirst({
      where: { userId: teamMember.userId, pageId, type: "PAGE_ASSIGNED" },
      orderBy: { createdAt: "desc" },
    });
    if (notification) {
      broadcastToUser(teamMember.userId, { type: "notification", notification });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

/**
 * Call this from your comment creation handler.
 * Notifies page author + assignee about a new comment.
 */
export async function handlePageCommentNotification({
  pageId,
  commenterId,
  commentContent,
  prisma: db,
}: {
  pageId: string;
  commenterId: string;
  commentContent: string;
  prisma: PrismaClient;
}): Promise<void> {
  const page = await db.page.findUnique({
    where: { id: pageId },
    include: {
      workspace: true,
      assignedTo: { include: { user: true } },
    },
  });

  if (!page) return;

  const commenter = await db.user.findUnique({ where: { id: commenterId } });

  // Collect recipients: author + assignee, excluding the commenter
  const recipientIds = [
    page.authorId,
    page.assignedTo?.userId,
  ]
    .filter((id): id is string => !!id && id !== commenterId)
    .filter((v, i, a) => a.indexOf(v) === i); // deduplicate

  if (recipientIds.length === 0) return;

  await notifyPageCommentAdded({
    recipientUserIds: recipientIds,
    commenterName: commenter?.name ?? "Someone",
    pageId,
    pageTitle: page.title,
    workspaceId: page.workspaceId,
    commentPreview: commentContent,
  });

  for (const uid of recipientIds) {
    const notification = await db.notification.findFirst({
      where: { userId: uid, pageId, type: "PAGE_COMMENT_ADDED" },
      orderBy: { createdAt: "desc" },
    });
    if (notification) {
      broadcastToUser(uid, { type: "notification", notification });
    }
  }
}  