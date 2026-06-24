import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { slug } = req.query;

  if (req.method === "POST") {
    try {
      const { memberOneId, memberTwoId } = req.body;

      if (!memberOneId || !memberTwoId) {
        return res.status(400).json({ error: "Both member IDs required" });
      }

      // Verify both members belong to the team
      const team = await prisma.team.findUnique({
        where: { slug: slug as string },
        include: {
          members: {
            where: {
              id: { in: [memberOneId, memberTwoId] }
            }
          }
        }
      });

      if (!team || team.members.length !== 2) {
        return res.status(404).json({ error: "Team or members not found" });
      }

      // Check if conversation already exists
      let conversation = await prisma.teamConversation.findFirst({
        where: {
          OR: [
            { participantOneId: memberOneId, participantTwoId: memberTwoId },
            { participantOneId: memberTwoId, participantTwoId: memberOneId }
          ]
        }
      });

      // Create if doesn't exist
      if (!conversation) {
        conversation = await prisma.teamConversation.create({
          data: {
            teamId: team.id,
            participantOneId: memberOneId,
            participantTwoId: memberTwoId
          }
        });
      }

      return res.status(200).json(conversation);
    } catch (error) {
      console.error("[CONVERSATION_POST]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  if (req.method === "GET") {
    try {
      // Get all conversations for current user in this team
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          team: { slug: slug as string },
          userId: session.user.id
        }
      });

      if (!teamMember) {
        return res.status(404).json({ error: "Not a team member" });
      }

      const conversations = await prisma.teamConversation.findMany({
        where: {
          OR: [
            { participantOneId: teamMember.id },
            { participantTwoId: teamMember.id }
          ]
        },
        include: {
          participantOne: {
            include: { user: true }
          },
          participantTwo: {
            include: { user: true }
          },
          directMessages: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      });

      return res.status(200).json(conversations);
    } catch (error) {
      console.error("[CONVERSATIONS_GET]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}