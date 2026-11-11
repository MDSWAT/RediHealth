"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  ALL_ALBANIA,
  ALL_CROATIA,
  ALL_ITALY,
  EXTRA_MAP_COPY,
  type MapCountry,
} from "@/components/ui/RomaniaCountyMap";
import { useUserCounty } from "@/lib/geo-ip";
import { PinIcon } from "@/components/ui/icons";
import styles from "@/components/news/RegionalHealthRibbon.module.css";
import { CountyOverrideModal } from "@/components/news/CountyOverrideModal";
import { countyLabel, placeName } from "@/components/news/news-format";
import {
  NEWS_ARTICLES,
  articleCountry,
  getLocalizedArticle,
  isCountryWide,
  isNationalCounty,
} from "@/lib/data/news";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";
import { withLangPrefix } from "@/lib/i18n/routing";

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    const lang = ctx?.lang || "ro";
    return { lang, t: ctx?.t ?? translations[lang] ?? translations.ro };
  } catch {
    return { lang: "ro" as const, t: translations.ro };
  }
}

/** Names for the pause button, which stops and restarts the ticker. */
const TICKER_CONTROL: Record<string, { pause: string; play: string }> = {
  ro: { pause: "Oprește știrile care se mișcă", play: "Pornește știrile" },
  en: { pause: "Pause the moving news", play: "Play the news" },
  sq: { pause: "Ndalo lajmet që lëvizin", play: "Vazhdo lajmet" },
  it: { pause: "Ferma le notizie in movimento", play: "Riprendi le notizie" },
  hr: { pause: "Zaustavi vijesti koje se kreću", play: "Pokreni vijesti" },
  rom: { pause: "Ačhav e nevimata", play: "Mukh e nevimata" },
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

/**
 * RegionalHealthRibbon: a transparent news ticker over the landing hero's ink ground; topic names
 * in soft sapphire. On the left the reader's county or region (a button that changes it); in the
 * middle the area's headlines, local ones first, moving right to left; on the right a solid white
 * "see all news" button.
 * - The ticker rests while the pointer or keyboard focus is on it, and the pause button stops
 *   it for good (moving text needs a way to stop it).
 * - Under reduced motion, or with a single headline, nothing moves: the first headline shows.
 * - The headlines are written twice so the loop has no seam; both copies open their article.
 * Phones: the county and the button share the first row, the ticker takes the second.
 */
export function RegionalHealthRibbon() {
  const { lang, t } = useSafeLanguage();
  const nr = t.newsRibbon;
  const extra = EXTRA_MAP_COPY[lang] ?? EXTRA_MAP_COPY.ro;
  const { county, setCounty } = useUserCounty();
  const [modalOpen, setModalOpen] = useState(false);
  const [localAreaByCountry, setLocalAreaByCountry] = useState<Partial<Record<"hr" | "it" | "al", string>>>({});
  const [roNationalSelected, setRoNationalSelected] = useState(false);

  const ribbonCountry: MapCountry = lang === "hr" ? "hr" : lang === "it" ? "it" : lang === "sq" ? "al" : "ro";
  const activeArea =
    ribbonCountry === "hr"
      ? (localAreaByCountry.hr ?? ALL_CROATIA)
      : ribbonCountry === "it"
        ? (localAreaByCountry.it ?? ALL_ITALY)
        : ribbonCountry === "al"
          ? (localAreaByCountry.al ?? ALL_ALBANIA)
          : (roNationalSelected ? "Toate județele" : county);

  const pool = NEWS_ARTICLES.filter((a) => articleCountry(a) === ribbonCountry);
  const local = pool.filter((a) => a.county === activeArea && !isCountryWide(a));
  const national = pool.filter((a) => isCountryWide(a));
  // Outbreak notices lead, then the area's own news, then country-wide news.
  const ranked = [...local.filter((a) => a.epidemicSeverity), ...local, ...national];
  const items = (ranked.length > 0 ? ranked : pool)
    .filter((article, index, all) => all.findIndex((other) => other.slug === article.slug) === index)
    .slice(0, TICKER_MAX)
    .map((article) => getLocalizedArticle(article, lang));
  const moving = items.length > 1;
  const [paused, setPaused] = useState(false);
  const control = TICKER_CONTROL[lang] ?? TICKER_CONTROL.en;

  const areaDisplay =
    ribbonCountry === "hr"
      ? activeArea === ALL_CROATIA
        ? extra.allCroatia
        : countyLabel(activeArea, lang, "hr")
      : ribbonCountry === "it"
        ? activeArea === ALL_ITALY
          ? (t.countyMap?.allItaly ?? ALL_ITALY)
          : placeName(activeArea, lang)
        : ribbonCountry === "al"
          ? activeArea === ALL_ALBANIA
            ? extra.allAlbania
            : countyLabel(activeArea, lang, "al")
          : isNationalCounty(activeArea)
            ? nr.allCountiesNational
            : countyLabel(activeArea, lang, "ro");

  const newsBasePath = lang === "ro" ? "/stiri" : "/news";

  function handleSelectArea(selected: string) {
    if (ribbonCountry === "hr" || ribbonCountry === "it" || ribbonCountry === "al") {
      setLocalAreaByCountry((prev) => ({ ...prev, [ribbonCountry]: selected }));
    } else if (isNationalCounty(selected)) {
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

  return (
    <>
      <section
        aria-label={nr.ariaLabel}
        className="w-full bg-transparent py-2 text-paper md:py-1.5"
      >
        <Container className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 text-sm md:flex md:items-center md:justify-between md:gap-4">
          {/* Row 1 left on phones, start from md: the county or region, a button that changes it. */}
          <div className="order-1 flex min-w-0 items-center gap-2 md:shrink-0">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="-ml-1.5 inline-flex min-h-11 min-w-0 items-center gap-1.5 rounded-lg px-1.5 font-semibold text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70 motion-reduce:transition-none"
            >
              <PinIcon className="h-3.5 w-3.5 shrink-0 text-paper/80" />
              <span className="truncate">{areaDisplay}</span>
              <span className="shrink-0 text-xs font-normal text-mist underline decoration-paper/35 underline-offset-2">
                {nr.changeLabel}
              </span>
            </button>
          </div>

          {/* Row 2 on phones, the middle from md: the ticker. */}
          <div className="order-3 col-span-2 flex min-w-0 items-center gap-1 border-t border-white/10 pt-1 md:order-2 md:flex-1 md:border-t-0 md:pt-0">
            {items.length === 0 ? (
              <span className="block min-w-0 truncate py-2 text-mist">{nr.noActiveAlerts}</span>
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
            {moving && (
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? control.play : control.pause}
                className={`${styles.pause} inline-flex h-11 w-9 shrink-0 items-center justify-center rounded-lg text-paper/70 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-white/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70 motion-reduce:transition-none`}
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  {paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M3.5 2.5h3v11h-3zM9.500 2.5h3v11h-3z" />}
                </svg>
              </button>
            )}
          </div>

          {/* Row 1 right on phones, the end from md: every news item, as a solid white button. */}
          <Link
            href={withLangPrefix(newsBasePath, lang)}
            className="press-solid order-2 inline-flex min-h-9 shrink-0 items-center justify-self-end rounded-(--radius-control) bg-paper px-3.5 text-sm font-semibold text-ink-950 shadow-(--hairline-refraction) transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-paper/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 motion-reduce:transition-none md:order-3"
          >
            {nr.viewAllNews}
          </Link>
        </Container>
      </section>

      <CountyOverrideModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentCounty={activeArea}
        onSelectCounty={handleSelectArea}
        country={ribbonCountry}
      />
    </>
  );
}
