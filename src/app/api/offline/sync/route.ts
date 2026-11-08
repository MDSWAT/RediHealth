import { offlineIdentity, offlineRecord, recordRevision } from "@/lib/offline-server";
import { getCountryDatabase, inOfflineTransaction, type RowDataPacket } from "@/lib/database";
import { POST as createPatient, PATCH as patchPatient } from "@/app/api/patients/route";
import { PATCH as patchRequest } from "@/app/api/medical-help-requests/route";
import { isEncryptionConfigured } from "@/lib/security/field-encryption";

class SyncFailure extends Error {
  constructor(readonly response: Response) { super("Sync operation was not committed."); }
}

export async function POST(request: Request) {
  const identity = await offlineIdentity();
  if (!identity) return Response.json({ error: "Sign in online as a doctor or mediator." }, { status: 403 });
  // Do not allow cross-origin sites to submit a cookie-authenticated offline write.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Invalid origin." }, { status: 403 });
  let value: unknown;
  try { value = await request.json(); } catch { return Response.json({ error: "Invalid sync JSON." }, { status: 400 }); }
  if (!value || typeof value !== "object") return Response.json({ error: "Invalid operation." }, { status: 400 });
  const op = value as Record<string, unknown>;
  if (op.country !== identity.country || op.workerId !== identity.workerId || op.email !== identity.email) {
    return Response.json({ error: "Sign in to the same staff account and country that prepared this offline device." }, { status: 403 });
  }
  if (typeof op.operationId !== "string" || !/^[0-9a-f-]{36}$/i.test(op.operationId)
    || !["patient", "request"].includes(String(op.entity)) || typeof op.id !== "string"
    || typeof op.create !== "boolean" || (op.create && op.entity !== "patient")
    || (!op.create && !/^\d+$/.test(op.id))
    || !op.changes || typeof op.changes !== "object" || Array.isArray(op.changes)) {
    return Response.json({ error: "Invalid sync operation." }, { status: 400 });
  }
  try {
    if (!isEncryptionConfigured(identity.country)) return Response.json({ error: "Country encryption is required for offline sync." }, { status: 503 });
    return await inOfflineTransaction(identity.country, async () => {
      const db = getCountryDatabase(identity.country);
      // INSERT ... ON DUPLICATE KEY locks the operation before checking the receipt.
      await db.query("INSERT INTO offline_sync_receipts (worker_id, operation_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE operation_id = operation_id", [identity.workerId, op.operationId]);
      const [receipts] = await db.query<RowDataPacket[]>("SELECT entity_id, revision FROM offline_sync_receipts WHERE worker_id = ? AND operation_id = ? FOR UPDATE", [identity.workerId, op.operationId]);
      if (receipts[0]?.entity_id) return Response.json({ id: String(receipts[0].entity_id), revision: receipts[0].revision });
      const entity = op.entity === "patient" ? "patient" : "request";
      if (!op.create) {
        const row = await offlineRecord(identity, entity, String(op.id), true);
        if (!row) throw new SyncFailure(Response.json({ error: "Record no longer exists or is no longer assigned to you.", conflict: true }, { status: 409 }));
        if (typeof op.revision !== "string" || recordRevision(row) !== op.revision) {
          throw new SyncFailure(Response.json({ error: "The online record has changed. Review it before retrying your offline changes.", conflict: true }, { status: 409 }));
        }
      }
      const changes = op.changes as Record<string, unknown>;
      if (["assigned_worker_id", "assigned_worker_ids", "access_token", "access_token_hash"].some((key) => key in changes)) {
        throw new SyncFailure(Response.json({ error: "Offline changes cannot modify assignments or access credentials." }, { status: 400 }));
      }
      const mutation = new Request(request.url, { method: op.create ? "POST" : "PATCH", headers: request.headers, body: JSON.stringify({ ...changes, id: op.id }) });
      const response = entity === "request" ? await patchRequest(mutation) : op.create ? await createPatient(mutation) : await patchPatient(mutation);
      if (!response.ok) throw new SyncFailure(response);
      const result = await response.json() as { id?: number };
      const id = op.create ? String(result.id) : String(op.id);
      const row = await offlineRecord(identity, entity, id);
      if (!row) throw new Error("Saved record could not be read.");
      const revision = recordRevision(row);
      await db.query("UPDATE offline_sync_receipts SET entity_id = ?, revision = ? WHERE worker_id = ? AND operation_id = ?", [id, revision, identity.workerId, op.operationId]);
      return Response.json({ id, revision });
    });
  } catch (error) {
    if (error instanceof SyncFailure) return error.response;
    console.error("Offline sync failed", error);
    return Response.json({ error: "Sync failed. Your changes are still on this device. Check that migration 014 is applied to the country database." }, { status: 503 });
  }
}
