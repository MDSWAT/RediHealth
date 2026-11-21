import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MedicalInstitute } from "@/lib/medical-institutes";
import {
  OFFLINE_INSTITUTES_LIMIT,
  queryOfflineInstitutes,
  saveOfflineInstitutes,
  warmCountryInstitutes,
} from "./offline-institutes";

function makeInstitute(overrides: Partial<MedicalInstitute> & { id: string; name: string }): MedicalInstitute {
  return {
    country_code: "RO",
    category: "pharmacy",
    address: "Strada Mare 1",
    city: "Cluj-Napoca",
    phone: "+40264123456",
    website: null,
    hours: "08:00-20:00",
    emergency: false,
    lat: 46.7712,
    lng: 23.6236,
    ownership: "private",
    ...overrides,
  };
}

describe("offline-institutes directory cache", () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });
    vi.stubGlobal("navigator", { onLine: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("saves, deduplicates, and caps cached institutes at 400 rows per country", () => {
    const batch1 = Array.from({ length: 260 }, (_, idx) =>
      makeInstitute({ id: `inst-${idx}`, name: `Farmacia ${idx}`, lat: 46.7 + idx * 0.001 }),
    );
    const batch2 = Array.from({ length: 200 }, (_, idx) =>
      makeInstitute({ id: `inst-${250 + idx}`, name: `Clinica ${250 + idx}`, category: "clinic", lat: 46.5 + idx * 0.001 }),
    );

    saveOfflineInstitutes("RO", batch1);
    saveOfflineInstitutes("RO", batch2);

    const res = queryOfflineInstitutes({ country: "RO" });
    expect(res).not.toBeNull();
    expect(res!.totalStored).toBe(OFFLINE_INSTITUTES_LIMIT);
    expect(res!.rows).toHaveLength(OFFLINE_INSTITUTES_LIMIT);
    expect(res!.rows.some((r) => r.id === "inst-449")).toBe(true);
  });

  it("filters by category, diacritic-insensitive search, and sorts nearest-first by Haversine distance", () => {
    saveOfflineInstitutes("RO", [
      makeInstitute({
        id: "far-hosp",
        name: "Spitalul Județean Brașov",
        category: "hospital",
        city: "Brașov",
        lat: 45.6579,
        lng: 25.6012,
      }),
      makeInstitute({
        id: "near-hosp",
        name: "Spitalul Clinic Județean",
        category: "hospital",
        city: "Cluj-Napoca",
        lat: 46.768,
        lng: 23.588,
      }),
      makeInstitute({
        id: "near-pharm",
        name: "Farmacia Ștefan",
        category: "pharmacy",
        city: "Cluj-Napoca",
        lat: 46.77,
        lng: 23.59,
      }),
    ]);

    const hospitals = queryOfflineInstitutes({
      country: "RO",
      category: "hospital",
      point: { lat: 46.7712, lng: 23.6236 },
    });
    expect(hospitals?.rows.map((r) => r.id)).toEqual(["near-hosp", "far-hosp"]);
    expect(hospitals?.rows[0].distance_km).toBeLessThan(5);
    expect(hospitals?.rows[1].distance_km).toBeGreaterThan(150);

    const searchResult = queryOfflineInstitutes({
      country: "RO",
      search: "brasov",
    });
    expect(searchResult?.rows.map((r) => r.id)).toEqual(["far-hosp"]);

    const emptyFilter = queryOfflineInstitutes({
      country: "RO",
      category: "dentist",
    });
    expect(emptyFilter?.totalStored).toBe(3);
    expect(emptyFilter?.rows).toHaveLength(0);
  });

  it("warms country directory once per 24 hours and skips when offline", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          institutes: [makeInstitute({ id: "warm-1", name: "Farmacia Centrala" })],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    vi.stubGlobal("navigator", { onLine: false });
    await warmCountryInstitutes("RO");
    expect(fetchMock).not.toHaveBeenCalled();

    vi.stubGlobal("navigator", { onLine: true });
    await warmCountryInstitutes("RO");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(queryOfflineInstitutes({ country: "RO" })?.rows[0]?.id).toBe("warm-1");

    await warmCountryInstitutes("RO");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
