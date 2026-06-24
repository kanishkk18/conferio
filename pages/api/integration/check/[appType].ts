import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { AppTypeSchema } from 'lib/validation';
import { HTTPSTATUS } from 'lib/http-status';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
        message: 'Unauthorized' 
      });
    }
    const userId = session.user.id;

    // Only handle GET requests
    if (req.method !== 'GET') {
      return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
        message: 'Method not allowed'
      });
    }

    // Validation
    const { appType } = req.query;
    const validatedData = AppTypeSchema.parse({ appType });

    // Check integration status
    const integration = await prisma.integration.findFirst({
      where: { 
        userId, 
        appType: validatedData.appType 
      },
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Integration checked successfully",
      isConnected: !!integration,
    });
  } catch (error: any) {
    console.error('Integration check error:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
    });
  }
}