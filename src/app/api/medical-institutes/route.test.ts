import { beforeEach, describe, expect, it, vi } from "vitest";
const directory = vi.hoisted(() => ({ country: vi.fn(), nearby: vi.fn() }));
vi.mock("@/lib/database", () => ({ hasControlDatabase: () => true }));
vi.mock("@/lib/data/medical-institutes", () => ({
  countryCenter: () => ({ lat: 47.01, lng: 28.86 }),
  findCountryInstitutes: directory.country,
  findNearbyInstitutes: directory.nearby,
}));
import { _resetRateLimitMemoryForTest } from "@/lib/rate-limit";
import { GET } from "./route";

describe("national healthcare directory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetRateLimitMemoryForTest();
  });
  it("browses Moldova by page without restricting results to the capital", async () => {
    directory.country.mockResolvedValue({ institutes: [{ id: "501", country_code: "MD" }], hasMore: true });
    const response = await GET(new Request("http://localhost/api/medical-institutes?country=MD&page=1&category=clinic&q=Balti"));
    expect(response.status).toBe(200);
    expect(directory.country).toHaveBeenCalledWith({ country: "MD", page: 1, category: "clinic", search: "Balti" });
    expect(directory.nearby).not.toHaveBeenCalled();
    expect(await response.json()).toMatchObject({ country: "MD", hasMore: true, institutes: [{ id: "501" }] });
  });
  it("retains nearby lookup for GPS searches", async () => {
    directory.nearby.mockResolvedValue([]);
    const response = await GET(new Request("http://localhost/api/medical-institutes?lat=47&lng=28.8"));
    expect(response.status).toBe(200);
    expect(directory.country).not.toHaveBeenCalled();
    expect(await response.json()).toMatchObject({ hasMore: false });
  });
  it("rejects invalid page numbers before querying", async () => {
    for (const page of ["-1", "1.5", "NaN"]) {
      expect((await GET(new Request(`http://localhost/api/medical-institutes?country=MD&page=${page}`))).status).toBe(400);
    }
    expect(directory.country).not.toHaveBeenCalled();
  });
  it("omits internal migration hints on database failure and enforces IP rate limits", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    directory.country.mockRejectedValueOnce(new Error("DB error"));
    const errorRes = await GET(new Request("http://localhost/api/medical-institutes?country=RO"));
    expect(errorRes.status).toBe(503);
    const errorBody = (await errorRes.json()) as { error: string };
    expect(errorBody.error).not.toMatch(/migration/i);

    directory.country.mockResolvedValue({ institutes: [], hasMore: false });
    for (let i = 0; i < 59; i += 1) {
      expect((await GET(new Request("http://localhost/api/medical-institutes?country=RO"))).status).toBe(200);
    }
    const limited = await GET(new Request("http://localhost/api/medical-institutes?country=RO"));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
  });
});
