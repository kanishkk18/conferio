// import { compare, hash } from 'bcryptjs';
// import env from './env';
// import type { AUTH_PROVIDER } from 'types/';
// import jwt from 'jsonwebtoken'
// import bcrypt from 'bcryptjs'
// import { config } from './config'
// import { NextAuthOptions } from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'
// import { PrismaAdapter } from '@next-auth/prisma-adapter'
// import { prisma } from './prisma'
// import { v4 as uuidv4 } from 'uuid'
// import { DayOfWeek } from '@prisma/client'

// export async function hashPassword(password: string) {
//   return await hash(password, 12);
// }

// export async function verifyPassword(password: string, hashedPassword: string) {
//   return await compare(password, hashedPassword);
// }

// function getAuthProviders() {
//   return env.authProviders?.split(',') || [];
// }

// export function isAuthProviderEnabled(provider: AUTH_PROVIDER) {
//   return getAuthProviders().includes(provider);
// }

// export function authProviderEnabled() {
//   return {
//     github: isAuthProviderEnabled('github'),
//     google: isAuthProviderEnabled('google'),
//     email: isAuthProviderEnabled('email'),
//     saml: isAuthProviderEnabled('saml'),
//     credentials: isAuthProviderEnabled('credentials'),
//   };
// }

// export type AccessTokenPayload = {
//   userId: string
// }

// export const hashValue = async (value: string, saltRounds: number = 10) =>
//   await bcrypt.hash(value, saltRounds)

// export const compareValue = async (value: string, hashedValue: string) =>
//   await bcrypt.compare(value, hashedValue)

// export const signJwtToken = (payload: AccessTokenPayload) => {
//   const token = jwt.sign(payload, config.JWT_SECRET, {
//     expiresIn: config.JWT_EXPIRES_IN,
//     audience: ["user"],
//   })

//   const decodedToken = jwt.decode(token) as jwt.JwtPayload | null
//   const expiresAt = decodedToken?.exp ? decodedToken.exp * 1000 : null

//   return {
//     token,
//     expiresAt,
//   }
// }

// export const verifyJwtToken = (token: string): AccessTokenPayload => {
//   return jwt.verify(token, config.JWT_SECRET, {
//     audience: ["user"],
//   }) as AccessTokenPayload
// }

// async function generateUsername(name: string): Promise<string> {
//   const cleanName = name.replace(/\s+/g, "").toLowerCase()
//   const baseUsername = cleanName
//   const uuidSuffix = uuidv4().replace(/\s+/g, "").slice(0, 4)
//   let username = `${baseUsername}${uuidSuffix}`
  
//   let existingUser = await prisma.user.findUnique({
//     where: { username },
//   })

//   while (existingUser) {
//     username = `${baseUsername}${uuidv4().replace(/\s+/g, "").slice(0, 4)}`
//     existingUser = await prisma.user.findUnique({ where: { username } })
//   }

//   return username
// }

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
  
//   events: {
//     async createUser({ user }) {
//       try {
//         const username = await generateUsername(user.name || user.email!.split('@')[0])
//         await prisma.user.update({
//           where: { id: user.id },
//           data: {
//             username,
//             availability: {
//               create: {
//                 timeGap: 30,
//                 days: {
//                   create: Object.values(DayOfWeek).map((day) => ({
//                     day,
//                     startTime: new Date(`2025-03-01T09:00:00Z`),
//                     endTime: new Date(`2025-03-01T17:00:00Z`),
//                     isAvailable: day !== DayOfWeek.SUNDAY && day !== DayOfWeek.SATURDAY,
//                   })),
//                 },
//               },
//             },
//           },
//         })
//       } catch (error) {
//         console.error('Error in createUser event:', error)
//         throw error
//       }
//     },
//   },
//   callbacks: {
//     async signIn({ user, account }) {
//       if (account?.provider === 'google') {
//         try {
//           const existingUser = await prisma.user.findUnique({
//             where: { email: user.email! },
//           })

//           if (existingUser) {
//             // Check if Google account is linked
//             const existingAccount = await prisma.account.findFirst({
//               where: {
//                 userId: existingUser.id,
//                 provider: account.provider,
//                 providerAccountId: account.providerAccountId,
//               },
//             })

//             // Link account if not already linked
//             if (!existingAccount) {
//               await prisma.account.create({
//                 data: {
//                   userId: existingUser.id,
//                   type: account.type,
//                   provider: account.provider,
//                   providerAccountId: account.providerAccountId,
//                   refresh_token: account.refresh_token,
//                   access_token: account.access_token,
//                   expires_at: account.expires_at,
//                   token_type: account.token_type,
//                   scope: account.scope,
//                   id_token: account.id_token,
//                   session_state: account.session_state,
//                 },
//               })
//             }

//             // Update username if missing
//             if (!existingUser.username) {
//               const username = await generateUsername(existingUser.name || existingUser.email.split('@')[0])
//               await prisma.user.update({
//                 where: { id: existingUser.id },
//                 data: { username },
//               })
//             }
//           }
//         } catch (error) {
//           console.error('Error in signIn callback:', error)
//           return false
//         }
//       }
//       return true
//     },
//     async session({ session, user }) {
//       if (session.user) {
//         const dbUser = await prisma.user.findUnique({
//           where: { email: session.user.email! },
//         })
        
//         if (dbUser) {
//           session.user.id = dbUser.id
//           session.user.username = dbUser.username
//         }
//       }
//       return session
//     },
//   },
//   pages: {
//     signIn: '/auth/signin',
//   },
//   session: {
//     strategy: 'database',
//   },
// }

// import { compare, hash } from 'bcryptjs';
// import env from './env';
// import type { AUTH_PROVIDER } from 'types/';
// import jwt from 'jsonwebtoken'
// import bcrypt from 'bcryptjs'
// import { config } from './config'
// import { NextAuthOptions } from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'
// import { PrismaAdapter } from '@next-auth/prisma-adapter'
// import { prisma } from './prisma'
// import { v4 as uuidv4 } from 'uuid'
// import { DayOfWeek } from '@prisma/client'

// export async function hashPassword(password: string) {
//   return await hash(password, 12);
// }

// export async function verifyPassword(password: string, hashedPassword: string) {
//   return await compare(password, hashedPassword);
// }

// function getAuthProviders() {
//   return env.authProviders?.split(',') || [];
// }

// export function isAuthProviderEnabled(provider: AUTH_PROVIDER) {
//   return getAuthProviders().includes(provider);
// }

// export function authProviderEnabled() {
//   return {
//     github: isAuthProviderEnabled('github'),
//     google: isAuthProviderEnabled('google'),
//     email: isAuthProviderEnabled('email'),
//     saml: isAuthProviderEnabled('saml'),
//     credentials: isAuthProviderEnabled('credentials'),
//   };
// }

// export type AccessTokenPayload = {
//   userId: string
// }

// export const hashValue = async (value: string, saltRounds: number = 10) =>
//   await bcrypt.hash(value, saltRounds)

// export const compareValue = async (value: string, hashedValue: string) =>
//   await bcrypt.compare(value, hashedValue)

// export const signJwtToken = (payload: AccessTokenPayload) => {
//   const token = jwt.sign(payload, config.JWT_SECRET, {
//     expiresIn: config.JWT_EXPIRES_IN,
//     audience: ["user"],
//   })

//   const decodedToken = jwt.decode(token) as jwt.JwtPayload | null
//   const expiresAt = decodedToken?.exp ? decodedToken.exp * 1000 : null

//   return {
//     token,
//     expiresAt,
//   }
// }

// export const verifyJwtToken = (token: string): AccessTokenPayload => {
//   return jwt.verify(token, config.JWT_SECRET, {
//     audience: ["user"],
//   }) as AccessTokenPayload
// }

// async function generateUsername(name: string): Promise<string> {
//   const cleanName = name.replace(/\s+/g, "").toLowerCase()
//   const baseUsername = cleanName
//   const uuidSuffix = uuidv4().replace(/\s+/g, "").slice(0, 4)
//   let username = `${baseUsername}${uuidSuffix}`
  
//   let existingUser = await prisma.user.findUnique({
//     where: { username },
//   })

//   while (existingUser) {
//     username = `${baseUsername}${uuidv4().replace(/\s+/g, "").slice(0, 4)}`
//     existingUser = await prisma.user.findUnique({ where: { username } })
//   }

//   return username
// }

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
  
//   events: {
//     async createUser({ user }) {
//       try {
//         const username = await generateUsername(user.name || user.email!.split('@')[0])
//         await prisma.user.update({
//           where: { id: user.id },
//           data: {
//             username,
//             availability: {
//               create: {
//                 timeGap: 30,
//                 days: {
//                   create: Object.values(DayOfWeek).map((day) => ({
//                     day,
//                     startTime: new Date(`2025-03-01T09:00:00Z`),
//                     endTime: new Date(`2025-03-01T17:00:00Z`),
//                     isAvailable: day !== DayOfWeek.SUNDAY && day !== DayOfWeek.SATURDAY,
//                   })),
//                 },
//               },
//             },
//           },
//         })
//       } catch (error) {
//         console.error('Error in createUser event:', error)
//         throw error
//       }
//     },
//   },
//   callbacks: {
//     async signIn({ user, account }) {
//       if (account?.provider === 'google') {
//         try {
//           const existingUser = await prisma.user.findUnique({
//             where: { email: user.email! },
//           })

//           if (existingUser) {
//             // Check if Google account is linked
//             const existingAccount = await prisma.account.findFirst({
//               where: {
//                 userId: existingUser.id,
//                 provider: account.provider,
//                 providerAccountId: account.providerAccountId,
//               },
//             })

//             // Link account if not already linked
//             if (!existingAccount) {
//               await prisma.account.create({
//                 data: {
//                   userId: existingUser.id,
//                   type: account.type,
//                   provider: account.provider,
//                   providerAccountId: account.providerAccountId,
//                   refresh_token: account.refresh_token,
//                   access_token: account.access_token,
//                   expires_at: account.expires_at,
//                   token_type: account.token_type,
//                   scope: account.scope,
//                   id_token: account.id_token,
//                   session_state: account.session_state,
//                 },
//               })
//             }

//             // Update username if missing
//             if (!existingUser.username) {
//               const username = await generateUsername(existingUser.name || existingUser.email.split('@')[0])
//               await prisma.user.update({
//                 where: { id: existingUser.id },
//                 data: { username },
//               })
//             }
//           }
//         } catch (error) {
//           console.error('Error in signIn callback:', error)
//           return false
//         }
//       }
//       return true
//     },
//     // JWT callback to add custom claims to token
//     async jwt({ token, user, account }) {
//       // Initial sign in - add custom claims
//       if (user) {
//         token.id = user.id
//         token.username = user.username || ''
//       }
      
//       // Add provider-specific claims
//       if (account?.provider === 'google' && account.id_token) {
//         token.id_token = account.id_token
//       }
      
//       return token
//     },
//     // Session callback to expose custom claims to client
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string
//         session.user.username = token.username as string
//       }
//       return session
//     },
//   },
//   pages: {
//     signIn: '/auth/signin',
//   },
//   // JWT session strategy with expiration
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   // JWT configuration
//   jwt: {
//     secret: process.env.NEXTAUTH_SECRET!,
//     encryption: true,
//   },
//   // Enable debugging in development
//   debug: process.env.NODE_ENV === 'development',
// }

// import { compare, hash } from 'bcryptjs';
// import env from './env';
// import type { AUTH_PROVIDER } from 'types/';
// import jwt from 'jsonwebtoken'
// import bcrypt from 'bcryptjs'
// import { config } from './config'
// import { NextAuthOptions } from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'
// import CredentialsProvider from 'next-auth/providers/credentials'
// import { PrismaAdapter } from '@next-auth/prisma-adapter'
// import { prisma } from './prisma'
// import { v4 as uuidv4 } from 'uuid'
// import { DayOfWeek } from '@prisma/client'

// export async function hashPassword(password: string) {
//   return await hash(password, 12);
// }

// export async function verifyPassword(password: string, hashedPassword: string) {
//   return await compare(password, hashedPassword);
// }

// function getAuthProviders() {
//   return env.authProviders?.split(',') || [];
// }

// export function isAuthProviderEnabled(provider: AUTH_PROVIDER) {
//   return getAuthProviders().includes(provider);
// }

// export function authProviderEnabled() {
//   return {
//     github: isAuthProviderEnabled('github'),
//     google: isAuthProviderEnabled('google'),
//     email: isAuthProviderEnabled('email'),
//     saml: isAuthProviderEnabled('saml'),
//     credentials: isAuthProviderEnabled('credentials'),
//   };
// }

// export type AccessTokenPayload = {
//   userId: string
// }

// export const hashValue = async (value: string, saltRounds: number = 10) =>
//   await bcrypt.hash(value, saltRounds)

// export const compareValue = async (value: string, hashedValue: string) =>
//   await bcrypt.compare(value, hashedValue)

// export const signJwtToken = (payload: AccessTokenPayload) => {
//   const token = jwt.sign(payload, config.JWT_SECRET, {
//     expiresIn: config.JWT_EXPIRES_IN,
//     audience: ["user"],
//   })

//   const decodedToken = jwt.decode(token) as jwt.JwtPayload | null
//   const expiresAt = decodedToken?.exp ? decodedToken.exp * 1000 : null

//   return {
//     token,
//     expiresAt,
//   }
// }

// export const verifyJwtToken = (token: string): AccessTokenPayload => {
//   return jwt.verify(token, config.JWT_SECRET, {
//     audience: ["user"],
//   }) as AccessTokenPayload
// }

// async function generateUsername(name: string): Promise<string> {
//   const cleanName = name.replace(/\s+/g, "").toLowerCase()
//   const baseUsername = cleanName
//   const uuidSuffix = uuidv4().replace(/\s+/g, "").slice(0, 4)
//   let username = `${baseUsername}${uuidSuffix}`
  
//   let existingUser = await prisma.user.findUnique({
//     where: { username },
//   })

//   while (existingUser) {
//     username = `${baseUsername}${uuidv4().replace(/\s+/g, "").slice(0, 4)}`
//     existingUser = await prisma.user.findUnique({ where: { username } })
//   }

//   return username
// }

// async function initializeNewUser(userId: string, name: string) {
//   const username = await generateUsername(name);
//   await prisma.user.update({
//     where: { id: userId },
//     data: {
//       username,
//       availability: {
//         create: {
//           timeGap: 30,
//           days: {
//             create: Object.values(DayOfWeek).map((day) => ({
//               day,
//               startTime: new Date(`2025-03-01T09:00:00Z`),
//               endTime: new Date(`2025-03-01T17:00:00Z`),
//               isAvailable: day !== DayOfWeek.SUNDAY && day !== DayOfWeek.SATURDAY,
//             })),
//           },
//         },
//       },
//     },
//   });
// }

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//         name: { label: "Name", type: "text" }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         const existingUser = await prisma.user.findUnique({
//           where: { email: credentials.email }
//         });

//         if (existingUser) {
//           if (!existingUser.password) return null;
          
//           const passwordMatch = await compare(
//             credentials.password,
//             existingUser.password
//           );
          
//           if (passwordMatch) {
//             return {
//               id: existingUser.id,
//               email: existingUser.email,
//               name: existingUser.name,
//               image: existingUser.image
//             };
//           }
//         }

//         // Sign up new user
//         if (credentials.name) {
//           const hashedPassword = await hash(credentials.password, 12);
          
//           const newUser = await prisma.user.create({
//             data: {
//               email: credentials.email,
//               name: credentials.name,
//               password: hashedPassword,
//               image: `https://api.dicebear.com/7.x/initials/svg?seed=${credentials.name}`
//             }
//           });

//           // Initialize new user with username and availability
//           await initializeNewUser(newUser.id, credentials.name);

//           return {
//             id: newUser.id,
//             email: newUser.email,
//             name: newUser.name,
//             image: newUser.image
//           };
//         }

//         return null;
//       }
//     })
//   ],
  
//   events: {
//     async createUser({ user }) {
//       try {
//         await initializeNewUser(user.id, user.name || user.email!.split('@')[0]);
//       } catch (error) {
//         console.error('Error in createUser event:', error);
//         throw error;
//       }
//     },
//   },
//   callbacks: {
//     async signIn({ user, account }) {
//       if (account?.provider === 'google') {
//         try {
//           const existingUser = await prisma.user.findUnique({
//             where: { email: user.email! },
//           })

//           if (existingUser) {
//             // Check if Google account is linked
//             const existingAccount = await prisma.account.findFirst({
//               where: {
//                 userId: existingUser.id,
//                 provider: account.provider,
//                 providerAccountId: account.providerAccountId,
//               },
//             })

//             // Link account if not already linked
//             if (!existingAccount) {
//               await prisma.account.create({
//                 data: {
//                   userId: existingUser.id,
//                   type: account.type,
//                   provider: account.provider,
//                   providerAccountId: account.providerAccountId,
//                   refresh_token: account.refresh_token,
//                   access_token: account.access_token,
//                   expires_at: account.expires_at,
//                   token_type: account.token_type,
//                   scope: account.scope,
//                   id_token: account.id_token,
//                   session_state: account.session_state,
//                 },
//               })
//             }

//             // Update username if missing
//             if (!existingUser.username) {
//               const username = await generateUsername(existingUser.name || existingUser.email.split('@')[0])
//               await prisma.user.update({
//                 where: { id: existingUser.id },
//                 data: { username },
//               })
//             }
//           }
//         } catch (error) {
//           console.error('Error in signIn callback:', error)
//           return false
//         }
//       }
//       return true
//     },
//     // JWT callback to add custom claims to token
//     async jwt({ token, user }) {
//       // Initial sign in - add custom claims
//       if (user) {
//         token.sub = user.id; // Standard claim for subject identifier
//         token.id = user.id;
//         token.username = user.username || '';
//       }
//       return token
//     },
//     // Session callback to expose custom claims to client
//     async session({ session, token }) {
//       if (session.user) {
//         // Use token.sub for user ID (standard practice)
//         session.user.id = token.sub as string;
//         session.user.username = token.username as string;
//       }
//       return session
//     },
//   },
//   pages: {
//     signIn: '/auth/login',
//     },
//   // JWT session strategy with expiration
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   // JWT configuration
//   jwt: {
//     secret: process.env.NEXTAUTH_SECRET!,
//     encryption: true,
//   },
//   // Enable debugging in development
//   debug: process.env.NODE_ENV === 'development',
// }

import { compare, hash } from 'bcryptjs';
import env from './env';
import type { AUTH_PROVIDER } from 'types/';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { config } from './config'
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import { v4 as uuidv4 } from 'uuid'
import { DayOfWeek } from '@prisma/client'

export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}

function getAuthProviders() {
  return env.authProviders?.split(',') || [];
}

export function isAuthProviderEnabled(provider: AUTH_PROVIDER) {
  return getAuthProviders().includes(provider);
}

export function authProviderEnabled() {
  return {
    github: isAuthProviderEnabled('github'),
    google: isAuthProviderEnabled('google'),
    email: isAuthProviderEnabled('email'),
    saml: isAuthProviderEnabled('saml'),
    credentials: isAuthProviderEnabled('credentials'),
  };
}

export type AccessTokenPayload = {
  userId: string
}

export const hashValue = async (value: string, saltRounds: number = 10) =>
  await bcrypt.hash(value, saltRounds)

export const compareValue = async (value: string, hashedValue: string) =>
  await bcrypt.compare(value, hashedValue)

export const signJwtToken = (payload: AccessTokenPayload) => {
  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
    audience: ["user"],
  })

  const decodedToken = jwt.decode(token) as jwt.JwtPayload | null
  const expiresAt = decodedToken?.exp ? decodedToken.exp * 1000 : null

  return {
    token,
    expiresAt,
  }
}

export const verifyJwtToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, config.JWT_SECRET, {
    audience: ["user"],
  }) as AccessTokenPayload
}

async function generateUsername(name: string): Promise<string> {
  const cleanName = name.replace(/\s+/g, "").toLowerCase()
  const baseUsername = cleanName
  const uuidSuffix = uuidv4().replace(/\s+/g, "").slice(0, 4)
  let username = `${baseUsername}${uuidSuffix}`
  
  let existingUser = await prisma.user.findUnique({
    where: { username },
  })

  while (existingUser) {
    username = `${baseUsername}${uuidv4().replace(/\s+/g, "").slice(0, 4)}`
    existingUser = await prisma.user.findUnique({ where: { username } })
  }

  return username
}

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//    secret: process.env.NEXTAUTH_SECRET!,
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
  
//   callbacks: {
//     async session({ session, token }) {
//       if (session.user && token.sub) {
//         session.user.id = token.sub;
//         session.user.username = token.username as string;
        
//         // If username is not in token, try to get it from the database
//         if (!session.user.username) {
//           try {
//             const dbUser = await prisma.user.findUnique({
//               where: { id: token.sub },
//               select: { username: true }
//             });
//             if (dbUser) {
//               session.user.username = dbUser.username || '';
//             }
//           } catch (error) {
//             console.error('Error fetching username in session callback:', error);
//           }
//         }
//       }
//       return session;
//     },
    
//     async jwt({ token, user }) {
//       // Initial sign in
//       if (user) {
//         token.sub = user.id;
//         token.username = user.username || '';
//       }
      
//       // Ensure token always has username
//       if (token.sub && !token.username) {
//         try {
//           const dbUser = await prisma.user.findUnique({
//             where: { id: token.sub },
//             select: { username: true }
//           });
//           if (dbUser) {
//             token.username = dbUser.username || '';
//           }
//         } catch (error) {
//           console.error('Error fetching username in jwt callback:', error);
//         }
//       }
      
//       return token;
//     },
//     // Session callback to expose custom claims to client
//     // async session({ session, token }) {
//     //   if (session.user && token.sub) {
//     //     session.user.id = token.sub
//     //     session.user.username = token.username as string
//     //   }
//     //   return session
//     // },
//   },
//   pages: {
//     signIn: '/auth/login',
//   },
//   // JWT session strategy with expiration
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   // JWT configuration
//   jwt: {
//     secret: process.env.NEXTAUTH_SECRET!,
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   // Enable debugging in development
//   debug: process.env.NODE_ENV === 'development',
// }

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database',        // ✅ database strategy
    maxAge: 30 * 24 * 60 * 60,
  },
  // ❌ REMOVE the entire jwt: { ... } block
  callbacks: {
    // Database strategy: receives { session, user } — NOT token
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.username = (user as any).username || '';
      }
      return session;
    },
    // ❌ REMOVE the jwt callback entirely — not used with database strategy
  },
  pages: {
    signIn: '/auth/login',
  },
  debug: process.env.NODE_ENV === 'development',
};
