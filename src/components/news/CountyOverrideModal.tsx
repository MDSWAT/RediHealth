"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ROMANIAN_COUNTIES } from "@/lib/romanian-counties";
import { MOLDOVA_REGIONS_MAP } from "@/lib/geo/moldova-regions";
import { CROATIA_COUNTIES_MAP } from "@/lib/geo/croatia-counties";
import { ITALY_REGIONS_MAP } from "@/lib/geo/italy-regions";
import { ALBANIA_COUNTIES_MAP } from "@/lib/geo/albania-counties";
import { CheckIcon, CloseIcon, SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { countyLabel, foldForSearch, placeName, quoteTerm } from "@/components/news/news-format";
import { useSheetDialog } from "@/components/news/use-sheet-dialog";
import {
  ALL_ALBANIA,
  ALL_CROATIA,
  ALL_ITALY,
  ALL_MOLDOVA,
  EXTRA_MAP_COPY,
  mapCountriesForLang,
  type MapCountry,
} from "@/components/ui/RomaniaCountyMap";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    const lang = ctx?.lang || "ro";
    return { lang, t: ctx?.t ?? translations[lang] ?? translations.ro };
  } catch {
    return { lang: "ro" as const, t: translations.ro };
  }
}

export type CountyOverrideModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCounty: string;
  onSelectCounty: (county: string, country: MapCountry) => void;
  country?: MapCountry;
  countries?: MapCountry[];
};

const NATIONAL_RO = "Toate județele";

const MODAL_COUNTRY_COPY: Record<Lang, Record<Exclude<MapCountry, "ro">, { title: string; subtitle: string; search: string }>> = {
"ru": {
"al": {"title":"Выберите регион Албании","subtitle":"Медицинские новости и выездные клиники вашего региона.","search":"Поиск региона…"},
"md":{"title":"Выберите район Молдовы","subtitle":"Медицинские новости и выездные клиники вашего района.","search":"Поиск района или муниципия…"},"hr":{"title":"Выберите жупанию Хорватии","subtitle":"Медицинские новости и выездные клиники вашей жупании.","search":"Поиск жупании…"},"it":{"title":"Выберите регион Италии","subtitle":"Медицинские новости и выездные клиники вашего региона.","search":"Поиск региона…"}},

  ro: {
    md: { title: "Alege un raion din Moldova", subtitle: "Vezi alertele și caravanele din raionul ales.", search: "Caută raionul sau municipiul..." },
    hr: { title: "Alege un comitat din Croația", subtitle: "Vezi alertele și clinicile mobile din zona aleasă.", search: "Caută comitatul..." },
    it: { title: "Alege o regiune din Italia", subtitle: "Vezi avizele și clinicile mobile din regiunea aleasă.", search: "Caută regiunea..." },
    al: { title: "Alege o regiune din Albania", subtitle: "Vezi alertele și caravanele din regiunea aleasă.", search: "Caută regiunea..." },
  },
  en: {
    md: { title: "Choose a district in Moldova", subtitle: "See health alerts and mobile clinics for your district.", search: "Search district or municipality..." },
    hr: { title: "Choose a county in Croatia", subtitle: "See health alerts and mobile clinics for your county.", search: "Search county..." },
    it: { title: "Choose a region in Italy", subtitle: "See health alerts and mobile clinics for your region.", search: "Search region..." },
    al: { title: "Choose a county in Albania", subtitle: "See health alerts and mobile clinics for your county.", search: "Search county..." },
  },
  sq: {
    md: { title: "Zgjidh një rajon në Moldavi", subtitle: "Shiko njoftimet dhe karvanet për rajonin e zgjedhur.", search: "Kërko rajonin..." },
    hr: { title: "Zgjidh një qark në Kroaci", subtitle: "Shiko njoftimet dhe klinikat lëvizëse për qarkun e zgjedhur.", search: "Kërko qarkun..." },
    it: { title: "Zgjidh një rajon në Itali", subtitle: "Shiko njoftimet dhe klinikat lëvizëse për rajonin e zgjedhur.", search: "Kërko rajonin..." },
    al: { title: "Zgjidh një qark në Shqipëri", subtitle: "Shiko njoftimet shëndetësore dhe karvanet mjekësore pranë teje.", search: "Kërko qarkun..." },
  },
  it: {
    md: { title: "Scegli un distretto della Moldavia", subtitle: "Vedi gli avvisi e gli ambulatori mobili del distretto.", search: "Cerca distretto..." },
    hr: { title: "Scegli una regione della Croazia", subtitle: "Vedi gli avvisi e gli ambulatori mobili della regione.", search: "Cerca regione..." },
    it: { title: "Scegli la tua regione", subtitle: "Vedi gli avvisi sanitari e gli ambulatori mobili vicino a te.", search: "Cerca regione..." },
    al: { title: "Scegli una prefettura dell'Albania", subtitle: "Vedi gli avvisi e gli ambulatori mobili della prefettura.", search: "Cerca prefettura..." },
  },
  hr: {
    md: { title: "Odaberi rajon u Moldaviji", subtitle: "Pogledaj lokalne obavijesti i mobilne ambulante.", search: "Pretraži rajon..." },
    hr: { title: "Odaberi svoju županiju", subtitle: "Pogledaj lokalne zdravstvene obavijesti i mobilne ambulante u svom kraju.", search: "Pretraži županiju..." },
    it: { title: "Odaberi regiju u Italiji", subtitle: "Pogledaj lokalne obavijesti i mobilne ambulante.", search: "Pretraži regiju..." },
    al: { title: "Odaberi okrug u Albaniji", subtitle: "Pogledaj lokalne zdravstvene obavijesti i mobilne ambulante.", search: "Pretraži okrug..." },
  },
  rom: {
    md: { title: "Alosar yekh rayono and-i Moldova", subtitle: "Dikh e lokalne nevimata thaj mobilne klinike.", search: "Rod o rayono..." },
    hr: { title: "Alosar ti zhupaniya", subtitle: "Dikh e lokalne nevimata thaj mobilne klinike.", search: "Rod i zhupaniya..." },
    it: { title: "Alosar yekh regiyona and-i Italiya", subtitle: "Dikh e lokalne nevimata thaj mobilne klinike.", search: "Rod i regiyona..." },
    al: { title: "Alosar yekh qarko and-i Shchiperiya", subtitle: "Dikh e lokalne nevimata thaj mobilne klinike.", search: "Rod o qarko..." },
  },
};

const SORTED_MD = [...MOLDOVA_REGIONS_MAP.areas.map((a) => a.name)].sort((a, b) => a.localeCompare(b, "ro"));
const SORTED_HR = [...CROATIA_COUNTIES_MAP.areas.map((a) => a.name)].sort((a, b) => a.localeCompare(b, "hr"));
const SORTED_IT = [...ITALY_REGIONS_MAP.areas.map((a) => a.name)].sort((a, b) => a.localeCompare(b, "it"));
const SORTED_AL = [...ALBANIA_COUNTIES_MAP.areas.map((a) => a.name)].sort((a, b) => a.localeCompare(b, "sq"));

export function areasForCountry(c: MapCountry): readonly string[] {
  if (c === "md") return SORTED_MD;
  if (c === "hr") return SORTED_HR;
  if (c === "it") return SORTED_IT;
  if (c === "al") return SORTED_AL;
  return ROMANIAN_COUNTIES;
}

export type CountyModalGroup = {
  country: MapCountry;
  heading?: string;
  items: { value: string; label: string }[];
};

export function filterCountyModalGroups(params: {
  searchTerm: string;
  effectiveCountry: MapCountry;
  availableCountries: readonly MapCountry[];
  lang: Lang;
}): CountyModalGroup[] {
  const { searchTerm, effectiveCountry, availableCountries, lang } = params;
  const localeT = translations[lang] ?? translations.ro;
  const extra = EXTRA_MAP_COPY[lang] ?? EXTRA_MAP_COPY.ro;

  const countryName = (c: MapCountry) =>
    c === "ro"
      ? (localeT.countyMap?.romania ?? "România")
      : c === "md"
        ? extra.moldova
        : c === "hr"
          ? extra.croatia
          : c === "al"
            ? extra.albania
            : (localeT.countyMap?.italy ?? "Italia");

  const nationalFor = (c: MapCountry): { value: string; label: string } => {
    if (c === "md") return { value: ALL_MOLDOVA, label: extra.allMoldova };
    if (c === "hr") return { value: ALL_CROATIA, label: extra.allCroatia };
    if (c === "it") return { value: ALL_ITALY, label: localeT.countyMap?.allItaly ?? ALL_ITALY };
    if (c === "al") return { value: ALL_ALBANIA, label: extra.allAlbania };
    return { value: NATIONAL_RO, label: localeT.newsRibbon.allCountiesNational };
  };

  const countryAliases = (c: MapCountry): string[] => {
    const nat = nationalFor(c);
    const base = [countryName(c), nat.label];
    if (c === "md") base.push("Moldova", "Republica Moldova", "Moldavia");
    if (c === "ro") base.push("România", "Romania");
    return base;
  };

  const query = foldForSearch(searchTerm);
  if (!query) {
    const nat = nationalFor(effectiveCountry);
    return [
      {
        country: effectiveCountry,
        items: [
          nat,
          ...areasForCountry(effectiveCountry).map((area) => ({ value: area, label: placeName(area, lang) })),
        ],
      },
    ];
  }

  const buildMatches = (c: MapCountry, includeHeading: boolean): CountyModalGroup | null => {
    const nat = nationalFor(c);
    const matchesCountry = countryAliases(c).some((alias) => foldForSearch(alias).includes(query));
    const pool = areasForCountry(c);
    const matchingAreas = pool.filter(
      (area) =>
        foldForSearch(area).includes(query) ||
        foldForSearch(placeName(area, lang)).includes(query) ||
        foldForSearch(countyLabel(area, lang, c)).includes(query),
    );

    if (!matchesCountry && matchingAreas.length === 0) return null;

    const items: { value: string; label: string }[] = [];
    if (matchesCountry) {
      items.push(nat);
      const areasToInclude = matchingAreas.length > 0 ? matchingAreas : pool;
      for (const area of areasToInclude) {
        items.push({ value: area, label: placeName(area, lang) });
      }
    } else {
      for (const area of matchingAreas) {
        items.push({ value: area, label: placeName(area, lang) });
      }
    }

    return {
      country: c,
      heading: includeHeading ? countryName(c) : undefined,
      items,
    };
  };

  const groups: CountyModalGroup[] = [];
  const otherCountries = availableCountries.filter((c) => c !== effectiveCountry);
  const secondaryMatches = otherCountries
    .map((c) => buildMatches(c, true))
    .filter((g): g is CountyModalGroup => g !== null);

  const primaryMatch = buildMatches(effectiveCountry, secondaryMatches.length > 0);
  if (primaryMatch) groups.push(primaryMatch);
  groups.push(...secondaryMatches);

  return groups;
}

/**
 * CountyOverrideModal: searchable area selector for Romania, Moldova, Albania, Croatia, or Italy.
 * Rendered on <body> above sticky sections and headers; tracks visualViewport above mobile keyboards.
 */
export function CountyOverrideModal({
  open,
  onOpenChange,
  currentCounty,
  onSelectCounty,
  country = "ro",
  countries,
}: CountyOverrideModalProps) {
  const { lang, t } = useSafeLanguage();
  const nr = t.newsRibbon;
  const extra = EXTRA_MAP_COPY[lang] ?? EXTRA_MAP_COPY.ro;
  const [searchTerm, setSearchTerm] = useState("");
  const [countryOverride, setCountryOverride] = useState<MapCountry | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const availableCountries = useMemo(() => {
    if (countries && countries.length > 0) return countries;
    const forLang = mapCountriesForLang(lang);
    return forLang.includes(country) ? forLang : [country];
  }, [countries, lang, country]);

  const effectiveCountry: MapCountry =
    countryOverride && availableCountries.includes(countryOverride) ? countryOverride : country;

  const close = useCallback(() => {
    setSearchTerm("");
    setCountryOverride(null);
    onOpenChange(false);
  }, [onOpenChange]);

  useSheetDialog(open, panelRef, close, searchRef);

  const groups = useMemo(
    () =>
      filterCountyModalGroups({
        searchTerm,
        effectiveCountry,
        availableCountries,
        lang,
      }),
    [searchTerm, effectiveCountry, availableCountries, lang],
  );

  const countrySwitchLabel = (c: MapCountry) =>
    c === "ro"
      ? (t.countyMap?.romania ?? "România")
      : c === "md"
        ? extra.moldova
        : c === "hr"
          ? extra.croatia
          : c === "al"
            ? extra.albania
            : (t.countyMap?.italy ?? "Italia");

  const customCopy = effectiveCountry === "ro" ? null : (MODAL_COUNTRY_COPY[lang] ?? MODAL_COUNTRY_COPY.ro)[effectiveCountry];
  const modalTitle = customCopy ? customCopy.title : nr.modalTitle;
  const modalSubtitle = customCopy ? customCopy.subtitle : nr.modalSubtitle;
  const searchPlaceholder = customCopy ? customCopy.search : nr.searchPlaceholder;

  function handleSelect(selected: string, targetCountry: MapCountry = effectiveCountry) {
    onSelectCounty(selected, targetCountry);
    setSearchTerm("");
    setCountryOverride(null);
    onOpenChange(false);
  }

  if (!open || typeof document === "undefined") return null;

  const option = (area: string, label: string, itemCountry: MapCountry) => {
    const selected = itemCountry === country && currentCounty === area;
    return (
      <li key={`${itemCountry}-${area}`}>
        <button
          type="button"
          onClick={() => handleSelect(area, itemCountry)}
          aria-pressed={selected}
          className={cn(
            "flex min-h-[48px] w-full items-center justify-between gap-3 px-5 py-2.5 text-left text-sm text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            selected && "bg-sapphire-soft/50 font-semibold",
          )}
        >
          <span>{label}</span>
          <CheckIcon
            aria-hidden="true"
            className={cn("h-4 w-4 shrink-0 transition-opacity", selected ? "text-sapphire opacity-100" : "opacity-0")}
          />
        </button>
      </li>
    );
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="county-modal-title"
      aria-describedby="county-modal-subtitle"
      className="fixed inset-x-0 top-(--sheet-vv-top,0px) z-[80] flex h-(--sheet-vv-height,100dvh) items-end justify-center sm:inset-0 sm:h-auto sm:items-center sm:p-4"
    >
      <div className="news-sheet-backdrop fixed inset-0 -z-10 bg-slate-950/55" onClick={close} aria-hidden="true" />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="news-sheet relative flex max-h-[min(88dvh,calc(var(--sheet-vv-height,100dvh)-0.75rem))] w-full max-w-xl flex-col overflow-hidden rounded-t-xl bg-card text-foreground shadow-[0_24px_48px_-12px_rgb(15_23_42/0.25)] focus:outline-none sm:max-h-[min(80dvh,calc(var(--sheet-vv-height,100dvh)-2rem))] sm:rounded-xl"
      >
        <div className="shrink-0 border-b border-border px-5 pt-4 pb-3 sm:pt-5 sm:pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="county-modal-title" className="text-lg font-semibold text-foreground">
                {modalTitle}
              </h2>
              <p id="county-modal-subtitle" className="mt-0.5 text-sm text-muted-foreground">
                {modalSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={nr.closeModal}
              className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {availableCountries.length > 1 && (
            <div
              role="group"
              aria-label={availableCountries.map(countrySwitchLabel).join(" / ")}
              className="-mb-3 mt-2 flex gap-5 sm:-mb-4"
            >
              {availableCountries.map((c) => {
                const active = effectiveCountry === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCountryOverride(c)}
                    className={cn(
                      "-mb-px min-h-11 whitespace-nowrap border-b-2 px-0.5 text-sm transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      active
                        ? "border-foreground font-semibold text-foreground"
                        : "border-transparent font-medium text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {countrySwitchLabel(c)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 border-b border-border px-5 py-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="min-h-11 w-full rounded-lg border border-border-control bg-background py-2.5 pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {groups.length > 0 ? (
            <div className="pb-[env(safe-area-inset-bottom)] sm:pb-0">
              {groups.map((group) => (
                <div key={group.country}>
                  {group.heading && (
                    <p className="border-b border-border bg-muted/30 px-5 py-2 text-xs font-semibold text-muted-foreground">
                      {group.heading}
                    </p>
                  )}
                  <ul className="divide-y divide-border">
                    {group.items.map((item) => option(item.value, item.label, group.country))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p role="status" className="px-5 py-8 text-center text-sm text-muted-foreground">
              {nr.noCountyFound} {quoteTerm(searchTerm.trim(), lang)}.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
