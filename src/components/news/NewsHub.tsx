"use client";

import React, { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
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
import { PinIcon, StethoscopeIcon, UsersIcon } from "@/components/ui/icons";
import { useReadAloud } from "@/components/health-check/readingTools";

const RomaniaCountyMap = dynamic(
  () => import("@/components/ui/RomaniaCountyMap").then((m) => m.RomaniaCountyMap),
  { ssr: false, loading: () => null },
);

function subscribeDesktopLayout(onChange: () => void) {
  const mql = window.matchMedia("(min-width: 1024px)");
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function readDesktopLayout() {
  return window.matchMedia("(min-width: 1024px)").matches;
}
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
  categoriesLabel: string;
  local: string;
  national: string;
  noLocal: (place: string) => string;
}> = {
  ro: {
    categoriesLabel: "Filtrează după categorie",
    local: "Anunțuri locale",
    national: "La nivel național",
    noLocal: (place) => `Nu sunt alerte locale pentru ${place}. Mai jos apar anunțurile naționale.`,
  },
  en: {
    categoriesLabel: "Filter by category",
    local: "Local updates",
    national: "Nationwide",
    noLocal: (place) => `No local alerts for ${place}. Nationwide updates appear below.`,
  },
  sq: {
    categoriesLabel: "Filtro sipas kategorisë",
    local: "Njoftime lokale",
    national: "Në nivel kombëtar",
    noLocal: (place) => `Nuk ka njoftime lokale për ${place}. Njoftimet kombëtare shfaqen më poshtë.`,
  },
  it: {
    categoriesLabel: "Filtra per categoria",
    local: "Avvisi locali",
    national: "A livello nazionale",
    noLocal: (place) => `Nessun avviso locale per ${place}. Gli avvisi nazionali appaiono qui sotto.`,
  },
  hr: {
    categoriesLabel: "Filtriraj po kategoriji",
    local: "Lokalne obavijesti",
    national: "Na nacionalnoj razini",
    noLocal: (place) => `Nema lokalnih obavijesti za ${place}. Nacionalne obavijesti su ispod.`,
  },
  rom: {
    categoriesLabel: "Alosar pala kategoria",
    local: "Lokalni neve",
    national: "Pe saoro them",
    noLocal: (place) => `Nane lokalni neve vaš ${place}. Tele si e themaqe neve.`,
  },
  ru: {
    categoriesLabel: "Фильтр по категории",
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
  const isDesktopLayout = useSyncExternalStore(subscribeDesktopLayout, readDesktopLayout, () => false);
  const [mapOverride, setMapOverride] = useState<boolean | null>(null);
  const showMap = mapOverride ?? isDesktopLayout;

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
                onClick={() => setMapOverride((prev) => !(prev ?? isDesktopLayout))}
                aria-expanded={showMap}
                aria-controls="news-county-map"
                className={utilityButton}
              >
                {showMap ? c.hideMap : c.showMap}
              </button>
              <button type="button" onClick={() => setCountyModalOpen(true)} className={utilityButton}>
                <PinIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate">{countyDisplay}</span>
                <span className="ml-1 shrink-0 border-l border-border pl-2.5 font-normal text-muted-foreground">
                  {changeActionLabel}
                </span>
              </button>
            </>
          }
        />
      </Container>

      <div className="pt-6 pb-8 sm:pt-8 sm:pb-12">
        <Container>
          <div
            id="news-county-map"
            data-open={showMap ? "true" : "false"}
            aria-hidden={!showMap}
            className="calm-collapse"
          >
            <div className="calm-collapse-inner" inert={!showMap || undefined}>
              <div className="pb-10">
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="min-w-0">
                <h2 id="news-latest-heading" className="text-body font-semibold text-foreground">
                  {areaHeading}
                </h2>
                <p aria-live="polite" className="mt-0.5 text-meta text-muted-foreground tabular-nums">
                  {pluralSuffix(lang, filteredTotal)}
                </p>
              </div>
              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex min-h-11 max-w-full shrink-0 items-center gap-1.5 whitespace-nowrap rounded-(--radius-control) border border-border-control bg-card px-3.5 text-meta font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/50 dark:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>{np.resetFilter}</span>
                </button>
              )}
            </div>

            <div
              role="group"
              aria-label={fc.categoriesLabel}
              className="mt-4 flex flex-wrap items-center gap-2"
            >
              {(["all", ...NEWS_CATEGORIES] as const).map((cat) => {
                const selected = selectedCategory === cat;
                const label = cat === "all" ? np.categories.all : categoryLabels[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedCategory(cat)}
                    className={
                      selected
                        ? "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-(--radius-control) border border-foreground bg-foreground px-3.5 text-meta font-semibold text-background transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        : "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-(--radius-control) border border-border-control bg-card px-3.5 text-meta font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {!placeIsNational && !filteredFeed.hasAnyLocalForPlace && selectedCategory === "all" && filteredTotal > 0 && (
              <p className="mt-4 text-meta text-muted-foreground">
                {fc.noLocal(placeLabel(selectedAreaForMap, activeCountry))}
              </p>
            )}

            {feedGroups.map((group) => (
              <div key={group.id} className="mt-4">
                {group.heading && (
                  <h3 className="pb-1 text-meta font-semibold text-muted-foreground">
                    {group.heading}
                  </h3>
                )}
                <ul key={`${group.id}-${activeCountry}-${selectedAreaForMap}-${selectedCategory}`} className="divide-y divide-border">
                  {group.items.map((article, index) => (
                    <li key={article.id} className="list-in" style={{ "--i": index } as React.CSSProperties}>
                      <Link
                        href={withLangPrefix(`${basePath}/${article.slug}`, lang)}
                        className="group press-row -mx-2.5 flex min-h-12 flex-col gap-1 rounded-lg px-2.5 py-3.5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/45 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                      >
                        <span lang={article.language} className="text-body font-medium leading-snug text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none dark:group-hover:text-sapphire-border">
                          <span>{article.title}</span>
                        </span>
                        <span className="shrink-0 text-meta text-muted-foreground tabular-nums">
                          {categoryLabels[article.category] ?? article.category}
                          <span aria-hidden="true" className="mx-1.5 inline-block h-3 w-px align-middle bg-border" />
                          {placeLabel(article.county, articleCountry(article))}
                          <span aria-hidden="true" className="mx-1.5 inline-block h-3 w-px align-middle bg-border" />
                          <time dateTime={article.date}>{formatNewsDate(article.date, lang, { short: true, year: false })}</time>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

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

          <section
            aria-labelledby="news-handover-heading"
            className="mt-12 flex flex-col gap-5 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div className="max-w-xl space-y-1">
              <h2 id="news-handover-heading" className="text-balance text-title font-semibold text-foreground">
                {np.handoverTitle}
              </h2>
              <p className="text-body text-muted-foreground">{np.handoverSubtitle}</p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                href={withLangPrefix("/medic-online", lang)}
                variant="action"
                size="lg"
              >
                <StethoscopeIcon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">{np.handoverTelemed}</span>
              </Button>
              <Button
                href={withLangPrefix("/mediatori", lang)}
                variant="outline"
                size="lg"
              >
                <UsersIcon className="h-4 w-4 shrink-0 text-sapphire" />
                <span className="min-w-0 truncate">{np.handoverMediator}</span>
              </Button>
            </div>
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
