/**
 * After a new deployment, a tab that still runs the previous version asks for code files
 * ("chunks") that the new deployment no longer has, and the page breaks with a ChunkLoadError.
 * Reloading once fetches the new version. A short guard in sessionStorage prevents a reload
 * loop when a chunk is genuinely missing; the error is then shown and reported as usual.
 */

const RELOAD_KEY = "redihealth-chunk-reload-at";
const RELOAD_GUARD_MS = 30_000;

const CHUNK_ERROR =
  /ChunkLoadError|Loading chunk [\w-]+ failed|Failed to load chunk|Loading CSS chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === "string") return CHUNK_ERROR.test(error);
  if (error instanceof Error) return error.name === "ChunkLoadError" || CHUNK_ERROR.test(`${error.name}: ${error.message}`);
  if (typeof error === "object" && "message" in error) return CHUNK_ERROR.test(String((error as { message: unknown }).message));
  return false;
}

function claimReloadAttempt(now: number): boolean {
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0);
    if (now - last < RELOAD_GUARD_MS) return false;
    window.sessionStorage.setItem(RELOAD_KEY, String(now));
  } catch {
    // Storage blocked (private mode): without a guard, do not risk a reload loop.
    return false;
  }
  return true;
}

/** Reloads the page for a chunk error, at most once per 30 seconds. Returns true when it reloads. */
export function reloadForNewVersion(error: unknown, now = Date.now()): boolean {
  if (typeof window === "undefined" || !isChunkLoadError(error) || !claimReloadAttempt(now)) return false;
  window.location.reload();
  return true;
}

/** A truncated cached app script needs a fresh download; a plain reload would serve the same bytes. */
export async function reloadForTruncatedChunk(error: unknown, filename: string, now = Date.now()): Promise<boolean> {
  if (typeof window === "undefined" || !filename) return false;
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (!/^(?:Uncaught )?SyntaxError: (?:Unexpected end of input|Unexpected EOF)$/i.test(message)) return false;

  try {
    const source = new URL(filename, window.location.href);
    if (source.origin !== window.location.origin || !source.pathname.startsWith("/_next/static/") || !source.pathname.endsWith(".js")) return false;
    if (!claimReloadAttempt(now)) return false;
    // An older active worker may not yet honor reload requests. Evict only the broken static
    // file (including query variants), leaving saved guides, pages and offline data intact.
    if (window.caches) {
      const names = await window.caches.keys();
      await Promise.all(names.filter((name) => name.startsWith("redihealth-static-")).map(async (name) => {
        const cache = await window.caches.open(name);
        await cache.delete(source.href, { ignoreSearch: true });
      }));
    }
    // The service worker also honors cache: reload, replacing all cached query variants.
    const response = await fetch(source.href, { cache: "reload", credentials: "same-origin", signal: AbortSignal.timeout(10_000) });
    if (!response.ok || !/^(?:application|text)\/javascript\b/i.test(response.headers.get("content-type") || "")) return false;
    if (!(await response.text()).trim()) return false;
    window.location.reload();
    return true;
  } catch {
    // Missing, unreadable or offline scripts remain reportable. Never reload without a guard.
    return false;
  }
}
