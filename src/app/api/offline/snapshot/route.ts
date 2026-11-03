import { offlineIdentity, recordRevision } from "@/lib/offline-server";
import { getCountryDatabase, inOfflineTransaction, type RowDataPacket } from "@/lib/database";
import { isEncryptionConfigured } from "@/lib/security/field-encryption";
import { loadPatients } from "@/lib/data/patients";
import { loadRequestInbox } from "@/lib/data/request-inbox";
import { OFFLINE_CACHE_LIMIT, OFFLINE_DAYS, type OfflineSnapshot } from "@/lib/offline-types";

export async function GET() {
  const identity = await offlineIdentity();
  if (!identity) return Response.json({ error: "Online sign-in as a doctor or mediator is required." }, { status: 403 });
  try {
    if (!isEncryptionConfigured(identity.country)) return Response.json({ error: "Configure the country's data encryption key before enabling offline medical records." }, { status: 503 });
    const snapshot = await inOfflineTransaction(identity.country, async (): Promise<OfflineSnapshot> => {
      const patients = await loadPatients({ country: identity.country, scopeToWorkerId: identity.workerId, limit: OFFLINE_CACHE_LIMIT });
      const inbox = await loadRequestInbox(identity.country, new URLSearchParams(`folder=all&limit=${OFFLINE_CACHE_LIMIT}`), identity.workerId, false);
      const revisions: Record<string, string> = {};
      for (const [entity, items] of [["patient", patients], ["request", inbox.requests]] as const) {
        if (items.length) {
          const table = entity === "patient" ? "patients" : "medical_help_requests";
          const [rows] = await getCountryDatabase(identity.country).query<RowDataPacket[]>(
            `SELECT * FROM ${table} WHERE id IN (${items.map(() => "?").join(",")})`, items.map((item) => item.id),
          );
          if (rows.length !== items.length) throw new Error("Records changed during offline preparation.");
          for (const row of rows) revisions[`${entity}:${row.id}`] = recordRevision(row);
        }
      }
      const authorizedAt = Date.now();
      return { identity, authorizedAt, expiresAt: authorizedAt + OFFLINE_DAYS * 86400_000, patients, requests: inbox.requests, revisions };
    });
    return Response.json(snapshot, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    console.error("Offline preparation failed", error);
    return Response.json({ error: "Could not prepare offline records. Check the database and country encryption configuration." }, { status: 503 });
  }
}
