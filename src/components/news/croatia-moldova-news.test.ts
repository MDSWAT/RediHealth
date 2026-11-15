import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ALBANIA_COUNTIES_MAP } from "@/lib/geo/albania-counties";
import { CROATIA_COUNTIES_MAP } from "@/lib/geo/croatia-counties";
import { MOLDOVA_REGIONS_MAP } from "@/lib/geo/moldova-regions";
import {
  ALL_ALBANIA,
  ALL_CROATIA,
  ALL_ITALY,
  ALL_MOLDOVA,
  isAlbanianCounty,
  isCroatianCounty,
  isMoldovanRegion,
  mapCountriesForLang,
} from "@/components/ui/RomaniaCountyMap";
import { filterCountyModalGroups } from "@/components/news/CountyOverrideModal";
import { newsForPlace, placeCountry } from "@/components/news/PlaceNewsModal";
import { countyLabel, formatNewsDate, resolveNewsBasePath } from "@/components/news/news-format";
import { NEWS_ARTICLES, articleCountry, getLocalizedArticle } from "@/lib/data/news";
import { GLOSSARY_TRANSLATIONS, ROMANIAN_MEDICAL_GLOSSARY } from "@/lib/i18n/romanian-medical-glossary";
import { ROMANES_GLOSSARY_TERMS } from "@/lib/i18n/romanes-glossary";
import { getLangFromPathname, isSupportedLang, stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";

describe("Croatia and Moldova regional maps and conditional /news hub", () => {
  it("includes all 21 official Croatian županije (including Grad Zagreb) with valid SVG paths", () => {
    expect(CROATIA_COUNTIES_MAP.areas).toHaveLength(21);
    const names = CROATIA_COUNTIES_MAP.areas.map((a) => a.name);
    expect(names).toContain("Grad Zagreb");
    expect(names).toContain("Međimurska");
    expect(names).toContain("Splitsko-dalmatinska");
    expect(names).toContain("Brodsko-posavska");
    expect(names).toContain("Požeško-slavonska");
    expect(names).toContain("Dubrovačko-neretvanska");
    for (const area of CROATIA_COUNTIES_MAP.areas) {
      expect(area.d.startsWith("M")).toBe(true);
      expect(isCroatianCounty(area.name)).toBe(true);
    }
  });

  it("includes all 36 Moldovan administrative units (raioane, municipalities, Gagauzia, Left Bank) with valid SVG paths", () => {
    expect(MOLDOVA_REGIONS_MAP.areas).toHaveLength(36);
    const names = MOLDOVA_REGIONS_MAP.areas.map((a) => a.name);
    expect(names).toContain("Chișinău");
    expect(names).toContain("Bălți");
    expect(names).toContain("Bender");
    expect(names).toContain("Soroca");
    expect(names).toContain("Cahul");
    expect(names).toContain("Găgăuzia");
    expect(names).toContain("Stânga Nistrului");
    for (const area of MOLDOVA_REGIONS_MAP.areas) {
      expect(area.d.startsWith("M")).toBe(true);
      expect(isMoldovanRegion(area.name)).toBe(true);
    }
  });

  it("includes all 12 official Albanian qarqe with valid SVG paths", () => {
    expect(ALBANIA_COUNTIES_MAP.areas).toHaveLength(12);
    const names = ALBANIA_COUNTIES_MAP.areas.map((a) => a.name);
    expect(names).toEqual([
      "Berat",
      "Dibër",
      "Durrës",
      "Elbasan",
      "Fier",
      "Gjirokastër",
      "Korçë",
      "Kukës",
      "Lezhë",
      "Shkodër",
      "Tiranë",
      "Vlorë",
    ]);
    for (const area of ALBANIA_COUNTIES_MAP.areas) {
      expect(area.d.startsWith("M")).toBe(true);
      expect(isAlbanianCounty(area.name)).toBe(true);
    }
  });

  it("displays conditional maps by language: Italy for it, Croatia for hr, Albania for sq, Romania + Moldova for ro/en/rom", () => {
    expect(mapCountriesForLang("it")).toEqual(["it"]);
    expect(mapCountriesForLang("hr")).toEqual(["hr"]);
    expect(mapCountriesForLang("sq")).toEqual(["al"]);
    expect(mapCountriesForLang("ro")).toEqual(["ro", "md"]);
    expect(mapCountriesForLang("en")).toEqual(["ro", "md"]);
    expect(mapCountriesForLang("rom")).toEqual(["ro", "md"]);
  });

  it("isolates local and nationwide news per country with zero cross-country leakage (including shared name Călărași and Albania)", () => {
    const hrZagreb = newsForPlace("Grad Zagreb", NEWS_ARTICLES);
    expect(hrZagreb.local.length).toBeGreaterThan(0);
    expect(hrZagreb.national.length).toBeGreaterThan(0);
    expect([...hrZagreb.local, ...hrZagreb.national].every((a) => articleCountry(a) === "hr")).toBe(true);

    const alTirane = newsForPlace("Tiranë", NEWS_ARTICLES);
    expect(alTirane.local.length).toBeGreaterThan(0);
    expect(alTirane.national.length).toBeGreaterThan(0);
    expect([...alTirane.local, ...alTirane.national].every((a) => articleCountry(a) === "al")).toBe(true);

    const mdSoroca = newsForPlace("Soroca", NEWS_ARTICLES);
    expect(mdSoroca.local.length).toBeGreaterThan(0);
    expect(mdSoroca.national.length).toBeGreaterThan(0);
    expect([...mdSoroca.local, ...mdSoroca.national].every((a) => articleCountry(a) === "md")).toBe(true);

    const mdCalarasi = newsForPlace("Călărași", NEWS_ARTICLES, "md");
    expect([...mdCalarasi.local, ...mdCalarasi.national].every((a) => articleCountry(a) === "md")).toBe(true);

    const roCalarasi = newsForPlace("Călărași", NEWS_ARTICLES, "ro");
    expect([...roCalarasi.local, ...roCalarasi.national].every((a) => articleCountry(a) === "ro")).toBe(true);

    expect(placeCountry(ALL_CROATIA)).toBe("hr");
    expect(placeCountry(ALL_MOLDOVA)).toBe("md");
    expect(placeCountry(ALL_ITALY)).toBe("it");
    expect(placeCountry(ALL_ALBANIA)).toBe("al");
  });

  it("formats regional labels, dates, and /news vs /stiri base paths across hr and rom", () => {
    expect(countyLabel("Međimurska", "hr", "hr")).toBe("Međimurska županija");
    expect(countyLabel("Grad Zagreb", "hr", "hr")).toBe("Grad Zagreb");
    expect(countyLabel("Soroca", "ro", "md")).toBe("Raionul Soroca");
    expect(countyLabel("Chișinău", "rom", "md")).toBe("Foro Kishinau");
    expect(formatNewsDate("2026-11-09", "hr")).toBe("9. studenoga 2026.");
    expect(formatNewsDate("2026-11-09", "rom")).toBe("9 noyembro 2026");
    expect(resolveNewsBasePath("/hr/news")).toBe("/news");
    expect(resolveNewsBasePath("/rom/news/caravana-medicala-soroca-consultatii-gratuite")).toBe("/news");
    expect(resolveNewsBasePath("/ro/stiri")).toBe("/stiri");
  });
});

describe("Croatian (hr) and Common Romani (rom) clinical terminology and URL routing", () => {
  it("supports 2-letter hr and 3-letter rom locale prefixes cleanly in routing helpers", () => {
    expect(isSupportedLang("hr")).toBe(true);
    expect(isSupportedLang("rom")).toBe(true);
    expect(getLangFromPathname("/hr/news")).toBe("hr");
    expect(getLangFromPathname("/rom/news")).toBe("rom");
    expect(stripLangFromPathname("/rom/health-information")).toBe("/health-information");
    expect(withLangPrefix("/news", "rom")).toBe("/rom/news");
    expect(withLangPrefix("/news", "hr")).toBe("/hr/news");
  });

  it("translates every medical glossary entry and Romanes clinical glossary term into hr and rom", () => {
    for (const entry of ROMANIAN_MEDICAL_GLOSSARY) {
      expect(GLOSSARY_TRANSLATIONS.hr[entry.id]?.formalTerm.length).toBeGreaterThan(1);
      expect(GLOSSARY_TRANSLATIONS.hr[entry.id]?.layExplanation.length).toBeGreaterThan(5);
      expect(GLOSSARY_TRANSLATIONS.rom[entry.id]?.formalTerm.length).toBeGreaterThan(1);
      expect(GLOSSARY_TRANSLATIONS.rom[entry.id]?.layExplanation.length).toBeGreaterThan(5);
    }

    for (const term of ROMANES_GLOSSARY_TERMS) {
      expect(term.explanationByLang?.hr?.length).toBeGreaterThan(5);
      expect(term.explanationByLang?.rom?.length).toBeGreaterThan(5);
    }
  });

  it("localizes Moldova and Croatia news articles across all 6 languages", () => {
    const hrArticle = NEWS_ARTICLES.find((a) => a.id === "hr-mobilna-ambulanta-zagreb")!;
    const mdArticle = NEWS_ARTICLES.find((a) => a.id === "md-caravana-soroca")!;
    for (const lang of ["ro", "en", "sq", "it", "hr", "rom"] as const) {
      expect(getLocalizedArticle(hrArticle, lang).title.length).toBeGreaterThan(10);
      expect(getLocalizedArticle(mdArticle, lang).title.length).toBeGreaterThan(10);
    }
    expect(getLocalizedArticle(hrArticle, "hr").title).toContain("Mobilna ambulanta u Zagrebu");
    expect(getLocalizedArticle(mdArticle, "rom").summary).toContain("gudlo rat");
  });

  it("matches Moldova and Moldovan districts from CountyOverrideModal search when Romania + Moldova are active", () => {
    const moldoSearch = filterCountyModalGroups({
      searchTerm: "Moldo",
      effectiveCountry: "ro",
      availableCountries: ["ro", "md"],
      lang: "ro",
    });
    expect(moldoSearch).toHaveLength(1);
    expect(moldoSearch[0]?.country).toBe("md");
    expect(moldoSearch[0]?.heading).toBe("Moldova");
    expect(moldoSearch[0]?.items[0]).toEqual({ value: ALL_MOLDOVA, label: "Toată Moldova" });
    expect(moldoSearch[0]?.items.some((item) => item.value === "Chișinău")).toBe(true);

    const chisinauSearch = filterCountyModalGroups({
      searchTerm: "Chisinau",
      effectiveCountry: "ro",
      availableCountries: ["ro", "md"],
      lang: "ro",
    });
    expect(chisinauSearch).toHaveLength(1);
    expect(chisinauSearch[0]?.country).toBe("md");
    expect(chisinauSearch[0]?.items.map((item) => item.value)).toEqual(["Chișinău"]);

    const sharedCalarasi = filterCountyModalGroups({
      searchTerm: "Calarasi",
      effectiveCountry: "ro",
      availableCountries: ["ro", "md"],
      lang: "ro",
    });
    expect(sharedCalarasi.map((g) => g.country)).toEqual(["ro", "md"]);

    const singleCountryIt = filterCountyModalGroups({
      searchTerm: "Moldo",
      effectiveCountry: "it",
      availableCountries: ["it"],
      lang: "it",
    });
    expect(singleCountryIt).toEqual([]);
  });

  it("portals news sheets to document.body above sticky stacked sections and tracks visualViewport", () => {
    const countyModal = readFileSync(path.resolve(__dirname, "CountyOverrideModal.tsx"), "utf8");
    const placeModal = readFileSync(path.resolve(__dirname, "PlaceNewsModal.tsx"), "utf8");
    const sheetHook = readFileSync(path.resolve(__dirname, "use-sheet-dialog.ts"), "utf8");

    expect(countyModal).toContain("createPortal(");
    expect(countyModal).toContain("z-[80]");
    expect(countyModal).toContain("--sheet-vv-height");
    expect(placeModal).toContain("createPortal(");
    expect(placeModal).toContain("z-[80]");
    expect(sheetHook).toContain("window.visualViewport");
    expect(sheetHook).toContain("(pointer: coarse)");
  });
});
