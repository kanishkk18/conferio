// import { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

//   try {
//     const session = await getServerSession(req, res, authOptions);
//     if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

//     const { teamSlug } = req.query;
//     if (!teamSlug || typeof teamSlug !== "string") {
//       return res.status(400).json({ error: "Team slug required" });
//     }

//     const team = await prisma.team.findUnique({ where: { slug: teamSlug } });
//     if (!team) return res.status(404).json({ error: "Team not found" });

//     const requestingMember = await prisma.teamMember.findFirst({
//       where: { teamId: team.id, userId: session.user.id },
//     });
//     if (!requestingMember) return res.status(403).json({ error: "Not a member of this team" });

//     const [channels, members] = await Promise.all([
//       prisma.channel.findMany({
//         where: {
//           teamId: team.id,
//           OR: [
//             { visibility: "TEAM" },
//             { members: { some: { teamMemberId: requestingMember.id } } },
//           ],
//         },
//         select: { id: true, name: true, type: true },
//         orderBy: { createdAt: "asc" },
//       }),
//       prisma.teamMember.findMany({
//         where: { teamId: team.id, userId: { not: session.user.id } },
//         include: {
//           user: { select: { id: true, name: true, image: true, email: true } },
//         },
//         orderBy: { createdAt: "asc" },
//       }),
//     ]);

//     return res.status(200).json({
//       channels,
//       members: members.map((m) => ({ id: m.id, role: m.role, user: m.user, userId: m.userId })),
//     });
//   } catch (error) {
//     console.error("[SHARE_TARGETS_GET]", error);
//     return res.status(500).json({ error: "Internal Error" });
//   }
// }

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { teamSlug } = req.query;  // ← matches [teamSlug] in filename
    if (!teamSlug || typeof teamSlug !== "string") {
      return res.status(400).json({ error: "Team identifier required" });
    }

    // Accept either slug or ID (so both URLs work)
    const team = await prisma.team.findFirst({
      where: {
        OR: [{ slug: teamSlug }, { id: teamSlug }]
      }
    });
    if (!team) return res.status(404).json({ error: "Team not found" });

    const requestingMember = await prisma.teamMember.findFirst({
      where: { teamId: team.id, userId: session.user.id },
    });
    if (!requestingMember) return res.status(403).json({ error: "Not a member of this team" });

    const [channels, members] = await Promise.all([
      prisma.channel.findMany({
        where: {
          teamId: team.id,
          OR: [
            { visibility: "TEAM" },
            { members: { some: { teamMemberId: requestingMember.id } } },
          ],
        },
        select: { id: true, name: true, type: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.teamMember.findMany({
        where: { teamId: team.id, userId: { not: session.user.id } },
        include: {
          user: { select: { id: true, name: true, image: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return res.status(200).json({
      channels,
      members: members.map((m) => ({ id: m.id, role: m.role, user: m.user, userId: m.userId })),
    });
  } catch (error) {
    console.error("[SHARE_TARGETS_GET]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}