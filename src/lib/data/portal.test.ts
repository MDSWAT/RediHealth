import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/lib/database", () => ({
  getCountryDatabase: () => ({ query: mocks.query }),
  configuredCountries: () => ["RO", "IT"],
}));

import { findPatientByPortalToken, toPortalPatient } from "@/lib/data/portal";
import { hashPortalToken } from "@/lib/security/portal-token";

const row = {
  id: 5,
  request_id: 9,
  assigned_worker_id: 3,
  assigned_worker_ids: "[3]",
  assigned_worker_name: "Dr. Pop",
  access_token_hash: "stored-hash",
  full_name: "Ana",
  phone: "123",
  email: "ana@example.com",
  profile_photo: "data:image/jpeg;base64,AAAA",
  intake: '{"has_documents":true,"documents":[{"id":"identity-secret"}],"location":{"latitude":1,"longitude":2,"accuracy":3}}',
  created_at: new Date("2026-01-01T00:00:00Z"),
};

describe("patient portal lookup", () => {
  beforeEach(() => mocks.query.mockReset());

  it("looks the patient up by token hash only", async () => {
    mocks.query.mockResolvedValue([[{ ...row, link_expired: 0 }]]);
    const result = await findPatientByPortalToken("a-valid-looking-token", "RO");
    expect(result).toMatchObject({ status: "found", country: "RO" });
    expect(mocks.query).toHaveBeenCalledTimes(1);
    expect(mocks.query).toHaveBeenCalledWith(expect.any(String), [hashPortalToken("a-valid-looking-token")]);
  });

  it("searches every country for older links that do not name one", async () => {
    mocks.query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([[{ ...row, link_expired: 0 }]]);
    const result = await findPatientByPortalToken("a-valid-looking-token");
    expect(result).toMatchObject({ status: "found", country: "IT" });
    expect(mocks.query).toHaveBeenCalledTimes(2);
  });

  it("reports unknown tokens", async () => {
    mocks.query.mockResolvedValue([[]]);
    expect((await findPatientByPortalToken("a-valid-looking-token", "RO")).status).toBe("not-found");
  });

  it("reports links past their expiry date without returning the record", async () => {
    mocks.query.mockResolvedValue([[{ ...row, link_expired: 1 }]]);
    expect(await findPatientByPortalToken("a-valid-looking-token", "RO")).toEqual({ status: "expired" });
  });

  it("keeps staff and request identifiers away from the patient's browser", () => {
    const patient = toPortalPatient(row as never, "RO");
    expect(patient).toMatchObject({
      full_name: "Ana",
      request_id: null,
      assigned_worker_id: null,
      assigned_worker_ids: [],
      profile_photo: null,
      intake: null,
      has_portal_access: true,
    });
    expect(JSON.stringify(patient)).not.toContain("stored-hash");
    expect(JSON.stringify(patient)).not.toContain("identity-secret");
  });
});
