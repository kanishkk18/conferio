// lib/redis.ts
import { Redis } from "@upstash/redis";

let client: Redis | null = null;


export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserPresence {
  userId: string;
  userName: string;
  userImage?: string;
  color: string;
  cursor?: { x: number; y: number };
  tool?: string;
  selectedElements?: string[];
  lastSeen: number;
}

// ─── Presence Management ─────────────────────────────────────────────────────

export async function getPresence(
  boardId: string
): Promise<Record<string, UserPresence>> {
  try {
    const data = await redis.hgetall(`presence:${boardId}`);
    if (!data) return {};

    const parsed: Record<string, UserPresence> = {};
    for (const [key, value] of Object.entries(data)) {
      try {
        parsed[key] =
          typeof value === "string" ? JSON.parse(value) : (value as UserPresence);
      } catch {
        // skip malformed entries
      }
    }
    return parsed;
  } catch {
    return {};
  }
}

export async function updatePresence(
  boardId: string,
  userId: string,
  presence: UserPresence
): Promise<void> {
  try {
    const key = `presence:${boardId}`;
    await redis.hset(key, { [userId]: JSON.stringify(presence) });
    await redis.expire(key, 3600); // 1 hour TTL
  } catch {
    // Non-critical, log in dev
    if (process.env.NODE_ENV === "development") {
      console.warn("Redis updatePresence failed:", userId);
    }
  }
}

export async function removePresence(
  boardId: string,
  userId: string
): Promise<void> {
  try {
    await redis.hdel(`presence:${boardId}`, userId);
  } catch {
    // ignore
  }
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────

export async function checkRateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const key = `ratelimit:${action}:${identifier}`;
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    return current <= limit;
  } catch {
    return true; // Allow on error (fail open)
  }
}

// ─── Board State Caching ─────────────────────────────────────────────────────

export async function getCachedBoardState(
  boardId: string
): Promise<string | null> {
  try {
    return await redis.get(`board:state:${boardId}`);
  } catch {
    return null;
  }
}

export async function setCachedBoardState(
  boardId: string,
  state: string
): Promise<void> {
  try {
    await redis.set(`board:state:${boardId}`, state, { ex: 3600 });
  } catch {
    // ignore
  }
}

export async function invalidateBoardCache(boardId: string): Promise<void> {
  try {
    await redis.del(`board:state:${boardId}`);
  } catch {
    // ignore
  }
}

export function getRedisClient(): Redis {
  if (!client) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars are required");
    }
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return client;
}
 
// Convenience wrappers with graceful degradation
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    const data = await redis.get(key);
    return data as T | null;
  } catch {
    return null;
  }
}
 
export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Silently fail - Redis is optional
  }
}
 
export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.del(key);
  } catch {}
}
 
// Rate limiting helper
export async function RateLimitCheck(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const redis = getRedisClient();
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
    };
  } catch {
    // If Redis is down, allow the request
    return { allowed: true, remaining: limit };
  }
}

// export async function getRedisClient(): Promise<RedisClientType> {
//   if (client && client.isOpen) return client;
  
//   client = createClient({
//     url: process.env.REDIS_URL ?? 'redis://localhost:6379',
//     socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 500) },
//   });
  
//   client.on('error', (err) => console.error('Redis Client Error', err));
//   await client.connect();
//   return client;
// }

// // Synchronous getter for when you already know it's connected (server-side)
// export function getRedis(): RedisClientType {
//   if (!client) throw new Error('Redis not initialized. Call getRedisClient() first.');
//   return client;
// }
