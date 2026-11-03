import { describe, expect, it, vi } from "vitest";
import { createDemoData, DemoPanelStore, demoInbox, parseDemoData } from "./demo-panel";

function setup() {
  const persist = vi.fn();
  return { persist, store: new DemoPanelStore(createDemoData(new Date("2026-11-03T12:00:00Z")), persist) };
}
function body(method: string, value: object) { return { method, body: JSON.stringify(value) }; }

describe("offline panel demo", () => {
  it("seeds fictional patient/request/care/calendar records and survives storage round trips", () => {
    const { store } = setup();
    const restored = parseDemoData(JSON.stringify(store.data));
    expect(restored.patients).toHaveLength(6);
    expect(restored.requests).toHaveLength(8);
    expect(restored.meetings).toHaveLength(1);
    expect(restored.patients.every((p) => p.email.endsWith("@example.test"))).toBe(true);
    expect(restored.patients[0].treatment_plan?.entries).toHaveLength(1);
    expect(() => parseDemoData('{"version":1}')).toThrow();
  });

  it("filters request folders, search, priority, date ranges and pages", () => {
    const { store } = setup();
    expect(demoInbox(store.data).counts.attention).toBe(6);
    expect(demoInbox(store.data, new URLSearchParams("folder=pending")).total).toBe(4);
    expect(demoInbox(store.data, new URLSearchParams("folder=all&q=Maria")).total).toBe(2);
    expect(demoInbox(store.data, new URLSearchParams("folder=all&priority=urgent")).total).toBe(1);
    expect(demoInbox(store.data, new URLSearchParams("folder=all&from=2026-11-03&to=2026-11-03")).total).toBe(1);
    const page = demoInbox(store.data, new URLSearchParams("folder=all&limit=2&page=2"));
    expect(page.requests.map((r) => r.id)).toEqual(["3", "4"]);
    expect(page.hasMore).toBe(true);
  });

  it("updates and closes requests, then deletes them locally", async () => {
    const { store, persist } = setup();
    const updated = await store.request("/api/medical-help-requests", body("PATCH", { id: "1", status: "resolved", priority: "normal", internal_notes: "Demo updated" }));
    expect(updated.status).toBe(200);
    expect(store.data.requests[0].status).toBe("resolved");
    expect(persist).toHaveBeenCalledTimes(1);
    await store.request("/api/medical-help-requests?id=1", { method: "DELETE" });
    expect(store.data.requests.some((r) => r.id === "1")).toBe(false);
  });

  it("creates/converts patients, edits care plans/documents and archives without touching live fetch", async () => {
    const liveFetch = vi.spyOn(globalThis, "fetch");
    try {
      const { store } = setup();
      const response = await store.request("/api/patients", body("POST", {
        full_name: "New Demo", phone: "0000000000", email: "new@example.test", county: "Cluj", request_id: "4",
        intake: { has_documents: true, documents: [], location: { latitude: 0, longitude: 0, accuracy: 10 } },
      }));
      expect(response.status).toBe(201);
      const result = await response.json();
      const id = String(result.id);
      expect(store.data.requests.find((r) => r.id === "4")?.patient_id).toBe(id);
      expect(store.data.patients.find((p) => p.id === id)?.assigned_worker_ids).toEqual(["1"]);
      expect((await store.request("/api/patients", body("PATCH", { id, status: "archived", medical_history: "Edited fictional history" }))).status).toBe(200);
      expect(store.data.patients.find((p) => p.id === id)?.status).toBe("archived");
      expect(liveFetch).not.toHaveBeenCalled();
    } finally { liveFetch.mockRestore(); }
  });

  it("enforces role assignment and denies unsupported/external live endpoints", async () => {
    const { store } = setup();
    await store.request("/api/patients", body("POST", { full_name: "New Demo", phone: "000", email: "new@example.test", county: "Cluj" }));
    const id = store.data.patients[0].id;
    store.commit({ ...store.data, role: "doctor" });
    expect((await store.request("/api/patients", body("PATCH", { id, status: "archived" }))).status).toBe(404);
    expect((await store.request("/api/admin/settings")).status).toBe(403);
    expect((await store.request("https://example.com/api/patients")).status).toBe(403);
    expect((await store.request("/api/health-assistant", body("POST", { message: "test" }))).status).toBe(403);
  });

  it("schedules follow-ups and simulates video, invitations, notes and email", async () => {
    const { store } = setup();
    const response = await store.request("/api/patients/2/followups", body("POST", { id: "new-followup", title: "Demo visit", date: "2026-11-10", video: true, reminder_set: true }));
    expect(response.status).toBe(201);
    const { followup } = await response.json();
    expect(followup.meeting_url).toMatch(/^\/demo\//);
    const duplicate = await store.request("/api/patients/2/followups", body("POST", { id: "new-followup", title: "Demo visit", date: "2026-11-10", video: true }));
    expect(duplicate.status).toBe(200);
    expect(store.data.patients[1].followups?.filter((f) => f.id === "new-followup")).toHaveLength(1);
    await store.request("/api/meetings", body("PATCH", { id: followup.meeting_id, notes: "Demo notes edited", transcript: "Demo transcript" }));
    expect(store.data.patients[1].followups?.find((f) => f.id === "new-followup")?.meeting_notes).toBe("Demo notes edited");
    for (const path of ["/api/patients/send-portal-link", "/api/medical-help-requests/reply", `/api/meetings/${followup.meeting_id}/invite`, "/api/report-issue"]) {
      expect((await store.request(path, body("POST", { id: "2" }))).status).toBe(200);
    }
    expect(store.data.events).toHaveLength(4);
    await store.request(`/api/meetings?id=${followup.meeting_id}`, { method: "DELETE" });
    expect(store.data.patients[1].followups?.find((f) => f.id === "new-followup")?.meeting_id).toBeUndefined();
  });

  it("reports storage errors and does not mutate state when persistence fails", async () => {
    const store = new DemoPanelStore(createDemoData(), () => { throw new Error("Storage full"); });
    const response = await store.request("/api/medical-help-requests", body("PATCH", { id: "1", status: "resolved", priority: "normal" }));
    expect(response.status).toBe(507);
    expect(await response.json()).toEqual({ error: "Storage full" });
    expect(store.data.requests[0].status).toBe("pending");
  });
});
