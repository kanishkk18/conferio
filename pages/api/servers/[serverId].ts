import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { serverId } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "PATCH") {
    try {
      const { name, imageUrl } = req.body;

      const server = await prisma.server.update({
        where: { 
          id: serverId as string, 
          userId: session.user.id 
        },
        data: { name, imageUrl }
      });

      return res.status(200).json(server);
    } catch (error) {
      console.error("[SERVER_PATCH]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const server = await prisma.server.delete({
        where: { 
          id: serverId as string, 
          userId: session.user.id 
        }
      });

      return res.status(200).json(server);
    } catch (error) {
      console.error("[SERVER_DELETE]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}