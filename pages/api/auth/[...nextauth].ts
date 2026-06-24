import NextAuth from 'next-auth';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getAuthOptions } from '@/lib/nextAuth';

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const authOptions = getAuthOptions(req, res);

  return await NextAuth(req, res, authOptions);
}

// import NextAuth from 'next-auth';
// import type { NextApiRequest, NextApiResponse } from 'next';

// import { getAuthOptions } from '@/lib/nextAuth';

// export default async function auth(req: NextApiRequest, res: NextApiResponse) {
//   const authOptions = getAuthOptions(req, res);

//   await NextAuth(req, res, authOptions); // ❗ No `return`
// }


// import NextAuth from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google'; // example
// import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import { prisma } from '@/lib/prisma';

// export const authOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   session: {
//     strategy: 'jwt' as const,
//   },
//   callbacks: {
//     async session({ session, token }) {
//       if (token?.sub) {
//         session.user.id = token.sub; // Add ID to session
//       }
//       return session;
//     },
//   },
// };

// export default NextAuth(authOptions);

// import NextAuth from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import { prisma } from '@/lib/prisma';
// // import { authOptions } from '@/lib/auth'


// export const authOptions = {
  
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   session: {
//     strategy: 'jwt' as const,
//   },
//   callbacks: {
//     async session({ session, token }) {
//       if (token?.sub) {
//         session.user.id = token.sub;
//       }
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// export default NextAuth(authOptions);

// // import NextAuth from 'next-auth'
// import { authOptions } from '@/lib/auth'

// const handler = NextAuth(authOptions)

// export { handler as GET, handler as POST }