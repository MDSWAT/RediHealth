import { createHash } from "crypto";
import { getControlDatabase, hasControlDatabase, type RowDataPacket } from "@/lib/database";
import { notifyOperationalIssue } from "@/lib/operational-alerts";

export const AI_ABUSE_BLOCK_DURATION_MS = 72 * 60 * 60 * 1_000;
export const AI_TOKEN_WINDOW_MS = 24 * 60 * 60 * 1_000;
export const AI_STRIKE_WINDOW_MS = 24 * 60 * 60 * 1_000;
export const ABUSE_STRIKES_TO_BLOCK = 2;
export const OFF_TOPIC_STRIKES_TO_WARN = 4;
export const OFF_TOPIC_STRIKES_TO_BLOCK = 6;
export const IP_DEVICE_BLOCKS_FOR_IP_BAN = 3;

const DEFAULT_DAILY_DEVICE_TOKEN_LIMIT = 30_000;
const DEFAULT_DAILY_IP_TOKEN_LIMIT = 120_000;
const DEFAULT_DAILY_UNKNOWN_IP_TOKEN_LIMIT = 60_000;
const MAX_MEMORY_BUCKETS = 10_000;
const CLEANUP_INTERVAL_MS = 10 * 60_000;

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();
let lastCleanupAt = 0;
let warnedStoreFailure = false;

export type AiQuotaSnapshot = {
  used: number;
  limit: number;
  remaining: number;
  resetAt: number;
};

export type AiAccessStatus = {
  blocked: boolean;
  blockedUntil: number | null;
  retryAfterSeconds: number;
  quota: AiQuotaSnapshot;
  limitedBy?: "device" | "ip";
};

function readPositiveIntEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function getDailyDeviceTokenLimit(): number {
  return readPositiveIntEnv("AI_DAILY_TOKEN_LIMIT_DEVICE", DEFAULT_DAILY_DEVICE_TOKEN_LIMIT, 100, 10_000_000);
}

export function getDailyIpTokenLimit(): number {
  return readPositiveIntEnv("AI_DAILY_TOKEN_LIMIT_IP", DEFAULT_DAILY_IP_TOKEN_LIMIT, 100, 50_000_000);
}

export function getDailyUnknownIpTokenLimit(): number {
  const configured = readPositiveIntEnv(
    "AI_DAILY_TOKEN_LIMIT_UNKNOWN_IP",
    DEFAULT_DAILY_UNKNOWN_IP_TOKEN_LIMIT,
    100,
    50_000_000,
  );
  return Math.min(configured, getDailyIpTokenLimit());
}

function hashBucketKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

function shouldUseDatabase(): boolean {
  return hasControlDatabase() && process.env.NODE_ENV !== "test";
}

function pruneMemoryBuckets(now: number) {
  if (memoryBuckets.size < MAX_MEMORY_BUCKETS) return;
  for (const [key, bucket] of memoryBuckets) {
    if (bucket.resetAt <= now) memoryBuckets.delete(key);
  }
  while (memoryBuckets.size >= MAX_MEMORY_BUCKETS) {
    const oldestKey = memoryBuckets.keys().next().value;
    if (oldestKey === undefined) break;
    memoryBuckets.delete(oldestKey);
  }
}

async function readBuckets(rawKeys: string[], now: number): Promise<Map<string, Bucket>> {
  const uniqueKeys = Array.from(new Set(rawKeys.filter(Boolean)));
  const result = new Map<string, Bucket>();
  if (uniqueKeys.length === 0) return result;

  if (shouldUseDatabase()) {
    try {
      const db = getControlDatabase();
      const hashedToRaw = new Map<string, string>();
      for (const rawKey of uniqueKeys) {
        hashedToRaw.set(hashBucketKey(rawKey), rawKey);
      }
      const hashes = Array.from(hashedToRaw.keys());
      const placeholders = hashes.map(() => "?").join(", ");
      const [rows] = await db.query<(RowDataPacket & { bucket_key: string; hits: number; reset_at: string | number })[]>(
        `SELECT bucket_key, hits, reset_at FROM rate_limits WHERE bucket_key IN (${placeholders})`,
        hashes,
      );
      for (const row of rows) {
        const rawKey = hashedToRaw.get(String(row.bucket_key));
        const resetAt = Number(row.reset_at);
        if (rawKey && resetAt > now) {
          result.set(rawKey, { count: Number(row.hits), resetAt });
        }
      }
      return result;
    } catch (error) {
      if (!warnedStoreFailure) {
        warnedStoreFailure = true;
        console.warn("AI guard DB read failed, using in-memory fallback.", error);
      }
    }
  }

  for (const rawKey of uniqueKeys) {
    const hashed = hashBucketKey(rawKey);
    const bucket = memoryBuckets.get(hashed);
    if (bucket && bucket.resetAt > now) {
      result.set(rawKey, { ...bucket });
    }
  }
  return result;
}

async function addBucketDelta(rawKey: string, delta: number, windowMs: number, now: number): Promise<Bucket> {
  const hashed = hashBucketKey(rawKey);
  const safeDelta = Math.max(0, Math.round(delta));
  const nextReset = now + windowMs;

  if (shouldUseDatabase()) {
    try {
      const db = getControlDatabase();
      const [rows] = await db.query<(RowDataPacket & { hits: number; reset_at: string | number })[]>(
        `INSERT INTO rate_limits (bucket_key, hits, reset_at) VALUES (?, ?, ?)
         ON CONFLICT (bucket_key) DO UPDATE SET
           hits = CASE WHEN rate_limits.reset_at <= ? THEN ? ELSE rate_limits.hits + ? END,
           reset_at = CASE WHEN rate_limits.reset_at <= ? THEN ? ELSE rate_limits.reset_at END
         RETURNING hits, reset_at`,
        [hashed, safeDelta, nextReset, now, safeDelta, safeDelta, now, nextReset],
      );
      if (now - lastCleanupAt > CLEANUP_INTERVAL_MS) {
        lastCleanupAt = now;
        void db
          .query("DELETE FROM rate_limits WHERE bucket_key IN (SELECT bucket_key FROM rate_limits WHERE reset_at < ? LIMIT 1000)", [now])
          .catch(() => undefined);
      }
      const row = rows[0];
      if (row) {
        return { count: Number(row.hits), resetAt: Number(row.reset_at) };
      }
    } catch (error) {
      if (!warnedStoreFailure) {
        warnedStoreFailure = true;
        console.warn("AI guard DB update failed, using in-memory fallback.", error);
      }
    }
  }

  const existing = memoryBuckets.get(hashed);
  if (!existing || existing.resetAt <= now) {
    if (existing) {
      memoryBuckets.delete(hashed);
    } else {
      pruneMemoryBuckets(now);
    }
    const fresh = { count: safeDelta, resetAt: nextReset };
    memoryBuckets.set(hashed, fresh);
    return { ...fresh };
  }
  existing.count += safeDelta;
  return { ...existing };
}

async function adjustBucketDelta(rawKey: string, delta: number, windowMs: number, now: number): Promise<Bucket> {
  const rounded = Math.round(delta);
  if (rounded >= 0) {
    return addBucketDelta(rawKey, rounded, windowMs, now);
  }

  const hashed = hashBucketKey(rawKey);
  const nextReset = now + windowMs;

  if (shouldUseDatabase()) {
    try {
      const db = getControlDatabase();
      const [rows] = await db.query<(RowDataPacket & { hits: number; reset_at: string | number })[]>(
        `UPDATE rate_limits
         SET hits = GREATEST(0, hits + ?)
         WHERE bucket_key = ? AND reset_at > ?
         RETURNING hits, reset_at`,
        [rounded, hashed, now],
      );
      const row = rows[0];
      if (row) {
        return { count: Number(row.hits), resetAt: Number(row.reset_at) };
      }
      return { count: 0, resetAt: nextReset };
    } catch (error) {
      if (!warnedStoreFailure) {
        warnedStoreFailure = true;
        console.warn("AI guard DB adjustment failed, using in-memory fallback.", error);
      }
    }
  }

  const existing = memoryBuckets.get(hashed);
  if (!existing || existing.resetAt <= now) {
    return { count: 0, resetAt: nextReset };
  }
  existing.count = Math.max(0, existing.count + rounded);
  return { ...existing };
}

async function setBlockBucket(rawKey: string, blockedUntil: number): Promise<void> {
  const hashed = hashBucketKey(rawKey);

  if (shouldUseDatabase()) {
    try {
      const db = getControlDatabase();
      await db.query(
        `INSERT INTO rate_limits (bucket_key, hits, reset_at) VALUES (?, 1, ?)
         ON CONFLICT (bucket_key) DO UPDATE SET
           hits = rate_limits.hits + 1,
           reset_at = GREATEST(rate_limits.reset_at, EXCLUDED.reset_at)`,
        [hashed, blockedUntil],
      );
      return;
    } catch (error) {
      if (!warnedStoreFailure) {
        warnedStoreFailure = true;
        console.warn("AI guard block write failed, using in-memory fallback.", error);
      }
    }
  }

  const existing = memoryBuckets.get(hashed);
  if (!existing) {
    pruneMemoryBuckets(Date.now());
  }
  memoryBuckets.set(hashed, {
    count: (existing?.count ?? 0) + 1,
    resetAt: Math.max(existing?.resetAt ?? 0, blockedUntil),
  });
}

function deviceBlockKeys(deviceKeys: string[]): string[] {
  return deviceKeys.map((key) => `ai-abuse-block:${key}`);
}

function deviceTokenKeys(deviceKeys: string[]): string[] {
  return deviceKeys.map((key) => `ai-tokens-device:${key}`);
}

function deviceStrikeKeys(deviceKeys: string[]): string[] {
  return deviceKeys.map((key) => `ai-abuse-strikes:${key}`);
}

function deviceOffTopicKeys(deviceKeys: string[]): string[] {
  return deviceKeys.map((key) => `ai-offtopic-strikes:${key}`);
}

function resolveIpTokenBucket(ip: string): { key: string; limit: number } {
  const knownIp = Boolean(ip && ip !== "unknown");
  if (knownIp) {
    return { key: `ai-tokens-ip:${ip}`, limit: getDailyIpTokenLimit() };
  }
  return { key: "ai-tokens-ip:unknown", limit: getDailyUnknownIpTokenLimit() };
}

function computeQuotaSnapshot(
  buckets: Map<string, Bucket>,
  deviceKeys: string[],
  ip: string,
  now: number,
): { quota: AiQuotaSnapshot; limitedBy?: "device" | "ip" } {
  const deviceLimit = getDailyDeviceTokenLimit();
  const ipTarget = resolveIpTokenBucket(ip);
  const ipLimit = ipTarget.limit;
  const defaultResetAt = now + AI_TOKEN_WINDOW_MS;

  let deviceUsed = 0;
  let deviceResetAt = defaultResetAt;
  for (const key of deviceTokenKeys(deviceKeys)) {
    const bucket = buckets.get(key);
    if (bucket && bucket.count > deviceUsed) {
      deviceUsed = bucket.count;
      deviceResetAt = bucket.resetAt;
    }
  }
  const deviceRemaining = Math.max(0, deviceLimit - deviceUsed);

  let ipUsed = 0;
  let ipResetAt = defaultResetAt;
  const ipBucket = buckets.get(ipTarget.key);
  if (ipBucket) {
    ipUsed = ipBucket.count;
    ipResetAt = ipBucket.resetAt;
  }
  const ipRemaining = Math.max(0, ipLimit - ipUsed);

  const ipRestricted = ipRemaining < deviceRemaining;
  const remaining = Math.max(0, Math.min(deviceRemaining, ipRemaining));

  if (remaining === 0) {
    return {
      quota: {
        used: ipRestricted ? ipUsed : deviceUsed,
        limit: ipRestricted ? ipLimit : deviceLimit,
        remaining: 0,
        resetAt: ipRestricted ? ipResetAt : deviceResetAt,
      },
      limitedBy: ipRestricted ? "ip" : "device",
    };
  }

  return {
    quota: {
      used: deviceUsed,
      limit: deviceLimit,
      remaining,
      resetAt: deviceUsed > 0 ? deviceResetAt : defaultResetAt,
    },
  };
}

/** Reads active 72h abuse lockout state and 24h device/IP token allowance without mutating counters. */
export async function getAiAccessStatus(input: {
  deviceKeys: string[];
  ip: string;
  now?: number;
}): Promise<AiAccessStatus> {
  const now = input.now ?? Date.now();
  const trackIpBan = Boolean(input.ip && input.ip !== "unknown");
  const ipTarget = resolveIpTokenBucket(input.ip);

  const blockKeys = [
    ...deviceBlockKeys(input.deviceKeys),
    ...(trackIpBan ? [`ai-abuse-ip-block:${input.ip}`] : []),
  ];
  const tokenKeys = [...deviceTokenKeys(input.deviceKeys), ipTarget.key];

  const buckets = await readBuckets([...blockKeys, ...tokenKeys], now);

  let maxBlockedUntil = 0;
  for (const key of blockKeys) {
    const bucket = buckets.get(key);
    if (bucket && bucket.resetAt > maxBlockedUntil) {
      maxBlockedUntil = bucket.resetAt;
    }
  }

  const { quota, limitedBy } = computeQuotaSnapshot(buckets, input.deviceKeys, input.ip, now);

  if (maxBlockedUntil > now) {
    return {
      blocked: true,
      blockedUntil: maxBlockedUntil,
      retryAfterSeconds: Math.max(1, Math.ceil((maxBlockedUntil - now) / 1000)),
      quota,
      limitedBy: undefined,
    };
  }

  return {
    blocked: false,
    blockedUntil: null,
    retryAfterSeconds: remainingRetrySeconds(quota, now),
    quota,
    ...(limitedBy ? { limitedBy } : {}),
  };
}

function remainingRetrySeconds(quota: AiQuotaSnapshot, now: number): number {
  if (quota.remaining > 0) return 0;
  return Math.max(1, Math.ceil((quota.resetAt - now) / 1000));
}

export type AiTokenReservation = {
  allowed: boolean;
  reservedTokens: number;
  retryAfterSeconds: number;
  quota: AiQuotaSnapshot;
  limitedBy?: "device" | "ip";
};

/**
 * Atomically reserves an estimated token budget BEFORE invoking an LLM so concurrent requests
 * cannot race past daily device/IP limits. Call `reconcileAiTokenUsage` after the LLM returns
 * (or with `actualTokens: 0` on failure) to settle the exact token spend.
 */
export async function reserveAiTokenBudget(input: {
  deviceKeys: string[];
  ip: string;
  estimatedTokens: number;
  now?: number;
}): Promise<AiTokenReservation> {
  const now = input.now ?? Date.now();
  const safeReserve = Math.max(1, Math.round(input.estimatedTokens));
  const deviceLimit = getDailyDeviceTokenLimit();
  const ipTarget = resolveIpTokenBucket(input.ip);

  const devKeys = deviceTokenKeys(input.deviceKeys);
  const updatedBuckets = new Map<string, Bucket>();

  const deviceWrites = await Promise.all(
    devKeys.map(async (key) => [key, await addBucketDelta(key, safeReserve, AI_TOKEN_WINDOW_MS, now)] as const),
  );
  for (const [key, bucket] of deviceWrites) {
    updatedBuckets.set(key, bucket);
  }
  const ipBucket = await addBucketDelta(ipTarget.key, safeReserve, AI_TOKEN_WINDOW_MS, now);
  updatedBuckets.set(ipTarget.key, ipBucket);

  const deviceExceededBefore = deviceWrites.some(([, bucket]) => bucket.count - safeReserve >= deviceLimit);
  const ipExceededBefore = ipBucket.count - safeReserve >= ipTarget.limit;

  if (deviceExceededBefore || ipExceededBefore) {
    // Refund the rejected reservation so counters stay accurate.
    const refundedBuckets = new Map<string, Bucket>();
    const refundedDev = await Promise.all(
      devKeys.map(async (key) => [key, await adjustBucketDelta(key, -safeReserve, AI_TOKEN_WINDOW_MS, now)] as const),
    );
    for (const [key, bucket] of refundedDev) {
      refundedBuckets.set(key, bucket);
    }
    refundedBuckets.set(ipTarget.key, await adjustBucketDelta(ipTarget.key, -safeReserve, AI_TOKEN_WINDOW_MS, now));
    const snapshot = computeQuotaSnapshot(refundedBuckets, input.deviceKeys, input.ip, now);
    return {
      allowed: false,
      reservedTokens: 0,
      retryAfterSeconds: Math.max(1, remainingRetrySeconds(snapshot.quota, now)),
      quota: snapshot.quota,
      limitedBy: snapshot.limitedBy ?? (ipExceededBefore ? "ip" : "device"),
    };
  }

  const snapshot = computeQuotaSnapshot(updatedBuckets, input.deviceKeys, input.ip, now);
  return {
    allowed: true,
    reservedTokens: safeReserve,
    retryAfterSeconds: 0,
    quota: snapshot.quota,
  };
}

/** Settles a pre-call token reservation against the actual LLM token usage (use 0 to release on error). */
export async function reconcileAiTokenUsage(input: {
  deviceKeys: string[];
  ip: string;
  reservedTokens: number;
  actualTokens: number;
  now?: number;
}): Promise<AiQuotaSnapshot> {
  const now = input.now ?? Date.now();
  const ipTarget = resolveIpTokenBucket(input.ip);
  const safeReserved = Math.max(0, Math.round(input.reservedTokens));
  const safeActual = Math.max(0, Math.round(input.actualTokens));
  const delta = safeActual - safeReserved;

  const devKeys = deviceTokenKeys(input.deviceKeys);
  if (delta === 0) {
    const buckets = await readBuckets([...devKeys, ipTarget.key], now);
    return computeQuotaSnapshot(buckets, input.deviceKeys, input.ip, now).quota;
  }

  const updatedBuckets = new Map<string, Bucket>();
  const deviceWrites = await Promise.all(
    devKeys.map(async (key) => [key, await adjustBucketDelta(key, delta, AI_TOKEN_WINDOW_MS, now)] as const),
  );
  for (const [key, bucket] of deviceWrites) {
    updatedBuckets.set(key, bucket);
  }
  updatedBuckets.set(ipTarget.key, await adjustBucketDelta(ipTarget.key, delta, AI_TOKEN_WINDOW_MS, now));

  return computeQuotaSnapshot(updatedBuckets, input.deviceKeys, input.ip, now).quota;
}

/** Records LLM tokens spent by this device and IP in a 24-hour sliding window. */
export async function recordAiTokenUsage(input: {
  deviceKeys: string[];
  ip: string;
  tokens: number;
  now?: number;
}): Promise<AiQuotaSnapshot> {
  const now = input.now ?? Date.now();
  const ipTarget = resolveIpTokenBucket(input.ip);
  const safeTokens = Math.max(1, Math.round(input.tokens));

  const updatedBuckets = new Map<string, Bucket>();
  const deviceWrites = await Promise.all(
    deviceTokenKeys(input.deviceKeys).map(async (key) => [key, await addBucketDelta(key, safeTokens, AI_TOKEN_WINDOW_MS, now)] as const),
  );
  for (const [key, bucket] of deviceWrites) {
    updatedBuckets.set(key, bucket);
  }

  updatedBuckets.set(ipTarget.key, await addBucketDelta(ipTarget.key, safeTokens, AI_TOKEN_WINDOW_MS, now));

  return computeQuotaSnapshot(updatedBuckets, input.deviceKeys, input.ip, now).quota;
}

/**
 * Records an abusive interaction or jailbreak attempt.
 * Immediate blocks or 2+ strikes within 24h lock the device IDs for 72 hours (plus the IP after 3 distinct blocked devices).
 */
export async function recordAiAbuseEvent(input: {
  deviceKeys: string[];
  ip: string;
  immediateBlock: boolean;
  reason: string;
  now?: number;
}): Promise<{
  blocked: boolean;
  blockedUntil: number | null;
  retryAfterSeconds: number;
  strikes: number;
  strikesRemaining: number;
}> {
  const now = input.now ?? Date.now();
  const trackIp = Boolean(input.ip && input.ip !== "unknown");
  const existingBlocks = await readBuckets(deviceBlockKeys(input.deviceKeys), now);
  const alreadyBlocked = deviceBlockKeys(input.deviceKeys).some((key) => (existingBlocks.get(key)?.resetAt ?? 0) > now);

  const strikeResults = await Promise.all(
    deviceStrikeKeys(input.deviceKeys).map((key) => addBucketDelta(key, 1, AI_STRIKE_WINDOW_MS, now)),
  );
  const strikes = Math.max(...strikeResults.map((b) => b.count), 1);

  if (input.immediateBlock || strikes >= ABUSE_STRIKES_TO_BLOCK) {
    const blockedUntil = now + AI_ABUSE_BLOCK_DURATION_MS;
    await Promise.all(deviceBlockKeys(input.deviceKeys).map((key) => setBlockBucket(key, blockedUntil)));

    if (trackIp && !alreadyBlocked) {
      const ipBlocks = await addBucketDelta(`ai-abuse-ip-strikes:${input.ip}`, 1, AI_ABUSE_BLOCK_DURATION_MS, now);
      if (ipBlocks.count >= IP_DEVICE_BLOCKS_FOR_IP_BAN) {
        await setBlockBucket(`ai-abuse-ip-block:${input.ip}`, blockedUntil);
      }
    }

    const primaryHashPrefix = input.deviceKeys[0]
      ? hashBucketKey(input.deviceKeys[0]).slice(0, 8)
      : "unknown";
    void notifyOperationalIssue({
      key: `ai-abuse-block:${primaryHashPrefix}`,
      title: "AI assistant device blocked for abuse (72h)",
      summary: `Blocked a device for 72 hours due to ${input.reason}.`,
      source: "/api/health-assistant",
      severity: "warning",
      details: {
        reason: input.reason,
        deviceHash: primaryHashPrefix,
        strikes: String(strikes),
      },
      cooldownMs: 15 * 60_000,
    });

    return {
      blocked: true,
      blockedUntil,
      retryAfterSeconds: Math.ceil(AI_ABUSE_BLOCK_DURATION_MS / 1000),
      strikes,
      strikesRemaining: 0,
    };
  }

  return {
    blocked: false,
    blockedUntil: null,
    retryAfterSeconds: 0,
    strikes,
    strikesRemaining: Math.max(1, ABUSE_STRIKES_TO_BLOCK - strikes),
  };
}

/** Tracks repeated off-topic spam per device, escalating after warnings to a 72-hour lockout. */
export async function recordOffTopicStrike(input: {
  deviceKeys: string[];
  ip: string;
  now?: number;
}): Promise<
  | { outcome: "polite" }
  | { outcome: "warn"; strikesRemaining: number }
  | { outcome: "blocked"; blockedUntil: number; retryAfterSeconds: number }
> {
  const now = input.now ?? Date.now();
  const counts = await Promise.all(
    deviceOffTopicKeys(input.deviceKeys).map((key) => addBucketDelta(key, 1, AI_STRIKE_WINDOW_MS, now)),
  );
  const maxStrikes = Math.max(...counts.map((b) => b.count), 1);

  if (maxStrikes >= OFF_TOPIC_STRIKES_TO_BLOCK) {
    const blocked = await recordAiAbuseEvent({
      deviceKeys: input.deviceKeys,
      ip: input.ip,
      immediateBlock: true,
      reason: "repeated_off_topic",
      now,
    });
    return {
      outcome: "blocked",
      blockedUntil: blocked.blockedUntil ?? now + AI_ABUSE_BLOCK_DURATION_MS,
      retryAfterSeconds: blocked.retryAfterSeconds,
    };
  }

  if (maxStrikes >= OFF_TOPIC_STRIKES_TO_WARN) {
    return {
      outcome: "warn",
      strikesRemaining: Math.max(1, OFF_TOPIC_STRIKES_TO_BLOCK - maxStrikes),
    };
  }

  return { outcome: "polite" };
}

export function _resetAiGuardMemoryForTest(): void {
  memoryBuckets.clear();
  lastCleanupAt = 0;
  warnedStoreFailure = false;
}
