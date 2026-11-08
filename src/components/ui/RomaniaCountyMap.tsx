"use client";

import React, { useId, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";
import { ROMANIA_COUNTIES_MAP, type CountryMap } from "@/lib/geo/romania-counties";
import { ITALY_REGIONS_MAP } from "@/lib/geo/italy-regions";
import { ITALY_WIDE } from "@/lib/data/news";

/** The value that means "no county chosen": national news, every hub. */
const ALL = "Toate județele";

/** The value that means "all of Italy" (no region chosen) when the Italy map is shown. */
export const ALL_ITALY = ITALY_WIDE;

export type MapCountry = "ro" | "it";

const MAPS: Record<MapCountry, CountryMap> = { ro: ROMANIA_COUNTIES_MAP, it: ITALY_REGIONS_MAP };

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
  onSelectCounty: (county: string) => void;
  /** Areas with recent news or a mediator hub; drawn darker and listed under the map. */
  activeHubs?: string[];
  /** Which country maps to offer. With both, a switch appears above the map. */
  countries?: MapCountry[];
  className?: string;
};

/** True for an Italian region name; those are not Romanian counties and are not saved as one. */
export function isItalianRegion(name: string): boolean {
  return ITALY_REGIONS_MAP.areas.some((a) => a.name === name);
}

function countryOf(name: string): MapCountry | null {
  if (name === ALL_ITALY) return "it";
  for (const c of Object.keys(MAPS) as MapCountry[]) {
    if (MAPS[c].areas.some((a) => a.name === name)) return c;
  }
  return null;
}

/**
 * County map: real boundaries (Natural Earth, public domain) for Romania's 42 counties
 * and Italy's 20 regions. Tap an area to choose it; keyboard and screen-reader users
 * get a native list with every area, and the quick buttons for areas with news.
 */
export function RomaniaCountyMap({
  selectedCounty,
  onSelectCounty,
  activeHubs = ["Iași", "Galați", "Cluj", "București"],
  countries = ["ro"],
  className,
}: RomaniaCountyMapProps) {
  const { lang, m } = useSafeLanguage();
  const selectId = useId();
  const [hovered, setHovered] = useState<string | null>(null);
  const [country, setCountry] = useState<MapCountry>(() => {
    const fromSelection = countryOf(selectedCounty);
    if (fromSelection && countries.includes(fromSelection)) return fromSelection;
    return lang === "it" && countries.includes("it") ? "it" : countries[0];
  });

  const map = MAPS[country];
  const hubs = useMemo(() => new Set(activeHubs), [activeHubs]);
  const sortedAreas = useMemo(
    () => [...map.areas].sort((a, b) => a.name.localeCompare(b.name, "ro")),
    [map],
  );
  const allValue = country === "it" ? ALL_ITALY : ALL;
  const allLabel = country === "it" ? m.allItaly : m.allCounties;
  const isAll = selectedCounty === allValue;
  const selectedInThisMap = map.areas.some((a) => a.name === selectedCounty);
  // Only a choice on the map in view is named; a county stays out of the Italy view and vice versa.
  const shown = hovered ?? (selectedInThisMap ? selectedCounty : null);
  const prefix = (shown ? countryOf(shown) : country) === "it" ? m.selectedRegionPrefix : m.selectedCountyPrefix;
  const visibleHubs = activeHubs.filter((h) => map.areas.some((a) => a.name === h));

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 sm:p-6", className)}>
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{country === "it" ? m.italyTitle : m.title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{country === "it" ? m.italySubtitle : m.subtitle}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {countries.length > 1 && (
            <div role="group" aria-label={`${m.romania} / ${m.italy}`} className="inline-flex rounded-lg border border-border p-0.5">
              {countries.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={country === c}
                  onClick={() => {
                    setCountry(c);
                    setHovered(null);
                  }}
                  className={cn(
                    "min-h-[40px] rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    country === c ? "bg-foreground text-background" : "text-foreground hover:bg-muted",
                  )}
                >
                  {c === "ro" ? m.romania : m.italy}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            aria-pressed={isAll}
            onClick={() => onSelectCounty(allValue)}
            className={cn(
              "min-h-[44px] rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isAll ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:bg-muted",
            )}
          >
            {allLabel}
          </button>
        </div>
      </div>

      <div className={cn("mx-auto mt-4 w-full", country === "it" ? "max-w-md" : "max-w-3xl")}>
        <svg
          viewBox={map.viewBox}
          className="block h-auto w-full select-none"
          role="img"
          aria-label={country === "it" ? m.italyMapAriaLabel : m.mapAriaLabel}
          onPointerLeave={() => setHovered(null)}
        >
          {map.areas.map((area) => {
            const selected = area.name === selectedCounty;
            const hub = hubs.has(area.name);
            return (
              <path
                key={area.id}
                d={area.d}
                fillRule="evenodd"
                onClick={() => onSelectCounty(area.name)}
                onPointerEnter={() => setHovered(area.name)}
                className={cn(
                  "cursor-pointer stroke-card transition-colors duration-150 [stroke-linejoin:round]",
                  selected
                    ? "fill-sapphire"
                    : hovered === area.name
                      ? "fill-slate-300 dark:fill-slate-500"
                      : hub
                        ? "fill-sapphire-border dark:fill-sapphire-light"
                        : "fill-slate-200 dark:fill-slate-700",
                )}
                style={{ strokeWidth: country === "it" ? 1.2 : 1.5 }}
              >
                <title>{area.name}</title>
              </path>
            );
          })}
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
                  area.name === selectedCounty ? "fill-white" : "fill-slate-600 dark:fill-slate-300",
                )}
                style={{ fontSize: country === "it" ? 19 : area.id === "B" || area.id === "IF" ? 11 : 15 }}
              >
                {area.id === "IF" ? "" : area.id}
              </text>
            ))}
        </svg>
      </div>

      <p className="mt-3 min-h-6 text-sm text-muted-foreground" aria-live="polite">
        {shown ? (
          <>
            {prefix} <strong className="font-semibold text-foreground">{shown}</strong>
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
              {country === "it" ? m.recentRegionsLabel : m.recentNewsLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleHubs.map((hub) => (
                <button
                  key={hub}
                  type="button"
                  aria-pressed={selectedCounty === hub}
                  onClick={() => onSelectCounty(hub)}
                  className={cn(
                    "min-h-[44px] rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selectedCounty === hub
                      ? "border-sapphire bg-sapphire text-white"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {hub}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <span />
        )}

        <div>
          <label htmlFor={selectId} className="mb-1 block text-sm text-muted-foreground">
            {m.pickLabel}
          </label>
          <select
            id={selectId}
            value={selectedInThisMap ? selectedCounty : ""}
            onChange={(e) => onSelectCounty(e.target.value || allValue)}
            className="min-h-[44px] w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-64"
          >
            <option value="">{allLabel}</option>
            {sortedAreas.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
