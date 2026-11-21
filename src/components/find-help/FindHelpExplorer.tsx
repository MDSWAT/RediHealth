"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { useReadAloud } from "@/components/health-check/readingTools";
import { useSheetDialog } from "@/components/news/use-sheet-dialog";
import { prefersCalmOrReducedMotion } from "@/lib/comfort-preferences";
import { Button } from "@/components/ui/Button";
import { ListenButton } from "@/components/ui/ListenButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { AlertCircleIcon, CheckIcon, ClockIcon, FilterIcon, GlobeIcon, PhoneIcon, PinIcon, SearchIcon, XIcon } from "@/components/ui/icons";
import { FamilyShareButton } from "@/components/ui/FamilyShareButton";
import { LocationFilterPopover } from "@/components/find-help/LocationFilterPopover";
import {
  FilterDropdown,
  FilterMenuOption as MenuOption,
} from "@/components/ui/FilterDropdown";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  type CityPreset,
  REGIONAL_CITY_PRESETS,
  findHelpTranslations,
  formatHumanDistance,
  formatOpeningHours,
  hasRecognizedHoursSchedule,
  isInstituteOpenNow,
} from "@/lib/i18n/find-help-translations";
import {
  directionsUrl,
  isInstituteCategory,
  primaryPhoneHref,
  type CountryCode,
  type InstituteCategory,
  type MedicalInstitute,
} from "@/lib/medical-institutes";
import type { InstituteOwnership } from "@/lib/institute-ownership";
import {
  readSavedFindHelpLocation,
  resolveSmartLocation,
  writeSavedFindHelpLocation,
  type SmartLocationResolution,
} from "@/lib/smart-location";
import { queryOfflineInstitutes, saveOfflineInstitutes } from "@/lib/pwa/offline-institutes";
import { isBrowserOffline } from "@/lib/pwa/use-online-status";

function MapLoading() {
  const { lang, t } = useLanguage();
  const label = t?.findHelpPage?.loadingMap ?? findHelpTranslations[lang].page.loadingMap;
  // The map surface itself shimmers while the tiles load, so the frame never reads as broken.
  return (
    <div role="status" className="skeleton-sheen relative flex h-full items-center justify-center !rounded-none">
      <span className="text-meta font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

const InstitutesMap = dynamic(() => import("@/components/find-help/InstitutesMapInner"), {
  ssr: false,
  loading: () => <MapLoading />,
});

/** Results shown before "Show more": enough to compare, short enough to reach the footer on a phone. */
const PAGE_SIZE = 20;

/** Ordered for instant low-literacy visual scanning: All, Pharmacy, Hospital, Family doctor, Clinic, Dentist. */
const WAYFINDING_CATEGORIES: readonly (InstituteCategory | null)[] = [
  null,
  "pharmacy",
  "hospital",
  "gp",
  "clinic",
  "dentist",
];

const COLD_LOAD_SKELETON_WIDTHS: readonly { title: string; address: string; meta: string }[] = [
  { title: "w-3/5", address: "w-4/5", meta: "w-2/5" },
  { title: "w-1/2", address: "w-3/4", meta: "w-1/3" },
  { title: "w-2/3", address: "w-5/6", meta: "w-2/5" },
  { title: "w-7/12", address: "w-2/3", meta: "w-1/3" },
  { title: "w-3/5", address: "w-3/4", meta: "w-5/12" },
];

/** Offsets each placeholder row's sheen a little, so the light travels down the list as one wave. */
function rowSheen(index: number): CSSProperties {
  return { animationDelay: `${index * 90}ms` };
}

function RetryIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-2.34 5.66" />
      <path d="M20 4v7h-7" />
    </svg>
  );
}

function prefersReducedMotion() {
  return prefersCalmOrReducedMotion();
}

function normalizeLocationToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase()
    .trim();
}

function findPresetCityMatch(
  rawQuery: string,
  preferredCountry: CountryCode,
): (CityPreset & { country: CountryCode }) | null {
  const token = normalizeLocationToken(rawQuery);
  if (!token) return null;

  if (["medimurje", "medjimurje", "cakovec", "medimurska", "medjimurska"].includes(token)) {
    const cakovec = REGIONAL_CITY_PRESETS.HR.find(
      (c) => normalizeLocationToken(c.name) === "cakovec",
    );
    if (cakovec) return { ...cakovec, country: "HR" };
  }
  if (["varazdin", "varazdinska"].includes(token)) {
    const varazdin = REGIONAL_CITY_PRESETS.HR.find(
      (c) => normalizeLocationToken(c.name) === "varazdin",
    );
    if (varazdin) return { ...varazdin, country: "HR" };
  }

  const orderedCountries: CountryCode[] = [
    preferredCountry,
    ...(Object.keys(REGIONAL_CITY_PRESETS) as CountryCode[]).filter((c) => c !== preferredCountry),
  ];
  for (const country of orderedCountries) {
    const cities = REGIONAL_CITY_PRESETS[country] ?? [];
    for (const city of cities) {
      if (normalizeLocationToken(city.name) === token) {
        return { ...city, country };
      }
    }
  }
  return null;
}

function isDesktopViewport() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
}

/** The last list that loaded, kept on the phone for when nothing can be loaded. */
const LAST_LIST_STORAGE_KEY = "redihealth.findHelpLastList.v1";
const LAST_LIST_MAX_ROWS = 40;

/** Only what a result row shows. Nothing about the reader: no location, no search text. */
type SavedListRow = {
  name: string;
  category: InstituteCategory;
  emergency: boolean;
  address: string | null;
  city: string | null;
  phone: string | null;
  hours: string | null;
  lat: number;
  lng: number;
};

function writeSavedList(rows: MedicalInstitute[]) {
  try {
    const saved: SavedListRow[] = rows.slice(0, LAST_LIST_MAX_ROWS).map((row) => ({
      name: row.name,
      category: row.category,
      emergency: row.emergency,
      address: row.address,
      city: row.city,
      phone: row.phone,
      hours: row.hours,
      lat: row.lat,
      lng: row.lng,
    }));
    window.localStorage.setItem(LAST_LIST_STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), rows: saved }));
  } catch {
    // Storage is full or blocked: the list simply is not kept.
  }
}

function textOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function readSavedList(country: CountryCode): { savedAt: number; rows: MedicalInstitute[] } | null {
  try {
    const raw = window.localStorage.getItem(LAST_LIST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: unknown; rows?: unknown };
    if (typeof parsed.savedAt !== "number" || !Array.isArray(parsed.rows)) return null;
    const rows: MedicalInstitute[] = [];
    parsed.rows.forEach((value: unknown, index: number) => {
      if (!value || typeof value !== "object") return;
      const row = value as Partial<SavedListRow>;
      if (
        typeof row.name !== "string" ||
        !isInstituteCategory(row.category) ||
        typeof row.lat !== "number" ||
        typeof row.lng !== "number" ||
        !Number.isFinite(row.lat) ||
        !Number.isFinite(row.lng)
      ) {
        return;
      }
      rows.push({
        id: `saved-${index}`,
        country_code: country,
        name: row.name,
        category: row.category,
        ownership: null,
        address: textOrNull(row.address),
        city: textOrNull(row.city),
        phone: textOrNull(row.phone),
        website: null,
        hours: textOrNull(row.hours),
        emergency: row.emergency === true,
        lat: row.lat,
        lng: row.lng,
        distance_km: null,
      });
    });
    return rows.length > 0 ? { savedAt: parsed.savedAt, rows } : null;
  } catch {
    return null;
  }
}

type SearchArea =
  | { kind: "country"; country: CountryCode }
  | {
      kind: "point";
      lat: number;
      lng: number;
      source: "gps" | "area" | "city";
      cityName?: string;
      country?: CountryCode;
    };

/**
 * A remembered place that is not one of the listed cities is an address the reader typed before:
 * it comes back as a searched point ("2 km away"), not as a city centre.
 */
function savedAddressLabel(resolution: SmartLocationResolution): string | null {
  if (resolution.reason !== "saved" || resolution.mode !== "city" || !resolution.city) return null;
  const { name, country } = resolution.city;
  return REGIONAL_CITY_PRESETS[country].some((preset) => preset.name === name) ? null : name;
}

function areaFromSmartResolution(resolution: SmartLocationResolution): SearchArea {
  if (resolution.mode === "city" && resolution.city) {
    if (savedAddressLabel(resolution)) {
      return { kind: "point", lat: resolution.city.lat, lng: resolution.city.lng, source: "area" };
    }
    return {
      kind: "point",
      lat: resolution.city.lat,
      lng: resolution.city.lng,
      source: "city",
      cityName: resolution.city.name,
      country: resolution.country,
    };
  }
  return { kind: "country", country: resolution.country };
}

function isSameSearchArea(a: SearchArea, b: SearchArea): boolean {
  if (a.kind === "country" && b.kind === "country") return a.country === b.country;
  if (a.kind === "point" && b.kind === "point") {
    return (
      a.source === b.source &&
      a.lat === b.lat &&
      a.lng === b.lng &&
      a.cityName === b.cityName &&
      a.country === b.country
    );
  }
  return false;
}

type LocationStatus = "idle" | "locating" | "active" | "denied";
type MobileViewMode = "list" | "map";

type ApiResponse = {
  country: CountryCode | null;
  center: { lat: number; lng: number };
  institutes: MedicalInstitute[];
  hasMore?: boolean;
};

function CategoryIcon({
  category,
  className = "h-5 w-5",
}: {
  category: InstituteCategory | null;
  className?: string;
}) {
  switch (category) {
    case null:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.75" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.75" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.75" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.75" />
        </svg>
      );
    case "pharmacy":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M9.25 3.5h5.5v5.75h5.75v5.5h-5.75v5.75h-5.5v-5.75H3.5v-5.5h5.75V3.5Z" />
        </svg>
      );
    case "hospital":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M3.5 20.5h17" />
          <path d="M5.5 20.5V5.5A1.5 1.5 0 0 1 7 4h10a1.5 1.5 0 0 1 1.5 1.5v15" />
          <path d="M9.5 20.5v-4.5h5v4.5" />
          <path d="M12 7.25v5" />
          <path d="M9.5 9.75h5" />
        </svg>
      );
    case "gp":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M5.5 4.5v4.5a4.5 4.5 0 0 0 9 0V4.5" />
          <path d="M4 4.5h3" />
          <path d="M13 4.5h3" />
          <path d="M10 13.5v2.25a4.25 4.25 0 0 0 8.5 0V13.5" />
          <circle cx="18.5" cy="11.25" r="2" />
        </svg>
      );
    case "clinic":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <rect x="3.5" y="7" width="17" height="13" rx="2" />
          <path d="M9 7V5.25A1.75 1.75 0 0 1 10.75 3.5h2.5A1.75 1.75 0 0 1 15 5.25V7" />
          <path d="M12 10.75v5.5" />
          <path d="M9.25 13.5h5.5" />
        </svg>
      );
    case "dentist":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M7.5 3.75C5.3 3.75 4 5.55 4 8c0 2.3.9 4.1 1.6 6.2.6 1.8.9 4.8 2.2 4.8 1.1 0 1.5-2.2 2.2-3.6.4-.8.9-1.2 2-1.2s1.6.4 2 1.2c.7 1.4 1.1 3.6 2.2 3.6 1.3 0 1.6-3 2.2-4.8.7-2.1 1.6-3.9 1.6-6.2 0-2.45-1.3-4.25-3.5-4.25-1.7 0-2.9.9-4.5.9s-2.8-.9-4.5-.9Z" />
        </svg>
      );
    case "other":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M12 3.25 5 6.25v5.25c0 4.55 2.98 8.74 7 9.75 4.02-1.01 7-5.2 7-9.75V6.25l-7-3Z" />
          <path d="M12 9v5" />
          <path d="M9.5 11.5h5" />
        </svg>
      );
  }
}

function ListViewIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function MapViewIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m9 4-5.5 2v14L9 18l6 2 5.5-2V4L15 6 9 4Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

const primaryFilledActionClass =
  "press-solid flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-sapphire bg-sapphire px-3 py-2 text-body font-semibold text-white shadow-2xs max-[359px]:gap-1.5 max-[359px]:px-2 " +
  "transition-[color,background-color,border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none " +
  "hover:border-sapphire-light hover:bg-sapphire-light hover:shadow-xs " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

const secondaryActionClass =
  "press-row inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border-control bg-card px-3 py-2 text-body font-semibold text-foreground shadow-2xs " +
  "transition-[color,background-color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none " +
  "hover:border-sapphire/50 hover:bg-sapphire-soft/35 hover:text-sapphire " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export function PlaceCardActions({
  institute,
  hasPhone,
  phoneHref,
  displayPhone,
  shareText,
  copy,
  lang,
  stopPropagation = false,
}: {
  institute: MedicalInstitute;
  hasPhone: boolean;
  phoneHref: string | null;
  displayPhone: string | null | undefined;
  shareText: string;
  copy: (typeof findHelpTranslations)[keyof typeof findHelpTranslations];
  lang: keyof typeof findHelpTranslations;
  stopPropagation?: boolean;
}) {
  const handleLinkClick = stopPropagation
    ? (event: MouseEvent<HTMLAnchorElement>) => event.stopPropagation()
    : undefined;
  const callLabel = hasPhone && displayPhone ? copy.callNumber(displayPhone) : null;

  return (
    <div className="mt-3.5 flex flex-col gap-2">
      {hasPhone && phoneHref && callLabel ? (
        <a
          href={phoneHref}
          aria-label={callLabel}
          title={callLabel}
          data-call-action=""
          className={primaryFilledActionClass}
          onClick={handleLinkClick}
        >
          <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="tabular-nums">{callLabel}</span>
        </a>
      ) : (
        <a
          href={directionsUrl(institute)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={copy.directions}
          title={copy.directions}
          className={primaryFilledActionClass}
          onClick={handleLinkClick}
        >
          <PinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{copy.directions}</span>
        </a>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {hasPhone && phoneHref ? (
          <a
            href={directionsUrl(institute)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={copy.directions}
            title={copy.directions}
            className={secondaryActionClass}
            onClick={handleLinkClick}
          >
            <PinIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" aria-hidden="true" />
            <span>{copy.directions}</span>
          </a>
        ) : null}
        {institute.website ? (
          <a
            href={institute.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={copy.website}
            title={copy.website}
            className={secondaryActionClass}
            onClick={handleLinkClick}
          >
            <GlobeIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" aria-hidden="true" />
            <span>{copy.website}</span>
          </a>
        ) : null}
        <div
          className="shrink-0"
          onClick={stopPropagation ? (event) => event.stopPropagation() : undefined}
        >
          <FamilyShareButton
            compact
            lang={lang}
            title={institute.name}
            text={shareText}
            url={directionsUrl(institute)}
          />
        </div>
      </div>
    </div>
  );
}

const quickChipBaseClass =
  "inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-(--radius-control) border px-3 py-2 text-body font-semibold " +
  "transition-[color,background-color,border-color,box-shadow,filter] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const quickChipActiveClass =
  `${quickChipBaseClass} press-solid border-sapphire bg-sapphire text-white shadow-(--hairline-refraction) hover:border-sapphire-light hover:bg-sapphire-light`;

const quickChipInactiveClass =
  `${quickChipBaseClass} press-row border-border-control bg-card text-foreground shadow-(--shadow-card-rest) hover:border-foreground/40 hover:bg-muted/70 hover:shadow-(--shadow-card-hover) active:bg-muted`;

/** Clean checkable filter toggle button with pressed state and trailing check icon. */
function FilterToggleButton({
  checked,
  onToggle,
  renderIcon,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  renderIcon: (checked: boolean) => ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className={`inline-flex min-h-12 items-center gap-2 whitespace-nowrap rounded-(--radius-control) border px-3.5 py-2 text-body font-semibold transition-[color,background-color,border-color,box-shadow,filter] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        checked
          ? "press-solid border-sapphire bg-sapphire text-white shadow-(--hairline-refraction) hover:border-sapphire-light hover:bg-sapphire-light"
          : "press-row border-border-control bg-card text-foreground shadow-(--shadow-card-rest) hover:border-foreground/40 hover:bg-muted/70 hover:shadow-(--shadow-card-hover) active:bg-muted"
      }`}
    >
      {renderIcon(checked)}
      <span>{label}</span>
      {checked ? <CheckIcon className="h-4 w-4 shrink-0 text-white" aria-hidden="true" /> : null}
    </button>
  );
}

export function FindHelpExplorer({
  initialCountry,
  initialCategory = null,
  detectedIpCountry = null,
}: {
  initialCountry: CountryCode;
  initialCategory?: InstituteCategory | null;
  detectedIpCountry?: CountryCode | null;
}) {
  const { t, lang } = useLanguage();
  const copy = findHelpTranslations[lang];
  const page = t?.findHelpPage ?? copy.page;

  const voice = useReadAloud(lang);
  const [speechTarget, setSpeechTarget] = useState<"intro" | "rights" | null>(null);
  const activeSpeech = voice.speaking ? speechTarget : null;

  const initialGuess = useMemo(
    () => resolveSmartLocation({ lang, ipCountry: detectedIpCountry }),
    [lang, detectedIpCountry],
  );
  const [area, setArea] = useState<SearchArea>(() => areaFromSmartResolution(initialGuess));
  const [activeCountry, setActiveCountry] = useState<CountryCode>(() => initialGuess.country ?? initialCountry);
  const [guessReason, setGuessReason] = useState<"language" | "region" | null>(() =>
    initialGuess.reason === "saved" ? null : initialGuess.reason,
  );
  const clientSmartGuessRef = useRef<SmartLocationResolution>(initialGuess);
  const userPickedManuallyRef = useRef(false);
  /** GPS worked but the nearest place is over 80 km away: we show the suggested hub and say why. */
  const [farFromServices, setFarFromServices] = useState(false);
  const [category, setCategory] = useState<InstituteCategory | null>(initialCategory);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  /** Public (state) or private only; null lists both, including places whose ownership is unknown. */
  const [ownership, setOwnership] = useState<InstituteOwnership | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchedPointLabel, setSearchedPointLabel] = useState<string | null>(null);
  const [addressSearching, setAddressSearching] = useState(false);
  const resolvedAddressInputRef = useRef<string | null>(null);
  const [institutes, setInstitutes] = useState<MedicalInstitute[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [settled, setSettled] = useState<{ key: string; failed: boolean; offline: boolean } | null>(null);
  /** Which place the rows now on screen were loaded for: a failed refresh keeps them only for that same place. */
  const listInfoRef = useRef<{ areaKey: string | null; count: number }>({ areaKey: null, count: 0 });
  /** Set while the rows on screen come from the list saved on the phone (when it was saved). */
  const [savedListAt, setSavedListAt] = useState<number | null>(null);
  /** Phones browse a whole country one page at a time; this is the next page, or null when there is none. */
  const [countryNextPage, setCountryNextPage] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const requestKeyRef = useRef("");
  const activeCountryRef = useRef<CountryCode>(activeCountry);
  useEffect(() => {
    activeCountryRef.current = activeCountry;
  }, [activeCountry]);
  /** The typed text that was found neither as an address nor, so far, as a name. */
  const [addressNotFoundFor, setAddressNotFoundFor] = useState<string | null>(null);
  /** The map (Leaflet and one marker per place) loads only once it can be seen: at once on a wide screen, on first open on a phone. */
  const [mapWanted, setMapWanted] = useState(false);
  /** A location prompt that is never answered gives no callback; after a short wait the place counts as unknown. */
  const [autoLocateWaited, setAutoLocateWaited] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverRafRef = useRef<number | null>(null);
  const pendingHoverIdRef = useRef<string | null>(null);

  const scheduleHoverChange = useCallback((nextId: string | null) => {
    pendingHoverIdRef.current = nextId;
    if (hoverRafRef.current !== null) return;
    hoverRafRef.current = window.requestAnimationFrame(() => {
      hoverRafRef.current = null;
      const target = pendingHoverIdRef.current;
      setHoveredId((prev) => (prev === target ? prev : target));
    });
  }, []);

  useEffect(() => {
    return () => {
      if (hoverRafRef.current !== null) {
        window.cancelAnimationFrame(hoverRafRef.current);
        hoverRafRef.current = null;
      }
    };
  }, []);

  const [mobileView, setMobileView] = useState<MobileViewMode>("list");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const filterSheetPanelRef = useRef<HTMLDivElement>(null);
  const filterSheetTitleId = useId();
  const desktopSearchInputId = useId();
  const mobileSearchInputId = useId();
  const closeFilterSheet = useCallback(() => setFilterSheetOpen(false), []);
  useSheetDialog(filterSheetOpen, filterSheetPanelRef, closeFilterSheet);
  useEffect(() => {
    if (!filterSheetOpen || typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setFilterSheetOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [filterSheetOpen]);
  const statusRowRef = useRef<HTMLDivElement>(null);
  const mapColumnRef = useRef<HTMLDivElement>(null);
  const listColumnRef = useRef<HTMLDivElement>(null);
  const [mobilePreviewId, setMobilePreviewId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const pendingScrollId = useRef<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [manualLocateTried, setManualLocateTried] = useState(false);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const geolocationRequested = useRef(false);

  /** Shows a remembered or guessed place. A remembered address also returns to the search box. */
  const applySmartResolution = useCallback((resolution: SmartLocationResolution) => {
    const targetArea = areaFromSmartResolution(resolution);
    const addressLabel = savedAddressLabel(resolution);
    setArea((prev) => {
      if (prev.kind === "point" && prev.source === "gps") return prev;
      return isSameSearchArea(prev, targetArea) ? prev : targetArea;
    });
    setActiveCountry(resolution.country);
    setGuessReason(resolution.reason === "saved" ? null : resolution.reason);
    if (addressLabel) {
      resolvedAddressInputRef.current = addressLabel;
      setSearchInput(addressLabel);
      setSearchedPointLabel(addressLabel);
    }
  }, []);

  const locateUser = useCallback((isManual = false) => {
    if (isManual) {
      setManualLocateTried(true);
      userPickedManuallyRef.current = true;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(point);
        setLocationStatus("active");
        setFarFromServices(false);
        setGuessReason(null);
        setSearchedPointLabel(null);
        resolvedAddressInputRef.current = null;
        setArea({ kind: "point", ...point, source: "gps" });
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 10 * 60_000 },
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const savedChoice = readSavedFindHelpLocation();
      let timeZone: string | null = null;
      try {
        timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
      } catch {
        timeZone = null;
      }
      const browserLocales =
        typeof navigator !== "undefined"
          ? navigator.languages?.length
            ? navigator.languages
            : navigator.language
              ? [navigator.language]
              : []
          : [];
      const resolved = resolveSmartLocation({
        lang,
        ipCountry: detectedIpCountry,
        timeZone,
        browserLocales,
        savedChoice,
      });
      clientSmartGuessRef.current = resolved;
      if (!userPickedManuallyRef.current) applySmartResolution(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [lang, detectedIpCountry, applySmartResolution]);

  useEffect(() => {
    if (geolocationRequested.current) return;
    geolocationRequested.current = true;
    locateUser(false);
  }, [locateUser]);

  useEffect(() => {
    const timer = window.setTimeout(() => setAutoLocateWaited(true), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    if (mq.matches) queueMicrotask(() => setMapWanted(true));
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMapWanted(true);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (searchInput === "") {
      resolvedAddressInputRef.current = null;
      if (searchedPointLabel !== null) queueMicrotask(() => setSearchedPointLabel(null));
      if (search !== "") queueMicrotask(() => setSearch(""));
      return;
    }
    if (resolvedAddressInputRef.current === trimmed) return;
    resolvedAddressInputRef.current = null;
    if (trimmed === search) return;
    const timer = window.setTimeout(() => {
      if (resolvedAddressInputRef.current === trimmed) return;
      setSearch(trimmed);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [searchInput, search, searchedPointLabel]);

  const requestQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (area.kind === "country") {
      params.set("country", area.country);
    } else {
      params.set("lat", area.lat.toFixed(5));
      params.set("lng", area.lng.toFixed(5));
      if (area.source === "city" && area.country) {
        params.set("country", area.country);
      }
    }
    if (category) params.set("category", category);
    if (search) params.set("q", search);
    // Public or private is filtered here, on the nearest places, so fetch the most the API allows:
    // otherwise "public only" in a city centre keeps a handful out of 80 mostly private pharmacies.
    // (A whole-country browse is already paged in 500s and ignores the limit.)
    if (ownership && area.kind === "point") params.set("limit", "200");
    return params.toString();
  }, [area, category, search, ownership]);
  const requestKey = `${requestQuery}#${reloadKey}`;
  const loading = settled?.key !== requestKey;
  const isColdLoad = loading && settled === null;
  const isRevalidating = loading && settled !== null;
  const error = !loading && Boolean(settled?.failed);
  const gpsActive = area.kind === "point" && area.source === "gps";
  const countryBrowse = area.kind === "country";
  const areaKey =
    area.kind === "country" ? `country:${area.country}` : `point:${area.lat.toFixed(5)},${area.lng.toFixed(5)}`;

  const areaPointLat = area.kind === "point" ? area.lat : null;
  const areaPointLng = area.kind === "point" ? area.lng : null;
  const areaTargetCountry = area.kind === "country" ? area.country : (area.country ?? null);

  useEffect(() => {
    requestKeyRef.current = requestKey;
    const controller = new AbortController();
    // A phone browsing a whole country takes one page of 500 at a time; "Show more" fetches the next one.
    const onePageAtATime = countryBrowse && !isDesktopViewport();
    const requestCountry = areaTargetCountry ?? activeCountryRef.current;
    const requestPoint =
      areaPointLat !== null && areaPointLng !== null
        ? { lat: areaPointLat, lng: areaPointLng }
        : null;

    const load = async () => {
      if (isBrowserOffline()) {
        throw new Error("Offline");
      }
      const institutes: MedicalInstitute[] = [];
      let page = 0;
      let data: ApiResponse;
      do {
        const response = await fetch(`/api/medical-institutes?${requestQuery}&page=${page}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = (await response.json()) as ApiResponse;
        if (!Array.isArray(data.institutes)) throw new Error("Invalid directory response");
        institutes.push(...data.institutes);
        page += 1;
      } while (!onePageAtATime && data.hasMore && data.institutes.length > 0);
      const nextPage = onePageAtATime && data.hasMore && data.institutes.length > 0 ? page : null;
      return { ...data, institutes, nextPage };
    };
    load()
      .then((data) => {
        if (controller.signal.aborted) return;
        let fetchedMinDistance: number | null = null;
        for (const item of data.institutes) {
          if (item.distance_km != null && Number.isFinite(item.distance_km)) {
            if (fetchedMinDistance === null || item.distance_km < fetchedMinDistance) {
              fetchedMinDistance = item.distance_km;
            }
          }
        }
        const isDistantGpsResult = gpsActive && fetchedMinDistance !== null && fetchedMinDistance > 80;

        if (isDistantGpsResult) {
          const fallback = clientSmartGuessRef.current;
          const fallbackAddress = savedAddressLabel(fallback);
          setFarFromServices(true);
          setActiveCountry(fallback.country);
          setGuessReason(fallback.reason === "saved" ? null : fallback.reason);
          setArea(areaFromSmartResolution(fallback));
          if (fallbackAddress) {
            resolvedAddressInputRef.current = fallbackAddress;
            setSearchInput(fallbackAddress);
            setSearchedPointLabel(fallbackAddress);
          }
          return;
        }

        setInstitutes(data.institutes);
        listInfoRef.current = { areaKey, count: data.institutes.length };
        setSavedListAt(null);
        setCountryNextPage(data.nextPage);
        setLoadMoreFailed(false);
        // Nearest-first lists are worth keeping for a day without internet; a whole-country page is not.
        if (!countryBrowse && data.institutes.length > 0) writeSavedList(data.institutes);
        if (data.institutes.length > 0) {
          saveOfflineInstitutes(data.country ?? requestCountry, data.institutes);
        }
        if (data.country) setActiveCountry(data.country);
        setSelectedId(null);
        pendingHoverIdRef.current = null;
        if (hoverRafRef.current !== null) {
          window.cancelAnimationFrame(hoverRafRef.current);
          hoverRafRef.current = null;
        }
        setHoveredId(null);
        setMobilePreviewId(null);
        setVisibleCount(PAGE_SIZE);
        setSettled({ key: requestKey, failed: false, offline: false });
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        const offline = isBrowserOffline();
        if (!offline) {
          console.error("Failed to load medical institutes", fetchError);
        }

        const offlineDirectory = queryOfflineInstitutes({
          country: requestCountry,
          point: requestPoint,
          category,
          search,
        });

        if (offlineDirectory) {
          setInstitutes(offlineDirectory.rows);
          setSavedListAt(offlineDirectory.savedAt);
          listInfoRef.current = { areaKey, count: offlineDirectory.rows.length };
          setCountryNextPage(null);
          setSelectedId(null);
          setMobilePreviewId(null);
          setVisibleCount(PAGE_SIZE);
          setSettled({
            key: requestKey,
            failed: offlineDirectory.rows.length > 0,
            offline,
          });
          return;
        }

        // Rows already on screen for this same place stay. Otherwise the list saved on the phone, if any.
        const kept = listInfoRef.current;
        if (!(kept.count > 0 && kept.areaKey === areaKey)) {
          const saved = readSavedList(initialCountry);
          setInstitutes(saved?.rows ?? []);
          setSavedListAt(saved?.savedAt ?? null);
          listInfoRef.current = { areaKey: null, count: saved?.rows.length ?? 0 };
          setCountryNextPage(null);
          setSelectedId(null);
          setMobilePreviewId(null);
          setVisibleCount(PAGE_SIZE);
        }
        setSettled({
          key: requestKey,
          failed: true,
          offline,
        });
      });

    return () => controller.abort();
  }, [
    requestQuery,
    requestKey,
    gpsActive,
    countryBrowse,
    areaKey,
    areaPointLat,
    areaPointLng,
    areaTargetCountry,
    category,
    search,
    initialCountry,
  ]);

  async function loadNextCountryPage() {
    if (countryNextPage === null || loadingMore) return;
    const key = requestKey;
    setLoadingMore(true);
    setLoadMoreFailed(false);
    try {
      const response = await fetch(`/api/medical-institutes?${requestQuery}&page=${countryNextPage}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as ApiResponse;
      if (!Array.isArray(data.institutes)) throw new Error("Invalid directory response");
      // The search changed while this page was on its way: these rows belong to the old one.
      if (requestKeyRef.current !== key) return;
      if (data.institutes.length > 0) {
        saveOfflineInstitutes(data.country ?? activeCountry, data.institutes);
      }
      setInstitutes((prev) => [...prev, ...data.institutes]);
      listInfoRef.current = { ...listInfoRef.current, count: listInfoRef.current.count + data.institutes.length };
      setCountryNextPage(data.hasMore && data.institutes.length > 0 ? countryNextPage + 1 : null);
      setVisibleCount((count) => count + PAGE_SIZE);
    } catch (loadError) {
      console.error("Failed to load more medical institutes", loadError);
      if (requestKeyRef.current === key) setLoadMoreFailed(true);
    } finally {
      setLoadingMore(false);
    }
  }

  const showFarNotice = farFromServices && !gpsActive;

  const displayedInstitutes = useMemo(() => {
    return institutes.filter((item) => {
      if (emergencyOnly && !item.emergency) return false;
      if (openNowOnly && !isInstituteOpenNow(item.hours)) return false;
      if (ownership && item.ownership !== ownership) return false;
      return true;
    });
  }, [institutes, emergencyOnly, openNowOnly, ownership]);

  // Desktop pin tap scrolls list row into view; mobile pin tap anchors a facility preview sheet with zero page-yanking.
  const selectInstitute = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (isDesktopViewport()) {
        const index = displayedInstitutes.findIndex((item) => item.id === id);
        if (index >= visibleCount) setVisibleCount(index + 1);
        pendingScrollId.current = id;
      } else {
        setMobilePreviewId(id);
      }
    },
    [displayedInstitutes, visibleCount, setMobilePreviewId],
  );

  useEffect(() => {
    const id = pendingScrollId.current;
    if (!id) return;
    pendingScrollId.current = null;
    if (!isDesktopViewport()) return;
    itemRefs.current
      .get(id)
      ?.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [selectedId, visibleCount]);

  function switchMobileView(next: MobileViewMode, focusId: string | null = null) {
    setMobileView(next);
    if (next === "map") setMapWanted(true);
    window.requestAnimationFrame(() => {
      const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
      if (next === "map") {
        (statusRowRef.current ?? mapColumnRef.current)?.scrollIntoView({ block: "start", behavior });
        return;
      }
      const row = focusId ? itemRefs.current.get(focusId) : null;
      if (row) row.scrollIntoView({ block: "center", behavior });
      else listColumnRef.current?.scrollIntoView({ block: "start", behavior });
    });
  }

  /** Tapping a place selects it cleanly without forced tab jumps on phones. */
  function showInstitute(id: string) {
    setSelectedId(id);
  }

  function chooseCountry(country: CountryCode) {
    userPickedManuallyRef.current = true;
    setGuessReason(null);
    setFarFromServices(false);
    setSearchedPointLabel(null);
    resolvedAddressInputRef.current = null;
    setActiveCountry(country);
    setArea({ kind: "country", country });
    writeSavedFindHelpLocation({ mode: "country", country, chosenOnLang: lang });
  }

  function chooseCity(city: CityPreset & { country?: CountryCode }) {
    const targetCountry = city.country ?? activeCountry;
    userPickedManuallyRef.current = true;
    setGuessReason(null);
    setFarFromServices(false);
    setSearchedPointLabel(null);
    setActiveCountry(targetCountry);
    setArea({
      kind: "point",
      lat: city.lat,
      lng: city.lng,
      source: "city",
      cityName: city.name,
      country: targetCountry,
    });
    writeSavedFindHelpLocation({
      mode: "city",
      country: targetCountry,
      cityName: city.name,
      lat: city.lat,
      lng: city.lng,
      chosenOnLang: lang,
    });
  }

  async function resolveAndApplySearch(rawQuery: string) {
    const trimmed = rawQuery.trim();
    setAddressNotFoundFor(null);
    if (!trimmed) {
      resolvedAddressInputRef.current = null;
      setSearchedPointLabel(null);
      setSearch("");
      return;
    }

    const presetMatch = findPresetCityMatch(trimmed, activeCountry);
    if (presetMatch) {
      resolvedAddressInputRef.current = trimmed;
      setSearch("");
      chooseCity(presetMatch);
      return;
    }

    if (isBrowserOffline()) {
      resolvedAddressInputRef.current = null;
      setSearchedPointLabel(null);
      setSearch(trimmed);
      return;
    }

    setAddressSearching(true);
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(trimmed)}&country=${encodeURIComponent(activeCountry)}`,
      );
      if (response.ok) {
        const payload = (await response.json()) as {
          match?: { lat: number; lng: number; label: string; country?: CountryCode } | null;
        };
        if (payload.match && Number.isFinite(payload.match.lat) && Number.isFinite(payload.match.lng)) {
          const targetCountry = payload.match.country ?? activeCountry;
          resolvedAddressInputRef.current = trimmed;
          userPickedManuallyRef.current = true;
          setGuessReason(null);
          setFarFromServices(false);
          setActiveCountry(targetCountry);
          setSearchedPointLabel(payload.match.label || trimmed);
          setSearch("");
          setArea({
            kind: "point",
            lat: payload.match.lat,
            lng: payload.match.lng,
            source: "area",
          });
          // Remembered on this phone, like a chosen city, so the next visit opens near the same address.
          writeSavedFindHelpLocation({
            mode: "city",
            country: targetCountry,
            cityName: payload.match.label || trimmed,
            lat: payload.match.lat,
            lng: payload.match.lng,
            chosenOnLang: lang,
          });
          return;
        }
      }
    } catch {
      // Graceful fallback to local text match
    } finally {
      setAddressSearching(false);
    }

    // Not an address we can place: try it as a name, and say so if that finds nothing either.
    setAddressNotFoundFor(trimmed);
    setSearchedPointLabel(null);
    setSearch(trimmed);
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    void resolveAndApplySearch(searchInput);
  }

  function clearFilters() {
    setCategory(null);
    setEmergencyOnly(false);
    setOpenNowOnly(false);
    setOwnership(null);
    resolvedAddressInputRef.current = null;
    setAddressNotFoundFor(null);
    setSearchedPointLabel(null);
    setSearch("");
    setSearchInput("");
  }

  const activeCityName = area.kind === "point" && area.source === "city" ? area.cityName ?? null : null;
  /** The automatic request on load may never be answered, so only a tap on "Use my location" shows as searching. */
  const locatingShown = locationStatus === "locating" && manualLocateTried;
  /** Location was refused, never answered or failed: the list is a guess the reader has not chosen. */
  const placeUnknown =
    !gpsActive &&
    locationStatus !== "active" &&
    (locationStatus === "denied" || autoLocateWaited || manualLocateTried);
  const guessedCity = placeUnknown && guessReason !== null ? activeCityName : null;
  const showLocateButton = placeUnknown && (guessedCity !== null || area.kind === "country");

  /** What the "Where" trigger shows: includes country whenever a city is selected. */
  const locationValue =
    locatingShown
      ? copy.locating
      : gpsActive
        ? copy.myLocation
        : activeCityName
          ? `${activeCityName}, ${copy.countries[activeCountry]}`
          : area.kind === "point" && searchedPointLabel
            ? `${searchedPointLabel}, ${copy.countries[activeCountry]}`
            : area.kind === "country"
              ? copy.countries[area.country]
              : copy.mapArea;

  const locationSummary =
    locatingShown
      ? copy.locating
      : gpsActive
        ? copy.locationActive
        : activeCityName
          ? copy.nearCity(activeCityName)
          : area.kind === "point" && searchedPointLabel
            ? copy.nearPlace(searchedPointLabel)
            : area.kind === "country"
              ? copy.showingCountry(copy.countries[area.country])
              : copy.placesInArea;

  const spokenStatusLine =
    locatingShown
      ? copy.locating
      : gpsActive
        ? copy.locationActive
        : showFarNotice
          ? copy.distantLocationNotice(copy.countries[activeCountry])
          : activeCityName
            ? `${activeCityName}, ${copy.countries[activeCountry]}`
            : copy.showingCountry(copy.countries[activeCountry]);

  const toggleIntroSpeech = () => {
    if (activeSpeech === "intro") {
      voice.stop();
      setSpeechTarget(null);
      return;
    }
    setSpeechTarget("intro");
    voice.speak([page.listTitle, page.listSubtitle, spokenStatusLine, copy.spokenIntro]);
  };

  const toggleRightsSpeech = () => {
    if (activeSpeech === "rights") {
      voice.stop();
      setSpeechTarget(null);
      return;
    }
    setSpeechTarget("rights");
    voice.speak([copy.emergencyRightsCallout]);
  };

  const filtered = Boolean(category || search || emergencyOnly || openNowOnly || ownership);
  /** Placeholders on the first load, and again when a retry or a new search has nothing on screen yet. */
  const showSkeleton = isColdLoad || (isRevalidating && displayedInstitutes.length === 0);
  /** Changes whenever a fresh set of results lands, so the rows arrive in order once per set. */
  const resultSetKey = `${settled?.key ?? ""}|${emergencyOnly ? 1 : 0}${openNowOnly ? 1 : 0}|${ownership ?? ""}`;
  const mobilePreviewInstitute = useMemo(
    () => (mobilePreviewId ? displayedInstitutes.find((item) => item.id === mobilePreviewId) ?? null : null),
    [displayedInstitutes, mobilePreviewId],
  );

  const numberLocale = lang === "rom" ? "ro" : lang;
  const offlineFailure = error && Boolean(settled?.offline);
  const listNotice =
    savedListAt !== null
      ? copy.savedListNotice(
          new Date(savedListAt).toLocaleDateString(numberLocale, { day: "numeric", month: "long" }),
        )
      : offlineFailure
        ? copy.offlineKeptList
        : copy.loadError;
  /**
   * "Hospital, public": the kind of place and, where the name tells it, who runs it. Pharmacies and
   * dentists are private by default and family doctors cannot be told, so those show the kind alone.
   */
  const placeKindLine = (institute: MedicalInstitute) => {
    const kind = copy.categories[institute.category];
    const tellsOwnership =
      institute.category === "hospital" || institute.category === "clinic" || institute.category === "gp";
    return institute.ownership && tellsOwnership
      ? `${kind}, ${copy.ownership[institute.ownership].toLocaleLowerCase(numberLocale)}`
      : kind;
  };
  const allowOver80Km = area.kind === "point" && area.source === "city";
  const distanceOriginCity = !gpsActive ? activeCityName : null;

  const mobileLocationSummary =
    locatingShown
      ? copy.locating
      : gpsActive
        ? copy.locationActive
        : activeCityName
          ? copy.nearPlace(activeCityName)
          : area.kind === "point" && searchedPointLabel
            ? copy.nearPlace(searchedPointLabel)
            : area.kind === "country"
              ? copy.showingCountry(copy.countries[area.country])
              : copy.placesInArea;
  const mobileFilterSummary = [
    mobileLocationSummary,
    category ? copy.categories[category] : copy.allPlaces,
    emergencyOnly ? copy.emergencyWalkInFilter : null,
    openNowOnly ? copy.openNowFilter : null,
    ownership === "public" ? copy.ownershipPublicOnly : ownership === "private" ? copy.ownershipPrivateOnly : null,
    search || null,
  ]
    .filter(Boolean)
    .join(", ");

  const hasNotices =
    (manualLocateTried && locationStatus === "denied" && !gpsActive) ||
    showFarNotice ||
    emergencyOnly;

  // The phone sheet holds only what the card above it does not: where, public or private, emergency care, open now.
  const extraFilterCount = (ownership ? 1 : 0) + (emergencyOnly ? 1 : 0) + (openNowOnly ? 1 : 0);
  const filtersButtonValue = extraFilterCount > 0 ? `${copy.filtersTitle} (${extraFilterCount})` : copy.filtersTitle;

  // The search box and the kind of place are already on the card, one tap away.
  const renderFilterFields = (layout: "desktop" | "sheet") => {
    const isSheet = layout === "sheet";
    return (
      <div
        className={
          isSheet
            ? "flex flex-col gap-4"
            : "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.15fr)_minmax(0,0.68fr)_auto] lg:items-center"
        }
      >
        {isSheet ? null : (
        <form
          onSubmit={(event) => {
            submitSearch(event);
          }}
          className="col-span-1 min-w-0 sm:col-span-2 lg:col-span-1"
          role="search"
        >
          <label htmlFor={desktopSearchInputId} className="sr-only">
            {copy.searchPlaceholder}
          </label>
          <div className="flex min-w-0 items-center gap-1.5">
            <div className="relative min-w-0 flex-1">
              <input
                id={desktopSearchInputId}
                type="search"
                name="q"
                enterKeyHint="search"
                autoCapitalize="words"
                value={searchInput}
                onChange={(event) => {
                  const next = event.target.value;
                  setSearchInput(next);
                  if (!next) setSearch("");
                }}
                placeholder={copy.searchPlaceholder}
                title={copy.searchPlaceholder}
                className={`field-focus peer min-h-12 w-full rounded-(--radius-control) border border-border-control bg-card py-2 pl-10 text-body text-foreground shadow-(--shadow-card-rest) motion-reduce:transition-none placeholder:text-muted-foreground dark:bg-ink-950/40 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden ${
                  searchInput ? "pr-12" : "pr-3.5"
                }`}
              />
              {/* After the input so it can follow its focus: the glass takes the focus colour with the edge. */}
              <SearchIcon
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none peer-focus-visible:text-sapphire dark:peer-focus-visible:text-sapphire-border"
                aria-hidden="true"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    resolvedAddressInputRef.current = null;
                    setSearchedPointLabel(null);
                    setSearchInput("");
                    setSearch("");
                  }}
                  aria-label={copy.clearFilters}
                  title={copy.clearFilters}
                  className="absolute right-1 top-1/2 inline-flex h-11 w-11 min-h-11 min-w-11 -translate-y-1/2 items-center justify-center whitespace-nowrap rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <XIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              )}
            </div>
            <Button
              type="button"
              variant="action"
              size="lg"
              disabled={addressSearching}
              onClick={() => void resolveAndApplySearch(searchInput)}
              className="shrink-0"
            >
              {copy.searchButton}
            </Button>
          </div>
        </form>
        )}

        <div className="min-w-0">
          {isSheet ? (
            <p className="mb-1.5 text-meta font-medium text-foreground">{copy.locationLabel}</p>
          ) : null}
          <LocationFilterPopover
            hideLabel={isSheet}
            label={copy.locationLabel}
            displayValue={locationValue}
            activeCountry={activeCountry}
            wholeCountrySelected={area.kind === "country" && area.country === activeCountry && !gpsActive}
            activeCityName={activeCityName}
            gpsActive={gpsActive}
            locating={locatingShown}
            countries={copy.countries}
            countryGroupLabel={copy.countryLabel}
            cityGroupLabel={copy.cityQuickJumpLabel}
            useMyLocationLabel={copy.useMyLocation}
            locatingLabel={copy.locating}
            wholeCountryOption={copy.wholeCountryOption}
            onSelectCountry={chooseCountry}
            onSelectCity={chooseCity}
            onLocateUser={() => locateUser(true)}
          />
        </div>

        {isSheet ? null : (
        <div className="col-span-1 min-w-0">
          <FilterDropdown
            label={copy.categoryLabel}
            value={category ? copy.categories[category] : copy.allCategories}
            icon={<CategoryIcon category={category} className="h-4 w-4" />}
            align="right"
            inlineLabel
          >
            <div className="space-y-0.5">
              {WAYFINDING_CATEGORIES.map((item) => (
                <MenuOption
                  key={item ?? "all"}
                  selected={category === item}
                  icon={<CategoryIcon category={item} className="h-4.5 w-4.5" />}
                  onSelect={() => {
                    setCategory(item);
                  }}
                >
                  {item ? copy.categories[item] : copy.allCategories}
                </MenuOption>
              ))}
            </div>
          </FilterDropdown>
        </div>
        )}

        {isSheet ? (
          <div className="flex flex-wrap gap-2">
            {/* Public or private: the value says it all ("Doar de stat"), so the trigger shows no label. */}
            <div className="w-full min-w-0">
              <p className="mb-1.5 text-meta font-medium text-foreground">{copy.ownershipLabel}</p>
              <FilterDropdown
                label={copy.ownershipLabel}
                value={
                  ownership === "public"
                    ? copy.ownershipPublicOnly
                    : ownership === "private"
                      ? copy.ownershipPrivateOnly
                      : copy.ownershipAll
                }
                align="left"
                hideLabel
              >
                <div className="space-y-0.5">
                  {([null, "public", "private"] as const).map((item) => (
                    <MenuOption
                      key={item ?? "all"}
                      selected={ownership === item}
                      description={
                        item === "public"
                          ? copy.ownershipPublicHint
                          : item === "private"
                            ? copy.ownershipPrivateHint
                            : undefined
                      }
                      onSelect={() => setOwnership(item)}
                    >
                      {item === "public"
                        ? copy.ownershipPublicOnly
                        : item === "private"
                          ? copy.ownershipPrivateOnly
                          : copy.ownershipAll}
                    </MenuOption>
                  ))}
                </div>
              </FilterDropdown>
            </div>

            <FilterToggleButton
              checked={emergencyOnly}
              onToggle={() => {
                const next = !emergencyOnly;
                setEmergencyOnly(next);
                if (next && category && category !== "hospital") setCategory(null);
              }}
              renderIcon={(active) => (
                <AlertCircleIcon
                  className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-primary"}`}
                  aria-hidden="true"
                />
              )}
              label={copy.emergencyWalkInFilter}
            />

            <FilterToggleButton
              checked={openNowOnly}
              onToggle={() => setOpenNowOnly((prev) => !prev)}
              renderIcon={(active) => (
                <ClockIcon
                  className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-sapphire dark:text-sapphire-border"}`}
                  aria-hidden="true"
                />
              )}
              label={copy.openNowFilter}
            />
          </div>
        ) : (
          <div className="min-w-0">
            <FilterDropdown
              label={copy.filtersTitle}
              value={filtersButtonValue}
              icon={<FilterIcon className="h-4 w-4" />}
              align="right"
              hideLabel
              keepOpenOnSelect
            >
              <div className="space-y-1">
                <p className="px-3 pb-1 pt-1 text-meta font-medium text-muted-foreground">
                  {copy.ownershipLabel}
                </p>
                <div className="space-y-0.5">
                  {([null, "public", "private"] as const).map((item) => (
                    <MenuOption
                      key={item ?? "all"}
                      selected={ownership === item}
                      description={
                        item === "public"
                          ? copy.ownershipPublicHint
                          : item === "private"
                            ? copy.ownershipPrivateHint
                            : undefined
                      }
                      onSelect={() => setOwnership(item)}
                    >
                      {item === "public"
                        ? copy.ownershipPublicOnly
                        : item === "private"
                          ? copy.ownershipPrivateOnly
                          : copy.ownershipAll}
                    </MenuOption>
                  ))}
                </div>

                <div className="mt-2 space-y-0.5 border-t border-border pt-2">
                  <MenuOption
                    selected={emergencyOnly}
                    icon={<AlertCircleIcon className="h-4 w-4 text-primary" aria-hidden="true" />}
                    onSelect={() => {
                      const next = !emergencyOnly;
                      setEmergencyOnly(next);
                      // Emergency departments are in hospitals and some clinics, never in a pharmacy or a
                      // dentist: widen the kind of place so turning this on never ends in an empty list.
                      if (next && category && category !== "hospital") setCategory(null);
                    }}
                  >
                    {copy.emergencyWalkInFilter}
                  </MenuOption>
                  <MenuOption
                    selected={openNowOnly}
                    icon={<ClockIcon className="h-4 w-4 text-sapphire dark:text-sapphire-border" aria-hidden="true" />}
                    onSelect={() => setOpenNowOnly((prev) => !prev)}
                  >
                    {copy.openNowFilter}
                  </MenuOption>
                </div>
              </div>
            </FilterDropdown>
          </div>
        )}
      </div>
    );
  };

  const noticesBlock = hasNotices ? (
    <div className="mt-3 space-y-2.5 border-t border-border/70 pt-3">
      {manualLocateTried && locationStatus === "denied" && !gpsActive && (
        <p className="text-body text-muted-foreground" role="status">
          {copy.locationDenied}
        </p>
      )}

      {showFarNotice && (
        <p className="text-body font-medium text-foreground">
          {copy.distantLocationNotice(copy.countries[activeCountry])}
        </p>
      )}

      {emergencyOnly && (
        <div
          role="note"
          className="rounded-(--radius-control) border border-sapphire/25 bg-sapphire-soft/60 p-3.5 text-body text-foreground"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex-1">{copy.emergencyRightsCallout}</p>
            {voice.available && (
              <ListenButton
                uiLang={lang}
                isPlaying={activeSpeech === "rights"}
                onToggle={toggleRightsSpeech}
                className="shrink-0 self-start sm:self-center"
              />
            )}
          </div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div>
      {/* Row 1: Unified page header with utility actions */}
      <PageHeader
        title={page.listTitle}
        lead={page.listSubtitle}
        actions={
          voice.available ? (
            <ListenButton
              uiLang={lang}
              autoRead
              isPlaying={activeSpeech === "intro"}
              onToggle={toggleIntroSpeech}
            />
          ) : undefined
        }
      />

      {/* Row 2: Phones fold filters into one summary row + 1-tap quick chips; lg+ renders the full elevated toolbar */}
      <section aria-label={copy.searchPlaceholder} className="mt-4">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-(--shadow-card-rest) dark:border-ink-800 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-body font-medium leading-snug text-foreground">
                {mobileFilterSummary}
              </p>
              {!isColdLoad && !error ? (
                <p className="mt-0.5 text-meta tabular-nums text-muted-foreground">
                  {loading || addressSearching ? copy.loading : copy.resultsCount(displayedInstitutes.length)}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="md"
              aria-haspopup="dialog"
              aria-expanded={filterSheetOpen}
              aria-label={`${copy.change}: ${mobileFilterSummary}`}
              onClick={() => setFilterSheetOpen(true)}
              className="shrink-0"
            >
              {copy.change}
            </Button>
          </div>

          <form
            onSubmit={submitSearch}
            role="search"
            className="mt-2.5 flex items-center gap-1.5 border-t border-border/70 pt-2.5 dark:border-ink-800"
          >
            <label htmlFor={mobileSearchInputId} className="sr-only">
              {copy.searchPlaceholder}
            </label>
            <div className="relative min-w-0 flex-1">
              <input
                id={mobileSearchInputId}
                type="search"
                name="q"
                enterKeyHint="search"
                autoCapitalize="words"
                value={searchInput}
                onChange={(event) => {
                  const next = event.target.value;
                  setSearchInput(next);
                  if (!next) setSearch("");
                }}
                placeholder={copy.searchPlaceholder}
                title={copy.searchPlaceholder}
                className={`field-focus peer min-h-11 w-full rounded-(--radius-control) border border-border-control bg-background py-2 pl-9 text-body text-foreground placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden ${
                  searchInput ? "pr-11" : "pr-3"
                }`}
              />
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground peer-focus-visible:text-sapphire dark:peer-focus-visible:text-sapphire-border"
                aria-hidden="true"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    resolvedAddressInputRef.current = null;
                    setSearchedPointLabel(null);
                    setSearchInput("");
                    setSearch("");
                  }}
                  aria-label={copy.clearFilters}
                  title={copy.clearFilters}
                  className="absolute right-0.5 top-1/2 inline-flex h-11 w-11 min-h-11 min-w-11 -translate-y-1/2 items-center justify-center whitespace-nowrap rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <XIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              )}
            </div>
            <Button
              type="button"
              variant="action"
              size="md"
              disabled={addressSearching}
              onClick={() => void resolveAndApplySearch(searchInput)}
              className="shrink-0"
            >
              {copy.searchButton}
            </Button>
          </form>

          {/* The list starts from a guess (the capital for this language): say so, and offer the one-tap way out. */}
          {showLocateButton ? (
            <div className="mt-2.5 border-t border-border/70 pt-2.5 dark:border-ink-800">
              {guessedCity ? (
                <p className="mb-2.5 text-body text-foreground">{copy.guessedPlaceHint(guessedCity)}</p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={locatingShown}
                onClick={() => locateUser(true)}
              >
                {locatingShown ? copy.locating : copy.useMyLocation}
              </Button>
            </div>
          ) : null}

          <div
            role="group"
            aria-label={copy.filtersTitle}
            className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border/70 pt-2.5 dark:border-ink-800"
          >
            <button
              type="button"
              aria-pressed={openNowOnly}
              onClick={() => setOpenNowOnly((prev) => !prev)}
              className={openNowOnly ? quickChipActiveClass : quickChipInactiveClass}
            >
              <ClockIcon
                className={openNowOnly ? "h-4 w-4 shrink-0 text-white" : "h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border"}
                aria-hidden="true"
              />
              <span>{copy.openNowFilter}</span>
            </button>
            {WAYFINDING_CATEGORIES.map((item) => {
              const selected = category === item;
              return (
                <button
                  key={item ?? "all"}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setCategory((prev) => (item === null ? null : prev === item ? null : item));
                  }}
                  className={selected ? quickChipActiveClass : quickChipInactiveClass}
                >
                  <CategoryIcon
                    category={item}
                    className={selected ? "h-4 w-4 shrink-0 text-white" : "h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border"}
                  />
                  <span>{item ? copy.categories[item] : copy.allCategories}</span>
                </button>
              );
            })}
            {filtered && (
              <button
                type="button"
                onClick={clearFilters}
                className={quickChipInactiveClass}
              >
                <XIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" aria-hidden="true" />
                <span>{copy.clearFilters}</span>
              </button>
            )}
          </div>

          {noticesBlock}
        </div>

        <div className="hidden rounded-2xl border border-border bg-card p-4 shadow-(--shadow-card-rest) dark:border-ink-800 lg:block">
          {renderFilterFields("desktop")}

          {/* Calm, compact status and active-filter strip */}
          <div
            ref={statusRowRef}
            className="mt-3 flex scroll-mt-[calc(var(--chrome-h,0px)+0.75rem)] flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border/70 pt-3"
          >
            <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-body text-muted-foreground">
              <span>
                {gpsActive
                  ? copy.locationActive
                  : guessReason === "region" && activeCityName
                    ? copy.suggestedByRegion(activeCityName, copy.countries[activeCountry])
                    : guessReason === "language" && activeCityName
                      ? copy.suggestedByLanguage(activeCityName, copy.countries[activeCountry])
                      : activeCityName
                        ? `${copy.nearCity(activeCityName)}, ${copy.countries[activeCountry]}`
                        : locationSummary}
              </span>
              {!isColdLoad && !error ? (
                <>
                  <span aria-hidden="true" className="h-4 w-px bg-border" />
                  <span role="status" className="tabular-nums text-muted-foreground">
                    {loading || addressSearching ? copy.loading : copy.resultsCount(displayedInstitutes.length)}
                  </span>
                </>
              ) : null}
            </p>

            {(area.kind === "point" || filtered) && (
              <div className="flex flex-wrap items-center gap-2">
                {area.kind === "point" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => chooseCountry(activeCountry)}
                  >
                    {copy.wholeCountryOption(copy.countries[activeCountry])}
                  </Button>
                )}

                {filtered && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={clearFilters}
                  >
                    <XIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" aria-hidden="true" />
                    <span>{copy.clearFilters}</span>
                  </Button>
                )}
              </div>
            )}
          </div>

          {noticesBlock}
        </div>

        {/* Announces where the results are from; the dropdown trigger shows the short version. */}
        <p className="sr-only" aria-live="polite">
          {locationSummary}
        </p>
      </section>

      {/* Row 3: Aligned two-column workspace — distance-sorted list leads cleanly on the left */}
      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(24rem,1.15fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(28rem,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* Facility list column (first in DOM, left on desktop) */}
        <div
          ref={listColumnRef}
          className={`min-w-0 scroll-mt-[calc(var(--chrome-h,0px)+0.75rem)] pb-24 lg:col-start-1 lg:row-start-1 lg:pb-0 ${
            mobileView === "map" ? "hidden lg:block" : "block"
          }`}
          aria-busy={loading}
        >
          {showSkeleton ? (
            <div role="status" aria-label={copy.loading}>
              <span className="sr-only">{copy.loading}</span>
              {/* Shaped like the result rows (kind, name, address, hours, call and directions), so the
                  list lands in place instead of replacing a different shape. */}
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-2xs dark:border-ink-800">
                {COLD_LOAD_SKELETON_WIDTHS.map((spec, idx) => (
                  <li
                    key={idx}
                    className="flex min-h-[144px] flex-col justify-between px-4 py-4 sm:px-5"
                    aria-hidden="true"
                  >
                    <div className="space-y-2.5">
                      <div className="skeleton-sheen h-3.5 w-24" style={rowSheen(idx)} />
                      <div className={`skeleton-sheen h-5 ${spec.title}`} style={rowSheen(idx)} />
                      <div className={`skeleton-sheen h-4 ${spec.address}`} style={rowSheen(idx)} />
                      <div className={`skeleton-sheen h-4 ${spec.meta}`} style={rowSheen(idx)} />
                    </div>
                    <div className="mt-3.5 flex gap-2">
                      <div className="skeleton-sheen h-11 w-36 !rounded-xl" style={rowSheen(idx)} />
                      <div className="skeleton-sheen h-11 w-11 !rounded-xl" style={rowSheen(idx)} />
                      <div className="skeleton-sheen h-11 w-11 !rounded-xl" style={rowSheen(idx)} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : error && displayedInstitutes.length === 0 ? (
            // The directory did not answer (a network drop, or the server's database is unreachable) and
            // there is no earlier or saved list to show. One clear next step, the failure stated plainly.
            <div
              className="swap-in rounded-2xl border border-border bg-card px-5 py-6 shadow-2xs sm:px-6 sm:py-7 dark:border-ink-800"
              role="alert"
            >
              <p className="max-w-(--measure-lead) text-body font-medium leading-snug text-foreground">{copy.loadError}</p>
              <Button
                type="button"
                variant="action"
                size="md"
                onClick={() => setReloadKey((value) => value + 1)}
                className="mt-4"
              >
                <RetryIcon className="h-4 w-4 shrink-0" />
                <span>{copy.retry}</span>
              </Button>
            </div>
          ) : displayedInstitutes.length === 0 ? (
            <div
              className="swap-in rounded-2xl border border-border bg-card px-5 py-6 shadow-2xs sm:px-6 sm:py-7 dark:border-ink-800"
              role="status"
            >
              <p className="max-w-(--measure-lead) text-body font-medium leading-snug text-foreground">
                {addressNotFoundFor !== null && addressNotFoundFor === search ? copy.addressNotFound : copy.noResults}
              </p>
              {filtered ? (
                <Button
                  type="button"
                  variant="action"
                  size="md"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  {copy.clearFilters}
                </Button>
              ) : area.kind === "point" ? (
                // Nothing near this point and nothing to clear: widen to the whole country.
                <Button
                  type="button"
                  variant="action"
                  size="md"
                  onClick={() => chooseCountry(activeCountry)}
                  className="mt-4"
                >
                  {copy.wholeCountryOption(copy.countries[activeCountry])}
                </Button>
              ) : null}
            </div>
          ) : (
            <div
              className={`transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
                isRevalidating ? "pointer-events-none opacity-60" : "opacity-100"
              }`}
            >
              {/* The refresh failed but there is still a list to read: the earlier one, or the one saved on the phone. */}
              {error ? (
                <div
                  role="alert"
                  className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 rounded-2xl border border-border bg-card px-4 py-3 shadow-2xs dark:border-ink-800"
                >
                  <p className="min-w-0 flex-[1_1_14rem] text-body font-medium leading-snug text-foreground">
                    {listNotice}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setReloadKey((value) => value + 1)}
                    className="shrink-0"
                  >
                    <RetryIcon className="h-4 w-4 shrink-0" />
                    <span>{copy.retry}</span>
                  </Button>
                </div>
              ) : null}
              <ul
                key={resultSetKey}
                className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-2xs dark:border-ink-800"
              >
                {displayedInstitutes.slice(0, visibleCount).map((institute, index) => {
                  const active = institute.id === selectedId;
                  const hovered = institute.id === hoveredId;
                  const hours = formatOpeningHours(institute.hours, copy);
                  const openNow = isInstituteOpenNow(institute.hours);
                  const hasSchedule = hasRecognizedHoursSchedule(institute.hours);
                  const location = [institute.address, institute.city].filter(Boolean).join(", ");
                  const phoneHref = primaryPhoneHref(institute.phone);
                  const displayPhone = institute.phone?.split(/[;,/]/)[0]?.trim() ?? institute.phone;
                  const hasPhone = Boolean(institute.phone && phoneHref && displayPhone);
                  const distanceLabel =
                    area.kind === "point"
                      ? formatHumanDistance(institute.distance_km, copy, numberLocale, {
                          allowOver80Km,
                          centerCity: distanceOriginCity,
                        })
                      : null;

                  return (
                    <li
                      key={institute.id}
                      // Rows of a fresh set (and of each "show more" page) arrive one after another.
                      className="list-in"
                      style={{ "--i": index % PAGE_SIZE } as CSSProperties}
                      ref={(node) => {
                        if (node) itemRefs.current.set(institute.id, node);
                        else itemRefs.current.delete(institute.id);
                      }}
                    >
                      <article
                        aria-current={active ? "true" : undefined}
                        onClick={() => showInstitute(institute.id)}
                        onMouseEnter={() => scheduleHoverChange(institute.id)}
                        onMouseLeave={() => scheduleHoverChange(null)}
                        // The selected place carries a soft sapphire fill plus aria-current; hover echoes it quietly.
                        className={`group cursor-pointer px-3 py-4 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none min-[360px]:px-4 sm:px-5 ${
                          active
                            ? "bg-sapphire-soft"
                            : hovered
                              ? "bg-sapphire-soft/45"
                              : "hover:bg-muted/50"
                        }`}
                      >
                        <h3 className="text-title font-semibold leading-snug text-foreground">
                          <button
                            type="button"
                            aria-pressed={active}
                            onFocus={() => scheduleHoverChange(institute.id)}
                            onBlur={() => scheduleHoverChange(null)}
                            onClick={(event) => {
                              event.stopPropagation();
                              showInstitute(institute.id);
                            }}
                            className="inline-flex min-h-11 items-center rounded-md py-1 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <span>{institute.name}</span>
                          </button>
                        </h3>

                        <p className="text-body font-medium text-foreground">
                          {placeKindLine(institute)}
                          {institute.emergency ? (
                            <>
                              {", "}
                              <span className="text-primary">{copy.emergency}</span>
                            </>
                          ) : null}
                        </p>

                        {location ? (
                          <p className="mt-0.5 text-body text-muted-foreground">{location}</p>
                        ) : null}

                        {distanceLabel ? (
                          <p className="mt-1 text-body font-medium tabular-nums text-sapphire dark:text-sapphire-border">
                            {distanceLabel}
                          </p>
                        ) : null}

                        {hours ? (
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border/60 pt-2.5 text-body dark:border-ink-800">
                            {openNow ? (
                              <>
                                <span className="text-body font-semibold text-foreground">
                                  {copy.openNowLive}
                                </span>
                                <span aria-hidden="true" className="inline-block h-3.5 w-px bg-sapphire/35 dark:bg-sapphire-border/45" />
                              </>
                            ) : hasSchedule ? (
                              <>
                                <span className="text-body font-medium text-muted-foreground">
                                  {copy.closedNowLive}
                                </span>
                                <span aria-hidden="true" className="inline-block h-3.5 w-px bg-border" />
                              </>
                            ) : null}
                            <span className="tabular-nums text-muted-foreground">{hours}</span>
                          </div>
                        ) : (
                          <p className="mt-2.5 border-t border-border/60 pt-2.5 text-body text-muted-foreground dark:border-ink-800">
                            {hasPhone ? `${copy.hoursUnknown} ${copy.callBeforeGoing}` : copy.hoursUnknown}
                          </p>
                        )}

                        <PlaceCardActions
                          institute={institute}
                          hasPhone={hasPhone}
                          phoneHref={phoneHref}
                          displayPhone={displayPhone}
                          shareText={[location, institute.phone, hours].filter(Boolean).join("\n")}
                          copy={copy}
                          lang={lang}
                          stopPropagation
                        />
                      </article>
                    </li>
                  );
                })}
              </ul>
              {displayedInstitutes.length > visibleCount || countryNextPage !== null ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  disabled={loadingMore}
                  onClick={() => {
                    if (displayedInstitutes.length > visibleCount) setVisibleCount((count) => count + PAGE_SIZE);
                    else void loadNextCountryPage();
                  }}
                  className="mt-3"
                >
                  <span className="min-w-0 truncate">
                    {loadingMore
                      ? copy.loading
                      : displayedInstitutes.length > visibleCount
                        ? copy.showMore(Math.min(PAGE_SIZE, displayedInstitutes.length - visibleCount))
                        : copy.showMorePlaces}
                  </span>
                </Button>
              ) : null}
              {loadMoreFailed ? (
                <p role="alert" className="mt-2 text-body font-medium text-foreground">
                  {copy.loadError}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* Map column: sticky on lg:, aligned with top of results list */}
        <div
          ref={mapColumnRef}
          className={`scroll-mt-[calc(var(--chrome-h,0px)+0.75rem)] pb-24 lg:sticky lg:top-[calc(var(--chrome-h,0px)+1rem)] lg:col-start-2 lg:row-start-1 lg:self-start lg:pb-0 ${
            mobileView === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card-rest) dark:border-ink-800">
            <div
              className={`w-full lg:h-[min(42rem,calc(100dvh-var(--chrome-h,0px)-7.5rem))] lg:min-h-[24rem] ${
                mobilePreviewInstitute
                  ? "h-[min(46svh,24rem)]"
                  : "h-[min(62svh,30rem)]"
              }`}
            >
              {mapWanted ? (
              <InstitutesMap
                institutes={displayedInstitutes}
                selectedId={selectedId}
                hoveredId={hoveredId}
                onSelect={selectInstitute}
                onHoverChange={scheduleHoverChange}
                userLocation={area.kind === "point" ? userLocation : null}
                frameAll={area.kind === "country"}
                categoryLabels={copy.categories}
                searchThisAreaLabel={copy.searchThisArea}
                youAreHereLabel={copy.youAreHere}
                clusterLabel={copy.resultsCount}
                onSearchArea={(center) => {
                  userPickedManuallyRef.current = true;
                  setGuessReason(null);
                  setFarFromServices(false);
                  setSearchedPointLabel(null);
                  resolvedAddressInputRef.current = null;
                  setArea({ kind: "point", ...center, source: "area" });
                }}
              />
              ) : (
                <MapLoading />
              )}
            </div>
          </div>

          {/* Anchored mobile facility preview sheet on pin tap (< lg) — zero scrollIntoView page-yanking */}
          {mobilePreviewInstitute && (
            <aside
              key={mobilePreviewInstitute.id}
              aria-label={mobilePreviewInstitute.name}
              className="swap-in mt-3 rounded-2xl border border-sapphire/35 bg-card p-4 shadow-(--shadow-card-hover) lg:hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-title font-semibold leading-snug text-foreground">
                    {mobilePreviewInstitute.name}
                  </h3>
                  <p className="mt-1 text-body font-medium text-foreground">
                    {placeKindLine(mobilePreviewInstitute)}
                    {mobilePreviewInstitute.emergency ? (
                      <>
                        {", "}
                        <span className="text-primary">{copy.emergency}</span>
                      </>
                    ) : null}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={copy.closePreview}
                  onClick={() => setMobilePreviewId(null)}
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <XIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {(() => {
                const previewLoc = [mobilePreviewInstitute.address, mobilePreviewInstitute.city]
                  .filter(Boolean)
                  .join(", ");
                const previewHours = formatOpeningHours(mobilePreviewInstitute.hours, copy);
                const previewOpenNow = isInstituteOpenNow(mobilePreviewInstitute.hours);
                const previewHasSchedule = hasRecognizedHoursSchedule(mobilePreviewInstitute.hours);
                const previewPhoneHref = primaryPhoneHref(mobilePreviewInstitute.phone);
                const previewDisplayPhone =
                  mobilePreviewInstitute.phone?.split(/[;,/]/)[0]?.trim() ?? mobilePreviewInstitute.phone;
                const hasPreviewPhone = Boolean(
                  mobilePreviewInstitute.phone && previewPhoneHref && previewDisplayPhone,
                );
                const previewDistance =
                  area.kind === "point"
                    ? formatHumanDistance(mobilePreviewInstitute.distance_km, copy, numberLocale, {
                        allowOver80Km,
                        centerCity: distanceOriginCity,
                      })
                    : null;

                return (
                  <>
                    {previewLoc && <p className="mt-1 text-body text-muted-foreground">{previewLoc}</p>}
                    {previewDistance && (
                      <p className="mt-1 text-body font-medium tabular-nums text-sapphire dark:text-sapphire-border">
                        {previewDistance}
                      </p>
                    )}
                    {previewHours ? (
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border/60 pt-2.5 text-body dark:border-ink-800">
                        {previewOpenNow ? (
                          <>
                            <span className="text-body font-semibold text-foreground">
                              {copy.openNowLive}
                            </span>
                            <span aria-hidden="true" className="inline-block h-3.5 w-px bg-sapphire/35 dark:bg-sapphire-border/45" />
                          </>
                        ) : previewHasSchedule ? (
                          <>
                            <span className="text-body font-medium text-muted-foreground">
                              {copy.closedNowLive}
                            </span>
                            <span aria-hidden="true" className="inline-block h-3.5 w-px bg-border" />
                          </>
                        ) : null}
                        <span className="tabular-nums text-muted-foreground">{previewHours}</span>
                      </div>
                    ) : (
                      <p className="mt-2.5 border-t border-border/60 pt-2.5 text-body text-muted-foreground dark:border-ink-800">
                        {hasPreviewPhone ? `${copy.hoursUnknown} ${copy.callBeforeGoing}` : copy.hoursUnknown}
                      </p>
                    )}
                    <PlaceCardActions
                      institute={mobilePreviewInstitute}
                      hasPhone={hasPreviewPhone}
                      phoneHref={previewPhoneHref}
                      displayPhone={previewDisplayPhone}
                      shareText={[previewLoc, mobilePreviewInstitute.phone, previewHours].filter(Boolean).join("\n")}
                      copy={copy}
                      lang={lang}
                    />
                  </>
                );
              })()}
            </aside>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <ul aria-label={copy.mapLegendLabel} className="flex flex-wrap items-center gap-x-5 gap-y-1 text-body text-muted-foreground">
              <li className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 flex-none rounded-xs bg-sapphire" aria-hidden="true" />
                {copy.legendPlace}
              </li>
              <li className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 flex-none rounded-xs bg-primary" aria-hidden="true" />
                {copy.legendEmergency}
              </li>
              <li className="inline-flex items-center gap-2">
                <span
                  className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-sm bg-sapphire text-meta font-medium text-white tabular-nums"
                  aria-hidden="true"
                >
                  3
                </span>
                {copy.legendCluster}
              </li>
              {userLocation && (
                <li className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 flex-none rounded-xs border-2 border-sapphire bg-white" aria-hidden="true" />
                  {copy.youAreHere}
                </li>
              )}
            </ul>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-md text-body text-muted-foreground underline decoration-border underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {page.mapAttribution}
            </a>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => switchMobileView("list", selectedId)}
            className="mt-4 lg:hidden"
          >
            <ListViewIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" aria-hidden="true" />
            <span>{copy.viewList}</span>
          </Button>
        </div>
      </div>

      {/* Phones: one thumb-reach switch between the list and the map, always on screen. */}
      <nav
        aria-label={copy.viewModeLabel}
        data-bottom-bar
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm sm:px-4 lg:hidden print:hidden"
      >
        <div className="relative mx-auto grid max-w-md grid-cols-2 gap-1 rounded-xl border border-border-control bg-surface-subtle p-1">
          {/* One sapphire plate that slides to the chosen view, instead of two backgrounds swapping. */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.375rem)] rounded-lg bg-sapphire shadow-2xs transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${
              mobileView === "map" ? "translate-x-[calc(100%+0.25rem)]" : "translate-x-0"
            }`}
          />
          {(
            [
              { id: "list", label: copy.viewList, Icon: ListViewIcon },
              { id: "map", label: copy.viewMap, Icon: MapViewIcon },
            ] as const
          ).map(({ id, label, Icon }) => {
            const active = mobileView === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => switchMobileView(id, id === "list" ? selectedId : null)}
                className={`relative inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-body font-semibold transition-[color,background-color,filter] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle max-[359px]:gap-1 max-[359px]:px-1.5 sm:gap-2 sm:px-4 ${
                  active ? "text-white press-solid" : "text-foreground hover:bg-card/70 press-row"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span>{label}</span>
                {id === "list" && !loading && displayedInstitutes.length > 0 ? (
                  <span className={`tabular-nums ${active ? "text-white/80" : "text-muted-foreground"}`}>
                    {displayedInstitutes.length}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      {filterSheetOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={filterSheetTitleId}
            className="fixed inset-x-0 top-(--sheet-vv-top,0px) z-[80] flex h-(--sheet-vv-height,100dvh) items-end justify-center lg:hidden"
          >
            <div
              className="fixed inset-0 -z-10 bg-ink-950/55"
              onClick={closeFilterSheet}
              aria-hidden="true"
            />

            <div
              ref={filterSheetPanelRef}
              tabIndex={-1}
              className="sheet-in relative flex max-h-[min(88dvh,calc(var(--sheet-vv-height,100dvh)-0.75rem))] w-full flex-col overflow-hidden rounded-t-2xl border-t border-border bg-card text-foreground shadow-[0_24px_48px_-12px_rgb(15_23_42/0.25)] focus:outline-none dark:border-ink-800"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3 dark:border-ink-800">
                <h2 id={filterSheetTitleId} className="text-section text-foreground">
                  {copy.filtersTitle}
                </h2>
                <button
                  type="button"
                  aria-label={copy.closePreview}
                  onClick={closeFilterSheet}
                  className="inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-border-control bg-card text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <XIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {renderFilterFields("sheet")}

                {(area.kind === "point" || filtered) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
                    {area.kind === "point" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={() => chooseCountry(activeCountry)}
                      >
                        {copy.wholeCountryOption(copy.countries[activeCountry])}
                      </Button>
                    )}

                    {filtered && (
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={clearFilters}
                      >
                        <XIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" aria-hidden="true" />
                        <span>{copy.clearFilters}</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-border/80 bg-card px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:border-ink-800">
                <Button
                  type="button"
                  variant="action"
                  size="lg"
                  fullWidth
                  onClick={closeFilterSheet}
                >
                  {loading ? copy.loading : copy.showPlaces(displayedInstitutes.length)}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
