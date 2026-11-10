"use client";

import React, {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";
import { ROMANIA_COUNTIES_MAP, type CountryMap, type MapArea } from "@/lib/geo/romania-counties";
import { MOLDOVA_REGIONS_MAP } from "@/lib/geo/moldova-regions";
import { CROATIA_COUNTIES_MAP } from "@/lib/geo/croatia-counties";
import { ITALY_REGIONS_MAP } from "@/lib/geo/italy-regions";
import { CROATIA_WIDE, ITALY_WIDE, MOLDOVA_WIDE } from "@/lib/data/news";
import { placeName } from "@/components/news/news-format";
import { useCalmReducedMotion } from "@/lib/motion/tokens";

/** The value that means "no county chosen": national news, every hub in Romania. */
const ALL_ROMANIA = "Toate județele";

/** Country-wide sentinel values matching `src/lib/data/news.ts`. */
export const ALL_ITALY = ITALY_WIDE;
export const ALL_MOLDOVA = MOLDOVA_WIDE;
export const ALL_CROATIA = CROATIA_WIDE;

export type MapCountry = "ro" | "md" | "it" | "hr";

const MAPS: Record<MapCountry, CountryMap> = {
  ro: ROMANIA_COUNTIES_MAP,
  md: MOLDOVA_REGIONS_MAP,
  it: ITALY_REGIONS_MAP,
  hr: CROATIA_COUNTIES_MAP,
};

const MAP_ASPECT: Record<MapCountry, { aspectRatio: string; maxWidth: string; strokeBase: number; strokeSelected: number; fontSize: number }> = {
  ro: { aspectRatio: "1000 / 709", maxWidth: "max-w-3xl", strokeBase: 1.5, strokeSelected: 3, fontSize: 15 },
  md: { aspectRatio: "799 / 1000", maxWidth: "max-w-md", strokeBase: 1.3, strokeSelected: 2.6, fontSize: 14 },
  it: { aspectRatio: "760 / 1001", maxWidth: "max-w-md", strokeBase: 1.2, strokeSelected: 2.4, fontSize: 19 },
  hr: { aspectRatio: "1000 / 981", maxWidth: "max-w-xl", strokeBase: 1.4, strokeSelected: 2.8, fontSize: 15 },
};

/** Small urban enclaves where 2-letter codes would collide with the surrounding county/raion label. */
const HIDDEN_ENCLAVE_LABELS: Record<MapCountry, ReadonlySet<string>> = {
  ro: new Set(["B", "IF"]),
  md: new Set(["CU", "BL", "BD"]),
  it: new Set(),
  hr: new Set(["GZ"]),
};

const MUNICIPALITY_PLACES = new Set(["București", "Chișinău", "Bălți", "Bender", "Grad Zagreb"]);

const LOUPE_COPY: Record<Lang, string> = {
  ro: "Detaliu București și Ilfov",
  en: "Bucharest and Ilfov detail",
  sq: "Detaj për Bukureshtin dhe Ilfovin",
  it: "Dettaglio Bucarest e Ilfov",
  hr: "Detalj Bukurešta i Ilfova",
  rom: "Detali vash Bukureshti thaj Ilfov",
};

const BUCHAREST_ENCLAVE_IDS = ["IF", "B"] as const;

type ExtraMapCopy = {
  moldova: string;
  croatia: string;
  allMoldova: string;
  allCroatia: string;
  moldovaTitle: string;
  moldovaSubtitle: string;
  moldovaMapAriaLabel: string;
  croatiaTitle: string;
  croatiaSubtitle: string;
  croatiaMapAriaLabel: string;
  selectedRaionPrefix: string;
  selectedZupanijaPrefix: string;
  placePrefix: string;
  recentRaioaneLabel: string;
  recentZupanijeLabel: string;
  pickMoldovaLabel: string;
  pickCroatiaLabel: string;
  pickItalyLabel: string;
};

export const EXTRA_MAP_COPY: Record<Lang, ExtraMapCopy> = {
  ro: {
    moldova: "Moldova",
    croatia: "Croația",
    allMoldova: "Toată Moldova",
    allCroatia: "Toată Croația",
    moldovaTitle: "Alege un raion din Moldova",
    moldovaSubtitle: "Apasă pe hartă sau alege din listă pentru știri și caravane locale.",
    moldovaMapAriaLabel: "Harta raioanelor și municipiilor din Republica Moldova",
    croatiaTitle: "Alege un comitat din Croația",
    croatiaSubtitle: "Apasă pe hartă sau alege din listă pentru alerte și clinici mobile.",
    croatiaMapAriaLabel: "Harta comitatelor din Croația",
    selectedRaionPrefix: "Raionul ales:",
    selectedZupanijaPrefix: "Comitatul ales:",
    placePrefix: "Locul ales:",
    recentRaioaneLabel: "Raioane cu știri locale",
    recentZupanijeLabel: "Comitate cu știri locale",
    pickMoldovaLabel: "Sau alege un raion din listă",
    pickCroatiaLabel: "Sau alege un comitat din listă",
    pickItalyLabel: "Sau alege o regiune din listă",
  },
  en: {
    moldova: "Moldova",
    croatia: "Croatia",
    allMoldova: "All of Moldova",
    allCroatia: "All of Croatia",
    moldovaTitle: "Choose a district in Moldova",
    moldovaSubtitle: "Tap the map or pick from the list for local health alerts and mobile clinics.",
    moldovaMapAriaLabel: "Map of districts and municipalities of Moldova",
    croatiaTitle: "Choose a county in Croatia",
    croatiaSubtitle: "Tap the map or pick from the list for local health alerts and mobile clinics.",
    croatiaMapAriaLabel: "Map of counties of Croatia",
    selectedRaionPrefix: "Chosen district:",
    selectedZupanijaPrefix: "Chosen county:",
    placePrefix: "Chosen place:",
    recentRaioaneLabel: "Districts with local news",
    recentZupanijeLabel: "Counties with local news",
    pickMoldovaLabel: "Or pick a district from the list",
    pickCroatiaLabel: "Or pick a county from the list",
    pickItalyLabel: "Or pick a region from the list",
  },
  sq: {
    moldova: "Moldavia",
    croatia: "Kroacia",
    allMoldova: "Gjithë Moldavia",
    allCroatia: "Gjithë Kroacia",
    moldovaTitle: "Zgjidh një rajon në Moldavi",
    moldovaSubtitle: "Prek hartën ose zgjidh nga lista për njoftime dhe karvane mjekësore.",
    moldovaMapAriaLabel: "Harta e rajoneve të Moldavisë",
    croatiaTitle: "Zgjidh një qark në Kroaci",
    croatiaSubtitle: "Prek hartën ose zgjidh nga lista për njoftime dhe klinika lëvizëse.",
    croatiaMapAriaLabel: "Harta e qarqeve të Kroacisë",
    selectedRaionPrefix: "Rajoni i zgjedhur:",
    selectedZupanijaPrefix: "Qarku i zgjedhur:",
    placePrefix: "Vendi i zgjedhur:",
    recentRaioaneLabel: "Rajone me lajme lokale",
    recentZupanijeLabel: "Qarqe me lajme lokale",
    pickMoldovaLabel: "Ose zgjidh një rajon nga lista",
    pickCroatiaLabel: "Ose zgjidh një qark nga lista",
    pickItalyLabel: "Ose zgjidh një rajon nga lista",
  },
  it: {
    moldova: "Moldavia",
    croatia: "Croazia",
    allMoldova: "Tutta la Moldavia",
    allCroatia: "Tutta la Croazia",
    moldovaTitle: "Scegli un distretto della Moldavia",
    moldovaSubtitle: "Tocca la mappa o scegli dall'elenco per avvisi e ambulatori mobili.",
    moldovaMapAriaLabel: "Mappa dei distretti della Moldavia",
    croatiaTitle: "Scegli una regione della Croazia",
    croatiaSubtitle: "Tocca la mappa o scegli dall'elenco per avvisi e ambulatori mobili.",
    croatiaMapAriaLabel: "Mappa delle regioni della Croazia",
    selectedRaionPrefix: "Distretto scelto:",
    selectedZupanijaPrefix: "Regione scelta:",
    placePrefix: "Luogo scelto:",
    recentRaioaneLabel: "Distretti con notizie locali",
    recentZupanijeLabel: "Regioni con notizie locali",
    pickMoldovaLabel: "Oppure scegli un distretto dall'elenco",
    pickCroatiaLabel: "Oppure scegli una regione dall'elenco",
    pickItalyLabel: "Oppure scegli una regione dall'elenco",
  },
  hr: {
    moldova: "Moldavija",
    croatia: "Hrvatska",
    allMoldova: "Cijela Moldavija",
    allCroatia: "Sve županije",
    moldovaTitle: "Odaberi rajon u Moldaviji",
    moldovaSubtitle: "Dodirni kartu ili odaberi s popisa za lokalne zdravstvene obavijesti.",
    moldovaMapAriaLabel: "Karta rajona i općina u Moldaviji",
    croatiaTitle: "Odaberi svoju županiju",
    croatiaSubtitle: "Dodirni županiju na karti ili je odaberi s popisa za lokalne obavijesti i mobilne ambulante.",
    croatiaMapAriaLabel: "Karta hrvatskih županija",
    selectedRaionPrefix: "Odabrani rajon:",
    selectedZupanijaPrefix: "Odabrana županija:",
    placePrefix: "Odabrano mjesto:",
    recentRaioaneLabel: "Rajoni s lokalnim vijestima",
    recentZupanijeLabel: "Županije s lokalnim vijestima",
    pickMoldovaLabel: "Ili odaberi rajon s popisa",
    pickCroatiaLabel: "Ili odaberi županiju s popisa",
    pickItalyLabel: "Ili odaberi regiju s popisa",
  },
  rom: {
    moldova: "Moldova",
    croatia: "Kroatiya",
    allMoldova: "Sasti Moldova",
    allCroatia: "Sasti Kroatiya",
    moldovaTitle: "Alosar yekh rayono and-i Moldova",
    moldovaSubtitle: "Thov o nay pe harta vay alosar katar i lista vash lokalne sastipnaske nevimata.",
    moldovaMapAriaLabel: "I harta e rayonengi and-i Moldova",
    croatiaTitle: "Alosar yekh zhupaniya and-i Kroatiya",
    croatiaSubtitle: "Thov o nay pe harta vay alosar katar i lista vash lokalne nevimata thaj mobilne klinike.",
    croatiaMapAriaLabel: "I harta e zhupaniyengi and-i Kroatiya",
    selectedRaionPrefix: "Alosardo rayono:",
    selectedZupanijaPrefix: "Alosardi zhupaniya:",
    placePrefix: "Alosardo than:",
    recentRaioaneLabel: "Rayonurya lokalne nevimatenca",
    recentZupanijeLabel: "Zhupaniye lokalne nevimatenca",
    pickMoldovaLabel: "Vay alosar yekh rayono katar i lista",
    pickCroatiaLabel: "Vay alosar yekh zhupaniya katar i lista",
    pickItalyLabel: "Vay alosar yekh regiyona katar i lista",
  },
};

/** Conditional map display rule by active UI language: `it` -> Italy only, `hr` -> Croatia only, others -> Romania + Moldova. */
export function mapCountriesForLang(lang: Lang): MapCountry[] {
  if (lang === "it") return ["it"];
  if (lang === "hr") return ["hr"];
  return ["ro", "md"];
}

export function countryAllValue(country: MapCountry): string {
  if (country === "it") return ALL_ITALY;
  if (country === "md") return ALL_MOLDOVA;
  if (country === "hr") return ALL_CROATIA;
  return ALL_ROMANIA;
}

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    const lang = ctx?.lang || "ro";
    const baseT = translations[lang] ?? translations.ro;
    return { lang, m: { ...baseT.countyMap, ...(ctx?.t?.countyMap ?? {}) } };
  } catch {
    return { lang: "ro" as const, m: translations.ro.countyMap };
  }
}

export type RomaniaCountyMapProps = {
  selectedCounty: string;
  onSelectCounty: (county: string, country: MapCountry) => void;
  /** Areas with recent news or a mediator hub; drawn darker and listed under the map. */
  activeHubs?: string[];
  /** Which country maps to offer. With more than one, an underline switch appears above the map. */
  countries?: MapCountry[];
  /** Optional controlled/synced map country when parent coordinates feed and map together. */
  activeCountry?: MapCountry;
  onCountryChange?: (country: MapCountry) => void;
  className?: string;
};

/** True for an Italian region name; those are not Romanian counties and are not saved as one. */
export function isItalianRegion(name: string): boolean {
  return ITALY_REGIONS_MAP.areas.some((a) => a.name === name);
}

/** True for a Croatian županija name (including Grad Zagreb). */
export function isCroatianCounty(name: string): boolean {
  return CROATIA_COUNTIES_MAP.areas.some((a) => a.name === name);
}

/** True for a Moldovan raion, municipality, or autonomous territorial unit. */
export function isMoldovanRegion(name: string): boolean {
  return MOLDOVA_REGIONS_MAP.areas.some((a) => a.name === name);
}

/** True for a Moldovan area whose name does not overlap a Romanian county ("Călărași" exists in both). */
export function isMoldovanOnlyRegion(name: string): boolean {
  return isMoldovanRegion(name) && !ROMANIA_COUNTIES_MAP.areas.some((a) => a.name === name);
}

function inferCountryOfSelection(name: string, allowed: MapCountry[]): MapCountry | null {
  if (name === ALL_ITALY && allowed.includes("it")) return "it";
  if (name === ALL_MOLDOVA && allowed.includes("md")) return "md";
  if (name === ALL_CROATIA && allowed.includes("hr")) return "hr";
  if (name === ALL_ROMANIA && allowed.includes("ro")) return "ro";
  // Check unambiguous non-Romanian maps first so shared names only match when appropriate.
  for (const c of allowed) {
    if (c !== "ro" && MAPS[c].areas.some((a) => a.name === name) && !MAPS.ro.areas.some((a) => a.name === name)) {
      return c;
    }
  }
  for (const c of allowed) {
    if (MAPS[c].areas.some((a) => a.name === name)) return c;
  }
  return null;
}

/**
 * Interactive administrative map (Natural Earth 1:10m boundaries) for Romania (42 counties),
 * Republic of Moldova (36 regions/municipalities), Croatia (21 županije), and Italy (20 regions).
 * Tap an area to choose it; keyboard and screen-reader users get a native list and quick hub buttons.
 */
export function RomaniaCountyMap({
  selectedCounty,
  onSelectCounty,
  activeHubs = ["Iași", "Galați", "Cluj", "București"],
  countries = ["ro"],
  activeCountry,
  onCountryChange,
  className,
}: RomaniaCountyMapProps) {
  const { lang, m } = useSafeLanguage();
  const extra = EXTRA_MAP_COPY[lang] ?? EXTRA_MAP_COPY.ro;
  const loupeCaption = LOUPE_COPY[lang] ?? LOUPE_COPY.ro;
  const reducedMotion = useCalmReducedMotion();
  const selectId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const tooltipRafRef = useRef<number>(0);
  const pendingPointerRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focusedArea, setFocusedArea] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 16, y: 16 });
  const [internalCountry, setInternalCountry] = useState<MapCountry>(() => {
    const fromSelection = inferCountryOfSelection(selectedCounty, countries);
    if (fromSelection) return fromSelection;
    if (lang === "it" && countries.includes("it")) return "it";
    if (lang === "hr" && countries.includes("hr")) return "hr";
    return countries[0] ?? "ro";
  });
  const [selectedInCountry, setSelectedInCountry] = useState<MapCountry | null>(() =>
    inferCountryOfSelection(selectedCounty, countries),
  );

  useEffect(() => {
    return () => {
      if (tooltipRafRef.current !== 0) {
        window.cancelAnimationFrame(tooltipRafRef.current);
      }
    };
  }, []);

  const desiredCountry = activeCountry && countries.includes(activeCountry)
    ? activeCountry
    : countries.includes(internalCountry)
      ? internalCountry
      : (countries[0] ?? "ro");

  if (internalCountry !== desiredCountry && !activeCountry) {
    setInternalCountry(desiredCountry);
  }

  const country = desiredCountry;
  const map = MAPS[country];
  const layout = MAP_ASPECT[country];
  const hiddenLabels = HIDDEN_ENCLAVE_LABELS[country];
  const sortLocale = country === "hr" ? "hr" : country === "it" ? "it" : "ro";

  const hubs = useMemo(() => new Set(activeHubs), [activeHubs]);
  const sortedAreas = useMemo(
    () => [...map.areas].sort((a, b) => a.name.localeCompare(b.name, sortLocale)),
    [map, sortLocale],
  );

  const allValue = countryAllValue(country);
  const allLabel =
    country === "it"
      ? m.allItaly
      : country === "md"
        ? extra.allMoldova
        : country === "hr"
          ? extra.allCroatia
          : m.allCounties;

  const titleText =
    country === "it"
      ? m.italyTitle
      : country === "md"
        ? extra.moldovaTitle
        : country === "hr"
          ? extra.croatiaTitle
          : m.title;

  const subtitleText =
    country === "it"
      ? m.italySubtitle
      : country === "md"
        ? extra.moldovaSubtitle
        : country === "hr"
          ? extra.croatiaSubtitle
          : m.subtitle;

  const mapAriaLabel =
    country === "it"
      ? m.italyMapAriaLabel
      : country === "md"
        ? extra.moldovaMapAriaLabel
        : country === "hr"
          ? extra.croatiaMapAriaLabel
          : m.mapAriaLabel;

  const recentHubsLabel =
    country === "it"
      ? m.recentRegionsLabel
      : country === "md"
        ? extra.recentRaioaneLabel
        : country === "hr"
          ? extra.recentZupanijeLabel
          : m.recentNewsLabel;

  const pickLabelText =
    country === "it"
      ? extra.pickItalyLabel
      : country === "md"
        ? extra.pickMoldovaLabel
        : country === "hr"
          ? extra.pickCroatiaLabel
          : m.pickLabel;

  const countrySwitchLabel = (c: MapCountry) =>
    c === "ro" ? m.romania : c === "md" ? extra.moldova : c === "hr" ? extra.croatia : m.italy;

  const effectiveSelected = activeCountry
    ? selectedCounty
    : selectedInCountry === null || selectedInCountry === country
      ? selectedCounty
      : "";
  const isAll = effectiveSelected === allValue;
  const selectedInThisMap = map.areas.some((a) => a.name === effectiveSelected);
  const shown = hovered ?? (selectedInThisMap ? effectiveSelected : null);

  const prefix = shown && MUNICIPALITY_PLACES.has(shown)
    ? extra.placePrefix
    : country === "it"
      ? m.selectedRegionPrefix
      : country === "md"
        ? extra.selectedRaionPrefix
        : country === "hr"
          ? extra.selectedZupanijaPrefix
          : m.selectedCountyPrefix;

  const visibleHubs = activeHubs.filter((h) => map.areas.some((a) => a.name === h));
  const label = (name: string) => placeName(name, lang);
  const shownHover = hovered ?? focusedArea;

  const viewBoxSize = useMemo(() => {
    const parts = map.viewBox.trim().split(/\s+/).map(Number);
    return {
      width: parts[2] || 1000,
      height: parts[3] || 709,
    };
  }, [map.viewBox]);

  // Paint active/focused/hovered polygons last so neighbor borders never occlude their strokes.
  const orderedAreas = useMemo(() => {
    const rank = (name: string) => {
      if (name === effectiveSelected) return 3;
      if (name === focusedArea) return 2;
      if (name === hovered) return 1;
      return 0;
    };
    return [...map.areas].sort((a, b) => rank(a.name) - rank(b.name));
  }, [map.areas, effectiveSelected, focusedArea, hovered]);

  const enclaveAreas = useMemo(() => {
    if (country !== "ro") return [];
    const found = BUCHAREST_ENCLAVE_IDS.map((id) => ROMANIA_COUNTIES_MAP.areas.find((a) => a.id === id)).filter(
      (a): a is MapArea => Boolean(a),
    );
    const rank = (name: string) => {
      if (name === selectedCounty) return 3;
      if (name === focusedArea) return 2;
      if (name === hovered) return 1;
      return 0;
    };
    return [...found].sort((a, b) => rank(a.name) - rank(b.name));
  }, [country, selectedCounty, focusedArea, hovered]);

  function clampTooltipPosition(rawX: number, rawY: number, width: number, height: number) {
    const maxX = Math.max(12, width - 196);
    const maxY = Math.max(12, height - 44);
    return {
      x: Math.round(Math.min(Math.max(12, rawX), maxX)),
      y: Math.round(Math.min(Math.max(12, rawY), maxY)),
    };
  }

  function updateTooltipForArea(area: MapArea) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const rawX = (area.label[0] / viewBoxSize.width) * rect.width + 10;
    const rawY = (area.label[1] / viewBoxSize.height) * rect.height - 36;
    setTooltipPos(clampTooltipPosition(rawX, rawY, rect.width, rect.height));
  }

  function handleStagePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType === "touch") return;
    pendingPointerRef.current = { clientX: event.clientX, clientY: event.clientY };
    if (tooltipRafRef.current === 0) {
      tooltipRafRef.current = window.requestAnimationFrame(() => {
        tooltipRafRef.current = 0;
        const stage = stageRef.current;
        const pending = pendingPointerRef.current;
        if (!stage || !pending) return;
        const rect = stage.getBoundingClientRect();
        const rawX = pending.clientX - rect.left + 14;
        const rawY = pending.clientY - rect.top - 38;
        setTooltipPos(clampTooltipPosition(rawX, rawY, rect.width, rect.height));
      });
    }
  }

  function chooseArea(areaName: string, targetCountry: MapCountry = country) {
    setSelectedInCountry(targetCountry);
    onSelectCounty(areaName, targetCountry);
  }

  function handleAreaKeyDown(event: ReactKeyboardEvent<SVGPathElement>, areaName: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseArea(areaName, country);
    }
  }

  function switchCountry(next: MapCountry) {
    setInternalCountry(next);
    setHovered(null);
    setFocusedArea(null);
    onCountryChange?.(next);
  }

  const renderEnclaveLoupe = (mode: "inset" | "stacked") => {
    if (country !== "ro" || enclaveAreas.length === 0) return null;
    const targets = [
      { id: "B", name: "București" },
      { id: "IF", name: "Ilfov" },
    ];
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-card/95 p-2.5 shadow-(--shadow-card-rest) backdrop-blur-xs",
          mode === "inset"
            ? "absolute right-2 top-2 z-10 hidden w-56 md:block"
            : "mt-3 block md:hidden",
        )}
      >
        <p className="mb-1.5 text-[11px] font-medium leading-tight text-muted-foreground">
          {loupeCaption}
        </p>
        <div className="flex items-center gap-2.5">
          <svg
            viewBox="589 526 70 86"
            aria-hidden="true"
            className="h-20 w-16 shrink-0 select-none rounded-md border border-border/70 bg-surface-subtle/70 p-0.5"
            onPointerLeave={() => setHovered(null)}
          >
            {enclaveAreas.map((area) => {
              const selected = area.name === selectedCounty;
              const isFocused = area.name === focusedArea;
              const isHovered = area.name === hovered;
              const hub = hubs.has(area.name);
              return (
                <path
                  key={area.id}
                  d={area.d}
                  fillRule="evenodd"
                  onClick={() => onSelectCounty(area.name, "ro")}
                  onPointerEnter={() => {
                    setHovered(area.name);
                    if (reducedMotion) updateTooltipForArea(area);
                  }}
                  className={cn(
                    "cursor-pointer stroke-card transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none [stroke-linejoin:round]",
                    selected
                      ? "fill-sapphire stroke-foreground dark:fill-sapphire-light"
                      : isFocused
                        ? "fill-sapphire-soft stroke-sapphire dark:stroke-paper"
                        : isHovered
                          ? "fill-slate-300 dark:fill-slate-500"
                          : hub
                            ? "fill-sapphire-border dark:fill-sapphire-light"
                            : "fill-slate-200 dark:fill-slate-700",
                  )}
                  style={{ strokeWidth: selected || isFocused ? 2.2 : 1.2 }}
                />
              );
            })}
            <text
              x={636}
              y={548}
              textAnchor="middle"
              dominantBaseline="central"
              className="pointer-events-none fill-slate-700 text-[9px] font-bold tabular-nums dark:fill-slate-200"
            >
              IF
            </text>
            <text
              x={615}
              y={579}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                "pointer-events-none text-[8.5px] font-bold tabular-nums",
                selectedCounty === "București"
                  ? "fill-white dark:fill-ink-950"
                  : "fill-ink-950 dark:fill-white",
              )}
            >
              B
            </text>
          </svg>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {targets.map((target) => {
              const isSelected = selectedCounty === target.name;
              const isHub = hubs.has(target.name);
              return (
                <button
                  key={target.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectCounty(target.name, "ro")}
                  onPointerEnter={() => {
                    setHovered(target.name);
                    const found = ROMANIA_COUNTIES_MAP.areas.find((a) => a.name === target.name);
                    if (found && reducedMotion) updateTooltipForArea(found);
                  }}
                  onPointerLeave={() => setHovered((prev) => (prev === target.name ? null : prev))}
                  onFocus={() => {
                    setFocusedArea(target.name);
                    setHovered(target.name);
                    const found = ROMANIA_COUNTIES_MAP.areas.find((a) => a.name === target.name);
                    if (found) updateTooltipForArea(found);
                  }}
                  onBlur={() => {
                    setFocusedArea((prev) => (prev === target.name ? null : prev));
                    setHovered((prev) => (prev === target.name ? null : prev));
                  }}
                  className={cn(
                    "flex min-h-11 min-w-11 items-center justify-between gap-1.5 rounded-lg border px-2 py-1 text-left text-xs font-medium transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "border-sapphire bg-sapphire font-semibold text-white"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center justify-center rounded-md px-1 py-0.5 font-mono text-[10px] font-semibold tabular-nums",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {target.id}
                    </span>
                    <span className="truncate">{label(target.name)}</span>
                  </span>
                  {isHub && (
                    <span
                      aria-hidden="true"
                      className="inline-block h-2 w-2 shrink-0 rounded-full bg-live-sage"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 sm:p-6", className)}>
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{titleText}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{subtitleText}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {countries.length > 1 && (
            // Underline band matching every section switch across the site, never a pill toggle.
            <div
              role="group"
              aria-label={countries.map(countrySwitchLabel).join(" / ")}
              className="flex gap-4 border-b border-border"
            >
              {countries.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={country === c}
                  onClick={() => switchCountry(c)}
                  className={cn(
                    "-mb-px min-h-[44px] border-b-2 px-0.5 text-sm transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    country === c
                      ? "border-foreground font-semibold text-foreground"
                      : "border-transparent font-medium text-muted-foreground hover:text-foreground",
                  )}
                >
                  {countrySwitchLabel(c)}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            aria-pressed={isAll}
            onClick={() => chooseArea(allValue, country)}
            className={cn(
              "min-h-[44px] rounded-lg border px-3 text-sm font-medium transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isAll ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:bg-muted",
            )}
          >
            {allLabel}
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        onPointerMove={handleStagePointerMove}
        className={cn("relative mx-auto mt-4 w-full", layout.maxWidth)}
        style={{ aspectRatio: layout.aspectRatio }}
      >
        <svg
          viewBox={map.viewBox}
          className="block h-full w-full select-none"
          style={{ aspectRatio: layout.aspectRatio }}
          role="group"
          aria-label={mapAriaLabel}
          onPointerLeave={() => setHovered(null)}
        >
          {/* Active, keyboard-focused, and hovered polygons paint last so their outlines sit above neighbours. */}
          {orderedAreas.map((area) => {
            const selected = area.name === effectiveSelected;
            const isFocused = area.name === focusedArea;
            const isHovered = area.name === hovered;
            const hub = hubs.has(area.name);
            return (
              <path
                key={area.id}
                d={area.d}
                fillRule="evenodd"
                tabIndex={0}
                role="button"
                aria-label={label(area.name)}
                aria-pressed={selected}
                onClick={() => chooseArea(area.name, country)}
                onKeyDown={(event) => handleAreaKeyDown(event, area.name)}
                onPointerEnter={() => {
                  setHovered(area.name);
                  if (reducedMotion) updateTooltipForArea(area);
                }}
                onFocus={() => {
                  setFocusedArea(area.name);
                  setHovered(area.name);
                  updateTooltipForArea(area);
                }}
                onBlur={() => {
                  setFocusedArea((prev) => (prev === area.name ? null : prev));
                  setHovered((prev) => (prev === area.name ? null : prev));
                }}
                className={cn(
                  "cursor-pointer stroke-card transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus:outline-none focus-visible:stroke-sapphire dark:focus-visible:stroke-paper [stroke-linejoin:round]",
                  selected
                    ? "fill-sapphire-border stroke-foreground dark:fill-sapphire-light"
                    : isFocused
                      ? "fill-sapphire-soft stroke-sapphire dark:fill-slate-600 dark:stroke-paper"
                      : isHovered
                        ? "fill-slate-300 dark:fill-slate-500"
                        : hub
                          ? "fill-sapphire-border dark:fill-sapphire-light"
                          : "fill-slate-200 dark:fill-slate-700",
                )}
                style={{ strokeWidth: selected || isFocused ? layout.strokeSelected : layout.strokeBase }}
              >
                <title>{label(area.name)}</title>
              </path>
            );
          })}
          {country === "ro" && (
            <g aria-hidden="true" className="pointer-events-none hidden md:block">
              <circle
                cx={621}
                cy={571}
                r={39}
                fill="none"
                className="stroke-sapphire/55 dark:stroke-sapphire-light/70"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <path
                d="M652 547L782 182"
                fill="none"
                className="stroke-sapphire/45 dark:stroke-sapphire-light/60"
                strokeWidth={1.4}
                strokeDasharray="4 4"
              />
            </g>
          )}
          {map.areas.map((area) => (
            <text
              key={area.id}
              x={area.label[0]}
              y={area.label[1]}
              textAnchor="middle"
              dominantBaseline="central"
              aria-hidden="true"
              className={cn(
                "pointer-events-none hidden font-semibold tabular-nums sm:block",
                area.name === effectiveSelected ? "fill-foreground" : "fill-slate-600 dark:fill-slate-300",
              )}
              style={{ fontSize: layout.fontSize }}
            >
              {hiddenLabels.has(area.id) ? "" : area.id}
            </text>
          ))}
        </svg>

        {renderEnclaveLoupe("inset")}

        {shownHover && (
          <div
            aria-hidden="true"
            style={{
              transform: `translate3d(${tooltipPos.x}px, ${tooltipPos.y}px, 0)`,
            }}
            className="pointer-events-none absolute left-0 top-0 z-20 hidden items-center gap-2 rounded-lg border border-border bg-card/95 px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-(--shadow-card-hover) backdrop-blur-xs will-change-transform sm:inline-flex"
          >
            {hubs.has(shownHover) && (
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 shrink-0 rounded-full bg-live-sage"
              />
            )}
            <span>{label(shownHover)}</span>
          </div>
        )}
      </div>

      {renderEnclaveLoupe("stacked")}

      <p className="mt-3 min-h-6 text-sm text-muted-foreground" aria-live="polite">
        {shown ? (
          <>
            {prefix} <strong className="font-semibold text-foreground">{label(shown)}</strong>
            {hubs.has(shown) && <span> · {m.hasAlertsSuffix}</span>}
          </>
        ) : (
          <>
            {prefix} <strong className="font-semibold text-foreground">{allLabel}</strong>
          </>
        )}
      </p>

      <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        {visibleHubs.length > 0 ? (
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span aria-hidden="true" className="inline-block h-3 w-3 rounded-sm bg-sapphire-border dark:bg-sapphire-light" />
              {recentHubsLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleHubs.map((hub) => (
                <button
                  key={hub}
                  type="button"
                  aria-pressed={effectiveSelected === hub}
                  onClick={() => chooseArea(hub, country)}
                  className={cn(
                    "min-h-[44px] rounded-lg border px-3 text-sm font-medium transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    effectiveSelected === hub
                      ? "border-sapphire bg-sapphire text-white"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {label(hub)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <span />
        )}

        <div>
          <label htmlFor={selectId} className="mb-1 block text-sm text-muted-foreground">
            {pickLabelText}
          </label>
          <select
            id={selectId}
            value={selectedInThisMap ? effectiveSelected : ""}
            onChange={(e) => chooseArea(e.target.value || allValue, country)}
            className="min-h-[44px] w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-64"
          >
            <option value="">{allLabel}</option>
            {sortedAreas.map((a) => (
              <option key={a.id} value={a.name}>
                {label(a.name)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
