// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getCookie } from 'cookies-next';
// import { getSession } from '@/lib/session';
// import { sessionTokenCookieName } from '@/lib/nextAuth';
// import { findManySessions } from 'models/session';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   try {
//     switch (req.method) {
//       case 'GET':
//         await handleGET(req, res);
//         break;
//       default:
//         res.setHeader('Allow', 'GET');
//         res.status(405).json({
//           error: { message: `Method ${req.method} Not Allowed` },
//         });
//     }
//   } catch (error: any) {
//     const message = error.message || 'Something went wrong';
//     const status = error.status || 500;

//     res.status(status).json({ error: { message } });
//   }
// }

// // Fetch all sessions for the current user
// const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
//   const session = await getSession(req, res);
//   const sessionToken = await getCookie(sessionTokenCookieName, { req, res });

//   let sessions = await findManySessions({
//     where: {
//       userId: session?.user.id,
//     },
//   });

//   sessions.map(
//     (session) => (session['isCurrent'] = session.sessionToken === sessionToken)
//   );

//   // Sort sessions by most recent
//   sessions = sessions.sort(
//     (a, b) => Number(new Date(b.expires)) - Number(new Date(a.expires))
//   );

//   res.json({ data: sessions });
// };


import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';
import { sessionTokenCookieName } from '@/lib/nextAuth';
import { findManySessions } from 'models/session';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET');
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Fetch all sessions for the current user with custom claims
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get session with custom claims
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: { message: 'Not authenticated' } });
  }

  // Extract custom claims
  const userId = session.user.id;
  const username = session.user.username || '';

  // Get current session token from cookie
  const sessionToken = await getCookie(sessionTokenCookieName, { req, res });

  // Fetch all sessions for this user
  let sessions = await findManySessions({
    where: { userId },
  });

  // Add current session flag and custom claims
  sessions = sessions.map(sessionRecord => ({
    ...sessionRecord,
    isCurrent: sessionRecord.sessionToken === sessionToken,
    user: {
      id: userId,
      username,
      // Add other custom claims as needed
    }
  }));

  // Sort sessions by most recent
  sessions.sort(
    (a, b) => Number(new Date(b.expires)) - Number(new Date(a.expires))
  );

  res.json({ data: sessions });
};