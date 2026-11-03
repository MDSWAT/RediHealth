import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ identity: vi.fn(), query: vi.fn(), record: vi.fn(), revision: vi.fn(), transaction: vi.fn(), create: vi.fn(), patch: vi.fn(), request: vi.fn() }));
vi.mock("@/lib/offline-server", () => ({ offlineIdentity: mocks.identity, offlineRecord: mocks.record, recordRevision: mocks.revision }));
vi.mock("@/lib/database", () => ({ getCountryDatabase: () => ({ query: mocks.query }), inOfflineTransaction: mocks.transaction }));
vi.mock("@/lib/security/field-encryption", () => ({ isEncryptionConfigured: () => true }));
vi.mock("@/app/api/patients/route", () => ({ POST: mocks.create, PATCH: mocks.patch }));
vi.mock("@/app/api/medical-help-requests/route", () => ({ PATCH: mocks.request }));
import { POST } from "./route";

const identity = { country: "RO", workerId: "2", email: "doctor@example.test", role: "Doctor", workerName: "Dr. Demo" };
function operation(overrides: object = {}) {
  return new Request("https://example.test/api/offline/sync", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://example.test" }, body: JSON.stringify({ ...identity, operationId: "12345678-1234-4234-8234-123456789012", entity: "patient", id: "1", create: false, revision: "base", changes: { medical_history: "Synthetic" }, ...overrides }) });
}
describe("offline sync transaction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.identity.mockResolvedValue(identity);
    mocks.transaction.mockImplementation(async (_country, run) => run());
    mocks.query.mockResolvedValue([[]]);
    mocks.record.mockResolvedValue({ id: 1 });
    mocks.revision.mockReturnValue("base");
    mocks.patch.mockResolvedValue(Response.json({ success: true }));
    mocks.create.mockResolvedValue(Response.json({ success: true, id: 99 }, { status: 201 }));
  });
  it("denies missing session, cross-country/account and cross-origin sync", async () => {
    mocks.identity.mockResolvedValueOnce(null);
    expect((await POST(operation())).status).toBe(403);
    expect((await POST(operation({ country: "IT" }))).status).toBe(403);
    expect((await POST(operation({ workerId: "3" }))).status).toBe(403);
    const request = operation();
    request.headers.set("origin", "https://external.test");
    expect((await POST(request)).status).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("locks and compares the record before calling normal mutation validation", async () => {
    const response = await POST(operation());
    expect(response.status).toBe(200);
    expect(mocks.record).toHaveBeenCalledWith(identity, "patient", "1", true);
    expect(mocks.patch).toHaveBeenCalledTimes(1);
    expect(await mocks.patch.mock.calls[0][0].json()).toMatchObject({ id: "1", medical_history: "Synthetic" });
    expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE offline_sync_receipts"), ["1", "base", "2", expect.any(String)]);
  });
  it("returns conflicts for changed or unassigned records without mutating", async () => {
    mocks.revision.mockReturnValueOnce("changed");
    expect((await POST(operation())).status).toBe(409);
    mocks.record.mockResolvedValueOnce(null);
    expect((await POST(operation())).status).toBe(409);
    expect(mocks.patch).not.toHaveBeenCalled();
  });
  it("returns the receipt on replay without creating a duplicate", async () => {
    mocks.query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([[{ entity_id: "99", revision: "saved" }]]);
    const response = await POST(operation({ id: "-1", create: true }));
    expect(await response.json()).toEqual({ id: "99", revision: "saved" });
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("propagates validation errors and prevents assignment changes", async () => {
    mocks.patch.mockResolvedValueOnce(Response.json({ error: "Invalid attachment" }, { status: 400 }));
    expect((await POST(operation())).status).toBe(400);
    expect((await POST(operation({ changes: { assigned_worker_id: "99" } }))).status).toBe(400);
    expect(mocks.patch).toHaveBeenCalledTimes(1);
  });
});
