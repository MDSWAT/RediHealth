import type { PatientItem, FollowupItem } from "./types/patient";
import type { MedicalHelpRequestItem } from "./types/medical-request";
import type { WorkerItem } from "./types/worker";
import type { MeetItem } from "@/components/panel/MeetDashboard";
import { filterLocalInbox, type InboxPage } from "./request-inbox";
import { normalizePatientFromApi } from "./api-normalizers";
import { isPatientPriority, isPatientStatus, validateFollowupInput, validateTreatmentPlanInput } from "./validation";
import { validatePatientIntake } from "./patient-intake";
import { isValidEmail } from "./text";
import { isRomanianCounty } from "./romanian-counties";

export type DemoRole = "mediator" | "doctor";
export type DemoData = {
  version: 1;
  role: DemoRole;
  patients: PatientItem[];
  requests: MedicalHelpRequestItem[];
  meetings: MeetItem[];
  events: string[];
};
export const DEMO_STORAGE_KEY = "redihealth-panel-demo-v1";
export const DEMO_WORKERS: WorkerItem[] = [
  { id: "1", full_name: "Alex Demo", email: "mediator@example.test", role: "Mediator", county: "Cluj", status: "active", assigned_patients_count: 3, created_at: "2026-01-01" },
  { id: "2", full_name: "Dr. Dana Demo", email: "doctor@example.test", role: "Doctor", county: "Cluj", status: "active", assigned_patients_count: 3, created_at: "2026-01-01" },
];

export function createDemoData(now = new Date()): DemoData {
  const date = (offset: number) => { const d = new Date(now); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
  const names = ["Maria Demo", "Andrei Demo", "Elena Demo", "Victor Demo", "Ioana Demo", "Radu Demo"];
  const patients: PatientItem[] = names.map((full_name, index) => ({
    id: String(index + 1), request_id: index < 3 ? String(index + 1) : null,
    full_name, email: `patient${index + 1}@example.test`, phone: `000000000${index}`,
    assigned_worker_id: "1", assigned_worker_ids: ["1", "2"], assigned_worker_names: DEMO_WORKERS.map((w) => w.full_name),
    has_portal_access: true, address: "12 Example Street, Demo Town", county: "Cluj",
    date_of_birth: `19${70 + index}-05-12`, gender: index % 2 ? "Male" : "Female",
    status: index === 5 ? "archived" : "active", priority: index === 0 ? "high" : "moderate",
    condition_notes: "Synthetic example: routine care coordination and follow-up.",
    medical_history: "Fictional history for demonstration only. Not medical advice.",
    treatment_plan: { entries: [{ id: `plan-${index}`, title: "Example care plan", start_date: date(-7), end_date: date(14), goals: "Review progress at the next appointment.", care_instructions: "Demonstration content only." }] },
    followups: [
      { id: `f-${index}-1`, title: index % 2 ? "Home visit" : "Follow-up consultation", date: date(index - 1), time: "10:00", timezone: "Europe/Bucharest", status: "scheduled", reminder_set: true, ...(index === 0 ? { meeting_id: "1", meeting_url: "/demo/patients/1/meet/1" } : {}) },
      { id: `f-${index}-2`, title: "Initial assessment", date: date(-10), status: "completed", completed_at: `${date(-10)}T10:00:00Z`, completion_notes: "Synthetic assessment completed." },
    ],
    intake: { has_documents: index === 0, documents: index === 0 ? [{ id: "sample", name: "demo-document.png", category: "medical", data_url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" }] : [], location: null },
    photos: [], created_at: `${date(-14)}T09:00:00Z`,
  }));
  const requests: MedicalHelpRequestItem[] = Array.from({ length: 8 }, (_, index) => ({
    id: String(index + 1), full_name: names[index % names.length], email: `request${index + 1}@example.test`, phone: `000000001${index}`,
    county: "Cluj", description: "Fictional request: help arranging an appointment and a home visit.",
    status: index < 4 ? "pending" : index < 6 ? "in_progress" : index === 6 ? "resolved" : "archived",
    priority: index === 0 ? "urgent" : "normal", internal_notes: index > 3 ? "Demo staff contacted the fictional patient." : null,
    patient_id: index < 3 ? String(index + 1) : null, created_at: `${date(-index)}T08:00:00Z`,
  }));
  return { version: 1, role: "mediator", patients, requests, events: [], meetings: [{
    id: "1", title: "Demo consultation", meeting_url: "/demo/patients/1/meet/1", patient_id: "1", patient_name: names[0], followup_id: "f-0-1",
    transcript: "Synthetic consultation transcript.", notes: "Demo notes.", created_at: `${date(-1)}T08:00:00Z`,
  }] };
}

export function parseDemoData(raw: string): DemoData {
  const value: unknown = JSON.parse(raw);
  if (!record(value) || value.version !== 1 || (value.role !== "mediator" && value.role !== "doctor")
    || !Array.isArray(value.patients) || !Array.isArray(value.requests) || !Array.isArray(value.meetings)
    || !Array.isArray(value.events) || !value.events.every((item) => typeof item === "string")) throw new Error("Invalid saved demo data. Reset the demo to start again.");
  const patients = value.patients.map(normalizePatientFromApi);
  if (patients.some((p) => p === null)
    || !value.requests.every(isDemoRequest)
    || !value.meetings.every(isDemoMeeting)) throw new Error("Invalid saved demo records. Reset the demo to start again.");
  return { version: 1, role: value.role, patients: patients.filter((p): p is PatientItem => p !== null), requests: value.requests, meetings: value.meetings, events: value.events };
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isDemoRequest(value: unknown): value is MedicalHelpRequestItem {
  return record(value) && typeof value.id === "string" && (typeof value.full_name === "string" || value.full_name === null)
    && typeof value.description === "string" && typeof value.email === "string" && typeof value.phone === "string"
    && typeof value.created_at === "string" && !Number.isNaN(Date.parse(value.created_at))
    && (typeof value.internal_notes === "string" || value.internal_notes === null)
    && ["pending", "in_progress", "resolved", "archived"].includes(String(value.status))
    && ["normal", "urgent"].includes(String(value.priority));
}
function isDemoMeeting(value: unknown): value is MeetItem {
  return record(value) && typeof value.id === "string" && typeof value.title === "string"
    && typeof value.meeting_url === "string" && value.meeting_url.startsWith("/demo/")
    && typeof value.patient_id === "string" && typeof value.patient_name === "string"
    && typeof value.created_at === "string" && !Number.isNaN(Date.parse(value.created_at))
    && (typeof value.notes === "string" || value.notes === null)
    && (typeof value.transcript === "string" || value.transcript === null);
}
function json(value: unknown, status = 200) { return Response.json(value, { status }); }
function fail(error: string, status = 400) { return json({ error }, status); }
function nextId(items: { id: string }[]) { return String(Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1); }

export function demoInbox(data: Pick<DemoData, "requests">, params = new URLSearchParams("folder=attention")): InboxPage {
  return filterLocalInbox(data.requests, params);
}

export class DemoPanelStore {
  constructor(public data: DemoData, private persist: (data: DemoData) => void) {}

  commit(data: DemoData) {
    this.persist(data);
    this.data = data;
  }

  request: typeof fetch = async (input, init) => {
    if (init?.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(raw, "https://demo.invalid");
    if (url.origin !== "https://demo.invalid") return fail("External services are disabled in the demo.", 403);
    const method = init?.method || (input instanceof Request ? input.method : "GET");
    let body: Record<string, unknown> = {};
    if (init?.body) {
      if (typeof init.body !== "string") return fail("Only local JSON demo actions are supported.");
      try { const value: unknown = JSON.parse(init.body); if (!record(value)) return fail("Invalid demo payload."); body = value; }
      catch { return fail("Invalid demo payload."); }
    }
    const draft = structuredClone(this.data);
    const path = url.pathname;
    const worker = DEMO_WORKERS[draft.role === "mediator" ? 0 : 1];
    const patient = (id: unknown) => draft.patients.find((p) => p.id === String(id) && p.assigned_worker_ids?.includes(worker.id));
    const save = (result: unknown, status = 200) => {
      try { this.commit(draft); return json(result, status); }
      catch (cause) { return fail(cause instanceof Error ? cause.message : "Browser storage failed. Your change was not saved.", 507); }
    };

    if (path === "/api/staff/country" && method === "GET") return json({ active: "RO", available: [{ country: "RO", role: worker.role }] });
    if (path === "/api/workers" && method === "GET") return json({ workers: DEMO_WORKERS });
    if (path === "/api/medical-help-requests" && method === "GET") return json(demoInbox(draft, url.searchParams));
    if (path === "/api/medical-help-requests" && ["PATCH", "DELETE"].includes(method)) {
      const id = String(body.id || url.searchParams.get("id") || "");
      const item = draft.requests.find((r) => r.id === id);
      if (!item) return fail("Demo request not found.", 404);
      if (method === "DELETE") draft.requests = draft.requests.filter((r) => r.id !== id);
      else {
        if (!["pending", "in_progress", "resolved", "archived"].includes(String(body.status)) || !["normal", "urgent"].includes(String(body.priority))) return fail("Invalid request status or priority.");
        if (body.internal_notes != null && (typeof body.internal_notes !== "string" || body.internal_notes.length > 4000)) return fail("Invalid request notes.");
        Object.assign(item, { status: body.status, priority: body.priority, internal_notes: body.internal_notes, status_updated_by_name: worker.full_name, status_updated_at: new Date().toISOString() });
      }
      return save({ success: true, request: item });
    }
    if (path === "/api/patients" && method === "GET") {
      const all = draft.patients.filter((p) => p.assigned_worker_ids?.includes(worker.id));
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 50));
      return json({ patients: all.slice((page - 1) * limit, page * limit), pagination: { page, limit, total: all.length, hasMore: page * limit < all.length } });
    }
    if (path === "/api/patients" && ["POST", "PATCH", "DELETE"].includes(method)) {
      const existing = patient(body.id || url.searchParams.get("id"));
      if (method !== "POST" && !existing) return fail("Demo patient not found or not assigned to this role.", 404);
      if (method === "DELETE") {
        draft.patients = draft.patients.filter((p) => p.id !== existing!.id);
        draft.meetings = draft.meetings.filter((m) => m.patient_id !== existing!.id);
        draft.requests.forEach((r) => { if (r.patient_id === existing!.id) r.patient_id = null; });
        return save({ success: true });
      }
      const fields = { ...existing, ...body };
      if (!String(fields.full_name || "").trim() || !String(fields.phone || "").trim() || !isValidEmail(String(fields.email || "")) || !isRomanianCounty(fields.county || "")) return fail("Provide a name, phone, valid email and county.");
      if (fields.status !== undefined && !isPatientStatus(fields.status) || fields.priority !== undefined && !isPatientPriority(fields.priority)) return fail("Invalid patient status or priority.");
      if (String(fields.full_name).length > 200 || String(fields.phone).length > 50 || String(fields.email).length > 320 || String(fields.address || "").length > 500) return fail("One or more fields are too long.");
      if (draft.patients.some((p) => p.id !== existing?.id && p.email.toLowerCase() === String(fields.email).trim().toLowerCase())) return fail("A demo patient with this email already exists.", 409);
      if (body.intake !== undefined && !validatePatientIntake(body.intake).ok) return fail("Invalid documents or GPS coordinates.");
      if (body.treatment_plan !== undefined && !validateTreatmentPlanInput(body.treatment_plan).ok) return fail("Invalid care plan.");
      const id = existing?.id || nextId(draft.patients);
      const next = normalizePatientFromApi({
        ...fields, id, assigned_worker_id: worker.id,
        assigned_worker_ids: existing?.assigned_worker_ids || [worker.id],
        assigned_worker_names: existing?.assigned_worker_names || [worker.full_name], has_portal_access: true,
        created_at: existing?.created_at || new Date().toISOString(),
      });
      if (!next) return fail("Invalid demo patient.");
      if (existing) draft.patients = draft.patients.map((p) => p.id === id ? next : p);
      else {
        draft.patients.unshift(next);
        const request = draft.requests.find((r) => r.id === String(body.request_id));
        if (request) request.patient_id = id;
      }
      return save({ success: true, id: Number(id), email_sent: true }, method === "POST" ? 201 : 200);
    }
    const followupPath = /^\/api\/patients\/(\d+)\/followups$/.exec(path);
    if (followupPath && method === "POST") {
      const owner = patient(followupPath[1]);
      if (!owner) return fail("Demo patient not found.", 404);
      const validated = validateFollowupInput({ ...body, status: "scheduled" });
      if (!validated.ok) return fail(validated.error);
      const followup: FollowupItem = { ...validated.value, reminder_set: Boolean(body.reminder_set) };
      const existing = owner.followups?.find((f) => f.id === followup.id);
      if (existing) return json({ followup: existing, email_sent: true });
      if (body.video) this.addMeeting(draft, owner, followup);
      owner.followups = [...(owner.followups || []), followup];
      return save({ followup, email_sent: true }, 201);
    }
    if (path === "/api/meetings") {
      const id = String(body.id || url.searchParams.get("id") || "");
      const meeting = draft.meetings.find((m) => m.id === id && patient(m.patient_id));
      if (method === "GET") return meeting ? json({ meeting }) : fail("Demo meeting not found.", 404);
      if (method === "POST") {
        const owner = patient(body.patientId);
        const followup = owner?.followups?.find((f) => f.id === String(body.followupId));
        if (!owner || !followup) return fail("Demo follow-up not found.", 404);
        this.addMeeting(draft, owner, followup);
        return save({ id: followup.meeting_id, meetingUrl: followup.meeting_url, followup, email_sent: true }, 201);
      }
      if (!meeting) return fail("Demo meeting not found.", 404);
      const followup = patient(meeting.patient_id)?.followups?.find((f) => f.meeting_id === id);
      if (method === "DELETE") {
        draft.meetings = draft.meetings.filter((m) => m.id !== id);
        if (followup) { delete followup.meeting_id; delete followup.meeting_url; delete followup.meeting_transcript; delete followup.meeting_notes; }
      } else if (method === "PATCH") {
        meeting.notes = String(body.notes || ""); meeting.transcript = String(body.transcript || "");
        if (followup) { followup.meeting_notes = meeting.notes; followup.meeting_transcript = meeting.transcript; }
      } else return fail("Unsupported demo method.", 405);
      return save({ success: true });
    }
    if (method === "POST" && (path === "/api/medical-help-requests/reply" || path === "/api/patients/send-portal-link" || /^\/api\/meetings\/\d+\/invite$/.test(path) || path === "/api/report-issue")) {
      draft.events.push(`Simulated ${path} at ${new Date().toISOString()}`);
      return save({ success: true, email_sent: true });
    }
    return fail("This action is not available in the offline demo. No live request was sent.", 403);
  };

  private addMeeting(data: DemoData, owner: PatientItem, followup: FollowupItem) {
    if (followup.meeting_id) return;
    const id = nextId(data.meetings);
    followup.meeting_id = id;
    followup.meeting_url = `/demo/patients/${owner.id}/meet/${id}`;
    data.meetings.push({ id, title: followup.title, meeting_url: followup.meeting_url, patient_id: owner.id, patient_name: owner.full_name, followup_id: followup.id, transcript: null, notes: null, created_at: new Date().toISOString() });
  }
}
