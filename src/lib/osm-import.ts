import type { ResultSetHeader, RowDataPacket } from "@/lib/database";
import type { CountryCode, InstituteCategory } from "@/lib/medical-institutes";

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

function firstValue(value: string | undefined, maxLength: number): string | null {
  if (!value) return null;
  const first = value.split(";")[0]?.trim().replace(/\s+/g, " ");
  return first ? first.slice(0, maxLength) : null;
}

function categoryFromTags(tags: Record<string, string>, fallback: InstituteCategory): InstituteCategory {
  const amenity = tags.amenity;
  const healthcare = tags.healthcare;
  if (amenity === "hospital" || healthcare === "hospital") return "hospital";
  if (amenity === "pharmacy" || healthcare === "pharmacy") return "pharmacy";
  if (amenity === "dentist" || healthcare === "dentist") return "dentist";
  if (amenity === "doctors" || healthcare === "doctor") return "gp";
  if (amenity === "clinic" || healthcare === "clinic" || healthcare === "centre") return "clinic";
  return fallback;
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
  if (tags.disused === "yes" || tags["disused:amenity"] || tags.abandoned === "yes") return null;

  const name =
    firstValue(tags.name, 255) ||
    firstValue(tags[`name:${country.toLowerCase()}`], 255) ||
    firstValue(tags.official_name, 255) ||
    firstValue(tags.operator, 255);
  if (!name) return null;

  const street = [tags["addr:street"] || tags["addr:place"], tags["addr:housenumber"]]
    .filter(Boolean)
    .join(" ")
    .trim();
  const city =
    firstValue(tags["addr:city"], 160) ||
    firstValue(tags["addr:town"], 160) ||
    firstValue(tags["addr:village"], 160) ||
    firstValue(tags["addr:municipality"], 160);
  const address = firstValue(tags["addr:full"], 500) || (street ? street.slice(0, 500) : null);

  const category = categoryFromTags(tags, fallbackCategory);

  return {
    osm_ref: `${element.type}/${element.id}`,
    country_code: country,
    name,
    category,
    address,
    city,
    phone: firstValue(tags.phone || tags["contact:phone"] || tags["contact:mobile"], 120),
    website: (() => {
      const raw = firstValue(tags.website || tags["contact:website"] || tags.url, 500);
      if (!raw) return null;
      return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    })(),
    hours: firstValue(tags.opening_hours, 255),
    emergency: tags.emergency === "yes" || tags["healthcare:speciality"]?.includes("emergency") === true,
    lat: Math.round(lat * 1e6) / 1e6,
    lng: Math.round(lng * 1e6) / 1e6,
  };
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

  return [...rows.values()];
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
