import { beforeEach, describe, expect, it, vi } from "vitest";
const directory = vi.hoisted(() => ({ country: vi.fn(), nearby: vi.fn() }));
vi.mock("@/lib/database", () => ({ hasControlDatabase: () => true }));
vi.mock("@/lib/data/medical-institutes", () => ({
  countryCenter: () => ({ lat: 47.01, lng: 28.86 }),
  findCountryInstitutes: directory.country,
  findNearbyInstitutes: directory.nearby,
}));
import { GET } from "./route";

describe("national healthcare directory", () => {
  beforeEach(() => { vi.clearAllMocks(); });
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
});
