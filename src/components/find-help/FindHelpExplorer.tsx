"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { GlobeIcon, PhoneIcon, PinIcon, SearchIcon, XIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  REGIONAL_CITY_PRESETS,
  findHelpTranslations,
  formatOpeningHours,
  isInstituteOpenNow,
} from "@/lib/i18n/find-help-translations";
import {
  INSTITUTE_CATEGORIES,
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
type MobileViewMode = "split" | "map" | "list";

type ApiResponse = {
  country: CountryCode | null;
  center: { lat: number; lng: number };
  institutes: MedicalInstitute[];
};

function chipClass(active: boolean) {
  return (
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    (active
      ? "border-sapphire/50 bg-sapphire-soft text-sapphire"
      : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground")
  );
}

const actionLinkClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] " +
  "hover:border-sapphire/35 hover:bg-sapphire-soft/50 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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

  const [area, setArea] = useState<SearchArea>({ kind: "country", country: initialCountry });
  const [activeCountry, setActiveCountry] = useState<CountryCode>(initialCountry);
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
  const [mobileView, setMobileView] = useState<MobileViewMode>("split");
  const [mobilePreviewId, setMobilePreviewId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const pendingScrollId = useRef<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const geolocationRequested = useRef(false);

  const locateUser = useCallback(() => {
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
        setArea({ kind: "point", ...point, source: "gps" });
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 10 * 60_000 },
    );
  }, []);

  useEffect(() => {
    if (geolocationRequested.current) return;
    geolocationRequested.current = true;
    locateUser();
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
    fetch(`/api/medical-institutes?${requestQuery}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as ApiResponse;
        setInstitutes(Array.isArray(data.institutes) ? data.institutes : []);
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

  function chooseCountry(country: CountryCode) {
    setActiveCountry(country);
    setArea({ kind: "country", country });
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

  const gpsActive = area.kind === "point" && area.source === "gps";
  const cityPresets = REGIONAL_CITY_PRESETS[activeCountry] ?? [];
  const activeCityName = area.kind === "point" && area.source === "city" ? area.cityName ?? null : null;

  const statusText =
    locationStatus === "locating"
      ? copy.locating
      : gpsActive
        ? copy.locationActive
        : activeCityName
          ? `${activeCityName} · ${copy.countries[activeCountry]}`
          : locationStatus === "denied" && area.kind === "country"
            ? copy.locationDenied
            : copy.showingCountry(copy.countries[activeCountry]);

  const filtered = Boolean(category || search || emergencyOnly || openNowOnly);
  const mobilePreviewInstitute = useMemo(
    () => (mobilePreviewId ? displayedInstitutes.find((item) => item.id === mobilePreviewId) ?? null : null),
    [displayedInstitutes, mobilePreviewId],
  );

  const numberLocale = lang === "rom" ? "ro" : lang;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-0">
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {page.listTitle}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">{page.listSubtitle}</p>

        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={copy.countryLabel}>
            {SUPPORTED_COUNTRIES.map((country) => {
              const active = activeCountry === country;
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => chooseCountry(country)}
                  aria-pressed={active}
                  className={chipClass(active)}
                >
                  {copy.countries[country]}
                </button>
              );
            })}
          </div>

          {/* Location status + Use my location action */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {statusText}
            </p>
            <button
              type="button"
              onClick={locateUser}
              disabled={locationStatus === "locating"}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft/60 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground"
            >
              <PinIcon className="h-4 w-4" aria-hidden="true" />
              {copy.useMyLocation}
            </button>
          </div>

          {/* Horizontal scroll-snap regional city quick-jump bar when GPS is idle/denied */}
          {!gpsActive && cityPresets.length > 0 && (
            <div role="group" aria-label={copy.cityQuickJumpLabel} className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">{copy.cityQuickJumpLabel}</p>
              <div className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1">
                {cityPresets.map((city) => {
                  const isActiveCity = activeCityName === city.name;
                  return (
                    <button
                      key={city.name}
                      type="button"
                      aria-pressed={isActiveCity}
                      onClick={() =>
                        setArea({
                          kind: "point",
                          lat: city.lat,
                          lng: city.lng,
                          source: "city",
                          cityName: city.name,
                        })
                      }
                      className={`inline-flex min-h-11 shrink-0 snap-start items-center rounded-lg border px-3.5 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActiveCity
                          ? "border-sapphire/50 bg-sapphire-soft text-sapphire"
                          : "border-border bg-card text-foreground hover:border-sapphire/35 hover:bg-muted/50"
                      }`}
                    >
                      {city.name}
                    </button>
                  );
                })}
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
                className="min-h-11 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-base outline-none transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus:border-sapphire focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
              />
            </label>
            <button
              type="submit"
              className="min-h-11 rounded-lg bg-sapphire px-4 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {copy.searchButton}
            </button>
          </form>

          {/* Category filter chips */}
          <div className="flex flex-wrap gap-2" role="group" aria-label={copy.categoryLabel}>
            {[null, ...INSTITUTE_CATEGORIES.filter((item) => item !== "other")].map((item) => {
              const active = category === item;
              return (
                <button
                  key={item ?? "all"}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={active}
                  className={chipClass(active)}
                >
                  {item ? copy.categories[item] : copy.allCategories}
                </button>
              );
            })}
          </div>

          {/* Composable walk-in & live open-now filters */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={emergencyOnly}
              onClick={() => setEmergencyOnly((prev) => !prev)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3.5 text-left text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                emergencyOnly
                  ? "border-primary/45 bg-primary-soft text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/35"
              }`}
            >
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>{copy.emergencyWalkInFilter}</span>
            </button>

            <button
              type="button"
              aria-pressed={openNowOnly}
              onClick={() => setOpenNowOnly((prev) => !prev)}
              className={chipClass(openNowOnly)}
            >
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-live-sage" />
              <span>{copy.openNowFilter}</span>
            </button>
          </div>

          {emergencyOnly && (
            <div
              role="note"
              className="rounded-lg border border-sapphire/25 bg-sapphire-soft/55 p-3.5 text-sm leading-relaxed text-foreground"
            >
              {copy.emergencyRightsCallout}
            </div>
          )}

          {/* Mobile (< lg) Split / Map / List segmented bar */}
          <div
            role="group"
            aria-label={copy.viewModeLabel}
            className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/60 p-1 lg:hidden"
          >
            {(
              [
                { id: "split", label: copy.viewSplit },
                { id: "map", label: copy.viewMap },
                { id: "list", label: copy.viewList },
              ] as const
            ).map((tab) => {
              const active = mobileView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMobileView(tab.id)}
                  className={`min-h-11 rounded-lg px-3 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active ? "bg-card text-sapphire shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map column: sticky on lg:, controlled by mobileView on < lg */}
      <div
        className={`lg:sticky lg:top-[calc(var(--chrome-h,0px)+1rem)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start ${
          mobileView === "list" ? "hidden lg:block" : "block"
        }`}
      >
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div
            className={`w-full lg:h-[min(44rem,calc(100dvh-15.5rem))] lg:min-h-[24rem] ${
              mobileView === "map" ? "h-[min(62dvh,28rem)]" : "h-72 sm:h-[24rem]"
            }`}
          >
            <InstitutesMap
              institutes={displayedInstitutes}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={selectInstitute}
              onHoverChange={scheduleHoverChange}
              userLocation={userLocation}
              categoryLabels={copy.categories}
              searchThisAreaLabel={copy.searchThisArea}
              youAreHereLabel={copy.youAreHere}
              onSearchArea={(center) => setArea({ kind: "point", ...center, source: "area" })}
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
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {copy.categories[mobilePreviewInstitute.category]}
                  </span>
                  {mobilePreviewInstitute.emergency && (
                    <span className="rounded-md border border-primary/30 bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                      {copy.emergency}
                    </span>
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
              const previewPhoneHref = primaryPhoneHref(mobilePreviewInstitute.phone);

              return (
                <>
                  {previewLoc && <p className="mt-1 text-sm text-muted-foreground">{previewLoc}</p>}
                  {mobilePreviewInstitute.distance_km != null && area.kind === "point" && (
                    <p className="mt-0.5 text-sm tabular-nums text-foreground/75">
                      {copy.kmAway(mobilePreviewInstitute.distance_km.toLocaleString(numberLocale))}
                    </p>
                  )}
                  {previewHours && (
                    <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-muted-foreground">
                      {previewOpenNow && (
                        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-live-sage" />
                      )}
                      <span>
                        {previewOpenNow ? <strong className="font-medium text-foreground">{copy.openNowLive} · </strong> : null}
                        {previewHours}
                      </span>
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mobilePreviewInstitute.phone && previewPhoneHref && (
                      <a href={previewPhoneHref} className={actionLinkClass}>
                        <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                        <span className="tabular-nums">{mobilePreviewInstitute.phone}</span>
                      </a>
                    )}
                    <a
                      href={directionsUrl(mobilePreviewInstitute)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={actionLinkClass}
                    >
                      <PinIcon className="h-4 w-4" aria-hidden="true" />
                      {copy.directions}
                    </a>
                    {mobilePreviewInstitute.website && (
                      <a
                        href={mobilePreviewInstitute.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={actionLinkClass}
                      >
                        <GlobeIcon className="h-4 w-4" aria-hidden="true" />
                        {copy.website}
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
              <span className="h-2.5 w-2.5 flex-none rounded-full bg-sapphire" aria-hidden="true" />
              {copy.legendPlace}
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 flex-none rounded-full bg-primary" aria-hidden="true" />
              {copy.legendEmergency}
            </li>
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
        className={`min-w-0 lg:col-start-1 lg:row-start-2 ${
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
                  className="flex min-h-[136px] flex-col justify-between px-4 py-4 sm:px-5"
                  aria-hidden="true"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`h-5 ${spec.title} animate-pulse rounded-md bg-muted motion-reduce:animate-none`} />
                      <div className="h-5 w-16 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
                    </div>
                    <div className={`h-4 ${spec.address} animate-pulse rounded-md bg-muted/80 motion-reduce:animate-none`} />
                    <div className={`h-4 ${spec.meta} animate-pulse rounded-md bg-muted/70 motion-reduce:animate-none`} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="h-9 w-28 animate-pulse rounded-lg bg-muted/75 motion-reduce:animate-none" />
                    <div className="h-9 w-24 animate-pulse rounded-lg bg-muted/75 motion-reduce:animate-none" />
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
                const location = [institute.address, institute.city].filter(Boolean).join(", ");
                const phoneHref = primaryPhoneHref(institute.phone);
                return (
                  <li
                    key={institute.id}
                    ref={(node) => {
                      if (node) itemRefs.current.set(institute.id, node);
                      else itemRefs.current.delete(institute.id);
                    }}
                  >
                    <article
                      onClick={() => setSelectedId(institute.id)}
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
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                          <button
                            type="button"
                            aria-pressed={active}
                            onFocus={() => scheduleHoverChange(institute.id)}
                            onBlur={() => scheduleHoverChange(null)}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedId(institute.id);
                            }}
                            className="inline-flex min-h-11 items-center rounded-md py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            {institute.name}
                          </button>
                        </h3>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {copy.categories[institute.category]}
                        </span>
                        {institute.emergency ? (
                          <span className="rounded-md border border-primary/30 bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                            {copy.emergency}
                          </span>
                        ) : null}
                      </div>
                      {location ? (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{location}</p>
                      ) : null}
                      {institute.distance_km != null && area.kind === "point" ? (
                        <p className="mt-0.5 text-sm tabular-nums text-foreground/70">
                          {copy.kmAway(institute.distance_km.toLocaleString(numberLocale))}
                        </p>
                      ) : null}
                      {hours ? (
                        <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-muted-foreground">
                          {openNow ? (
                            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-live-sage" />
                          ) : null}
                          <span>
                            {openNow ? (
                              <strong className="font-medium text-foreground">{copy.openNowLive} · </strong>
                            ) : null}
                            {hours}
                          </span>
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {institute.phone && phoneHref ? (
                          <a
                            href={phoneHref}
                            className={actionLinkClass}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                            <span className="tabular-nums">{institute.phone}</span>
                          </a>
                        ) : null}
                        <a
                          href={directionsUrl(institute)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={actionLinkClass}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <PinIcon className="h-4 w-4" aria-hidden="true" />
                          {copy.directions}
                        </a>
                        {institute.website ? (
                          <a
                            href={institute.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={actionLinkClass}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <GlobeIcon className="h-4 w-4" aria-hidden="true" />
                            {copy.website}
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
    </div>
  );
}
