import { createHash } from "crypto";
import { isIP } from "node:net";
import { getControlDatabase, hasControlDatabase, type RowDataPacket } from "@/lib/database";

// Counters live in the control database so limits hold across server instances and restarts. When the database is
// unavailable (or migration 009 has not been applied) the limiter degrades to a per-process map
// instead of failing requests.

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();
const MAX_MEMORY_BUCKETS = 10_000;
const CLEANUP_INTERVAL_MS = 10 * 60_000;
let lastCleanupAt = 0;
let warnedUnknownIp = false;
let warnedStoreFailure = false;

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type RateLimitOptions = { limit: number; windowMs: number; cost?: number };

function isProxyTrusted() {
  // Vercel always overwrites X-Forwarded-For; on a VPS the operator opts in behind their own proxy.
  return process.env.REDIHEALTH_TRUST_PROXY_HEADERS === "true" || process.env.VERCEL === "1";
}

function normalizeIpToken(raw: string): string | null {
  let candidate = raw.trim();
  if (!candidate || candidate.includes(",")) return null;
  if (candidate.startsWith("[")) {
    const endBracket = candidate.indexOf("]");
    if (endBracket === -1) return null;
    candidate = candidate.slice(1, endBracket);
  } else if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(candidate)) {
    candidate = candidate.replace(/:\d+$/, "");
  }
  const zoneIndex = candidate.indexOf("%");
  if (zoneIndex !== -1) {
    candidate = candidate.slice(0, zoneIndex);
  }
  const lower = candidate.toLowerCase();
  if (lower.startsWith("::ffff:")) {
    const rest = lower.slice(7);
    if (isIP(rest) === 4) return rest;
  }
  return candidate;
}

function isInternalProxyIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    const octets = ip.split(".").map(Number);
    if (octets.length !== 4) return false;
    const [a, b] = octets;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (/^f[cd][0-9a-f]{2}:/.test(lower)) return true;
    if (/^fe[89ab][0-9a-f]:/.test(lower)) return true;
    return false;
  }
  return false;
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

  // Prefer x-real-ip when set by the reverse proxy (overwritten rather than client-appended).
  const realIp = normalizeIpToken(request.headers.get("x-real-ip") ?? "");
  if (realIp) {
    return realIp;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const hops = forwardedFor
      .split(",")
      .map((part) => normalizeIpToken(part))
      .filter((part): part is string => Boolean(part));

    if (hops.length > 0) {
      // Pick the rightmost untrusted (non-internal-proxy) hop so a client-supplied leftmost XFF entry cannot spoof the IP.
      for (let i = hops.length - 1; i >= 0; i -= 1) {
        if (!isInternalProxyIp(hops[i])) {
          return hops[i];
        }
      }
      return hops[hops.length - 1];
    }
  }

  return "unknown";
}

function evictMemoryBucketsIfNeeded(now: number) {
  if (memoryBuckets.size < MAX_MEMORY_BUCKETS) return;
  for (const [bucketKey, bucket] of memoryBuckets) {
    if (bucket.resetAt <= now) {
      memoryBuckets.delete(bucketKey);
    }
  }
  while (memoryBuckets.size >= MAX_MEMORY_BUCKETS) {
    const oldestKey = memoryBuckets.keys().next().value;
    if (oldestKey === undefined) break;
    memoryBuckets.delete(oldestKey);
  }
}

function checkMemoryRateLimit(key: string, { limit, windowMs, cost = 1 }: RateLimitOptions, now: number): RateLimitResult {
  const safeCost = Math.max(1, Math.round(cost));
  const bucket = memoryBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (bucket) {
      memoryBuckets.delete(key);
    } else {
      evictMemoryBucketsIfNeeded(now);
    }
    memoryBuckets.set(key, { count: safeCost, resetAt: now + windowMs });
    if (safeCost > limit) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000)) };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count + safeCost > limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  bucket.count += safeCost;
  return { allowed: true, retryAfterSeconds: 0 };
}

async function checkStoredRateLimit(key: string, { limit, windowMs, cost = 1 }: RateLimitOptions, now: number): Promise<RateLimitResult> {
  const db = getControlDatabase();
  const bucketKey = createHash("sha256").update(key).digest("hex");
  const safeCost = Math.max(1, Math.round(cost));
  const nextReset = now + windowMs;

  // Single atomic upsert + RETURNING avoids separate SELECT race conditions.
  const [rows] = await db.query<(RowDataPacket & { hits: number; reset_at: string | number })[]>(
    `INSERT INTO rate_limits (bucket_key, hits, reset_at) VALUES (?, ?, ?)
     ON CONFLICT (bucket_key) DO UPDATE SET
       hits = CASE WHEN rate_limits.reset_at <= ? THEN ? ELSE rate_limits.hits + ? END,
       reset_at = CASE WHEN rate_limits.reset_at <= ? THEN ? ELSE rate_limits.reset_at END
     RETURNING hits, reset_at`,
    [bucketKey, safeCost, nextReset, now, safeCost, safeCost, now, nextReset],
  );

  if (now - lastCleanupAt > CLEANUP_INTERVAL_MS) {
    lastCleanupAt = now;
    void db.query("DELETE FROM rate_limits WHERE bucket_key IN (SELECT bucket_key FROM rate_limits WHERE reset_at < ? LIMIT 1000)", [now]).catch(() => undefined);
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
        // 42P01: the rate_limits table does not exist. Anything else is a connection problem.
        const missingTable = (error as { code?: string } | null)?.code === "42P01";
        console.warn(
          `Shared rate limiting unavailable, using in-memory counters.${missingTable ? " Is migration 009 applied?" : ""}`,
          error,
        );
      }
    }
  }

  return checkMemoryRateLimit(key, options, now);
}

export function _resetRateLimitMemoryForTest(): void {
  memoryBuckets.clear();
  lastCleanupAt = 0;
  warnedUnknownIp = false;
  warnedStoreFailure = false;
}

export function _getRateLimitMemorySizeForTest(): number {
  return memoryBuckets.size;
}
