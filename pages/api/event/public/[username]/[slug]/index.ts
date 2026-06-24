// pages/api/event/public/[username]/[slug]/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { UserNameAndSlugSchema } from 'lib/validation';
import { withErrorHandling, withValidation } from 'lib/middleware';
import { HTTPSTATUS } from 'lib/http-status';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  data: { username: string; slug: string }
) {
  const event = await prisma.event.findFirst({
    where: {
      slug: data.slug,
      isPrivate: false,
      user: {
        username: data.username,
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      duration: true,
      locationType: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!event) {
    return res.status(HTTPSTATUS.NOT_FOUND).json({
      message: "Event not found",
    });
  }

  return res.status(HTTPSTATUS.OK).json({
    message: "Event details fetched successfully",
    event,
  });
}

export default withErrorHandling(
  withValidation(UserNameAndSlugSchema, handler)
);