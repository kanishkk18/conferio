import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { generateUploadURL } from "../../../lib/s3";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id)
    return res.status(401).json({ message: "Unauthorized" });

  const { filename, contentType, size } = req.body;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowedTypes.includes(contentType))
    return res.status(400).json({ message: "Invalid file type" });

  if (size > 10 * 1024 * 1024)
    return res.status(400).json({ message: "Max 10MB allowed" });

  const { uploadURL, key } = await generateUploadURL(filename, contentType);

  return res.status(200).json({ uploadURL, key });
}