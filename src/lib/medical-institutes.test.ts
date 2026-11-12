import { describe, expect, it } from "vitest";
import {
  SUPPORTED_COUNTRIES,
  countryForLang,
  countryFromHeaders,
  langForCountry,
  normalizeInstitutePhone,
  normalizeInstituteWebsite,
  primaryPhoneHref,
  validateInstituteInput,
} from "@/lib/medical-institutes";
import { deduplicateOsmRows, mapOsmElement } from "@/lib/osm-import";
import { findHelpTranslations } from "@/lib/i18n/find-help-translations";
import { FIND_HELP_LINKS } from "@/lib/i18n/find-help-links";
import { languages } from "@/lib/i18n/translations";

describe("country / language detection", () => {
  it("reads the visitor country from CDN headers", () => {
    expect(countryFromHeaders(new Headers({ "cf-ipcountry": "it" }))).toBe("IT");
    expect(countryFromHeaders(new Headers({ "cf-ipcountry": "hr" }))).toBe("HR");
    expect(countryFromHeaders(new Headers({ "x-vercel-ip-country": "AL" }))).toBe("AL");
    expect(countryFromHeaders(new Headers({ "cf-ipcountry": "XX" }))).toBeNull();
    expect(countryFromHeaders(new Headers())).toBeNull();
  });

  it("maps countries to site languages and back", () => {
    expect(langForCountry("RO")).toBe("ro");
    expect(langForCountry("MD")).toBe("ro");
    expect(langForCountry("XK")).toBe("sq");
    expect(langForCountry("IT")).toBe("it");
    expect(langForCountry("HR")).toBe("hr");
    expect(langForCountry("DE")).toBeNull();
    expect(countryForLang("sq")).toBe("AL");
    expect(countryForLang("hr")).toBe("HR");
    expect(countryForLang("rom")).toBe("RO");
    expect(countryForLang("en")).toBe("RO");
  });

  it("provides find-help translations and country labels for every language and supported country", () => {
    for (const { code: lang } of languages) {
      expect(findHelpTranslations[lang]).toBeDefined();
      expect(FIND_HELP_LINKS[lang]).toBeDefined();
      for (const country of SUPPORTED_COUNTRIES) {
        expect(findHelpTranslations[lang].countries[country]).toBeTruthy();
      }
    }
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

  it("keeps unnamed health points, but skips disused or position-less elements", () => {
    expect(mapOsmElement({ type: "node", id: 1, lat: 1, lon: 1, tags: { amenity: "pharmacy" } }, "RO", "pharmacy")?.name).toBe("Pharmacy");
    expect(mapOsmElement({ type: "node", id: 2, tags: { name: "A" } }, "RO", "pharmacy")).toBeNull();
    expect(
      mapOsmElement({ type: "node", id: 3, lat: 1, lon: 1, tags: { name: "A", disused: "yes" } }, "RO", "pharmacy"),
    ).toBeNull();
    expect(
      mapOsmElement({ type: "node", id: 4, lat: 45.8, lon: 15.9, tags: { name: "118", amenity: "hospital" } }, "IT", "hospital"),
    ).toBeNull();
    expect(
      mapOsmElement(
        { type: "node", id: 5, lat: 45.8, lon: 15.9, tags: { name: "Poljoprivredna ljekarna", amenity: "pharmacy" } },
        "HR",
        "pharmacy",
      ),
    ).toBeNull();
    expect(
      mapOsmElement(
        { type: "node", id: 6, lat: 44.4, lon: 26.1, tags: { name: "Cabinet Medical Veterinar", amenity: "hospital" } },
        "RO",
        "hospital",
      ),
    ).toBeNull();
  });

  it("maps Croatian contact tags, emergency institutes and deduplicates co-located node + way pairs", () => {
    const way = mapOsmElement(
      {
        type: "way",
        id: 100,
        center: { lat: 45.8261, lon: 16.0042 },
        tags: {
          amenity: "hospital",
          "name:hr": "Klinički bolnički centar Zagreb",
          "contact:street": "Kišpatićeva ulica",
          "contact:housenumber": "12",
          "contact:city": "Zagreb",
          website: "https:// www.kbc-zagreb.hr",
        },
      },
      "HR",
      "hospital",
    )!;
    const node = mapOsmElement(
      {
        type: "node",
        id: 101,
        lat: 45.8262,
        lon: 16.0043,
        tags: {
          amenity: "hospital",
          name: "Klinički bolnički centar Zagreb",
          phone: "00385 1 2388 888",
          emergency: "yes",
        },
      },
      "HR",
      "hospital",
    )!;
    const merged = deduplicateOsmRows([node, way]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      osm_ref: "way/100",
      country_code: "HR",
      name: "Klinički bolnički centar Zagreb",
      address: "Kišpatićeva ulica 12",
      city: "Zagreb",
      phone: "+385 1 2388 888",
      website: "https://www.kbc-zagreb.hr",
      emergency: true,
    });
  });
});

describe("website and phone helpers", () => {
  it("rejects email addresses masquerading as websites while preserving @ in URL paths", () => {
    expect(normalizeInstituteWebsite("http://joyvetbucuresti@gmail.com")).toBeNull();
    expect(normalizeInstituteWebsite("office@natisan.ro")).toBeNull();
    expect(normalizeInstituteWebsite("https:// ruganihospital.it")).toBe("https://ruganihospital.it/");
    expect(normalizeInstituteWebsite("https://www.dongnocchi.it/@strutture/centro")).toBe(
      "https://www.dongnocchi.it/@strutture/centro",
    );
  });

  it("normalizes common dial-code typos and creates single-number tel: links", () => {
    expect(normalizeInstitutePhone("+4 021 3173245", "RO")).toBe("+40 021 3173245");
    expect(normalizeInstitutePhone("00385 1 4812 345", "HR")).toBe("+385 1 4812 345");
    expect(primaryPhoneHref("+39 06 1234567; +39 06 7654321")).toBe("tel:+39061234567");
    expect(primaryPhoneHref("01/4812-345")).toBe("tel:014812345");
  });

  it("imports Moldovan names in Romanian or Russian and additional healthcare types", () => {
    const element = { type: "node" as const, id: 14, lat: 47, lon: 28.8 };
    expect(mapOsmElement({ ...element, tags: { healthcare: "laboratory", "name:ro": "Laborator medical" } }, "MD", "other"))
      .toMatchObject({ name: "Laborator medical", category: "clinic", country_code: "MD" });
    expect(mapOsmElement({ ...element, tags: { healthcare: "clinic", "name:ru": "Медицинский центр" } }, "MD", "clinic")?.name)
      .toBe("Медицинский центр");
    const inactiveTags: Record<string, string>[] = [{ healthcare: "no" }, { "disused:healthcare": "clinic" }, { closed: "yes" }];
    for (const tags of inactiveTags) {
      expect(mapOsmElement({ ...element, tags }, "MD", "clinic")).toBeNull();
    }
    expect(mapOsmElement({ ...element, lat: NaN }, "MD", "clinic")).toBeNull();
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
