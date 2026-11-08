"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { GlobeIcon, PhoneIcon, PinIcon, SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { findHelpTranslations, formatOpeningHours } from "@/lib/i18n/find-help-translations";
import {
  INSTITUTE_CATEGORIES,
  SUPPORTED_COUNTRIES,
  directionsUrl,
  type CountryCode,
  type InstituteCategory,
  type MedicalInstitute,
} from "@/lib/medical-institutes";

function MapLoading() {
  const { t } = useLanguage();
  return (
    <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
      {t.findHelpPage.loadingMap}
    </div>
  );
}

const InstitutesMap = dynamic(() => import("@/components/find-help/InstitutesMapInner"), {
  ssr: false,
  loading: () => <MapLoading />,
});

/** Results shown before "Show more": enough to compare, short enough to reach the footer on a phone. */
const PAGE_SIZE = 20;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type SearchArea =
  | { kind: "country"; country: CountryCode }
  | { kind: "point"; lat: number; lng: number; source: "gps" | "area" };

type LocationStatus = "idle" | "locating" | "active" | "denied";

type ApiResponse = {
  country: CountryCode | null;
  center: { lat: number; lng: number };
  institutes: MedicalInstitute[];
};

const linkClass =
  "inline-flex min-h-8 items-center gap-1.5 font-medium text-primary hover:text-primary-hover " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm";

export function FindHelpExplorer({
  initialCountry,
  initialCategory = null,
}: {
  initialCountry: CountryCode;
  initialCategory?: InstituteCategory | null;
}) {
  const { t, lang } = useLanguage();
  const page = t.findHelpPage;
  const copy = findHelpTranslations[lang];

  const [area, setArea] = useState<SearchArea>({ kind: "country", country: initialCountry });
  const [activeCountry, setActiveCountry] = useState<CountryCode>(initialCountry);
  const [category, setCategory] = useState<InstituteCategory | null>(initialCategory);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [institutes, setInstitutes] = useState<MedicalInstitute[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [settled, setSettled] = useState<{ key: string; failed: boolean } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  const error = !loading && settled.failed;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/medical-institutes?${requestQuery}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as ApiResponse;
        setInstitutes(Array.isArray(data.institutes) ? data.institutes : []);
        if (data.country) setActiveCountry(data.country);
        setSelectedId(null);
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

  // A pin tapped on the map brings its entry into view in the list, revealing more rows if needed.
  const selectInstitute = useCallback(
    (id: string) => {
      setSelectedId(id);
      const index = institutes.findIndex((item) => item.id === id);
      if (index >= visibleCount) setVisibleCount(index + 1);
      pendingScrollId.current = id;
    },
    [institutes, visibleCount],
  );

  useEffect(() => {
    const id = pendingScrollId.current;
    if (!id) return;
    pendingScrollId.current = null;
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
    setSearch("");
    setSearchInput("");
  }

  const statusText =
    locationStatus === "locating"
      ? copy.locating
      : area.kind === "point" && area.source === "gps"
        ? copy.locationActive
        : locationStatus === "denied" && area.kind === "country"
          ? copy.locationDenied
          : copy.showingCountry(copy.countries[activeCountry]);

  const filtered = Boolean(category || search);

  return (
    // Phones: filters, then the map, then the list. Desktop: filters and list on the left,
    // the map held in view on the right.
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-x-10 lg:gap-y-0">
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {page.listTitle}
        </h2>
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
                  className={`min-h-10 rounded-lg border px-4 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ${
                    active
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {copy.countries[country]}
                </button>
              );
            })}
            <button
              type="button"
              onClick={locateUser}
              disabled={locationStatus === "locating"}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-primary transition-colors duration-[var(--dur-fast)] hover:border-primary/40 disabled:opacity-60"
            >
              <PinIcon className="h-4 w-4" aria-hidden="true" />
              {copy.useMyLocation}
            </button>
          </div>

          <p className="text-sm text-muted-foreground" aria-live="polite">
            {statusText}
          </p>

          <form onSubmit={submitSearch} className="flex gap-2" role="search">
            <label className="relative flex-1">
              <span className="sr-only">{copy.searchPlaceholder}</span>
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  if (!event.target.value) setSearch("");
                }}
                placeholder={copy.searchPlaceholder}
                className="min-h-11 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-primary-hover"
            >
              {copy.searchButton}
            </button>
          </form>

          <div className="flex flex-wrap gap-2" role="group" aria-label={copy.categoryLabel}>
            {[null, ...INSTITUTE_CATEGORIES.filter((item) => item !== "other")].map((item) => {
              const active = category === item;
              return (
                <button
                  key={item ?? "all"}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={active}
                  className={`min-h-9 rounded-lg px-3 text-sm font-medium transition-colors duration-[var(--dur-fast)] ${
                    active
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary"
                  }`}
                >
                  {item ? copy.categories[item] : copy.allCategories}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-[calc(var(--chrome-h,0px)+1rem)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-72 w-full sm:h-[24rem] lg:h-[36rem]">
            <InstitutesMap
              institutes={institutes}
              selectedId={selectedId}
              onSelect={selectInstitute}
              userLocation={userLocation}
              categoryLabels={copy.categories}
              searchThisAreaLabel={copy.searchThisArea}
              youAreHereLabel={copy.youAreHere}
              onSearchArea={(center) => setArea({ kind: "point", ...center, source: "area" })}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{page.mapAttribution}</p>
      </div>

      <div className="min-w-0 lg:col-start-1 lg:row-start-2" aria-busy={loading}>
        {loading ? (
          <p className="mt-2 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground lg:mt-6" role="status">
            {copy.loading}
          </p>
        ) : error ? (
          <div className="mt-2 rounded-xl border border-border bg-card p-5 text-sm text-foreground lg:mt-6" role="alert">
            <p>{copy.loadError}</p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-3 min-h-9 font-semibold text-primary hover:text-primary-hover"
            >
              {copy.retry}
            </button>
          </div>
        ) : institutes.length === 0 ? (
          <div className="mt-2 rounded-xl border border-dashed border-border p-5 lg:mt-6" role="status">
            <p className="text-sm text-muted-foreground">{copy.noResults}</p>
            {filtered ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 min-h-9 text-sm font-semibold text-primary hover:text-primary-hover"
              >
                {copy.clearFilters}
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm font-medium text-muted-foreground lg:mt-6" role="status">
              {copy.resultsCount(institutes.length)}
            </p>
            <ul className="mt-3 space-y-3 lg:max-h-[40rem] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
              {institutes.slice(0, visibleCount).map((institute) => {
                const active = institute.id === selectedId;
                const hours = formatOpeningHours(institute.hours, copy);
                const location = [institute.address, institute.city].filter(Boolean).join(", ");
                return (
                  <li
                    key={institute.id}
                    ref={(node) => {
                      if (node) itemRefs.current.set(institute.id, node);
                      else itemRefs.current.delete(institute.id);
                    }}
                  >
                    {/* The whole entry is a large click target; the name button is the keyboard control. */}
                    <article
                      onClick={() => setSelectedId(institute.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] sm:p-5 ${
                        active ? "border-primary bg-primary-soft" : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                          <button
                            type="button"
                            aria-pressed={active}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedId(institute.id);
                            }}
                            className="rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            {institute.name}
                          </button>
                        </h3>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {copy.categories[institute.category]}
                        </span>
                        {institute.emergency ? (
                          <span className="rounded-md border border-primary/30 px-2 py-0.5 text-xs font-semibold text-primary">
                            {copy.emergency}
                          </span>
                        ) : null}
                      </div>
                      {location ? (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{location}</p>
                      ) : null}
                      {institute.distance_km != null && area.kind === "point" ? (
                        <p className="mt-0.5 text-sm tabular-nums text-foreground/70">
                          {copy.kmAway(institute.distance_km.toLocaleString(lang))}
                        </p>
                      ) : null}
                      {hours ? <p className="mt-1 text-sm text-muted-foreground">{hours}</p> : null}
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                        {institute.phone ? (
                          <a
                            href={`tel:${institute.phone.replace(/[^\d+]/g, "")}`}
                            className={linkClass}
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
                          className={linkClass}
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
                            className={linkClass}
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
            {institutes.length > visibleCount ? (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copy.showMore(Math.min(PAGE_SIZE, institutes.length - visibleCount))}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
