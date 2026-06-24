// pages/api/servers/[serverId]/share-targets.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/servers/[serverId]/share-targets
 *
 * Returns all channels and members of a server the current user belongs to,
 * so the share modal can let them forward a message.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { serverId } = req.query;

    if (!serverId || typeof serverId !== "string") {
      return res.status(400).json({ error: "Server ID required" });
    }

    // Verify requesting user is actually a member
    const requestingMember = await prisma.member.findFirst({
      where: {
        serverId,
        userId: session.user.id
      }
    });

    if (!requestingMember) {
      return res.status(403).json({ error: "Not a member of this server" });
    }

    // Fetch channels + members in parallel
    const [channels, members] = await Promise.all([
      prisma.channel.findMany({
        where: { serverId },
        select: {
          id: true,
          name: true,
          type: true
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.member.findMany({
        where: {
          serverId,
          // Exclude the requesting user from the member list
          userId: { not: session.user.id }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: "asc" }
      })
    ]);

    return res.status(200).json({
      channels,
      members: members.map((m) => ({
        id: m.id,
        role: m.role,
        user: m.user
      }))
    });
  } catch (error) {
    console.error("[SHARE_TARGETS_GET]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}