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

/** Reloads the page for a chunk error, at most once per 30 seconds. Returns true when it reloads. */
export function reloadForNewVersion(error: unknown, now = Date.now()): boolean {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return false;
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0);
    if (now - last < RELOAD_GUARD_MS) return false;
    window.sessionStorage.setItem(RELOAD_KEY, String(now));
  } catch {
    // Storage blocked (private mode): without a guard, do not risk a reload loop.
    return false;
  }
  window.location.reload();
  return true;
}
