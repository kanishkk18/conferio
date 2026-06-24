
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// pages/api/calls/initiate.ts - Start a call in channel
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { channelId, serverId } = req.body;

    // Create call record
    const call = await prisma.call.create({
      data: {
        callerId: session.user.id,
        status: "ONGOING",
        type: "VIDEO",
        roomName: `channel-${channelId}-${Date.now()}`,
        isGroupCall: true
      }
    });

    // Create channel meeting record
    await prisma.channelMeeting.create({
      data: {
        channelId,
        startedBy: session.user.id,
        roomName: call.roomName,
        status: "active"
      }
    });

    // Notify all channel members via socket
    const io = (global as any).io;
    if (io) {
      io.to(`channel:${channelId}`).emit('call_started', {
        call,
        channelId,
        startedBy: session.user.id
      });
    }

    return res.status(200).json(call);
  } catch (error) {
    return res.status(500).json({ error: "Internal Error" });
  }
}