// next-auth.d.ts
import type { Role } from '@prisma/client';
import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string; // Add this
      roles: { teamId: string; role: Role; team: { name: string; slug: string } }[];
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    username?: string | null; // Add this
    roles: { teamId: string; role: Role; team: { name: string; slug: string } }[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username?: string | null; // Add this
    roles: { teamId: string; role: Role; team: { name: string; slug: string } }[];
  }
}