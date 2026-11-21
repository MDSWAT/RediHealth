import type { InstituteOwnership } from "@/lib/institute-ownership";
import {
  SUPPORTED_COUNTRIES,
  isInstituteCategory,
  isSupportedCountry,
  type CountryCode,
  type InstituteCategory,
  type MedicalInstitute,
} from "@/lib/medical-institutes";

const DIRECTORY_STORAGE_PREFIX = "redihealth.findHelpDirectory.v2:";
const WARM_TIMESTAMP_PREFIX = "redihealth.findHelpWarmAt.v1:";
export const OFFLINE_INSTITUTES_LIMIT = 400;
const WARM_TTL_MS = 24 * 60 * 60 * 1000;

const inflightCountryWarms = new Set<CountryCode>();

type StoredDirectoryPayload = {
  savedAt: number;
  rows: MedicalInstitute[];
};

function directoryStorageKey(country: CountryCode): string {
  return `${DIRECTORY_STORAGE_PREFIX}${country}`;
}

function warmTimestampKey(country: CountryCode): string {
  return `${WARM_TIMESTAMP_PREFIX}${country}`;
}

function cleanOptionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeOwnership(value: unknown): InstituteOwnership | null {
  return value === "public" || value === "private" ? value : null;
}

function sanitizeInstituteRow(
  raw: unknown,
  fallbackCountry: CountryCode,
): MedicalInstitute | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<MedicalInstitute>;
  if (
    typeof row.name !== "string" ||
    !row.name.trim() ||
    !isInstituteCategory(row.category) ||
    typeof row.lat !== "number" ||
    typeof row.lng !== "number" ||
    !Number.isFinite(row.lat) ||
    !Number.isFinite(row.lng)
  ) {
    return null;
  }

  const countryCode = isSupportedCountry(row.country_code)
    ? row.country_code
    : fallbackCountry;

  const fallbackId = `offline-${countryCode}-${row.lat.toFixed(4)}-${row.lng.toFixed(4)}-${row.name.slice(0, 24)}`;
  const id =
    typeof row.id === "string" && row.id.trim() ? row.id.trim() : fallbackId;

  return {
    id,
    country_code: countryCode,
    name: row.name.trim(),
    category: row.category,
    ownership: normalizeOwnership(row.ownership),
    address: cleanOptionalText(row.address),
    city: cleanOptionalText(row.city),
    phone: cleanOptionalText(row.phone),
    website: cleanOptionalText(row.website),
    hours: cleanOptionalText(row.hours),
    emergency: row.emergency === true,
    lat: row.lat,
    lng: row.lng,
    distance_km: null,
  };
}

function readCountryStorage(country: CountryCode): StoredDirectoryPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(directoryStorageKey(country));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: unknown; rows?: unknown };
    if (typeof parsed.savedAt !== "number" || !Array.isArray(parsed.rows)) {
      return null;
    }
    const rows: MedicalInstitute[] = [];
    for (const item of parsed.rows) {
      const clean = sanitizeInstituteRow(item, country);
      if (clean) rows.push(clean);
    }
    return rows.length > 0 ? { savedAt: parsed.savedAt, rows } : null;
  } catch {
    return null;
  }
}

function dedupeKey(item: MedicalInstitute): string {
  if (item.id && !item.id.startsWith("saved-") && !item.id.startsWith("offline-")) {
    return `id:${item.id}`;
  }
  return `geo:${item.name.toLowerCase()}|${item.lat.toFixed(4)}|${item.lng.toFixed(4)}`;
}

/**
 * Persists medical institute records into a per-country offline cache (up to 400 rows/country).
 */
export function saveOfflineInstitutes(
  country: CountryCode,
  incoming: MedicalInstitute[],
): void {
  if (typeof window === "undefined" || !Array.isArray(incoming) || incoming.length === 0) {
    return;
  }
  try {
    const existing = readCountryStorage(country)?.rows ?? [];
    const seen = new Set<string>();
    const merged: MedicalInstitute[] = [];

    for (const raw of incoming) {
      const clean = sanitizeInstituteRow(raw, country);
      if (!clean) continue;
      const targetCountry = clean.country_code;
      if (targetCountry !== country) continue;
      const key = dedupeKey(clean);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(clean);
      if (merged.length >= OFFLINE_INSTITUTES_LIMIT) break;
    }

    if (merged.length < OFFLINE_INSTITUTES_LIMIT) {
      for (const oldRow of existing) {
        const key = dedupeKey(oldRow);
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(oldRow);
        if (merged.length >= OFFLINE_INSTITUTES_LIMIT) break;
      }
    }

    if (merged.length === 0) return;

    const payload: StoredDirectoryPayload = {
      savedAt: Date.now(),
      rows: merged,
    };
    window.localStorage.setItem(directoryStorageKey(country), JSON.stringify(payload));
  } catch {
    // Ignore quota or restricted-storage errors silently.
  }
}

function normalizeSearchToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase()
    .trim();
}

export function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export interface OfflineInstitutesQuery {
  country: CountryCode | null;
  point?: { lat: number; lng: number } | null;
  category?: InstituteCategory | null;
  search?: string;
}

export interface OfflineInstitutesResult {
  savedAt: number;
  totalStored: number;
  rows: MedicalInstitute[];
}

/**
 * Queries cached medical institutes offline with category filtering, text search, and distance sorting.
 */
export function queryOfflineInstitutes(
  options: OfflineInstitutesQuery,
): OfflineInstitutesResult | null {
  if (typeof window === "undefined") return null;

  const countriesToCheck: readonly CountryCode[] = options.country
    ? [options.country]
    : SUPPORTED_COUNTRIES;

  let latestSavedAt = 0;
  const pool: MedicalInstitute[] = [];
  const seen = new Set<string>();

  for (const code of countriesToCheck) {
    const stored = readCountryStorage(code);
    if (!stored) continue;
    if (stored.savedAt > latestSavedAt) latestSavedAt = stored.savedAt;
    for (const row of stored.rows) {
      const key = dedupeKey(row);
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push(row);
    }
  }

  if (pool.length === 0) return null;

  const normalizedSearch = options.search ? normalizeSearchToken(options.search) : "";
  const filtered = pool.filter((item) => {
    if (options.category && item.category !== options.category) return false;
    if (normalizedSearch) {
      const haystack = normalizeSearchToken(
        [item.name, item.address ?? "", item.city ?? ""].join(" "),
      );
      if (!haystack.includes(normalizedSearch)) return false;
    }
    return true;
  });

  if (options.point && Number.isFinite(options.point.lat) && Number.isFinite(options.point.lng)) {
    const point = options.point;
    const withDistances = filtered.map((item) => ({
      ...item,
      distance_km: Math.round(haversineDistanceKm(point, item) * 10) / 10,
    }));
    withDistances.sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
    return { savedAt: latestSavedAt, totalStored: pool.length, rows: withDistances };
  }

  return { savedAt: latestSavedAt, totalStored: pool.length, rows: filtered };
}

type NetworkConnectionLike = { saveData?: boolean; effectiveType?: string };

/**
 * Silently warms page 0 of the country's institute directory once per 24 hours when online.
 */
export async function warmCountryInstitutes(country: CountryCode): Promise<void> {
  if (typeof window === "undefined") return;
  if (typeof navigator !== "undefined") {
    if (navigator.onLine === false) return;
    const conn = (navigator as Navigator & { connection?: NetworkConnectionLike }).connection;
    if (conn?.saveData || conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") {
      return;
    }
  }
  if (inflightCountryWarms.has(country)) return;

  try {
    const rawTimestamp = window.localStorage.getItem(warmTimestampKey(country));
    const lastWarm = rawTimestamp ? Number(rawTimestamp) : 0;
    if (Number.isFinite(lastWarm) && lastWarm > 0 && Date.now() - lastWarm < WARM_TTL_MS) {
      return;
    }
  } catch {
    // Continue if localStorage read fails; saveOfflineInstitutes handles storage safely.
  }

  inflightCountryWarms.add(country);
  try {
    const response = await fetch(`/api/medical-institutes?country=${encodeURIComponent(country)}&page=0`, {
      credentials: "omit",
    });
    if (!response.ok) return;
    const payload = (await response.json()) as { institutes?: unknown };
    if (!Array.isArray(payload.institutes)) return;
    saveOfflineInstitutes(country, payload.institutes as MedicalInstitute[]);
    try {
      window.localStorage.setItem(warmTimestampKey(country), String(Date.now()));
    } catch {
      // Ignore storage write failures.
    }
  } catch {
    // Ignore background network warm errors.
  } finally {
    inflightCountryWarms.delete(country);
  }
}
