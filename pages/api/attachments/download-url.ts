import { NextApiRequest, NextApiResponse } from "next";
import { generateDownloadURL } from "../../../lib/s3";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id)
    return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.query;

  const attachment = await prisma.attachment.findUnique({
    where: { id: id as string },
  });

  if (!attachment)
    return res.status(404).json({ message: "Not found" });

  const url = await generateDownloadURL(attachment.key);

  res.status(200).json({ url });
}