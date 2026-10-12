"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import {
  ClipboardCheckIcon,
  GlobeIcon,
  HandHelpingIcon,
  HeartIcon,
  PhoneIcon,
  PinIcon,
  SearchIcon,
  ShieldIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
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

const InstitutesMap = dynamic(
  () => import("@/components/find-help/InstitutesMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-96 items-center justify-center rounded-2xl border border-border bg-muted text-sm text-muted-foreground">
        …
      </div>
    ),
  },
);

const CATEGORY_ICONS: Record<InstituteCategory, typeof HeartIcon> = {
  hospital: HeartIcon,
  clinic: StethoscopeIcon,
  gp: ClipboardCheckIcon,
  dentist: HandHelpingIcon,
  pharmacy: ShieldIcon,
  other: PinIcon,
};

type SearchArea =
  | { kind: "country"; country: CountryCode }
  | { kind: "point"; lat: number; lng: number; source: "gps" | "area" };

type LocationStatus = "idle" | "locating" | "active" | "denied";

type ApiResponse = {
  country: CountryCode | null;
  center: { lat: number; lng: number };
  institutes: MedicalInstitute[];
};

export function FindHelpExplorer({ initialCountry }: { initialCountry: CountryCode }) {
  const { t, lang } = useLanguage();
  const page = t.findHelpPage;
  const copy = findHelpTranslations[lang];

  const [area, setArea] = useState<SearchArea>({ kind: "country", country: initialCountry });
  const [activeCountry, setActiveCountry] = useState<CountryCode>(initialCountry);
  const [category, setCategory] = useState<InstituteCategory | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [institutes, setInstitutes] = useState<MedicalInstitute[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [settled, setSettled] = useState<{ key: string; failed: boolean } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const selectInstitute = useCallback((id: string) => {
    setSelectedId(id);
    itemRefs.current.get(id)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  function chooseCountry(country: CountryCode) {
    setActiveCountry(country);
    setArea({ kind: "country", country });
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  const statusText =
    locationStatus === "locating"
      ? copy.locating
      : area.kind === "point" && area.source === "gps"
        ? copy.locationActive
        : locationStatus === "denied" && area.kind === "country"
          ? copy.locationDenied
          : copy.showingCountry(copy.countries[activeCountry]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {page.listTitle}
        </h2>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          {page.listSubtitle}
        </p>

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
                  className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
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
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold text-primary transition-colors hover:border-primary/40 disabled:opacity-60"
            >
              <PinIcon className="h-4 w-4" />
              {copy.useMyLocation}
            </button>
          </div>

          <p className="text-sm text-muted-foreground" aria-live="polite">
            {statusText}
          </p>

          <form onSubmit={submitSearch} className="flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">{copy.searchPlaceholder}</span>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  if (!event.target.value) setSearch("");
                }}
                placeholder={copy.searchPlaceholder}
                className="min-h-11 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
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
                  className={`min-h-9 rounded-full px-3 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary"
                  }`}
                >
                  {item ? copy.categories[item] : copy.allCategories}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <p className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground" aria-live="polite">
            {copy.loading}
          </p>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary-soft p-5 text-sm text-foreground">
            <p>{copy.loadError}</p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-3 font-semibold text-primary hover:text-primary-hover"
            >
              {copy.retry}
            </button>
          </div>
        ) : institutes.length === 0 ? (
          <p className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            {copy.noResults}
          </p>
        ) : (
          <>
            <p className="mt-6 text-xs font-medium text-muted-foreground">
              {copy.resultsCount(institutes.length)}
            </p>
            <ul className="mt-2 max-h-[40rem] space-y-3 overflow-y-auto pr-1">
              {institutes.map((institute) => {
                const Icon = CATEGORY_ICONS[institute.category];
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
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedId(institute.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedId(institute.id);
                        }
                      }}
                      aria-pressed={active}
                      className={`flex w-full cursor-pointer items-start gap-4 rounded-xl border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        active
                          ? "border-primary bg-primary-soft"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-semibold text-foreground">{institute.name}</span>
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {copy.categories[institute.category]}
                          </span>
                          {institute.emergency ? (
                            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                              {copy.emergency}
                            </span>
                          ) : null}
                        </span>
                        {location ? (
                          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{location}</span>
                        ) : null}
                        {institute.distance_km != null && area.kind === "point" ? (
                          <span className="mt-1 block text-xs font-medium text-foreground/70">
                            {copy.kmAway(institute.distance_km.toLocaleString(lang))}
                          </span>
                        ) : null}
                        <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {institute.phone ? (
                            <a
                              href={`tel:${institute.phone.replace(/[^\d+]/g, "")}`}
                              className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary-hover"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <PhoneIcon className="h-4 w-4" />
                              {institute.phone}
                            </a>
                          ) : null}
                          {hours ? <span>{hours}</span> : null}
                        </span>
                        <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <a
                            href={directionsUrl(institute)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary-hover"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <PinIcon className="h-4 w-4" />
                            {copy.directions}
                          </a>
                          {institute.website ? (
                            <a
                              href={institute.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary-hover"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <GlobeIcon className="h-4 w-4" />
                              {copy.website}
                            </a>
                          ) : null}
                        </span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-[28rem] w-full lg:h-[36rem]">
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
    </div>
  );
}
