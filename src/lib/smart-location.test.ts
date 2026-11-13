import { describe, expect, it } from "vitest";
import { calendarCopy } from "@/components/telemed/AppointmentBookingCalendar";
import { findHelpTranslations } from "@/lib/i18n/find-help-translations";
import type { Lang } from "@/lib/i18n/translations";
import {
  FIND_HELP_LOCATION_STORAGE_KEY,
  inferCountryFromBrowserLocales,
  inferCountryFromTimeZone,
  readSavedFindHelpLocation,
  resolveSmartLocation,
  writeSavedFindHelpLocation,
  type SavedFindHelpLocation,
} from "@/lib/smart-location";

const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

describe("smart location guessing and persistence", () => {
  it("infers partner countries from timezone and BCP-47 browser locales", () => {
    expect(inferCountryFromTimeZone("Europe/Bucharest")).toBe("RO");
    expect(inferCountryFromTimeZone("Europe/Chisinau")).toBe("MD");
    expect(inferCountryFromTimeZone("Europe/Tirane")).toBe("AL");
    expect(inferCountryFromTimeZone("Europe/Rome")).toBe("IT");
    expect(inferCountryFromTimeZone("Europe/Zagreb")).toBe("HR");
    expect(inferCountryFromTimeZone("America/New_York")).toBeNull();

    expect(inferCountryFromBrowserLocales(["en-US", "ro-MD"])).toBe("MD");
    expect(inferCountryFromBrowserLocales(["sq-XK"])).toBe("AL");
    expect(inferCountryFromBrowserLocales(["it"])).toBe("IT");
    expect(inferCountryFromBrowserLocales(["hr"])).toBe("HR");
    expect(inferCountryFromBrowserLocales(["ru"])).toBe("MD");
    expect(inferCountryFromBrowserLocales(["de-DE"])).toBeNull();
  });

  it("guesses the primary city for every language when no ambient region exists", () => {
    expect(resolveSmartLocation({ lang: "ro" })).toMatchObject({
      mode: "city",
      country: "RO",
      reason: "language",
      city: { name: "București", country: "RO" },
    });
    expect(resolveSmartLocation({ lang: "sq" })).toMatchObject({
      mode: "city",
      country: "AL",
      reason: "language",
      city: { name: "Tiranë", country: "AL" },
    });
    expect(resolveSmartLocation({ lang: "it" })).toMatchObject({
      mode: "city",
      country: "IT",
      reason: "language",
      city: { name: "Roma", country: "IT" },
    });
    expect(resolveSmartLocation({ lang: "hr" })).toMatchObject({
      mode: "city",
      country: "HR",
      reason: "language",
      city: { name: "Zagreb", country: "HR" },
    });
    expect(resolveSmartLocation({ lang: "ru" })).toMatchObject({
      mode: "city",
      country: "MD",
      reason: "language",
      city: { name: "Chișinău", country: "MD" },
    });
    const enDefault = resolveSmartLocation({ lang: "en" });
    expect(enDefault).toMatchObject({
      mode: "city",
      country: "RO",
      reason: "language",
      city: { name: "București", country: "RO" },
    });
    expect(enDefault.suggestions.map((s) => `${s.name}:${s.country}`)).toEqual([
      "București:RO",
      "Roma:IT",
      "Zagreb:HR",
      "Tiranë:AL",
      "Chișinău:MD",
    ]);
    const romDefault = resolveSmartLocation({ lang: "rom" });
    expect(romDefault.suggestions.map((s) => s.country)).toEqual(["RO", "IT", "HR", "AL", "MD"]);
  });

  it("disambiguates Romania vs Moldova on Romanian via timezone, locale tag, and CDN IP", () => {
    expect(resolveSmartLocation({ lang: "ro", timeZone: "Europe/Chisinau" })).toMatchObject({
      country: "MD",
      reason: "region",
      city: { name: "Chișinău", country: "MD" },
    });
    expect(resolveSmartLocation({ lang: "ro", browserLocales: ["ro-MD"] })).toMatchObject({
      country: "MD",
      reason: "region",
      city: { name: "Chișinău", country: "MD" },
    });
    expect(resolveSmartLocation({ lang: "ro", ipCountry: "MD" })).toMatchObject({
      country: "MD",
      reason: "region",
      city: { name: "Chișinău", country: "MD" },
    });
    expect(resolveSmartLocation({ lang: "ro", ipCountry: "IT" })).toMatchObject({
      country: "RO",
      reason: "language",
      city: { name: "București", country: "RO" },
    });
    const diasporaRO = resolveSmartLocation({ lang: "ro", timeZone: "Europe/Rome" });
    expect(diasporaRO.city?.name).toBe("București");
    expect(diasporaRO.suggestions[1]).toMatchObject({ name: "Roma", country: "IT" });
  });

  it("detects region for en and rom from timezone, browser locale, or IP", () => {
    expect(resolveSmartLocation({ lang: "en", timeZone: "Europe/Rome" })).toMatchObject({
      country: "IT",
      reason: "region",
      city: { name: "Roma", country: "IT" },
    });
    expect(resolveSmartLocation({ lang: "en", timeZone: "Europe/Zagreb" })).toMatchObject({
      country: "HR",
      reason: "region",
      city: { name: "Zagreb", country: "HR" },
    });
    expect(resolveSmartLocation({ lang: "rom", timeZone: "Europe/Tirane" })).toMatchObject({
      country: "AL",
      reason: "region",
      city: { name: "Tiranë", country: "AL" },
    });
    expect(resolveSmartLocation({ lang: "en", browserLocales: ["it-IT"] })).toMatchObject({
      country: "IT",
      reason: "region",
      city: { name: "Roma", country: "IT" },
    });
  });

  it("restores savedChoice on matching language or en/rom, and re-guesses when switching specific languages", () => {
    const storage = createMemoryStorage();
    const saved: SavedFindHelpLocation = {
      mode: "city",
      country: "RO",
      cityName: "Cluj-Napoca",
      lat: 46.7712,
      lng: 23.6236,
      chosenOnLang: "ro",
    };
    writeSavedFindHelpLocation(saved, storage);
    expect(storage.getItem(FIND_HELP_LOCATION_STORAGE_KEY)).toBeTruthy();
    expect(readSavedFindHelpLocation(storage)).toEqual(saved);

    expect(resolveSmartLocation({ lang: "ro", savedChoice: saved })).toMatchObject({
      mode: "city",
      country: "RO",
      reason: "saved",
      city: { name: "Cluj-Napoca", country: "RO" },
    });
    expect(resolveSmartLocation({ lang: "en", savedChoice: saved })).toMatchObject({
      mode: "city",
      country: "RO",
      reason: "saved",
      city: { name: "Cluj-Napoca", country: "RO" },
    });
    expect(resolveSmartLocation({ lang: "it", savedChoice: saved })).toMatchObject({
      mode: "city",
      country: "IT",
      reason: "language",
      city: { name: "Roma", country: "IT" },
    });
  });

  it("provides clean sentence-cased copy with zero ampersands or middle dots for smart location and booking panel", () => {
    for (const lang of ALL_LANGS) {
      const f = findHelpTranslations[lang];
      const byLang = f.suggestedByLanguage("București", "România");
      const byRegion = f.suggestedByRegion("București", "România");
      const whole = f.wholeCountryOption("România");
      for (const str of [byLang, byRegion, f.quickSuggestionsLabel, whole]) {
        expect(str.trim().length).toBeGreaterThan(0);
        expect(str).not.toContain("&");
        expect(str).not.toContain("·");
        // Sentence case: first letter uppercase, rest of words not Title Case (except proper nouns/country).
        expect(str[0]).toBe(str[0].toUpperCase());
      }

      const cal = calendarCopy[lang];
      const calStrings = [
        cal.summaryHeading,
        cal.summaryDayLabel,
        cal.summaryTimeLabel,
        cal.summaryTimePending,
        cal.howItWorksHeading,
        ...cal.howItWorksItems.flatMap(([title, desc]) => [title, desc]),
      ];
      for (const str of calStrings) {
        expect(str.trim().length).toBeGreaterThan(0);
        expect(str).not.toContain("&");
        expect(str).not.toContain("·");
        expect(str[0]).toBe(str[0].toUpperCase());
      }
      expect(cal.howItWorksItems).toHaveLength(3);
    }
  });
});
