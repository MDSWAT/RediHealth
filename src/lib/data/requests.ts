import { getCountryDatabase, type RowDataPacket } from "@/lib/database";
import type { CountryCode } from "@/lib/countries";

/** Number of medical help requests still awaiting triage. */
export async function countPendingRequests(country: CountryCode): Promise<number> {
  const db = getCountryDatabase(country);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS count FROM medical_help_requests WHERE status = 'pending'`,
  );
  return Number(rows[0]?.count ?? 0);
}
