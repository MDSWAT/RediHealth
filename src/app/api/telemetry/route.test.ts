import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  worker: { country: "RO", workerId: "7", workerName: "Ana", isAdmin: false },
}));

vi.mock("@/lib/staff-access", () => ({
  requireStaff: async () => ({ worker: mocks.worker, email: "ana@example.com", name: "Ana" }),
}));
vi.mock("@/lib/database", () => ({
  isCountryConfigured: () => true,
  getCountryDatabase: () => ({ query: mocks.query }),
}));

import { GET, POST } from "@/app/api/telemetry/route";

const reading = { patientId: 42, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, pulseBpm: 70 };

function post(body: unknown) {
  return POST(new Request("http://localhost/api/telemetry", { method: "POST", body: JSON.stringify(body) }));
}

describe("vitals telemetry access", () => {
  beforeEach(() => {
    mocks.query.mockReset();
    mocks.worker.isAdmin = false;
  });

  it("does not return vitals of a patient the worker is not assigned to", async () => {
    mocks.query.mockResolvedValueOnce([[]]); // ownership check finds nothing
    const response = await GET(new Request("http://localhost/api/telemetry?patientId=42"));
    expect(await response.json()).toEqual({ telemetry: null });
    expect(mocks.query).toHaveBeenCalledTimes(1);
    expect(mocks.query.mock.calls[0][1]).toEqual([42, "7", "7"]);
  });

  it("refuses to record vitals against a patient the worker is not assigned to", async () => {
    mocks.query.mockResolvedValueOnce([[]]);
    const response = await post(reading);
    expect(response.status).toBe(404);
    expect(mocks.query).toHaveBeenCalledTimes(1);
  });

  it("records vitals for an assigned patient", async () => {
    mocks.query.mockResolvedValueOnce([[{ id: 42 }]]).mockResolvedValueOnce([{ insertId: 5 }]);
    const response = await post(reading);
    expect(response.status).toBe(200);
    expect((await response.json()).record.id).toBe(5);
  });

  it("refuses a meeting the worker neither organises nor whose patient they look after", async () => {
    mocks.query.mockResolvedValueOnce([[]]);
    const response = await GET(new Request("http://localhost/api/telemetry?meetingId=9"));
    expect(await response.json()).toEqual({ telemetry: null });
    expect(mocks.query.mock.calls[0][1]).toEqual([9, "7", "7", "7"]);
  });
});
