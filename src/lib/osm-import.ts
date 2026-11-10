import type { ResultSetHeader, RowDataPacket } from "@/lib/database";
import {
  normalizeInstitutePhone,
  normalizeInstituteWebsite,
  type CountryCode,
  type InstituteCategory,
} from "@/lib/medical-institutes";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const MAX_OVERPASS_ATTEMPTS = 12;

const USER_AGENT = "RediHealth/1.0 (medical institutes import)";

type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export type OsmInstituteRow = {
  osm_ref: string;
  country_code: CountryCode;
  name: string;
  category: InstituteCategory;
  address: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  emergency: boolean;
  lat: number;
  lng: number;
};

export type OsmImportResult = {
  country: CountryCode;
  imported: number;
};

const CATEGORY_QUERIES: { category: InstituteCategory; selectors: string[] }[] = [
  { category: "hospital", selectors: ['["amenity"="hospital"]', '["healthcare"="hospital"]'] },
  { category: "clinic", selectors: ['["amenity"="clinic"]', '["healthcare"~"^(clinic|centre)$"]'] },
  { category: "gp", selectors: ['["amenity"="doctors"]', '["healthcare"="doctor"]'] },
  { category: "dentist", selectors: ['["amenity"="dentist"]', '["healthcare"="dentist"]'] },
  { category: "pharmacy", selectors: ['["amenity"="pharmacy"]', '["healthcare"="pharmacy"]'] },
];

const COUNTRY_OSM_LANG: Record<CountryCode, string> = {
  RO: "ro",
  MD: "ro",
  AL: "sq",
  IT: "it",
  HR: "hr",
};

const NON_MEDICAL_SHOPS = new Set([
  "agrarian",
  "pet",
  "optician",
  "beauty",
  "cosmetics",
  "hairdresser",
  "massage",
  "tattoo",
  "e-cigarette",
  "tobacco",
  "coffee",
]);

const EXCLUDED_NAME_RE =
  /\b(veterinar[aăeiăo]?|veterinarsk[aieo]|veterinary|farmaci\s+bujq[eë]sore|poljoprivredna\s+ljekarna|fitofarmaci[ae]?|pet\s*shop|wellness\s*&\s*spa|kozmeti[čc]ki\s+salon|caffe\s+bar|cafe\s+bar|juice\s*box|vape\s*shop)\b/i;

const PLACEHOLDER_NAME_RE = /^(healthcare\s+facility|medical\s+facility|public)$/i;

const DENTAL_NAME_RE = /\b(dental|dentist|stomatolo[gšs]|klinik[eë]\s+dentare)\b/i;
const HOSPITAL_NAME_RE = /\b(spital|bolnica|ospedale|klini[čc]ki\s+bolni[čc]ki|chirurgie\s+oro)\b/i;
const EMERGENCY_NAME_RE = /\b(hitna\s+pomo[ćc]|zavod\s+za\s+hitnu\s+medicinu)\b/i;

function firstValue(value: string | undefined, maxLength: number): string | null {
  if (!value) return null;
  const first = value.split(";")[0]?.trim().replace(/\s+/g, " ");
  return first ? first.slice(0, maxLength) : null;
}

export function isExcludedOsmTags(tags: Record<string, string>): boolean {
  if (
    tags.disused === "yes" ||
    tags.abandoned === "yes" ||
    tags.ruins === "yes" ||
    tags.demolished === "yes" ||
    Boolean(tags["disused:amenity"]) ||
    Boolean(tags["disused:healthcare"]) ||
    Boolean(tags["abandoned:amenity"]) ||
    Boolean(tags["abandoned:healthcare"]) ||
    Boolean(tags["construction:amenity"]) ||
    Boolean(tags["proposed:amenity"])
  ) {
    return true;
  }
  if (
    tags.amenity === "veterinary" ||
    tags.healthcare === "veterinary" ||
    tags.veterinary === "yes" ||
    tags.dispensing === "veterinary" ||
    tags.healthcare === "optometrist" ||
    tags.healthcare === "tanning"
  ) {
    return true;
  }
  if (tags.shop && NON_MEDICAL_SHOPS.has(tags.shop.toLowerCase())) {
    return true;
  }
  return false;
}

export function isInvalidInstituteName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2) return true;
  if (/^\d+$/.test(trimmed)) return true;
  if (/^[a-zA-Z]{1,2}$/.test(trimmed)) return true;
  if (PLACEHOLDER_NAME_RE.test(trimmed)) return true;
  if (EXCLUDED_NAME_RE.test(trimmed)) return true;
  return false;
}

function categoryFromTags(
  tags: Record<string, string>,
  name: string,
  fallback: InstituteCategory,
): InstituteCategory {
  const amenity = tags.amenity;
  const healthcare = tags.healthcare;
  if (amenity === "pharmacy" || healthcare === "pharmacy") return "pharmacy";
  if (amenity === "dentist" || healthcare === "dentist") return "dentist";
  if (DENTAL_NAME_RE.test(name) && !HOSPITAL_NAME_RE.test(name)) return "dentist";
  if (amenity === "doctors" || healthcare === "doctor") return "gp";
  if (amenity === "hospital" || healthcare === "hospital") return "hospital";
  if (
    amenity === "clinic" ||
    healthcare === "clinic" ||
    healthcare === "centre" ||
    healthcare === "laboratory" ||
    healthcare === "rehabilitation"
  ) {
    return "clinic";
  }
  return fallback === "other" ? "clinic" : fallback;
}

function cleanOsmWebsite(raw: string | null): string | null {
  if (!raw) return null;
  const compact = raw.trim().replace(/^(https?:\/\/)\s+/i, "$1");
  const normalized = normalizeInstituteWebsite(compact);
  if (!normalized) return null;
  const withProtocol = /^https?:\/\//i.test(compact) ? compact : `https://${compact}`;
  return withProtocol.length <= 500 ? withProtocol : normalized.slice(0, 500);
}

/** Converts a raw OpenStreetMap element into a row for `medical_institutes`. Returns null for unusable elements. */
export function mapOsmElement(
  element: OsmElement,
  country: CountryCode,
  fallbackCategory: InstituteCategory,
): OsmInstituteRow | null {
  const tags = element.tags ?? {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat == null || lng == null) return null;
  if (isExcludedOsmTags(tags)) return null;

  const osmLang = COUNTRY_OSM_LANG[country];
  const candidates = [
    firstValue(tags.name, 255),
    firstValue(tags[`name:${osmLang}`], 255),
    firstValue(tags[`name:${country.toLowerCase()}`], 255),
    firstValue(tags.official_name, 255),
    firstValue(tags.short_name, 255),
    firstValue(tags.brand, 255),
    firstValue(tags.operator, 255),
  ];
  const name = candidates.find((candidate): candidate is string => Boolean(candidate && !isInvalidInstituteName(candidate)));
  if (!name) return null;

  const streetName = tags["addr:street"] || tags["addr:place"] || tags["contact:street"];
  const houseNumber = tags["addr:housenumber"] || tags["contact:housenumber"];
  const street = [streetName, houseNumber].filter(Boolean).join(" ").trim();
  const city =
    firstValue(tags["addr:city"], 160) ||
    firstValue(tags["contact:city"], 160) ||
    firstValue(tags["addr:town"], 160) ||
    firstValue(tags["addr:village"], 160) ||
    firstValue(tags["addr:municipality"], 160) ||
    firstValue(tags["addr:suburb"], 160) ||
    firstValue(tags["addr:hamlet"], 160);
  const address = firstValue(tags["addr:full"], 500) || (street ? street.slice(0, 500) : null);

  const category = categoryFromTags(tags, name, fallbackCategory);

  return {
    osm_ref: `${element.type}/${element.id}`,
    country_code: country,
    name,
    category,
    address,
    city,
    phone: normalizeInstitutePhone(
      firstValue(tags.phone || tags["contact:phone"] || tags["contact:mobile"] || tags.mobile, 120),
      country,
    ),
    website: cleanOsmWebsite(firstValue(tags.website || tags["contact:website"] || tags.url, 500)),
    hours: firstValue(tags.opening_hours, 255),
    emergency:
      tags.emergency === "yes" ||
      tags["healthcare:speciality"]?.includes("emergency") === true ||
      EMERGENCY_NAME_RE.test(name),
    lat: Math.round(lat * 1e6) / 1e6,
    lng: Math.round(lng * 1e6) / 1e6,
  };
}

function rowCompletenessScore(row: OsmInstituteRow): number {
  let score = row.osm_ref.startsWith("node/") ? 0 : 2;
  if (row.address) score += 2;
  if (row.city) score += 1;
  if (row.phone) score += 2;
  if (row.website) score += 1;
  if (row.hours) score += 1;
  if (row.emergency) score += 1;
  return score;
}

/**
 * OpenStreetMap often maps the same hospital or pharmacy twice: once as a building `way` and once
 * as a POI `node` inside it. Collapse co-located (~75m) entries with the same category and name,
 * merging any missing contact fields onto the primary entry.
 */
export function deduplicateOsmRows(rows: OsmInstituteRow[]): OsmInstituteRow[] {
  const buckets = new Map<string, OsmInstituteRow[]>();
  for (const row of rows) {
    const key = `${row.country_code}|${row.category}|${row.name.trim().toLowerCase()}`;
    const group = buckets.get(key);
    if (!group) {
      buckets.set(key, [row]);
      continue;
    }
    const existingIndex = group.findIndex(
      (candidate) => Math.abs(candidate.lat - row.lat) < 0.0007 && Math.abs(candidate.lng - row.lng) < 0.0007,
    );
    if (existingIndex === -1) {
      group.push(row);
      continue;
    }
    const existing = group[existingIndex]!;
    const [primary, secondary] =
      rowCompletenessScore(row) > rowCompletenessScore(existing) ? [row, existing] : [existing, row];
    group[existingIndex] = {
      ...primary,
      address: primary.address ?? secondary.address,
      city: primary.city ?? secondary.city,
      phone: primary.phone ?? secondary.phone,
      website: primary.website ?? secondary.website,
      hours: primary.hours ?? secondary.hours,
      emergency: primary.emergency || secondary.emergency,
    };
  }
  return [...buckets.values()].flat();
}

async function runOverpassQuery(query: string): Promise<OsmElement[]> {
  let lastError: unknown = null;
  // Public Overpass servers fail intermittently under load, so rotate mirrors on every attempt.
  for (let attempt = 0; attempt < MAX_OVERPASS_ATTEMPTS; attempt += 1) {
    const endpoint = OVERPASS_ENDPOINTS[attempt % OVERPASS_ENDPOINTS.length];
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(30_000, 3_000 * attempt)));
    }
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(300_000),
      });
      if (!response.ok) {
        throw new Error(`Overpass (${endpoint}) responded with ${response.status}`);
      }
      const data = (await response.json()) as { elements?: OsmElement[] };
      return Array.isArray(data.elements) ? data.elements : [];
    } catch (error) {
      lastError = error;
      console.warn(`Overpass attempt ${attempt + 1} failed:`, error instanceof Error ? error.message : error);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Overpass request failed.");
}

export async function fetchOsmInstitutes(country: CountryCode): Promise<OsmInstituteRow[]> {
  const rows = new Map<string, OsmInstituteRow>();

  for (const [index, { category, selectors }] of CATEGORY_QUERIES.entries()) {
    // Be gentle with the free public Overpass servers.
    if (index > 0) await new Promise((resolve) => setTimeout(resolve, 3_000));
    const query = `[out:json][timeout:280];area["ISO3166-1"="${country}"][admin_level=2]->.a;(${selectors
      .map((selector) => `nwr${selector}(area.a);`)
      .join("")});out center tags;`;
    const elements = await runOverpassQuery(query);
    for (const element of elements) {
      const row = mapOsmElement(element, country, category);
      if (row && !rows.has(row.osm_ref)) rows.set(row.osm_ref, row);
    }
  }

  return deduplicateOsmRows([...rows.values()]);
}

type Queryable = {
  query<T extends RowDataPacket[] | ResultSetHeader>(sql: string, params?: unknown[]): Promise<[T, undefined]>;
};

const UPSERT_COLUMNS = [
  "osm_ref",
  "country_code",
  "name",
  "category",
  "address",
  "city",
  "phone",
  "website",
  "hours",
  "emergency",
  "lat",
  "lng",
] as const;

/** Inserts or refreshes OSM rows. Rows a super admin edited by hand (manually_edited = 1) are left untouched. */
export async function upsertOsmInstitutes(db: Queryable, rows: OsmInstituteRow[], batchSize = 500) {
  let affected = 0;
  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const placeholders = batch.map(() => `(${UPSERT_COLUMNS.map(() => "?").join(", ")}, 'osm')`).join(", ");
    const params = batch.flatMap((row) => [
      row.osm_ref,
      row.country_code,
      row.name,
      row.category,
      row.address,
      row.city,
      row.phone,
      row.website,
      row.hours,
      row.emergency ? 1 : 0,
      row.lat,
      row.lng,
    ]);
    const updates = UPSERT_COLUMNS.filter((column) => column !== "osm_ref")
      .map((column) => `${column} = IF(manually_edited = 1, ${column}, VALUES(${column}))`)
      .join(", ");

    await db.query<ResultSetHeader>(
      `INSERT INTO medical_institutes (${UPSERT_COLUMNS.join(", ")}, source)
       VALUES ${placeholders}
       ON DUPLICATE KEY UPDATE ${updates}`,
      params,
    );
    affected += batch.length;
  }
  return affected;
}

export async function importCountryFromOsm(db: Queryable, country: CountryCode): Promise<OsmImportResult> {
  const rows = await fetchOsmInstitutes(country);
  const imported = await upsertOsmInstitutes(db, rows);
  return { country, imported };
}
