import { createHash } from "crypto";
import { getControlDatabase, hasControlDatabase, type RowDataPacket } from "@/lib/database";

// Counters live in MySQL so limits hold across server instances and restarts. When the database is
// unavailable (or migration 009 has not been applied) the limiter degrades to a per-process map
// instead of failing requests.

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();
const CLEANUP_INTERVAL_MS = 10 * 60_000;
let lastCleanupAt = 0;
let warnedUnknownIp = false;
let warnedStoreFailure = false;

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type RateLimitOptions = { limit: number; windowMs: number };

function isProxyTrusted() {
  // Vercel always overwrites X-Forwarded-For; on a VPS the operator opts in behind their own proxy.
  return process.env.REDIHEALTH_TRUST_PROXY_HEADERS === "true" || process.env.VERCEL === "1";
}

export function getClientIp(request: Request): string {
  if (!isProxyTrusted()) {
    if (process.env.NODE_ENV === "production" && !warnedUnknownIp) {
      warnedUnknownIp = true;
      console.warn(
        "REDIHEALTH_TRUST_PROXY_HEADERS is not enabled: every client shares one rate-limit bucket. " +
          "Enable it when running behind a reverse proxy that sets X-Forwarded-For.",
      );
    }
    return "unknown";
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstForwardedIp = forwardedFor.split(",")[0].trim();
    if (firstForwardedIp) {
      return firstForwardedIp;
    }
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function checkMemoryRateLimit(key: string, { limit, windowMs }: RateLimitOptions, now: number): RateLimitResult {
  if (memoryBuckets.size > 10_000) {
    for (const [bucketKey, bucket] of memoryBuckets) {
      if (bucket.resetAt <= now) memoryBuckets.delete(bucketKey);
    }
  }

  const bucket = memoryBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

async function checkStoredRateLimit(key: string, { limit, windowMs }: RateLimitOptions, now: number): Promise<RateLimitResult> {
  const db = getControlDatabase();
  const bucketKey = createHash("sha256").update(key).digest("hex");

  // Assignments run left to right, so `hits` must be evaluated before `reset_at` is rewritten.
  await db.query(
    `INSERT INTO rate_limits (bucket_key, hits, reset_at) VALUES (?, 1, ?)
     ON DUPLICATE KEY UPDATE
       hits = IF(reset_at <= ?, 1, hits + 1),
       reset_at = IF(reset_at <= ?, ?, reset_at)`,
    [bucketKey, now + windowMs, now, now, now + windowMs],
  );
  const [rows] = await db.query<(RowDataPacket & { hits: number; reset_at: string | number })[]>(
    "SELECT hits, reset_at FROM rate_limits WHERE bucket_key = ?",
    [bucketKey],
  );

  if (now - lastCleanupAt > CLEANUP_INTERVAL_MS) {
    lastCleanupAt = now;
    void db.query("DELETE FROM rate_limits WHERE reset_at < ? LIMIT 1000", [now]).catch(() => undefined);
  }

  const row = rows[0];
  if (!row) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (Number(row.hits) > limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((Number(row.reset_at) - now) / 1000)) };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export async function checkRateLimit(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();

  if (hasControlDatabase() && process.env.NODE_ENV !== "test") {
    try {
      return await checkStoredRateLimit(key, options, now);
    } catch (error) {
      if (!warnedStoreFailure) {
        warnedStoreFailure = true;
        console.warn("Shared rate limiting unavailable, using in-memory counters. Is migration 009 applied?", error);
      }
    }
  }

  return checkMemoryRateLimit(key, options, now);
}
