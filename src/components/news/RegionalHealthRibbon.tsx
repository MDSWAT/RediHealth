"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  ALL_CROATIA,
  ALL_ITALY,
  EXTRA_MAP_COPY,
  type MapCountry,
} from "@/components/ui/RomaniaCountyMap";
import { useUserCounty } from "@/lib/geo-ip";
import { ArrowRightIcon, PinIcon } from "@/components/ui/icons";
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

/**
 * RegionalHealthRibbon: one quiet line under the landing hero with an 8px live-sage
 * status beacon, the reader's county/region, a rectangular category tag, and the most relevant
 * news item. Uses a two-tier 375px mobile layout so neither the county trigger nor the
 * headline gets crushed, collapsing cleanly to one row at md+.
 */
export function RegionalHealthRibbon() {
  const { lang, t } = useSafeLanguage();
  const nr = t.newsRibbon;
  const extra = EXTRA_MAP_COPY[lang] ?? EXTRA_MAP_COPY.ro;
  const { county, setCounty } = useUserCounty();
  const [modalOpen, setModalOpen] = useState(false);
  const [localAreaByCountry, setLocalAreaByCountry] = useState<Partial<Record<"hr" | "it", string>>>({});
  const [roNationalSelected, setRoNationalSelected] = useState(false);

  const ribbonCountry: MapCountry = lang === "hr" ? "hr" : lang === "it" ? "it" : "ro";
  const activeArea =
    ribbonCountry === "hr"
      ? (localAreaByCountry.hr ?? ALL_CROATIA)
      : ribbonCountry === "it"
        ? (localAreaByCountry.it ?? ALL_ITALY)
        : (roNationalSelected ? "Toate județele" : county);

  const pool = NEWS_ARTICLES.filter((a) => articleCountry(a) === ribbonCountry);
  const local = pool.filter((a) => a.county === activeArea && !isCountryWide(a));
  const national = pool.filter((a) => isCountryWide(a));
  const topItem = local.find((a) => a.epidemicSeverity) ?? local[0] ?? national[0] ?? pool[0];
  const localizedTop = topItem ? getLocalizedArticle(topItem, lang) : null;
  const topTitle = localizedTop ? localizedTop.title : nr.noActiveAlerts;

  const areaDisplay =
    ribbonCountry === "hr"
      ? activeArea === ALL_CROATIA
        ? extra.allCroatia
        : countyLabel(activeArea, lang, "hr")
      : ribbonCountry === "it"
        ? activeArea === ALL_ITALY
          ? (t.countyMap?.allItaly ?? ALL_ITALY)
          : placeName(activeArea, lang)
        : isNationalCounty(activeArea)
          ? nr.allCountiesNational
          : countyLabel(activeArea, lang, "ro");

  const newsBasePath = lang === "ro" ? "/stiri" : "/news";

  function handleSelectArea(selected: string) {
    if (ribbonCountry === "hr" || ribbonCountry === "it") {
      setLocalAreaByCountry((prev) => ({ ...prev, [ribbonCountry]: selected }));
    } else if (isNationalCounty(selected)) {
      setRoNationalSelected(true);
    } else {
      setRoNationalSelected(false);
      setCounty(selected);
    }
  }

  return (
    <>
      <section aria-label={nr.ariaLabel} className="w-full border-b border-ink-800 bg-ink-900 py-1.5 text-paper md:py-1">
        <Container className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 text-sm md:flex md:items-center md:justify-between md:gap-4">
          {/* Tier 1 left on mobile / start on md+: 8px live-sage beacon + county trigger */}
          <div className="order-1 flex min-w-0 items-center gap-2.5 md:shrink-0">
            <span aria-hidden="true" className="inline-block h-2 w-2 shrink-0 rounded-full bg-live-sage" />

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex min-h-11 min-w-0 items-center gap-1.5 rounded-lg px-1.5 -ml-1.5 font-semibold text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70"
            >
              <PinIcon className="h-3.5 w-3.5 shrink-0 text-paper/75" />
              <span className="truncate">{areaDisplay}</span>
              <span className="shrink-0 text-xs font-normal text-paper/65 underline decoration-paper/35 underline-offset-2">
                {nr.changeLabel}
              </span>
            </button>
          </div>

          {/* Tier 2 full-width on 375px mobile / center flex-1 on md+: rectangular category tag + headline */}
          <div className="order-3 col-span-2 flex min-w-0 items-center gap-2.5 border-t border-white/10 pt-1 md:order-2 md:flex-1 md:border-t-0 md:pt-0">
            {localizedTop?.categoryLabel && (
              <span className="inline-flex shrink-0 items-center rounded-md border border-white/15 bg-ink-800 px-2 py-0.5 text-xs font-medium text-paper/90">
                {localizedTop.categoryLabel}
              </span>
            )}

            {topItem ? (
              <Link
                href={withLangPrefix(`${newsBasePath}/${topItem.slug}`, lang)}
                className="inline-flex min-h-11 min-w-0 flex-1 items-center rounded-lg px-1.5 -mx-1.5 text-paper/85 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70"
              >
                <span className="truncate">{topTitle}</span>
              </Link>
            ) : (
              <span className="block min-w-0 truncate py-2 text-paper/80">{topTitle}</span>
            )}
          </div>

          {/* Tier 1 right on mobile / end on md+: View all news */}
          <Link
            href={withLangPrefix(newsBasePath, lang)}
            className="group order-2 inline-flex min-h-11 shrink-0 items-center gap-1 justify-self-end rounded-lg px-2 -mr-2 text-sm font-semibold text-paper/90 underline decoration-paper/35 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:text-white hover:decoration-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70 md:order-3"
          >
            <span>{nr.viewAllNews}</span>
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none group-hover:translate-x-0.5" />
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
