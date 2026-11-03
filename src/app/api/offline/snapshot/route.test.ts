import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ identity: vi.fn(), encryption: vi.fn(), patients: vi.fn(), inbox: vi.fn(), query: vi.fn() }));
vi.mock("@/lib/offline-server", () => ({ offlineIdentity: mocks.identity, recordRevision: () => "digest" }));
vi.mock("@/lib/security/field-encryption", () => ({ isEncryptionConfigured: mocks.encryption }));
vi.mock("@/lib/data/patients", () => ({ loadPatients: mocks.patients }));
vi.mock("@/lib/data/request-inbox", () => ({ loadRequestInbox: mocks.inbox }));
vi.mock("@/lib/database", () => ({
  getCountryDatabase: () => ({ query: mocks.query }),
  inOfflineTransaction: (_country: string, run: () => Promise<unknown>) => run(),
}));
import { GET } from "./route";

describe("offline snapshot", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.identity.mockResolvedValue({ email: "doctor@example.test", workerId: "2", workerName: "Synthetic", role: "Doctor", country: "RO" });
    mocks.encryption.mockReturnValue(true);
    mocks.patients.mockResolvedValue([{ id: "1", full_name: "Synthetic" }, { id: "2" }]);
    mocks.inbox.mockResolvedValue({ requests: [{ id: "3" }] });
    mocks.query.mockResolvedValueOnce([[{ id: 1, access_token: "must-not-leak" }, { id: 2 }]]).mockResolvedValueOnce([[{ id: 3 }]]);
  });
  it("requires online authorization before loading clinical data", async () => {
    mocks.identity.mockResolvedValue(null);
    expect((await GET()).status).toBe(403);
    expect(mocks.patients).not.toHaveBeenCalled();
  });
  it("requires country encryption before preparing data", async () => {
    mocks.encryption.mockReturnValue(false);
    expect((await GET()).status).toBe(503);
    expect(mocks.patients).not.toHaveBeenCalled();
  });
  it("scopes patients, batches revisions and never returns raw credential columns", async () => {
    const response = await GET();
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(mocks.patients).toHaveBeenCalledWith({ country: "RO", scopeToWorkerId: "2", limit: 100 });
    expect(mocks.query).toHaveBeenCalledTimes(2);
    expect(text).not.toContain("must-not-leak");
    const snapshot = JSON.parse(text);
    expect(snapshot.revisions).toEqual({ "patient:1": "digest", "patient:2": "digest", "request:3": "digest" });
    expect(snapshot.expiresAt - snapshot.authorizedAt).toBe(30 * 86400000);
  });
});
