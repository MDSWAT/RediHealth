/**
 * Guides the reader saved on this phone. The list is kept by the service worker inside the
 * guides cache and holds only the address, the title and the language of each saved page.
 */

export const GUIDES_CACHE_NAME = "redihealth-guides-v1";
export const SAVED_GUIDES_INDEX_KEY = "/__saved-guides.json";
export const SAVED_GUIDES_EVENT = "redihealth:saved-guides-changed";

export const GUIDE_ROUTE_REGEX = /^(\/(ro|en|sq|it|hr|rom|ru))?\/health-information(\/|$)/;

const SAVED_GUIDES_LIMIT = 60;

export interface SavedGuide {
  path: string;
  title: string;
  lang: string;
}

function isSavedGuide(value: unknown): value is SavedGuide {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.path === "string" &&
    typeof item.title === "string" &&
    typeof item.lang === "string" &&
    GUIDE_ROUTE_REGEX.test(item.path)
  );
}

/** Newest first. Empty when nothing is saved or the browser has no cache storage. */
export async function readSavedGuides(): Promise<SavedGuide[]> {
  if (typeof window === "undefined" || !("caches" in window)) return [];
  try {
    const cache = await window.caches.open(GUIDES_CACHE_NAME);
    const stored = await cache.match(SAVED_GUIDES_INDEX_KEY);
    if (!stored) return [];
    const list: unknown = JSON.parse(await stored.text());
    return Array.isArray(list) ? list.filter(isSavedGuide) : [];
  } catch {
    return [];
  }
}

/** Used only when the page had to save itself without the service worker. */
export async function addSavedGuide(guide: SavedGuide): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;
  const others = (await readSavedGuides()).filter((item) => item.path !== guide.path);
  const list = [guide, ...others].slice(0, SAVED_GUIDES_LIMIT);
  const cache = await window.caches.open(GUIDES_CACHE_NAME);
  await cache.put(
    SAVED_GUIDES_INDEX_KEY,
    new Response(JSON.stringify(list), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }),
  );
}

export function announceSavedGuidesChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SAVED_GUIDES_EVENT));
}
