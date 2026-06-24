import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { memberId } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "DELETE") {
    try {
      const { serverId } = req.query;

      if (!serverId) {
        return res.status(400).json({ error: "Server ID Missing" });
      }

      if (!memberId) {
        return res.status(400).json({ error: "Member ID Missing" });
      }

      const server = await prisma.server.update({
        where: {
          id: serverId as string,
          userId: session.user.id
        },
        data: {
          members: {
            deleteMany: {
              id: memberId as string,
              userId: {
                not: session.user.id
              }
            }
          }
        },
        include: {
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

      return res.status(200).json(server);
    } catch (error) {
      console.error("[MEMBER_DELETE]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { serverId } = req.query;
      const { role } = req.body;

      if (!serverId) {
        return res.status(400).json({ error: "Server ID Missing" });
      }

      if (!memberId) {
        return res.status(400).json({ error: "Member ID Missing" });
      }

      const server = await prisma.server.update({
        where: {
          id: serverId as string,
          userId: session.user.id
        },
        data: {
          members: {
            update: {
              where: {
                id: memberId as string,
                userId: {
                  not: session.user.id
                }
              },
              data: { role }
            }
          }
        },
        include: {
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

      return res.status(200).json(server);
    } catch (error) {
      console.error("[MEMBER_PATCH]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}