// In-memory sliding-window rate limiter, keyed by client IP. Resets on server restart and is
// per-instance only (no shared store), which is sufficient for a single-node deployment.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function cleanupExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function getClientIp(request: Request): string {
  if (process.env.REDIHEALTH_TRUST_PROXY_HEADERS !== "true") {
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

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  if (buckets.size > 10_000) {
    cleanupExpired(now);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
