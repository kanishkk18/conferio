import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { useSession } from "next-auth/react";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { serverId } = req.query;
    const session = await getServerSession(req, res, authOptions);

    
    if (!serverId) {
      return res.status(400).json({ error: "Server ID Missing" });
    }

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const server = await prisma.server.findUnique({
      where: {
        id: serverId as string
      },
      include: {
        channels: {
          orderBy: {
            createdAt: "asc"
          }
        },
        members: {
          include: {
            user: true
          },
          orderBy: {
            role: "asc"
          }
        }
      }
    });

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    const role = server.members.find(
      (member) => member.userId === session.user.id
    )?.role;

    return res.status(200).json({ server, role });
  } catch (error) {
    console.error("[SERVER_DATA_GET]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}