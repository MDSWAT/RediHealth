import { getCountryDatabase, type RowDataPacket } from "@/lib/database";
import type { CountryCode } from "@/lib/countries";

/**
 * Number of medical help requests that need attention (pending or in progress). The panel menu
 * badge shows it, so it must match the inbox's first folder, "Needs attention".
 */
export async function countAttentionRequests(country: CountryCode): Promise<number> {
  const db = getCountryDatabase(country);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS count FROM medical_help_requests WHERE status IN ('pending', 'in_progress')`,
  );
  return Number(rows[0]?.count ?? 0);
}
