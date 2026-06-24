// ============================================================
// lib/rateLimit.ts
// Token-bucket rate limiter for API routes
// ============================================================

import type { NextApiResponse } from 'next';

interface RateLimitOptions {
  interval: number; // ms
  uniqueTokenPerInterval: number;
}

interface TokenBucket {
  count: number;
  resetAt: number;
}

const tokenCache = new Map<string, TokenBucket>();

export function rateLimit(options: RateLimitOptions) {
  return {
    check: (res: NextApiResponse, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const now = Date.now();
        const bucket = tokenCache.get(token);

        if (!bucket || bucket.resetAt < now) {
          tokenCache.set(token, { count: 1, resetAt: now + options.interval });
          res.setHeader('X-RateLimit-Limit', limit);
          res.setHeader('X-RateLimit-Remaining', limit - 1);
          return resolve();
        }

        if (bucket.count >= limit) {
          res.setHeader('X-RateLimit-Limit', limit);
          res.setHeader('X-RateLimit-Remaining', 0);
          res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
          return reject(new Error('Rate limit exceeded'));
        }

        bucket.count++;
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', limit - bucket.count);
        resolve();
      }),
  };
}
