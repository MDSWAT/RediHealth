import { getDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";
import {
  COUNTRY_INFO,
  isInstituteCategory,
  isSupportedCountry,
  type AdminMedicalInstitute,
  type CountryCode,
  type InstituteCategory,
  type MedicalInstitute,
  type MedicalInstituteInput,
} from "@/lib/medical-institutes";

type InstituteRow = RowDataPacket & {
  id: number | string;
  country_code: string;
  name: string;
  category: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  emergency: number;
  lat: string | number;
  lng: string | number;
  distance_km?: number | string | null;
  is_active?: number;
  source?: string;
  osm_ref?: string | null;
  manually_edited?: number;
  updated_at?: string | Date;
};

const PUBLIC_COLUMNS =
  "id, country_code, name, category, address, city, phone, website, hours, emergency, lat, lng";

function toInstitute(row: InstituteRow): MedicalInstitute {
  const country = row.country_code.toUpperCase();
  return {
    id: String(row.id),
    country_code: isSupportedCountry(country) ? country : "RO",
    name: row.name,
    category: isInstituteCategory(row.category) ? row.category : "other",
    address: row.address,
    city: row.city,
    phone: row.phone,
    website: row.website,
    hours: row.hours,
    emergency: Boolean(row.emergency),
    lat: Number(row.lat),
    lng: Number(row.lng),
    distance_km: row.distance_km == null ? null : Math.round(Number(row.distance_km) * 10) / 10,
  };
}

function toAdminInstitute(row: InstituteRow): AdminMedicalInstitute {
  return {
    ...toInstitute(row),
    is_active: Boolean(row.is_active),
    source: row.source === "osm" ? "osm" : "manual",
    osm_ref: row.osm_ref ?? null,
    manually_edited: Boolean(row.manually_edited),
    updated_at:
      row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at ?? ""),
  };
}

export type NearbyQuery = {
  lat: number;
  lng: number;
  country?: CountryCode | null;
  category?: InstituteCategory | null;
  search?: string | null;
  limit?: number;
};

const DISTANCE_SQL =
  "(6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(lat - ?) / 2), 2) + COS(RADIANS(?)) * COS(RADIANS(lat)) * POWER(SIN(RADIANS(lng - ?) / 2), 2))))";

/** Returns active institutes ordered by distance from a point, widening the search box until enough are found. */
export async function findNearbyInstitutes(query: NearbyQuery): Promise<MedicalInstitute[]> {
  const db = getDatabase();
  const limit = Math.min(200, Math.max(1, query.limit ?? 80));
  const search = query.search?.trim().toLowerCase() || "";

  const baseConditions = ["is_active = 1"];
  const baseParams: unknown[] = [];
  if (query.country) {
    baseConditions.push("country_code = ?");
    baseParams.push(query.country);
  }
  if (query.category) {
    baseConditions.push("category = ?");
    baseParams.push(query.category);
  }
  if (search) {
    const term = `%${search}%`;
    baseConditions.push(
      "(LOWER(name) LIKE ? OR LOWER(COALESCE(city, '')) LIKE ? OR LOWER(COALESCE(address, '')) LIKE ?)",
    );
    baseParams.push(term, term, term);
  }

  // A text search should find matches anywhere in the country, so skip the bounding box.
  const radiiDegrees = search ? [null] : [0.15, 0.5, 1.5, null];
  const minimumResults = Math.min(limit, 15);
  let rows: InstituteRow[] = [];

  for (const radius of radiiDegrees) {
    const conditions = [...baseConditions];
    const params: unknown[] = [query.lat, query.lat, query.lng, ...baseParams];
    if (radius != null) {
      const lngRadius = radius / Math.max(0.2, Math.cos((query.lat * Math.PI) / 180));
      conditions.push("lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?");
      params.push(query.lat - radius, query.lat + radius, query.lng - lngRadius, query.lng + lngRadius);
    }
    params.push(limit);

    [rows] = await db.query<InstituteRow[]>(
      `SELECT ${PUBLIC_COLUMNS}, ${DISTANCE_SQL} AS distance_km
       FROM medical_institutes
       WHERE ${conditions.join(" AND ")}
       ORDER BY distance_km ASC
       LIMIT ?`,
      params,
    );

    if (rows.length >= minimumResults) break;
  }

  return rows.map(toInstitute);
}

export function countryCenter(country: CountryCode): { lat: number; lng: number } {
  const [lat, lng] = COUNTRY_INFO[country].center;
  return { lat, lng };
}

export type AdminListQuery = {
  search?: string;
  country?: CountryCode | null;
  category?: InstituteCategory | null;
  status?: "all" | "active" | "hidden";
  page?: number;
  pageSize?: number;
};

export async function listInstitutesForAdmin(query: AdminListQuery) {
  const db = getDatabase();
  const pageSize = Math.min(100, Math.max(10, query.pageSize ?? 50));
  const page = Math.max(1, query.page ?? 1);
  const conditions: string[] = [];
  const params: unknown[] = [];

  const search = query.search?.trim().toLowerCase();
  if (search) {
    const term = `%${search}%`;
    conditions.push(
      "(LOWER(name) LIKE ? OR LOWER(COALESCE(city, '')) LIKE ? OR LOWER(COALESCE(address, '')) LIKE ? OR COALESCE(phone, '') LIKE ?)",
    );
    params.push(term, term, term, term);
  }
  if (query.country) {
    conditions.push("country_code = ?");
    params.push(query.country);
  }
  if (query.category) {
    conditions.push("category = ?");
    params.push(query.category);
  }
  if (query.status === "active") conditions.push("is_active = 1");
  if (query.status === "hidden") conditions.push("is_active = 0");

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [[countRows], [rows], [statsRows]] = await Promise.all([
    db.query<(RowDataPacket & { total: number })[]>(
      `SELECT COUNT(*) AS total FROM medical_institutes ${where}`,
      params,
    ),
    db.query<InstituteRow[]>(
      `SELECT ${PUBLIC_COLUMNS}, is_active, source, osm_ref, manually_edited, updated_at
       FROM medical_institutes ${where}
       ORDER BY updated_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, (page - 1) * pageSize],
    ),
    db.query<(RowDataPacket & { country_code: string; total: number; active: number })[]>(
      `SELECT country_code, COUNT(*) AS total, SUM(is_active) AS active
       FROM medical_institutes GROUP BY country_code`,
    ),
  ]);

  return {
    institutes: rows.map(toAdminInstitute),
    total: Number(countRows[0]?.total ?? 0),
    page,
    pageSize,
    stats: statsRows.map((row) => ({
      country_code: row.country_code,
      total: Number(row.total),
      active: Number(row.active ?? 0),
    })),
  };
}

export async function getInstituteForAdmin(id: string) {
  const [rows] = await getDatabase().query<InstituteRow[]>(
    `SELECT ${PUBLIC_COLUMNS}, is_active, source, osm_ref, manually_edited, updated_at
     FROM medical_institutes WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ? toAdminInstitute(rows[0]) : null;
}

function inputParams(input: MedicalInstituteInput) {
  return [
    input.country_code,
    input.name,
    input.category,
    input.address,
    input.city,
    input.phone,
    input.website,
    input.hours,
    input.emergency ? 1 : 0,
    input.lat,
    input.lng,
    input.is_active ? 1 : 0,
  ];
}

export async function createInstitute(input: MedicalInstituteInput) {
  const [result] = await getDatabase().query<ResultSetHeader>(
    `INSERT INTO medical_institutes
       (country_code, name, category, address, city, phone, website, hours, emergency, lat, lng, is_active, source, manually_edited)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', 1)`,
    inputParams(input),
  );
  return getInstituteForAdmin(String(result.insertId));
}

export async function updateInstitute(id: string, input: MedicalInstituteInput) {
  const [result] = await getDatabase().query<ResultSetHeader>(
    `UPDATE medical_institutes
     SET country_code = ?, name = ?, category = ?, address = ?, city = ?, phone = ?, website = ?,
         hours = ?, emergency = ?, lat = ?, lng = ?, is_active = ?, manually_edited = 1
     WHERE id = ?`,
    [...inputParams(input), id],
  );
  return result.affectedRows > 0 ? getInstituteForAdmin(id) : null;
}

export async function setInstituteActive(id: string, active: boolean) {
  const [result] = await getDatabase().query<ResultSetHeader>(
    "UPDATE medical_institutes SET is_active = ?, manually_edited = 1 WHERE id = ?",
    [active ? 1 : 0, id],
  );
  return result.affectedRows > 0 ? getInstituteForAdmin(id) : null;
}

/**
 * Manual entries are deleted. Imported (OSM) entries are hidden instead, so a later
 * re-import does not bring them back.
 */
export async function deleteInstitute(id: string): Promise<"deleted" | "hidden" | null> {
  const existing = await getInstituteForAdmin(id);
  if (!existing) return null;
  if (existing.source === "osm") {
    await setInstituteActive(id, false);
    return "hidden";
  }
  await getDatabase().query<ResultSetHeader>("DELETE FROM medical_institutes WHERE id = ?", [id]);
  return "deleted";
}
