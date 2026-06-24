// // pages/api/team/[teamSlug]/rooms.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";

// function slugify(name: string): string {
//   return name
//     .toLowerCase()
//     .trim()
//     .replace(/[^\w\s-]/g, "")
//     .replace(/[\s_-]+/g, "-")
//     .replace(/^-+|-+$/g, "");
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const { teamSlug } = req.query as { teamSlug: string };

//   // Verify team exists and user is a member
//   const team = await prisma.team.findUnique({
//     where: { slug: teamSlug },
//     include: {
//       members: {
//         where: { userId: session.user.id },
//         select: { id: true, role: true },
//       },
//     },
//   });

//   if (!team) return res.status(404).json({ error: "Team not found" });

//   const membership = team.members[0];
//   if (!membership) return res.status(403).json({ error: "Not a team member" });

//   // ─── GET: list rooms ──────────────────────────────────────────────────────
//   if (req.method === "GET") {
//     const rooms = await prisma.room.findMany({
//       where: { teamId: team.id, isArchived: false },
//       include: {
//         createdBy: { select: { id: true, name: true, image: true } },
//       },
//       orderBy: { updatedAt: "desc" },
//     });

//     return res.status(200).json({ rooms });
//   }

//   // ─── POST: create room ────────────────────────────────────────────────────
//   if (req.method === "POST") {
//     const { name } = req.body as { name: string };

//     if (!name?.trim()) {
//       return res.status(400).json({ error: "Room name is required" });
//     }

//     const baseSlug = slugify(name);
//     let slug = baseSlug;
//     let suffix = 1;

//     // Ensure unique slug within team
//     while (
//       await prisma.room.findUnique({ where: { teamId_slug: { teamId: team.id, slug } } })
//     ) {
//       slug = `${baseSlug}-${suffix++}`;
//     }

//     const room = await prisma.room.create({
//       data: {
//         name: name.trim(),
//         slug,
//         teamId: team.id,
//         createdById: session.user.id,
//       },
//       include: {
//         createdBy: { select: { id: true, name: true, image: true } },
//       },
//     });

//     return res.status(201).json({ room });
//   }

//   return res.status(405).json({ error: "Method not allowed" });
// }

// pages/api/team/[teamSlug]/rooms.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { teamSlug } = req.query as { teamSlug: string };

  // Verify team exists and user is a member
  const team = await prisma.team.findUnique({
    where: { slug: teamSlug },
    include: {
      members: {
        where: { userId: session.user.id },
        select: { id: true, role: true },
      },
    },
  });

  if (!team) return res.status(404).json({ error: "Team not found" });

  const membership = team.members[0];
  if (!membership) return res.status(403).json({ error: "Not a team member" });

  // ─── GET: list rooms ──────────────────────────────────────────────────────
  if (req.method === "GET") {
    const rooms = await prisma.room.findMany({
      where: { teamId: team.id, isArchived: false },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.status(200).json({ rooms });
  }

  // ─── POST: create room ────────────────────────────────────────────────────
  if (req.method === "POST") {
    const { name } = req.body as { name: string };

    if (!name?.trim()) {
      return res.status(400).json({ error: "Room name is required" });
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 1;

    // Ensure unique slug within team
    while (
      await prisma.room.findUnique({ where: { teamId_slug: { teamId: team.id, slug } } })
    ) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        slug,
        teamId: team.id,
        createdById: session.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
    });

    return res.status(201).json({ room });
  }

  // ─── PUT: update room ─────────────────────────────────────────────────────
  if (req.method === "PUT") {
    const { roomId, name, isArchived } = req.body as {
      roomId: string;
      name?: string;
      isArchived?: boolean;
    };

    if (!roomId) {
      return res.status(400).json({ error: "Room ID is required" });
    }

    // Verify room exists and belongs to this team
    const existingRoom = await prisma.room.findFirst({
      where: { id: roomId, teamId: team.id },
    });

    if (!existingRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only allow update by creator or team admin/owner
    const isAdmin = ["OWNER", "ADMIN"].includes(membership.role);
    const isCreator = existingRoom.createdById === session.user.id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ error: "Not authorized to update this room" });
    }

    const updateData: { name?: string; slug?: string; isArchived?: boolean } = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: "Room name cannot be empty" });
      }
      updateData.name = name.trim();

      // Regenerate slug if name changed
      const baseSlug = slugify(name);
      let slug = baseSlug;
      let suffix = 1;

      while (
        await prisma.room.findUnique({
          where: { teamId_slug: { teamId: team.id, slug } },
        })
      ) {
        if (slug === existingRoom.slug) break; // keep current slug if it's the same room
        slug = `${baseSlug}-${suffix++}`;
      }

      if (slug !== existingRoom.slug) {
        updateData.slug = slug;
      }
    }

    if (isArchived !== undefined) {
      updateData.isArchived = isArchived;
    }

    const room = await prisma.room.update({
      where: { id: roomId },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
    });

    return res.status(200).json({ room });
  }

  // ─── DELETE: delete room ──────────────────────────────────────────────────
  if (req.method === "DELETE") {
    const { roomId } = req.query as { roomId?: string };

    if (!roomId) {
      return res.status(400).json({ error: "Room ID is required" });
    }

    // Verify room exists and belongs to this team
    const existingRoom = await prisma.room.findFirst({
      where: { id: roomId, teamId: team.id },
    });

    if (!existingRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only allow delete by creator or team admin/owner
    const isAdmin = ["OWNER", "ADMIN"].includes(membership.role);
    const isCreator = existingRoom.createdById === session.user.id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ error: "Not authorized to delete this room" });
    }

    await prisma.room.delete({
      where: { id: roomId },
    });

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}