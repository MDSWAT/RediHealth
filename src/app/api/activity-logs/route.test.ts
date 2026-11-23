import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), worker: vi.fn(), query: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: mocks.worker }));
vi.mock("@/lib/database", () => ({ getCountryDatabase: () => ({ query: mocks.query }) }));

import { GET } from "./route";

describe("GET /api/activity-logs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "super@example.test" } });
    mocks.worker.mockResolvedValue({ country: "RO", workerId: "1", isSuperAdmin: true });
    mocks.query.mockResolvedValue([[]]);
  });

  it.each([
    ["abc", 100],
    ["Infinity", 100],
    ["", 100],
    ["5", 20],
    ["500", 300],
    ["75.9", 75],
  ])("sanitizes ?limit=%s to %d without passing NaN to PostgreSQL (M4)", async (rawLimit, expected) => {
    const response = await GET(new Request(`http://localhost/api/activity-logs?limit=${encodeURIComponent(rawLimit)}`));
    expect(response.status).toBe(200);
    const params = mocks.query.mock.calls[0][1];
    expect(params.at(-1)).toBe(expected);
    expect(Number.isFinite(params.at(-1))).toBe(true);
  });
});
