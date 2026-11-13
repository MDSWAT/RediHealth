"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import {
  ALL_ALBANIA,
  ALL_CROATIA,
  ALL_ITALY,
  ALL_MOLDOVA,
  EXTRA_MAP_COPY,
  RomaniaCountyMap,
  countryAllValue,
  mapCountriesForLang,
  type MapCountry,
} from "@/components/ui/RomaniaCountyMap";
import { useUserCounty } from "@/lib/geo-ip";
import { CountyOverrideModal } from "@/components/news/CountyOverrideModal";
import { PlaceNewsModal } from "@/components/news/PlaceNewsModal";
import { countyLabel, formatNewsDate, placeName, resolveNewsBasePath } from "@/components/news/news-format";
import { ArrowRightIcon, PinIcon, SearchIcon, StethoscopeIcon, UsersIcon, VolumeIcon } from "@/components/ui/icons";
import { useReadAloud } from "@/components/health-check/readingTools";
import { openSmartSearch } from "@/components/search/smart-search-events";
import { getSmartSearchCopy } from "@/lib/i18n/smart-search-copy";
import { HEALTH_DETAIL_SHARED_STRINGS } from "@/lib/i18n/health-myths";
import {
  ALBANIA_WIDE,
  CROATIA_WIDE,
  ITALY_WIDE,
  MOLDOVA_WIDE,
  NEWS_ARTICLES,
  articleCountry,
  getLocalizedArticle,
  isCountryWide,
  isNationalCounty,
  type NewsCountry,
} from "@/lib/data/news";
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
  "press-row inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-control max-w-full bg-card px-3.5 py-2 text-sm font-medium text-foreground whitespace-nowrap transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4";

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
  const searchCopy = getSmartSearchCopy(lang);
  const voice = useReadAloud(lang);
  const voiceStrings = HEALTH_DETAIL_SHARED_STRINGS.topicHero;
  const listenLabel = voiceStrings.listenGuide[lang] ?? voiceStrings.listenGuide.ro;
  const stopLabel = voiceStrings.stopAudio[lang] ?? voiceStrings.stopAudio.ro;
  const { county, setCounty } = useUserCounty();

  const mapCountries = useMemo(() => mapCountriesForLang(lang), [lang]);
  const [selectedMapCountry, setSelectedMapCountry] = useState<MapCountry>(() => mapCountries[0]);
  const activeCountry: MapCountry = mapCountries.includes(selectedMapCountry) ? selectedMapCountry : mapCountries[0];
  if (selectedMapCountry !== activeCountry) {
    setSelectedMapCountry(activeCountry);
  }

  // Per-country selections outside Romania stay page-local so the saved Romanian county cookie is preserved.
  const [roNationalSelected, setRoNationalSelected] = useState(false);
  const [nonRoSelections, setNonRoSelections] = useState<Partial<Record<Exclude<MapCountry, "ro">, string>>>({});

  // Modal state carries both the chosen place and its country so shared names ("Călărași") never collide.
  const [modalState, setModalState] = useState<{ place: string; country: NewsCountry } | null>(null);
  const [countyModalOpen, setCountyModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(true);

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
    setModalState({ place: name, country: targetCountry });
  };

  const closeNews = useCallback(() => setModalState(null), []);

  const categoryLabels: Record<string, string> = {
    "Alerte locale": np.categories.epidemics,
    "Caravane medicale": np.categories.caravan,
    "Campanii de vaccinare": np.categories.vaccinationCampaigns,
    "Sfaturi de sezon": np.categories.seasonalAdvice,
  };

  const localizedArticles = useMemo(() => NEWS_ARTICLES.map((article) => getLocalizedArticle(article, lang)), [lang]);

  const latest = useMemo(
    () =>
      localizedArticles
        .filter((a) => articleCountry(a) === activeCountry)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 3),
    [localizedArticles, activeCountry],
  );

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

  return (
    <main id="main-content" className="flex-1 bg-background pb-12 sm:pb-16">
      <header className="border-b border-border bg-card py-10 sm:py-14">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-balance text-page text-foreground">{np.heroTitle}</h1>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">{np.heroSubtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <button
                type="button"
                onClick={() => openSmartSearch()}
                aria-label={searchCopy.triggerLabel}
                title={searchCopy.triggerLabel}
                className="press-row inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-border-control bg-card text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">{searchCopy.triggerLabel}</span>
              </button>
              {voice.available && (
                <button
                  type="button"
                  aria-pressed={voice.speaking}
                  aria-label={voice.speaking ? stopLabel : listenLabel}
                  title={voice.speaking ? stopLabel : listenLabel}
                  onClick={() => {
                    if (voice.speaking) {
                      voice.stop();
                    } else {
                      voice.speak([np.heroTitle, np.heroSubtitle]);
                    }
                  }}
                  className={`press-row inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    voice.speaking
                      ? "border-sapphire bg-sapphire text-white shadow-2xs"
                      : "border-border-control bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {voice.speaking ? (
                    <span aria-hidden="true" className="block h-3 w-3 rounded-xs bg-current" />
                  ) : (
                    <VolumeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span className="sr-only">{voice.speaking ? stopLabel : listenLabel}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowMap((prev) => !prev)}
                aria-expanded={showMap}
                aria-controls="news-county-map"
                className={utilityButton}
              >
                <span className="min-w-0 truncate">{showMap ? c.hideMap : c.showMap}</span>
              </button>
              <button type="button" onClick={() => setCountyModalOpen(true)} className={utilityButton}>
                <PinIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate">{countyDisplay}</span>
                <span className="ml-1 shrink-0 border-l border-border pl-2.5 font-normal text-muted-foreground">
                  {changeActionLabel}
                </span>
              </button>
            </div>
          </div>
        </Container>
      </header>

      <div className="py-8 sm:py-12">
        <Container>
          <div
            id="news-county-map"
            data-open={showMap ? "true" : "false"}
            aria-hidden={!showMap}
            className="calm-collapse"
          >
            <div className="calm-collapse-inner" inert={!showMap || undefined}>
              <div className="pb-10">
                <RomaniaCountyMap
                  selectedCounty={selectedAreaForMap}
                  onSelectCounty={selectArea}
                  activeHubs={hubs}
                  countries={mapCountries}
                  activeCountry={activeCountry}
                  onCountryChange={setSelectedMapCountry}
                />
              </div>
            </div>
          </div>

          <section aria-labelledby="news-latest-heading">
            <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
              <h2 id="news-latest-heading" className="text-base font-semibold text-foreground">
                {c.latest}
              </h2>
              <button
                type="button"
                onClick={() => setModalState({ place: countryAllValue(activeCountry), country: activeCountry })}
                className="group inline-flex min-h-[44px] max-w-full shrink-0 items-center gap-1 whitespace-nowrap rounded-sm text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light dark:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="min-w-0 truncate">{np.resetFilter}</span>
                <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </button>
            </div>
            <ul className="divide-y divide-border">
              {latest.map((article) => (
                <li key={article.id}>
                  <Link
                    href={withLangPrefix(`${basePath}/${article.slug}`, lang)}
                    className="group press-row -mx-2.5 flex min-h-12 flex-col gap-1 rounded-lg px-2.5 py-3.5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/45 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <span lang={article.language} className="text-[15px] font-medium leading-snug text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire dark:group-hover:text-sapphire-border">
                      {article.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
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
          </section>

          <section
            aria-labelledby="news-handover-heading"
            className="mt-12 flex flex-col gap-5 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div className="max-w-xl space-y-1">
              <h2 id="news-handover-heading" className="text-balance text-lg font-semibold text-foreground">
                {np.handoverTitle}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{np.handoverSubtitle}</p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href={withLangPrefix("/medic-online", lang)}
                className="press-solid inline-flex min-h-[48px] max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-sapphire px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] motion-reduce:transition-none hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <StethoscopeIcon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">{np.handoverTelemed}</span>
              </Link>
              <Link
                href={withLangPrefix("/mediatori", lang)}
                className="press-row inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-border-control max-w-full bg-card px-5 py-2.5 text-sm font-semibold text-foreground whitespace-nowrap transition-colors duration-[var(--dur-fast)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <UsersIcon className="h-4 w-4 shrink-0 text-sapphire" />
                <span className="min-w-0 truncate">{np.handoverMediator}</span>
              </Link>
            </div>
          </section>
        </Container>
      </div>

      <PlaceNewsModal
        place={modalState?.place ?? null}
        countryHint={modalState?.country}
        articles={localizedArticles}
        onClose={closeNews}
      />

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
