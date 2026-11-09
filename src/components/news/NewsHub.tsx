"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ALL_ITALY, RomaniaCountyMap, isItalianRegion } from "@/components/ui/RomaniaCountyMap";
import { useUserCounty } from "@/lib/geo-ip";
import { CountyOverrideModal } from "@/components/news/CountyOverrideModal";
import { PlaceNewsModal } from "@/components/news/PlaceNewsModal";
import { countyLabel, formatNewsDate, placeName } from "@/components/news/news-format";
import { ArrowRightIcon, PinIcon, StethoscopeIcon, UsersIcon } from "@/components/ui/icons";
import {
  ITALY_WIDE,
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

const COPY: Record<Lang, { hideMap: string; showMap: string; latest: string }> = {
  ro: { hideMap: "Ascunde harta", showMap: "Arată harta", latest: "Cele mai recente" },
  en: { hideMap: "Hide map", showMap: "Show map", latest: "Latest" },
  sq: { hideMap: "Fshih hartën", showMap: "Shfaq hartën", latest: "Më të rejat" },
  it: { hideMap: "Nascondi la mappa", showMap: "Mostra la mappa", latest: "Le più recenti" },
};

const utilityButton =
  "inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * NewsHub: the regional news page. A plain header, the county/region map, a short "latest" list,
 * and a hand-off to the online doctor or a mediator. Each place's full news opens in PlaceNewsModal.
 */
export function NewsHub() {
  const { lang, t } = useLanguage();
  const np = t.newsPage;
  const c = COPY[lang] ?? COPY.ro;
  const { county, setCounty } = useUserCounty();
  // An Italian region (or all of Italy) is shown on this page only; the saved county stays a Romanian one.
  const [italyRegion, setItalyRegion] = useState<string | null>(null);
  // The place whose news is open in the modal; null keeps it closed.
  const [newsPlace, setNewsPlace] = useState<string | null>(null);
  const [countyModalOpen, setCountyModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const selectArea = (name: string) => {
    if (isItalianRegion(name) || name === ALL_ITALY) {
      setItalyRegion(name);
    } else {
      setItalyRegion(null);
      setCounty(name);
    }
    setNewsPlace(name);
  };
  const closeNews = useCallback(() => setNewsPlace(null), []);

  const categoryLabels: Record<string, string> = {
    "Alerte locale": np.categories.epidemics,
    "Caravane medicale": np.categories.caravan,
    "Campanii de vaccinare": np.categories.vaccinationCampaigns,
    "Sfaturi de sezon": np.categories.seasonalAdvice,
  };

  const localizedArticles = useMemo(() => NEWS_ARTICLES.map((article) => getLocalizedArticle(article, lang)), [lang]);

  // The country last chosen on the map: the list below and "see all" follow it.
  const country: NewsCountry = italyRegion ? "it" : "ro";

  const latest = useMemo(
    () =>
      localizedArticles
        .filter((a) => articleCountry(a) === country)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 3),
    [localizedArticles, country],
  );

  // Places with their own news are tinted on the map and offered as quick picks.
  const hubs = useMemo(() => [...new Set(NEWS_ARTICLES.filter((a) => !isCountryWide(a)).map((a) => a.county))], []);

  const countyDisplay = italyRegion
    ? italyRegion === ALL_ITALY
      ? (t.countyMap?.allItaly ?? italyRegion)
      : italyRegion
    : isNationalCounty(county)
      ? np.allCounties
      : countyLabel(county, lang);

  const placeLabel = (place: string) =>
    place === ITALY_WIDE ? (t.countyMap?.allItaly ?? ITALY_WIDE) : isNationalCounty(place) ? np.allCounties : placeName(place, lang);

  return (
    <main id="main-content" className="flex-1 bg-background pb-12 sm:pb-16">
      <header className="border-b border-border bg-card py-10 sm:py-14">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{np.heroTitle}</h1>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">{np.heroSubtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMap((prev) => !prev)}
                aria-expanded={showMap}
                aria-controls="news-county-map"
                className={utilityButton}
              >
                {showMap ? c.hideMap : c.showMap}
              </button>
              <button type="button" onClick={() => setCountyModalOpen(true)} className={utilityButton}>
                <PinIcon className="h-4 w-4 text-muted-foreground" />
                <span>{countyDisplay}</span>
                <span aria-hidden="true" className="text-muted-foreground">·</span>
                <span className="font-normal text-muted-foreground">{np.changeCounty}</span>
              </button>
            </div>
          </div>
        </Container>
      </header>

      <div className="py-8 sm:py-12">
        <Container>
          {showMap && (
            <div id="news-county-map" className="mb-10">
              <RomaniaCountyMap
                selectedCounty={italyRegion ?? county}
                onSelectCounty={selectArea}
                activeHubs={hubs}
                countries={["ro", "it"]}
              />
            </div>
          )}

          <section aria-labelledby="news-latest-heading">
            <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
              <h2 id="news-latest-heading" className="text-base font-semibold text-foreground">
                {c.latest}
              </h2>
              <button
                type="button"
                onClick={() => setNewsPlace(country === "it" ? ALL_ITALY : "Toate județele")}
                className="group inline-flex min-h-[44px] items-center gap-1 rounded-sm text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light dark:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {np.resetFilter}
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </button>
            </div>
            <ul className="divide-y divide-border">
              {latest.map((article) => (
                <li key={article.id}>
                  <Link
                    href={withLangPrefix(`/stiri/${article.slug}`, lang)}
                    className="group flex flex-col gap-1 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <span lang={article.language} className="text-[15px] font-medium leading-snug text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire dark:group-hover:text-sapphire-border">
                      {article.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {categoryLabels[article.category] ?? article.category} · {placeLabel(article.county)} ·{" "}
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
              <h2 id="news-handover-heading" className="text-lg font-semibold text-foreground">
                {np.handoverTitle}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{np.handoverSubtitle}</p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href={withLangPrefix("/medic-online", lang)}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-sapphire px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <StethoscopeIcon className="h-4 w-4" />
                <span>{np.handoverTelemed}</span>
              </Link>
              <Link
                href={withLangPrefix("/mediatori", lang)}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <UsersIcon className="h-4 w-4 text-sapphire" />
                <span>{np.handoverMediator}</span>
              </Link>
            </div>
          </section>
        </Container>
      </div>

      <PlaceNewsModal place={newsPlace} articles={localizedArticles} onClose={closeNews} />

      <CountyOverrideModal
        open={countyModalOpen}
        onOpenChange={setCountyModalOpen}
        currentCounty={county}
        onSelectCounty={selectArea}
      />
    </main>
  );
}
