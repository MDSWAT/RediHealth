import { configuredCountries, getCountryDatabase } from "@/lib/database";
import { PATIENT_COLUMNS, PATIENT_FROM, mapPatientRow, type DBPatientRow } from "@/lib/data/patients";
import type { CountryCode } from "@/lib/countries";
import { hashPortalToken } from "@/lib/security/portal-token";
import type { PatientItem } from "@/lib/types/patient";

type PortalRow = DBPatientRow & { link_expired: number | boolean };

export type PortalLookup =
  | { status: "found"; country: CountryCode; row: DBPatientRow }
  | { status: "expired" }
  | { status: "not-found" };

async function lookupInCountry(country: CountryCode, tokenHash: string): Promise<PortalLookup> {
  const [rows] = await getCountryDatabase(country).query<PortalRow[]>(
    `SELECT ${PATIENT_COLUMNS},
            (p.access_token_expires_at IS NOT NULL AND p.access_token_expires_at < NOW()) AS link_expired
     ${PATIENT_FROM}
     WHERE p.access_token_hash = ?
     LIMIT 1`,
    [tokenHash],
  );

  const row = rows[0];
  if (!row) return { status: "not-found" };
  return Boolean(Number(row.link_expired)) ? { status: "expired" } : { status: "found", country, row };
}

/**
 * Finds the patient behind a portal link. Only the token's hash is compared, and links past
 * their expiry date are reported separately so the page can offer a fresh one.
 *
 * Links carry the patient's country, so normally exactly one database is queried. Older links
 * without one are looked up in every configured country.
 */
export async function findPatientByPortalToken(rawToken: string, country?: CountryCode | null): Promise<PortalLookup> {
  const tokenHash = hashPortalToken(rawToken);
  const countries = country ? [country] : configuredCountries();

  let expired = false;
  for (const candidate of countries) {
    const result = await lookupInCountry(candidate, tokenHash);
    if (result.status === "found") return result;
    if (result.status === "expired") expired = true;
  }
  return { status: expired ? "expired" : "not-found" };
}

/** The portal only needs the patient's own record, not internal staff or request identifiers. */
export function toPortalPatient(row: DBPatientRow, country: CountryCode): PatientItem {
  return {
    ...mapPatientRow(row, country),
    request_id: null,
    assigned_worker_id: null,
    assigned_worker_ids: [],
    assigned_worker_names: row.assigned_worker_name ? [row.assigned_worker_name] : [],
    profile_photo: null,
    has_portal_access: true,
  };
}
