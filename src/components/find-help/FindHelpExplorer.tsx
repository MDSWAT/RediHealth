"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useLargeText, useReadAloud } from "@/components/health-check/readingTools";
import { AlertCircleIcon, ClockIcon, GlobeIcon, PhoneIcon, PinIcon, SearchIcon, XIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  REGIONAL_CITY_PRESETS,
  type CityPreset,
  findHelpTranslations,
  formatHumanDistance,
  formatOpeningHours,
  hasRecognizedHoursSchedule,
  isInstituteOpenNow,
} from "@/lib/i18n/find-help-translations";
import {
  SUPPORTED_COUNTRIES,
  directionsUrl,
  primaryPhoneHref,
  type CountryCode,
  type InstituteCategory,
  type MedicalInstitute,
} from "@/lib/medical-institutes";

function MapLoading() {
  const { lang, t } = useLanguage();
  const label = t?.findHelpPage?.loadingMap ?? findHelpTranslations[lang].page.loadingMap;
  return (
    <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
      {label}
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

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isDesktopViewport() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
}

type SearchArea =
  | { kind: "country"; country: CountryCode }
  | { kind: "point"; lat: number; lng: number; source: "gps" | "area" | "city"; cityName?: string };

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

function SpeakerIcon({ playing, className = "h-4 w-4" }: { playing: boolean; className?: string }) {
  if (playing) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
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

function ChevronDownIcon({ expanded, className = "h-4 w-4" }: { expanded: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} motion-safe:transition-transform motion-safe:duration-[var(--dur-fast)] ${expanded ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const primaryTactileActionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-sapphire/35 bg-card px-3.5 py-2 text-sm font-semibold text-sapphire shadow-2xs " +
  "transition-[color,background-color,border-color,transform,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] " +
  "hover:border-sapphire hover:bg-sapphire hover:text-white hover:shadow-xs motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

const secondaryTactileActionClass =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-2xs " +
  "transition-[color,background-color,border-color,transform,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] " +
  "hover:border-sapphire/40 hover:bg-sapphire-soft/50 hover:text-sapphire motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/**
 * A pick-one filter folded into one line: the trigger names the current choice, the panel lists the
 * rest. The panel spans the whole filter row (its nearest positioned parent), closes on Escape, on a
 * tap outside, when focus leaves it, and after a choice (focus then returns to the trigger).
 */
function FilterDropdown({
  label,
  value,
  icon,
  children,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    const selected =
      rootRef.current?.querySelector<HTMLElement>(`[id="${panelId}"] [aria-pressed="true"]`) ??
      rootRef.current?.querySelector<HTMLElement>(`[id="${panelId}"] button`);
    selected?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, panelId]);

  return (
    <div
      ref={rootRef}
      className="min-w-0"
      onBlur={(event) => {
        if (open && !rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${label}: ${value}`}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex min-h-12 w-full items-center gap-2.5 rounded-lg border bg-card px-3.5 text-left transition-[border-color,background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire hover:bg-sapphire-soft/30 motion-safe:active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          open ? "border-sapphire" : "border-border-control"
        }`}
      >
        <span className="shrink-0 text-sapphire">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted-foreground">{label}</span>
          <span className="block truncate text-sm font-semibold text-foreground">{value}</span>
        </span>
        <ChevronDownIcon expanded={open} className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div
          id={panelId}
          className="fhs-enter absolute inset-x-0 top-full z-30 mt-2 max-h-[min(70dvh,30rem)] overflow-y-auto overscroll-contain rounded-xl border border-border bg-card p-2 shadow-lg"
          onClick={(event) => {
            // Any choice closes the panel and hands focus back to the trigger.
            if (!(event.target as HTMLElement).closest("button")) return;
            setOpen(false);
            triggerRef.current?.focus();
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** One row in a dropdown panel. The current choice is tinted and carries a check, not colour alone. */
function MenuOption({
  selected,
  onSelect,
  icon,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected ? "bg-sapphire-soft font-semibold text-foreground" : "font-medium text-foreground hover:bg-muted"
      }`}
    >
      {icon ? <span className="shrink-0 text-sapphire">{icon}</span> : null}
      <span className="min-w-0 flex-1">{children}</span>
      {selected ? <CheckIcon className="h-4 w-4 shrink-0 text-sapphire" /> : null}
    </button>
  );
}

function MenuGroup({ label, children }: { label: string; children: ReactNode }) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className="border-t border-border pt-2 first:border-t-0 first:pt-0">
      <p id={labelId} className="px-3 pb-1 pt-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-0.5">{children}</div>
    </div>
  );
}

/** On/off filters look and announce as switches, so the off state still reads as a control. */
function FilterSwitch({
  checked,
  onToggle,
  icon,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={`flex min-h-12 flex-auto items-center justify-between gap-3 rounded-lg border bg-card px-4 py-2 text-left text-sm font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        checked ? "border-sapphire bg-sapphire-soft/35" : "border-border-control hover:border-sapphire"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {icon}
        <span className="min-w-0 whitespace-nowrap max-sm:whitespace-normal max-sm:text-pretty">{label}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-5 w-9 shrink-0 rounded-md transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
          checked ? "bg-sapphire" : "bg-border-control"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-xs bg-white shadow-2xs motion-safe:transition-transform motion-safe:duration-[var(--dur-fast)] motion-safe:ease-[var(--ease-out-calm)] ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
    </button>
  );
}

export function FindHelpExplorer({
  initialCountry,
  initialCategory = null,
}: {
  initialCountry: CountryCode;
  initialCategory?: InstituteCategory | null;
}) {
  const { t, lang } = useLanguage();
  const copy = findHelpTranslations[lang];
  const page = t?.findHelpPage ?? copy.page;

  const [largeText, toggleLargeText] = useLargeText();
  const voice = useReadAloud(lang);
  const [speechTarget, setSpeechTarget] = useState<"intro" | "rights" | null>(null);
  const activeSpeech = voice.speaking ? speechTarget : null;

  const [area, setArea] = useState<SearchArea>({ kind: "country", country: initialCountry });
  const [activeCountry, setActiveCountry] = useState<CountryCode>(initialCountry);
  /** GPS worked but the nearest place is over 80 km away: we show the country and say why. */
  const [farFromServices, setFarFromServices] = useState(false);
  const [category, setCategory] = useState<InstituteCategory | null>(initialCategory);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [institutes, setInstitutes] = useState<MedicalInstitute[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [settled, setSettled] = useState<{ key: string; failed: boolean } | null>(null);
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

  const locateUser = useCallback((isManual = false) => {
    if (isManual) setManualLocateTried(true);
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
        setArea({ kind: "point", ...point, source: "gps" });
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 10 * 60_000 },
    );
  }, []);

  useEffect(() => {
    if (geolocationRequested.current) return;
    geolocationRequested.current = true;
    locateUser(false);
  }, [locateUser]);

  const requestQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (area.kind === "country") {
      params.set("country", area.country);
    } else {
      params.set("lat", area.lat.toFixed(5));
      params.set("lng", area.lng.toFixed(5));
    }
    if (category) params.set("category", category);
    if (search) params.set("q", search);
    return params.toString();
  }, [area, category, search]);
  const requestKey = `${requestQuery}#${reloadKey}`;
  const loading = settled?.key !== requestKey;
  const isColdLoad = loading && settled === null;
  const isRevalidating = loading && settled !== null;
  const error = !loading && Boolean(settled?.failed);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
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
      } while (data.hasMore && data.institutes.length > 0);
      return { ...data, institutes };
    };
    load()
      .then((data) => {
        if (controller.signal.aborted) return;
        setInstitutes(data.institutes);
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
        setSettled({ key: requestKey, failed: false });
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        console.error("Failed to load medical institutes", fetchError);
        setInstitutes([]);
        setSettled({ key: requestKey, failed: true });
      });

    return () => controller.abort();
  }, [requestQuery, requestKey]);

  const nearestDistanceKm = useMemo(() => {
    let min: number | null = null;
    for (const item of institutes) {
      if (item.distance_km != null && Number.isFinite(item.distance_km)) {
        if (min === null || item.distance_km < min) {
          min = item.distance_km;
        }
      }
    }
    return min;
  }, [institutes]);

  const gpsActive = area.kind === "point" && area.source === "gps";
  const isDistantGps = gpsActive && !loading && nearestDistanceKm !== null && nearestDistanceKm > 80;
  // What is selected must be what the map shows: when GPS lands far from any service (for example
  // just over a border), switch to that country's places instead of a map of somewhere else.
  if (isDistantGps) {
    setFarFromServices(true);
    setArea({ kind: "country", country: activeCountry });
  }
  const showFarNotice = farFromServices && area.kind === "country";

  const displayedInstitutes = useMemo(() => {
    return institutes.filter((item) => {
      if (emergencyOnly && !item.emergency) return false;
      if (openNowOnly && !isInstituteOpenNow(item.hours)) return false;
      return true;
    });
  }, [institutes, emergencyOnly, openNowOnly]);

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
    [displayedInstitutes, visibleCount],
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
    window.requestAnimationFrame(() => {
      const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
      if (next === "map") {
        mapColumnRef.current?.scrollIntoView({ block: "start", behavior });
        return;
      }
      const row = focusId ? itemRefs.current.get(focusId) : null;
      if (row) row.scrollIntoView({ block: "center", behavior });
      else listColumnRef.current?.scrollIntoView({ block: "start", behavior });
    });
  }

  /** Tapping a place in the list: on a phone, open the map on that place with its card under it. */
  function showInstitute(id: string) {
    setSelectedId(id);
    if (!isDesktopViewport()) {
      setMobilePreviewId(id);
      switchMobileView("map");
    }
  }

  function chooseCountry(country: CountryCode) {
    setFarFromServices(false);
    setActiveCountry(country);
    setArea({ kind: "country", country });
  }

  function chooseCity(city: CityPreset) {
    setFarFromServices(false);
    setArea({ kind: "point", lat: city.lat, lng: city.lng, source: "city", cityName: city.name });
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function clearFilters() {
    setCategory(null);
    setEmergencyOnly(false);
    setOpenNowOnly(false);
    setSearch("");
    setSearchInput("");
  }

  const cityPresets = REGIONAL_CITY_PRESETS[activeCountry] ?? [];
  const activeCityName = area.kind === "point" && area.source === "city" ? area.cityName ?? null : null;

  /** What the "Where" dropdown shows: short, so it fits half a phone screen. */
  const locationValue =
    locationStatus === "locating"
      ? copy.locating
      : gpsActive
        ? copy.myLocation
        : activeCityName
          ? activeCityName
          : area.kind === "country"
            ? copy.countries[area.country]
            : copy.mapArea;

  const locationSummary =
    locationStatus === "locating"
      ? copy.locating
      : gpsActive
        ? copy.locationActive
        : activeCityName
          ? copy.nearCity(activeCityName)
          : area.kind === "country"
            ? copy.showingCountry(copy.countries[area.country])
            : copy.placesInArea;

  const spokenStatusLine =
    locationStatus === "locating"
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

  const filtered = Boolean(category || search || emergencyOnly || openNowOnly);
  const mobilePreviewInstitute = useMemo(
    () => (mobilePreviewId ? displayedInstitutes.find((item) => item.id === mobilePreviewId) ?? null : null),
    [displayedInstitutes, mobilePreviewId],
  );

  const numberLocale = lang === "rom" ? "ro" : lang;
  const allowOver80Km = area.kind === "point" && area.source === "city";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-0">
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        {/* Header: low-literacy audio and larger-text tools sit above, so the heading keeps the full width. */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {voice.available && (
              <button
                type="button"
                aria-pressed={activeSpeech === "intro"}
                onClick={toggleIntroSpeech}
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  activeSpeech === "intro"
                    ? "border-sapphire bg-sapphire text-white"
                    : "border-sapphire/30 bg-sapphire-soft/65 text-sapphire hover:border-sapphire hover:bg-sapphire-soft"
                }`}
              >
                <SpeakerIcon playing={activeSpeech === "intro"} className="h-4 w-4 shrink-0" />
                <span>{activeSpeech === "intro" ? copy.stopListening : copy.listen}</span>
              </button>
            )}

            <button
              type="button"
              aria-pressed={largeText}
              onClick={toggleLargeText}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                largeText
                  ? "border-sapphire bg-sapphire text-white"
                  : "border-border-control bg-card text-foreground hover:border-sapphire hover:bg-sapphire-soft/40"
              }`}
            >
              <span aria-hidden="true" className="font-semibold tracking-tight">
                A+
              </span>
              <span>{copy.largeText}</span>
            </button>
          </div>

          <div>
            <h1 className="max-w-[24ch] text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {page.listTitle}
            </h1>
            <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{page.listSubtitle}</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {/* Where and what: two dropdowns on one row; each panel opens under the whole row. */}
          <div className="relative grid grid-cols-2 gap-2">
            <FilterDropdown
              label={copy.locationLabel}
              value={locationValue}
              icon={<PinIcon className="h-5 w-5" aria-hidden="true" />}
            >
              <div className="space-y-2">
                <MenuOption
                  selected={gpsActive}
                  icon={<PinIcon className="h-4.5 w-4.5" aria-hidden="true" />}
                  onSelect={() => locateUser(true)}
                >
                  {copy.useMyLocation}
                </MenuOption>
                {cityPresets.length > 0 && (
                  <MenuGroup label={copy.cityQuickJumpLabel}>
                    {cityPresets.map((city) => (
                      <MenuOption
                        key={city.name}
                        selected={activeCityName === city.name}
                        onSelect={() => {
                          chooseCity(city);
                        }}
                      >
                        {city.name}
                      </MenuOption>
                    ))}
                  </MenuGroup>
                )}
                <MenuGroup label={copy.countryLabel}>
                  {SUPPORTED_COUNTRIES.map((country) => (
                    <MenuOption
                      key={country}
                      selected={area.kind === "country" && area.country === country}
                      onSelect={() => {
                        chooseCountry(country);
                      }}
                    >
                      {copy.countries[country]}
                    </MenuOption>
                  ))}
                </MenuGroup>
              </div>
            </FilterDropdown>

            <FilterDropdown
              label={copy.categoryLabel}
              value={category ? copy.categories[category] : copy.allCategories}
              icon={<CategoryIcon category={category} className="h-5 w-5" />}
            >
              <div className="grid gap-0.5 sm:grid-cols-2">
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

          {/* Announces where the results are from; the dropdown trigger shows the short version. */}
          <p className="sr-only" aria-live="polite">
            {locationSummary}
          </p>

          {manualLocateTried && locationStatus === "denied" && area.kind === "country" && (
            <p className="text-sm text-muted-foreground" role="status">
              {copy.locationDenied}
            </p>
          )}

          {showFarNotice && (
            <p className="flex items-start gap-2.5 border-l-2 border-amber-care py-0.5 pl-3 text-sm leading-relaxed text-foreground">
              <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-care" aria-hidden="true" />
              <span>{copy.distantLocationNotice(copy.countries[activeCountry])}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <FilterSwitch
              checked={emergencyOnly}
              onToggle={() => {
                const next = !emergencyOnly;
                setEmergencyOnly(next);
                // Emergency departments are in hospitals and some clinics, never in a pharmacy or a
                // dentist: widen the kind of place so turning this on never ends in an empty list.
                if (next && category && category !== "hospital") setCategory(null);
              }}
              icon={<AlertCircleIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />}
              label={copy.emergencyWalkInFilter}
            />
            <FilterSwitch
              checked={openNowOnly}
              onToggle={() => setOpenNowOnly((prev) => !prev)}
              icon={<ClockIcon className="h-4 w-4 shrink-0 text-sapphire" aria-hidden="true" />}
              label={copy.openNowFilter}
            />
          </div>

          {emergencyOnly && (
            <div
              role="note"
              className="rounded-xl border border-sapphire/25 bg-sapphire-soft/60 p-3.5 text-sm leading-relaxed text-foreground"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="flex-1">{copy.emergencyRightsCallout}</p>
                {voice.available && (
                  <button
                    type="button"
                    aria-pressed={activeSpeech === "rights"}
                    onClick={toggleRightsSpeech}
                    className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      activeSpeech === "rights"
                        ? "border-sapphire bg-sapphire text-white"
                        : "border-sapphire/35 bg-card text-sapphire hover:border-sapphire hover:bg-sapphire hover:text-white"
                    }`}
                  >
                    <SpeakerIcon playing={activeSpeech === "rights"} className="h-4 w-4 shrink-0" />
                    <span>{activeSpeech === "rights" ? copy.stopListening : copy.listen}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={submitSearch} className="flex gap-2" role="search">
            <label className="relative flex-1">
              <span className="sr-only">{copy.searchPlaceholder}</span>
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                name="q"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  if (!event.target.value) setSearch("");
                }}
                placeholder={copy.searchHint}
                className="min-h-11 w-full rounded-lg border border-border-control bg-card pl-9 pr-3 text-base outline-none transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus:border-sapphire focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
              />
            </label>
            <button
              type="submit"
              className="min-h-11 rounded-lg bg-sapphire px-4 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-obsidian-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {copy.searchButton}
            </button>
          </form>
        </div>
      </div>

      {/* Map column: sticky on lg:, controlled by mobileView on < lg */}
      <div
        ref={mapColumnRef}
        className={`scroll-mt-[calc(var(--chrome-h,0px)+0.75rem)] lg:sticky lg:top-[calc(var(--chrome-h,0px)+1rem)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start ${
          mobileView === "list" ? "hidden lg:block" : "block"
        }`}
      >
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div
            className={`w-full lg:h-[min(44rem,calc(100dvh-15.5rem))] lg:min-h-[24rem] ${
              mobilePreviewInstitute
                ? "h-[min(46dvh,24rem)]"
                : "h-[max(20rem,calc(100dvh-var(--chrome-h,0px)-7.5rem))]"
            }`}
          >
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
                setFarFromServices(false);
                setArea({ kind: "point", ...center, source: "area" });
              }}
            />
          </div>
        </div>

        {/* Anchored mobile facility preview sheet on pin tap (< lg) — zero scrollIntoView page-yanking */}
        {mobilePreviewInstitute && (
          <aside
            aria-label={mobilePreviewInstitute.name}
            className="mt-3 rounded-xl border border-sapphire/35 bg-card p-4 shadow-sm lg:hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
                    <CategoryIcon category={mobilePreviewInstitute.category} className="h-3.5 w-3.5 shrink-0 text-sapphire" />
                    <span>{copy.categories[mobilePreviewInstitute.category]}</span>
                  </span>
                  {mobilePreviewInstitute.emergency && (
                    <>
                      <span aria-hidden="true" className="text-muted-foreground/60">·</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{copy.emergency}</span>
                      </span>
                    </>
                  )}
                </div>
                <h3 className="mt-1.5 text-base font-semibold leading-snug text-foreground">
                  {mobilePreviewInstitute.name}
                </h3>
              </div>
              <button
                type="button"
                aria-label={copy.closePreview}
                onClick={() => setMobilePreviewId(null)}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              const previewDistance =
                area.kind === "point"
                  ? formatHumanDistance(mobilePreviewInstitute.distance_km, copy, numberLocale, { allowOver80Km })
                  : null;

              return (
                <>
                  {previewLoc && <p className="mt-1 text-sm text-muted-foreground">{previewLoc}</p>}
                  {previewDistance && (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium tabular-nums text-sapphire">
                      <PinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{previewDistance}</span>
                    </p>
                  )}
                  {previewHours && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      {previewOpenNow ? (
                        <>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                            <ClockIcon className="h-3.5 w-3.5 shrink-0 text-live-sage" aria-hidden="true" />
                            <span>{copy.openNowLive}</span>
                          </span>
                          <span aria-hidden="true" className="text-muted-foreground/60">·</span>
                        </>
                      ) : previewHasSchedule ? (
                        <>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <ClockIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>{copy.closedNowLive}</span>
                          </span>
                          <span aria-hidden="true" className="text-muted-foreground/60">·</span>
                        </>
                      ) : null}
                      <span className="text-muted-foreground">{previewHours}</span>
                    </div>
                  )}
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {mobilePreviewInstitute.phone && previewPhoneHref && (
                      <a href={previewPhoneHref} className={primaryTactileActionClass}>
                        <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{copy.callAction}</span>
                        <span className="font-normal tabular-nums opacity-85">· {mobilePreviewInstitute.phone}</span>
                      </a>
                    )}
                    <a
                      href={directionsUrl(mobilePreviewInstitute)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={primaryTactileActionClass}
                    >
                      <PinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{copy.directions}</span>
                    </a>
                    {mobilePreviewInstitute.website && (
                      <a
                        href={mobilePreviewInstitute.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={secondaryTactileActionClass}
                      >
                        <GlobeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{copy.website}</span>
                      </a>
                    )}
                  </div>
                </>
              );
            })()}
          </aside>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <ul aria-label={copy.mapLegendLabel} className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
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
                className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-sm bg-sapphire text-[10px] font-semibold text-white tabular-nums"
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
            className="inline-flex min-h-11 items-center rounded-md text-xs text-muted-foreground underline decoration-border underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {page.mapAttribution}
          </a>
        </div>
      </div>

      {/* Facility list column */}
      <div
        ref={listColumnRef}
        className={`min-w-0 scroll-mt-[calc(var(--chrome-h,0px)+0.75rem)] pb-24 lg:col-start-1 lg:row-start-2 lg:pb-0 ${
          mobileView === "map" ? "hidden lg:block" : "block"
        }`}
        aria-busy={loading}
      >
        {isColdLoad ? (
          <div className="mt-2 lg:mt-6" role="status" aria-label={copy.loading}>
            <span className="sr-only">{copy.loading}</span>
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {COLD_LOAD_SKELETON_WIDTHS.map((spec, idx) => (
                <li
                  key={idx}
                  className="flex min-h-[144px] flex-col justify-between px-4 py-4 sm:px-5"
                  aria-hidden="true"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-20 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
                      <div className={`h-5 ${spec.title} animate-pulse rounded-md bg-muted motion-reduce:animate-none`} />
                    </div>
                    <div className={`h-4 ${spec.address} animate-pulse rounded-md bg-muted/80 motion-reduce:animate-none`} />
                    <div className={`h-4 ${spec.meta} animate-pulse rounded-md bg-muted/70 motion-reduce:animate-none`} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="h-11 w-32 animate-pulse rounded-lg bg-muted/75 motion-reduce:animate-none" />
                    <div className="h-11 w-28 animate-pulse rounded-lg bg-muted/75 motion-reduce:animate-none" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : error ? (
          <div className="mt-2 border-t border-border pt-5 text-sm text-foreground lg:mt-6" role="alert">
            <p>{copy.loadError}</p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-2 inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-3.5 font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft/50 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copy.retry}
            </button>
          </div>
        ) : displayedInstitutes.length === 0 && !isRevalidating ? (
          <div className="mt-2 border-t border-border pt-5 lg:mt-6" role="status">
            <p className="text-sm text-muted-foreground">{copy.noResults}</p>
            {filtered ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-3.5 text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft/50 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copy.clearFilters}
              </button>
            ) : null}
          </div>
        ) : (
          <div
            className={`transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
              isRevalidating ? "pointer-events-none opacity-60" : "opacity-100"
            }`}
          >
            <p className="mt-2 text-sm font-medium text-muted-foreground lg:mt-6" role="status">
              {isRevalidating ? copy.loading : copy.resultsCount(displayedInstitutes.length)}
            </p>
            <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {displayedInstitutes.slice(0, visibleCount).map((institute) => {
                const active = institute.id === selectedId;
                const hovered = institute.id === hoveredId;
                const hours = formatOpeningHours(institute.hours, copy);
                const openNow = isInstituteOpenNow(institute.hours);
                const hasSchedule = hasRecognizedHoursSchedule(institute.hours);
                const location = [institute.address, institute.city].filter(Boolean).join(", ");
                const phoneHref = primaryPhoneHref(institute.phone);
                const distanceLabel =
                  area.kind === "point"
                    ? formatHumanDistance(institute.distance_km, copy, numberLocale, { allowOver80Km })
                    : null;

                return (
                  <li
                    key={institute.id}
                    ref={(node) => {
                      if (node) itemRefs.current.set(institute.id, node);
                      else itemRefs.current.delete(institute.id);
                    }}
                  >
                    <article
                      onClick={() => showInstitute(institute.id)}
                      onMouseEnter={() => scheduleHoverChange(institute.id)}
                      onMouseLeave={() => scheduleHoverChange(null)}
                      className={`cursor-pointer px-4 py-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] sm:px-5 ${
                        active
                          ? "bg-sapphire-soft"
                          : hovered
                            ? "bg-sapphire-soft/45"
                            : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
                          <CategoryIcon category={institute.category} className="h-3.5 w-3.5 shrink-0 text-sapphire" />
                          <span>{copy.categories[institute.category]}</span>
                        </span>
                        {institute.emergency ? (
                          <>
                            <span aria-hidden="true" className="text-muted-foreground/60">·</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-primary">
                              <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span>{copy.emergency}</span>
                            </span>
                          </>
                        ) : null}
                      </div>

                      <h3 className="mt-1 text-base font-semibold leading-snug text-foreground sm:text-lg">
                        <button
                          type="button"
                          aria-pressed={active}
                          onFocus={() => scheduleHoverChange(institute.id)}
                          onBlur={() => scheduleHoverChange(null)}
                          onClick={(event) => {
                            event.stopPropagation();
                            showInstitute(institute.id);
                          }}
                          className="inline-flex min-h-11 items-center rounded-md py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {institute.name}
                        </button>
                      </h3>

                      {location ? (
                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{location}</p>
                      ) : null}

                      {distanceLabel ? (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium tabular-nums text-sapphire">
                          <PinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{distanceLabel}</span>
                        </p>
                      ) : null}

                      {hours ? (
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                          {openNow ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                                <ClockIcon className="h-3.5 w-3.5 shrink-0 text-live-sage" aria-hidden="true" />
                                <span>{copy.openNowLive}</span>
                              </span>
                              <span aria-hidden="true" className="text-muted-foreground/60">·</span>
                            </>
                          ) : hasSchedule ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                <ClockIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                <span>{copy.closedNowLive}</span>
                              </span>
                              <span aria-hidden="true" className="text-muted-foreground/60">·</span>
                            </>
                          ) : null}
                          <span className="text-muted-foreground">{hours}</span>
                        </div>
                      ) : null}

                      <div className="mt-3.5 flex flex-wrap gap-2">
                        {institute.phone && phoneHref ? (
                          <a
                            href={phoneHref}
                            className={primaryTactileActionClass}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>{copy.callAction}</span>
                            <span className="font-normal tabular-nums opacity-85">· {institute.phone}</span>
                          </a>
                        ) : null}
                        <a
                          href={directionsUrl(institute)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={primaryTactileActionClass}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <PinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>{copy.directions}</span>
                        </a>
                        {institute.website ? (
                          <a
                            href={institute.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={secondaryTactileActionClass}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <GlobeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>{copy.website}</span>
                          </a>
                        ) : null}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
            {displayedInstitutes.length > visibleCount ? (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copy.showMore(Math.min(PAGE_SIZE, displayedInstitutes.length - visibleCount))}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Phones: one thumb-reach switch between the list and the map, always on screen. */}
      <nav
        aria-label={copy.viewModeLabel}
        data-bottom-bar
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm lg:hidden print:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-2 gap-1 rounded-xl border border-border-control bg-surface-subtle p-1">
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
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-[color,background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-safe:active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle ${
                  active ? "bg-sapphire text-white shadow-2xs" : "text-foreground hover:bg-card"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
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
    </div>
  );
}
