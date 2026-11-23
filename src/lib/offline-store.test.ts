import { describe, expect, it, vi } from "vitest";
import { createDemoData } from "./demo-panel";
import { OfflineStore } from "./offline-store";
import type { OfflineData } from "./offline-types";
const body = (method: string, value: object) => ({ method, body: JSON.stringify(value) });
function setup(persist = vi.fn().mockResolvedValue(undefined)) {
  const demo = createDemoData();
  const data: OfflineData = { version: 1, deviceId: "test", identity: { email: "doctor@example.test", workerId: "2", workerName: "Dr. Demo", role: "Doctor", country: "RO" }, authorizedAt: Date.now(), expiresAt: Date.now() + 86400000, revisions: { "patient:1": "base", "request:1": "base" }, queue: [], patients: demo.patients, requests: demo.requests };
  return { store: new OfflineStore(data, persist, vi.fn()), persist };
}
describe("encrypted offline queue", () => {
  it("keeps an operation pending when the server does not return a valid receipt", async () => {
    const { store } = setup();
    await store.request("/api/patients", body("PATCH", { id: "1", status: "archived" }));
    await expect(store.sync(vi.fn().mockResolvedValue(Response.json({ success: true })))).rejects.toThrow("Invalid synchronization receipt");
    expect(store.data.queue).toHaveLength(1);
    expect(store.data.queue[0].submitted).toBe(true);
  });

  it("refreshes authorization without revealing removed patients or losing pending operations", async () => {
    const { store } = setup();
    await store.request("/api/patients", body("PATCH", { id: "1", medical_history: "Unsynced synthetic history" }));
    const queued = structuredClone(store.data.queue);
    await store.refresh({ ...store.data, patients: store.data.patients.filter((p) => p.id !== "1"), expiresAt: Date.now() + 2592000000 });
    expect(store.data.patients.some((p) => p.id === "1")).toBe(false);
    expect(store.data.queue).toEqual(queued);
    await expect(store.refresh({ ...store.data, identity: { ...store.data.identity, country: "IT" } })).rejects.toThrow("same staff account");
  });

  it("queues patient attachments and coalesces unsubmitted edits after persistence", async () => {
    const { store, persist } = setup();
    expect((await store.request("/api/patients", body("PATCH", { id: "1", medical_history: "Synthetic edited history" }))).ok).toBe(true);
    await store.request("/api/patients", body("PATCH", { id: "1", intake: store.data.patients[0].intake }));
    expect(store.data.queue).toHaveLength(1);
    expect(store.data.queue[0]).toMatchObject({ revision: "base", changes: { medical_history: "Synthetic edited history" } });
    expect(persist).toHaveBeenCalledTimes(2);
  });
  it("preserves state on storage failure and denies expired, deleted and online-only actions", async () => {
    const { store } = setup(vi.fn().mockRejectedValue(new Error("Disk full")));
    expect((await store.request("/api/patients", body("PATCH", { id: "1", status: "archived" }))).status).toBe(507);
    expect(store.data.patients[0].status).toBe("active");
    expect(store.data.queue).toHaveLength(0);
    expect((await store.request("/api/meetings", body("POST", {}))).status).toBe(403);
    expect((await store.request("/api/patients?id=1", { method: "DELETE" })).status).toBe(403);
    store.data.expiresAt = Date.now() - 1;
    expect((await store.request("/api/patients")).status).toBe(423);
  });
  it("creates temporary patients, schedules followups and maps IDs on idempotent sync", async () => {
    const { store } = setup();
    await store.request("/api/patients", body("POST", { full_name: "New Demo", phone: "000", email: "new@example.test", county: "Cluj" }));
    expect(store.data.patients[0].id).toBe("-1");
    const followup = await store.request("/api/patients/-1/followups", body("POST", { id: "f-new", title: "Offline visit", date: "2026-12-01" }));
    expect(followup.status).toBe(201);
    expect(store.data.queue).toHaveLength(1);
    const fetcher = vi.fn().mockResolvedValue(Response.json({ id: "99", revision: "new-revision" }));
    await store.sync(fetcher);
    expect(store.data.queue).toHaveLength(0);
    expect(store.data.patients[0].id).toBe("99");
    expect(store.data.revisions["patient:99"]).toBe("new-revision");
  });
  it("keeps conflicting requests pending and prevents editing submitted operations after uncertain delivery", async () => {
    const { store } = setup();
    await store.request("/api/medical-help-requests", body("PATCH", { id: "1", status: "resolved", priority: "normal", internal_notes: "Demo" }));
    await store.sync(vi.fn().mockResolvedValue(Response.json({ error: "Online changed" }, { status: 409 })));
    expect(store.data.queue[0].error).toBe("Online changed");
    expect(store.data.queue[0].submitted).toBe(true);
    expect((await store.request("/api/medical-help-requests", body("PATCH", { id: "1", status: "archived", priority: "normal" }))).status).toBe(507);
  });
  it("retries the same operation ID after network loss instead of duplicating creation", async () => {
    const { store } = setup();
    await store.request("/api/patients", body("POST", { full_name: "New Demo", phone: "000", email: "new@example.test", county: "Cluj" }));
    const id = store.data.queue[0].operationId;
    await expect(store.sync(vi.fn().mockRejectedValue(new TypeError("Network unavailable")))).rejects.toThrow();
    expect(store.data.queue[0].operationId).toBe(id);
    expect((await store.request("/api/patients", body("PATCH", { id: "-1", full_name: "Changed after delivery" }))).status).toBe(507);
    const fetcher = vi.fn().mockResolvedValue(Response.json({ id: "99", revision: "done" }));
    await store.sync(fetcher);
    expect(JSON.parse(fetcher.mock.calls[0][1].body).operationId).toBe(id);
  });

  it("handles non-JSON 502/504 gateway responses without throwing SyntaxError and retries cleanly (M2)", async () => {
    const { store } = setup();
    await store.request("/api/patients", body("PATCH", { id: "1", status: "archived" }));
    const gatewayHtml = () => new Response("<html><body>502 Bad Gateway</body></html>", { status: 502, headers: { "Content-Type": "text/html" } });
    await expect(store.sync(vi.fn().mockResolvedValue(gatewayHtml()))).rejects.toThrow("Sign-in or database not available.");
    expect(store.data.queue).toHaveLength(1);
    expect(store.data.queue[0].error).toBeUndefined();

    // Retry once gateway recovers clears the queued operation.
    await store.sync(vi.fn().mockResolvedValue(Response.json({ id: "1", revision: "rev-2" })));
    expect(store.data.queue).toHaveLength(0);
    expect(store.data.revisions["patient:1"]).toBe("rev-2");
  });

  it("clears submitted flag on 401/403 so subsequent offline edits remain allowed (M2)", async () => {
    const { store } = setup();
    await store.request("/api/patients", body("PATCH", { id: "1", status: "archived" }));
    await expect(store.sync(vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })))).rejects.toThrow("Sign-in or database not available.");
    expect(store.data.queue[0].submitted).toBeUndefined();
    expect((await store.request("/api/patients", body("PATCH", { id: "1", priority: "high" }))).ok).toBe(true);
  });

  it("serializes refresh() inside exclusive() so concurrent edits are not overwritten (H3)", async () => {
    let releaseFirstPersist!: () => void;
    let enteredFirstPersist!: () => void;
    const firstPersistStarted = new Promise<void>((resolve) => { enteredFirstPersist = resolve; });
    const persist = vi.fn()
      .mockImplementationOnce(() => {
        enteredFirstPersist();
        return new Promise<void>((resolve) => { releaseFirstPersist = resolve; });
      })
      .mockResolvedValue(undefined);
    const { store } = setup(persist);
    const editPromise = store.request("/api/patients", body("PATCH", { id: "1", medical_history: "Concurrent local edit" }));
    await firstPersistStarted;
    const snapshot = structuredClone({ ...store.data, expiresAt: Date.now() + 2592000000 });
    const refreshPromise = store.refresh(snapshot);
    releaseFirstPersist();
    await Promise.all([editPromise, refreshPromise]);
    expect(store.data.queue).toHaveLength(1);
    expect(store.data.patients.find((p) => p.id === "1")?.medical_history).toBe("Concurrent local edit");
  });
});
