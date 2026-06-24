// import { NextRequest, NextResponse } from 'next/server'
// import { verifyJwtToken } from './auth'
// import { HTTPSTATUS } from './http-status'
// import { AppError } from './errors'

// export function withAuth(handler: (req: NextRequest, userId: string) => Promise<NextResponse>) {
//   return async (req: NextRequest) => {
//     try {
//       const authHeader = req.headers.get('authorization')
      
//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return NextResponse.json(
//           { message: 'Authorization header required' },
//           { status: HTTPSTATUS.UNAUTHORIZED }
//         )
//       }

//       const token = authHeader.substring(7)
//       const payload = verifyJwtToken(token)
      
//       return await handler(req, payload.userId)
//     } catch (error) {
//       return NextResponse.json(
//         { message: 'Invalid or expired token' },
//         { status: HTTPSTATUS.UNAUTHORIZED }
//       )
//     }
//   }
// }

// export function withErrorHandling(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
//   return async (req: NextRequest, ...args: any[]) => {
//     try {
//       return await handler(req, ...args)
//     } catch (error) {
//       console.error('API Error:', error)

//       if (error instanceof AppError) {
//         return NextResponse.json(
//           {
//             message: error.message,
//             errorCode: error.errorCode,
//           },
//           { status: error.statusCode }
//         )
//       }

//       return NextResponse.json(
//         { message: 'Internal Server Error' },
//         { status: HTTPSTATUS.INTERNAL_SERVER_ERROR }
//       )
//     }
//   }
// }

// export function withValidation<T>(
//   schema: any,
//   handler: (req: NextRequest, data: T, ...args: any[]) => Promise<NextResponse>
// ) {
//   return async (req: NextRequest, ...args: any[]) => {
//     try {
//       let data: any

//       if (req.method === 'GET') {
//         const url = new URL(req.url)
//         const params = Object.fromEntries(url.searchParams.entries())
//         data = { ...params, ...args[0]?.params }
//       } else {
//         data = await req.json()
//       }

//       const validatedData = schema.parse(data)
//       return await handler(req, validatedData, ...args)
//     } catch (error: any) {
//       if (error.errors) {
//         return NextResponse.json(
//           {
//             message: 'Validation failed',
//             errors: error.errors.map((err: any) => ({
//               field: err.path.join('.'),
//               message: err.message,
//             })),
//           },
//           { status: HTTPSTATUS.BAD_REQUEST }
//         )
//       }

//       throw error
//     }
//   }
// }

// import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
// import { NextRequest, NextResponse } from 'next/server';
// import { verifyJwtToken } from './auth';
// import { HTTPSTATUS } from './http-status';
// import { AppError } from './errors';
// import { z, ZodSchema } from 'zod';

// // Type guard to check if request is from App Router
// function isAppRouterRequest(req: any): req is NextRequest {
//   return req instanceof Request || 'nextUrl' in req;
// }

// // Universal auth middleware
// export function withAuth(handler: (req: NextApiRequest | NextRequest, userId: string, res?: NextApiResponse) => Promise<any>) {
//   return async (req: NextApiRequest | NextRequest, res?: NextApiResponse) => {
//     try {
//       let token: string | null = null;
      
//       if (isAppRouterRequest(req)) {
//         // App Router: NextRequest
//         const authHeader = req.headers.get('authorization');
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//           return NextResponse.json(
//             { message: 'Authorization header required' },
//             { status: HTTPSTATUS.UNAUTHORIZED }
//           );
//         }
//         token = authHeader.substring(7);
//       } else {
//         // Pages Router: NextApiRequest
//         const authHeader = (req as NextApiRequest).headers.authorization;
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//           return (res as NextApiResponse).status(HTTPSTATUS.UNAUTHORIZED).json(
//             { message: 'Authorization header required' }
//           );
//         }
//         token = authHeader.substring(7);
//       }

//       const payload = verifyJwtToken(token);
      
//       if (isAppRouterRequest(req)) {
//         return handler(req, payload.userId);
//       } else {
//         return handler(req, payload.userId, res as NextApiResponse);
//       }
//     } catch (error) {
//       if (isAppRouterRequest(req)) {
//         return NextResponse.json(
//           { message: 'Invalid or expired token' },
//           { status: HTTPSTATUS.UNAUTHORIZED }
//         );
//       } else {
//         return (res as NextApiResponse).status(HTTPSTATUS.UNAUTHORIZED).json(
//           { message: 'Invalid or expired token' }
//         );
//       }
//     }
//   };
// }

// // Universal error handling middleware
// export function withErrorHandling(handler: (req: NextApiRequest | NextRequest, ...args: any[]) => Promise<any>) {
//   return async (req: NextApiRequest | NextRequest, ...args: any[]) => {
//     try {
//       return await handler(req, ...args);
//     } catch (error) {
//       console.error('API Error:', error);

//       if (isAppRouterRequest(req)) {
//         if (error instanceof AppError) {
//           return NextResponse.json(
//             {
//               message: error.message,
//               errorCode: error.errorCode,
//             },
//             { status: error.statusCode }
//           );
//         }

//         return NextResponse.json(
//           { message: 'Internal Server Error' },
//           { status: HTTPSTATUS.INTERNAL_SERVER_ERROR }
//         );
//       } else {
//         const res = args[0] as NextApiResponse;
        
//         if (error instanceof AppError) {
//           return res.status(error.statusCode).json({
//             message: error.message,
//             errorCode: error.errorCode,
//           });
//         }

//         return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json(
//           { message: 'Internal Server Error' }
//         );
//       }
//     }
//   };
// }

// // Universal validation middleware
// export function withValidation<T>(
//   schema: ZodSchema<T>,
//   handler: (req: NextApiRequest | NextRequest, data: T, ...args: any[]) => Promise<any>
// ) {
//   return async (req: NextApiRequest | NextRequest, ...args: any[]) => {
//     try {
//       let data: any;

//       if (isAppRouterRequest(req)) {
//         // App Router handling
//         if (req.method === 'GET') {
//           const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
//           const pathParams = args[0]?.params || {};
//           data = { ...searchParams, ...pathParams };
//         } else {
//           data = await req.json();
//         }
//       } else {
//         // Pages Router handling
//         const apiReq = req as NextApiRequest;
//         if (apiReq.method === 'GET') {
//           data = { ...apiReq.query, ...args[0]?.params };
//         } else {
//           data = apiReq.body;
//         }
//       }

//       const validatedData = schema.parse(data);
//       return await handler(req, validatedData, ...args);
//     } catch (error: any) {
//       if (error instanceof z.ZodError) {
//         const errors = error.errors.map((err: any) => ({
//           field: err.path.join('.'),
//           message: err.message,
//         }));

//         if (isAppRouterRequest(req)) {
//           return NextResponse.json(
//             {
//               message: 'Validation failed',
//               errors,
//             },
//             { status: HTTPSTATUS.BAD_REQUEST }
//           );
//         } else {
//           return (args[0] as NextApiResponse).status(HTTPSTATUS.BAD_REQUEST).json({
//             message: 'Validation failed',
//             errors,
//           });
//         }
//       }

//       throw error;
//     }
//   };
// }


// lib/middleware.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwtToken } from './auth';
import { HTTPSTATUS } from './http-status';
import { AppError } from './errors';
import { z, ZodSchema } from 'zod';

export function withAuth(handler: (req: NextApiRequest, res: NextApiResponse, userId: string) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(HTTPSTATUS.UNAUTHORIZED).json(
          { message: 'Authorization header required' }
        );
      }

      const token = authHeader.substring(7);
      const payload = verifyJwtToken(token);
      
      return await handler(req, res, payload.userId);
    } catch (error) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json(
        { message: 'Invalid or expired token' }
      );
    }
  };
}

export function withErrorHandling(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message,
          errorCode: error.errorCode,
        });
      }

      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json(
        { message: 'Internal Server Error' }
      );
    }
  };
}

export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: NextApiRequest, res: NextApiResponse, data: T) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      let data: any;

      if (req.method === 'GET') {
        data = req.query;
      } else {
        data = req.body;
      }

      const validatedData = schema.parse(data);
      return await handler(req, res, validatedData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: 'Validation failed',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      throw error;
    }
  };
}
