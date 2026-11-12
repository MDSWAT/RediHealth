import { stripLangFromPathname } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { ROMANIA_COUNTIES_MAP } from "@/lib/geo/romania-counties";
import { MOLDOVA_REGIONS_MAP } from "@/lib/geo/moldova-regions";
import { CROATIA_COUNTIES_MAP } from "@/lib/geo/croatia-counties";
import { ITALY_REGIONS_MAP } from "@/lib/geo/italy-regions";
import { ALBANIA_COUNTIES_MAP } from "@/lib/geo/albania-counties";

export type GeoCountryCode = "ro" | "md" | "it" | "hr" | "al";

/**
 * Deterministic date formatting for news items.
 * Intl month names differ between the server's ICU data and some browsers (Albanian and Romani
 * are often missing), which made server and client disagree and broke hydration. A fixed table cannot drift.
 */
const MONTHS: Record<Lang, { long: string[]; short: string[] }> = {
  ru: {
    long: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "Октябрь", "ноябрь", "декабрь"],
    short: ["Ян", "февраль", "Мар", "апрель", "май", "июнь", "июль", "август", "Сентябрь", "октябрь", "ноябрь", "декабрь"],
  },

  ro: {
    long: ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"],
    short: ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."],
  },
  en: {
    long: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  sq: {
    long: ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"],
    short: ["jan", "shk", "mar", "pri", "maj", "qer", "korr", "gush", "sht", "tet", "nën", "dhj"],
  },
  it: {
    long: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
    short: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
  },
  hr: {
    long: ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"],
    short: ["sij.", "velj.", "ožu.", "tra.", "svi.", "lip.", "srp.", "kol.", "ruj.", "lis.", "stu.", "pro."],
  },
  rom: {
    long: ["yanvari", "februari", "marto", "aprilo", "mayo", "yuniyo", "yuliyo", "avgusto", "septembro", "oktombro", "noyembro", "dekembro"],
    short: ["yan.", "feb.", "mar.", "apr.", "may", "yun.", "yul.", "avg.", "sep.", "okt.", "noy.", "dek."],
  },
};

const RO_MONTH_INDEX: Record<string, number> = Object.fromEntries(MONTHS.ro.long.map((m, i) => [m, i]));
const HR_MONTH_INDEX: Record<string, number> = Object.fromEntries(MONTHS.hr.long.map((m, i) => [m, i]));

/** Reads "2026-11-04", Romanian "4 noiembrie 2026", or Croatian "4. studenoga 2026."; null for anything else. */
function parseNewsDate(value: string): { y: number; m: number; d: number } | null {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return { y: Number(iso[1]), m: Number(iso[2]) - 1, d: Number(iso[3]) };
  const ro = value.match(/^(\d{1,2})\.?\s+([a-zăâîșțčćđšž]+)\s+(\d{4})\.?$/i);
  if (ro) {
    const key = ro[2].toLowerCase();
    const m = RO_MONTH_INDEX[key] ?? HR_MONTH_INDEX[key];
    if (m !== undefined) return { y: Number(ro[3]), m, d: Number(ro[1]) };
  }
  return null;
}

/** "4 noiembrie 2026", "4 November 2026", "4. studenoga 2026.", etc. Unknown formats pass through. */
export function formatNewsDate(value: string, lang: Lang, { short = false, year = true } = {}): string {
  if (!value) return "";
  const parsed = parseNewsDate(value);
  if (!parsed) return value;
  const names = MONTHS[lang] ?? MONTHS.ro;
  const month = (short ? names.short : names.long)[parsed.m];
  if (lang === "hr") {
    return year ? `${parsed.d}. ${month} ${parsed.y}.` : `${parsed.d}. ${month}`;
  }
  return year ? `${parsed.d} ${month} ${parsed.y}` : `${parsed.d} ${month}`;
}

/** Places whose name has established forms across the supported languages. */
const PLACE_EXONYMS: Record<string, Record<Lang, string>> = {
  "București": {
"ru": "Бухарест",

    ro: "București",
    en: "Bucharest",
    sq: "Bukureshti",
    it: "Bucarest",
    hr: "Bukurešt",
    rom: "Bukureshti",
  },
  "Chișinău": {
"ru": "Кишинэу",

    ro: "Chișinău",
    en: "Chișinău",
    sq: "Kishineu",
    it: "Chișinău",
    hr: "Kišinjev",
    rom: "Kishinau",
  },
  "Găgăuzia": {
"ru": "Гагаузия",

    ro: "Găgăuzia",
    en: "Gagauzia",
    sq: "Gagauzia",
    it: "Gagauzia",
    hr: "Gagauzija",
    rom: "Gagauziya",
  },
  "Stânga Nistrului": {
"ru": "Левобережье Днестра",

    ro: "Stânga Nistrului",
    en: "Left Bank of the Dniester",
    sq: "Bregu i Majtë i Dniestrit",
    it: "Riva sinistra del Nistro",
    hr: "Lijeva obala Dnjestra",
    rom: "Stinga Nistruski",
  },
  "Grad Zagreb": {
"ru": "Город Загреб",

    ro: "Orașul Zagreb",
    en: "City of Zagreb",
    sq: "Qyteti i Zagrebit",
    it: "Città di Zagabria",
    hr: "Grad Zagreb",
    rom: "Foro Zagreb",
  },
  "Tiranë": {
"ru": "Тирана",

    ro: "Tirana",
    en: "Tirana",
    sq: "Tiranë",
    it: "Tirana",
    hr: "Tirana",
    rom: "Tirana",
  },
  "Shkodër": {
"ru": "Шкодер",

    ro: "Shkodër",
    en: "Shkodër",
    sq: "Shkodër",
    it: "Scutari",
    hr: "Shkodër",
    rom: "Shkodra",
  },
  "Durrës": {
"ru": "Дуррес",

    ro: "Durrës",
    en: "Durrës",
    sq: "Durrës",
    it: "Durazzo",
    hr: "Durrës",
    rom: "Durres",
  },
  "Vlorë": {
"ru": "Влёра",

    ro: "Vlorë",
    en: "Vlorë",
    sq: "Vlorë",
    it: "Valona",
    hr: "Vlorë",
    rom: "Vlora",
  },
  "Korçë": {
"ru": "Корча",

    ro: "Korçë",
    en: "Korçë",
    sq: "Korçë",
    it: "Coriza",
    hr: "Korçë",
    rom: "Korcha",
  },
  "Gjirokastër": {
"ru": "Гирокастра",

    ro: "Gjirokastër",
    en: "Gjirokastër",
    sq: "Gjirokastër",
    it: "Argirocastro",
    hr: "Gjirokastër",
    rom: "Gjirokastra",
  },
};

const RO_SET = new Set(ROMANIA_COUNTIES_MAP.areas.map((a) => a.name));
const MD_SET = new Set(MOLDOVA_REGIONS_MAP.areas.map((a) => a.name));
const HR_SET = new Set(CROATIA_COUNTIES_MAP.areas.map((a) => a.name));
const IT_SET = new Set(ITALY_REGIONS_MAP.areas.map((a) => a.name));
const AL_SET = new Set(ALBANIA_COUNTIES_MAP.areas.map((a) => a.name));

const MOLDOVA_MUNICIPALITIES = new Set(["Chișinău", "Bălți", "Bender"]);

function inferAreaCountry(area: string, countryHint?: GeoCountryCode): GeoCountryCode {
  if (countryHint) return countryHint;
  if (AL_SET.has(area)) return "al";
  if (IT_SET.has(area)) return "it";
  if (HR_SET.has(area)) return "hr";
  if (MD_SET.has(area) && !RO_SET.has(area)) return "md";
  return "ro";
}

/** A place name as readers of `lang` write it ("Bucharest" in English); other names pass through. */
export function placeName(place: string, lang: Lang): string {
  const table = PLACE_EXONYMS[place];
  return table ? (table[lang] ?? place) : place;
}

/**
 * Formats an administrative area in the reader's word order:
 * - Romania: "Județul Iași" / "Iași County", while "București" stands on its own.
 * - Moldova: "Raionul Soroca" / "Municipiul Chișinău" / "UTA Găgăuzia" / "Stânga Nistrului".
 * - Croatia: "Međimurska županija" (Croatian county names are adjectives), while "Grad Zagreb" stands on its own.
 * - Italy: regional name as-is ("Lazio", "Lombardia").
 */
export function countyLabel(county: string, lang: Lang, countryHint?: GeoCountryCode): string {
  const country = inferAreaCountry(county, countryHint);

  if (country === "it") {
    return placeName(county, lang);
  }

  if (country === "al") {
    const p = placeName(county, lang);
    switch (lang) {
      case "sq":
        return `Qarku ${county}`;
      case "en":
        return `${p} County`;
      case "ro":
        return `Regiunea ${p}`;
      case "it":
        return `Prefettura di ${p}`;
      case "hr":
        return `Okrug ${p}`;
      case "rom":
        return `Qarko ${p}`;
    }
  }

  if (country === "hr") {
    if (county === "Grad Zagreb") return placeName(county, lang);
    switch (lang) {
      case "hr":
        return `${county} županija`;
      case "en":
        return `${county} County`;
      case "ro":
        return `Comitatul ${county}`;
      case "sq":
        return `Qarku ${county}`;
      case "it":
        return `Regione ${county}`;
      case "rom":
        return `Zhupaniya ${county}`;
    }
  }

  if (country === "md") {
    if (county === "Găgăuzia") {
      return lang === "ro" ? "UTA Găgăuzia" : placeName(county, lang);
    }
    if (county === "Stânga Nistrului") {
      return placeName(county, lang);
    }
    if (MOLDOVA_MUNICIPALITIES.has(county)) {
      const p = placeName(county, lang);
      switch (lang) {
        case "en":
          return `${p} Municipality`;
        case "sq":
          return `Bashkia ${p}`;
        case "it":
          return `Municipio di ${p}`;
        case "hr":
          return `Grad ${p}`;
        case "rom":
          return `Foro ${p}`;
        default:
          return `Municipiul ${p}`;
      }
    }
    switch (lang) {
      case "en":
        return `${county} District`;
      case "sq":
        return `Rajoni ${county}`;
      case "it":
        return `Distretto di ${county}`;
      case "hr":
        return `Rajon ${county}`;
      case "rom":
        return `Rayono ${county}`;
      default:
        return `Raionul ${county}`;
    }
  }

  // Romania ("ro")
  if (county === "București") return placeName(county, lang);
  switch (lang) {
    case "ru":
      return `Уезд ${county}`;
    case "en":
      return `${county} County`;
    case "sq":
      return `Qarku ${county}`;
    case "it":
      return `Provincia di ${county}`;
    case "hr":
      return `Okrug ${county}`;
    case "rom":
      return `Judeto ${county}`;
    default:
      return `Județul ${county}`;
  }
}

/** Lower case without diacritics, so "iasi" finds "Iași", "cakovec"/"medimurska" finds "Međimurska", etc. */
export function foldForSearch(value: string): string {
  return value
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("ro")
    .trim();
}

/** A typed search term quoted the way each language quotes. */
export function quoteTerm(term: string, lang: Lang): string {
  if (lang === "ro" || lang === "hr" || lang === "rom") return `„${term}”`;
  if (lang === "it") return `«${term}»`;
  return `“${term}”`;
}

/** Preserves `/news` when the reader opened the hub or article via `/news`, defaulting to `/stiri`. */
export function resolveNewsBasePath(pathname: string | null | undefined): "/news" | "/stiri" {
  const clean = stripLangFromPathname(pathname || "");
  return clean === "/news" || clean.startsWith("/news/") ? "/news" : "/stiri";
}

export const newsPageDescriptions: Record<Lang, string> = {
"ru": "Новости здоровья, выездные клиники и кампании вакцинации рядом с вами.",

  ro: "Alerte de sănătate, caravane medicale și campanii de vaccinare din județul sau raionul tău.",
  en: "Health alerts, mobile clinics and vaccination campaigns near you.",
  sq: "Njoftime shëndetësore, karvane mjekësore dhe fushata vaksinimi pranë teje.",
  it: "Avvisi sanitari, ambulatori mobili e campagne di vaccinazione vicino a te.",
  hr: "Zdravstvena upozorenja, mobilne ambulante i akcije cijepljenja u tvojoj županiji.",
  rom: "Sastipnaske alerte, mobilne klinike thaj vakcinaciyake kampaniye pasha tute.",
};
