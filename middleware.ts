import micromatch from 'micromatch';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import env from './lib/env';

const SECURITY_HEADERS = {
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
} as const;

const generateCSP = (): string => {
  const policies = {
    'default-src': ["'self'"],
    'img-src': ["'self'", 'data:'],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*.gstatic.com', '*.google.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'connect-src': ["'self'", '*.google.com', '*.gstatic.com', '*.ingest.sentry.io', '*.mixpanel.com'],
    'frame-src': ["'self'", '*.google.com', '*.gstatic.com'],
    'font-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };
  return Object.entries(policies)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .concat(['upgrade-insecure-requests'])
    .join('; ');
};

// Routes that don't need the middleware session check.
// Note: ALL /api/** routes are excluded here because each API handler
// calls getServerSession() itself. Doing a second session fetch in
// middleware (which would be a recursive fetch through middleware again)
// is what caused the 404 / deadlock bug on timer routes.
const skipAuthRoutes = [
  // All API routes — auth is handled inside each handler via getServerSession()
  '/api/**',

  // Public page routes
  '/auth/**',
  '/invitations/*',
  '/terms-condition',
  '/unlock-account',
  '/login/saml',
  '/.well-known/*',
  '/meeting/*',
];

export default async function Middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth check for API routes and public pages
  if (micromatch.isMatch(pathname, skipAuthRoutes)) {
    // Still apply CSP / security headers to API responses if configured
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.next();
      if (env.securityHeadersEnabled) {
        const csp = generateCSP();
        response.headers.set('Content-Security-Policy', csp);
        Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }
      return response;
    }
    return NextResponse.next();
  }

  // ── Page route auth check ────────────────────────────────────────────────
  // For page routes we must verify the session. We do this by checking
  // whether the next-auth session cookie exists. If it's missing the user
  // is definitely not logged in — redirect immediately without a DB call.
  // If it exists, we let the page load; the page/layout can do a proper
  // server-side session check with getServerSession() if it needs user data.
  //
  // Why not call /api/auth/session here?
  //   That fetch goes back through this middleware → recursive loop → 404s.
  //
  // Why not use getToken()?
  //   This app uses database sessions (not JWT), so there is no JWT to decode.
  //
  // The cookie name used by NextAuth database strategy:
  //   Production:   __Secure-next-auth.session-token
  //   Development:  next-auth.session-token
  const sessionCookieName =
    process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';

  const sessionCookie = req.cookies.get(sessionCookieName);

  if (!sessionCookie?.value) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('callbackUrl', encodeURI(req.url));
    return NextResponse.redirect(redirectUrl);
  }

  // Cookie present — let the request through.
  // The actual session validity (expiry, DB lookup) is verified by
  // getServerSession() inside the page's getServerSideProps / server component.
  const ua = req.headers.get('user-agent') || '';
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
  if (isMobile && !pathname.startsWith('/mobile-development')) {
    const url = req.nextUrl.clone();
    url.pathname = '/mobile-development';
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(req.headers);
  const csp = generateCSP();
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (env.securityHeadersEnabled) {
    response.headers.set('Content-Security-Policy', csp);
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|).*)'],
};

// import micromatch from 'micromatch';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import env from './lib/env';

// // Constants for security headers
// const SECURITY_HEADERS = {
//   'Referrer-Policy': 'strict-origin-when-cross-origin',
//   'Permissions-Policy': 'geolocation=(), microphone=()',
//   'Cross-Origin-Embedder-Policy': 'require-corp',
//   'Cross-Origin-Opener-Policy': 'same-origin',
//   'Cross-Origin-Resource-Policy': 'same-site',
// } as const;

// // Generate CSP
// const generateCSP = (): string => {
//   const policies = {
//     'default-src': ["'self'"],
//     'img-src': [
//       "'self'",
//       'data:',
//     ],
//     'script-src': [
//       "'self'",
//       "'unsafe-inline'",
//       "'unsafe-eval'",
//       '*.gstatic.com',
//       '*.google.com',
//     ],
//     'style-src': ["'self'", "'unsafe-inline'"],
//     'connect-src': [
//       "'self'",
//       '*.google.com',
//       '*.gstatic.com',
//       '*.ingest.sentry.io',
//       '*.mixpanel.com',
//     ],
//     'frame-src': ["'self'", '*.google.com', '*.gstatic.com'],
//     'font-src': ["'self'"],
//     'object-src': ["'none'"],
//     'base-uri': ["'self'"],
//     'form-action': ["'self'"],
//     'frame-ancestors': ["'none'"],
//   };

//   return Object.entries(policies)
//     .map(([key, values]) => `${key} ${values.join(' ')}`)
//     .concat(['upgrade-insecure-requests'])
//     .join('; ');
// };

// // Add routes that don't require authentication
// const unAuthenticatedRoutes = [
//   '/api/hello',
//   '/api/health',
//   '/api/auth/**',
//   '/api/auth/session',    
//   '/api/oauth/**',
//   '/api/scim/v2.0/**',
//   '/api/invitations/*',
//   '/api/webhooks/stripe',
//   '/api/webhooks/dsync',
//   '/api/webhooks/meetingbaas',
//   '/api/integrations/**',
//   '/auth/**',
//   '/invitations/*',
//   '/terms-condition',
//   '/unlock-account',
//   '/login/saml',
//   '/.well-known/*',
//   '/meeting/*',

// ];

// export default async function Middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   if (micromatch.isMatch(pathname, unAuthenticatedRoutes)) {
//     return NextResponse.next();
//   }

//   const redirectUrl = new URL('/auth/login', req.url);
//   redirectUrl.searchParams.set('callbackUrl', encodeURI(req.url));

//   // ✅ Database strategy session check
//   const sessionRes = await fetch(new URL('/api/auth/session', req.url), {
//     headers: {
//       'Content-Type': 'application/json',
//       cookie: req.headers.get('cookie') || '',
//     },
//   });
//   const session = await sessionRes.json();

//   if (!session?.user) {
//     return NextResponse.redirect(redirectUrl);
//   }

//   const requestHeaders = new Headers(req.headers);
//   const csp = generateCSP();
//   requestHeaders.set('Content-Security-Policy', csp);

//   const response = NextResponse.next({ request: { headers: requestHeaders } });

//   const ua = req.headers.get('user-agent') || '';
//   const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
//   if (isMobile && !pathname.startsWith('/mobile-development')) {
//     const url = req.nextUrl.clone();
//     url.pathname = '/mobile-development';
//     return NextResponse.redirect(url);
//   }

//   if (env.securityHeadersEnabled) {
//     response.headers.set('Content-Security-Policy', csp);
//     Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
//       response.headers.set(key, value);
//     });
//   }

//   return response;
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico|).*)'],
// };

// export default async function proxy(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Bypass routes that don't require authentication
//   if (micromatch.isMatch(pathname, unAuthenticatedRoutes)) {
//     return NextResponse.next();
//   }

//   const redirectUrl = new URL('/auth/login', req.url);
//   redirectUrl.searchParams.set('callbackUrl', encodeURI(req.url));

//   // JWT strategy
//   // if (env.nextAuth.sessionStrategy === 'jwt') {
//   //   const token = await getToken({
//   //     req,
//   //   });

//   //   if (!token) {
//   //     return NextResponse.redirect(redirectUrl);
//   //   }
//   // }

//   // Database strategy
//   const sessionres (env.nextAuth.sessionStrategy === 'database') {
//     const url = new URL('/api/auth/session', req.url);

//     const response = await fetch(url, {
//       headers: {
//         'Content-Type': 'application/json',
//         cookie: req.headers.get('cookie') || '',
//       },
//     });

//     const session = await response.json();

//     if (!session.user) {
//       return NextResponse.redirect(redirectUrl);
//     }
//   }

//   const requestHeaders = new Headers(req.headers);
//   const csp = generateCSP();

//   requestHeaders.set('Content-Security-Policy', csp);

//   const response = NextResponse.next({
//     request: { headers: requestHeaders },
//   });

//   const ua = req.headers.get("user-agent") || "";
//   const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);

  
//   if (isMobile && !req.nextUrl.pathname.startsWith("/mobile-development")) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/mobile-development";
//     return NextResponse.redirect(url);
//   }

//   if (env.securityHeadersEnabled) {
//     // Set security headers
//     response.headers.set('Content-Security-Policy', csp);
//     Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
//       response.headers.set(key, value);
//     });
//   }

//   // All good, let the request through
//   return response;
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico|).*)'],
// };

// import micromatch from 'micromatch';
// import { getToken } from 'next-auth/jwt';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// import env from './lib/env';

// // FIXED: Removed Cross-Origin-Embedder-Policy and updated Permissions-Policy
// const SECURITY_HEADERS = {
//   'Referrer-Policy': 'strict-origin-when-cross-origin',
//   'Permissions-Policy': 'microphone=(self), camera=(self)', // FIXED: Allow mic/camera
//   'Cross-Origin-Opener-Policy': 'same-origin',
//   'Cross-Origin-Resource-Policy': 'cross-origin', // FIXED: Changed to cross-origin
// } as const;

// // FIXED: Added WebRTC and TURN server support
// const generateCSP = (): string => {
//   const policies = {
//     'default-src': ["'self'"],
//     'img-src': ["'self'", 'data:', 'blob:'],
//     'script-src': [
//       "'self'",
//       "'unsafe-inline'",
//       "'unsafe-eval'",
//       '*.gstatic.com',
//       '*.google.com',
//     ],
//     'style-src': ["'self'", "'unsafe-inline'"],
//     'connect-src': [
//       "'self'",
//       '*.google.com',
//       '*.gstatic.com',
//       '*.ingest.sentry.io',
//       '*.mixpanel.com',
//       // FIXED: Added TURN/STUN servers for WebRTC
//       'openrelay.metered.ca',
//       'relay.metered.ca',
//       'stun.l.google.com',
//       'stun1.l.google.com',
//       'stun2.l.google.com',
//       // FIXED: Added protocols for WebRTC
//       'blob:',
//       'data:',
//       'wss:',
//       'ws:',
//       'stun:',
//       'turn:',
//     ],
//     'media-src': ["'self'", 'blob:', 'data:'], // FIXED: Allow media streams
//     'frame-src': ["'self'", '*.google.com', '*.gstatic.com'],
//     'font-src': ["'self'"],
//     'object-src': ["'none'"],
//     'base-uri': ["'self'"],
//     'form-action': ["'self'"],
//     'frame-ancestors': ["'none'"],
//   };

//   return Object.entries(policies)
//     .map(([key, values]) => `${key} ${values.join(' ')}`)
//     .concat(['upgrade-insecure-requests'])
//     .join('; ');
// };

// // FIXED: Added socket routes to bypass auth
// const unAuthenticatedRoutes = [
//   '/api/hello',
//   '/api/health',
//   '/api/auth/**',
//   '/api/oauth/**',
//   '/api/scim/v2.0/**',
//   '/api/invitations/*',
//   '/api/webhooks/stripe',
//   '/api/webhooks/dsync',
//   '/api/webhooks/meetingbaas',
//   '/api/integrations/**',
//   '/auth/**',
//   '/invitations/*',
//   '/terms-condition',
//   '/unlock-account',
//   '/login/saml',
//   '/.well-known/*',
//   '/api/socket/**',        // ADDED: Socket.io endpoint
//   '/api/socket/io/**',     // ADDED: Socket.io endpoint
// ];

// export default async function proxy(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Bypass routes that don't require authentication
//   if (micromatch.isMatch(pathname, unAuthenticatedRoutes)) {
//     return NextResponse.next();
//   }

//   const redirectUrl = new URL('/auth/login', req.url);
//   redirectUrl.searchParams.set('callbackUrl', encodeURI(req.url));

//   // JWT strategy
//   if (env.nextAuth.sessionStrategy === 'jwt') {
//     const token = await getToken({
//       req,
//     });

//     if (!token) {
//       return NextResponse.redirect(redirectUrl);
//     }
//   }

//   // Database strategy
//   else if (env.nextAuth.sessionStrategy === 'database') {
//     const url = new URL('/api/auth/session', req.url);

//     const response = await fetch(url, {
//       headers: {
//         'Content-Type': 'application/json',
//         cookie: req.headers.get('cookie') || '',
//       },
//     });

//     const session = await response.json();

//     if (!session.user) {
//       return NextResponse.redirect(redirectUrl);
//     }
//   }

//   const requestHeaders = new Headers(req.headers);
//   const csp = generateCSP();

//   requestHeaders.set('Content-Security-Policy', csp);

//   const response = NextResponse.next({
//     request: { headers: requestHeaders },
//   });

//   const ua = req.headers.get("user-agent") || "";
//   const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);

  
//   if (isMobile && !req.nextUrl.pathname.startsWith("/mobile-development")) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/mobile-development";
//     return NextResponse.redirect(url);
//   }

//   if (env.securityHeadersEnabled) {
//     // Set security headers
//     response.headers.set('Content-Security-Policy', csp);
//     Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
//       response.headers.set(key, value);
//     });
//   }

//   // All good, let the request through
//   return response;
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico|).*)'],
// };