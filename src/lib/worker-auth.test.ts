import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookie: vi.fn(),
  queries: {} as Record<string, ReturnType<typeof vi.fn>>,
}));

vi.mock("next/headers", () => ({ cookies: async () => ({ get: mocks.cookie }) }));
vi.mock("@/lib/database", () => ({
  defaultCountry: () => "RO",
  configuredCountries: () => ["RO", "IT", "MD"],
  getCountryDatabase: (country: string) => ({ query: mocks.queries[country] }),
}));

import { checkLoginAccess } from "@/lib/login-access";
import { getUserWorkerContext, getWorkerMemberships } from "@/lib/worker-auth";

function worker(id: number, role: string) {
  return [[{ id, full_name: `Worker ${id}`, role }]];
}

describe("staff access across country databases", () => {
  beforeEach(() => {
    mocks.cookie.mockReset().mockReturnValue(undefined);
    mocks.queries = { RO: vi.fn().mockResolvedValue([[]]), IT: vi.fn().mockResolvedValue([[]]), MD: vi.fn().mockResolvedValue([[]]) };
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("lists each country where the email is an active worker, with that country's own record", async () => {
    mocks.queries.RO.mockResolvedValue(worker(4, "Doctor"));
    mocks.queries.MD.mockResolvedValue(worker(9, "Administrator"));

    const { memberships, lookupFailed } = await getWorkerMemberships("Ana@Example.com");

    expect(lookupFailed).toBe(false);
    expect(memberships).toEqual([
      { country: "RO", workerId: "4", workerName: "Worker 4", role: "Doctor" },
      { country: "MD", workerId: "9", workerName: "Worker 9", role: "Administrator" },
    ]);
    expect(mocks.queries.RO).toHaveBeenCalledWith(expect.any(String), ["ana@example.com"]);
  });

  it("works in the country the staff member prefers, when they belong to it", async () => {
    mocks.queries.RO.mockResolvedValue(worker(4, "Doctor"));
    mocks.queries.MD.mockResolvedValue(worker(9, "Administrator"));
    mocks.cookie.mockReturnValue({ value: "md" });

    const context = await getUserWorkerContext("ana@example.com");

    expect(context).toMatchObject({ country: "MD", workerId: "9", isAdmin: true });
    expect(mocks.queries.RO).not.toHaveBeenCalled();
  });

  it("ignores a preferred country the person does not work in", async () => {
    mocks.queries.RO.mockResolvedValue(worker(4, "Doctor"));
    mocks.cookie.mockReturnValue({ value: "IT" });

    const context = await getUserWorkerContext("ana@example.com");

    expect(context).toMatchObject({ country: "RO", workerId: "4", isAdmin: false });
  });

  it("prefers a country where the account can open the panel", async () => {
    mocks.queries.RO.mockResolvedValue(worker(4, "Healthcare Worker"));
    mocks.queries.IT.mockResolvedValue(worker(2, "Mediator"));

    expect((await getUserWorkerContext("ana@example.com")).country).toBe("IT");
  });

  it("gives no access to people who are not staff anywhere", async () => {
    const context = await getUserWorkerContext("stranger@example.com");
    expect(context).toMatchObject({ workerId: null, role: "Unauthorized", isAdmin: false, lookupFailed: false });
  });

  it("reports a database failure instead of treating it as 'not staff'", async () => {
    mocks.queries.RO.mockRejectedValue(new Error("connection refused"));
    const context = await getUserWorkerContext("ana@example.com");
    expect(context).toMatchObject({ workerId: null, lookupFailed: true });
  });

  it("does not let one country's outage block staff of another country", async () => {
    mocks.queries.RO.mockRejectedValue(new Error("connection refused"));
    mocks.queries.IT.mockResolvedValue(worker(2, "Doctor"));
    expect(await getUserWorkerContext("ana@example.com")).toMatchObject({ country: "IT", workerId: "2" });
  });
});

describe("login access", () => {
  beforeEach(() => {
    mocks.cookie.mockReset();
    mocks.queries = { RO: vi.fn().mockResolvedValue([[]]), IT: vi.fn().mockResolvedValue([[]]), MD: vi.fn().mockResolvedValue([[]]) };
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("lets panel roles in from any country, including super admins", async () => {
    mocks.queries.MD.mockResolvedValue(worker(1, "Super Admin"));
    expect(await checkLoginAccess("boss@example.com")).toEqual({ allowed: true, reason: "authorized" });
  });

  it("rejects accounts whose role cannot open the panel", async () => {
    mocks.queries.IT.mockResolvedValue(worker(1, "Healthcare Worker"));
    expect(await checkLoginAccess("nurse@example.com")).toEqual({ allowed: false, reason: "unauthorized" });
  });

  it("reports an outage rather than 'unauthorized' when a country database fails", async () => {
    mocks.queries.IT.mockRejectedValue(new Error("down"));
    expect(await checkLoginAccess("someone@example.com")).toEqual({ allowed: false, reason: "database-unavailable" });
  });
});
