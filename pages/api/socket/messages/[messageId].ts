import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CAN_MODERATE = ["ADMIN", "OWNER", "MANAGER"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "DELETE" && req.method !== "PATCH")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { content } = req.body;
    const { teamId, channelId, messageId } = req.query;

    if (!teamId) return res.status(400).json({ error: "Team ID Missing" });
    if (!channelId) return res.status(400).json({ error: "Channel ID Missing" });

    const member = await prisma.teamMember.findFirst({
      where: { teamId: teamId as string, userId: session.user.id },
    });
    if (!member) return res.status(404).json({ error: "Member not found" });

    const channel = await prisma.channel.findFirst({
      where: { id: channelId as string, teamId: teamId as string },
    });
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    let message = await prisma.message.findFirst({
      where: { id: messageId as string, channelId: channelId as string },
      include: { sender: { include: { user: true } } },
    });

    if (!message || message.deleted)
      return res.status(404).json({ error: "Message not found" });

    const isMessageOwner = message.senderId === member.id;
    const canModerate = CAN_MODERATE.includes(member.role);
    const canModify = isMessageOwner || canModerate;

    if (!canModify) return res.status(401).json({ error: "Unauthorized" });

    if (req.method === "DELETE") {
      message = await prisma.message.update({
        where: { id: messageId as string },
        data: { fileUrl: null, content: "This message has been deleted.", deleted: true },
        include: { sender: { include: { user: true } } },
      });
    }

    if (req.method === "PATCH") {
      if (!isMessageOwner) return res.status(401).json({ error: "Unauthorized" });

      message = await prisma.message.update({
        where: { id: messageId as string },
        data: { content },
        include: { sender: { include: { user: true } } },
      });
    }

    const updateKey = `chat:${channelId}:messages:update`;
    res?.socket?.server?.io?.emit(updateKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.error("[MESSAGES_ID]", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}