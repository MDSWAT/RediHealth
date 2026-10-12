import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/lib/database", () => ({ getDatabase: () => mocks }));
import { loadRequestInbox } from "./request-inbox";
import { inboxOptions } from "../request-inbox";

describe("request inbox queries", () => {
  beforeEach(() => mocks.query.mockReset());
  it("loads older unanswered requests beyond the previous 100-record cap with exact counts", async () => {
    mocks.query.mockResolvedValueOnce([[{ id: 4, full_name: "Patient", description: "Help", status: "pending", created_at: new Date("2026-10-01T12:00:00Z"), patient_id: 9 }]])
      .mockResolvedValueOnce([[{ total: 151 }]])
      .mockResolvedValueOnce([[{ status: "pending", count: 150 }, { status: "in_progress", count: 1 }, { status: "resolved", count: 20 }]]);
    const result = await loadRequestInbox(new URLSearchParams("folder=attention&page=3&limit=50"), "2", false);
    expect(result.hasMore).toBe(true); expect(result.total).toBe(151); expect(result.counts.attention).toBe(151); expect(result.counts.all).toBe(171);
    expect(result.requests[0].patient_id).toBe("9");
    expect(mocks.query.mock.calls[0][1]).toEqual(["2", "2", 50, 100]);
    expect(mocks.query.mock.calls[0][0]).toContain("IN ('pending', 'in_progress')");
    expect(mocks.query.mock.calls[0][0]).toContain("p.assigned_worker_ids");
  });
  it("applies search, priority and date filters with bound parameters", async () => {
    mocks.query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([[{ total: 0 }]]).mockResolvedValueOnce([[]]);
    await loadRequestInbox(new URLSearchParams("folder=pending&q=patient&priority=urgent&from=2026-10-01&to=2026-10-02&limit=50"), "2", true);
    expect(mocks.query.mock.calls[0][1]).toEqual(["pending", "%patient%", "%patient%", "%patient%", "%patient%", "2026-10-01", "2026-10-02", 50, 0]);
    expect(mocks.query.mock.calls[0][0]).toContain("DATE_ADD");
    expect(mocks.query.mock.calls[0][0]).not.toContain("p.assigned_worker_id = ?");
  });
  it("bounds malformed pagination and unknown folders", () => {
    expect(inboxOptions(new URLSearchParams("limit=9999&page=-2&folder=invalid"))).toMatchObject({ limit: 100, page: 1, folder: "all" });
  });
});
