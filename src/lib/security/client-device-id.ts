const CLIENT_DEVICE_KEY = "redihealth:ai-device:v1";
const CACHED_BLOCK_UNTIL_KEY = "redihealth:ai-blocked-until:v1";
const CLIENT_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

let memoryDeviceId: string | null = null;

function createOpaqueDeviceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`.padEnd(20, "0").slice(0, 32);
}

/**
 * Returns a persistent browser-scoped device identifier for AI rate limiting.
 * Degrades cleanly to an in-memory per-tab ID when localStorage is unavailable.
 */
export function getOrCreateClientDeviceId(): string {
  if (typeof window === "undefined") {
    if (!memoryDeviceId) memoryDeviceId = createOpaqueDeviceId();
    return memoryDeviceId;
  }

  try {
    const existing = window.localStorage.getItem(CLIENT_DEVICE_KEY)?.trim();
    if (existing && CLIENT_ID_PATTERN.test(existing)) {
      memoryDeviceId = existing;
      return existing;
    }
    const created = memoryDeviceId ?? createOpaqueDeviceId();
    memoryDeviceId = created;
    window.localStorage.setItem(CLIENT_DEVICE_KEY, created);
    return created;
  } catch {
    if (!memoryDeviceId) memoryDeviceId = createOpaqueDeviceId();
    return memoryDeviceId;
  }
}

export function readCachedAiBlockUntil(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHED_BLOCK_UNTIL_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function writeCachedAiBlockUntil(blockedUntil: number | null): void {
  if (typeof window === "undefined") return;
  try {
    if (blockedUntil === null || !Number.isFinite(blockedUntil) || blockedUntil <= 0) {
      window.localStorage.removeItem(CACHED_BLOCK_UNTIL_KEY);
    } else {
      window.localStorage.setItem(CACHED_BLOCK_UNTIL_KEY, String(Math.round(blockedUntil)));
    }
  } catch {
    // Ignore storage failures in restricted browsing contexts.
  }
}
