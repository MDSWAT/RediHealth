import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decryptField } from "@/lib/security/field-encryption";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), worker: vi.fn(), query: vi.fn(), log: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: mocks.worker }));
vi.mock("@/lib/database", () => ({ getCountryDatabase: () => ({ query: mocks.query }) }));
vi.mock("@/lib/email", () => ({ sendPatientPortalLinkEmail: vi.fn().mockResolvedValue(false) }));
vi.mock("@/lib/i18n/server-routing", () => ({ getRequestLang: async () => "en" }));
vi.mock("@/lib/activity-log", () => ({ logActivity: mocks.log }));
vi.mock("@/lib/rate-limit", () => ({ getClientIp: () => "127.0.0.1" }));

import { PATCH, POST } from "./route";

const entries = [
  { id: "one", title: "First course", start_date: "2026-10-01", end_date: "2026-10-07", medications: "First therapy" },
  { id: "two", title: "Second course", start_date: "2026-10-03", end_date: "2026-10-12", medications: "Second therapy" },
];
function request(method: string, body: object) {
  return new Request("http://localhost/api/patients", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

describe("patient treatment persistence", () => {
  afterEach(() => vi.unstubAllEnvs());
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "staff@example.com" } });
    mocks.worker.mockResolvedValue({ country: "RO", workerId: "2", isAdmin: false });
    mocks.query.mockResolvedValue([{ affectedRows: 1 }]);
    mocks.log.mockResolvedValue(undefined);
  });

  it("persists every plan and retains staff assignment restrictions", async () => {
    const response = await PATCH(request("PATCH", { id: "7", treatment_plan: { entries } }));
    expect(response.status).toBe(200);
    expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining("assigned_worker_id = ?"), [expect.any(String), "7", "2", "2"]);
    expect(JSON.parse(mocks.query.mock.calls[0][1][0])).toEqual({ entries });
    expect(await response.json()).toEqual({ success: true });
  });

  it("creates a patient with multiple treatment plans in the existing JSON column", async () => {
    mocks.query.mockResolvedValueOnce([{ insertId: 7 }]);
    const response = await POST(request("POST", { full_name: "Test", email: "test@example.com", phone: "123", county: "Cluj", treatment_plan: { entries } }));
    expect(response.status).toBe(201);
    expect(mocks.query.mock.calls[0][0]).toContain("INSERT INTO patients");
    expect(mocks.query.mock.calls[0][0]).toContain("priority, county");
    expect(mocks.query.mock.calls[0][1].at(-2)).toBe("Cluj");
    expect(JSON.parse(mocks.query.mock.calls[0][1][13])).toEqual({ entries });
  });

  it("records the creation even when the portal email cannot be sent", async () => {
    mocks.query.mockResolvedValueOnce([{ insertId: 9 }]);
    const response = await POST(request("POST", { full_name: "Test", email: "test@example.com", phone: "123", county: "Cluj" }));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ id: 9, email_sent: false });
    expect(mocks.log).toHaveBeenCalledWith(expect.objectContaining({ action: "patient.created", entityId: 9 }));
  });

  it("gives new portal links a 90 day expiry", async () => {
    mocks.query.mockResolvedValueOnce([{ insertId: 10 }]);
    await POST(request("POST", { full_name: "Test", email: "test@example.com", phone: "123", county: "Cluj" }));
    expect(mocks.query.mock.calls[0][0]).toContain("DATE_ADD(NOW(), INTERVAL ? DAY)");
    expect(mocks.query.mock.calls[0][1][4]).toBe(90);
  });

  it("persists editing and deletion without dropping another course", async () => {
    const updated = [{ ...entries[1], medications: "Updated second therapy" }];
    expect((await PATCH(request("PATCH", { id: "7", treatment_plan: { entries: updated } }))).status).toBe(200);
    expect(JSON.parse(mocks.query.mock.calls[0][1][0])).toEqual({ entries: updated });
    expect((await PATCH(request("PATCH", { id: "7", treatment_plan: { entries: [] } }))).status).toBe(200);
    expect(mocks.query.mock.calls[1][1][0]).toBe('{"entries":[]}');
  });

  it("archives a patient when closing the patient record", async () => {
    const response = await PATCH(request("PATCH", { id: "7", status: "archived" }));

    expect(response.status).toBe(200);
    expect(mocks.query.mock.calls[0][0]).toContain("status = ?");
    expect(mocks.query.mock.calls[0][1]).toEqual(["archived", "7", "2", "2"]);
  });

  it("rejects invalid dates before any write for both create and update", async () => {
    const treatment_plan = { entries: [{ ...entries[0], end_date: "2026-09-01" }] };
    expect((await PATCH(request("PATCH", { id: "7", treatment_plan }))).status).toBe(400);
    expect((await POST(request("POST", { full_name: "Test", email: "test@example.com", phone: "123", county: "Cluj", treatment_plan }))).status).toBe(400);
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("requires a valid county when creating patients in Romania", async () => {
    const response = await POST(request("POST", { full_name: "Test", email: "test@example.com", phone: "123", county: "Invalid" }));
    expect(response.status).toBe(400);
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("reports missing patients instead of claiming success", async () => {
    mocks.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    expect((await PATCH(request("PATCH", { id: "7", treatment_plan: { entries } }))).status).toBe(404);
  });

  it("encrypts intake on create and update while retaining staff assignment restrictions", async () => {
    vi.stubEnv("DATA_ENCRYPTION_KEY_RO", Buffer.alloc(32, 7).toString("base64"));
    const intake = { has_documents: true, documents: [{ id: "doc", name: "id.pdf", category: "identity", data_url: `data:application/pdf;base64,${Buffer.from("%PDF-1.7\nexample").toString("base64")}` }], location: { latitude: 0, longitude: 0, accuracy: 5 } };
    mocks.query.mockResolvedValueOnce([{ insertId: 7 }]);
    expect((await POST(request("POST", { full_name: "Test", email: "test@example.com", phone: "123", county: "Cluj", intake }))).status).toBe(201);
    const stored = mocks.query.mock.calls[0][1].at(-1);
    expect(stored).toMatch(/^enc:v1:/);
    expect(JSON.parse(decryptField("RO", stored)!)).toEqual(intake);
    expect((await PATCH(request("PATCH", { id: "7", intake }))).status).toBe(200);
    expect(mocks.query.mock.calls[1][0]).toContain("assigned_worker_id = ?");
    expect(JSON.parse(decryptField("RO", mocks.query.mock.calls[1][1][0])!)).toEqual(intake);
    expect(mocks.query.mock.calls[1][1].slice(1)).toEqual(["7", "2", "2"]);
  });

  it("rejects invalid intake before writing on create and update", async () => {
    for (const method of ["POST", "PATCH"]) {
      const body = { id: "7", full_name: "Test", email: "test@example.com", phone: "123", county: "Cluj", intake: { has_documents: false, documents: [], location: { latitude: 91, longitude: 0, accuracy: 1 } } };
      expect((await (method === "POST" ? POST : PATCH)(request(method, body))).status).toBe(400);
    }
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("does not store GPS or documents without an encryption key", async () => {
    vi.stubEnv("DATA_ENCRYPTION_KEY_RO", "");
    const intake = { has_documents: false, documents: [], location: { latitude: 0, longitude: 0, accuracy: 5 } };
    expect((await POST(request("POST", { full_name: "Test", email: "test@example.com", phone: "123", county: "Cluj", intake }))).status).toBe(503);
    expect((await PATCH(request("PATCH", { id: "7", intake }))).status).toBe(503);
    expect(mocks.query).not.toHaveBeenCalled();
  });
});
