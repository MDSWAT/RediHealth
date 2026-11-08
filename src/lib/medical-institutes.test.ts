import { describe, expect, it } from "vitest";
import {
  countryForLang,
  countryFromHeaders,
  langForCountry,
  normalizeInstitutePhone,
  validateInstituteInput,
} from "@/lib/medical-institutes";
import { mapOsmElement } from "@/lib/osm-import";

describe("country / language detection", () => {
  it("reads the visitor country from CDN headers", () => {
    expect(countryFromHeaders(new Headers({ "cf-ipcountry": "it" }))).toBe("IT");
    expect(countryFromHeaders(new Headers({ "x-vercel-ip-country": "AL" }))).toBe("AL");
    expect(countryFromHeaders(new Headers({ "cf-ipcountry": "XX" }))).toBeNull();
    expect(countryFromHeaders(new Headers())).toBeNull();
  });

  it("maps countries to site languages and back", () => {
    expect(langForCountry("RO")).toBe("ro");
    expect(langForCountry("MD")).toBe("ro");
    expect(langForCountry("XK")).toBe("sq");
    expect(langForCountry("IT")).toBe("it");
    expect(langForCountry("DE")).toBeNull();
    expect(countryForLang("sq")).toBe("AL");
    expect(countryForLang("en")).toBe("RO");
  });
});

describe("validateInstituteInput", () => {
  it("accepts and normalizes a valid institute", () => {
    const result = validateInstituteInput({
      name: "  Spitali  Rajonal ",
      country_code: "al",
      category: "hospital",
      lat: "41,3275",
      lng: 19.8187,
      website: "example.al",
      emergency: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      name: "Spitali Rajonal",
      country_code: "AL",
      lat: 41.3275,
      website: "https://example.al/",
      emergency: true,
      is_active: true,
      address: null,
    });
  });

  it("rejects missing names, unsupported countries and bad coordinates", () => {
    expect(validateInstituteInput({ country_code: "RO", lat: 1, lng: 1 }).ok).toBe(false);
    expect(validateInstituteInput({ name: "X", country_code: "DE", lat: 1, lng: 1 }).ok).toBe(false);
    expect(validateInstituteInput({ name: "X", country_code: "RO", lat: 120, lng: 1 }).ok).toBe(false);
    expect(validateInstituteInput({ name: "X", country_code: "RO", category: "spa", lat: 1, lng: 1 }).ok).toBe(false);
    expect(validateInstituteInput({ name: "X", country_code: "RO", lat: 1, lng: 1, website: "javascript:alert(1)" }).ok).toBe(false);
  });
});

describe("mapOsmElement", () => {
  it("maps OSM tags to an institute row", () => {
    const row = mapOsmElement(
      {
        type: "way",
        id: 42,
        center: { lat: 45.1234567, lon: 9.1 },
        tags: {
          amenity: "hospital",
          name: "Ospedale Maggiore",
          "addr:street": "Via Roma",
          "addr:housenumber": "1",
          "addr:city": "Milano",
          phone: "+39 02 1234; +39 02 5678",
          website: "ospedale.it",
          opening_hours: "24/7",
          emergency: "yes",
        },
      },
      "IT",
      "clinic",
    );
    expect(row).toEqual({
      osm_ref: "way/42",
      country_code: "IT",
      name: "Ospedale Maggiore",
      category: "hospital",
      address: "Via Roma 1",
      city: "Milano",
      phone: "+39 02 1234",
      website: "https://ospedale.it",
      hours: "24/7",
      emergency: true,
      lat: 45.123457,
      lng: 9.1,
    });
  });

  it("skips unnamed, disused or position-less elements", () => {
    expect(mapOsmElement({ type: "node", id: 1, lat: 1, lon: 1, tags: { amenity: "pharmacy" } }, "RO", "pharmacy")).toBeNull();
    expect(mapOsmElement({ type: "node", id: 2, tags: { name: "A" } }, "RO", "pharmacy")).toBeNull();
    expect(
      mapOsmElement({ type: "node", id: 3, lat: 1, lon: 1, tags: { name: "A", disused: "yes" } }, "RO", "pharmacy"),
    ).toBeNull();
  });
});

describe("Italian phone numbers", () => {
  // Real shapes seen in the OpenStreetMap import, including "Farmacia Castro Pretorio" in Rome,
  // which showed the Afghanistan code (+93) in front of a Rome landline.
  const raw = [
    "+93 06 491813",
    "+44 0814003125",
    "0815752610",
    "3455219773",
    "0039 02 1234567",
    "+39 06 4991 1234",
    "+390612345678",
    "0823 232167 (direttore)",
    "06 1234567; 06 7654321",
  ];

  it("start with +39 after normalization", () => {
    for (const phone of raw) {
      const normalized = normalizeInstitutePhone(phone, "IT")!;
      for (const part of normalized.split("; ")) expect(part, phone).toMatch(/^\+39/);
    }
  });

  it("keeps the Italian leading 0 and the rest of the number", () => {
    expect(normalizeInstitutePhone("+93 06 491813", "IT")).toBe("+39 06 491813");
    expect(normalizeInstitutePhone("+44 0814003125", "IT")).toBe("+39 0814003125");
    expect(normalizeInstitutePhone("0815752610", "IT")).toBe("+39 0815752610");
    expect(normalizeInstitutePhone("0039 02 1234567", "IT")).toBe("+39 02 1234567");
    expect(normalizeInstitutePhone("06 1234567; 06 7654321", "IT")).toBe("+39 06 1234567; +39 06 7654321");
  });

  it("is applied on import and on admin input", () => {
    const row = mapOsmElement(
      { type: "node", id: 25129, lat: 41.902265, lon: 12.504937, tags: { name: "Farmacia Castro Pretorio", amenity: "pharmacy", phone: "+93 06 491813" } },
      "IT",
      "pharmacy",
    );
    expect(row?.phone).toBe("+39 06 491813");
    const input = validateInstituteInput({ name: "Farmacia", country_code: "it", lat: 41.9, lng: 12.5, phone: "06 491813" });
    expect(input.ok && input.value.phone).toBe("+39 06 491813");
  });

  it("leaves other countries alone", () => {
    expect(normalizeInstitutePhone("0213 456 789", "RO")).toBe("0213 456 789");
    expect(normalizeInstitutePhone("+355 4 222 3344", "AL")).toBe("+355 4 222 3344");
    expect(normalizeInstitutePhone(null, "IT")).toBeNull();
  });
});
