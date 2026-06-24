// pages/api/user/check.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth'; // Import auth options
import { prisma } from 'utils/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get session using server-side method
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { name, email, image } = session.user;

    // Check if user exists
    const userExists = await prisma.user.findFirst({
      where: { email }
    });

    if (userExists) {
      console.log("User already exists");
      return res.json({ registered: true });
    }

    // Create new user
    await prisma.user.create({
      data: {
        username: name || email.split('@')[0], // Fallback to email prefix if no name
        email,
        ...(image && { image }),
      },
    });

    console.log('User created');
    return res.json({ registered: true });
    
  } catch (error) {
    console.error('Error in user check:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}