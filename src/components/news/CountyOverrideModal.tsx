"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { ROMANIAN_COUNTIES } from "@/lib/romanian-counties";
import { MOLDOVA_REGIONS_MAP } from "@/lib/geo/moldova-regions";
import { CROATIA_COUNTIES_MAP } from "@/lib/geo/croatia-counties";
import { ITALY_REGIONS_MAP } from "@/lib/geo/italy-regions";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { foldForSearch, placeName, quoteTerm } from "@/components/news/news-format";
import { useSheetDialog } from "@/components/news/use-sheet-dialog";
import {
  ALL_CROATIA,
  ALL_ITALY,
  ALL_MOLDOVA,
  EXTRA_MAP_COPY,
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
};

const NATIONAL_RO = "Toate județele";

const MODAL_COUNTRY_COPY: Record<Lang, Record<Exclude<MapCountry, "ro">, { title: string; subtitle: string; search: string }>> = {
  ro: {
    md: { title: "Alege un raion din Moldova", subtitle: "Vezi alertele și caravanele din raionul ales.", search: "Caută raionul sau municipiul..." },
    hr: { title: "Alege un comitat din Croația", subtitle: "Vezi alertele și clinicile mobile din zona aleasă.", search: "Caută comitatul..." },
    it: { title: "Alege o regiune din Italia", subtitle: "Vezi avizele și clinicile mobile din regiunea aleasă.", search: "Caută regiunea..." },
  },
  en: {
    md: { title: "Choose a district in Moldova", subtitle: "See health alerts and mobile clinics for your district.", search: "Search district or municipality..." },
    hr: { title: "Choose a county in Croatia", subtitle: "See health alerts and mobile clinics for your county.", search: "Search county..." },
    it: { title: "Choose a region in Italy", subtitle: "See health alerts and mobile clinics for your region.", search: "Search region..." },
  },
  sq: {
    md: { title: "Zgjidh një rajon në Moldavi", subtitle: "Shiko njoftimet dhe karvanet për rajonin e zgjedhur.", search: "Kërko rajonin..." },
    hr: { title: "Zgjidh një qark në Kroaci", subtitle: "Shiko njoftimet dhe klinikat lëvizëse për qarkun e zgjedhur.", search: "Kërko qarkun..." },
    it: { title: "Zgjidh një rajon në Itali", subtitle: "Shiko njoftimet dhe klinikat lëvizëse për rajonin e zgjedhur.", search: "Kërko rajonin..." },
  },
  it: {
    md: { title: "Scegli un distretto della Moldavia", subtitle: "Vedi gli avvisi e gli ambulatori mobili del distretto.", search: "Cerca distretto..." },
    hr: { title: "Scegli una regione della Croazia", subtitle: "Vedi gli avvisi e gli ambulatori mobili della regione.", search: "Cerca regione..." },
    it: { title: "Scegli la tua regione", subtitle: "Vedi gli avvisi sanitari e gli ambulatori mobili vicino a te.", search: "Cerca regione..." },
  },
  hr: {
    md: { title: "Odaberi rajon u Moldaviji", subtitle: "Pogledaj lokalne obavijesti i mobilne ambulante.", search: "Pretraži rajon..." },
    hr: { title: "Odaberi svoju županiju", subtitle: "Pogledaj lokalne zdravstvene obavijesti i mobilne ambulante u svom kraju.", search: "Pretraži županiju..." },
    it: { title: "Odaberi regiju u Italiji", subtitle: "Pogledaj lokalne obavijesti i mobilne ambulante.", search: "Pretraži regiju..." },
  },
  rom: {
    md: { title: "Alosar yekh rayono and-i Moldova", subtitle: "Dikh e lokalne nevimata thaj mobilne klinike.", search: "Rod o rayono..." },
    hr: { title: "Alosar ti zhupaniya", subtitle: "Dikh e lokalne nevimata thaj mobilne klinike.", search: "Rod i zhupaniya..." },
    it: { title: "Alosar yekh regiyona and-i Italiya", subtitle: "Dikh e lokalne nevimata thaj mobilne klinike.", search: "Rod i regiyona..." },
  },
};

/**
 * CountyOverrideModal: searchable area selector for Romania, Moldova, Croatia, or Italy.
 * Bottom sheet on phones, centred dialog from sm up.
 */
export function CountyOverrideModal({
  open,
  onOpenChange,
  currentCounty,
  onSelectCounty,
  country = "ro",
}: CountyOverrideModalProps) {
  const { lang, t } = useSafeLanguage();
  const nr = t.newsRibbon;
  const extra = EXTRA_MAP_COPY[lang] ?? EXTRA_MAP_COPY.ro;
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  useSheetDialog(open, panelRef, close, searchRef);

  const areaPool = useMemo(() => {
    if (country === "md") return [...MOLDOVA_REGIONS_MAP.areas.map((a) => a.name)].sort((a, b) => a.localeCompare(b, "ro"));
    if (country === "hr") return [...CROATIA_COUNTIES_MAP.areas.map((a) => a.name)].sort((a, b) => a.localeCompare(b, "hr"));
    if (country === "it") return [...ITALY_REGIONS_MAP.areas.map((a) => a.name)].sort((a, b) => a.localeCompare(b, "it"));
    return ROMANIAN_COUNTIES as readonly string[];
  }, [country]);

  const filteredCounties = useMemo(() => {
    const query = foldForSearch(searchTerm);
    return query
      ? areaPool.filter((c) => foldForSearch(c).includes(query) || foldForSearch(placeName(c, lang)).includes(query))
      : areaPool;
  }, [searchTerm, lang, areaPool]);

  const nationalValue =
    country === "md" ? ALL_MOLDOVA : country === "hr" ? ALL_CROATIA : country === "it" ? ALL_ITALY : NATIONAL_RO;
  const nationalLabel =
    country === "md"
      ? extra.allMoldova
      : country === "hr"
        ? extra.allCroatia
        : country === "it"
          ? (t.countyMap?.allItaly ?? ALL_ITALY)
          : nr.allCountiesNational;

  const customCopy = country === "ro" ? null : (MODAL_COUNTRY_COPY[lang] ?? MODAL_COUNTRY_COPY.ro)[country];
  const modalTitle = customCopy ? customCopy.title : nr.modalTitle;
  const modalSubtitle = customCopy ? customCopy.subtitle : nr.modalSubtitle;
  const searchPlaceholder = customCopy ? customCopy.search : nr.searchPlaceholder;

  function handleSelect(selected: string) {
    onSelectCounty(selected, country);
    setSearchTerm("");
    onOpenChange(false);
  }

  if (!open) return null;

  const option = (area: string, label: string) => {
    const selected = currentCounty === area;
    return (
      <li key={area}>
        <button
          type="button"
          onClick={() => handleSelect(area)}
          aria-pressed={selected}
          className={cn(
            "flex min-h-[48px] w-full items-center gap-3 px-5 py-2.5 text-left text-sm text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            selected && "font-semibold",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
              selected ? "border-foreground" : "border-muted-foreground/50",
            )}
          >
            {selected && <span className="h-2 w-2 rounded-full bg-foreground" />}
          </span>
          <span>{label}</span>
        </button>
      </li>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="county-modal-title"
      aria-describedby="county-modal-subtitle"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div className="news-sheet-backdrop fixed inset-0 -z-10 bg-slate-950/45" onClick={close} aria-hidden="true" />

      <div ref={panelRef} className="news-sheet relative flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-xl bg-card shadow-[0_24px_48px_-12px_rgb(15_23_42/0.25)] sm:max-h-[80dvh] sm:rounded-xl">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 pb-4 pt-5">
          <div>
            <h2 id="county-modal-title" className="text-lg font-semibold text-foreground">
              {modalTitle}
            </h2>
            <p id="county-modal-subtitle" className="mt-0.5 text-sm text-muted-foreground">
              {modalSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={nr.closeModal}
            className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-5 py-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="min-h-[44px] w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <ul className="divide-y divide-border">
            {!searchTerm.trim() && option(nationalValue, nationalLabel)}
            {filteredCounties.map((area) => option(area, placeName(area, lang)))}
          </ul>

          {filteredCounties.length === 0 && (
            <p role="status" className="px-5 py-8 text-center text-sm text-muted-foreground">
              {nr.noCountyFound} {quoteTerm(searchTerm.trim(), lang)}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
