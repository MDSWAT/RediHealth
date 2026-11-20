"use client";

import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ListenButton } from "@/components/ui/ListenButton";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  ALL_ALBANIA,
  ALL_CROATIA,
  ALL_ITALY,
  ALL_MOLDOVA,
  EXTRA_MAP_COPY,
  countryAllValue,
  mapCountriesForLang,
  type MapCountry,
} from "@/components/ui/romania-county-map-helpers";
import { useUserCounty } from "@/lib/geo-ip";
import { CountyOverrideModal } from "@/components/news/CountyOverrideModal";
import { isWholeCountry, newsForPlace } from "@/components/news/PlaceNewsModal";
import { countyLabel, formatNewsDate, placeName, resolveNewsBasePath } from "@/components/news/news-format";
import { AlertCircleIcon, ArrowRightIcon, ChevronDownIcon, FilterIcon, HeartIcon, PinIcon, ShieldIcon } from "@/components/ui/icons";
import { useReadAloud } from "@/components/health-check/readingTools";

const RomaniaCountyMap = dynamic(
  () => import("@/components/ui/RomaniaCountyMap").then((m) => m.RomaniaCountyMap),
  { ssr: false, loading: () => null },
);
import {
  ALBANIA_WIDE,
  CROATIA_WIDE,
  ITALY_WIDE,
  MOLDOVA_WIDE,
  NEWS_ARTICLES,
  NEWS_CATEGORIES,
  articleCountry,
  getLocalizedArticle,
  isCountryWide,
  isNationalCounty,
  type NewsArticle,
  type NewsCategory,
  type NewsCountry,
} from "@/lib/data/news";

type CategoryFilter = "all" | NewsCategory;

function pluralSuffix(lang: Lang, n: number): string {
  switch (lang) {
    case "ro":
      return n === 1 ? "1 articol" : `${n} articole`;
    case "en":
      return n === 1 ? "1 article" : `${n} articles`;
    case "sq":
      return n === 1 ? "1 artikull" : `${n} artikuj`;
    case "it":
      return n === 1 ? "1 articolo" : `${n} articoli`;
    case "hr": {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return `${n} članak`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} članka`;
      return `${n} članaka`;
    }
    case "rom":
      return n === 1 ? "1 artiklo" : `${n} artikluri`;
    case "ru": {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return `${n} статья`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} статьи`;
      return `${n} статей`;
    }
  }
}

const FEED_COPY: Record<Lang, {
  filtersButton: string;
  areaLabel: string;
  categoriesLabel: string;
  local: string;
  national: string;
  noLocal: (place: string) => string;
}> = {
  ro: {
    filtersButton: "Filtre",
    areaLabel: "Zona",
    categoriesLabel: "Categorie",
    local: "Anunțuri locale",
    national: "La nivel național",
    noLocal: (place) => `Nu sunt alerte locale pentru ${place}. Mai jos apar anunțurile naționale.`,
  },
  en: {
    filtersButton: "Filters",
    areaLabel: "Area",
    categoriesLabel: "Category",
    local: "Local updates",
    national: "Nationwide",
    noLocal: (place) => `No local alerts for ${place}. Nationwide updates appear below.`,
  },
  sq: {
    filtersButton: "Filtra",
    areaLabel: "Zona",
    categoriesLabel: "Kategoria",
    local: "Njoftime lokale",
    national: "Në nivel kombëtar",
    noLocal: (place) => `Nuk ka njoftime lokale për ${place}. Njoftimet kombëtare shfaqen më poshtë.`,
  },
  it: {
    filtersButton: "Filtri",
    areaLabel: "Zona",
    categoriesLabel: "Categoria",
    local: "Avvisi locali",
    national: "A livello nazionale",
    noLocal: (place) => `Nessun avviso locale per ${place}. Gli avvisi nazionali appaiono qui sotto.`,
  },
  hr: {
    filtersButton: "Filtri",
    areaLabel: "Područje",
    categoriesLabel: "Kategorija",
    local: "Lokalne obavijesti",
    national: "Na nacionalnoj razini",
    noLocal: (place) => `Nema lokalnih obavijesti za ${place}. Nacionalne obavijesti su ispod.`,
  },
  rom: {
    filtersButton: "Filtruya",
    areaLabel: "Than",
    categoriesLabel: "Kategoria",
    local: "Lokalni neve",
    national: "Pe saoro them",
    noLocal: (place) => `Nane lokalni neve vaš ${place}. Tele si e themaqe neve.`,
  },
  ru: {
    filtersButton: "Фильтры",
    areaLabel: "Регион",
    categoriesLabel: "Категория",
    local: "Местные новости",
    national: "По всей стране",
    noLocal: (place) => `Для ${place} нет местных объявлений. Ниже показаны новости по стране.`,
  },
};
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

const COPY: Record<Lang, { hideMap: string; showMap: string; latest: string; changeArea: Record<Exclude<MapCountry, "ro">, string> }> = {
ru: {
"changeArea": {
"al": "Изменить регион",
"md":"Изменить район","hr":"Изменить жупанию","it":"Изменить регион"},
 hideMap: "Скрыть карту", showMap: "Показать карту", latest: "Последние" },

  ro: {
    hideMap: "Ascunde harta",
    showMap: "Arată harta",
    latest: "Cele mai recente",
    changeArea: { md: "Schimbă raionul", hr: "Schimbă comitatul", it: "Schimbă regiunea", al: "Schimbă regiunea" },
  },
  en: {
    hideMap: "Hide map",
    showMap: "Show map",
    latest: "Latest",
    changeArea: { md: "Change district", hr: "Change county", it: "Change region", al: "Change county" },
  },
  sq: {
    hideMap: "Fshih hartën",
    showMap: "Shfaq hartën",
    latest: "Më të rejat",
    changeArea: { md: "Ndrysho rajonin", hr: "Ndrysho qarkun", it: "Ndrysho rajonin", al: "Ndrysho qarkun" },
  },
  it: {
    hideMap: "Nascondi la mappa",
    showMap: "Mostra la mappa",
    latest: "Le più recenti",
    changeArea: { md: "Cambia distretto", hr: "Cambia regione", it: "Cambia regione", al: "Cambia prefettura" },
  },
  hr: {
    hideMap: "Sakrij kartu",
    showMap: "Prikaži kartu",
    latest: "Najnovije obavijesti",
    changeArea: { md: "Promijeni rajon", hr: "Promijeni županiju", it: "Promijeni regiju", al: "Promijeni okrug" },
  },
  rom: {
    hideMap: "Garav i harta",
    showMap: "Sikav i harta",
    latest: "E may neve",
    changeArea: { md: "Paruv o rayono", hr: "Paruv i zhupaniya", it: "Paruv i regiyona", al: "Paruv o qarko" },
  },
};

const utilityButton =
  "press-row inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-control max-w-full bg-card px-3.5 py-2 text-body font-medium text-foreground whitespace-nowrap transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4";

/**
 * NewsHub: the regional news page. Conditional maps follow the active language:
 * - Italian (`it`) -> Italy map only
 * - Croatian (`hr`) -> Croatia map only
 * - Other locales (`ro`, `en`, `sq`, `rom`) -> Romania + Republic of Moldova map switcher
 */
export function NewsHub() {
  const { lang, t } = useLanguage();
  const pathname = usePathname();
  const basePath = resolveNewsBasePath(pathname);
  const np = t.newsPage;
  const c = COPY[lang] ?? COPY.ro;
  const extra = EXTRA_MAP_COPY[lang] ?? EXTRA_MAP_COPY.ro;
  const voice = useReadAloud(lang);
  const { county, setCounty } = useUserCounty();

  const mapCountries = useMemo(() => mapCountriesForLang(lang), [lang]);
  const [selectedMapCountry, setSelectedMapCountry] = useState<MapCountry>(() => mapCountries[0]);
  const activeCountry: MapCountry = mapCountries.includes(selectedMapCountry) ? selectedMapCountry : mapCountries[0];

  // Per-country selections outside Romania stay page-local so the saved Romanian county cookie is preserved.
  const [roNationalSelected, setRoNationalSelected] = useState(false);
  const [nonRoSelections, setNonRoSelections] = useState<Partial<Record<Exclude<MapCountry, "ro">, string>>>({});
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

  const [countyModalOpen, setCountyModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // News-first for low-literacy clarity: show real alerts and caravans immediately above the fold,
  // keeping the interactive county map and filter controls cleanly tucked behind one Filters button.
  const [showMap, setShowMap] = useState(false);

  const selectedAreaForMap =
    activeCountry === "ro"
      ? (roNationalSelected ? "Toate județele" : county)
      : (nonRoSelections[activeCountry] ?? countryAllValue(activeCountry));

  const selectArea = (name: string, targetCountry: MapCountry = activeCountry) => {
    setSelectedMapCountry(targetCountry);
    if (targetCountry === "ro") {
      if (isNationalCounty(name)) {
        setRoNationalSelected(true);
      } else {
        setRoNationalSelected(false);
        setCounty(name);
      }
    } else {
      setNonRoSelections((prev) => ({ ...prev, [targetCountry]: name }));
    }
  };

  const resetFilters = useCallback(() => {
    setSelectedCategory("all");
    if (activeCountry === "ro") {
      setRoNationalSelected(true);
    } else {
      setNonRoSelections((prev) => ({
        ...prev,
        [activeCountry]: countryAllValue(activeCountry),
      }));
    }
  }, [activeCountry]);

  const fc = FEED_COPY[lang];

  const categoryLabels: Record<NewsCategory, string> = {
    "Alerte locale": np.categories.epidemics,
    "Caravane medicale": np.categories.caravan,
    "Campanii de vaccinare": np.categories.vaccinationCampaigns,
    "Sfaturi de sezon": np.categories.seasonalAdvice,
  };

  const localizedArticles = useMemo(() => NEWS_ARTICLES.map((article) => getLocalizedArticle(article, lang)), [lang]);

  const countryArticles = useMemo(
    () =>
      localizedArticles
        .filter((a) => articleCountry(a) === activeCountry)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [localizedArticles, activeCountry],
  );

  const placeIsNational = isWholeCountry(selectedAreaForMap);

  const filteredFeed = useMemo(() => {
    const byCategory = (items: NewsArticle[]) =>
      selectedCategory === "all" ? items : items.filter((item) => item.category === selectedCategory);

    if (placeIsNational) {
      return {
        local: [] as NewsArticle[],
        national: byCategory(countryArticles),
        hasAnyLocalForPlace: false,
      };
    }

    const groups = newsForPlace(selectedAreaForMap, countryArticles, activeCountry);
    return {
      local: byCategory(groups.local),
      national: byCategory(groups.national),
      hasAnyLocalForPlace: groups.local.length > 0,
    };
  }, [activeCountry, countryArticles, placeIsNational, selectedAreaForMap, selectedCategory]);

  const filteredTotal = filteredFeed.local.length + filteredFeed.national.length;
  const isFiltered = !placeIsNational || selectedCategory !== "all";
  const feedGroups = [
    ...(filteredFeed.local.length > 0
      ? [{ id: "local", heading: filteredFeed.national.length > 0 ? fc.local : null, items: filteredFeed.local }]
      : []),
    ...(filteredFeed.national.length > 0
      ? [{ id: "national", heading: filteredFeed.local.length > 0 ? fc.national : null, items: filteredFeed.national }]
      : []),
  ];

  // Places with local news in the active country are tinted on the map and offered as quick picks.
  const hubs = useMemo(
    () => [
      ...new Set(
        NEWS_ARTICLES
          .filter((a) => articleCountry(a) === activeCountry && !isCountryWide(a))
          .map((a) => a.county),
      ),
    ],
    [activeCountry],
  );

  const countyDisplay =
    activeCountry === "it"
      ? selectedAreaForMap === ALL_ITALY
        ? (t.countyMap?.allItaly ?? ALL_ITALY)
        : placeName(selectedAreaForMap, lang)
      : activeCountry === "md"
        ? selectedAreaForMap === ALL_MOLDOVA
          ? extra.allMoldova
          : countyLabel(selectedAreaForMap, lang, "md")
        : activeCountry === "hr"
          ? selectedAreaForMap === ALL_CROATIA
            ? extra.allCroatia
            : countyLabel(selectedAreaForMap, lang, "hr")
          : activeCountry === "al"
            ? selectedAreaForMap === ALL_ALBANIA
              ? extra.allAlbania
              : countyLabel(selectedAreaForMap, lang, "al")
            : isNationalCounty(selectedAreaForMap)
              ? np.allCounties
              : countyLabel(selectedAreaForMap, lang, "ro");

  const changeActionLabel = activeCountry === "ro" ? np.changeCounty : c.changeArea[activeCountry];

  const placeLabel = (place: string, itemCountry: NewsCountry) => {
    if (place === ITALY_WIDE && itemCountry === "it") return t.countyMap?.allItaly ?? ITALY_WIDE;
    if (place === MOLDOVA_WIDE && itemCountry === "md") return extra.allMoldova;
    if (place === CROATIA_WIDE && itemCountry === "hr") return extra.allCroatia;
    if (place === ALBANIA_WIDE && itemCountry === "al") return extra.allAlbania;
    if (isNationalCounty(place)) return np.allCounties;
    return placeName(place, lang);
  };

  const areaHeading = placeIsNational ? c.latest : placeLabel(selectedAreaForMap, activeCountry);

  const activeFilterCount = (!placeIsNational ? 1 : 0) + (selectedCategory !== "all" ? 1 : 0);

  return (
    <main id="main-content" className="flex-1 bg-background pb-12 sm:pb-16">
      <Container>
        <PageHeader
          title={np.heroTitle}
          lead={np.heroSubtitle}
          actions={
            <>
              {voice.available && (
                <ListenButton
                  uiLang={lang}
                  autoRead
                  isPlaying={voice.speaking}
                  onToggle={() => {
                    if (voice.speaking) {
                      voice.stop();
                    } else {
                      voice.speak([np.heroTitle, np.heroSubtitle]);
                    }
                  }}
                />
              )}
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                aria-expanded={filtersOpen}
                aria-controls="news-filters-panel"
                className={
                  filtersOpen
                    ? "press-row inline-flex min-h-11 max-w-full shrink-0 items-center gap-2 whitespace-nowrap rounded-(--radius-control) border border-rose-border bg-rose-tint px-3.5 text-meta font-semibold text-rose-ink shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    : utilityButton
                }
              >
                <FilterIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{fc.filtersButton}</span>
                {activeFilterCount > 0 && (
                  <span
                    className={
                      filtersOpen
                        ? "inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-rose-ink/15 px-1.5 text-meta font-semibold tabular-nums text-rose-ink"
                        : "inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-rose-ink px-1.5 text-meta font-semibold tabular-nums text-white"
                    }
                  >
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDownIcon
                  className={`h-4 w-4 shrink-0 transition-transform duration-(--dur-fast) ${filtersOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </>
          }
        />
      </Container>

      <div className="pt-5 pb-8 sm:pt-6 sm:pb-12">
        <Container>
          {/* Unified collapsible Filters drawer: Area, Map toggle, Reset, and Categories in one place */}
          <div
            id="news-filters-panel"
            data-open={filtersOpen ? "true" : "false"}
            aria-hidden={!filtersOpen}
            className="calm-collapse"
          >
            <div className="calm-collapse-inner" inert={!filtersOpen || undefined}>
              <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-2xs sm:p-5 dark:border-white/10 dark:bg-ink-900">
                <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
                  {/* Field 1: Area */}
                  <div className="min-w-0">
                    <span className="mb-1.5 block text-meta font-medium text-muted-foreground">
                      {fc.areaLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCountyModalOpen(true)}
                      className="press-row flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-border-control bg-background px-3.5 text-left text-body font-medium text-foreground transition-colors duration-(--dur-fast) hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <PinIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <span className="truncate font-semibold">{countyDisplay}</span>
                      </span>
                      <span className="shrink-0 text-meta font-medium text-muted-foreground">
                        {changeActionLabel}
                      </span>
                    </button>
                  </div>

                  {/* Field 2: Category */}
                  <div className="min-w-0">
                    <label
                      htmlFor="news-category-select"
                      className="mb-1.5 block text-meta font-medium text-muted-foreground"
                    >
                      {fc.categoriesLabel}
                    </label>
                    <div className="relative">
                      <select
                        id="news-category-select"
                        value={selectedCategory}
                        onChange={(event) => setSelectedCategory(event.target.value as CategoryFilter)}
                        className="field-focus min-h-11 w-full appearance-none rounded-xl border border-border-control bg-background py-2 pr-10 pl-3.5 text-body font-semibold text-foreground transition-colors duration-(--dur-fast) hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="all">{np.categories.all}</option>
                        {NEWS_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {categoryLabels[cat]}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Quiet secondary actions: Map toggle + Reset */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-2.5 text-meta">
                  <button
                    type="button"
                    onClick={() => setShowMap((prev) => !prev)}
                    aria-expanded={showMap}
                    aria-controls="news-county-map"
                    className="inline-flex min-h-9 items-center font-medium text-muted-foreground underline decoration-border-control underline-offset-4 transition-colors duration-(--dur-fast) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showMap ? c.hideMap : c.showMap}
                  </button>
                  {isFiltered && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex min-h-9 items-center font-semibold text-foreground underline decoration-foreground/35 underline-offset-4 transition-colors duration-(--dur-fast) hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {np.resetFilter}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            id="news-county-map"
            data-open={showMap ? "true" : "false"}
            aria-hidden={!showMap}
            className="calm-collapse"
          >
            <div className="calm-collapse-inner" inert={!showMap || undefined}>
              <div className="pb-8">
                {showMap && (
                  <RomaniaCountyMap
                    selectedCounty={selectedAreaForMap}
                    onSelectCounty={selectArea}
                    activeHubs={hubs}
                    countries={mapCountries}
                    activeCountry={activeCountry}
                    onCountryChange={setSelectedMapCountry}
                  />
                )}
              </div>
            </div>
          </div>

          <section aria-labelledby="news-latest-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 min-w-0">
                <h2 id="news-latest-heading" className="text-body font-semibold text-foreground">
                  {areaHeading}
                  {selectedCategory !== "all" ? ` — ${categoryLabels[selectedCategory]}` : ""}
                </h2>
                <p aria-live="polite" className="text-meta text-muted-foreground tabular-nums">
                  {pluralSuffix(lang, filteredTotal)}
                </p>
              </div>
            </div>

            {!placeIsNational && !filteredFeed.hasAnyLocalForPlace && selectedCategory === "all" && filteredTotal > 0 && (
              <p className="mt-4 text-meta text-muted-foreground">
                {fc.noLocal(placeLabel(selectedAreaForMap, activeCountry))}
              </p>
            )}

            {feedGroups.map((group, groupIndex) => {
              const categoryMeta = (cat: NewsCategory) => {
                if (cat === "Alerte locale") {
                  return {
                    Icon: AlertCircleIcon,
                    bar: "bg-amber-care",
                    plate: "bg-amber-care-soft text-amber-care dark:bg-amber-care/20 dark:text-amber-care-border",
                  };
                }
                if (cat === "Caravane medicale") {
                  return {
                    Icon: PinIcon,
                    bar: "bg-wellness",
                    plate: "bg-wellness-soft text-wellness dark:text-wellness-border",
                  };
                }
                if (cat === "Campanii de vaccinare") {
                  return {
                    Icon: ShieldIcon,
                    bar: "bg-sapphire",
                    plate: "bg-sapphire-soft text-sapphire dark:bg-white/10 dark:text-sapphire-border",
                  };
                }
                return {
                  Icon: HeartIcon,
                  bar: "bg-sapphire-light",
                  plate: "bg-sapphire-soft text-sapphire dark:bg-white/10 dark:text-sapphire-border",
                };
              };

              const leadArticle = groupIndex === 0 ? group.items[0] : undefined;
              const gridItems = groupIndex === 0 ? group.items.slice(1) : group.items;

              return (
                <div key={group.id} className="mt-6">
                  {group.heading && (
                    <h3 className="mb-3 text-body font-semibold text-foreground">
                      {group.heading}
                    </h3>
                  )}

                  {leadArticle ? (() => {
                    const meta = categoryMeta(leadArticle.category);
                    const LeadIcon = meta.Icon;
                    return (
                      <Link
                        href={withLangPrefix(`${basePath}/${leadArticle.slug}`, lang)}
                        className="press-row group mb-5 block overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card-rest) transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/45 hover:shadow-(--shadow-card-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:border-white/10 dark:bg-ink-900"
                      >
                        <span aria-hidden="true" className={`block h-1 ${meta.bar}`} />
                        <div className="p-5 sm:p-7">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span
                                aria-hidden="true"
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.plate}`}
                              >
                                <LeadIcon className="h-4.5 w-4.5" />
                              </span>
                              <span className="text-meta font-semibold text-foreground">
                                {categoryLabels[leadArticle.category] ?? leadArticle.category}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-2 text-meta text-muted-foreground tabular-nums">
                              <span>{placeLabel(leadArticle.county, articleCountry(leadArticle))}</span>
                              <span aria-hidden="true" className="inline-block h-3 w-px bg-border" />
                              <time dateTime={leadArticle.date}>
                                {formatNewsDate(leadArticle.date, lang, { short: true, year: false })}
                              </time>
                            </span>
                          </div>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                            <div className="min-w-0 max-w-3xl">
                              <h3
                                lang={leadArticle.language}
                                className="text-balance text-section font-semibold leading-snug text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none dark:group-hover:text-sapphire-border"
                              >
                                {leadArticle.title}
                              </h3>
                              {leadArticle.summary ? (
                                <p
                                  lang={leadArticle.language}
                                  className="mt-2.5 text-pretty text-body leading-relaxed text-muted-foreground"
                                >
                                  {leadArticle.summary}
                                </p>
                              ) : null}
                            </div>
                            <span
                              aria-hidden="true"
                              className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-xl border border-border bg-background text-sapphire transition-colors duration-[var(--dur-fast)] group-hover:border-sapphire group-hover:bg-sapphire group-hover:text-white sm:self-end dark:border-white/12 dark:bg-ink-800 dark:text-sapphire-border"
                            >
                              <ArrowRightIcon className="arrow-travel h-5 w-5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })() : null}

                  {gridItems.length > 0 ? (
                    <ul
                      key={`${group.id}-${activeCountry}-${selectedAreaForMap}-${selectedCategory}`}
                      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {gridItems.map((article, index) => {
                        const meta = categoryMeta(article.category);
                        const CardIcon = meta.Icon;
                        return (
                          <li key={article.id} className="list-in min-w-0" style={{ "--i": index } as React.CSSProperties}>
                            <Link
                              href={withLangPrefix(`${basePath}/${article.slug}`, lang)}
                              className="press-row group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card-rest) transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/40 hover:shadow-(--shadow-card-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:border-white/10 dark:bg-ink-900"
                            >
                              <span aria-hidden="true" className={`block h-0.5 ${meta.bar}`} />
                              <div className="flex flex-1 flex-col p-5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="inline-flex items-center gap-2 text-meta font-semibold text-foreground">
                                    <span
                                      aria-hidden="true"
                                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.plate}`}
                                    >
                                      <CardIcon className="h-3.5 w-3.5" />
                                    </span>
                                    <span>{categoryLabels[article.category] ?? article.category}</span>
                                  </span>
                                  <time
                                    dateTime={article.date}
                                    className="shrink-0 text-meta text-muted-foreground tabular-nums"
                                  >
                                    {formatNewsDate(article.date, lang, { short: true, year: false })}
                                  </time>
                                </div>

                                <h3
                                  lang={article.language}
                                  className="mt-3.5 text-balance text-body font-semibold leading-snug text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none dark:group-hover:text-sapphire-border"
                                >
                                  {article.title}
                                </h3>

                                {article.summary ? (
                                  <p
                                    lang={article.language}
                                    className="mt-2 line-clamp-3 text-pretty text-meta leading-relaxed text-muted-foreground"
                                  >
                                    {article.summary}
                                  </p>
                                ) : null}

                                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-3.5 text-meta text-muted-foreground">
                                  <span className="inline-flex min-w-0 items-center gap-1.5">
                                    <PinIcon className="h-3.5 w-3.5 shrink-0 text-sapphire dark:text-sapphire-border" aria-hidden="true" />
                                    <span className="truncate">{placeLabel(article.county, articleCountry(article))}</span>
                                  </span>
                                  <ArrowRightIcon
                                    className="arrow-travel h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border"
                                    aria-hidden="true"
                                  />
                                </div>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })}

            {filteredTotal === 0 && (
              <div key={`empty-${activeCountry}-${selectedAreaForMap}-${selectedCategory}`} className="swap-in border-b border-border py-8">
                <p className="text-body font-semibold text-foreground">{np.emptyTitle}</p>
                <p className="mt-1 max-w-(--measure-reading) text-body text-muted-foreground">{np.emptySubtitle}</p>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-(--radius-control) border border-border-control bg-card px-4 text-meta font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {np.resetFilter}
                  </button>
                )}
              </div>
            )}
          </section>
        </Container>
      </div>

      <CountyOverrideModal
        open={countyModalOpen}
        onOpenChange={setCountyModalOpen}
        currentCounty={selectedAreaForMap}
        onSelectCounty={selectArea}
        country={activeCountry}
        countries={mapCountries}
      />
    </main>
  );
}
