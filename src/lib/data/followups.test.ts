import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ query: vi.fn(), beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn() }));
vi.mock("@/lib/database", () => ({ getDatabase: () => ({ getConnection: async () => mocks }) }));
import { createFollowup } from "./followups";

const input = { id: "stable-request-id", title: "Care review", date: "2026-10-02", time: "10:00", timezone: "Europe/Bucharest", video: true };
describe("atomic scheduling", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.query.mockReset(); });
  it("saves video meeting and follow-up together, retaining existing records", async () => {
    const old = { id: "previous", title: "Previous", date: "2026-09-01", status: "completed" };
    mocks.query.mockResolvedValueOnce([[{ full_name: "Patient", email: "patient@example.com", followups: JSON.stringify([old]) }]]).mockResolvedValueOnce([{ insertId: 77 }]).mockResolvedValueOnce([{}]);
    const result = await createFollowup("7", "2", false, input);
    expect(result.followup.meeting_id).toBe("77");
    expect(result.followup.time).toBe("10:00");
    expect(result.followup.meeting_url).toMatch(/^https:\/\/[^/]+\/redihealth-/);
    const saved = JSON.parse(mocks.query.mock.calls[2][1][0]);
    expect(saved[1]).toEqual(old);
    expect(saved[0].meeting_id).toBe("77");
    expect(mocks.commit).toHaveBeenCalledOnce();
    expect(mocks.rollback).not.toHaveBeenCalled();
    expect(mocks.release).toHaveBeenCalledOnce();
    expect(mocks.query.mock.calls[0][1]).toEqual(["7", "2", "2"]);
  });
  it("rolls back a meeting insert if follow-up persistence fails", async () => {
    mocks.query.mockResolvedValueOnce([[{ followups: "[]" }]]).mockResolvedValueOnce([{ insertId: 77 }]).mockRejectedValueOnce(new Error("Database failed"));
    await expect(createFollowup("7", "2", false, input)).rejects.toThrow("Database failed");
    expect(mocks.commit).not.toHaveBeenCalled(); expect(mocks.rollback).toHaveBeenCalledOnce(); expect(mocks.release).toHaveBeenCalledOnce();
  });
  it("returns an existing appointment on retry without inserting another meeting", async () => {
    const saved = { ...input, meeting_id: "77", meeting_url: "https://meet.jit.si/room", status: "scheduled" };
    mocks.query.mockResolvedValueOnce([[{ followups: JSON.stringify([saved]) }]]);
    const result = await createFollowup("7", "2", false, input);
    expect(result.created).toBe(false); expect(result.followup).toEqual(saved); expect(mocks.query).toHaveBeenCalledOnce();
  });
  it("rejects inaccessible patients and never creates a meeting", async () => {
    mocks.query.mockResolvedValueOnce([[]]);
    await expect(createFollowup("7", "2", false, input)).rejects.toMatchObject({ status: 404 });
    expect(mocks.query).toHaveBeenCalledOnce(); expect(mocks.rollback).toHaveBeenCalledOnce();
  });
  it("schedules date-only visits without a meeting or timezone", async () => {
    mocks.query.mockResolvedValueOnce([[{ followups: "[]" }]]).mockResolvedValueOnce([{}]);
    const result = await createFollowup("7", "2", true, { title: "Review", date: "2026-10-02" });
    expect(result.followup.time).toBeUndefined(); expect(result.followup.timezone).toBeUndefined(); expect(result.followup.meeting_id).toBeUndefined();
    expect(mocks.query).toHaveBeenCalledTimes(2);
  });
});
