import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const { slug } = req.query;

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        team: { slug: slug as string },
        userId: session.user.id
      },
      include: {
        user: true,
        team: true
      }
    });

    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }

    return res.status(200).json(teamMember);
  } catch (error) {
    console.error("[TEAM_MEMBER_ME_GET]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}