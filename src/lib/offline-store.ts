import { normalizePatientFromApi } from "./api-normalizers";
import { isValidEmail } from "./text";
import { isRomanianCounty } from "./romanian-counties";
import { validateFollowupInput } from "./validation";
import { isPatientPriority, isPatientStatus, validateTreatmentPlanInput } from "./validation";
import { validatePatientIntake } from "./patient-intake";
import type { PatientItem } from "./types/patient";
import type { OfflineData, OfflineOperation, OfflineSnapshot } from "./offline-types";
import { OFFLINE_PENDING_MESSAGE } from "./offline-types";
import { filterLocalInbox } from "./request-inbox";

const json = (value: unknown, status = 200) => Response.json(value, { status });
const fail = (error: string, status = 400) => json({ error }, status);
export const patientOfflineFields = ["full_name", "phone", "email", "date_of_birth", "gender", "address", "county", "condition_notes", "medical_history", "profile_photo", "treatment_plan", "followups", "photos", "intake", "status", "priority", "request_id"] as const;
export function offlinePatientChanges(patient: PatientItem) {
  return Object.fromEntries(patientOfflineFields.filter((field) => patient[field] !== undefined).map((field) => [field, patient[field]]));
}

export class OfflineStore {
  private tail: Promise<unknown> = Promise.resolve();
  locked = false;
  constructor(public data: OfflineData, private persist: (data: OfflineData) => Promise<void>, private changed: () => void) {}

  exclusive<T>(run: () => Promise<T>): Promise<T> {
    const next = this.tail.then(run);
    this.tail = next.catch(() => undefined);
    return next;
  }
  async commit(data: OfflineData) {
    if (this.locked) throw new Error("Offline storage was locked. Unlock to continue.");
    await this.persist(data);
    if (this.locked) throw new Error("Offline storage was locked. Unlock to continue.");
    this.data = data;
    this.changed();
  }
  private queue(data: OfflineData, entity: OfflineOperation["entity"], id: string, changes: Record<string, unknown>, create = false) {
    const previous = data.queue.find((op) => op.entity === entity && op.id === id);
    if (previous?.error || previous?.submitted) throw new Error("Synchronize or resolve this record's pending operation before editing it again.");
    if (previous) { previous.changes = { ...previous.changes, ...changes }; return; }
    data.queue.push({ operationId: crypto.randomUUID(), entity, id, create, revision: data.revisions[`${entity}:${id}`] || null, changes });
  }
  request: typeof fetch = async (input, init) => this.exclusive(async () => {
    if (this.locked || Date.now() >= this.data.expiresAt) return fail("Offline authorization expired or the vault is locked. Reauthorize online before viewing or editing records.", 423);
    if (init?.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, "https://offline.invalid");
    if (url.origin !== "https://offline.invalid") return fail("External actions require internet access.", 403);
    const method = init?.method || "GET";
    let body: Record<string, unknown> = {};
    if (init?.body) {
      try { body = JSON.parse(String(init.body)); } catch { return fail("Invalid offline payload."); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Invalid offline payload.");
    }
    const path = url.pathname;
    if (method === "GET") {
      if (path === "/api/patients") {
        const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
        const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 100));
        return json({ patients: this.data.patients.slice((page - 1) * limit, page * limit), pagination: { hasMore: page * limit < this.data.patients.length } });
      }
      if (path === "/api/medical-help-requests") return json(filterLocalInbox(this.data.requests, url.searchParams));
      if (path === "/api/workers") return json({ workers: [] });
      if (path === "/api/staff/country") return json({ active: this.data.identity.country, available: [] });
    }
    if (method === "DELETE") return fail("Permanent deletion is online-only. You can archive the patient or request instead.", 403);
    const draft = structuredClone(this.data);
    const followupPath = /^\/api\/patients\/([^/]+)\/followups$/.exec(path);
    if (followupPath && method === "POST") {
      if (body.video) return fail("Video meeting creation requires internet. Schedule without video, then add a meeting online.", 403);
      const owner = draft.patients.find((p) => p.id === followupPath[1]);
      if (!owner) return fail("Patient is not available on this device.", 404);
      const valid = validateFollowupInput({ ...body, status: "scheduled" });
      if (!valid.ok) return fail(valid.error);
      if (owner.followups?.some((f) => f.id === valid.value.id)) return json({ followup: owner.followups.find((f) => f.id === valid.value.id), email_sent: false });
      owner.followups = [...(owner.followups || []), { ...valid.value, reminder_set: Boolean(body.reminder_set) }];
      this.queue(draft, "patient", owner.id, { followups: owner.followups });
      await this.commit(draft);
      return json({ followup: owner.followups.at(-1), email_sent: false, warning: OFFLINE_PENDING_MESSAGE }, 201);
    }
    if (path === "/api/patients" && ["POST", "PATCH"].includes(method)) {
      const existing = draft.patients.find((p) => p.id === String(body.id));
      if (method === "PATCH" && !existing) return fail("Patient is not cached on this device.", 404);
      if (["assigned_worker_id", "assigned_worker_ids"].some((key) => key in body)) {
        // Creation forms include the current worker; reassignment remains forbidden.
        if (method !== "POST" || (body.assigned_worker_id && String(body.assigned_worker_id) !== draft.identity.workerId)
          || (Array.isArray(body.assigned_worker_ids) && body.assigned_worker_ids.some((id) => String(id) !== draft.identity.workerId))) return fail("Assignments require internet.", 403);
      }
      const changes = Object.fromEntries(patientOfflineFields.filter((key) => key in body).map((key) => [key, body[key]]));
      const fields = { ...existing, ...changes };
      if (!String(fields.full_name || "").trim() || !String(fields.phone || "").trim() || !isValidEmail(String(fields.email || ""))) return fail("Provide a name, phone and valid email.");
      if (draft.identity.country === "RO" && !isRomanianCounty(String(fields.county || ""))) return fail("Select a valid county.");
      if (fields.status !== undefined && !isPatientStatus(fields.status) || fields.priority !== undefined && !isPatientPriority(fields.priority)) return fail("Invalid status or priority.");
      if (fields.intake !== undefined && !validatePatientIntake(fields.intake).ok) return fail("Invalid documents or GPS.");
      if (fields.treatment_plan !== undefined && !validateTreatmentPlanInput(fields.treatment_plan).ok) return fail("Invalid treatment plan.");
      if (draft.patients.some((p) => p.id !== existing?.id && p.email.toLowerCase() === String(fields.email).toLowerCase())) return fail("A cached patient already has this email.", 409);
      // Negative numeric IDs work with existing panel route patterns and cannot collide with DB IDs.
      const id = existing?.id || String(Math.min(0, ...draft.patients.map((p) => Number(p.id))) - 1);
      const patient = normalizePatientFromApi({ ...fields, id, assigned_worker_id: existing?.assigned_worker_id || draft.identity.workerId, assigned_worker_ids: existing?.assigned_worker_ids || [draft.identity.workerId], assigned_worker_names: existing?.assigned_worker_names || [draft.identity.workerName], created_at: existing?.created_at || new Date().toISOString() });
      if (!patient) return fail("Invalid patient data.");
      if (existing) draft.patients = draft.patients.map((p) => p.id === id ? patient : p);
      else {
        draft.patients.unshift(patient);
        const request = draft.requests.find((r) => r.id === String(body.request_id));
        if (request) request.patient_id = id;
      }
      this.queue(draft, "patient", id, changes, !existing);
      await this.commit(draft);
      return json({ success: true, id, patient, email_sent: false, warning: OFFLINE_PENDING_MESSAGE }, existing ? 200 : 201);
    }
    if (path === "/api/medical-help-requests" && method === "PATCH") {
      const item = draft.requests.find((r) => r.id === String(body.id));
      if (!item) return fail("Request is not cached on this device.", 404);
      if (!["pending", "in_progress", "resolved", "archived"].includes(String(body.status)) || !["normal", "urgent"].includes(String(body.priority)) || (body.internal_notes != null && typeof body.internal_notes !== "string")) return fail("Invalid request status, priority or notes.");
      const changes = { status: body.status, priority: body.priority, internal_notes: body.internal_notes ?? null };
      Object.assign(item, changes);
      this.queue(draft, "request", item.id, changes);
      await this.commit(draft);
      return json({ success: true, request: item, warning: OFFLINE_PENDING_MESSAGE });
    }
    return fail("This action requires the online panel. Emails, video, invitations and reports cannot be queued.", 403);
  }).catch((error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return fail(error instanceof Error ? error.message : "Encrypted storage failed. Change was not saved.", 507);
  });

  async sync(fetcher: typeof fetch = fetch) {
    return this.exclusive(async () => {
      const mappings: Record<string, string> = {};
      if (this.locked || Date.now() >= this.data.expiresAt) throw new Error("Reauthorize this offline device online before syncing.");
      for (const queued of [...this.data.queue]) {
        if (queued.error) continue;
        const marked = structuredClone(this.data);
        marked.queue.find((op) => op.operationId === queued.operationId)!.submitted = true;
        await this.commit(marked);
        const response = await fetcher("/api/offline/sync", { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(30_000), body: JSON.stringify({ ...queued, ...this.data.identity }) });
        const result = await response.json() as { error?: string; id: string; revision: string };
        if ([401, 403, 503].includes(response.status)) throw new Error(result.error || "Online authorization or database unavailable.");
        if (response.ok && (typeof result.id !== "string" || !/^\d+$/.test(result.id) || typeof result.revision !== "string" || !result.revision)) throw new Error("Invalid synchronization receipt. Changes remain pending; retry online.");
        const draft = structuredClone(this.data);
        if (!response.ok) {
          const op = draft.queue.find((op) => op.operationId === queued.operationId)!;
          op.error = result.error || "Synchronization rejected. Review this record.";
          await this.commit(draft);
          continue;
        }
        draft.queue = draft.queue.filter((op) => op.operationId !== queued.operationId);
        draft.revisions[`${queued.entity}:${result.id}`] = result.revision;
        if (queued.create) {
          mappings[queued.id] = result.id;
          draft.patients.forEach((p) => { if (p.id === queued.id) p.id = result.id; });
          draft.requests.forEach((r) => { if (r.patient_id === queued.id) r.patient_id = result.id; });
        }
        await this.commit(draft);
      }
      return mappings;
    });
  }

  async refresh(snapshot: OfflineSnapshot) {
    if (snapshot.identity.email !== this.data.identity.email || snapshot.identity.workerId !== this.data.identity.workerId || snapshot.identity.country !== this.data.identity.country) throw new Error("Sign in to the same staff account and country to refresh this device.");
    const draft = { ...this.data, ...snapshot };
    for (const op of draft.queue) {
      if (op.entity === "patient") {
        const local = this.data.patients.find((p) => p.id === op.id);
        if (local && (op.create || snapshot.patients.some((p) => p.id === op.id))) draft.patients = [...draft.patients.filter((p) => p.id !== op.id), local];
      } else {
        const local = this.data.requests.find((r) => r.id === op.id);
        if (local) draft.requests = [...draft.requests.filter((r) => r.id !== op.id), local];
      }
    }
    await this.commit(draft);
  }
}
