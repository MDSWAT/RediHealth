"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  ALL_ALBANIA,
  ALL_CROATIA,
  ALL_ITALY,
  ALL_MOLDOVA,
  EXTRA_MAP_COPY,
  mapCountriesForLang,
  type MapCountry,
} from "@/components/ui/romania-county-map-helpers";
import { useUserCounty } from "@/lib/geo-ip";
import { ChevronLeftIcon, ChevronRightIcon, PinIcon } from "@/components/ui/icons";
import styles from "@/components/news/RegionalHealthRibbon.module.css";
import { useTextScale } from "@/lib/comfort-preferences";
import { useCalmReducedMotion } from "@/lib/motion/tokens";
import { countyLabel, placeName } from "@/components/news/news-format";
import type { Lang } from "@/lib/i18n/languages";
import { withLangPrefix } from "@/lib/i18n/routing";

const CountyOverrideModal = dynamic(
  () => import("@/components/news/CountyOverrideModal").then((mod) => mod.CountyOverrideModal),
  { ssr: false },
);

export type RibbonArticle = {
  slug: string;
  title: string;
  categoryLabel?: string;
  county: string;
  country: MapCountry;
  countryWide: boolean;
  hasEpidemicSeverity: boolean;
};

export type RibbonCopy = {
  ariaLabel: string;
  changeLabel: string;
  noActiveAlerts: string;
  allCountiesNational: string;
  viewAllNews: string;
  allItaly: string;
};

/** Names for the news ticker controls (pause/play and calm headline stepping). */
const TICKER_CONTROL: Record<string, { pause: string; play: string; prev: string; next: string }> = {
  ro: {
    pause: "Oprește derularea știrilor",
    play: "Pornește știrile",
    prev: "Știrea anterioară",
    next: "Știrea următoare",
  },
  en: {
    pause: "Pause scrolling news",
    play: "Play news",
    prev: "Previous headline",
    next: "Next headline",
  },
  sq: {
    pause: "Ndalo lëvizjen e lajmeve",
    play: "Vazhdo lajmet",
    prev: "Lajmi i mëparshëm",
    next: "Lajmi tjetër",
  },
  it: {
    pause: "Ferma lo scorrimento delle notizie",
    play: "Riprendi le notizie",
    prev: "Notizia precedente",
    next: "Notizia successiva",
  },
  hr: {
    pause: "Zaustavi pomicanje vijesti",
    play: "Pokreni vijesti",
    prev: "Prethodna vijest",
    next: "Sljedeća vijest",
  },
  rom: {
    pause: "Ačhav e nevimata",
    play: "Mukh e nevimata",
    prev: "Anglutno nevipen",
    next: "Aver nevipen",
  },
  ru: {
    pause: "Остановить бегущую строку",
    play: "Запустить новости",
    prev: "Предыдущая новость",
    next: "Следующая новость",
  },
};

/** Zigzag star outline on a 100-unit box centred on 0,0. */
function miniStar(outer: number, inner: number, offset: number): string {
  return Array.from({ length: 16 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = ((offset + i * 22.5 - 90) * Math.PI) / 180;
    return `${(radius * Math.cos(angle)).toFixed(2)},${(radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}

const MINI_OUTER = miniStar(47, 33, 0);
const MINI_INNER = miniStar(27, 17, 22.5);

/**
 * The topic wheel reduced to what still reads at 16px: one star per ring, a flat stroke, and the
 * hub as a dot. The two rings turn in opposite directions, as in the full wheel.
 */
function MiniWheel() {
  // Each ring is its own <svg>, turned as a whole: rotating shapes inside one SVG drifts off
  // centre in Safari.
  return (
    <span aria-hidden="true" className={`${styles.miniWheel} mx-5 text-white/35`}>
      <svg className={styles.miniOuter} viewBox="-50 -50 100 100" focusable="false">
        <polygon points={MINI_OUTER} />
      </svg>
      <svg className={styles.miniInner} viewBox="-50 -50 100 100" focusable="false">
        <polygon points={MINI_INNER} />
        <circle r="6" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

/** How many headlines ride the ticker, and how long each takes to cross (seconds). */
const TICKER_MAX = 6;
const SECONDS_PER_ITEM = 11;

function isNationalCountyClient(county: string): boolean {
  const lower = county.toLowerCase();
  return lower.includes("toate") || lower.includes("național") || lower.includes("all ");
}

export function RegionalHealthRibbonClient({
  lang,
  initialCounty,
  articles,
  copy,
}: {
  lang: Lang;
  initialCounty: string;
  articles: RibbonArticle[];
  copy: RibbonCopy;
}) {
  const extra = EXTRA_MAP_COPY[lang] ?? EXTRA_MAP_COPY.ro;
  const [modalOpen, setModalOpen] = useState(false);
  const [localAreaByCountry, setLocalAreaByCountry] = useState<Partial<Record<Exclude<MapCountry, "ro">, string>>>({});
  const [preferredCountry, setPreferredCountry] = useState<MapCountry | null>(null);
  const [roNationalSelected, setRoNationalSelected] = useState(false);

  const allowedCountries = mapCountriesForLang(lang);
  const ribbonCountry: MapCountry =
    preferredCountry && allowedCountries.includes(preferredCountry) ? preferredCountry : allowedCountries[0];
  const { county, setCounty } = useUserCounty(initialCounty, {
    enabled: ribbonCountry === "ro",
  });
  const activeArea =
    ribbonCountry === "md"
      ? (localAreaByCountry.md ?? ALL_MOLDOVA)
      : ribbonCountry === "hr"
        ? (localAreaByCountry.hr ?? ALL_CROATIA)
        : ribbonCountry === "it"
          ? (localAreaByCountry.it ?? ALL_ITALY)
          : ribbonCountry === "al"
            ? (localAreaByCountry.al ?? ALL_ALBANIA)
            : (roNationalSelected ? "Toate județele" : county);

  const pool = articles.filter((a) => a.country === ribbonCountry);
  const local = pool.filter((a) => a.county === activeArea && !a.countryWide);
  const national = pool.filter((a) => a.countryWide);
  // Outbreak notices lead, then the area's own news, then country-wide news.
  const ranked = [...local.filter((a) => a.hasEpidemicSeverity), ...local, ...national];
  const items = (ranked.length > 0 ? ranked : pool)
    .filter((article, index, all) => all.findIndex((other) => other.slug === article.slug) === index)
    .slice(0, TICKER_MAX);
  const moving = items.length > 1;
  const reducedMotion = useCalmReducedMotion();
  const [textScale] = useTextScale();
  const [paused, setPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const calmStatic = reducedMotion || textScale !== "normal" || paused;
  const safeIndex = items.length > 0 ? ((activeIndex % items.length) + items.length) % items.length : 0;
  const activeHeadline = items[safeIndex];
  const control = TICKER_CONTROL[lang] ?? TICKER_CONTROL.en;

  const areaDisplay =
    ribbonCountry === "md"
      ? activeArea === ALL_MOLDOVA
        ? extra.allMoldova
        : countyLabel(activeArea, lang, "md")
      : ribbonCountry === "hr"
        ? activeArea === ALL_CROATIA
          ? extra.allCroatia
          : countyLabel(activeArea, lang, "hr")
        : ribbonCountry === "it"
          ? activeArea === ALL_ITALY
            ? copy.allItaly
            : placeName(activeArea, lang)
          : ribbonCountry === "al"
            ? activeArea === ALL_ALBANIA
              ? extra.allAlbania
              : countyLabel(activeArea, lang, "al")
            : isNationalCountyClient(activeArea)
              ? copy.allCountiesNational
              : countyLabel(activeArea, lang, "ro");

  const newsBasePath = lang === "ro" ? "/stiri" : "/news";

  function handleSelectArea(selected: string, targetCountry: MapCountry = ribbonCountry) {
    setPreferredCountry(targetCountry);
    if (targetCountry !== "ro") {
      setLocalAreaByCountry((prev) => ({ ...prev, [targetCountry]: selected }));
    } else if (isNationalCountyClient(selected)) {
      setRoNationalSelected(true);
    } else {
      setRoNationalSelected(false);
      setCounty(selected);
    }
  }

  // The second copy only exists so the loop has no seam: it is clickable like the first, but
  // skipped by the keyboard and screen readers, which already have every headline once.
  const headlines = (copyIndex: number) =>
    items.map(({ slug, title, categoryLabel }) => (
      <li key={`${copyIndex}-${slug}`} className="flex shrink-0 items-center">
        <Link
          href={withLangPrefix(`${newsBasePath}/${slug}`, lang)}
          tabIndex={copyIndex === 0 ? undefined : -1}
          className="inline-flex min-h-11 items-center gap-2.5 rounded-lg px-1.5 text-paper/90 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-paper motion-reduce:transition-none"
        >
          {/* The topic reads as the start of the line, not as a badge. */}
          {categoryLabel && (
            <>
              <span className="shrink-0 font-semibold text-sapphire-border">{categoryLabel}</span>
              {/* A short rule between the topic and its headline. */}
              <span aria-hidden="true" className="h-3.5 w-px shrink-0 bg-current opacity-30" />
            </>
          )}
          <span className="whitespace-nowrap">{title}</span>
        </Link>
        {/* Between headlines: the topic wheel in miniature, its rings turning as in the hero. */}
        <MiniWheel />
      </li>
    ));

  const renderStationaryHeadline = () =>
    activeHeadline ? (
      // Keyed on the headline: stepping with the arrows eases the next one in (only after a step,
      // so the ribbon does not move on page load).
      <div key={activeHeadline.slug} className={`min-w-0 flex-1 ${paused ? "swap-in" : ""}`}>
        <Link
          href={withLangPrefix(`${newsBasePath}/${activeHeadline.slug}`, lang)}
          className="flex min-h-11 min-w-0 max-w-full flex-col justify-center gap-0.5 rounded-lg px-1.5 py-1 text-paper/95 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-paper motion-reduce:transition-none md:flex-row md:items-center md:justify-start md:gap-2.5 md:py-0"
        >
          {activeHeadline.categoryLabel && (
            <>
              <span className="shrink-0 font-semibold leading-tight text-sapphire-border">
                {activeHeadline.categoryLabel}
              </span>
              <span aria-hidden="true" className="hidden h-3.5 w-px shrink-0 bg-current opacity-30 md:inline-block" />
            </>
          )}
          <span className="line-clamp-2 leading-snug md:line-clamp-none md:truncate">
            {activeHeadline.title}
          </span>
        </Link>
      </div>
    ) : null;

  return (
    <>
      <section
        aria-label={copy.ariaLabel}
        className="w-full bg-transparent py-2 text-paper md:py-1.5"
      >
        <Container className="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1.5 text-meta md:flex-nowrap md:gap-4">
          {/* Row 1 left on phones, start from md: the county or region, a button that changes it. */}
          {/* The button is pulled 6px left to align its text with the page edge, so its width limit allows for those 6px:
              flex-1 on phones lets long county names truncate cleanly while keeping "Vezi toate știrile" on Row 1. */}
          <div className="order-1 flex min-w-0 flex-1 items-center gap-2 md:flex-none md:shrink-0">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="press-on-dark -ml-1.5 inline-flex min-h-11 min-w-0 max-w-[calc(100%+0.375rem)] items-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 font-semibold text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70 motion-reduce:transition-none"
            >
              <PinIcon className="h-3.5 w-3.5 shrink-0 text-paper/80" />
              <span className="truncate">{areaDisplay}</span>
              <span className="shrink-0 text-meta font-normal text-mist underline decoration-paper/35 underline-offset-2">
                {copy.changeLabel}
              </span>
            </button>
          </div>

          {/* Row 2 on phones: calm stationary headline bar with 44px steppers.
              Middle from md: calm single headline when paused/calm-mode, otherwise the ticker. */}
          <div className="order-3 flex w-full basis-full min-w-0 items-center gap-1 border-t border-white/10 pt-1.5 md:order-2 md:w-auto md:basis-auto md:flex-1 md:border-t-0 md:pt-0">
            {items.length === 0 ? (
              <span className="block min-w-0 truncate py-2 text-mist">{copy.noActiveAlerts}</span>
            ) : (
              <>
                <div className="min-w-0 flex-1 md:hidden">{renderStationaryHeadline()}</div>
                <div className="hidden md:flex md:min-w-0 md:flex-1">
                  {calmStatic && activeHeadline ? (
                    renderStationaryHeadline()
                  ) : (
                    <div
                      className={styles.ticker}
                      data-moving={moving ? "" : undefined}
                      data-paused={paused ? "" : undefined}
                      style={{ "--ticker-duration": `${items.length * SECONDS_PER_ITEM}s` } as React.CSSProperties}
                    >
                      <div className={styles.track}>
                        <ul className={styles.copy}>{headlines(0)}</ul>
                        {moving && (
                          <ul className={`${styles.copy} ${styles.repeat}`} aria-hidden="true">
                            {headlines(1)}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {moving && (
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setPaused(true);
                    setActiveIndex((prev) => prev - 1);
                  }}
                  aria-label={control.prev}
                  title={control.prev}
                  className="press-on-dark inline-flex h-11 w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-paper/75 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-white/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70 motion-reduce:transition-none"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                {!reducedMotion && textScale === "normal" && (
                  <button
                    type="button"
                    onClick={() => setPaused((value) => !value)}
                    aria-label={paused ? control.play : control.pause}
                    title={paused ? control.play : control.pause}
                    className={`${styles.pause} press-on-dark hidden h-11 w-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-paper/75 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-white/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70 motion-reduce:transition-none md:inline-flex`}
                  >
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                      {paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M3.5 2.5h3v11h-3zM9.500 2.5h3v11h-3z" />}
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPaused(true);
                    setActiveIndex((prev) => prev + 1);
                  }}
                  aria-label={control.next}
                  title={control.next}
                  className="press-on-dark inline-flex h-11 w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-paper/75 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-white/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70 motion-reduce:transition-none"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Row 1 right on phones (refined translucent dark-glass control), solid warm-paper button from md. */}
          <Link
            href={withLangPrefix(newsBasePath, lang)}
            className="press-solid order-2 inline-flex min-h-11 shrink-0 max-w-full items-center justify-self-end whitespace-nowrap rounded-(--radius-control) border border-white/18 bg-white/[0.08] px-2.5 text-meta font-semibold text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 motion-reduce:transition-none sm:px-3.5 md:order-3 md:border-transparent md:bg-paper md:text-body md:text-ink-950 md:shadow-(--hairline-refraction) md:hover:bg-paper/90"
          >
            <span className="min-w-0 truncate">{copy.viewAllNews}</span>
          </Link>
        </Container>
      </section>

      {modalOpen ? (
        <CountyOverrideModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          currentCounty={activeArea}
          onSelectCounty={handleSelectArea}
          country={ribbonCountry}
          countries={allowedCountries}
        />
      ) : null}
    </>
  );
}
