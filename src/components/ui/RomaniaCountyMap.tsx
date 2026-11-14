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
import { translations } from "@/lib/i18n/translations";
import { ROMANIA_COUNTIES_MAP, type CountryMap, type MapArea } from "@/lib/geo/romania-counties";
import { MOLDOVA_REGIONS_MAP } from "@/lib/geo/moldova-regions";
import { CROATIA_COUNTIES_MAP } from "@/lib/geo/croatia-counties";
import { ITALY_REGIONS_MAP } from "@/lib/geo/italy-regions";
import { ALBANIA_COUNTIES_MAP } from "@/lib/geo/albania-counties";
import { placeName } from "@/components/news/news-format";
import { useCalmReducedMotion } from "@/lib/motion/tokens";
import {
  ALL_ALBANIA,
  ALL_CROATIA,
  ALL_ITALY,
  ALL_MOLDOVA,
  ALL_ROMANIA,
  EXTRA_MAP_COPY,
  countryAllValue,
  mapCountriesForLang,
  type MapCountry,
  type RomaniaCountyMapProps,
} from "./romania-county-map-helpers";

export {
  ALL_ALBANIA,
  ALL_CROATIA,
  ALL_ITALY,
  ALL_MOLDOVA,
  EXTRA_MAP_COPY,
  countryAllValue,
  mapCountriesForLang,
  type MapCountry,
  type RomaniaCountyMapProps,
};

const MAPS: Record<MapCountry, CountryMap> = {
  ro: ROMANIA_COUNTIES_MAP,
  md: MOLDOVA_REGIONS_MAP,
  it: ITALY_REGIONS_MAP,
  hr: CROATIA_COUNTIES_MAP,
  al: ALBANIA_COUNTIES_MAP,
};

const MAP_ASPECT: Record<MapCountry, { aspectRatio: string; maxWidth: string; strokeBase: number; strokeSelected: number; fontSize: number }> = {
  ro: { aspectRatio: "1000 / 709", maxWidth: "max-w-3xl", strokeBase: 1.5, strokeSelected: 3, fontSize: 15 },
  md: { aspectRatio: "799 / 1000", maxWidth: "max-w-md", strokeBase: 1.3, strokeSelected: 2.6, fontSize: 14 },
  it: { aspectRatio: "760 / 1001", maxWidth: "max-w-md", strokeBase: 1.2, strokeSelected: 2.4, fontSize: 19 },
  hr: { aspectRatio: "1000 / 981", maxWidth: "max-w-xl", strokeBase: 1.4, strokeSelected: 2.8, fontSize: 15 },
  al: { aspectRatio: "463 / 1000", maxWidth: "max-w-[300px] sm:max-w-[330px]", strokeBase: 1.3, strokeSelected: 2.6, fontSize: 15 },
};

/** Small urban enclaves where 2-letter codes would collide with the surrounding county/raion label. */
const HIDDEN_ENCLAVE_LABELS: Record<MapCountry, ReadonlySet<string>> = {
  ro: new Set(),
  md: new Set(["CU", "BL", "BD"]),
  it: new Set(),
  hr: new Set(["GZ"]),
  al: new Set(),
};

/** Pole-of-inaccessibility label overrides for Romania's Ilfov/București enclave pair so both codes sit cleanly in-map. */
const ROMANIA_LABEL_OVERRIDES: Record<string, { pos: [number, number]; fontSize: number }> = {
  IF: { pos: [628.5, 547.5], fontSize: 11.5 },
  B: { pos: [614.5, 582.0], fontSize: 9.5 },
};

const MUNICIPALITY_PLACES = new Set(["București", "Chișinău", "Bălți", "Bender", "Grad Zagreb"]);

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

/** True for an Albanian qark name (12 official counties). */
export function isAlbanianCounty(name: string): boolean {
  return ALBANIA_COUNTIES_MAP.areas.some((a) => a.name === name);
}

/** True for a Moldovan area whose name does not overlap a Romanian county ("Călărași" exists in both). */
export function isMoldovanOnlyRegion(name: string): boolean {
  return isMoldovanRegion(name) && !ROMANIA_COUNTIES_MAP.areas.some((a) => a.name === name);
}

function inferCountryOfSelection(name: string, allowed: MapCountry[]): MapCountry | null {
  if (name === ALL_ITALY && allowed.includes("it")) return "it";
  if (name === ALL_MOLDOVA && allowed.includes("md")) return "md";
  if (name === ALL_CROATIA && allowed.includes("hr")) return "hr";
  if (name === ALL_ALBANIA && allowed.includes("al")) return "al";
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
 * Interactive administrative map for Romania (42 counties), Republic of Moldova (36 regions/municipalities),
 * Albania (12 qarqe), Croatia (21 županije), and Italy (20 regions).
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
    if (lang === "sq" && countries.includes("al")) return "al";
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
  const sortLocale = country === "hr" ? "hr" : country === "it" ? "it" : country === "al" ? "sq" : "ro";

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
          : country === "al"
            ? extra.allAlbania
            : m.allCounties;

  const titleText =
    country === "it"
      ? m.italyTitle
      : country === "md"
        ? extra.moldovaTitle
        : country === "hr"
          ? extra.croatiaTitle
          : country === "al"
            ? extra.albaniaTitle
            : m.title;

  const subtitleText =
    country === "it"
      ? m.italySubtitle
      : country === "md"
        ? extra.moldovaSubtitle
        : country === "hr"
          ? extra.croatiaSubtitle
          : country === "al"
            ? extra.albaniaSubtitle
            : m.subtitle;

  const mapAriaLabel =
    country === "it"
      ? m.italyMapAriaLabel
      : country === "md"
        ? extra.moldovaMapAriaLabel
        : country === "hr"
          ? extra.croatiaMapAriaLabel
          : country === "al"
            ? extra.albaniaMapAriaLabel
            : m.mapAriaLabel;

  const recentHubsLabel =
    country === "it"
      ? m.recentRegionsLabel
      : country === "md"
        ? extra.recentRaioaneLabel
        : country === "hr"
          ? extra.recentZupanijeLabel
          : country === "al"
            ? extra.recentQarqeLabel
            : m.recentNewsLabel;

  const pickLabelText =
    country === "it"
      ? extra.pickItalyLabel
      : country === "md"
        ? extra.pickMoldovaLabel
        : country === "hr"
          ? extra.pickCroatiaLabel
          : country === "al"
            ? extra.pickAlbaniaLabel
            : m.pickLabel;

  const countrySwitchLabel = (c: MapCountry) =>
    c === "ro"
      ? m.romania
      : c === "md"
        ? extra.moldova
        : c === "hr"
          ? extra.croatia
          : c === "al"
            ? extra.albania
            : m.italy;

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
          : country === "al"
            ? extra.selectedQarkPrefix
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

  // Paint enclaves above surrounding cutout polygons, and active/focused/hovered polygons last so neighbor borders never occlude their strokes.
  const orderedAreas = useMemo(() => {
    const rank = (name: string) => {
      if (name === effectiveSelected) return 3;
      if (name === focusedArea) return 2;
      if (name === hovered) return 1;
      if (name === "București") return 0.5;
      return 0;
    };
    return [...map.areas].sort((a, b) => rank(a.name) - rank(b.name));
  }, [map.areas, effectiveSelected, focusedArea, hovered]);

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
                    "-mb-px min-h-[44px] whitespace-nowrap border-b-2 px-0.5 text-sm transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
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
              "min-h-[44px] whitespace-nowrap rounded-lg border px-3 text-sm font-medium transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
          {map.areas.map((area) => {
            const roOverride = country === "ro" ? ROMANIA_LABEL_OVERRIDES[area.id] : undefined;
            const lx = roOverride ? roOverride.pos[0] : area.label[0];
            const ly = roOverride ? roOverride.pos[1] : area.label[1];
            const fSize = roOverride ? roOverride.fontSize : layout.fontSize;
            return (
              <text
                key={area.id}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                aria-hidden="true"
                className={cn(
                  "pointer-events-none hidden font-semibold tabular-nums sm:block",
                  area.name === effectiveSelected ? "fill-foreground" : "fill-slate-600 dark:fill-slate-300",
                )}
                style={{ fontSize: fSize }}
              >
                {hiddenLabels.has(area.id) ? "" : area.id}
              </text>
            );
          })}
        </svg>

        {shownHover && (
          <div
            aria-hidden="true"
            style={{
              transform: `translate3d(${tooltipPos.x}px, ${tooltipPos.y}px, 0)`,
            }}
            className="pointer-events-none absolute left-0 top-0 z-20 hidden items-center gap-2 rounded-lg border border-border bg-card/95 px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-(--shadow-card-hover) backdrop-blur-xs will-change-transform sm:inline-flex"
          >
            <span>{label(shownHover)}</span>
          </div>
        )}
      </div>

      <p className="mt-3 min-h-6 text-sm text-muted-foreground" aria-live="polite">
        {shown ? (
          <>
            {prefix} <strong className="font-semibold text-foreground">{label(shown)}</strong>
            {hubs.has(shown) && <span> — {m.hasAlertsSuffix}</span>}
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
                    "min-h-[44px] whitespace-nowrap rounded-lg border px-3 text-sm font-medium transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
            className="min-h-[44px] w-full rounded-lg border border-border bg-background px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-64"
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
