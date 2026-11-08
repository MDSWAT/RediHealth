"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useUserCounty } from "@/lib/geo-ip";
import { ArrowRightIcon, PinIcon } from "@/components/ui/icons";
import { CountyOverrideModal } from "@/components/news/CountyOverrideModal";
import { countyLabel } from "@/components/news/news-format";
import { NEWS_ARTICLES, articleCountry, getLocalizedArticle, isNationalCounty } from "@/lib/data/news";
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
 * RegionalHealthRibbon: one quiet line under the landing hero with the reader's county
 * and its most relevant news item (a local alert first, then national news).
 * Static: no pulsing beacon; the amber dot only marks that the line is about local health news.
 */
export function RegionalHealthRibbon() {
  const { lang, t } = useSafeLanguage();
  const nr = t.newsRibbon;
  const { county, setCounty } = useUserCounty();
  const [modalOpen, setModalOpen] = useState(false);

  const romanian = NEWS_ARTICLES.filter((a) => articleCountry(a) === "ro");
  const local = romanian.filter((a) => a.county === county);
  const national = romanian.filter((a) => isNationalCounty(a.county));
  const topItem = local.find((a) => a.epidemicSeverity) ?? local[0] ?? national[0];
  const topTitle = topItem ? getLocalizedArticle(topItem, lang).title : nr.noActiveAlerts;

  return (
    <>
      <section aria-label={nr.ariaLabel} className="w-full border-b border-ink-800 bg-ink-900 py-1.5 text-paper">
        <Container className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-sm font-semibold text-paper transition-colors duration-[var(--dur-fast)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <PinIcon className="h-3.5 w-3.5 text-amber-400" />
              <span>{isNationalCounty(county) ? nr.allCountiesNational : countyLabel(county, lang)}</span>
              <span className="text-xs font-normal text-paper/60 underline underline-offset-2">{nr.changeLabel}</span>
            </button>

            {topItem ? (
              <Link
                href={withLangPrefix(`/stiri/${topItem.slug}`, lang)}
                className="block min-w-0 truncate rounded-sm text-paper/80 transition-colors duration-[var(--dur-fast)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {topTitle}
              </Link>
            ) : (
              <span className="block min-w-0 truncate text-paper/80">{topTitle}</span>
            )}
          </div>

          <Link
            href={withLangPrefix("/stiri", lang)}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-sm text-sm font-semibold text-amber-300 transition-colors duration-[var(--dur-fast)] hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>{nr.viewAllNews}</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </Container>
      </section>

      <CountyOverrideModal open={modalOpen} onOpenChange={setModalOpen} currentCounty={county} onSelectCounty={setCounty} />
    </>
  );
}
