import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { serverId } = req.query;
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!serverId) {
      return res.status(400).json({ error: "Server ID Missing" });
    }

    const server = await prisma.server.update({
      where: {
        id: serverId as string,
        userId: { not: session.user.id },
        members: { some: { userId: session.user.id } }
      },
      data: { 
        members: { 
          deleteMany: { 
            userId: session.user.id 
          } 
        } 
      }
    });

    return res.status(200).json(server);
  } catch (error) {
    console.error("[SERVER_LEAVE_PATCH]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}